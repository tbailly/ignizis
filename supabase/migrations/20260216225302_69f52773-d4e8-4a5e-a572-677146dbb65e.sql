
-- 1. Enum for document type
CREATE TYPE public.document_type AS ENUM ('contract', 'invoice', 'other');

-- 2. Table document_tags
CREATE TABLE public.document_tags (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.document_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view tags"
  ON public.document_tags FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can insert tags"
  ON public.document_tags FOR INSERT
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update tags"
  ON public.document_tags FOR UPDATE
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete tags"
  ON public.document_tags FOR DELETE
  USING (public.is_admin(auth.uid()));

-- Default tags
INSERT INTO public.document_tags (name) VALUES ('kbis'), ('comptabilite'), ('cloture');

-- 3. Table documents
CREATE TABLE public.documents (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  display_name text NOT NULL,
  document_type public.document_type NOT NULL,
  storage_path text NOT NULL,
  original_filename text NOT NULL,
  file_size bigint,
  mime_type text,
  uploaded_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_documents_updated_at
  BEFORE UPDATE ON public.documents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Admins can select documents"
  ON public.documents FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can insert documents"
  ON public.documents FOR INSERT
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update documents"
  ON public.documents FOR UPDATE
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete documents"
  ON public.documents FOR DELETE
  USING (public.is_admin(auth.uid()));

-- 4. Table document_tag_assignments
CREATE TABLE public.document_tag_assignments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id uuid NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  tag_id uuid NOT NULL REFERENCES public.document_tags(id) ON DELETE CASCADE,
  UNIQUE(document_id, tag_id)
);

ALTER TABLE public.document_tag_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can select tag assignments"
  ON public.document_tag_assignments FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can insert tag assignments"
  ON public.document_tag_assignments FOR INSERT
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update tag assignments"
  ON public.document_tag_assignments FOR UPDATE
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete tag assignments"
  ON public.document_tag_assignments FOR DELETE
  USING (public.is_admin(auth.uid()));

-- 5. Storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', false);

CREATE POLICY "Admins can download documents"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'documents' AND public.is_admin(auth.uid()));

CREATE POLICY "Admins can upload documents"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'documents' AND public.is_admin(auth.uid()));

CREATE POLICY "Admins can update documents storage"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'documents' AND public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete documents storage"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'documents' AND public.is_admin(auth.uid()));
