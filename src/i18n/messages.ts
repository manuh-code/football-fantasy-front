// Aggregates the modular per-domain dictionaries into the vue-i18n `messages`
// object. Each domain JSON lives under src/locales/{es,en}/<domain>.json and is
// mounted under its own namespace (e.g. `auth.login.title`).

import esCommon from '@/locales/es/common.json'
import esErrors from '@/locales/es/errors.json'
import esUi from '@/locales/es/ui.json'
import esAuth from '@/locales/es/auth.json'
import esUser from '@/locales/es/user.json'
import esHome from '@/locales/es/home.json'
import esFantasy from '@/locales/es/fantasy.json'
import esFootball from '@/locales/es/football.json'
import esPool from '@/locales/es/pool.json'
import esPwa from '@/locales/es/pwa.json'
import esLegal from '@/locales/es/legal.json'
import esDashboard from '@/locales/es/dashboard.json'
import esOnboarding from '@/locales/es/onboarding.json'
import esLanding from '@/locales/es/landing.json'
import esSurvivor from '@/locales/es/survivor.json'
import esGuides from '@/locales/es/guides.json'

import enCommon from '@/locales/en/common.json'
import enErrors from '@/locales/en/errors.json'
import enUi from '@/locales/en/ui.json'
import enAuth from '@/locales/en/auth.json'
import enUser from '@/locales/en/user.json'
import enHome from '@/locales/en/home.json'
import enFantasy from '@/locales/en/fantasy.json'
import enFootball from '@/locales/en/football.json'
import enPool from '@/locales/en/pool.json'
import enPwa from '@/locales/en/pwa.json'
import enLegal from '@/locales/en/legal.json'
import enDashboard from '@/locales/en/dashboard.json'
import enOnboarding from '@/locales/en/onboarding.json'
import enLanding from '@/locales/en/landing.json'
import enSurvivor from '@/locales/en/survivor.json'
import enGuides from '@/locales/en/guides.json'

export const messages = {
  es: {
    common: esCommon,
    errors: esErrors,
    ui: esUi,
    auth: esAuth,
    user: esUser,
    home: esHome,
    fantasy: esFantasy,
    football: esFootball,
    pool: esPool,
    pwa: esPwa,
    legal: esLegal,
    dashboard: esDashboard,
    onboarding: esOnboarding,
    landing: esLanding,
    survivor: esSurvivor,
    guides: esGuides,
  },
  en: {
    common: enCommon,
    errors: enErrors,
    ui: enUi,
    auth: enAuth,
    user: enUser,
    home: enHome,
    fantasy: enFantasy,
    football: enFootball,
    pool: enPool,
    pwa: enPwa,
    legal: enLegal,
    dashboard: enDashboard,
    onboarding: enOnboarding,
    landing: enLanding,
    survivor: enSurvivor,
    guides: enGuides,
  },
} as const
