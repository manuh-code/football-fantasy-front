<template>
  <!-- Top Navigation — iOS / Apple Sports style -->
  <nav :aria-label="$t('home.header.mainNav')" class="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-b border-gray-100 dark:border-gray-800 safe-area-top">
    <div class="max-w-7xl mx-auto flex items-center justify-between px-4 h-12 sm:h-14">
      <!-- Left side - Logo/Brand -->
      <button
        @click="handleGoHome"
        class="flex items-center gap-2 -ml-1 px-1.5 py-1 rounded-xl active:bg-gray-100 dark:active:bg-gray-800 transition-colors duration-150 focus:outline-none group"
        :aria-label="$t('home.header.goHome')"
        :title="$t('home.header.goHome')"
      >
        <div class="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-[10px] flex items-center justify-center">
          <!-- Monograma "F": el mismo trazado que el favicon y el splash de
               index.html, para que icono → splash → app sean una sola marca.
               Va inline y no como <v-icon> porque es identidad, no iconografía. -->
          <svg viewBox="0 0 39 54" class="w-[13px] h-[18px] text-white" fill="currentColor" aria-hidden="true">
            <path d="M0 0h39v12H12v9h19v12H12v21H0z" />
          </svg>
        </div>
        <div class="hidden sm:flex flex-col items-start">
          <span class="text-callout font-bold text-gray-900 dark:text-white leading-tight tracking-tight">Fantasy MX</span>
        </div>
      </button>

      <!-- Center - Spacer -->
      <div class="flex-1"></div>

      <!-- Right side - User Avatar -->
      <div class="flex items-center gap-2.5">
        <!-- Login Button (when not authenticated) -->
        <button
          v-if="!isAuthenticatedRef"
          @click="handleLogin"
          class="px-3.5 py-1.5 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white rounded-full font-semibold text-footnote transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          :aria-label="$t('home.header.login')"
        >
          {{ $t('home.header.login') }}
        </button>

        <!-- Avisos (bandeja + tiempo real). Sólo con sesión: sin usuario no hay
             canal al que suscribirse ni bandeja que leer. -->
        <NoticeBell v-if="isAuthenticatedRef" />

        <!-- User Avatar (when authenticated) -->
        <button
          v-if="isAuthenticatedRef"
          @click="handleViewProfile"
          class="relative w-8 h-8 rounded-full overflow-hidden ring-2 ring-gray-100 dark:ring-gray-700 hover:ring-blue-500/50 dark:hover:ring-blue-400/50 transition-all duration-150 focus:outline-none active:scale-95"
          :title="$t('home.header.profileTitle', { name: userName })"
          :aria-label="$t('home.header.profileAria')"
        >
          <img 
            v-if="avatarUrl" 
            :src="avatarUrl" 
            :alt="userName"
            class="w-full h-full object-cover"
          />
          <div 
            v-else 
            class="w-full h-full flex items-center justify-center bg-blue-500 text-white text-2xs font-bold"
          >
            {{ userInitials }}
          </div>
        </button>
      </div>
    </div>
  </nav>
</template>

<script lang="ts" setup>
import NoticeBell from '@/components/notice/NoticeBell.vue'
import { useAuthStore } from '@/store/auth/useAuthStore'
import { useUserStore } from '@/store/user/useUserStore'
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

const authStore = useAuthStore()
const userStore = useUserStore()
const router = useRouter()
const { t } = useI18n()

// Computed properties for authentication
const isAuthenticatedRef = ref(false)

// Watch for token changes to update authentication status (immediate covers mount)
watch(() => authStore.token, async (newToken) => {
  if (newToken) {
    isAuthenticatedRef.value = await authStore.isAuthenticated()
  } else {
    isAuthenticatedRef.value = false
  }
}, { immediate: true })

const avatarUrl = computed(() => {
  return userStore.getAvatarUrl
})

const userInitials = computed(() => {
  const userData = userStore.getUserData
  if (userData?.firstname && userData?.lastname) {
    return `${userData.firstname[0]}${userData.lastname[0]}`.toUpperCase()
  }
  return 'U'
})

const userName = computed(() => {
  const userData = userStore.getUserData
  if (userData?.firstname && userData?.lastname) {
    return `${userData.firstname} ${userData.lastname}`
  }
  return t('user.settings.accountFallbackName')
})

function handleLogin() {
  router.push({name: 'login'})
}

function handleGoHome() {
  if (router.currentRoute.value.name === 'home') return
  router.push({ name: 'home' }).catch(() => {})
}

function handleViewProfile() {
  if (router.currentRoute.value.name === 'userSettings') return
  router.push({ name: 'userSettings' })
}
</script>

<style lang="scss" scoped>
// Accessibility: Respect user's motion preferences
@media (prefers-reduced-motion: reduce) {
  // Disable all transforms and transitions for users who prefer reduced motion
  * {
    transition: none !important;
    transform: none !important;
  }
}

// Safe area padding for devices with notch (iPhone X+, etc.)
.safe-area-bottom {
  padding-bottom: env(safe-area-inset-bottom);
}

// Transición para el dropdown
.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
