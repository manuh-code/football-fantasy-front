import { createI18n } from 'vue-i18n'
import { messages } from './messages'

export type AppLocale = 'es' | 'en'

export const SUPPORTED_LOCALES: AppLocale[] = ['es', 'en']
export const DEFAULT_LOCALE: AppLocale = 'es'

export const i18n = createI18n({
  legacy: false, // Composition API mode
  globalInjection: true, // enables $t in templates without importing
  locale: DEFAULT_LOCALE, // default Spanish
  fallbackLocale: 'en', // fall back to English when a key is missing
  messages,
})

// Apply a locale to the i18n instance and the document <html lang>.
// Keep this as the single place that mutates the active locale.
export function setI18nLocale(locale: AppLocale): void {
  i18n.global.locale.value = locale
  document.documentElement.setAttribute('lang', locale)
}

// Translate outside of a component context (composables, interceptors, etc.)
export function t(key: string, params?: Record<string, unknown>): string {
  return i18n.global.t(key, params ?? {})
}
