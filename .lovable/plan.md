

## Plan : Modales admin — header/footer sticky, hauteur coherente, sous-titres creation

### Probleme actuel

1. **Header et footer scrollent** avec le contenu car `overflow-y-auto` est applique sur `DialogContent` entier
2. **Hauteur max incoherente** : CompanyFormDialog = `max-h-[90vh]`, DocumentUploadDialog = `max-h-[80vh]`, OfficerFormDialog = aucune limite
3. **Sous-titres inutiles en creation** : certains dialogs repetent le titre dans la description

### Solution

Restructurer chaque dialog pour utiliser un layout flex vertical avec header et footer fixes et uniquement le corps scrollable.

### Fichiers a modifier

#### 1. `src/components/ui/dialog.tsx` — DialogContent

Ajouter `max-h-[85vh] flex flex-col` au style par defaut de `DialogContent`, et retirer tout `overflow` (chaque dialog gere son scroll dans le body).

#### 2. Chaque dialog admin — Pattern uniforme

Appliquer le meme pattern a tous les dialogs qui ont du contenu scrollable :

```text
DialogContent (max-h-[85vh] flex flex-col)
├── DialogHeader        ← fixe en haut
├── div.overflow-y-auto.flex-1.min-h-0  ← seule zone scrollable
│   └── contenu du formulaire
└── DialogFooter        ← fixe en bas
```

Dialogs concernes :
- **CompanyFormDialog** : retirer `max-h-[90vh] overflow-y-auto` du DialogContent, wrapper le `<div className="space-y-4">` dans `<div className="overflow-y-auto flex-1 min-h-0">`
- **OfficerFormDialog** : meme restructuration (c'est celui qui deborde actuellement)
- **RequestFormDialog** : idem
- **DocumentEditDialog** : idem
- **DocumentUploadDialog** : retirer `max-h-[80vh] overflow-y-auto`, appliquer le pattern
- **UserFormDialog** : idem (contenu court mais pattern coherent)
- **TagManagementDialog** : retirer le `max-h-[50vh] overflow-y-auto` interne, appliquer le pattern sur le corps

Les dialogs AlertDialog (delete) sont courts et n'ont pas besoin de scroll.

#### 3. Sous-titres en mode creation

Pour les dialogs de creation, supprimer `<DialogDescription>` et ne garder que `<DialogTitle>` avec le texte "Create a X" :

- **CompanyFormDialog** : en mode create, ne pas rendre `DialogDescription`
- **OfficerFormDialog** : en mode create, ne pas rendre `DialogDescription`
- **RequestFormDialog** : en mode create, ne pas rendre `DialogDescription`
- **UserFormDialog** : en mode create, ne pas rendre `DialogDescription`
- **DocumentUploadDialog** : deja sans description, rien a changer

Note : pour eviter les warnings d'accessibilite Radix (DialogContent sans Description), on ajoutera `aria-describedby={undefined}` sur DialogContent quand il n'y a pas de description.

### Resume des changements

| Fichier | Changement |
|---------|-----------|
| `dialog.tsx` | Ajouter `max-h-[85vh] flex flex-col` a DialogContent |
| `CompanyFormDialog.tsx` | Retirer overflow du content, wrapper body dans scroll div, conditionner DialogDescription |
| `OfficerFormDialog.tsx` | Wrapper body dans scroll div, conditionner DialogDescription |
| `RequestFormDialog.tsx` | Wrapper body dans scroll div, conditionner DialogDescription |
| `UserFormDialog.tsx` | Wrapper body dans scroll div, conditionner DialogDescription |
| `DocumentEditDialog.tsx` | Wrapper body dans scroll div (edit only = description gardee) |
| `DocumentUploadDialog.tsx` | Retirer overflow, wrapper body dans scroll div |
| `TagManagementDialog.tsx` | Retirer max-h interne, wrapper dans scroll div |

