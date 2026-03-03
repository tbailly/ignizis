

## Diagnostic

- Le cron `retry-failed-notifications` tourne toutes les 5 min (confirmé par `cron.job_run_details`) mais retourne **0 rows** car la sous-requête `FROM vault.decrypted_secrets WHERE name = 'SUPABASE_SERVICE_ROLE_KEY'` ne trouve rien.
- Le trigger `notify_new_request_trigger` fait la même chose : il lit `SUPABASE_URL` et `SUPABASE_SERVICE_ROLE_KEY` depuis le vault, obtient NULL, et skip l'appel `net.http_post`.
- Les 2 entrées en queue sont `pending` avec `attempts: 0` — jamais traitées.

## Cause racine

Les secrets `SUPABASE_URL` et `SUPABASE_SERVICE_ROLE_KEY` sont configurés comme **secrets Edge Function** (variables Deno) mais ne sont **pas** insérés dans le **vault Postgres** (`vault.secrets`). Le trigger et le cron dépendent du vault pour construire les URLs et headers d'authentification.

## Solution

Insérer les 2 secrets dans le vault Postgres via une requête SQL. Cela permettra au trigger et au cron de fonctionner immédiatement sans modifier de code.

### Requête à exécuter (via l'outil insert, pas migration)

```sql
INSERT INTO vault.secrets (name, secret)
VALUES
  ('SUPABASE_URL', 'https://epcelmrwfqniycdrxaoi.supabase.co'),
  ('SUPABASE_SERVICE_ROLE_KEY', '<service_role_key>')
ON CONFLICT (name) DO UPDATE SET secret = EXCLUDED.secret;
```

Le `SUPABASE_URL` est connu. Pour la `SERVICE_ROLE_KEY`, elle est déjà configurée comme secret Edge Function — je la récupérerai depuis la configuration existante.

### Vérification post-fix

Après insertion, les 2 notifications pending devraient être traitées au prochain cycle cron (dans les 5 minutes).

| Étape | Action |
|-------|--------|
| 1 | Insérer `SUPABASE_URL` et `SUPABASE_SERVICE_ROLE_KEY` dans `vault.secrets` |
| 2 | Vérifier que les notifications pending passent en `sent` après le prochain cycle cron |

