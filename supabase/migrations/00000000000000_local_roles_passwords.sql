-- Local dev only: assign passwords to Supabase internal roles
-- Password matches POSTGRES_PASSWORD (default: postgres)
ALTER ROLE authenticator WITH PASSWORD 'postgres';
ALTER ROLE supabase_auth_admin WITH PASSWORD 'postgres';
ALTER ROLE supabase_storage_admin WITH PASSWORD 'postgres';
