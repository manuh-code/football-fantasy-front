import { createRouter, createWebHistory, RouteRecordRaw, RouteLocationNormalized } from 'vue-router'
import { useAuthStore } from '@/store/auth/useAuthStore'
import { useFootballLeagueStore } from '@/store/football/league/useFootballLeagueStore'

// For anonymous visitors (and search/AdSense crawlers) we auto-select the first
// league returned by the API so public content is reachable without forcing the
// selection screen. Deduped across navigations; retries on a later attempt if it fails.
let defaultLeaguePromise: Promise<boolean> | null = null
async function ensureDefaultLeague(
  store: ReturnType<typeof useFootballLeagueStore>
): Promise<boolean> {
  if (store.existLeague()) return true
  if (!defaultLeaguePromise) {
    defaultLeaguePromise = (async () => {
      try {
        // Lazy import: importing CatalogService at the top level instantiates its
        // singleton (which calls useApiFantasy → imports the router) during module
        // evaluation, creating a startup-crashing circular dependency. Loading it
        // here defers instantiation until runtime, after everything is initialized.
        const { default: catalogService } = await import('@/services/catalog/CatalogService')
        const leagues = await catalogService.getFootballLeagues()
        if (Array.isArray(leagues) && leagues.length > 0) {
          store.setLeague(leagues[0])
          return true
        }
      } catch (e) {
        console.error('Failed to set a default league:', e)
      }
      defaultLeaguePromise = null
      return false
    })()
  }
  return defaultLeaguePromise
}

// Routes that do NOT require a selected football league. Everything else is
// gated: without a selected league the user is redirected to the league
// selection page and cannot leave it until one is chosen.
const LEAGUE_EXEMPT_ROUTES = new Set([
  'login',
  'register',
  'GoogleCallback',
  'not-found',
  'footballLeagues',
  'privacy',
  'landingpage',
  'about',
  'guides',
  'guideDetail',
  // El hub de juego (`/`, alias `/gaming`) es indexable y está prerenderizado:
  // no debe depender de que la API de ligas responda. La vista solo lista los
  // tres modos y navega a otras rutas — esas sí piden liga cuando toca.
  // Ver scripts/prerender.mjs.
  'home',
])

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    // Hub de modos de juego: fantasy, quinielas y Survivor. La raíz es el
    // producto (jugar), no el consumo de datos — los datos de liga viven en
    // `leagueOverview`.
    //
    // `/gaming` se conserva como alias, no como redirección: era la URL del hub
    // y sigue indexada con su HTML prerenderizado (dist/gaming/index.html). Un
    // alias la mantiene sirviendo ese estático a los crawlers y montando el hub
    // cuando entra el JS, sin romper enlaces ni marcadores existentes.
    alias: '/gaming',
    name: 'home',
    component: () => import(/* webpackChunkName: "home" */ '@/views/HomeView.vue'),
    meta: {
      title: 'Fantasy MX — Juega fantasy, quinielas y Survivor gratis',
      description: 'Juega gratis con tus amigos: fantasy con draft en vivo, quinielas de marcador exacto y Survivor por eliminación, en Liga MX, Premier League, LaLiga, Serie A y Bundesliga.',
      requiresAuth: false
    }
  },
  {
    path: '/liga',
    name: 'leagueOverview',
    // Posiciones, partidos, estadísticas, versus, TOTW y fichajes. Estuvo en `/`
    // hasta que la raíz pasó a ser el hub de juego; hereda tal cual las
    // metaetiquetas de aquella ruta para no perder el posicionamiento que ya
    // tenía en "posiciones y resultados en vivo".
    component: () => import(/* webpackChunkName: "league-overview" */ '@/views/football/LeagueOverviewView.vue'),
    meta: {
      title: 'Fantasy MX — Posiciones, resultados y estadísticas en vivo',
      description: 'Sigue en vivo las posiciones, resultados y estadísticas de la Liga MX, Premier League, LaLiga, Serie A y Bundesliga, y juega fantasy, quinielas y Survivor gratis.',
      requiresAuth: false
    }
  },
  {
    path: '/landingpage',
    name: 'landingpage',
    // Public marketing page aimed at acquiring new users (anonymous-friendly).
    component: () => import(/* webpackChunkName: "landingpage" */ '@/views/landing/LandingView.vue'),
    // Estos dos valores deben coincidir con `meta` en src/locales/es/landing.json:
    // el prerender sirve ese texto al crawler y el guard sobrescribe con este
    // otro al montar la app. Si divergen, Google ve un título antes de ejecutar
    // el JS y otro después.
    meta: {
      title: 'Fantasy MX — Fantasy de Liga MX gratis, quinielas y Survivor',
      description: 'Juega fantasy de Liga MX gratis: draft en vivo, quinielas de marcador exacto y Survivor con tus amigos. También Premier, LaLiga, Serie A y Bundesliga.',
      requiresAuth: false
    }
  },
  {
    path: '/about',
    name: 'about',
    // Route level code-splitting for better performance
    component: () => import(/* webpackChunkName: "about" */ '@/views/AboutView.vue'),
    meta: {
      title: 'Acerca de Fantasy MX — Fantasy, quinielas y Survivor de 5 grandes ligas',
      description: 'Conoce Fantasy MX: sigue en vivo la Liga MX, Premier League, LaLiga, Serie A y Bundesliga, arma tu fantasy con draft en tiempo real, crea quinielas y juega Survivor. Gratis.',
      requiresAuth: false
    }
  },
  {
    path: '/login',
    name: 'login',
    // Route level code-splitting for better performance
    component: () => import(/* webpackChunkName: "login" */ '@/views/login/LoginView.vue'),
    meta: {
      title: 'Sign In - Football Fantasy',
      description: 'Sign in to your Football Fantasy account',
      requiresAuth: false
    }
  },
  {
    path: '/auth/google/callback', // Debe coincidir con lo que pusiste en Google Cloud
    name: 'GoogleCallback',
    component: () => import('../views/login/GoogleCallback.vue')
  },
  {
    path: '/register',
    name: 'register',
    // Route level code-splitting for better performance
    component: () => import(/* webpackChunkName: "register" */ '@/views/user/store/UserStoreView.vue'),
    meta: {
      title: 'Create Account - Football Fantasy',
      description: 'Create your Football Fantasy account',
      requiresAuth: false
    }
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    // Route level code-splitting for better performance
    component: () => import(/* webpackChunkName: "dashboard" */ '@/views/dashboard/DashboardView.vue'),
    meta: {
      title: 'Dashboard - Football Fantasy',
      description: 'Football Fantasy dashboard with your team overview and statistics',
      requiresAuth: true
    }
  },
  {
    path: '/profile',
    name: 'profile',
    // Route level code-splitting for better performance
    component: () => import(/* webpackChunkName: "profile" */ '@/views/user/ProfileView.vue'),
    meta: {
      title: 'Profile - Football Fantasy',
      description: 'View and manage your Football Fantasy profile information',
      requiresAuth: true
    }
  },
  {
    path: '/settings',
    name: 'userSettings',
    component: () => import(/* webpackChunkName: "user-settings" */ '@/views/user/settings/UserSettingsView.vue'),
    meta: {
      title: 'Settings - Football Fantasy',
      description: 'Manage your account settings',
      requiresAuth: true
    }
  },
  {
    path: '/settings/system',
    name: 'system-settings',
    component: () => import(/* webpackChunkName: "system-settings" */ '@/views/user/settings/SystemSettingsView.vue'),
    meta: {
      title: 'System Settings - Football Fantasy',
      description: 'Customize appearance and system preferences',
      requiresAuth: true
    }
  },
  {
    path: '/premium',
    name: 'subscription',
    component: () => import(/* webpackChunkName: "subscription" */ '@/views/user/billing/SubscriptionView.vue'),
    meta: {
      title: 'Premium - Football Fantasy',
      description: 'Subscribe to Football Fantasy Premium',
      requiresAuth: true
    }
  },
  {
    path: '/payment/methods',
    name: 'payment-methods',
    component: () => import(/* webpackChunkName: "payment-methods" */ '@/views/user/billing/PaymentMethodsView.vue'),
    meta: {
      title: 'Payment Methods - Football Fantasy',
      description: 'Manage the cards saved in your Football Fantasy account',
      requiresAuth: true
    }
  },
  {
    // Stripe's `return_url` after an off-site authentication step (3DS). It
    // registers the confirmed SetupIntent and bounces to the list.
    path: '/payment/methods/callback',
    name: 'payment-methods-callback',
    component: () => import(/* webpackChunkName: "payment-methods-callback" */ '@/views/user/billing/PaymentMethodCallbackView.vue'),
    meta: {
      title: 'Payment Methods - Football Fantasy',
      description: 'Confirming your payment method',
      requiresAuth: true
    }
  },
  {
    path: '/change/password',
    name: 'change-password',
    // Route level code-splitting for better performance
    component: () => import(/* webpackChunkName: "change-password" */ '@/views/user/password/ChangePasswordView.vue'),
    meta: {
      title: 'Change Password - Football Fantasy',
      description: 'Update your account password',
      requiresAuth: true
    }
  },
  {
    path: '/favorite/football/team',
    name: 'favorite-football-team',
    // Route level code-splitting for better performance
    component: () => import(/* webpackChunkName: "favorite-team" */ '@/views/user/favoriteTeam/FavoriteTeamView.vue'),
    meta: {
      title: 'Favorite Football Team - Football Fantasy',
      description: 'Select your favorite football team',
      requiresAuth: true
    }
  },
  {
    path: '/my/fantasy/leagues',
    name: 'userFantasyLeague',
    // Route level code-splitting for better performance
    component: () => import(/* webpackChunkName: "user-fantasy-leagues" */ '@/views/user/fantasy/UserFantasyLeagueView.vue'),
    meta: {
      title: 'My Fantasy Leagues - Football Fantasy',
      description: 'View and manage your fantasy football leagues',
      requiresAuth: true
    }
  },
  {
    path: '/fantasy/league/:uuid',
    name: 'fantasyLeagueDetail',
    // Route level code-splitting for better performance
    component: () => import(/* webpackChunkName: "fantasy-league-detail" */ '@/views/fantasy/FantasyLeagueDetailView.vue'),
    meta: {
      title: 'Fantasy League Details - Football Fantasy',
      description: 'View detailed information about a fantasy football league',
      requiresAuth: true
    }
  },
  {
    // The trades tab lives in fantasyLeagueDetail behind a ?tab= query param,
    // but the backend's push-notification deep link points at this path
    // segment (see SendTradeNotificationJob) — redirect it to the real route.
    path: '/fantasy/league/:uuid/trades',
    redirect: (to) => ({ name: 'fantasyLeagueDetail', params: { uuid: to.params.uuid }, query: { tab: 'trades' } }),
  },
  {
    path: '/fantasy/league/:uuid/team/create',
    name: 'fantasyTeamCreate',
    component: () => import(/* webpackChunkName: "fantasy-team-create" */ '@/views/fantasy/FantasyTeamUserView.vue'),
    meta: {
      title: 'Create Team - Football Fantasy',
      description: 'Create your fantasy team with a custom shield',
      requiresAuth: true
    }
  },
  {
    path: '/fantasy/league/:uuid/draft',
    name: 'playersToDraft',
    // Route level code-splitting for better performance
    component: () => import(/* webpackChunkName: "players-to-draft" */ '@/views/user/fantasy/PlayersToDraftView.vue'),
    meta: {
      title: 'Draft Players - Football Fantasy',
      description: 'Select players to build your fantasy team',
      requiresAuth: true
    }
  },
  {
    path: '/fantasy/mock-draft',
    name: 'mockDraftSetup',
    component: () => import(/* webpackChunkName: "mock-draft-setup" */ '@/views/user/fantasy/MockDraftSetupView.vue'),
    meta: {
      title: 'Mock Draft - Football Fantasy',
      description: 'Ensaya tu draft fantasy contra bots: prueba estrategias, descubre el valor de cada jugador y ve qué se queda disponible en cada ronda.',
      requiresAuth: true
    }
  },
  {
    path: '/fantasy/mock-draft/:uuid',
    name: 'mockDraftRoom',
    component: () => import(/* webpackChunkName: "mock-draft-room" */ '@/views/user/fantasy/MockDraftRoomView.vue'),
    meta: {
      title: 'Mock Draft - Football Fantasy',
      description: 'Sala de mock draft: practica tus selecciones contra equipos automáticos.',
      requiresAuth: true
    }
  },
  {
    path: '/fantasy/league/:uuid/search-players',
    name: 'searchPlayerFantasy',
    component: () => import(/* webpackChunkName: "search-player-fantasy" */ '@/views/user/fantasy/SearchPlayerFantasyView.vue'),
    meta: {
      title: 'Search Players - Football Fantasy',
      description: 'Search and add players to your fantasy team',
      requiresAuth: true
    }
  },
  {
    path: '/leagues',
    name: 'footballLeagues',
    // Route level code-splitting for better performance
    component: () => import(/* webpackChunkName: "football-leagues" */ '@/views/football/leagues/FootballLeagueSelectionView.vue'),
    meta: {
      title: 'Select League - Football Fantasy',
      description: 'Select the football league you want to follow',
      requiresAuth: false
    }
  },
  {
    path: '/pools',
    name: 'pools',
    // Route level code-splitting for better performance
    component: () => import(/* webpackChunkName: "pools" */ '@/views/pool/PoolView.vue'),
    meta: {
      title: 'Pools - Football Fantasy',
      description: 'View the pools you are participating in',
      requiresAuth: true
    }
  },
  {
    path: '/pools/:uuid',
    name: 'poolGroup',
    // Route level code-splitting for better performance
    component: () => import(/* webpackChunkName: "pool-group" */ '@/views/pool/PoolGroupView.vue'),
    meta: {
      title: 'Pool Group - Football Fantasy',
      description: 'View your pool group details, predictions and standings',
      requiresAuth: true
    }
  },
  {
    path: '/survivor',
    name: 'survivor',
    // Route level code-splitting for better performance
    component: () => import(/* webpackChunkName: "survivor" */ '@/views/survivor/SurvivorView.vue'),
    meta: {
      title: 'Survivor - Football Fantasy',
      description: 'View the Survivor games you are participating in',
      requiresAuth: true
    }
  },
  {
    path: '/survivor/:uuid',
    name: 'survivorDetail',
    // Route level code-splitting for better performance
    component: () => import(/* webpackChunkName: "survivor-detail" */ '@/views/survivor/SurvivorDetailView.vue'),
    meta: {
      title: 'Survivor - Football Fantasy',
      description: 'View your Survivor picks round by round',
      requiresAuth: true
    }
  },
  {
    path: '/football/player/statistics',
    name: 'footballPlayerStatistics',
    // Route level code-splitting for better performance
    component: () => import(/* webpackChunkName: "football-player-statistics" */ '@/views/football/player/FootballPlayerStatisticsView.vue'),
    meta: {
      title: 'Football Player Statistics - Football Fantasy',
      description: 'View detailed statistics for football players',
      // Fantasy-league-scoped tool (needs a fantasyLeagueUuid); not public content.
      requiresAuth: true
    }
  },
  {
    path: '/privacy',
    name: 'privacy',
    // Route level code-splitting for better performance
    component: () => import(/* webpackChunkName: "privacy" */ '@/views/legal/PrivacyView.vue'),
    meta: {
      title: 'Aviso de Privacidad - Football Fantasy',
      description: 'Aviso de privacidad de Football Fantasy conforme a la LFPDPPP',
      requiresAuth: false
    }
  },
  {
    path: '/guias',
    name: 'guides',
    // Public content hub: original guides that explain how to play each mode.
    component: () => import(/* webpackChunkName: "guides" */ '@/views/guides/GuidesView.vue'),
    meta: {
      title: 'Guías y reglas — Fantasy MX',
      description: 'Aprende a jugar Fantasy MX: fantasy con draft en vivo, quinielas de marcador exacto, Survivor con vidas y el sistema de puntos. Paso a paso y gratis.',
      requiresAuth: false
    }
  },
  {
    path: '/guias/:slug',
    name: 'guideDetail',
    // Individual guide. Title/description are refined per-slug inside the view.
    component: () => import(/* webpackChunkName: "guide-detail" */ '@/views/guides/GuideDetailView.vue'),
    meta: {
      title: 'Guía — Fantasy MX',
      description: 'Guía de Fantasy MX: aprende a jugar y a competir con tus amigos.',
      requiresAuth: false
    }
  },
  // Catch-all route for 404 pages
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import(/* webpackChunkName: "not-found" */ '@/views/NotFoundView.vue'),
    meta: {
      title: 'Página no encontrada — Fantasy MX',
      description: 'La página que buscas no existe o cambió de dirección. Vuelve al inicio de Fantasy MX o consulta las guías.'
    }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL || '/'),
  routes,
  // Smooth scrolling behavior
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else if (to.hash) {
      return {
        el: to.hash,
        behavior: 'smooth'
      }
    } else {
      return { top: 0 }
    }
  }
})

// Global navigation guards
// Routes whose guard logic actually reads the auth state. For every other
// (public) route we skip token validation entirely, so browsing public content
// never hits the API to validate a token — and can't be bounced to login when a
// stale token fails validation.
const AUTH_STATE_ROUTES = new Set(['login', 'register'])

/** Origen público del sitio; las URLs de canonical y og:url deben ser absolutas. */
const SITE_ORIGIN = 'https://fantasymx.cloud'

/**
 * Sincroniza title, description, canonical y Open Graph con la ruta activa.
 *
 * index.html trae estos tags con los valores de la home; sin esto, navegar por
 * la SPA dejaba `canonical` y `og:*` congelados en la home para todas las
 * rutas, y cualquier URL con parámetros (?utm_source=, ?ref=) podía indexarse
 * como página distinta. Las páginas prerenderizadas ya vienen con los suyos
 * desde scripts/prerender.mjs; esto cubre la navegación en cliente.
 */
function updateSeoTags(to: RouteLocationNormalized) {
  const title = to.meta?.title as string | undefined
  const description = to.meta?.description as string | undefined
  // `to.path`, no `fullPath`: la canónica nunca debe arrastrar query params.
  const url = `${SITE_ORIGIN}${to.path}`

  if (title) {
    document.title = title
    setMeta('property', 'og:title', title)
  }

  if (description) {
    setMeta('name', 'description', description)
    setMeta('property', 'og:description', description)
  }

  setMeta('property', 'og:url', url)

  const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (canonical) canonical.href = url
}

/** Actualiza un <meta> existente; no crea tags que index.html no declare. */
function setMeta(attr: 'name' | 'property', key: string, content: string) {
  document.querySelector(`meta[${attr}="${key}"]`)?.setAttribute('content', content)
}

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  const needAuth = to.meta.requiresAuth;
  const isAuthenticated =
    needAuth || AUTH_STATE_ROUTES.has(to.name as string)
      ? await authStore.isAuthenticated()
      : false;

  updateSeoTags(to)

  // Check authentication for protected routes
  if (needAuth && !isAuthenticated) {
    return next({
      name: "login",
      query: { redirect: to.fullPath },
    });
  }

  // `userStore.userData` is persisted separately from the auth token and is
  // only ever populated by login()/loginWithGoogle() — nothing re-fetches it
  // on a resumed session. If it's ever missing while the token is valid (e.g.
  // a partial localStorage write survives on an iOS PWA that gets killed
  // mid-write while backgrounded), every feature that derives the current
  // user's uuid from it — like the fantasy trade drawer's own-roster fetch —
  // silently operates on a null/stale uuid with no visible error. Self-heal it
  // here so a valid session always has its user data before proceeding.
  if (needAuth && isAuthenticated) {
    // Lazy import: useUserStore → UserService's eager `export default
    // getUserService()` calls useApiFantasy() → imports the router at module
    // evaluation time, the same startup-crashing circular dependency
    // CatalogService works around above. Deferring the import until the
    // guard actually runs (well after boot) avoids it.
    const { useUserStore } = await import('@/store/user/useUserStore')
    const userStore = useUserStore();
    if (!userStore.getUserData) {
      try {
        await userStore.setUserDataFromApi();
      } catch {
        // Don't block navigation over this — worst case, uuid-dependent
        // features degrade until the next successful fetch.
      }
    }
  }

  // An already-authenticated user hitting login/register is sent into the app.
  // Honor an explicit ?redirect= target; otherwise land on the game hub at `/`
  // (matches the post-login flows in LoginComponent / GoogleCallback). The old
  // /dashboard route is deprecated and must not be used here.
  if ((to.name === 'login' || to.name === 'register') && isAuthenticated) {
    const redirect = to.query.redirect as string | undefined;
    return next(redirect && redirect.startsWith('/') ? redirect : { name: "home" });
  }

  // League gate: a football league must be selected to use the app. Without one,
  // we auto-select the default league (the first the API returns — Liga MX) for
  // everyone (anonymous and authenticated alike) so nobody is forced through the
  // selection screen; they can still change it later from the league selector.
  // Only if the default can't be resolved do we fall back to the selection page.
  const footballLeagueStore = useFootballLeagueStore();
  if (!footballLeagueStore.existLeague() && !LEAGUE_EXEMPT_ROUTES.has(to.name as string)) {
    if (await ensureDefaultLeague(footballLeagueStore)) {
      return next();
    }
    return next({ name: "footballLeagues", query: { redirect: to.fullPath } });
  }

  // Continue to the requested route
  next();
})

// Resiliencia ante chunks purgados: si el import dinámico de una ruta falla porque
// su chunk ya no existe (un deploy nuevo mientras la pestaña seguía abierta),
// recargamos UNA sola vez para traer el index.html + assets nuevos. El flag en
// sessionStorage evita un bucle de recargas si el fallo persiste por otra causa.
const CHUNK_RELOAD_KEY = 'pwa-chunk-reloaded'
function reloadOnceForChunkError(message: string | undefined): void {
  const isChunkError =
    !!message &&
    /dynamically imported module|Importing a module script failed|Failed to fetch/i.test(message)
  if (isChunkError && !sessionStorage.getItem(CHUNK_RELOAD_KEY)) {
    sessionStorage.setItem(CHUNK_RELOAD_KEY, '1')
    window.location.reload()
  }
}
router.onError((error) => reloadOnceForChunkError(error?.message))
// Vite emite este evento cuando falla la precarga de un módulo dinámico.
window.addEventListener('vite:preloadError', (event) => {
  reloadOnceForChunkError((event as unknown as { payload?: Error }).payload?.message)
})

// Scroll to top on every navigation
router.afterEach((to, from) => {
  // Una navegación completada implica que los chunks cargaron bien: limpiamos el
  // guard para que un fallo futuro pueda volver a recargar una vez.
  sessionStorage.removeItem(CHUNK_RELOAD_KEY)
  // Skip if navigating to same route (e.g. query changes)
  if (to.path === from.path) return;
  window.scrollTo({ top: 0, left: 0 });
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
})

export default router