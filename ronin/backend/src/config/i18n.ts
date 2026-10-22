import i18next from 'i18next';
import Backend from 'i18next-http-backend';
import { i18n } from 'i18next';

const supportedLocales = ['ky', 'ru', 'en'] as const;
type Locale = typeof supportedLocales[number];

const defaultLocale: Locale = 'ru';

const i18nInstance = i18next.createInstance();

i18nInstance
  .use(Backend)
  .init({
    fallbackLng: defaultLocale,
    supportedLngs: supportedLocales,
    ns: ['common', 'auth', 'booking', 'computers', 'tariffs', 'characters', 'errors', 'validation'],
    defaultNS: 'common',
    fallbackNS: 'common',
    backend: {
      loadPath: './locales/{{lng}}.json',
    },
    interpolation: {
      escapeValue: false,
    },
    lng: defaultLocale,
  });

export { i18nInstance as i18n, supportedLocales, defaultLocale };

export type { Locale };
