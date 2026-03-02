

## Fix: focus outline cropped on form inputs inside modals

### Problem
The scrollable `div` (`overflow-y-auto flex-1 min-h-0`) in each admin dialog clips the focus ring of inputs because there's no horizontal padding on that wrapper. The `focus-visible:ring-2` + `ring-offset-2` extends 4px outside the input, but the overflow container cuts it.

### Solution
Add `px-1` to the scrollable wrapper `div` in every admin dialog. This gives just enough space (4px) for the focus ring without visually changing the layout.

### Files to modify

All admin dialogs — same one-line change on the scrollable wrapper:

| File | Change |
|------|--------|
| `CompanyFormDialog.tsx` | `overflow-y-auto flex-1 min-h-0` → `overflow-y-auto flex-1 min-h-0 px-1` |
| `OfficerFormDialog.tsx` | same |
| `RequestFormDialog.tsx` | same |
| `UserFormDialog.tsx` | same |
| `DocumentEditDialog.tsx` | same |
| `DocumentUploadDialog.tsx` | same |
| `TagManagementDialog.tsx` | same |

No other changes needed.

