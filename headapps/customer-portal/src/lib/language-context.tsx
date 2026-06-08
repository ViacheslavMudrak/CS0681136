"use client";

import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState
} from "react";

interface Language {
  code: string;
  name: string;
  country: string;
  locale: string;
}

export const languages: Language[] = [
  {
    code: "en",
    name: "English (US)",
    country: "United States",
    locale: "en-US"
  },
  { code: "es", name: "Español", country: "España", locale: "es-ES" },
  { code: "fr", name: "Français", country: "France", locale: "fr-FR" },
  { code: "de", name: "Deutsch", country: "Deutschland", locale: "de-DE" },
  { code: "zh", name: "中文", country: "China", locale: "zh-CN" }
];

interface LanguageContextType {
  currentLanguage: Language;
  setLanguage: (language: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [currentLanguage, setCurrentLanguageState] = useState<Language>(
    languages[0]
  );

  useEffect(() => {
    // Sync with URL locale first (if available), then fallback to localStorage
    if (typeof window !== "undefined") {
      // If no URL locale, load saved language preference from localStorage
      const savedLanguage = localStorage.getItem("preferred-language");
      if (savedLanguage) {
        const lang = languages.find((l) => l.code === savedLanguage);
        if (lang) {
          setCurrentLanguageState(lang);
        }
      }
    }
  }, []);

  const setLanguage = (language: Language) => {
    setCurrentLanguageState(language);
    localStorage.setItem("preferred-language", language.code);
    // Trigger a custom event for language change
    window.dispatchEvent(
      new CustomEvent("languagechange", { detail: language })
    );
  };

  return (
    <LanguageContext.Provider value={{ currentLanguage, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  const [currentLanguage, setCurrentLanguageState] = useState<Language>(
    languages[0]
  );

  React.useEffect(() => {
    // Sync with URL locale first (if available), then fallback to localStorage
    if (typeof window !== "undefined") {
      // If no URL locale, load saved language preference from localStorage
      const savedLanguage = localStorage.getItem("preferred-language");
      if (savedLanguage) {
        const lang = languages.find((l) => l.code === savedLanguage);
        if (lang) {
          setCurrentLanguageState(lang);
        }
      }
    }
  }, []);

  const setLanguage = (language: Language) => {
    setCurrentLanguageState(language);
    localStorage.setItem("preferred-language", language.code);
    window.dispatchEvent(
      new CustomEvent("languagechange", { detail: language })
    );
  };

  if (context) {
    return context;
  }

  return { currentLanguage, setLanguage };
}
