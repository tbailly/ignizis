ALTER TABLE public.company_officers
  ADD COLUMN passport_document_id uuid REFERENCES public.documents(id) ON DELETE SET NULL,
  ADD COLUMN secondary_id_document_id uuid REFERENCES public.documents(id) ON DELETE SET NULL,
  ADD COLUMN power_of_attorney_document_id uuid REFERENCES public.documents(id) ON DELETE SET NULL;