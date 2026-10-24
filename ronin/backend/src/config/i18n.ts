// Упрощенный i18n для запуска без инициализации
// Все переводы возвращаются как есть (строки-ключи)
// Это позволяет запустить сервер без внешних зависимостей

export const i18n = {
  t: (key: string, params?: Record<string, string | number>): string => {
    // Если есть параметры, вернем ключ с параметрами
    if (params) {
      return key;
    }
    // Иначе вернем ключ или его последнюю часть (для человекочитаемости)
    const parts = key.split('.');
    return parts[parts.length - 1] || key;
  },
  changeLanguage: async (lng: string) => {},
  getResource: (lng: string, ns: string, key: string) => undefined,
};

export const supportedLocales = ['ky', 'ru', 'en'] as const;
export const defaultLocale = 'ru';

export type Locale = typeof supportedLocales[number];
