import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
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
])

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'home',
    component: () => import(/* webpackChunkName: "home" */ '@/views/HomeView.vue'),
    meta: {
      title: 'Home - Football Fantasy',
      description: 'Football Fantasy main page',
      requiresAuth: false
    }
  },
  {
    path: '/landingpage',
    name: 'landingpage',
    // Public marketing page aimed at acquiring new users (anonymous-friendly).
    component: () => import(/* webpackChunkName: "landingpage" */ '@/views/landing/LandingView.vue'),
    meta: {
      title: 'Football Fantasy — Vive tu liga y reta a tus amigos',
      description: 'Sigue tu liga en vivo, crea quinielas con tus amigos y arma tu equipo fantasy. Gratis y desde tu móvil.',
      requiresAuth: false
    }
  },
  {
    path: '/about',
    name: 'about',
    // Route level code-splitting for better performance
    component: () => import(/* webpackChunkName: "about" */ '@/views/AboutView.vue'),
    meta: {
      title: 'Acerca de Fantasy MX — Fantasy, quinielas y Survivor de la Liga MX',
      description: 'Conoce Fantasy MX: sigue la Liga MX en vivo, arma tu equipo fantasy con draft en tiempo real, crea quinielas con tus amigos y juega Survivor. Gratis y desde tu móvil.',
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
    path: '/gaming',
    name: 'gaming',
    // Route level code-splitting for better performance
    component: () => import(/* webpackChunkName: "gaming" */ '@/views/fantasy/GamingView.vue'),
    meta: {
      title: 'Fantasy Games - Football Fantasy',
      description: 'Manage your fantasy games and leagues',
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
      description: 'Aprende a jugar Fantasy MX: guías de fantasy, draft, quinielas, Survivor y el sistema de puntos. Paso a paso y gratis.',
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
      title: 'Page Not Found - Football Fantasy',
      description: 'The page you are looking for does not exist'
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
const AUTH_STATE_ROUTES = new Set(['login', 'register', 'landingpage'])

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  const needAuth = to.meta.requiresAuth;
  const isAuthenticated =
    needAuth || AUTH_STATE_ROUTES.has(to.name as string)
      ? await authStore.isAuthenticated()
      : false;

  // Update document title
  if (to.meta?.title) {
    document.title = to.meta.title as string
  }

  // Update meta description
  if (to.meta?.description) {
    const metaDescription = document.querySelector('meta[name="description"]')
    if (metaDescription) {
      metaDescription.setAttribute('content', to.meta.description as string)
    }
  }

  // Check authentication for protected routes
  if (needAuth && !isAuthenticated) {
    return next({
      name: "login",
      query: { redirect: to.fullPath },
    });
  }

  // An already-authenticated user hitting login/register is sent into the app.
  // Honor an explicit ?redirect= target; otherwise land on the gaming hub
  // (matches the post-login flows in LoginComponent / GoogleCallback). The old
  // /dashboard route is deprecated and must not be used here.
  if ((to.name === 'login' || to.name === 'register') && isAuthenticated) {
    const redirect = to.query.redirect as string | undefined;
    return next(redirect && redirect.startsWith('/') ? redirect : { name: "gaming" });
  }

  // The landing page is a marketing page for new (anonymous) users. If an
  // authenticated user lands on it, send them straight into the app.
  if (to.name === 'landingpage' && isAuthenticated) {
    return next({ name: "home" });
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

// Scroll to top on every navigation
router.afterEach((to, from) => {
  // Skip if navigating to same route (e.g. query changes)
  if (to.path === from.path) return;
  window.scrollTo({ top: 0, left: 0 });
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
})

export default router