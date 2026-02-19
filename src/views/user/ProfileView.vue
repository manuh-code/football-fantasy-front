<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-4 md:py-8 pb-24 md:pb-8">
    <div class="container mx-auto px-4 max-w-7xl">
      <!-- Page Header -->
      <PageHeader
        back-text="Back"
        breadcrumb-to="/dashboard"
        breadcrumb-text="Dashboard"
        current-page-text="Profile"
      />

      <!-- Tab Navigation - Desktop -->
      <div class="hidden md:block mb-6">
        <nav aria-label="Profile section navigation" class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-2">
          <div class="flex items-center gap-2">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              @click="activeTab = tab.id"
              :class="[
                'flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200',
                activeTab === tab.id
                  ? tab.activeClass
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
              ]"
            >
              <v-icon :name="tab.icon" class="w-5 h-5" />
              <span>{{ tab.label }}</span>
            </button>
          </div>
        </nav>
      </div>

      <!-- Content Area -->
      <Transition name="tab-fade" mode="out-in">
        <!-- Profile Tab -->
        <div v-if="activeTab === 'profile'" key="profile">
          <ProfileComponent />
        </div>

        <!-- Security Tab -->
        <div v-else-if="activeTab === 'security'" key="security">
          <ChangePasswordComponent />
        </div>

        <!-- Settings Tab -->
        <div v-else-if="activeTab === 'settings'" key="settings">
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <!-- Settings Header -->
            <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                  <v-icon name="hi-solid-cog" class="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Preferences</h2>
                  <p class="text-sm text-gray-600 dark:text-gray-400">Customize your application experience</p>
                </div>
              </div>
            </div>

            <!-- Settings Content -->
            <div class="p-6 space-y-6">
              <!-- Theme Setting -->
              <div class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div class="flex items-center gap-4">
                  <div class="w-12 h-12 bg-gradient-to-br from-yellow-400 to-purple-600 rounded-lg flex items-center justify-center">
                    <v-icon :name="themeIcon" class="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 class="text-base font-semibold text-gray-900 dark:text-white">Theme Mode</h3>
                    <p class="text-sm text-gray-600 dark:text-gray-400">{{ themeDescription }}</p>
                  </div>
                </div>
                <button
                  @click="handleThemeToggle"
                  :class="[
                    'relative inline-flex h-8 w-14 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800',
                    themeStore.currentTheme === 'dark' ? 'bg-purple-600' : 'bg-gray-300'
                  ]"
                  :aria-label="`Switch to ${themeStore.currentTheme === 'dark' ? 'light' : 'dark'} mode`"
                >
                  <span
                    :class="[
                      'inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform duration-200',
                      themeStore.currentTheme === 'dark' ? 'translate-x-7' : 'translate-x-1'
                    ]"
                  >
                    <v-icon 
                      :name="themeStore.currentTheme === 'dark' ? 'hi-solid-moon' : 'hi-solid-sun'" 
                      class="w-4 h-4 text-gray-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                    />
                  </span>
                </button>
              </div>

              <!-- Additional Settings Placeholder -->
              <div class="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-center">
                <v-icon name="hi-solid-sparkles" class="w-8 h-8 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
                <p class="text-sm text-gray-600 dark:text-gray-400">More settings coming soon</p>
              </div>

              <!-- Logout Section -->
              <div class="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div class="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-200 dark:border-red-900/30">
                  <div class="flex items-center gap-4">
                    <div class="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                      <v-icon name="hi-solid-logout" class="w-6 h-6 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                      <h3 class="text-base font-semibold text-gray-900 dark:text-white">Sign Out</h3>
                      <p class="text-sm text-gray-600 dark:text-gray-400">Close your session and return to home</p>
                    </div>
                  </div>
                  <button
                    @click="handleLogout"
                    :disabled="isLoggingOut"
                    class="px-4 py-2 bg-red-600 hover:bg-red-700 active:bg-red-800 disabled:bg-red-400 disabled:cursor-not-allowed text-white rounded-lg font-medium text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 flex items-center gap-2"
                  >
                    <v-icon v-if="isLoggingOut" name="pr-spinner" class="w-4 h-4" animation="spin" />
                    <span>{{ isLoggingOut ? 'Signing out...' : 'Sign Out' }}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </div>

    <!-- Mobile Bottom Navigation -->
    <nav aria-label="Profile section navigation" class="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg">
      <div class="flex items-center justify-around px-2 py-2 safe-area-bottom">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          :class="[
            'flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 flex-1',
            activeTab === tab.id
              ? tab.activeClass
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
          ]"
          :aria-label="tab.label"
        >
          <v-icon :name="tab.icon" class="w-6 h-6" />
          <span class="text-xs font-medium">{{ tab.label }}</span>
        </button>
      </div>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import ProfileComponent from '@/components/user/ProfileComponent.vue'
import ChangePasswordComponent from '@/components/password/ChangePasswordComponent.vue'
import { PageHeader } from '@/components/ui'
import { useThemeStore } from '@/store/theme'
import { useAuthStore } from '@/store/auth/useAuthStore'
import { useToast } from '@/composables/useToast'

const themeStore = useThemeStore()
const authStore = useAuthStore()
const router = useRouter()
const toast = useToast()

const activeTab = ref('profile')
const isLoggingOut = ref(false)

const tabs = [
  {
    id: 'profile',
    label: 'Profile',
    icon: 'hi-solid-user',
    activeClass: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30'
  },
  {
    id: 'security',
    label: 'Security',
    icon: 'hi-solid-shield-check',
    activeClass: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30'
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: 'hi-solid-cog',
    activeClass: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30'
  }
]

const themeIcon = computed(() => {
  return themeStore.currentTheme === 'dark' ? 'hi-solid-moon' : 'hi-solid-sun'
})

const themeDescription = computed(() => {
  return themeStore.currentTheme === 'dark' 
    ? 'Dark mode is currently active' 
    : 'Light mode is currently active'
})

const handleThemeToggle = () => {
  themeStore.toggleTheme()
}

const handleLogout = async () => {
  if (isLoggingOut.value) return
  
  isLoggingOut.value = true
  try {
    await authStore.logout()
    toast.success('Signed Out', 'You have been signed out successfully')
    router.push({ name: 'home' })
  } catch (error) {
    console.error('Logout error:', error)
    toast.error('Error', 'Failed to sign out. Please try again.')
  } finally {
    isLoggingOut.value = false
  }
}
</script>

<style scoped>
/* Tab transition animations */
.tab-fade-enter-active,
.tab-fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.tab-fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.tab-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Safe area for mobile devices */
.safe-area-bottom {
  padding-bottom: env(safe-area-inset-bottom);
}

/* Accessibility */
@media (prefers-reduced-motion: reduce) {
  .tab-fade-enter-active,
  .tab-fade-leave-active {
    transition: none !important;
  }
}
</style>
