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

   
    <!-- Floating Action Button (FAB) - Fixed to bottom-right of screen -->
    <Transition name="fab">
      <div 
        v-if="fantasyLeagues && fantasyLeagues.length > 0"
        class="fixed bottom-24 md:bottom-6 right-6 z-50"
      >
        <!-- Expanded Menu Options -->
        <Transition name="fab-menu">
          <div
            v-if="isFabExpanded"
            class="absolute bottom-16 right-0 flex flex-col gap-3 mb-2"
          >
            <!-- Create League FAB Option -->
            <button
              @click="handleFabAction('create')"
              class="group flex items-center gap-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full pl-4 pr-5 py-3 shadow-lg hover:shadow-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <div
                class="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center"
              >
                <v-icon name="bi-trophy-fill" class="w-5 h-5" />
              </div>
              <span class="font-medium whitespace-nowrap">Create League</span>
            </button>

            <!-- Join League FAB Option -->
            <button
              @click="handleFabAction('join')"
              class="group flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full pl-4 pr-5 py-3 shadow-lg hover:shadow-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <div
                class="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center"
              >
                <v-icon name="hi-solid-user-group" class="w-5 h-5" />
              </div>
              <span class="font-medium whitespace-nowrap">Join League</span>
            </button>
          </div>
        </Transition>

        <!-- Main FAB Button -->
        <button
          @click="toggleFab"
          :class="[
            'w-14 h-14 bg-gradient-to-br from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-indigo-300 dark:focus:ring-indigo-800 flex items-center justify-center',
            isFabExpanded ? 'rotate-45' : 'rotate-0',
          ]"
          :aria-label="isFabExpanded ? 'Close menu' : 'Open quick actions'"
          :aria-expanded="isFabExpanded"
        >
          <v-icon
            name="hi-solid-plus"
            class="w-7 h-7 transition-transform duration-300"
          />
        </button>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import UserFantasyLeagueComponent from '@/components/user/fantasy/UserFantasyLeagueComponent.vue'
import { PageHeader, MobileBottomMenu } from '@/components/ui'
import { useUserStore } from '@/store/user/useUserStore'

// Set page title
document.title = 'My Fantasy Leagues - Football Fantasy'

// Router and stores
const router = useRouter()
const userStore = useUserStore()

// State
const isFabExpanded = ref(false)

// Computed
const fantasyLeagues = computed(() => userStore.getUserFantasyLeagues)

// FAB methods
const toggleFab = () => {
  isFabExpanded.value = !isFabExpanded.value
}

const handleFabAction = (action: 'create' | 'join') => {
  isFabExpanded.value = false
  if (action === 'create') {
    router.push({ name: 'createFantasyLeague' })
  } else {
    router.push({ name: 'joinFantasyLeague' })
  }
}

// Close FAB menu when scrolling
const handleScroll = () => {
  if (isFabExpanded.value) {
    isFabExpanded.value = false
  }
}

// Lifecycle
onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
/* FAB Transitions */
.fab-enter-active,
.fab-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.fab-enter-from,
.fab-leave-to {
  opacity: 0;
  transform: scale(0.5) translateY(20px);
}

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

  .fab-enter-active,
  .fab-leave-active,
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