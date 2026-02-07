
-- 1. Add status column to companies
ALTER TABLE public.companies 
  ADD COLUMN status text NOT NULL DEFAULT 'active';

-- 2. Admin RLS policies for companies
CREATE POLICY "Admins have full select on companies"
  ON public.companies FOR SELECT
  TO authenticated
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can update companies"
  ON public.companies FOR UPDATE
  TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can delete companies"
  ON public.companies FOR DELETE
  TO authenticated
  USING (is_admin(auth.uid()));

-- 3. Admin RLS policy for users
CREATE POLICY "Admins can view all users"
  ON public.users FOR SELECT
  TO authenticated
  USING (is_admin(auth.uid()));

-- 4. Admin RLS policies for user_companies
CREATE POLICY "Admins can view all user_companies"
  ON public.user_companies FOR SELECT
  TO authenticated
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can insert user_companies"
  ON public.user_companies FOR INSERT
  TO authenticated
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can delete user_companies"
  ON public.user_companies FOR DELETE
  TO authenticated
  USING (is_admin(auth.uid()));

-- 5. Admin RLS policy to view all roles (needed to filter non-admin users)
CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (is_admin(auth.uid()));
