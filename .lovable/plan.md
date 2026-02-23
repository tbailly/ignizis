

## Fix: utiliser le bon template ID Resend

### Probleme

L'edge function `notify-new-request` utilise `template_id: "admin-new-request"` (un nom textuel), alors que l'API Resend attend un **UUID** de template. Resend ne reconnait pas le template et renvoie l'erreur :

```
Missing `html` or `text` field.
```

### Correction

Dans `supabase/functions/notify-new-request/index.ts`, remplacer :

```typescript
template_id: "admin-new-request",
```

par :

```typescript
template_id: "bb34b22d-bee5-4773-9299-01a4af82ab88",
```

C'est la seule modification necessaire. Le reste du payload (variables `data`, `from`, `to`) reste identique.

### Verification

Apres deploiement, appeler la fonction avec `curl_edge_functions` pour confirmer que Resend renvoie un succes (status 200).

### Resume

| Fichier | Modification |
|---------|-------------|
| `supabase/functions/notify-new-request/index.ts` | Remplacer le template_id textuel par l'UUID `bb34b22d-bee5-4773-9299-01a4af82ab88` |

