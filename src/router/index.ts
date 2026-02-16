import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/store/auth/useAuthStore'

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
    path: '/about',
    name: 'about',
    // Route level code-splitting for better performance
    component: () => import(/* webpackChunkName: "about" */ '@/views/AboutView.vue'),
    meta: {
      title: 'About - Football Fantasy',
      description: 'Information about the Football Fantasy application',
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
    path: '/fantasy/league/create',
    name: 'createFantasyLeague',
    // Route level code-splitting for better performance
    component: () => import(/* webpackChunkName: "create-fantasy-league" */ '@/views/fantasy/FantasyLeagueCreateView.vue'),
    meta: {
      title: 'Create Fantasy League - Football Fantasy',
      description: 'Create a new fantasy football league',
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
    path: '/fantasy/league/join',
    name: 'joinFantasyLeague',
    // Route level code-splitting for better performance
    component: () => import(/* webpackChunkName: "join-fantasy-league" */ '@/views/fantasy/JoinFantasyLeagueView.vue'),
    meta: {
      title: 'Join Fantasy League - Football Fantasy',
      description: 'Join an existing fantasy football league',
      requiresAuth: true
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
      requiresAuth: true
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
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  const isAuthenticated = await authStore.isAuthenticated();
  const needAuth = to.meta.requiresAuth;

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

  // If user is authenticated and trying to access login or register page, redirect to dashboard
  if ((to.name === 'login' || to.name === 'register') && isAuthenticated) {
    return next({ name: "dashboard" });
  }

  // Continue to the requested route
  next();
})

export default router