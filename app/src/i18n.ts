import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import pt from "./locales/pt.json";
import en from "./locales/en.json";

const resources = {
  pt: { translation: pt },
  en: { translation: en },
} as const;

// Lê o idioma salvo no localStorage, senão usa 'pt' como padrão
const savedLanguage = localStorage.getItem("language") as "pt" | "en" | null;
const initialLanguage = savedLanguage ?? "pt";

i18n.use(initReactI18next).init({
  resources,
  lng: initialLanguage,
  fallbackLng: "pt",
  interpolation: {
    escapeValue: false, // React já faz escaneamento de XSS
  },
});

export default i18n;
