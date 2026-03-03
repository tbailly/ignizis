

## Plan : Email de confirmation au demandeur (`requester_email`)

### Objectif

Envoyer un second email au `requester_email` via le template Resend `new-request-user` (sans variables, sans `from`) à chaque nouvelle demande, avec le même mécanisme de retry que l'email admin.

### Approche

Ajouter un second appel `resend.emails.send()` dans les deux edge functions, juste après l'envoi admin. Le statut de la queue reflètera le résultat combiné des deux envois.

### Fichiers modifiés

| Fichier | Modification |
|---------|-------------|
| `supabase/functions/notify-new-request/index.ts` | Ajouter un second `resend.emails.send()` vers `requester_email` avec template `new-request-user` après l'envoi admin. Marquer `failed` si l'un des deux échoue. |
| `supabase/functions/retry-failed-notifications/index.ts` | Même ajout : envoyer les deux emails (admin + requester) lors du retry. |

### Détail technique

Dans `notify-new-request/index.ts`, après l'envoi admin existant :

```typescript
// Email au demandeur (si requester_email présent)
if (requester_email) {
  const { error: userSendError } = await resend.emails.send({
    to: [requester_email],
    template: { id: "new-request-user" },
  });
  if (userSendError) {
    console.error("Resend user email error:", userSendError);
    // Marquer failed pour que le retry renvoie les deux
  }
}
```

La logique de statut sera :
- Les deux réussissent -> `sent`
- L'un des deux échoue -> `failed` (le retry renverra les deux)

Même pattern appliqué dans `retry-failed-notifications/index.ts`.
