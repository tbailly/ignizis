
-- Fix security definer views: use security_invoker so RLS of the querying user applies
ALTER VIEW active_documents SET (security_invoker = true);
ALTER VIEW active_companies SET (security_invoker = true);
ALTER VIEW active_company_officers SET (security_invoker = true);
ALTER VIEW active_document_tags SET (security_invoker = true);
ALTER VIEW active_requests SET (security_invoker = true);
