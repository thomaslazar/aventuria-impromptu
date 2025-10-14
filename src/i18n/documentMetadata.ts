import { watchEffect } from "vue";
import type { AppI18n } from "./index";

const updateDocumentMetadata = (
  locale: string,
  translate: AppI18n["global"]["t"],
) => {
  document.documentElement.setAttribute("lang", locale);
  document.title = translate("app.browserTitle");
};

export const bindDocumentMetadata = (i18n: AppI18n) => {
  const { locale, t } = i18n.global;

  updateDocumentMetadata(locale.value, t);

  const stop = watchEffect(() => {
    updateDocumentMetadata(locale.value, t);
  });

  return () => {
    stop();
  };
};

export const __testUtils = {
  updateDocumentMetadata,
};
