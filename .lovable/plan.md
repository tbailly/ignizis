

# Ajout des mandataires sociaux aux entreprises (avec saisie date au clavier)

## Resume

Creer une table `company_officers` pour stocker les mandataires sociaux, chacun lie a une seule entreprise. L'ajout, la modification et la suppression se font directement dans la modale de creation/edition d'entreprise. Le champ date de naissance utilise une saisie clavier avec masque automatique "DD/MM/YYYY" (les `/` s'inserent automatiquement).

---

## 1. Base de donnees

### Nouvelle table `company_officers`

Colonnes :
- `id` : UUID, cle primaire, auto-generee
- `company_id` : UUID, FK vers `companies(id)` avec `ON DELETE CASCADE`
- `last_name` : TEXT, obligatoire
- `first_name` : TEXT, obligatoire
- `date_of_birth` : DATE, nullable
- `position` : TEXT, obligatoire
- `created_at` : TIMESTAMPTZ, defaut `now()`

### Policies RLS

- Admins : acces complet (SELECT, INSERT, UPDATE, DELETE)
- Membres d'une entreprise : lecture seule sur les mandataires de leur entreprise

---

## 2. Composant DateMaskInput

Un nouveau composant `src/components/ui/date-mask-input.tsx` qui :
- Utilise un `<Input>` standard avec `placeholder="DD/MM/YYYY"`
- Intercepte la frappe clavier pour inserer automatiquement les `/` apres le jour (position 2) et le mois (position 5)
- N'accepte que les chiffres (filtre les autres caracteres)
- Gere le backspace correctement (supprime le `/` automatiquement si on efface juste apres)
- Limite la saisie a 10 caracteres maximum (DD/MM/YYYY)
- Expose une `value` au format affichage "DD/MM/YYYY" et appelle `onChange` avec cette meme valeur
- La conversion vers le format ISO "YYYY-MM-DD" (pour la base de donnees) se fait dans le composant parent (`CompanyFormDialog`)

---

## 3. Interface dans CompanyFormDialog

### Section "Corporate officers"

Ajoutee apres la section "Permissions", elle contient :
- La liste des mandataires sous forme de cartes compactes, chacune avec :
  - Champs inline : Nom, Prenom, Date de naissance (avec masque DD/MM/YYYY), Position
  - Bouton supprimer (icone corbeille)
- Bouton "+ Add officer" en bas
- Message "No corporate officers added" quand la liste est vide

### Gestion du state local

```text
interface Officer {
  id: string;          // UUID reel ou "temp-xxx" pour les nouveaux
  last_name: string;
  first_name: string;
  date_of_birth: string | null;  // format affichage "DD/MM/YYYY"
  position: string;
}
```

- En mode creation : le state `officers` demarre vide
- En mode edition : les mandataires sont charges depuis la base a l'ouverture de la modale, et la date est convertie de "YYYY-MM-DD" vers "DD/MM/YYYY" pour l'affichage

### Logique de sauvegarde

Apres la sauvegarde de l'entreprise :
1. Charger les officers existants en base pour cette entreprise
2. Pour chaque officer dans le state local :
   - Si `id` commence par `temp-` : INSERT (date convertie de "DD/MM/YYYY" vers "YYYY-MM-DD")
   - Sinon : UPDATE
3. Pour chaque officer en base non present dans le state local : DELETE

### Largeur de la modale

Passe de `sm:max-w-md` a `sm:max-w-lg` pour accommoder les champs des mandataires.

---

## 4. Fichiers modifies

| Fichier | Action |
|---------|--------|
| Migration SQL | Creer table `company_officers` + RLS |
| `src/components/ui/date-mask-input.tsx` | Nouveau -- composant Input avec masque DD/MM/YYYY |
| `src/components/admin/CompanyFormDialog.tsx` | Modifier -- ajouter section mandataires, logique de sync, elargir modale |
| `src/i18n/locales/en.json` | Modifier -- ajouter cles de traduction |

---

## 5. Traductions a ajouter

```text
admin.companies.officers          -> "Corporate officers"
admin.companies.officerLastName   -> "Last name"
admin.companies.officerFirstName  -> "First name"
admin.companies.officerDob        -> "Date of birth"
admin.companies.officerPosition   -> "Position"
admin.companies.addOfficer        -> "Add officer"
admin.companies.removeOfficer     -> "Remove"
admin.companies.noOfficers        -> "No corporate officers added"
```

---

## 6. Details techniques

### Masque de saisie de date

Le composant `DateMaskInput` fonctionne ainsi :
- L'utilisateur tape des chiffres uniquement
- Apres 2 chiffres (jour), un `/` est ajoute automatiquement
- Apres 5 caracteres (jour + `/` + mois), un second `/` est ajoute
- Le backspace supprime le `/` automatiquement si le curseur est juste apres
- Format final affiche : `DD/MM/YYYY` (10 caracteres max)
- Pas de dependance externe, tout est gere via `onChange` sur un `<Input>` standard

### Conversion de date

- Affichage -> Base : `"15/03/1980"` devient `"1980-03-15"` (ISO)
- Base -> Affichage : `"1980-03-15"` devient `"15/03/1980"`
- Si la date est incomplete (moins de 10 caracteres) ou invalide, elle est enregistree comme `null` en base

### Synchronisation des mandataires

```text
1. Sauvegarder l'entreprise (insert ou update) -> recuperer company_id
2. Charger les officers existants en base pour cette company_id
3. Pour chaque officer dans le state local :
   - Si id commence par "temp-" : INSERT (sans l'id temp)
   - Sinon : UPDATE
4. Pour chaque officer en base non present dans le state local : DELETE
```

