export declare const i18n: {
    t: (key: string, params?: Record<string, string | number>) => string;
    changeLanguage: (lng: string) => Promise<void>;
    getResource: (lng: string, ns: string, key: string) => undefined;
};
export declare const supportedLocales: readonly ["ky", "ru", "en"];
export declare const defaultLocale = "ru";
export type Locale = typeof supportedLocales[number];
//# sourceMappingURL=i18n.d.ts.map