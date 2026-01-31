-- ============================================
-- PHASE 1: Base Tables
-- ============================================

-- Table users (synced with auth.users)
CREATE TABLE public.users (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  theme_preference TEXT DEFAULT 'system' CHECK (theme_preference IN ('light', 'dark', 'system')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table companies
CREATE TABLE public.companies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  owner_id UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table user_companies (junction with permissions)
CREATE TABLE public.user_companies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  permissions JSONB NOT NULL DEFAULT '{"entreprise": false, "contrats": false, "juridique": false, "comptabilite": false, "finance": false}'::jsonb,
  invited_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, company_id)
);

-- Table user_roles (for future admin interface)
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'super_admin')),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, company_id, role)
);

-- ============================================
-- PHASE 2: Indexes
-- ============================================

CREATE INDEX idx_user_companies_user_id ON public.user_companies(user_id);
CREATE INDEX idx_user_companies_company_id ON public.user_companies(company_id);
CREATE INDEX idx_companies_owner_id ON public.companies(owner_id);
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);

-- ============================================
-- PHASE 3: Helper Functions
-- ============================================

-- Check if current user is member of a company
CREATE OR REPLACE FUNCTION public.is_member_of_company(target_company_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_companies
    WHERE user_id = auth.uid() AND company_id = target_company_id
  );
$$;

-- Check if current user is owner of a company
CREATE OR REPLACE FUNCTION public.is_company_owner(target_company_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.companies
    WHERE id = target_company_id AND owner_id = auth.uid()
  );
$$;

-- Get user permissions for a company
CREATE OR REPLACE FUNCTION public.get_user_company_permissions(target_company_id UUID)
RETURNS JSONB
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT COALESCE(
    (SELECT permissions FROM public.user_companies 
     WHERE user_id = auth.uid() AND company_id = target_company_id),
    '{}'::jsonb
  );
$$;

-- Check if user has specific permission in a company
CREATE OR REPLACE FUNCTION public.has_permission(target_company_id UUID, section_name TEXT)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT COALESCE(
    (SELECT (permissions->>section_name)::boolean 
     FROM public.user_companies 
     WHERE user_id = auth.uid() AND company_id = target_company_id),
    false
  );
$$;

-- ============================================
-- PHASE 4: Trigger for updated_at
-- ============================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON public.companies
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- PHASE 5: Auto-create user on signup
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- PHASE 6: Enable RLS
-- ============================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PHASE 7: RLS Policies
-- ============================================

-- Users: can only see/update their own record
CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (id = auth.uid());

-- Companies: can see companies they belong to
CREATE POLICY "Users can view companies they belong to"
  ON public.companies FOR SELECT
  USING (public.is_member_of_company(id));

CREATE POLICY "Users can create companies"
  ON public.companies FOR INSERT
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Owners can update their companies"
  ON public.companies FOR UPDATE
  USING (owner_id = auth.uid());

CREATE POLICY "Owners can delete their companies"
  ON public.companies FOR DELETE
  USING (owner_id = auth.uid());

-- User_companies: users can see their own memberships
CREATE POLICY "Users can view own company memberships"
  ON public.user_companies FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own company settings"
  ON public.user_companies FOR UPDATE
  USING (user_id = auth.uid());

-- Owner or admin can invite users (insert)
CREATE POLICY "Company owners can invite users"
  ON public.user_companies FOR INSERT
  WITH CHECK (
    invited_by = auth.uid() 
    AND user_id != auth.uid()
    AND public.is_company_owner(company_id)
  );

CREATE POLICY "Company owners can remove users"
  ON public.user_companies FOR DELETE
  USING (
    public.is_company_owner(company_id)
    AND user_id != auth.uid()
  );

-- User_roles: locked down for future admin use
CREATE POLICY "User roles are restricted"
  ON public.user_roles FOR ALL
  USING (false);