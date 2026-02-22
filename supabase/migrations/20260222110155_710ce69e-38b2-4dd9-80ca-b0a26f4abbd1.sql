
-- Allow members to download documents that belong to their company
CREATE POLICY "Members can download company documents"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'documents'
    AND EXISTS (
      SELECT 1 FROM public.documents d
      WHERE d.storage_path = name
        AND d.company_id IS NOT NULL
        AND is_member_of_company(d.company_id)
    )
  );
