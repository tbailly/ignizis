
## Notification email via template Resend a la creation d'une request

### Vue d'ensemble

Creer une edge function `notify-new-request` qui envoie un email via l'API Resend en utilisant le **template existant** `admin-new-request` du compte Resend (pas de template React Email en local). L'email est envoye a une adresse fixe configurable a chaque creation de request (admin ou utilisateur).

### Variables du template Resend

Le template `admin-new-request` attend ces variables :
- `REQUESTER_EMAIL` -- email du demandeur
- `REQUEST_ID` -- numero de la demande (ex: "1234")
- `REQUEST_TITLE` -- titre de la demande
- `COMPANY_NAME` -- nom de l'entreprise
- `REQUEST_MESSAGE` -- description / message de la demande

### 1. Edge function `supabase/functions/notify-new-request/index.ts`

- Endpoint POST avec CORS
- Pas de verification JWT (endpoint interne, fire-and-forget)
- Adresse destinataire configurable via constante :

```typescript
const NOTIFICATION_EMAIL = "thomasbaillysalins01+legal@gmail.com";
```

- Utilise l'API Resend avec `resend.emails.send()` en mode **template** :
  - `from`: "Portail Entreprises <noreply@liste-naissance.thomasbs.fr>"
  - `to`: NOTIFICATION_EMAIL
  - `subject`: pas necessaire (defini dans le template Resend)
  - Passe les 5 variables au template via le champ Resend adequat

- Body attendu :
  - `request_number` (number)
  - `title` (string)
  - `description` (string | null)
  - `company_name` (string)
  - `requester_email` (string | null)

### 2. Configuration `supabase/config.toml`

Ajouter :
```toml
[functions.notify-new-request]
verify_jwt = false
```

### 3. Appels depuis le frontend

**`src/components/admin/RequestFormDialog.tsx`** (creation admin, apres ligne 179) :
- Apres l'insert reussi (uniquement en mode creation, pas edition), appeler :
```typescript
supabase.functions.invoke('notify-new-request', {
  body: {
    request_number: requestNumber,
    title: title.trim(),
    description: description.trim() || null,
    company_name: selectedCompany?.name || '',
    requester_email: requesterEmail.trim() || null,
  }
}).catch(err => console.error('Notification error:', err));
```
- Fire-and-forget : ne bloque pas le flux utilisateur

**`src/pages/Juridique.tsx`** (creation utilisateur, apres ligne 137) :
- Meme logique apres l'insert reussi :
```typescript
supabase.functions.invoke('notify-new-request', {
  body: {
    request_number: requestNumber,
    title: newTitle.trim(),
    description: newDescription.trim() || null,
    company_name: currentCompany?.company?.name || '',
    requester_email: profile?.email || null,
  }
}).catch(err => console.error('Notification error:', err));
```

### 4. Resume

| Element | Action |
|---------|--------|
| `supabase/functions/notify-new-request/index.ts` | Nouvelle edge function utilisant le template Resend `admin-new-request` |
| `supabase/config.toml` | Ajout `verify_jwt = false` |
| `RequestFormDialog.tsx` | Appel fire-and-forget apres creation admin |
| `Juridique.tsx` | Appel fire-and-forget apres creation utilisateur |

Pas de template React Email local -- on utilise directement le template configure dans le compte Resend.
