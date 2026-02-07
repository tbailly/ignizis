
# Role Administrateur Global

## Vue d'ensemble

Ajouter un role "admin" global (non lie a une entreprise) via la table `user_roles` existante. Les utilisateurs avec ce role auront acces aux pages `/admin`. Les utilisateurs normaux ne verront rien de different.

## Etat actuel de `user_roles`

La table existe deja avec la bonne structure :
- `user_id` (uuid, not null)
- `company_id` (uuid, **nullable** -- parfait pour un role global)
- `role` (text)
- RLS : une seule policy `false` sur ALL -- tout est bloque

Elle est vide et inutilisee. On va l'adapter plutot que la recreer.

## Ce qui change

### 1. Base de donnees

**a) Creer une fonction `is_admin`** (security definer)

```sql
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
      AND role = 'admin'
      AND company_id IS NULL
  );
$$;
```

Cette fonction verifie si un utilisateur a le role `admin` global (sans `company_id`). Etant `SECURITY DEFINER`, elle contourne le RLS et peut etre appelee depuis d'autres policies ou depuis le frontend via un appel RPC.

**b) Mettre a jour les policies RLS de `user_roles`**

Supprimer la policy actuelle (`false` sur ALL) et la remplacer par :
- **SELECT** : un utilisateur peut voir ses propres roles (`user_id = auth.uid()`)
- **INSERT / UPDATE / DELETE** : restreint aux admins uniquement (via `is_admin(auth.uid())`)

**c) Ajouter un index** sur `(user_id, role)` pour la performance de `is_admin`.

### 2. AuthContext -- exposer `isAdmin`

Modifier `AuthContext.tsx` pour :
- Ajouter un booleen `isAdmin` au contexte
- Apres le fetch du profil, appeler `supabase.rpc('is_admin', { _user_id: userId })` pour determiner le statut admin
- Exposer `isAdmin` dans le contexte pour que toute l'app puisse le lire

### 3. Routes `/admin`

Dans `App.tsx` :
- Ajouter un groupe de routes `/admin` protege par un composant `AdminRoute`
- Route initiale : `/admin` affichant un dashboard admin placeholder

```text
/admin          --> AdminDashboard (admin-only)
/admin/...      --> futures pages admin
```

### 4. Composant `AdminRoute`

Creer `src/components/AdminRoute.tsx` :
- Lit `isAdmin` depuis `useAuth()`
- Si `isAdmin` est `false`, redirige vers `/` (ou affiche un 403)
- Si `true`, affiche les enfants

### 5. Page Admin placeholder

Creer `src/pages/admin/AdminDashboard.tsx` avec un contenu minimal :
- Titre "Administration"
- Message indiquant que c'est la zone admin
- Utilisera le meme `MainLayout` (sidebar) pour l'instant

### 6. Lien Admin dans la sidebar

Dans `AppSidebar.tsx` :
- Ajouter conditionnellement un lien "Administration" (avec une icone `Shield`) dans la navigation, visible uniquement si `isAdmin` est `true`
- Ce lien pointe vers `/admin`

### 7. Traductions (i18n)

Ajouter dans `en.json` :
```json
"admin": {
  "title": "Administration",
  "dashboard": "Admin Dashboard",
  "description": "Platform administration and management."
},
"sidebar": {
  ...
  "admin": "Administration"
}
```

## Fichiers concernes

- **Migration SQL** : fonction `is_admin`, mise a jour des policies RLS de `user_roles`, index
- **`src/contexts/AuthContext.tsx`** : ajouter `isAdmin` au contexte + appel RPC
- **`src/components/AdminRoute.tsx`** (nouveau) : garde de route admin
- **`src/pages/admin/AdminDashboard.tsx`** (nouveau) : page admin placeholder
- **`src/App.tsx`** : ajouter les routes `/admin`
- **`src/components/layout/AppSidebar.tsx`** : lien conditionnel "Administration"
- **`src/i18n/locales/en.json`** : cles de traduction admin

## Details techniques

### Pourquoi garder `user_roles` ?

La table a deja :
- `company_id` nullable : un role avec `company_id IS NULL` est un role global -- exactement ce qu'il faut pour "admin"
- `role` en `text` : flexible, on peut ajouter d'autres roles plus tard sans migration d'enum
- Des foreign keys vers `users` et `companies`

Il suffit de corriger le RLS (actuellement tout bloque) et d'ajouter la fonction `is_admin`.

### Securite

- Le statut admin est **toujours verifie cote serveur** via la fonction `is_admin` (security definer)
- Le frontend lit `isAdmin` pour l'affichage conditionnel (sidebar, routes), mais la vraie protection est au niveau RLS
- Les futures tables admin auront des policies du type `is_admin(auth.uid())`
- Aucun stockage du role dans le profil utilisateur ou dans le localStorage

### Attribution du role admin

Pour le moment, l'attribution se fait manuellement via une insertion directe dans `user_roles` :

```sql
INSERT INTO user_roles (user_id, role)
VALUES ('uuid-de-l-utilisateur', 'admin');
```

Un admin existant pourra aussi le faire via l'app une fois les pages admin construites.
