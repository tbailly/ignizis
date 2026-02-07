

# Internationalization (i18n) - Simple Key/Value Translation System

## Overview

Set up a lightweight translation system using local JSON files -- no external library needed. All text content will be centralized in translation files organized by language, making it easy to switch languages or add new ones without touching component code.

## Approach: Custom i18n with JSON files + React Context

Rather than adding a heavy library like `react-i18next`, we'll build a minimal system that fits the project's scale:

- One JSON file per language (e.g., `en.json`, `fr.json`)
- A React context + hook (`useTranslation`) to access translations anywhere
- A helper function `t("key.path")` that returns the translated string
- Language preference stored in localStorage (default: English)

This keeps things simple, with zero dependencies, and is easy to extend later if needed.

## File Structure

```text
src/
  i18n/
    locales/
      en.json          -- English translations (default)
      fr.json          -- French translations (for later)
    i18n.ts            -- Core logic: load locale, lookup keys
    I18nContext.tsx     -- React context + provider
    useTranslation.ts  -- Hook returning the t() function
```

## How Translation Files Will Look

Each JSON file uses nested keys organized by page/section:

```json
{
  "common": {
    "loading": "Loading...",
    "save": "Save",
    "saving": "Saving...",
    "cancel": "Cancel",
    "logout": "Log out",
    "version": "Version 1.0.0"
  },
  "auth": {
    "title": "Sign in",
    "description": "Enter your email to sign in instantly",
    "descriptionMagicLink": "Enter your email to receive a sign-in link",
    "emailLabel": "Email",
    "emailPlaceholder": "your@email.com",
    "emailInvalid": "Invalid email address",
    "submit": "Sign in",
    "submitMagicLink": "Send sign-in link",
    "checkInbox": "Check your inbox",
    "emailSentMessage": "If an account exists with this email, you will receive a sign-in link shortly.",
    "tryAnotherEmail": "Try another address",
    "loginSuccess": "Successfully signed in!",
    "userNotFound": "User not found",
    "unexpectedError": "An error occurred. Please try again."
  },
  "sidebar": {
    "navigation": "Navigation",
    "company": "Company",
    "contracts": "My contracts and invoices",
    "legal": "Legal",
    "accounting": "Accounting",
    "finance": "Finance",
    "settings": "Account settings",
    "legalNotice": "Legal notice",
    "privacyPolicy": "Privacy policy",
    "terms": "Terms of use",
    "help": "Help"
  },
  "dashboard": {
    "welcome": "Welcome",
    "noCompany": "You are not associated with any company yet.",
    "noCompanyTitle": "No company",
    "noCompanyDescription": "Contact an administrator to be added to a company.",
    "accessSections": "Access the different sections of your company",
    "noAccess": "No accessible section",
    "noAccessDescription": "You don't have permissions to access sections of this company. Contact an administrator to change your access."
  },
  "settings": {
    "title": "Account settings",
    "subtitle": "Manage your preferences and personal information.",
    "profile": "Profile",
    "personalInfo": "Your personal information",
    "email": "Email",
    "name": "Name",
    "namePlaceholder": "Your name",
    "nameUpdated": "Name updated",
    "updateError": "Error updating",
    "appearance": "Appearance",
    "appearanceDescription": "Customize the application appearance",
    "themeLight": "Light",
    "themeDark": "Dark",
    "themeSystem": "System"
  }
}
```

(Plus keys for Help, Legal Notice, Privacy Policy, Terms pages, and placeholder pages like Company, Contracts, etc.)

## Usage in Components

Before (hardcoded French):
```tsx
<h1>Connexion</h1>
<p>Entrez votre email pour recevoir un lien de connexion</p>
```

After (using translation keys):
```tsx
const { t } = useTranslation();
<h1>{t("auth.title")}</h1>
<p>{t("auth.descriptionMagicLink")}</p>
```

## Implementation Steps

1. **Create the i18n infrastructure** (`i18n.ts`, `I18nContext.tsx`, `useTranslation.ts`)
2. **Create `en.json`** with all text currently in the app, translated to English
3. **Wrap the app** with `I18nProvider` in `App.tsx`
4. **Update all pages and components** to use `t()` instead of hardcoded strings:
   - `Auth.tsx` -- login form labels, messages, toasts
   - `AppSidebar.tsx` -- menu items, dropdown labels
   - `Dashboard.tsx` -- titles, descriptions, empty states
   - `Parametres.tsx` -- settings labels, theme names, toasts
   - `Entreprise.tsx`, `Contrats.tsx`, `Juridique.tsx`, `Comptabilite.tsx`, `Finance.tsx` -- page titles and placeholder text
   - `Aide.tsx` -- FAQ content, contact section
   - `MentionsLegales.tsx`, `Confidentialite.tsx`, `CGU.tsx` -- legal page content
   - `NotFound.tsx` -- 404 text
   - Zod validation messages in `Auth.tsx`

## Technical Details

- **Key lookup**: dot-notation path resolution on nested JSON objects (e.g., `t("auth.title")` resolves `translations.auth.title`)
- **Fallback**: if a key is missing, the key itself is returned (makes it obvious what needs translating)
- **Language storage**: `localStorage` key `app_language`, defaults to `"en"`
- **No URL-based routing**: language is a user preference, not a URL segment
- **Type safety**: a TypeScript type can be generated from the JSON structure for autocomplete (optional, can be added later)

