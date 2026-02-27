

## Supprimer la page Admin Dashboard + simplifier la sidebar

### 1. `App.tsx` — Rediriger `/admin` vers `/admin/companies`

Remplacer `<Route index element={<AdminDashboard />} />` par `<Route index element={<Navigate to="/admin/companies" replace />} />`. Supprimer l'import `AdminDashboard`.

### 2. `AdminDashboard.tsx` — Supprimer le fichier

Le fichier `src/pages/admin/AdminDashboard.tsx` n'est plus utilisé.

### 3. `AppSidebar.tsx` — Restructurer la sidebar

- Supprimer le wrapper `SidebarGroup` / `SidebarGroupLabel("Navigation")` autour des menu items métier : les `SidebarMenuItem` restent directement dans un `SidebarMenu` au niveau du `SidebarContent`.
- Dans le groupe Administration, supprimer l'entrée "Admin" (lien vers `/admin`) qui faisait doublon avec le dashboard supprimé. Garder uniquement les sous-pages (companies, users, officers, documents, requests).

### Résumé

| Fichier | Modification |
|---------|-------------|
| `App.tsx` | `Navigate to="/admin/companies"` au lieu de `AdminDashboard` |
| `AdminDashboard.tsx` | Supprimé |
| `AppSidebar.tsx` | Retirer groupe "Navigation", retirer lien "/admin" dans groupe Admin |

