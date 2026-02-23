## Ajout de l'email du demandeur sur les requests

### 1. Migration base de donnees

Ajouter une colonne `requester_email` (text, nullable) a la table `requests` :

```sql
ALTER TABLE public.requests ADD COLUMN requester_email text;
```

### 2. `RequestFormDialog.tsx`

- Ajouter un state `requesterEmail`
- Ajouter un state `suggestedEmails` alimente par une requete quand `companyId` change : fetcher les emails des utilisateurs lies a l'entreprise via `user_companies` + `users`
- Apres le champ entreprise, afficher un champ email avec un Combobox (meme pattern que le selecteur d'entreprise) :
  - Les emails des utilisateurs de l'entreprise sont suggeres dans la liste
  - L'utilisateur peut taper un email libre (le champ accepte la saisie directe)
  - Le champ n'apparait que si `companyId` est renseigne
- Inclure `requester_email` dans l'appel `insert` uniquement, pas dans `update`
- Ajouter `requester_email` a la validation (`canSave` : email optionnel ou obligatoire selon le besoin -- ici optionnel)

Requete pour les suggestions :

```sql
SELECT u.email FROM users u
JOIN user_companies uc ON uc.user_id = u.id
WHERE uc.company_id = :companyId
```

- En mode edition, pre-remplir le champ avec `request.requester_email`  et le rendre `disabled`  en permanence

### 3. `RequestData` (interface)

Ajouter `requester_email: string | null` a l'interface `RequestData`.

### 4. `AdminRequests.tsx`

Ajouter `requester_email` au `select` de la query pour le charger depuis la base.

### 5. `KanbanCard.tsx`

Optionnel : afficher l'email du demandeur sur la carte si present.

---

### Resume technique


| Element                 | Modification                                                                                                 |
| ----------------------- | ------------------------------------------------------------------------------------------------------------ |
| Migration SQL           | `ALTER TABLE requests ADD COLUMN requester_email text`                                                       |
| `RequestData` interface | Ajouter `requester_email: string / null`                                                                     |
| `AdminRequests.tsx`     | Ajouter `requester_email` au select                                                                          |
| `RequestFormDialog.tsx` | Nouveau champ email avec suggestions basees sur les utilisateurs de l'entreprise ; inclus dans insert/update |
| `KanbanCard.tsx`        | (optionnel) Afficher l'email sur la carte                                                                    |
