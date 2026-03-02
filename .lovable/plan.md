

## Plan : Colonne "Entité" avec icone contextuelle

### Constat actuel

La colonne "Company" affiche uniquement le nom de l'entreprise via la jointure `company_id`. Mais les documents de type `passport`, `secondary_id` et `power_of_attorney` sont liés à un mandataire (officer) — pas directement via `company_id` mais via les champs `passport_document_id`, `secondary_id_document_id`, `power_of_attorney_document_id` de la table `company_officers`. Ces documents ont `company_id = null`.

### Solution

1. **Requête enrichie** : Dans la query de `AdminDocuments.tsx`, charger aussi les officers (`active_company_officers`) et construire un reverse map `document_id → officer` pour les 3 champs document. Ensuite, pour chaque document, déterminer l'entité liée : si le type est `passport`/`secondary_id`/`power_of_attorney`, chercher l'officer dans le map ; sinon, utiliser `company_name`.

2. **Interface `DocumentRow`** : Ajouter `officer_name: string | null` et `linked_entity: 'company' | 'officer' | null` pour le rendering.

3. **Colonne renommée** : Remplacer l'en-tête "Company" par "Entity" (i18n). Chaque cellule affiche :
   - `Building2` + nom de la company si c'est une company
   - `UserRound` + nom de l'officer si c'est un officer
   - `-` si aucun lien

4. **i18n** : Ajouter la clé `admin.documents.entity` dans `en.json`.

### Fichiers à modifier

| Fichier | Modification |
|---------|-------------|
| `src/pages/admin/AdminDocuments.tsx` | Enrichir la query pour charger les officers, construire le reverse map, ajouter `officer_name`/`linked_entity` au `DocumentRow`, modifier le rendu de la colonne |
| `src/i18n/locales/en.json` | Ajouter `"entity": "Entity"` dans `admin.documents` |

### Détail technique de la query

```typescript
// Charger les officers
const { data: officersList } = await supabase
  .from('active_company_officers' as any)
  .select('id, first_name, last_name, passport_document_id, secondary_id_document_id, power_of_attorney_document_id');

// Construire un map document_id → officer name
const docToOfficer = new Map<string, string>();
for (const o of officersList || []) {
  for (const field of ['passport_document_id', 'secondary_id_document_id', 'power_of_attorney_document_id']) {
    if (o[field]) docToOfficer.set(o[field], `${o.first_name} ${o.last_name}`);
  }
}

// Dans le mapping de chaque doc :
const isOfficerType = ['passport', 'secondary_id', 'power_of_attorney'].includes(doc.document_type);
return {
  ...doc,
  company_name: doc.companies?.name || null,
  officer_name: docToOfficer.get(doc.id) || null,
  linked_entity: isOfficerType ? 'officer' : (doc.companies?.name ? 'company' : null),
};
```

### Rendu de la cellule

```tsx
<TableCell>
  {doc.linked_entity === 'company' && doc.company_name ? (
    <span className="flex items-center gap-2">
      <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
      {doc.company_name}
    </span>
  ) : doc.linked_entity === 'officer' && doc.officer_name ? (
    <span className="flex items-center gap-2">
      <UserRound className="h-4 w-4 text-muted-foreground shrink-0" />
      {doc.officer_name}
    </span>
  ) : (
    <span className="text-muted-foreground">-</span>
  )}
</TableCell>
```

