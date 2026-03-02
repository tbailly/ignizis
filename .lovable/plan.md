

## Plan : Clé de traduction pour l'abréviation "jour"

### Changements

Remplacer le `j` hardcodé par une clé i18n `common.dayShort` (valeur `"d"`) dans les 2 fichiers concernés.

| Fichier | Modification |
|---------|-------------|
| `src/i18n/locales/en.json` | Ajouter `"dayShort": "d"` dans `common` |
| `src/pages/admin/AdminOfficers.tsx` (ligne 185) | `}j)` → `}${t('common.dayShort')})` |
| `src/pages/Entreprise.tsx` (ligne 198) | `}j)` → `}${t('common.dayShort')})` |

