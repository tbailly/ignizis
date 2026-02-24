

## Refonte du formulaire d'import de documents : liaison entreprise/mandataire et types dynamiques

### Vue d'ensemble

Transformer le formulaire d'import de documents pour :
1. Ajouter 3 nouveaux types de document (`passport`, `secondary_id`, `power_of_attorney`) et renommer `other` en `legal`
2. Remplacer le champ "Company" par un champ unifie "Company or corporate officer" (combobox mixte)
3. Afficher le champ "Type" uniquement apres selection, avec des options filtrees selon le type d'entite choisie
4. A l'upload, associer automatiquement le document au bon champ du mandataire social si applicable

---

### 1. Migration SQL : modifier l'enum `document_type`

Ajouter les 3 nouvelles valeurs a l'enum et renommer `other` en `legal` :

```sql
-- Ajouter les nouvelles valeurs
ALTER TYPE document_type ADD VALUE IF NOT EXISTS 'passport';
ALTER TYPE document_type ADD VALUE IF NOT EXISTS 'secondary_id';
ALTER TYPE document_type ADD VALUE IF NOT EXISTS 'power_of_attorney';
ALTER TYPE document_type ADD VALUE IF NOT EXISTS 'legal';

-- Migrer les documents existants de 'other' vers 'legal'
UPDATE documents SET document_type = 'legal' WHERE document_type = 'other';
```

Note : PostgreSQL ne permet pas de supprimer une valeur d'enum. La valeur `other` restera dans l'enum mais ne sera plus utilisee dans l'interface.

---

### 2. `src/components/admin/DocumentUploadDialog.tsx` -- Refonte majeure

**Modification de l'interface `FileEntry`** :
```typescript
interface FileEntry {
  file: File;
  displayName: string;
  documentType: 'contract' | 'invoice' | 'legal' | 'passport' | 'secondary_id' | 'power_of_attorney' | '';
  expiresAt: string;
  // Nouveau : entite liee (entreprise OU mandataire)
  linkedType: 'company' | 'officer' | null;
  linkedId: string | null;
  selectedTagIds: string[];
}
```

**Nouvelles donnees a charger** :
- Ajouter un `useQuery` pour les mandataires sociaux :
```typescript
const { data: officers = [] } = useQuery({
  queryKey: ['officers-list'],
  queryFn: async () => {
    const { data, error } = await supabase
      .from('company_officers')
      .select('id, first_name, last_name')
      .order('last_name');
    if (error) throw error;
    return data || [];
  },
});
```

**Nouveau composant combobox "Company or corporate officer"** :
- Combobox cherchable combinant entreprises et mandataires sociaux dans une seule liste
- Chaque ligne affiche une icone a gauche : `Building2` pour les entreprises, `UserRound` pour les mandataires
- Les entreprises sont listees en premier, puis les mandataires (2 groupes dans le Command)
- La valeur selectionnee encode le type + id (ex: `company:uuid` ou `officer:uuid`)
- Option de deselection (bouton X) comme dans `CompanySelect`

**Logique d'affichage du champ Type** :
- Le champ "Type" est **cache** tant qu'aucune entite n'est selectionnee
- Si `linkedType === 'company'` : afficher uniquement Contract, Invoice, Legal
- Si `linkedType === 'officer'` : afficher uniquement Passport, Secondary ID, Power of Attorney
- Quand l'entite change, remettre `documentType` a `''`

**Ordre des champs dans le formulaire** :
1. Display name
2. Company or corporate officer (combobox)
3. Type (conditionnel, visible seulement si une entite est selectionnee)
4. Expires at
5. Tags

**Logique d'upload modifiee** (`handleUpload`) :
- Si `linkedType === 'company'` : inserer le document avec `company_id = linkedId` (comme aujourd'hui)
- Si `linkedType === 'officer'` : 
  - Inserer le document avec `company_id = null`
  - Puis mettre a jour le mandataire en associant le document au bon champ selon le type :
    - `passport` -> `UPDATE company_officers SET passport_document_id = docId WHERE id = officerId`
    - `secondary_id` -> `UPDATE company_officers SET secondary_id_document_id = docId WHERE id = officerId`
    - `power_of_attorney` -> `UPDATE company_officers SET power_of_attorney_document_id = docId WHERE id = officerId`

---

### 3. `src/components/admin/DocumentEditDialog.tsx` -- Mise a jour des types

- Mettre a jour les options du Select pour inclure les 6 types (contract, invoice, legal, passport, secondary_id, power_of_attorney)
- Mettre a jour l'interface `DocumentData` pour accepter les nouveaux types
- Le champ Type reste toujours visible dans l'edition (pas de logique conditionnelle ici)

---

### 4. `src/pages/admin/AdminDocuments.tsx` -- Mise a jour du mapping des labels

```typescript
const typeLabels: Record<string, string> = {
  contract: 'Contrat',
  invoice: 'Facture',
  legal: 'Legal',
  passport: 'Passeport',
  secondary_id: 'Secondary ID',
  power_of_attorney: 'Power of Attorney',
  other: 'Autre', // legacy
};
```

---

### 5. `src/i18n/locales/en.json` -- Nouvelles cles de traduction

```json
"admin.documents.typePassport": "Passport",
"admin.documents.typeSecondaryId": "Secondary ID",
"admin.documents.typePowerOfAttorney": "Power of Attorney",
"admin.documents.typeLegal": "Legal",
"admin.documents.companyOrOfficer": "Company or corporate officer",
"admin.documents.selectCompanyOrOfficer": "Select a company or officer..."
```

---

### 6. `src/components/company/DocumentsSection.tsx` -- Mise a jour des labels

Mettre a jour le mapping `typeLabels` pour inclure les nouveaux types, comme dans AdminDocuments.

---

### Resume

| Fichier | Action |
|---------|--------|
| Migration SQL | Ajouter `passport`, `secondary_id`, `power_of_attorney`, `legal` a l'enum ; migrer `other` vers `legal` |
| `DocumentUploadDialog.tsx` | Refonte : combobox mixte entreprise/mandataire, type conditionnel, upload avec association mandataire |
| `DocumentEditDialog.tsx` | Ajouter les nouveaux types au Select |
| `AdminDocuments.tsx` | Mettre a jour `typeLabels` |
| `en.json` | Nouvelles cles de traduction |
| `DocumentsSection.tsx` | Mettre a jour `typeLabels` |

