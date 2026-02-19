<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-4 md:py-8 pb-20 md:pb-8">
    <div class="container mx-auto px-4 max-w-7xl">
      <!-- Page Header -->
      <PageHeader
      
        back-text="Back"
        breadcrumb-to="/dashboard"
        breadcrumb-text="Dashboard"
        current-page-text="Fantasy Leagues"
      />

      <!-- User Fantasy League Component -->
      <div class="animate-page-enter">
        <UserFantasyLeagueComponent />
      </div>
    </div>

    <!-- Floating Action Button -->
    <div class="fixed bottom-6 right-6 z-50">
      <button
        @click="toggleFabMenu"
        class="group relative w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-500/50 hover:scale-110 active:scale-95"
        :class="{ 'rotate-45': isFabMenuOpen, 'rotate-0': !isFabMenuOpen }"
        :title="isFabMenuOpen ? 'Close menu' : 'Quick actions'"
      >
        <v-icon name="hi-solid-plus" class="w-8 h-8" />
      </button>

      <!-- FAB Menu -->
      <transition name="fab-menu">
        <div v-if="isFabMenuOpen" class="absolute bottom-20 right-0 flex flex-col gap-3 min-w-max">
          <button
            @click="goToCreateLeague"
            class="flex items-center gap-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white px-5 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-200 dark:border-gray-700 group"
          >
            <span class="text-sm font-semibold">Create League</span>
            <div class="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-md">
              <v-icon name="hi-solid-plus-circle" class="w-5 h-5 text-white" />
            </div>
          </button>

          <button
            @click="goToJoinLeague"
            class="flex items-center gap-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white px-5 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-200 dark:border-gray-700 group"
          >
            <span class="text-sm font-semibold">Join League</span>
            <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-md">
              <v-icon name="hi-solid-user-add" class="w-5 h-5 text-white" />
            </div>
          </button>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import UserFantasyLeagueComponent from '@/components/user/fantasy/UserFantasyLeagueComponent.vue'
import { PageHeader } from '@/components/ui'

// Set page title
document.title = 'My Fantasy Leagues - Football Fantasy'

// Router
const router = useRouter()

// State
const isFabMenuOpen = ref(false)

// Methods
const toggleFabMenu = () => {
  isFabMenuOpen.value = !isFabMenuOpen.value
}

const goToCreateLeague = () => {
  isFabMenuOpen.value = false
  router.push({ name: 'createFantasyLeague' })
}

const goToJoinLeague = () => {
  isFabMenuOpen.value = false
  router.push({ name: 'joinFantasyLeague' })
}
</script>

<style scoped>
/* FAB Menu Transitions */
.fab-menu-enter-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.fab-menu-leave-active {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.fab-menu-enter-from {
  opacity: 0;
  transform: translateY(10px) scale(0.9);
}

.fab-menu-leave-to {
  opacity: 0;
  transform: translateY(5px) scale(0.95);
}

/* Rotate animation for main FAB */
.rotate-45 {
  transform: rotate(45deg);
}

.rotate-0 {
  transform: rotate(0deg);
}

/* Accessibility: Respect user's motion preferences */
@media (prefers-reduced-motion: reduce) {
  .transition-all,
  .transition-transform {
    transition: none !important;
    animation: none !important;
  }

  .fab-menu-enter-active,
  .fab-menu-leave-active {
    transition: none !important;
  }

  .rotate-45,
  .rotate-0 {
    transform: none !important;
  }
}
</style>

