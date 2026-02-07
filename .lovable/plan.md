
# Gestion des Entreprises et Utilisateurs -- Espace Admin

## Vue d'ensemble

Construire deux sections dans l'espace admin (`/admin`) : une pour gerer les entreprises et une pour gerer les utilisateurs (non-admin). Chaque section inclut un tableau avec recherche, creation/edition via formulaire, et suppression avec confirmation.

---

## 1. Base de donnees

### a) Ajouter la colonne `status` a `companies`

```sql
ALTER TABLE public.companies 
  ADD COLUMN status text NOT NULL DEFAULT 'active';
```

Valeurs acceptees : `active` ou `inactive`.

### b) Ajouter les policies RLS admin

Toutes les policies existantes sont PERMISSIVE -- donc il suffit d'en ajouter de nouvelles pour les admins (logique OR entre policies permissives).

**Table `companies`** :
- SELECT : `is_admin(auth.uid())` -- l'admin voit toutes les entreprises
- UPDATE : `is_admin(auth.uid())`
- DELETE : `is_admin(auth.uid())`

**Table `users`** :
- SELECT : `is_admin(auth.uid())` -- l'admin voit tous les utilisateurs

**Table `user_companies`** :
- SELECT : `is_admin(auth.uid())` -- l'admin voit toutes les associations
- INSERT : `is_admin(auth.uid())`
- DELETE : `is_admin(auth.uid())`

### c) Cascades existantes

Toutes les FK utilisent deja `ON DELETE CASCADE` :
- `user_companies.company_id` -> `companies.id` (cascade)
- `user_companies.user_id` -> `users.id` (cascade)
- `user_roles.user_id` -> `users.id` (cascade)
- `users.id` -> `auth.users.id` (cascade)

Supprimer une entreprise supprime automatiquement les associations `user_companies`. Supprimer un utilisateur via `auth.admin.deleteUser()` cascade vers `users`, `user_companies`, et `user_roles`.

---

## 2. Edge function : `admin-users`

Une fonction backend pour les operations qui necessitent le service role key (creation/suppression d'utilisateurs auth).

### Actions

**`create`** : Cree un utilisateur dans `auth.users` avec `email_confirm: true` (compte actif immediatement, aucun email envoye). Le trigger `handle_new_user` cree automatiquement le profil dans `public.users`. Le frontend gere ensuite l'association aux entreprises via `user_companies`.

**`delete`** : Appelle `auth.admin.deleteUser(userId)`. La cascade FK supprime automatiquement le profil, les associations entreprises, et les roles.

### Securite

- Authentification requise (JWT verifie en code)
- Verification que l'appelant est admin via `is_admin` RPC
- Validation des inputs (email valide, UUID valide)

---

## 3. Routing

Nouvelles routes sous `/admin`, toutes protegees par `AdminRoute` :

```text
/admin                    --> AdminDashboard (mis a jour avec navigation)
/admin/companies          --> Liste des entreprises
/admin/companies/new      --> Formulaire creation entreprise
/admin/companies/:id/edit --> Formulaire edition entreprise
/admin/users              --> Liste des utilisateurs
/admin/users/new          --> Formulaire creation utilisateur
/admin/users/:id/edit     --> Formulaire edition utilisateur
```

Dans `App.tsx`, les routes admin deviennent un groupe avec `Outlet` :

```text
<Route path="/admin" element={<AdminRoute><Outlet /></AdminRoute>}>
  <Route index element={<AdminDashboard />} />
  <Route path="companies" element={<AdminCompanies />} />
  <Route path="companies/new" element={<AdminCompanyForm />} />
  <Route path="companies/:id/edit" element={<AdminCompanyForm />} />
  <Route path="users" element={<AdminUsers />} />
  <Route path="users/new" element={<AdminUserForm />} />
  <Route path="users/:id/edit" element={<AdminUserForm />} />
</Route>
```

---

## 4. Pages admin

### AdminDashboard (mise a jour)

Remplace le placeholder actuel par deux cartes cliquables :
- **Entreprises** : lien vers `/admin/companies`
- **Utilisateurs** : lien vers `/admin/users`

### AdminCompanies -- Liste des entreprises

- Tableau avec colonnes : Nom, Utilisateurs associes, Statut (badge), Actions
- Barre de recherche filtrant par nom d'entreprise
- Bouton "Creer une entreprise" en haut a droite
- Pagination (10 entreprises par page)
- Donnees : query `companies` + join `user_companies` -> `users` pour les noms

### AdminCompanyForm -- Creation/Edition

- Champ **Nom** (obligatoire, 100 caracteres max)
- Champ **Slug** (auto-genere en kebab-case depuis le nom, modifiable)
- **Statut** (switch Actif/Inactif, Actif par defaut)
- **Permissions** (3 switches) : Juridique, Comptabilite, Finance
- Boutons "Enregistrer" et "Annuler"
- En creation : INSERT dans `companies`
- En edition : UPDATE de `companies` par ID

### Suppression d'entreprise

- Modale `AlertDialog` demandant de saisir le slug pour confirmer
- Le bouton "Supprimer definitivement" n'est actif que si le slug saisi correspond
- DELETE sur `companies` (cascade nettoie `user_companies`)

### AdminUsers -- Liste des utilisateurs

- Tableau avec colonnes : Email, Entreprises associees, Actions
- Filtre par email ou nom via barre de recherche
- Bouton "Creer un utilisateur" en haut a droite
- Seuls les utilisateurs non-admin sont affiches (filtrage via `user_roles`)
- Donnees : query `users` + join `user_companies` -> `companies`

### AdminUserForm -- Creation/Edition

- Champ **Email** (obligatoire, unique)
- **Entreprises associees** : combobox multi-selection (basee sur `cmdk` deja installe)
- En creation : appel edge function `admin-users` action `create`, puis INSERT `user_companies`
- En edition : diff des entreprises pour INSERT/DELETE dans `user_companies`
- Boutons "Enregistrer" et "Annuler"

### Suppression d'utilisateur

- Modale `AlertDialog` avec bouton "Supprimer definitivement"
- Appel edge function `admin-users` action `delete` (invalidation des sessions + cascade)

---

## 5. Sidebar

Mise a jour de la section admin dans `AppSidebar.tsx` :
- Quand l'utilisateur est sur `/admin/*`, afficher des sous-liens : "Entreprises" et "Utilisateurs"
- Utiliser un `Collapsible` ou simplement des sous-items dans le groupe admin

---

## 6. Traductions (en.json)

Ajout des cles pour toute la section admin :

```json
"admin": {
  "title": "Administration",
  "description": "Platform administration and management.",
  "companiesCard": "Companies",
  "companiesCardDesc": "Manage companies and their settings",
  "usersCard": "Users",
  "usersCardDesc": "Manage users and their access",
  "companies": {
    "title": "Companies",
    "create": "Create a company",
    "edit": "Edit company",
    "searchPlaceholder": "Search by company name...",
    "name": "Company name",
    "slug": "Slug",
    "status": "Status",
    "active": "Active",
    "inactive": "Inactive",
    "permissions": "Enabled options",
    "legal": "Legal",
    "accounting": "Accounting",
    "finance": "Finance",
    "users": "Associated users",
    "actions": "Actions",
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete",
    "deleteConfirmTitle": "Delete company",
    "deleteConfirmDesc": "This action is irreversible. Type the company slug to confirm:",
    "deleteConfirmButton": "Delete permanently",
    "deleteSuccess": "Company deleted",
    "saveSuccess": "Company saved",
    "noCompanies": "No companies found"
  },
  "users": {
    "title": "Users",
    "create": "Create a user",
    "edit": "Edit user",
    "searchPlaceholder": "Search by email or name...",
    "email": "Email",
    "companies": "Associated companies",
    "companiesPlaceholder": "Select companies...",
    "actions": "Actions",
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete",
    "deleteConfirmTitle": "Delete user",
    "deleteConfirmDesc": "This action is irreversible. The user will be permanently deleted and all active sessions invalidated.",
    "deleteConfirmButton": "Delete permanently",
    "deleteSuccess": "User deleted",
    "saveSuccess": "User saved",
    "noUsers": "No users found"
  }
}
```

---

## 7. Fichiers concernes

| Fichier | Action |
|---------|--------|
| Migration SQL | Colonne `status`, policies RLS admin |
| `supabase/functions/admin-users/index.ts` | Nouveau -- creation/suppression users auth |
| `supabase/config.toml` | Ajouter config `admin-users` (verify_jwt = false) |
| `src/pages/admin/AdminDashboard.tsx` | Mise a jour -- navigation cards |
| `src/pages/admin/AdminCompanies.tsx` | Nouveau -- liste entreprises |
| `src/pages/admin/AdminCompanyForm.tsx` | Nouveau -- formulaire entreprise |
| `src/pages/admin/AdminUsers.tsx` | Nouveau -- liste utilisateurs |
| `src/pages/admin/AdminUserForm.tsx` | Nouveau -- formulaire utilisateur |
| `src/App.tsx` | Mise a jour -- nouvelles routes admin |
| `src/components/layout/AppSidebar.tsx` | Mise a jour -- sous-navigation admin |
| `src/i18n/locales/en.json` | Mise a jour -- cles traduction admin |

---

## 8. Details techniques

### Generation du slug

Fonction utilitaire `toKebabCase(name: string)` : supprime les accents, remplace les espaces et caracteres speciaux par des tirets, met en minuscules, supprime les tirets en debut/fin.

### Filtrage des utilisateurs non-admin

1. Charger tous les `users`
2. Charger les `user_roles` ou `role = 'admin' AND company_id IS NULL`
3. Exclure cote client les users dont l'ID apparait dans les roles admin

### Combobox multi-selection

Construite avec le composant `Command` (base sur `cmdk` deja installe) enveloppe dans un `Popover`. Affiche les entreprises selectionnees sous forme de badges avec bouton de suppression.

### Securite de l'edge function

L'edge function `admin-users` :
1. Extrait le JWT du header Authorization
2. Recupere l'utilisateur via `supabase.auth.getUser()`
3. Verifie le statut admin via `is_admin` RPC avec le service role client
4. Rejette avec 403 si non-admin
