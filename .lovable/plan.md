

## Plan : Bannière d'alerte compliance officers

### Objectif

Afficher une bannière d'alerte destructive en haut de la page Company listant chaque document manquant ou expiré par officer, avec un appel à envoyer les documents à `compliance@idkapital.com`. Pas de distinction missing/expired dans l'affichage.

### Fichiers modifiés

| Fichier | Modification |
|---------|-------------|
| `src/pages/Entreprise.tsx` | Enrichir l'interface `Officer` avec `passport_document_id`, `secondary_id_document_id`, `power_of_attorney_document_id` et les `expires_at` joints. Modifier la requête pour récupérer ces champs + jointures documents. Ajouter une bannière `Alert` destructive avant la grille si des problèmes existent. |
| `src/i18n/locales/en.json` | Ajouter clés : `company.complianceAlertTitle`, `company.complianceAlertMessage`, `company.docPassport`, `company.docSecondaryId`, `company.docPowerOfAttorney` |

### Logique

Pour chaque officer, vérifier les 3 documents (Passport, Secondary ID, Power of Attorney) :
- Document ID null → problème
- Document `expires_at` null ou dans le passé → problème

Générer une liste plate d'éléments `"LASTNAME Firstname : Document Name"`. Si la liste est non vide, afficher la bannière.

### Bannière

```text
⚠ Compliance issues detected

Please send the following documents to compliance@idkapital.com

• DUPONT Jean : Passport
• DUPONT Jean : Power of Attorney  
• MARTIN Marie : Secondary ID
```

Utilise le composant `Alert` existant avec `variant="destructive"`, icône `AlertTriangle`, et un lien `mailto:compliance@idkapital.com`.

