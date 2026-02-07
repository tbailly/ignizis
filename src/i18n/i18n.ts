export type Translations = Record<string, unknown>;

const STORAGE_KEY = 'app_language';
const DEFAULT_LANGUAGE = 'en';

let currentTranslations: Translations = {};
let currentLanguage: string = DEFAULT_LANGUAGE;

function getNestedValue(obj: unknown, path: string): string | undefined {
  const keys = path.split('.');
  let current: unknown = obj;
  for (const key of keys) {
    if (current === null || current === undefined || typeof current !== 'object') {
      return undefined;
    }
    current = (current as Record<string, unknown>)[key];
  }
  return typeof current === 'string' ? current : undefined;
}

export function t(key: string): string {
  return getNestedValue(currentTranslations, key) ?? key;
}

export function getLanguage(): string {
  return currentLanguage;
}

export function getSavedLanguage(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) || DEFAULT_LANGUAGE;
  } catch {
    return DEFAULT_LANGUAGE;
  }
}

export function saveLanguage(lang: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    // localStorage not available
  }
}

export async function loadTranslations(lang: string): Promise<Translations> {
  const modules = import.meta.glob('./locales/*.json', { eager: true }) as Record<string, { default: Translations }>;
  const path = `./locales/${lang}.json`;
  const module = modules[path];
  
  if (!module) {
    console.warn(`Translation file for "${lang}" not found, falling back to "${DEFAULT_LANGUAGE}"`);
    const fallback = modules[`./locales/${DEFAULT_LANGUAGE}.json`];
    if (fallback) {
      currentTranslations = fallback.default || fallback;
      currentLanguage = DEFAULT_LANGUAGE;
      return currentTranslations;
    }
    return {};
  }
  
  currentTranslations = module.default || module;
  currentLanguage = lang;
  return currentTranslations;
}
