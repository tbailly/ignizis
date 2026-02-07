import { createContext, useCallback, useEffect, useState } from 'react';
import { t as translate, loadTranslations, getSavedLanguage, saveLanguage, getLanguage } from './i18n';

interface I18nContextType {
  t: (key: string) => string;
  language: string;
  setLanguage: (lang: string) => void;
  ready: boolean;
}

export const I18nContext = createContext<I18nContextType>({
  t: (key: string) => key,
  language: 'en',
  setLanguage: () => {},
  ready: false,
});

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState(getSavedLanguage);
  const [ready, setReady] = useState(false);
  const [, setVersion] = useState(0); // Force re-render when translations load

  useEffect(() => {
    loadTranslations(language).then(() => {
      setReady(true);
      setVersion(v => v + 1);
    });
  }, [language]);

  const setLanguage = useCallback((lang: string) => {
    saveLanguage(lang);
    setLanguageState(lang);
    setReady(false);
  }, []);

  const t = useCallback((key: string) => translate(key), [ready]);

  return (
    <I18nContext.Provider value={{ t, language, setLanguage, ready }}>
      {children}
    </I18nContext.Provider>
  );
}
