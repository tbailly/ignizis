

## Plan : Migration Resend SDK + nouvelle clé API

### Étape 1 — Nouvelle clé API Resend

Utiliser l'outil `add_secret` pour te demander de saisir la nouvelle clé API Resend (secret `RESEND_API_KEY`).

### Étape 2 — Migrer `notify-new-request` vers le SDK Resend

Remplacer l'appel `fetch("https://api.resend.com/emails", ...)` par le SDK Resend :

```typescript
import { Resend } from "npm:resend";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

await resend.emails.send({
  to: [NOTIFICATION_EMAIL],
  replyTo: requester_email || NOTIFICATION_EMAIL,
  template: {
    id: "new-request",
    variables: { ... }, // mêmes variables qu'actuellement
  },
});
```

- Suppression du `from` (non nécessaire)
- Template ID changé de `bb34b22d-bee5-4773-9299-01a4af82ab88` à `new-request`

### Étape 3 — Migrer `retry-failed-notifications` de la même façon

Même changement : SDK Resend, pas de `from`, template ID `new-request`.

### Fichiers modifiés

| Fichier | Modification |
|---------|-------------|
| `supabase/functions/notify-new-request/index.ts` | SDK Resend, suppression `from`, nouveau template ID |
| `supabase/functions/retry-failed-notifications/index.ts` | Idem |

