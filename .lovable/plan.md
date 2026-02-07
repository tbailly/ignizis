

# Passage en mode magic link avec protection contre l'enumeration d'emails

## Objectif

Passer exclusivement en mode magic link et empecher la revelation de l'existence d'un email : que l'utilisateur existe ou non, l'ecran affiche toujours "Verifiez votre boite mail".

---

## 1. Nouvelle edge function `check-user-exists`

Fichier : `supabase/functions/check-user-exists/index.ts`

- Recoit `{ email }` en POST
- Interroge la table `public.users` avec le service role
- Retourne `{ exists: true/false }`
- Sans verification JWT (l'utilisateur n'est pas encore connecte)

Cette fonction permet de savoir cote serveur si l'email existe, sans reveler cette information a l'utilisateur.

## 2. Configuration

Fichier : `supabase/config.toml`

Ajouter :
```text
[functions.check-user-exists]
verify_jwt = false
```

## 3. Simplification de `Auth.tsx`

Le flux `onSubmit` devient :

```text
1. Appeler check-user-exists avec l'email
2. Si l'utilisateur existe :
   - Appeler signInWithOtp (envoi du magic link)
3. Si l'utilisateur n'existe pas :
   - Ne rien faire (pas de signInWithOtp = pas de creation de compte)
4. Dans les deux cas :
   - Afficher l'ecran "Verifiez votre boite mail" (identique)
```

Suppressions :
- Variable `isAutoConfirmEnabled` et la reference a `VITE_AUTOCONFIRM`
- Fonction `handleAutoLogin` entiere
- Toute la logique conditionnelle auto-confirm dans le JSX
- Les textes conditionnels (description, bouton) : on utilise uniquement les variantes magic link

Le bouton affiche toujours "Send sign-in link" et la description est toujours "Enter your email to receive a sign-in link".

## 4. Fichiers concernes

| Fichier | Action |
|---------|--------|
| `supabase/functions/check-user-exists/index.ts` | Nouveau |
| `supabase/config.toml` | Ajouter entree `check-user-exists` |
| `src/pages/Auth.tsx` | Simplifier : retirer auto-confirm, ajouter verification silencieuse |

## 5. Details techniques

### Edge function `check-user-exists`

```text
POST /check-user-exists
Body: { "email": "user@example.com" }
Response: { "exists": true } ou { "exists": false }
```

Utilise `supabase.from('users').select('id').eq('email', email).maybeSingle()` pour eviter les erreurs si l'email n'existe pas.

### Securite

- L'ecran "Verifiez votre boite mail" est identique que l'email existe ou non : aucune fuite d'information
- `signInWithOtp` n'est jamais appele pour un email inconnu : aucun compte ne sera cree
- Les logs serveur enregistrent la tentative pour un email inexistant (utile pour le monitoring)

