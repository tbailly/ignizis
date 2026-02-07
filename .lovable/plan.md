

# Gestion des Entreprises et Utilisateurs -- Espace Admin (avec modales)

## Vue d'ensemble

Construire deux sections dans l'espace admin (`/admin`) : une pour gerer les entreprises et une pour gerer les utilisateurs (non-admin). Les formulaires de creation et d'edition utilisent des **modales (Dialog)** au lieu de pages separees, pour une meilleure experience mobile.

---

## 1. Base de donnees

### a) Ajouter la colonne `status` a `companies`

```sql
ALTER TABLE public.companies 
  ADD COLUMN status text NOT NULL DEFAULT 'active';
```

Valeurs acceptees : `active` ou `inactive`.

### b) Ajouter les policies RLS admin

Toutes les policies existantes sont PERMISSIVE -- il suffit d'en ajouter de nouvelles pour les admins (logique OR entre policies permissives).

**Table `companies`** :
- SELECT : `is_admin(auth.uid())`
- UPDATE : `is_admin(auth.uid())`
- DELETE : `is_admin(auth.uid())`

**Table `users`** :
- SELECT : `is_admin(auth.uid())`

**Table `user_companies`** :
- SELECT : `is_admin(auth.uid())`
- INSERT : `is_admin(auth.uid())`
- DELETE : `is_admin(auth.uid())`

---

## 2. Edge function : `admin-users`

Fonction backend pour les operations necessitant le service role key.

### Actions

- **`create`** : Cree un utilisateur dans `auth.users` avec `email_confirm: true` (compte actif, aucun email envoye). Le trigger `handle_new_user` cree automatiquement le profil dans `public.users`. Le frontend gere ensuite l'association aux entreprises via `user_companies`.
- **`delete`** : Appelle `auth.admin.deleteUser(userId)`. La cascade FK supprime le profil, les associations, et les roles.

### Securite

- Authentification requise (JWT verifie en code)
- Verification admin via `is_admin` RPC avec le service role client
- Validation des inputs (email valide, UUID valide)

---

## 3. Routing (simplifie)

Plus besoin de routes `/new` et `/:id/edit` puisque les formulaires sont des modales ouvertes depuis les pages de liste.

Nouvelles routes sous `/admin` :

```text
/admin             --> AdminDashboard (avec navigation cards)
/admin/companies   --> Liste des entreprises (modale pour creer/editer)
/admin/users       --> Liste des utilisateurs (modale pour creer/editer)
```

Dans `App.tsx`, le bloc admin devient :

```text
<Route path="/admin" element={<AdminRoute><Outlet /></AdminRoute>}>
  <Route index element={<AdminDashboard />} />
  <Route path="companies" element={<AdminCompanies />} />
  <Route path="users" element={<AdminUsers />} />
</Route>
```

---

## 4. Pages et composants admin

### AdminDashboard (mise a jour)

Remplace le placeholder actuel par deux cartes cliquables :
- **Entreprises** : lien vers `/admin/companies`
- **Utilisateurs** : lien vers `/admin/users`

### AdminCompanies -- Liste des entreprises

- Tableau avec colonnes : Nom, Utilisateurs associes, Statut (badge), Actions
- Barre de recherche filtrant par nom
- Bouton "Creer une entreprise" en haut a droite (ouvre la modale)
- Bouton "Editer" dans chaque ligne (ouvre la modale pre-remplie)
- Pagination (10 par page)

### CompanyFormDialog -- Modale creation/edition

Composant `Dialog` (de `@radix-ui/react-dialog`) contenant le formulaire :
- Champ **Nom** (obligatoire, 100 caracteres max)
- Champ **Slug** (auto-genere en kebab-case, modifiable)
- **Statut** (switch Actif/Inactif)
- **Options activees** (3 switches) : Juridique, Comptabilite, Finance
- Boutons "Enregistrer" et "Annuler"
- En creation : INSERT dans `companies`
- En edition : UPDATE de `companies` par ID, champs pre-remplis

Le composant recoit une prop `company` optionnelle : si presente, mode edition ; sinon, mode creation. L'ouverture/fermeture est controllee via un state `open` dans la page parente `AdminCompanies`.

### DeleteCompanyDialog -- Modale de suppression

Composant `AlertDialog` avec :
- Champ de saisie du slug pour confirmer
- Bouton "Supprimer definitivement" actif uniquement si le slug saisi correspond
- DELETE sur `companies` (cascade nettoie `user_companies`)

### AdminUsers -- Liste des utilisateurs

- Tableau avec colonnes : Email, Entreprises associees, Actions
- Barre de recherche par email ou nom
- Bouton "Creer un utilisateur" (ouvre la modale)
- Seuls les utilisateurs non-admin affiches

### UserFormDialog -- Modale creation/edition

Composant `Dialog` contenant le formulaire :
- Champ **Email** (obligatoire, unique) -- en lecture seule en edition
- **Entreprises associees** : combobox multi-selection (basee sur `cmdk`)
- En creation : appel edge function `admin-users` action `create`, puis INSERT `user_companies`
- En edition : diff des entreprises pour INSERT/DELETE dans `user_companies`

### DeleteUserDialog -- Modale de suppression

Composant `AlertDialog` avec :
- Message de confirmation
- Bouton "Supprimer definitivement"
- Appel edge function `admin-users` action `delete`

---

## 5. Sidebar

Mise a jour de la section admin dans `AppSidebar.tsx` :
- Ajouter des sous-liens "Entreprises" et "Utilisateurs" visibles quand on est sur `/admin/*`

---

## 6. Traductions (en.json)

Ajout des cles admin identiques au plan original (companies, users, etc.).

---

## 7. Fichiers concernes

| Fichier | Action |
|---------|--------|
| Migration SQL | Colonne `status`, policies RLS admin |
| `supabase/functions/admin-users/index.ts` | Nouveau -- creation/suppression users auth |
| `src/pages/admin/AdminDashboard.tsx` | Mise a jour -- navigation cards |
| `src/pages/admin/AdminCompanies.tsx` | Nouveau -- liste entreprises + gestion modales |
| `src/pages/admin/AdminUsers.tsx` | Nouveau -- liste utilisateurs + gestion modales |
| `src/components/admin/CompanyFormDialog.tsx` | Nouveau -- modale formulaire entreprise |
| `src/components/admin/DeleteCompanyDialog.tsx` | Nouveau -- modale suppression entreprise |
| `src/components/admin/UserFormDialog.tsx` | Nouveau -- modale formulaire utilisateur |
| `src/components/admin/DeleteUserDialog.tsx` | Nouveau -- modale suppression utilisateur |
| `src/components/admin/MultiCompanySelect.tsx` | Nouveau -- combobox multi-selection |
| `src/lib/utils.ts` | Mise a jour -- ajout `toKebabCase()` |
| `src/App.tsx` | Mise a jour -- routes admin simplifiees |
| `src/components/layout/AppSidebar.tsx` | Mise a jour -- sous-navigation admin |
| `src/i18n/locales/en.json` | Mise a jour -- cles traduction admin |

---

## 8. Details techniques

### Generation du slug

Fonction utilitaire `toKebabCase(name: string)` dans `src/lib/utils.ts` : supprime les accents via `normalize('NFD')`, remplace les espaces et caracteres speciaux par des tirets, met en minuscules, supprime les tirets en debut/fin.

### Architecture des modales

Chaque page de liste (`AdminCompanies`, `AdminUsers`) gere localement l'etat d'ouverture des modales :

```text
const [formOpen, setFormOpen] = useState(false);
const [editingItem, setEditingItem] = useState<Company | null>(null);
const [deletingItem, setDeletingItem] = useState<Company | null>(null);
```

- Clic "Creer" : `setEditingItem(null)` + `setFormOpen(true)`
- Clic "Editer" : `setEditingItem(company)` + `setFormOpen(true)`
- Clic "Supprimer" : `setDeletingItem(company)`
- Fermeture modale : reset des states + rafraichissement des donnees via `queryClient.invalidateQueries()`

### Filtrage des utilisateurs non-admin

1. Charger tous les `users`
2. Charger les `user_roles` ou `role = 'admin' AND company_id IS NULL`
3. Exclure cote client les users dont l'ID apparait dans les roles admin

### Combobox multi-selection (`MultiCompanySelect`)

Construite avec `Command` (base sur `cmdk`) enveloppee dans un `Popover`. Affiche les entreprises selectionnees sous forme de badges avec bouton de suppression.

### Securite de l'edge function `admin-users`

1. Extrait le JWT du header Authorization
2. Recupere l'utilisateur via `supabase.auth.getUser()`
3. Verifie le statut admin via `is_admin` RPC avec le service role client
4. Rejette avec 403 si non-admin

