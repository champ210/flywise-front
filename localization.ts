// FIX: The Language type is exported from the auth store, not the main App component.
import { Language } from './stores/useAuthStore';

const translations = {
  en: {
    // Add translations here
  },
  fr: {
    // Add translations here
  },
  ar: {
    // Add translations here
  },
};

type TranslationKey = keyof typeof translations['en'];

export const getTranslator = (language: Language) => {
  return (key: TranslationKey): string => {
    return translations[language][key] || translations['en'][key];
  };
};