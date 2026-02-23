
## Affichage des demandes utilisateur sur la page Legal

### 1. Migration SQL : politiques RLS pour les utilisateurs

Actuellement, seuls les admins peuvent lire/creer des requests. Il faut ajouter deux politiques RLS :

- **SELECT** : les membres d'une entreprise peuvent voir les requests de leur entreprise
- **INSERT** : les membres d'une entreprise peuvent creer des requests pour leur entreprise

```sql
CREATE POLICY "Members can view company requests"
  ON public.requests FOR SELECT
  USING (is_member_of_company(company_id));

CREATE POLICY "Members can insert company requests"
  ON public.requests FOR INSERT
  WITH CHECK (is_member_of_company(company_id));
```

### 2. Page `Juridique.tsx`

Remplacer le placeholder actuel (icone Scale + texte vide) par :

- **Banniere disclaimer** : un composant `Alert` en haut de page expliquant que les demandes sont suivies ici mais que les echanges ont lieu par email
- **Bouton "Nouvelle demande"** : ouvre une modale simplifiee (titre + description uniquement ; l'entreprise et l'email du demandeur sont deduits automatiquement)
- **DataTable compacte** des requests de l'entreprise en cours, avec colonnes :
  - Numero unique (`#1234`)
  - Statut (badge colore)
  - Titre
  - Description (tronquee)

La modale de creation :
- Champs : titre (obligatoire), description (optionnel)
- A la soumission : genere un `request_number` unique, insere la request avec `company_id` = entreprise en cours, `requester_email` = email de l'utilisateur connecte, `status` = `new`

### 3. Traductions (`en.json`)

Ajout de cles dans la section `legal` :

| Cle | Valeur |
|-----|--------|
| `legal.disclaimer` | `You can track your requests here. All exchanges take place by email.` |
| `legal.newRequest` | `New request` |
| `legal.createTitle` | `Create a request` |
| `legal.createDesc` | `Describe your request. We will get back to you by email.` |
| `legal.createSuccess` | `Request created successfully.` |
| `legal.noRequests` | `No requests yet.` |
| `legal.columns.number` | `#` |
| `legal.columns.status` | `Status` |
| `legal.columns.title` | `Title` |
| `legal.columns.description` | `Description` |

### 4. Resume technique

| Element | Modification |
|---------|-------------|
| Migration SQL | 2 nouvelles politiques RLS sur `requests` (SELECT + INSERT pour les membres) |
| `Juridique.tsx` | Banniere disclaimer, datatable des requests, modale de creation |
| `en.json` | Nouvelles cles de traduction `legal.*` |

Aucun nouveau fichier cree en dehors de la migration. La logique de generation du `request_number` reutilise la fonction existante dans `RequestFormDialog.tsx`.
