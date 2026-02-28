

## Sécuriser et fiabiliser les notifications de demandes

### 1. Migration SQL — Table `notification_queue` + trigger + cron

Créer en une seule migration :

- **Extension `pg_net`** (si pas déjà active)
- **Table `notification_queue`** avec colonnes : `id`, `request_id` (FK), `status` (pending/sent/failed), `attempts`, `created_at`, `last_attempt_at`
- **RLS** sur `notification_queue` (admin only)
- **Trigger `AFTER INSERT ON requests`** : insère une ligne `pending` dans la queue + appelle `pg_net` vers la edge function avec le service role key depuis le vault
- **Fonction trigger** `notify_new_request_trigger()` en `SECURITY DEFINER`

### 2. Cron pg_cron — Retry toutes les 5 minutes

Via SQL insert (pas migration, car contient l'URL projet + anon key) :

```sql
SELECT cron.schedule(
  'retry-failed-notifications',
  '*/5 * * * *',
  $$ SELECT net.http_post(
    url := 'https://epcelmrwfqniycdrxaoi.supabase.co/functions/v1/retry-failed-notifications',
    headers := '{"Content-Type":"application/json","Authorization":"Bearer <service_role_key>"}'::jsonb,
    body := '{}'::jsonb
  ) AS request_id; $$
);
```

### 3. Edge function `notify-new-request` — Sécuriser + marquer la queue

- Valider que `Authorization` = `Bearer <SUPABASE_SERVICE_ROLE_KEY>`, sinon 403
- Envoyer l'email via Resend (logique existante)
- En cas de succès : `UPDATE notification_queue SET status = 'sent', attempts = attempts + 1, last_attempt_at = now() WHERE id = queue_id`
- En cas d'échec : `UPDATE notification_queue SET status = 'failed', attempts = attempts + 1, last_attempt_at = now() WHERE id = queue_id`

### 4. Nouvelle edge function `retry-failed-notifications`

- Valider le service role key
- Sélectionner les entrées `notification_queue` en `pending` ou `failed` avec `attempts < 5`
- Joindre `requests` + `companies` pour reconstruire le payload
- Pour chaque entrée : appeler Resend, mettre à jour le statut (`sent` ou `failed`)

### 5. Frontend — Supprimer les appels manuels

- `RequestFormDialog.tsx` lignes 182-191 : supprimer `supabase.functions.invoke('notify-new-request', ...)`
- `Juridique.tsx` lignes 139-148 : supprimer le bloc équivalent

### 6. Supprimer le security finding `notify_no_auth`

### Résumé

| Composant | Action |
|-----------|--------|
| Migration SQL | Table `notification_queue` + trigger `AFTER INSERT ON requests` |
| Cron `pg_cron` | Retry `*/5 * * * *` → appel `retry-failed-notifications` |
| `notify-new-request` | Valider service role, envoyer email, marquer queue |
| `retry-failed-notifications` | Nouvelle edge function, retente les échecs |
| `RequestFormDialog.tsx` | Supprimer appel manuel |
| `Juridique.tsx` | Supprimer appel manuel |
| Security finding | Supprimer `notify_no_auth` |

