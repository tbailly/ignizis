

## Modifications de la page Company

### 1. `src/components/company/DocumentsSection.tsx` -- Filtrer par type "legal"

Ajouter `.eq('document_type', 'legal')` a la requete documents (ligne 47, avant `.order`).

### 2. `src/pages/Entreprise.tsx` -- Badge non-compliant sur une seule ligne

Sur le badge non-compliant (ligne 190), ajouter `whitespace-nowrap shrink-0` pour empecher le retour a la ligne. Aussi ajouter `min-w-0` sur le nom (le `<p>` parent) pour permettre la troncature si necessaire, et `gap-2` + `flex-nowrap` sur le conteneur flex.

| Fichier | Modification |
|---------|-------------|
| `DocumentsSection.tsx` ligne 47 | Ajouter `.eq('document_type', 'legal')` |
| `Entreprise.tsx` ligne 180 | Ajouter `flex-nowrap gap-2` au conteneur flex |
| `Entreprise.tsx` ligne 181-184 | Ajouter `min-w-0 truncate` sur le `<p>` du nom |
| `Entreprise.tsx` ligne 186+190 | Ajouter `whitespace-nowrap shrink-0` sur les badges |

