'use client';

import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';

export type Locale = 'ar' | 'en';

const STORAGE_KEY = 'king2:locale';

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

function readStoredLocale(): Locale {
  if (typeof window === 'undefined') return 'ar';
  return window.localStorage.getItem(STORAGE_KEY) === 'en' ? 'en' : 'ar';
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const { status } = useSession();
  const [locale, setLocaleState] = useState<Locale>('ar');

  useEffect(() => {
    setLocaleState(readStoredLocale());
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
  }, [locale]);

  useEffect(() => {
    if (status !== 'authenticated') return;

    // If the user already has a stored preference, respect it over the API
    const stored = readStoredLocale();

    fetch('/api/settings')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.language === 'ar' || data?.language === 'en') {
          // Only apply API value when there's no existing local preference
          if (!window.localStorage.getItem(STORAGE_KEY)) {
            setLocaleState(data.language);
            window.localStorage.setItem(STORAGE_KEY, data.language);
          }
        }
      })
      .catch(() => {
        setLocaleState(readStoredLocale());
      });
  }, [status]);

  const value = useMemo<LocaleContextValue>(() => ({
    locale,
    setLocale: (nextLocale) => {
      setLocaleState(nextLocale);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(STORAGE_KEY, nextLocale);
      }
    },
  }), [locale]);

  return (
    <LocaleContext.Provider value={value}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error('useLocale must be used inside LocaleProvider');
  }
  return context;
}
