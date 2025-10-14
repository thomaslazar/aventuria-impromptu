export const SUPPORTED_LOCALES = ["de", "en"] as const;

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export const FALLBACK_LOCALE: SupportedLocale = "de";

export interface InlineLocalizedText {
  de: string;
  en?: string;
}

export interface MessageDescriptor {
  key: string;
  params?: Record<string, unknown>;
  fallback?: string;
}

export type LocalizedText = string | InlineLocalizedText | MessageDescriptor;

export type LocalizedTextFactory = () => LocalizedText | null;

export function createInlineLocalizedText(
  de: string,
  en?: string,
): InlineLocalizedText {
  return { de, en };
}

export function isInlineLocalizedText(
  value: LocalizedText,
): value is InlineLocalizedText {
  return typeof value === "object" && value !== null && "de" in value;
}

export function isMessageDescriptor(
  value: LocalizedText,
): value is MessageDescriptor {
  return typeof value === "object" && value !== null && "key" in value;
}

export interface ResolveOptions {
  t: (key: string, params?: Record<string, unknown>) => string;
  locale: string;
  fallbackLocale?: string;
}

export function resolveInlineText(
  record: InlineLocalizedText,
  locale: string,
): string {
  if (locale in record) {
    const candidate = record[locale as keyof InlineLocalizedText];
    if (typeof candidate === "string" && candidate.length > 0) {
      return candidate;
    }
  }
  return record.de;
}

export function resolveLocalizedText(
  text: LocalizedText | null | undefined,
  options: ResolveOptions,
): string | null {
  if (text == null) {
    return null;
  }

  if (typeof text === "string") {
    return text;
  }

  if (isInlineLocalizedText(text)) {
    return resolveInlineText(text, options.locale);
  }

  if (isMessageDescriptor(text)) {
    try {
      const translated = options.t(text.key, text.params);
      if (translated === text.key && text.fallback) {
        return text.fallback;
      }
      return translated;
    } catch {
      return text.fallback ?? text.key;
    }
  }

  return null;
}

export function getFallbackText(
  text: LocalizedText | null | undefined,
): string | null {
  if (text == null) {
    return null;
  }

  if (typeof text === "string") {
    return text;
  }

  if (isInlineLocalizedText(text)) {
    return text.de;
  }

  if (isMessageDescriptor(text)) {
    return text.fallback ?? text.key;
  }

  return null;
}
