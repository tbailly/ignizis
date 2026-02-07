
# Company Transition Loading Screen

## Overview

When switching from one company to another, a full-screen loading overlay will appear over the main content area, giving a clear visual signal that the user is "changing universe." This transition will be slightly deliberate (minimum duration) so it feels intentional, and later can mask real API calls behind it.

## What the User Will See

1. User clicks on a different company in the sidebar dropdown
2. The main content area fades out and is replaced by a centered loading animation showing the new company's initial + name
3. After a short delay (~600ms minimum), the content fades back in with the new company's dashboard
4. The sidebar remains visible and stable throughout -- only the content area transitions

## Visual Design

The loading screen will feature:
- A subtle fade-in animation over the content area
- The new company's initial letter in a large circle (matching the sidebar style)
- The company name below it
- A smooth progress bar or spinner underneath
- A fade-out transition when loading completes

## Implementation

### 1. Add a `switching` state to CompanyContext

Add a new boolean `switching` to the context that is set to `true` when `setCurrentCompany` is called with a different company, and back to `false` after a minimum delay (e.g., 600ms). This gives components a way to react to the transition.

**Changes to `CompanyContext.tsx`:**
- Add `switching: boolean` to `CompanyContextType`
- In `setCurrentCompany`, when the company actually changes:
  - Set `switching = true`
  - Update the current company
  - After a `setTimeout` of ~600ms, set `switching = false`
- Expose `switching` in the context value

### 2. Create a `CompanyTransition` component

A new component `src/components/CompanyTransition.tsx` that renders a loading overlay when `switching` is `true`.

**What it shows:**
- Full-size overlay covering the main content area (not the sidebar)
- Animated fade-in/out using CSS transitions or Tailwind `animate-` classes
- Company initial in a large circle (primary color)
- Company name text
- A subtle loading indicator (e.g., a pulsing dot or the Progress component)

### 3. Integrate into MainLayout

In `MainLayout.tsx`, wrap the `{children}` area with the transition component:
- When `switching` is `true`, show the `CompanyTransition` overlay instead of (or on top of) the children
- When `switching` is `false`, show the normal content with a fade-in

### 4. Add i18n key

Add a `"common.loading"` or `"common.switchingCompany"` translation key for the loading text (the key already exists as `"common.loading": "Loading..."`; we can add a more specific one like `"Switching company..."`).

### 5. CSS animations

Add Tailwind keyframes/animations in `index.css` or use existing `tailwindcss-animate` utilities:
- `animate-in` / `animate-out` fade effects
- A subtle scale effect for the company initial

## Files to Create/Modify

- **Create `src/components/CompanyTransition.tsx`** -- the loading overlay component
- **Edit `src/contexts/CompanyContext.tsx`** -- add `switching` state with minimum delay timer
- **Edit `src/components/layout/MainLayout.tsx`** -- integrate the transition overlay in the content area
- **Edit `src/i18n/locales/en.json`** -- add `"common.switchingCompany"` translation key
- **Edit `tailwind.config.ts`** (if needed) -- add custom animation keyframes

## Technical Details

### CompanyContext changes

```typescript
const [switching, setSwitching] = useState(false);

const setCurrentCompany = useCallback((company: UserCompany) => {
  if (company.company_id === currentCompanyRef.current?.company_id) return;
  setSwitching(true);
  setCurrentCompanyState(company);
  localStorage.setItem(CURRENT_COMPANY_KEY, company.company_id);
  setTimeout(() => setSwitching(false), 600);
}, []);
```

A ref is used to avoid stale closures in the comparison.

### CompanyTransition component structure

```
+----------------------------------+
|                                  |
|         [ A ]  (large circle)    |
|     "Acme Corporation"           |
|     ------progress------         |
|                                  |
+----------------------------------+
```

The component reads `switching` and `currentCompany` from context. It uses `AnimatePresence`-style logic (CSS-based, no extra library) to fade in when `switching` becomes true and fade out when it becomes false.

### MainLayout integration

The transition overlay is positioned absolutely within the content area, so the sidebar is never affected. When `switching` is true, the overlay appears on top of `{children}`. When false, it fades out and children are interactive again.
