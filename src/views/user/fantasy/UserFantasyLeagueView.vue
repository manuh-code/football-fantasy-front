<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-4 md:py-8 pb-28">
    <div class="container mx-auto px-4 max-w-7xl mb-24 md:mb-0">
      <!-- Secondary section tabs: My Leagues / Search -->
      <TopTabsBar
        :items="tabItems"
        :active-key="activeTab"
        :aria-label="$t('fantasy.userLeagues.navAria')"
        @select="activeTab = $event"
      />

      <!-- User Fantasy League Component -->
      <div class="animate-page-enter">
        <UserFantasyLeagueComponent v-if="activeTab === 'fantasy'" ref="leaguesComponentRef" />
        <UserFantasyLeagueSearch v-else ref="searchComponentRef" @join="openJoin" />
      </div>
    </div>

    <!-- Floating Action Button - Teleported to body to avoid transform context issues -->
    <Teleport to="body">
      <div class="fixed right-6 z-[110] fab-position">
        <button
          @click="toggleFabMenu"
          class="group relative w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-500/50 hover:scale-110 active:scale-95"
          :class="{ 'rotate-45': isFabMenuOpen, 'rotate-0': !isFabMenuOpen }"
          :title="isFabMenuOpen ? $t('fantasy.userLeagues.fabClose') : $t('fantasy.userLeagues.fabQuickActions')"
        >
          <v-icon name="hi-solid-plus" class="w-8 h-8" />
        </button>

        <!-- FAB Menu -->
        <transition name="fab-menu">
          <div v-if="isFabMenuOpen" class="absolute bottom-20 right-0 flex flex-col gap-3 min-w-max z-[111]">
            <button
              @click="openCreate"
              class="flex items-center gap-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white px-5 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-200 dark:border-gray-700 group"
            >
              <span class="text-sm font-semibold">{{ $t('fantasy.userLeagues.createLeague') }}</span>
              <div class="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-md">
                <v-icon name="hi-solid-plus-circle" class="w-5 h-5 text-white" />
              </div>
            </button>

            <button
              @click="openJoin"
              class="flex items-center gap-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white px-5 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-200 dark:border-gray-700 group"
            >
              <span class="text-sm font-semibold">{{ $t('fantasy.userLeagues.joinLeague') }}</span>
              <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-md">
                <v-icon name="hi-solid-user-add" class="w-5 h-5 text-white" />
              </div>
            </button>
          </div>
        </transition>
      </div>
    </Teleport>

    <!-- Create / Join modals -->
    <FantasyLeagueCreateModal :is-visible="isCreateOpen" @close="isCreateOpen = false" @created="onCreated" />
    <FantasyLeagueJoinModal
      :is-visible="isJoinOpen"
      :initial-code="joinInitialCode"
      @close="isJoinOpen = false"
      @joined="onJoined"
    />

    <!-- Fixed bottom navigation (Home / Leagues / Play / Following); Play
         stays selected here and returns to the Gaming screen — see HomeMenu. -->
    <HomeMenu />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from '@/composables/useToast'
import UserFantasyLeagueComponent from '@/components/user/fantasy/UserFantasyLeagueComponent.vue'
import UserFantasyLeagueSearch from '@/components/user/fantasy/UserFantasyLeagueSearch.vue'
import FantasyLeagueCreateModal from '@/components/fantasy/FantasyLeagueCreateModal.vue'
import FantasyLeagueJoinModal from '@/components/fantasy/FantasyLeagueJoinModal.vue'
import HomeMenu from '@/components/home/HomeMenu.vue'
import TopTabsBar from '@/components/ui/TopTabsBar.vue'
import type { BottomNavItem } from '@/components/ui/BottomNavBar.vue'
import type { FantasyLeaguesResponse } from '@/interfaces/fantasy/leagues/FantasyLeaguesResponse'

const { t } = useI18n()
const { success } = useToast()
const route = useRoute()
const router = useRouter()

// Set page title
document.title = t('fantasy.userLeagues.pageTitle')

// Refs
const leaguesComponentRef = ref<InstanceType<typeof UserFantasyLeagueComponent> | null>(null)
const searchComponentRef = ref<InstanceType<typeof UserFantasyLeagueSearch> | null>(null)

// State
const isFabMenuOpen = ref(false)
const isCreateOpen = ref(false)
const isJoinOpen = ref(false)
const activeTab = ref('fantasy')

// Access code pre-filled into the Join sheet when arriving from an invite link.
const joinInitialCode = ref('')

// Section tabs: "my leagues" list vs. discover/search.
const tabItems = computed<BottomNavItem[]>(() => [
  { key: 'fantasy', label: t('fantasy.userLeagues.title'), icon: 'bi-trophy-fill', accent: 'blue' },
  { key: 'search', label: t('fantasy.discover.tab'), icon: 'hi-solid-search', accent: 'blue' },
])

// FAB
const toggleFabMenu = () => {
  isFabMenuOpen.value = !isFabMenuOpen.value
}

const openCreate = () => {
  isFabMenuOpen.value = false
  isCreateOpen.value = true
}

const openJoin = () => {
  isFabMenuOpen.value = false
  joinInitialCode.value = '' // FAB flow starts from an empty form.
  isJoinOpen.value = true
}

// Modal callbacks
const onCreated = (league: FantasyLeaguesResponse) => {
  isCreateOpen.value = false
  success(t('fantasy.leagueCreate.success.title'), t('fantasy.leagueCreate.success.message', { name: league.name }))
  leaguesComponentRef.value?.reload()
}

const onJoined = (league: FantasyLeaguesResponse) => {
  isJoinOpen.value = false
  success(t('fantasy.join.joined'), t('fantasy.join.joinedBody', { name: league.name }))
  leaguesComponentRef.value?.reload()
  searchComponentRef.value?.reload()
}

// Arriving from a shared invite link (/my/fantasy/leagues?join=CODE): open the Join
// sheet pre-filled with the code, then strip the query so a refresh doesn't reopen it.
onMounted(() => {
  const code = route.query.join
  if (typeof code === 'string' && code.trim()) {
    joinInitialCode.value = code.trim()
    isJoinOpen.value = true
    router.replace({ query: { ...route.query, join: undefined } })
  }
})

// Cleanup: close FAB menu when leaving the view
onUnmounted(() => {
  isFabMenuOpen.value = false
})
</script>

<style>
/* FAB styles - unscoped because Teleport renders outside component root */

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
.fab-position .rotate-45 {
  transform: rotate(45deg);
}

.fab-position .rotate-0 {
  transform: rotate(0deg);
}

/* Accessibility: Respect user's motion preferences */
@media (prefers-reduced-motion: reduce) {
  .fab-position .transition-all,
  .fab-position .transition-transform {
    transition: none !important;
    animation: none !important;
  }

  .fab-menu-enter-active,
  .fab-menu-leave-active {
    transition: none !important;
  }

  .fab-position .rotate-45,
  .fab-position .rotate-0 {
    transform: none !important;
  }
}

/* FAB Position - Always visible above footer nav */
.fab-position {
  bottom: calc(5rem + env(safe-area-inset-bottom));
  pointer-events: auto;
}

@media (min-width: 768px) {
  .fab-position {
    bottom: 1.5rem;
  }
}
</style>
