import { createI18n } from "vue-i18n";
import de from "./locales/de.json";
import en from "./locales/en.json";
import { FALLBACK_LOCALE } from "./localizedText";

export const DEFAULT_LOCALE = FALLBACK_LOCALE;

export const i18n = createI18n({
  legacy: false,
  locale: DEFAULT_LOCALE,
  fallbackLocale: FALLBACK_LOCALE,
  messages: {
    de,
    en,
  },
});

export type AppI18n = typeof i18n;
