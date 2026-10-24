"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultLocale = exports.supportedLocales = exports.i18n = void 0;
exports.i18n = {
    t: (key, params) => {
        if (params) {
            return key;
        }
        const parts = key.split('.');
        return parts[parts.length - 1] || key;
    },
    changeLanguage: async (lng) => { },
    getResource: (lng, ns, key) => undefined,
};
exports.supportedLocales = ['ky', 'ru', 'en'];
exports.defaultLocale = 'ru';
