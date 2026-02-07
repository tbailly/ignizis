
# Add Company Slug to URLs

## Overview

Add a `slug` field to companies (a URL-friendly kebab-case version of the company name) and restructure routing so that all company-scoped pages are prefixed with the slug. For example: `/company-one/contrats`, `/company-two/finance`.

Pages that are not company-specific (settings, legal pages, help) will remain at the root level without a slug prefix.

## What Changes

**Before:** `/contrats`, `/finance`, `/entreprise`
**After:** `/company-one/contrats`, `/company-two/finance`, `/company-one/entreprise`

Non-company pages stay the same: `/parametres`, `/aide`, `/auth`, `/mentions-legales`, etc.

## Implementation Steps

### 1. Database: Add `slug` column to `companies`

- Add a `slug` column (text, not null, unique) to the `companies` table
- Populate existing rows automatically:
  - "Company One" becomes `company-one`
  - "Company Two" becomes `company-two`
- Add a unique constraint so no two companies share a slug

### 2. Update CompanyContext

- Add `slug` to the `Company` interface and fetch query
- When the provider loads, read the first URL segment to detect a company slug
- If a slug is found in the URL, set that company as the current one (instead of only relying on localStorage)
- When switching companies (via the selector), navigate to the equivalent page under the new slug
- Expose a helper `companyPath(path)` that returns `/${slug}${path}` for building links

### 3. Restructure Routes in App.tsx

Current routes like:
```
<Route path="/contrats" element={...} />
```

Become:
```
<Route path="/:companySlug/contrats" element={...} />
```

Company-scoped routes (with slug prefix):
- `/:companySlug` -- Dashboard
- `/:companySlug/entreprise`
- `/:companySlug/contrats`
- `/:companySlug/juridique`
- `/:companySlug/comptabilite`
- `/:companySlug/finance`

Root-level routes (no slug):
- `/auth`
- `/parametres`
- `/aide`
- `/mentions-legales`, `/confidentialite`, `/cgu`

The root `/` will redirect to `/${firstCompanySlug}` once companies are loaded.

### 4. Update Navigation Links

**AppSidebar.tsx**: All company section links use `companyPath()`:
```tsx
// Before
{ url: '/contrats', ... }
// After
{ url: companyPath('/contrats'), ... }
```

**Dashboard.tsx**: Section cards also use `companyPath()` for their links.

### 5. Company Switching with Navigation

When the user selects a different company in the sidebar dropdown:
- Update the context as before
- Navigate to `/${newSlug}` (or to the same sub-page under the new slug) using `useNavigate()`

### 6. Slug Sync on Page Load

In `CompanyProvider`, use `useParams()` to read `:companySlug` from the URL. If the slug matches a company the user belongs to, that company is selected. If it doesn't match, redirect to 404 or the first available company.

---

## Technical Details

### Database Migration SQL

```sql
ALTER TABLE companies ADD COLUMN slug text;

UPDATE companies SET slug = lower(replace(name, ' ', '-'));

ALTER TABLE companies ALTER COLUMN slug SET NOT NULL;
ALTER TABLE companies ADD CONSTRAINT companies_slug_unique UNIQUE (slug);
```

### Route Structure

```text
/:companySlug          --> Dashboard (company-scoped)
/:companySlug/entreprise
/:companySlug/contrats
/:companySlug/juridique
/:companySlug/comptabilite
/:companySlug/finance
/parametres            --> Settings (user-scoped)
/aide                  --> Help
/mentions-legales      --> Legal pages
/confidentialite
/cgu
/auth                  --> Auth (public)
```

### Key Architecture Decision

The `CompanyProvider` will need access to the URL slug. Since it wraps company-scoped routes, we'll use a layout route pattern with `useParams()` to extract `:companySlug` and sync it with the context. The provider will:
1. Fetch all user companies (as today)
2. Match the URL slug to a company
3. Set it as current
4. Redirect to the first company if the user lands on `/` with no slug

### Files to Create/Modify

- **Migration**: Add `slug` column to `companies`
- **`src/contexts/CompanyContext.tsx`**: Add slug to interface, add `companyPath()` helper, sync from URL params
- **`src/App.tsx`**: Restructure routes with `/:companySlug` prefix, add redirect from `/`
- **`src/components/layout/AppSidebar.tsx`**: Use `companyPath()` for company-section links
- **`src/pages/Dashboard.tsx`**: Use `companyPath()` for section card links
- **`src/i18n/locales/en.json`**: No change needed (text stays the same)
