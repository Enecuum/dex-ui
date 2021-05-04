import i18n from "i18next";
import Backend from "i18next-xhr-backend";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    backend: {
      loadPath: "./locales/{{lng}}/translation.json"
    },
    load: 'currentOnly',
    fallbackLng: "en",
    debug: true,
    ns: ['translation'],
    defaultNS: 'translation',
    keySeparator: ".",
    interpolation: {
      escapeValue: false
    },

    react: {
      wait: true,
      bindI18n: 'loaded languageChanged ',
      useSuspense: true
    }
  });

export default i18n;