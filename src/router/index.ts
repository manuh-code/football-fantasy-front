import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import { useAuthStore } from '@/store/auth/useAuthStore'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
    meta: {
      title: 'Home - Football Fantasy',
      description: 'Football Fantasy main page'
    }
  },
  {
    path: '/about',
    name: 'about',
    // Route level code-splitting for better performance
    component: () => import(/* webpackChunkName: "about" */ '@/views/AboutView.vue'),
    meta: {
      title: 'About - Football Fantasy',
      description: 'Information about the Football Fantasy application'
    }
  },
  {
    path: '/login',
    name: 'login',
    // Route level code-splitting for better performance
    component: () => import(/* webpackChunkName: "login" */ '@/views/login/LoginView.vue'),
    meta: {
      title: 'Sign In - Football Fantasy',
      description: 'Sign in to your Football Fantasy account'
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
    path: '/change-password',
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
    path: '/favorite-football-team',
    name: 'favorite-football-team',
    // Route level code-splitting for better performance
    component: () => import(/* webpackChunkName: "favorite-team" */ '@/views/user/favoriteTeam/FavoriteTeamView.vue'),
    meta: {
      title: 'Favorite Football Team - Football Fantasy',
      description: 'Select your favorite football team',
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

  // Handle root path redirection
  if (to.path === "/") {
    if (isAuthenticated) {
      return next({ name: "dashboard" });
    } else {
      return next({ name: "login" });
    }
  }

  // Check authentication for protected routes
  if (needAuth && !isAuthenticated) {
    return next({
      name: "login",
      query: { redirect: to.fullPath },
    });
  }

  // If user is authenticated and trying to access login page, redirect to dashboard
  if (to.name === 'login' && isAuthenticated) {
    return next({ name: "dashboard" });
  }

  // Continue to the requested route
  next();
})

export default router