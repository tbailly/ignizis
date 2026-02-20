
## Ajout du bouton "Créer un mandataire" dans AdminOfficers

### Objectif
Permettre aux admins de créer un mandataire depuis un bouton similaire à "Create a company", sans dupliquer le code de la modale d'édition existante.

---

### Approche : prop `officer` optionnelle dans `OfficerFormDialog`

Le composant `OfficerFormDialog` est refactorisé pour accepter `officer` en prop **optionnelle**. L'absence de la prop détermine le mode :

- `officer` absent → **mode création** : champs vides, `INSERT` en base
- `officer` présent → **mode édition** : champs pré-remplis, `UPDATE` + diff des assignments (comportement actuel inchangé)

Le JSX du formulaire (champs, structure, footer) est **identique dans les deux modes**. Seules la logique de sauvegarde et les traductions du header diffèrent — gérées par une simple condition `isEditMode`.

---

### Fichiers modifiés

**1. `src/components/admin/OfficerFormDialog.tsx`**

- `officer?: OfficerData` (prop optionnelle)
- Constante `isEditMode = !!officer`
- `useEffect` : initialise les champs vides si pas d'officer, sinon pré-remplit comme aujourd'hui
- `handleSave` branché :
  - Mode **création** : `INSERT INTO company_officers` → récupère l'`id` → `INSERT` tous les assignments sélectionnés
  - Mode **édition** : comportement actuel (`UPDATE` + diff remove/add assignments)
- Titre/description via `isEditMode ? t('admin.officers.edit') : t('admin.officers.create')`

**2. `src/pages/admin/AdminOfficers.tsx`**

- Ajout de l'import `Plus` depuis `lucide-react`
- Nouveau state `const [creatingOfficer, setCreatingOfficer] = useState(false)`
- Header de la page : bouton `<Button onClick={() => setCreatingOfficer(true)}>` avec icône `Plus` et label `t('admin.officers.create')`, aligné à droite (flex justify-between comme `AdminCompanies`)
- Rendu conditionnel : `{creatingOfficer && <OfficerFormDialog onClose={...} onSuccess={...} />}`
- `handleCreateSuccess` : ferme la modale + invalide la query

**3. `src/i18n/locales/en.json`**

Ajout dans `admin.officers` :
```json
"create": "Create an officer",
"createDesc": "Fill in the officer's information.",
"createSuccess": "Officer created"
```

---

### Aucune migration base de données nécessaire

Les tables `company_officers` et `officer_company_assignments` et leurs policies RLS existantes couvrent déjà les `INSERT` pour les admins.
