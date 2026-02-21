

## Ajout d'une date d'expiration sur les documents

### 1. Migration base de donnees

Ajouter une colonne optionnelle `expires_at` de type `date` sur la table `documents` :

```sql
ALTER TABLE public.documents ADD COLUMN expires_at date;
```

Pas de contrainte, pas de valeur par defaut — le champ est nullable (date optionnelle).

---

### 2. Fichiers modifies

#### `src/pages/admin/AdminDocuments.tsx`

- Ajouter `expires_at: string | null` a l'interface `DocumentRow`
- Ajouter une nouvelle colonne "Expiration" dans le `TableHeader` (entre "Date d'import" et "Actions")
- Dans chaque ligne, afficher :
  - Si `expires_at` est null : un tiret `-` en texte muted
  - Si la date est passee : la date formatee DD/MM/YYYY avec un Badge `destructive` ("Expire")
  - Si la date est dans le futur : la date formatee DD/MM/YYYY avec un Badge `secondary` vert ("Valide")
- Mettre a jour le `colSpan` des lignes vides/loading de 5 a 6

#### `src/components/admin/DocumentEditDialog.tsx`

- Ajouter `expires_at: string | null` a l'interface `DocumentData`
- Ajouter un state `expiresAt` initialise depuis `document.expires_at` (converti du format ISO `YYYY-MM-DD` au format affichage `DD/MM/YYYY` si present, sinon chaine vide)
- Ajouter un champ de saisie avec le composant `DateMaskInput` existant (masque `DD/MM/YYYY`) + un bouton pour effacer la date
- Dans `handleSave`, inclure `expires_at` dans l'UPDATE : convertir `DD/MM/YYYY` vers `YYYY-MM-DD` pour le stockage, ou `null` si vide

#### `src/components/admin/DocumentUploadDialog.tsx`

- Ajouter `expiresAt: string` (format `DD/MM/YYYY`, vide par defaut) a l'interface `FileEntry`
- Ajouter un champ `DateMaskInput` dans le formulaire de chaque fichier
- Dans `handleUpload`, inclure `expires_at` dans l'INSERT (conversion `DD/MM/YYYY` → `YYYY-MM-DD` ou `null`)

#### `src/i18n/locales/en.json`

Nouvelles cles :
- `"admin.documents.expiresAt"`: `"Expiration"`
- `"admin.documents.expired"`: `"Expired"`
- `"admin.documents.valid"`: `"Valid"`
- `"admin.documents.clearDate"`: `"Clear"`

---

### 3. Logique d'indicateur visuel

La comparaison se fait cote client avec la date du jour :
- `new Date(expires_at) < new Date()` → Badge rouge "Expire"
- Sinon → Badge vert "Valide"
- Pas de date → tiret

---

### Recapitulatif

| Fichier | Action |
|---------|--------|
| Migration SQL | +colonne `expires_at` (date, nullable) |
| `AdminDocuments.tsx` | +colonne tableau avec indicateur visuel |
| `DocumentEditDialog.tsx` | +champ DateMaskInput pour editer la date |
| `DocumentUploadDialog.tsx` | +champ DateMaskInput a l'import |
| `en.json` | +cles i18n expiration |

