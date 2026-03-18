

## Analyse du problème

Le log montre un **POST 400** sur le chemin :
```
/object/documents/b4144eb9-..._formalite%CC%81s.pdf
```

`%CC%81` est le **combining acute accent** Unicode (U+0301). Le fichier vient de macOS qui utilise la décomposition NFD : `é` → `e` + `◌́`. Supabase Storage rejette les caractères combinants dans les noms de fichiers.

Le problème est dans `DocumentUploadDialog.tsx` ligne 145 :
```ts
const storagePath = `${uuid}_${entry.file.name}`;
```

`entry.file.name` est utilisé tel quel, avec les caractères Unicode décomposés de macOS.

## Correction

Normaliser le nom de fichier en **NFC** (forme composée) avant de l'utiliser comme chemin de stockage. NFC recompose `e` + `◌́` → `é`, ce qui est accepté par Supabase Storage.

De plus, par sécurité, on peut aussi sanitiser les caractères non-ASCII restants.

### Fichier modifié

| Fichier | Modification |
|---------|-------------|
| `src/components/admin/DocumentUploadDialog.tsx` | Appliquer `.normalize('NFC')` sur `entry.file.name` lors de la construction de `storagePath` (ligne 145) et sur `original_filename` (ligne 153) |

### Changement concret

```ts
// Avant
const storagePath = `${uuid}_${entry.file.name}`;

// Après
const safeFileName = entry.file.name.normalize('NFC');
const storagePath = `${uuid}_${safeFileName}`;
```

Et utiliser `safeFileName` aussi pour `original_filename` dans l'insert et pour le download.

