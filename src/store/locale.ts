import { defineStore } from 'pinia'
import { setI18nLocale, DEFAULT_LOCALE, type AppLocale } from '@/i18n'

export const useLocaleStore = defineStore('locale', {
  state: () => ({
    locale: DEFAULT_LOCALE as AppLocale,
  }),
  actions: {
    setLocale(locale: AppLocale) {
      this.locale = locale
      setI18nLocale(locale)
    },
  },
  persist: {
    storage: localStorage,
    pick: ['locale'],
  },
})
