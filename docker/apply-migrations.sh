#!/bin/sh
set -e
echo "Waiting for database..."
until pg_isready -h db -U supabase_admin; do sleep 1; done

echo "Applying migrations..."
for f in $(ls /migrations/*.sql | sort); do
  echo "  -> $f"
  psql -h db -U supabase_admin -d postgres -f "$f" || true
done
echo "Migrations done."
