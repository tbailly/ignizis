CREATE POLICY "Members can view tag assignments for company documents"
  ON document_tag_assignments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM documents d
      WHERE d.id = document_tag_assignments.document_id
        AND d.company_id IS NOT NULL
        AND public.is_member_of_company(d.company_id)
    )
  );