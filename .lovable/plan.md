

# Restriction des entreprises inactives pour les non-admins

## Vue d'ensemble

Deux changements principaux :
1. Les utilisateurs non-admin ne voient et n'accedent qu'aux entreprises **actives**
2. Les admins voient **toutes** les entreprises (actives et inactives, avec ou sans utilisateurs associes) dans le selecteur

---

## 1. Modifier `CompanyContext.tsx` : logique de chargement conditionnelle

Le `fetchCompanies` actuel passe par `user_companies` avec jointure sur `companies`. Cela ne permet pas aux admins de voir les entreprises sans association utilisateur.

### Pour les non-admins :
- Garder la requete actuelle via `user_companies`
- Ajouter un filtre `.eq('company.status', 'active')` ou filtrer cote client les entreprises inactives

### Pour les admins :
- Requeter directement la table `companies` (toutes les entreprises)
- Construire des objets `UserCompany` synthetiques avec `company_id = company.id`
- Dedupliquer pour ne pas avoir de doublons (une entreprise avec plusieurs utilisateurs n'apparait qu'une fois)

Le contexte a besoin d'acceder a `isAdmin` depuis `AuthContext` pour choisir la bonne strategie.

---

## 2. Protection de l'acces URL (`CompanySlugSync` dans `App.tsx`)

Actuellement, si un non-admin tape manuellement l'URL d'une entreprise inactive, il peut y acceder si elle est dans sa liste `companies`.

Avec le filtre cote `CompanyContext`, les entreprises inactives ne seront plus dans la liste du non-admin. Le `CompanySlugSync` redirigera donc automatiquement vers la premiere entreprise valide si le slug ne correspond a rien dans `companies` (comportement existant ligne 68-69).

Aucune modification supplementaire necessaire dans `App.tsx`.

---

## 3. Indicateur visuel pour les entreprises inactives (selecteur admin)

Dans `AppSidebar.tsx`, pour le selecteur d'entreprises :
- Ajouter un badge "Inactive" a cote du nom des entreprises dont le `status !== 'active'`
- Necessite d'ajouter `status` au type `Company` dans `CompanyContext`

---

## 4. Ajout du champ `status` au type Company

Le type `Company` dans `CompanyContext` ne contient pas `status`. Il faut l'ajouter pour :
- Filtrer les inactives cote client (non-admins)
- Afficher le badge inactive dans le selecteur (admins)

---

## Resume des fichiers modifies

| Fichier | Modification |
|---------|-------------|
| `src/contexts/CompanyContext.tsx` | Ajouter `status` au type Company, importer `useAuth`/`isAdmin`, separer la logique de chargement admin vs non-admin, filtrer les inactives pour les non-admins |
| `src/components/layout/AppSidebar.tsx` | Afficher un badge "Inactive" dans le selecteur pour les entreprises inactives |

Aucune migration SQL necessaire. Les politiques RLS existantes (`Admins have full select on companies`) permettent deja aux admins de lire toutes les entreprises directement.

---

## Detail technique

### CompanyContext - fetchCompanies refactorise

```text
si isAdmin:
  1. SELECT * FROM companies ORDER BY name
  2. Construire UserCompany[] avec id = company.id (synthetique)
sinon:
  1. SELECT via user_companies JOIN companies
  2. Filtrer: garder uniquement status === 'active'
```

### AppSidebar - selecteur

```text
Pour chaque entreprise dans le dropdown:
  - Afficher le nom
  - Si status !== 'active': ajouter Badge "Inactive" (variant outline, texte discret)
```

