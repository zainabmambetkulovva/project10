import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

const supportedLocales = ['ky', 'ru', 'en'] as const;
type Locale = typeof supportedLocales[number];

const defaultLocale: Locale = 'ru';

const i18nInstance = i18n.use(Backend).use(LanguageDetector).use(initReactI18next);

i18nInstance.init({
  fallbackLng: defaultLocale,
  supportedLngs: supportedLocales,
  ns: ['common', 'auth', 'booking', 'computers', 'tariffs', 'characters', 'errors', 'validation', 'receipts', 'notifications', 'payments', 'refunds', 'ai'],
  defaultNS: 'common',
  fallbackNS: 'common',
  backend: {
    loadPath: '/locales/{{lng}}.json',
  },
  interpolation: {
    escapeValue: false,
  },
  detection: {
    order: ['localStorage', 'navigator'],
    caches: ['localStorage'],
  },
});

export { i18nInstance as i18n, supportedLocales, defaultLocale };
export type { Locale };

export default i18nInstance;
