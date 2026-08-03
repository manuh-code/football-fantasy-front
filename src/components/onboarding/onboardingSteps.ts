// Definiciones de pasos para la visita guiada. Cada paso solo declara su icono
// (oh-vue-icons), una variante de color y las claves i18n de título/cuerpo; el
// texto vive en src/locales/{es,en}/onboarding.json. El componente OnboardingTour
// se encarga de traducir y renderizar las diapositivas.

export type OnboardingVariant = 'emerald' | 'blue' | 'amber' | 'red'

export interface OnboardingStep {
  icon: string // nombre de oh-vue-icon (ej. 'hi-solid-collection')
  variant: OnboardingVariant
  titleKey: string // clave i18n del título
  bodyKey: string // clave i18n del cuerpo
}

// Guía del Home (el hub de juego): qué es la app, los tres modos —fantasy,
// quinielas y Survivor—, dónde quedaron los datos de liga y la navegación.
// El orden es deliberado: los juegos primero, los datos después.
export const HOME_STEPS: OnboardingStep[] = [
  {
    icon: 'md-sportssoccer',
    variant: 'emerald',
    titleKey: 'onboarding.home.step1.title',
    bodyKey: 'onboarding.home.step1.body',
  },
  {
    icon: 'bi-trophy-fill',
    variant: 'blue',
    titleKey: 'onboarding.home.step2.title',
    bodyKey: 'onboarding.home.step2.body',
  },
  {
    icon: 'hi-solid-document-text',
    variant: 'emerald',
    titleKey: 'onboarding.home.step3.title',
    bodyKey: 'onboarding.home.step3.body',
  },
  {
    icon: 'hi-solid-shield-check',
    variant: 'red',
    titleKey: 'onboarding.home.step4.title',
    bodyKey: 'onboarding.home.step4.body',
  },
  {
    icon: 'hi-solid-chart-bar',
    variant: 'amber',
    titleKey: 'onboarding.home.step5.title',
    bodyKey: 'onboarding.home.step5.body',
  },
  {
    icon: 'hi-solid-user-circle',
    variant: 'emerald',
    titleKey: 'onboarding.home.step6.title',
    bodyKey: 'onboarding.home.step6.body',
  },
]

// Guía de la quiniela: qué es, pestañas, cómo predecir y clasificación/invitar.
export const POOL_STEPS: OnboardingStep[] = [
  {
    icon: 'bi-trophy-fill',
    variant: 'emerald',
    titleKey: 'onboarding.pool.step1.title',
    bodyKey: 'onboarding.pool.step1.body',
  },
  {
    icon: 'hi-solid-clipboard-list',
    variant: 'blue',
    titleKey: 'onboarding.pool.step2.title',
    bodyKey: 'onboarding.pool.step2.body',
  },
  {
    icon: 'hi-solid-plus-circle',
    variant: 'amber',
    titleKey: 'onboarding.pool.step3.title',
    bodyKey: 'onboarding.pool.step3.body',
  },
  {
    icon: 'hi-solid-share',
    variant: 'emerald',
    titleKey: 'onboarding.pool.step4.title',
    bodyKey: 'onboarding.pool.step4.body',
  },
]
