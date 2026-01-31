
# Portail Multi-Entreprises - Plan de développement (mis à jour)

## Vue d'ensemble
Application de gestion documentaire multi-entreprises avec authentification par magic link, permettant aux utilisateurs de naviguer entre leurs différentes entreprises et accéder à diverses sections métier.

---

## Phase 1 : Fondations et authentification ✅ TERMINÉE

### Base de données ✅
- Table `companies` pour stocker les entreprises
- Table `users` pour les utilisateurs (nom, email, préférences)
- Table `user_companies` pour lier utilisateurs et entreprises avec leurs permissions par section (entreprise, contrats, juridique, comptabilité, finance)
- Table `user_roles` pour la gestion des rôles (préparation de la future interface admin)

### Authentification par Magic Link ✅
- Page de connexion avec champ email uniquement
- Intégration Resend pour l'envoi des emails avec template personnalisé
- Page de confirmation générique (même message que l'email existe ou non)
- Configuration des tokens : access token 30 min, refresh token 14 jours

### Gestion des sessions ✅
- **Supabase Auth natif** : utilisation directe de `@supabase/supabase-js` sans librairie additionnelle
- Tokens JWT gérés automatiquement par Supabase (access/refresh)
- `onAuthStateChange` pour la synchronisation de l'état d'authentification
- Stockage automatique en localStorage avec refresh transparent
- Support multi-sessions sur plusieurs appareils (géré nativement par Supabase)

---

## Phase 2 : Interface utilisateur et navigation ✅ TERMINÉE

### Menu / Sidebar ✅
- **Desktop** : Sidebar fixe de 280px sur la gauche
- **Mobile** : Barre discrète en haut avec icône menu, sidebar slide-in sur 3/4 de l'écran, overlay sombre pour fermer

### Contenu du menu ✅
1. **Sélecteur multi-entreprises** (header) - Dropdown type Notion pour basculer entre entreprises
2. **Sections principales** (affichées selon permissions) :
   - Entreprise
   - Mes contrats et factures
   - Juridique
   - Comptabilité
   - Finance
3. **Sélecteur Compte** (footer) avec dropdown :
   - Paramètres du compte
   - Pages légales
   - Version du site
   - Page d'aide
   - Déconnexion

### Thème visuel ✅
- Design professionnel et sobre avec couleurs neutres
- Support du mode clair et mode sombre avec toggle dans les paramètres

---

## Phase 3 : Pages de contenu ✅ TERMINÉE

### Pages placeholder pour chaque section ✅
- Entreprise : page avec titre et message d'attente de contenu
- Contrats et factures : idem
- Juridique : idem
- Comptabilité : idem
- Finance : idem

### Pages légales (avec contenu placeholder) ✅
- Conditions Générales d'Utilisation
- Politique de confidentialité
- Mentions légales

### Pages utilitaires ✅
- Paramètres du compte
- Page d'aide
- Page 404

---

## Fonctionnalités clés incluses

✅ Authentification magic link sécurisée via Resend  
✅ Gestion des sessions avec Supabase Auth natif (standard)  
✅ Permissions par section stockées dans le token  
✅ Changement d'entreprise fluide (type Notion)  
✅ Menu responsive desktop/mobile  
✅ Mode clair et sombre  
✅ Pages légales prêtes à compléter  
✅ Architecture préparée pour l'admin (à ajouter plus tard)

---

## Technologies utilisées
- **Frontend** : React + TypeScript + Tailwind CSS
- **Backend** : Lovable Cloud avec Supabase
- **Sessions** : Supabase Auth (`@supabase/supabase-js`)
- **Emails** : Resend avec templates React Email
- **UI** : Shadcn/ui avec composant Sidebar

---

## Configuration requise

### Secrets configurés ✅
- `RESEND_API_KEY` - Clé API Resend pour l'envoi des emails
- `SEND_EMAIL_HOOK_SECRET` - Secret pour le webhook d'envoi d'email

### À configurer manuellement
1. **Domaine Resend** : Remplacer `noreply@YOUR-VERIFIED-DOMAIN.com` dans `supabase/functions/send-magic-link/index.ts` par votre domaine vérifié sur Resend
2. **Webhook Auth** : Configurer le webhook d'authentification dans le dashboard Supabase pour appeler l'edge function `send-magic-link`

---

## Prochaines étapes suggérées

1. Configurer le webhook d'authentification Supabase
2. Vérifier le domaine sur Resend
3. Créer des données de test (entreprises, utilisateurs)
4. Implémenter l'interface d'administration (future phase)
