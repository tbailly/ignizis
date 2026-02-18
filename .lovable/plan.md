

# Affichage des sections verrouillees pour les entreprises sans permission

## Vue d'ensemble

Actuellement, les onglets "Legal", "Accounting" et "Finance" sont masques dans le menu si l'entreprise n'a pas la permission correspondante. L'objectif est de les afficher en permanence, avec un indicateur visuel de verrouillage, et d'afficher un contenu specifique (page "option non activee") lorsque l'utilisateur clique dessus sans avoir la permission.

---

## 1. Modifications du menu lateral (`AppSidebar.tsx`)

- Remplacer `visibleMenuItems` (filtre par permission) par la liste complete `menuItems`
- Pour chaque item, verifier `hasPermission(item.permission)` :
  - Si autorise : affichage normal (comme aujourd'hui)
  - Si verrouille : appliquer une opacite reduite (`opacity-50`), ajouter une icone cadenas (`Lock` de lucide-react) a droite du label, le lien reste cliquable et pointe vers la meme route

---

## 2. Pages avec contenu conditionnel (`Juridique.tsx`, `Comptabilite.tsx`, `Finance.tsx`)

Chaque page verifiera `hasPermission` depuis le `CompanyContext` :

- **Si autorise** : affichage du contenu actuel (inchange)
- **Si verrouille** : affichage d'un ecran "option non activee" avec :
  - Icone cadenas grande taille
  - Titre : "Option non activee" (traduit)
  - Description : "Cette fonctionnalite n'est pas incluse dans votre offre actuelle. Contactez votre administrateur pour l'activer."
  - Pas de bouton d'action (simple information)

---

## 3. Dashboard (`Dashboard.tsx`)

- Afficher toutes les sections (pas seulement les autorisees)
- Les cartes sans permission auront :
  - Une opacite reduite + icone cadenas dans le coin
  - Un badge "Non actif" sur la carte
  - Le lien reste cliquable (redirige vers la page avec le contenu verrouille)

---

## 4. Traductions (`en.json`)

Ajouter les cles suivantes :

- `common.locked` : "Not active"
- `common.lockedTitle` : "Option not activated"
- `common.lockedDescription` : "This feature is not included in your current plan. Contact your administrator to activate it."

---

## 5. Resume des fichiers modifies

| Fichier | Modification |
|---------|-------------|
| `src/components/layout/AppSidebar.tsx` | Afficher tous les items, ajouter icone Lock + opacite pour les verrouilles |
| `src/pages/Juridique.tsx` | Ajouter verification de permission, afficher contenu verrouille si non autorise |
| `src/pages/Comptabilite.tsx` | Idem |
| `src/pages/Finance.tsx` | Idem |
| `src/pages/Dashboard.tsx` | Afficher toutes les cartes, marquer visuellement les verrouillees |
| `src/i18n/locales/en.json` | Ajouter les traductions pour l'etat verrouille |

Aucune migration SQL necessaire. Les routes existent deja, seul le contenu change selon les permissions.

