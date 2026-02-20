<template>
  <div class="w-full">
    <!-- User Card -->
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden mb-6">
      <div class="p-5 flex items-center gap-4">
        <!-- Avatar -->
        <div class="relative flex-shrink-0">
          <div class="w-14 h-14 rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-600">
            <img 
              v-if="avatarUrl" 
              :src="avatarUrl" 
              :alt="userName"
              class="w-full h-full object-cover"
            />
            <div 
              v-else 
              class="w-full h-full flex items-center justify-center bg-blue-600 dark:bg-blue-700 text-white text-lg font-bold"
            >
              {{ userInitials }}
            </div>
          </div>
        </div>

        <!-- User Info -->
        <div class="min-w-0 flex-1">
          <p class="text-base font-semibold text-gray-900 dark:text-white truncate">{{ userName }}</p>
          <p class="text-sm text-gray-500 dark:text-gray-400 truncate">{{ userEmail }}</p>
        </div>
      </div>
    </div>

    <!-- Menu Options -->
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden mb-6">
      <!-- Profile -->
      <button
        @click="navigateTo('profile')"
        class="w-full flex items-center gap-4 px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150 border-b border-gray-100 dark:border-gray-700"
      >
        <div class="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
          <v-icon name="hi-solid-user" class="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div class="flex-1 text-left min-w-0">
          <p class="text-sm font-medium text-gray-900 dark:text-white">Profile</p>
          <p class="text-xs text-gray-500 dark:text-gray-400">View and edit your personal information</p>
        </div>
        <v-icon name="hi-solid-chevron-right" class="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
      </button>

      <!-- Change Password -->
      <button
        @click="navigateTo('change-password')"
        class="w-full flex items-center gap-4 px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150 border-b border-gray-100 dark:border-gray-700"
      >
        <div class="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
          <v-icon name="hi-solid-shield-check" class="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div class="flex-1 text-left min-w-0">
          <p class="text-sm font-medium text-gray-900 dark:text-white">Change Password</p>
          <p class="text-xs text-gray-500 dark:text-gray-400">Update your account password</p>
        </div>
        <v-icon name="hi-solid-chevron-right" class="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
      </button>

      <!-- System Settings -->
      <button
        @click="navigateTo('system-settings')"
        class="w-full flex items-center gap-4 px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150"
      >
        <div class="w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
          <v-icon name="hi-solid-cog" class="w-5 h-5 text-purple-600 dark:text-purple-400" />
        </div>
        <div class="flex-1 text-left min-w-0">
          <p class="text-sm font-medium text-gray-900 dark:text-white">System Settings</p>
          <p class="text-xs text-gray-500 dark:text-gray-400">Theme, language, and preferences</p>
        </div>
        <v-icon name="hi-solid-chevron-right" class="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
      </button>
    </div>

    <!-- Logout -->
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <button
        @click="handleLogout"
        :disabled="isLoggingOut"
        class="w-full flex items-center gap-4 px-5 py-4 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <div class="w-10 h-10 rounded-lg bg-red-50 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
          <v-icon v-if="!isLoggingOut" name="hi-solid-logout" class="w-5 h-5 text-red-600 dark:text-red-400" />
          <v-icon v-else name="pr-spinner" class="w-5 h-5 text-red-600 dark:text-red-400" animation="spin" />
        </div>
        <div class="flex-1 text-left min-w-0">
          <p class="text-sm font-medium text-red-600 dark:text-red-400">
            {{ isLoggingOut ? 'Signing out...' : 'Sign Out' }}
          </p>
          <p class="text-xs text-gray-500 dark:text-gray-400">Close your session</p>
        </div>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/user/useUserStore'
import { useAuthStore } from '@/store/auth/useAuthStore'
import { useToast } from '@/composables/useToast'

const router = useRouter()
const userStore = useUserStore()
const authStore = useAuthStore()
const toast = useToast()

const isLoggingOut = ref(false)

const avatarUrl = computed(() => userStore.getAvatarUrl)

const userName = computed(() => {
  const userData = userStore.getUserData
  if (userData?.firstname && userData?.lastname) {
    return `${userData.firstname} ${userData.lastname}`
  }
  return 'User'
})

const userEmail = computed(() => {
  const userData = userStore.getUserData
  return userData?.email || ''
})

const userInitials = computed(() => {
  const userData = userStore.getUserData
  if (userData?.firstname && userData?.lastname) {
    return `${userData.firstname[0]}${userData.lastname[0]}`.toUpperCase()
  }
  return 'U'
})

function navigateTo(routeName: string) {
  router.push({ name: routeName })
}

async function handleLogout() {
  if (isLoggingOut.value) return

  isLoggingOut.value = true
  try {
    await authStore.logout()
    toast.success('Signed Out', 'You have been signed out successfully')
    router.push({ name: 'home' })
  } catch (error) {
    console.error('Logout error:', error)
  } finally {
    isLoggingOut.value = false
  }
}
</script>
