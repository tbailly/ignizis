

# New Admin Tab: Corporate Officers

## Overview

Add a new "Corporate Officers" page at `/admin/officers` following the same patterns as the existing Users and Companies admin pages. The page displays all officers across all companies in a table with edit and delete capabilities.

## Changes

### 1. New page: `src/pages/admin/AdminOfficers.tsx`

A new page following the same structure as `AdminUsers.tsx`:
- Header with icon (UserCheck from lucide) and title
- Search bar filtering by full name, position, or company name
- Table with columns: Full name (first_name + last_name), Company, Date of birth (DD/MM/YYYY format), Position, Actions (edit + delete buttons)
- Data fetched via react-query from `company_officers` joined with `companies` for the company name

### 2. New component: `src/components/admin/OfficerFormDialog.tsx`

A dialog for editing an officer (similar to `UserFormDialog`):
- Fields: First name, Last name, Date of birth (using `DateMaskInput`), Position, Company (read-only display or select)
- Calls `supabase.from('company_officers').update(...)` on save

### 3. New component: `src/components/admin/DeleteOfficerDialog.tsx`

A simple confirmation dialog (similar to `DeleteUserDialog`, without slug confirmation):
- Shows officer name and asks for confirmation
- Calls `supabase.from('company_officers').delete().eq('id', ...)`

### 4. Routing: `src/App.tsx`

Add route: `<Route path="officers" element={<AdminOfficers />} />`

### 5. Sidebar: `src/components/layout/AppSidebar.tsx`

Add a new admin menu item "Corporate Officers" pointing to `/admin/officers`

### 6. Translations: `src/i18n/locales/en.json`

Add keys under `sidebar.adminOfficers` and `admin.officers.*` for title, search placeholder, column headers, empty state, delete confirmation, etc.

## Technical Details

### Data fetching in `AdminOfficers.tsx`

```text
1. Fetch all company_officers (id, first_name, last_name, date_of_birth, position, company_id)
2. Fetch all companies (id, name) for display
3. Join client-side to attach company name to each officer
4. Filter by search term across full name, position, company name
```

### Table columns

| Column | Content |
|--------|---------|
| Full name | `${first_name} ${last_name}` |
| Company | Company name (Badge) |
| Date of birth | DD/MM/YYYY format |
| Position | Text |
| Actions | Edit (Pencil) + Delete (Trash2) icons |

### OfficerFormDialog

- Edit-only dialog (creation is done via the CompanyFormDialog)
- Fields: first_name, last_name, date_of_birth (DateMaskInput), position
- Company name displayed as read-only info
- Uses same `displayToIso`/`isoToDisplay` helpers as CompanyFormDialog

### DeleteOfficerDialog

- Simple AlertDialog with confirmation text
- No slug confirmation needed (unlike companies)
- Deletes via `supabase.from('company_officers').delete().eq('id', officerId)`

### Files summary

| File | Action |
|------|--------|
| `src/pages/admin/AdminOfficers.tsx` | Create |
| `src/components/admin/OfficerFormDialog.tsx` | Create |
| `src/components/admin/DeleteOfficerDialog.tsx` | Create |
| `src/App.tsx` | Add route |
| `src/components/layout/AppSidebar.tsx` | Add sidebar item |
| `src/i18n/locales/en.json` | Add translation keys |

