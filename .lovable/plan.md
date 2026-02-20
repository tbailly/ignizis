
## Module "Requests" — Kanban pour les administrateurs (plan révisé)

### Changement par rapport au plan précédent
Le Realtime est **supprimé**. La notification de changement de statut est désormais un simple toast `sonner` déclenché côté client juste après que le `UPDATE` Supabase a réussi — sans abonnement WebSocket. C'est plus simple et tout aussi efficace pour un usage admin.

---

### 1. Dépendances à installer

`@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`

Ces trois packages sont la référence pour le drag-and-drop en React 18 : accessibilité clavier native, support tactile, léger, sans dépendance externe.

---

### 2. Migration base de données

Nouvelle table `public.requests` :

```sql
CREATE TABLE public.requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'new',
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);
```

Valeurs de `status` (6 colonnes du Kanban) :
- `new` → Nouvelle demande
- `quote_pending` → En attente de validation du devis
- `in_progress` → Travail en cours
- `client_response` → En attente de réponse client
- `invoiced` → Facturé
- `done` → Terminé

La colonne `position` (integer) gère le tri vertical au sein de chaque colonne.

**Trigger `updated_at`** — réutilise la fonction `update_updated_at_column()` existante.

**RLS (admins uniquement)** — 4 policies SELECT/INSERT/UPDATE/DELETE avec `is_admin(auth.uid())`.

**Realtime** — activé sur la table pour les invalidations de query React Query (pas de toast Realtime).

---

### 3. Nouveaux fichiers

#### `src/pages/admin/AdminRequests.tsx`
Page principale :
- Header avec titre "Requests" + bouton "New request" (icône `Plus`)
- `useQuery` pour charger toutes les requests + les companies (pour le dropdown)
- Rendu conditionnel de `RequestFormDialog` (création)
- Rendu de `KanbanBoard`

#### `src/components/admin/KanbanBoard.tsx`
Wrapper `@dnd-kit` :
- `DndContext` avec `PointerSensor` + `KeyboardSensor`
- `onDragEnd` distingue deux cas :
  - **Inter-colonne** : `UPDATE requests SET status = $newStatus, position = $endPosition WHERE id = $id` → toast "Statut mis à jour"
  - **Intra-colonne** : batch `UPDATE` des positions de toutes les cartes de la colonne réordonnée
- `DragOverlay` pour l'aperçu visuel pendant le drag
- 6 `KanbanColumn` en scroll horizontal

#### `src/components/admin/KanbanColumn.tsx`
- Reçoit `status`, `label`, liste des requests filtrées/triées par `position ASC`
- `useDroppable` pour accepter les drops inter-colonnes
- `SortableContext` (stratégie `verticalListSortingStrategy`) pour le tri intra-colonne
- Badge avec le nombre de cartes

#### `src/components/admin/KanbanCard.tsx`
- `useSortable` de `@dnd-kit/sortable`
- Affiche : titre, nom de l'entreprise, description (2 lignes max)
- **Clic sur la carte** → ouvre `RequestFormDialog` en mode édition
- Icône `GripVertical` comme poignée de drag
- Bouton suppression (icône `Trash2`) avec `AlertDialog` de confirmation

#### `src/components/admin/RequestFormDialog.tsx`
Dialog création/édition unifié (même pattern que `OfficerFormDialog`) :
- `request?: RequestData` optionnel — absent = mode création
- Champs :
  - `title` (Input, requis)
  - `description` (Textarea, optionnel)
  - `company_id` — combobox searchable (même pattern que `DocumentSelect`) — requis
  - `status` — Select avec les 6 valeurs, **visible en mode édition uniquement** (à la création, status = `new` automatiquement)
- Lors du save en mode édition, si le `status` a changé → toast `sonner` "Status updated: [nouveau statut]"

---

### 4. Logique de persistance de l'ordre

**Création** d'une request :
- `position = MAX(position) + 1` dans la colonne `new`, calculé côté client avant l'INSERT

**Drag intra-colonne** (réordonnement vertical) :
- `arrayMove` de `@dnd-kit/sortable` pour recalculer l'ordre localement
- Mise à jour optimiste de l'état local (fluidité visuelle immédiate)
- Batch UPDATE en base : `UPDATE requests SET position = i WHERE id = id_i` pour chaque carte de la colonne

**Drag inter-colonne** (changement de statut) :
- UPDATE unique : `status = newStatus` + `position = MAX(position dans colonne cible) + 1`
- Toast `sonner` : "Status updated → [label de la nouvelle colonne]"

**Affichage** : toujours trié par `position ASC` dans chaque colonne.

---

### 5. Fichiers modifiés

**`src/App.tsx`**
- Import `AdminRequests`
- Route `<Route path="requests" element={<AdminRequests />} />` dans le groupe `/admin`

**`src/components/layout/AppSidebar.tsx`**
- Import `Kanban` depuis `lucide-react`
- Nouveau `SidebarMenuItem` dans le groupe Admin (après Documents) : route `/admin/requests`, icône `Kanban`, label `t('sidebar.adminRequests')`

**`src/pages/admin/AdminDashboard.tsx`**
- Nouvelle card "Requests" avec icône `Kanban` et route `/admin/requests`

**`src/i18n/locales/en.json`**

Nouvelles clés :
```json
"sidebar.adminRequests": "Requests"

"admin.requestsCard": "Requests"
"admin.requestsCardDesc": "Manage and track requests"

"admin.requests": {
  "title": "Requests",
  "create": "New request",
  "createDesc": "Fill in the request details.",
  "edit": "Edit request",
  "editDesc": "Update the request.",
  "titleField": "Title",
  "titlePlaceholder": "Request title...",
  "descriptionField": "Description",
  "descriptionPlaceholder": "Describe the request...",
  "company": "Company",
  "companyPlaceholder": "Search and select a company...",
  "status": "Status",
  "saveSuccess": "Request saved",
  "createSuccess": "Request created",
  "deleteSuccess": "Request deleted",
  "deleteConfirmTitle": "Delete request",
  "deleteConfirmDesc": "This action is irreversible. The following request will be permanently deleted:",
  "deleteConfirmButton": "Delete permanently",
  "noRequests": "No requests",
  "statusChanged": "Status updated",
  "columns": {
    "new": "New request",
    "quote_pending": "Awaiting quote validation",
    "in_progress": "Work in progress",
    "client_response": "Awaiting client response",
    "invoiced": "Invoiced",
    "done": "Done"
  }
}
```

---

### Récapitulatif des fichiers

| Fichier | Action |
|---|---|
| Migration SQL | Table `requests` + trigger + RLS |
| `src/pages/admin/AdminRequests.tsx` | Nouveau — page principale |
| `src/components/admin/KanbanBoard.tsx` | Nouveau — DnD context + logique ordre |
| `src/components/admin/KanbanColumn.tsx` | Nouveau — colonne droppable + sortable |
| `src/components/admin/KanbanCard.tsx` | Nouveau — carte sortable + clic édition |
| `src/components/admin/RequestFormDialog.tsx` | Nouveau — dialog création/édition |
| `src/App.tsx` | +1 route `/admin/requests` |
| `src/components/layout/AppSidebar.tsx` | +1 item "Requests" |
| `src/pages/admin/AdminDashboard.tsx` | +1 card "Requests" |
| `src/i18n/locales/en.json` | Nouvelles clés i18n |

Dépendances à installer : `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`
