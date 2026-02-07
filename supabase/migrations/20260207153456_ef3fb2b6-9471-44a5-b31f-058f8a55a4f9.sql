
-- Add INSERT policy so users can have their profile created
CREATE POLICY "Users can insert own profile"
  ON public.users
  FOR INSERT
  WITH CHECK (id = auth.uid());
