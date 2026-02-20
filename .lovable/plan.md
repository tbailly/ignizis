
## Ajout de 3 champs documents aux mandataires sociaux

### Vue d'ensemble

Trois nouveaux champs optionnels sont ajoutés aux corporate officers, chacun étant une référence à un document existant (sélectionnable via un dropdown cherchable par `display_name`) :

- **Passport** (`passport_document_id`)
- **Secondary ID** (`secondary_id_document_id`)
- **Power of Attorney** (`power_of_attorney_document_id`)

---

### 1. Migration base de données

Ajout de 3 colonnes nullable de type `uuid` dans la table `company_officers`, avec contrainte de clé étrangère vers `documents(id)` (suppression en `SET NULL` pour ne pas supprimer l'officier si un document est effacé) :

```sql
ALTER TABLE public.company_officers
  ADD COLUMN passport_document_id uuid REFERENCES public.documents(id) ON DELETE SET NULL,
  ADD COLUMN secondary_id_document_id uuid REFERENCES public.documents(id) ON DELETE SET NULL,
  ADD COLUMN power_of_attorney_document_id uuid REFERENCES public.documents(id) ON DELETE SET NULL;
```

Aucune policy RLS supplémentaire n'est nécessaire : les colonnes existantes sur `company_officers` (admins CRUD, membres SELECT) s'appliquent automatiquement aux nouvelles colonnes.

---

### 2. Nouveau composant `DocumentSelect`

Fichier : `src/components/admin/DocumentSelect.tsx`

Composant de sélection unique cherchable, basé sur `Popover` + `Command` (cmdk, déjà installé). Il reçoit :

- `documents` : liste `{ id: string; display_name: string }[]`
- `value` : `string | null` (id du document sélectionné)
- `onChange` : `(id: string | null) => void`
- `placeholder` : texte affiché quand rien n'est sélectionné

Comportement :
- Affiche le `display_name` du document sélectionné, ou le placeholder
- Champ de recherche intégré filtrant par `display_name`
- Option "Clear" pour déselectionner
- Single-select (pas multi)

---

### 3. Mise à jour de `OfficerFormDialog`

Fichier : `src/components/admin/OfficerFormDialog.tsx`

**Interface `OfficerData`** : ajout des 3 nouveaux champs optionnels.

**État** : 3 nouveaux `useState<string | null>(null)` pour les IDs des documents.

**`useEffect`** : chargement de la liste des documents (`supabase.from('documents').select('id, display_name').order('display_name')`) + pré-remplissage des 3 champs en mode édition.

**`handleSave`** : les 3 IDs sont inclus dans le payload `INSERT` et `UPDATE`.

**JSX** : 3 nouvelles sections avec `Label` + `DocumentSelect`, après le champ Position, dans un espace `space-y-4` identique aux autres champs.

---

### 4. Mise à jour de `AdminOfficers`

Fichier : `src/pages/admin/AdminOfficers.tsx`

**`OfficerWithCompanies`** : ajout des 3 champs optionnels.

**Query** : sélectionner les 3 nouvelles colonnes dans le `select` initial de `company_officers`.

**Passage des props** : les 3 valeurs sont déjà passées via le spread `...o` dans l'objet officer, donc `setEditingOfficer(officer)` fonctionnera sans modification supplémentaire une fois l'interface mise à jour.

---

### 5. Traductions i18n

Fichier : `src/i18n/locales/en.json`

Ajout dans `admin.officers` :

```json
"passport": "Passport",
"secondaryId": "Secondary ID",
"powerOfAttorney": "Power of Attorney",
"selectDocument": "Search and select a document...",
"noDocument": "No document selected"
```

---

### Récapitulatif des fichiers

| Fichier | Action |
|---------|--------|
| Migration SQL | Ajout de 3 colonnes FK sur `company_officers` |
| `src/components/admin/DocumentSelect.tsx` | Nouveau composant Combobox single-select |
| `src/components/admin/OfficerFormDialog.tsx` | +3 états, fetch documents, +3 champs UI |
| `src/pages/admin/AdminOfficers.tsx` | Mise à jour interface + query select |
| `src/i18n/locales/en.json` | +5 clés de traduction |

Aucune modification de RLS ou de storage nécessaire. Les documents restent accessibles uniquement aux admins.
