

## Affichage compact des corporate officers + indicateur de compliance

### Modifications

**Fichier : `src/pages/Entreprise.tsx`**

1. Ajouter `is_compliant` a l'interface `Officer` et au SELECT de la query
2. Remplacer l'affichage en grille 2x2 (avec labels) par un format compact sur 3 lignes :
   - Ligne 1 : **LAST_NAME** First_name (nom en majuscules, prenom en casse normale)
   - Ligne 2 : Position
   - Ligne 3 : Date de naissance au format "September 1990" (mois en anglais + annee, via `date-fns` `format(date, 'MMMM yyyy')`)
3. Ajouter un indicateur de compliance a cote du nom :
   - Badge vert "Compliant" si `is_compliant === true`
   - Badge rouge "Non-compliant" si `is_compliant === false`
4. Remplacer la fonction `isoToDisplay` par une fonction `isoToMonthYear` qui utilise `date-fns` pour formater en "MMMM yyyy"

### Rendu visuel cible

```text
+----------------------------------------------+
| DUPONT Jean              [Compliant]         |
| Director                                      |
| September 1990                                |
+----------------------------------------------+
| MARTIN Sophie            [Non-compliant]     |
| Secretary                                     |
| March 1985                                    |
+----------------------------------------------+
```

### Detail technique

- Import `format` et `parseISO` depuis `date-fns`
- Import `Badge` depuis `@/components/ui/badge` (deja importe)
- Import des cles i18n existantes : `admin.officers.compliant` / `admin.officers.nonCompliant`
- Le `last_name` sera affiche en `.toUpperCase()`
- Le `first_name` garde sa casse d'origine (premiere lettre majuscule)
- Les separateurs entre officers sont conserves

