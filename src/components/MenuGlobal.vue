<template>
  <nav class="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm transition-colors duration-200">
    <div class="max-w-7xl mx-auto flex items-center justify-between px-3 sm:px-4 h-14 sm:h-16">
      <!-- Left side - App name -->
      <div class="navbar-brand">
        <button 
          @click="handleGoHome"
          class="px-1 sm:px-2 py-1 rounded-lg bg-transparent hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Go to home"
        >
          <span class="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">FantasyMX</span>
        </button>
      </div>

      <!-- Right side - Theme toggle, Login/User menu -->
      <div class="flex items-center gap-2 sm:gap-3">
        <!-- Theme Toggle Button -->
        <button
          @click="handleThemeToggle"
          @keydown="handleKeydown"
          :title="themeTooltip"
          class="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500 transform hover:scale-105 active:scale-95 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Toggle theme"
          tabindex="0"
        >
          <v-icon 
            :name="themeIcon" 
            class="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:rotate-180 transition-all duration-300"
          />
        </button>

        <!-- Login Button (when not authenticated) -->
        <button
          v-if="!isAuthenticatedRef"
          @click="handleLogin"
          class="px-3 py-1.5 sm:px-4 sm:py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-lg font-medium text-sm sm:text-base transform hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Login"
        >
          Login
        </button>

        <!-- User Avatar Dropdown (when authenticated) -->
        <div 
          v-if="isAuthenticatedRef"
          class="relative"
          ref="dropdownRef"
        >
          <button
            @click="toggleDropdown"
            @keydown="handleDropdownKeydown"
            class="flex items-center gap-2 p-1 bg-transparent border border-gray-200 dark:border-gray-600 rounded-full hover:border-gray-300 dark:hover:border-gray-500 hover:shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="User menu"
            :aria-expanded="isDropdownOpen"
          >
            <img
              v-if="avatarUrl"
              :src="avatarUrl"
              :alt="userInitials"
              class="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover"
            />
            <div
              v-else
              class="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-500 dark:bg-gray-600 text-white flex items-center justify-center text-xs sm:text-sm font-medium"
            >
              {{ userInitials }}
            </div>
            <v-icon 
              name="hi-solid-chevron-down" 
              class="w-3 h-3 sm:w-4 sm:h-4 text-gray-500 dark:text-gray-400 mr-1 transition-transform duration-200"
              :class="{ 'rotate-180': isDropdownOpen }"
            />
          </button>

          <!-- Dropdown Menu -->
          <Transition name="dropdown">
            <div
              v-if="isDropdownOpen"
              class="absolute right-0 top-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg min-w-40 sm:min-w-48 py-2 z-60"
              role="menu"
            >
              <button
                @click="handleViewProfile"
                class="w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 text-left text-sm sm:text-base text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 focus:outline-none focus:bg-gray-50 dark:focus:bg-gray-700"
                role="menuitem"
              >
                <v-icon name="hi-solid-user" class="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                View profile
              </button>
              <hr class="border-gray-200 dark:border-gray-600 my-2" />
              <button
                @click="handleLogout"
                class="w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 text-left text-sm sm:text-base text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200 focus:outline-none focus:bg-red-50 dark:focus:bg-red-900/20"
                role="menuitem"
              >
                <v-icon name="hi-solid-logout" class="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                Logout
              </button>
            </div>
          </Transition>
        </div>
      </div>
    </div>
  </nav>
</template>

<script lang="ts" setup>
import { useThemeStore } from '@/store/theme'
import { useAuthStore } from '@/store/auth/useAuthStore'
import { useUserStore } from '@/store/user/useUserStore'
import { computed, ref, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'

const themeStore = useThemeStore()
const authStore = useAuthStore()
const userStore = useUserStore()
const router = useRouter()

// Dropdown state
const isDropdownOpen = ref(false)
const dropdownRef = ref<HTMLElement>()

// Computed properties for theme icon
const themeIcon = computed(() => {
  return themeStore.currentTheme === 'dark' ? 'hi-solid-sun' : 'hi-solid-moon'
})

const themeTooltip = computed(() => {
  return themeStore.currentTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
})

// Computed properties for authentication
const isAuthenticatedRef = ref(false)

// Check authentication status on mount
onMounted(async () => {
  isAuthenticatedRef.value = await authStore.isAuthenticated()
})

// Watch for token changes to update authentication status
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

function handleThemeToggle() {
  themeStore.toggleTheme()
}

function handleLogin() {
  router.push({name: 'login'})
}

function toggleDropdown() {
  isDropdownOpen.value = !isDropdownOpen.value
}

function closeDropdown() {
  isDropdownOpen.value = false
}

function handleViewProfile() {
  router.push({name: 'profile'})
  closeDropdown()
}

async function handleLogout() {
  await authStore.logout();
  closeDropdown();
  router.push('/');
}

function handleGoHome() {
  router.push('/')
}

// Keyboard support
function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    handleThemeToggle()
  }
}

function handleDropdownKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    closeDropdown()
  }
}

// Click outside to close dropdown
function handleClickOutside(event: MouseEvent) {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    closeDropdown()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style lang="scss" scoped>
// Dropdown transition animations
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease-in-out;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-0.5rem) scale(0.95);
}

.dropdown-enter-to,
.dropdown-leave-from {
  opacity: 1;
  transform: translateY(0) scale(1);
}

// Accessibility: Respect user's motion preferences
@media (prefers-reduced-motion: reduce) {
  .dropdown-enter-active,
  .dropdown-leave-active {
    transition: none;
  }
  
  // Disable all transforms and transitions for users who prefer reduced motion
  * {
    transition: none !important;
    transform: none !important;
  }
}
</style>
