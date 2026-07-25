<template>
  <Teleport to="body">
    <!-- Backdrop -->
    <Transition name="backdrop">
      <div
        v-if="isPanelOpen"
        class="fixed inset-0 z-[99] bg-black/25 dark:bg-black/50 backdrop-blur-[2px]"
        @click="closePanel"
      />
    </Transition>

    <!-- Sliding panel (Boards / Wishlist) -->
    <Transition name="slide-up">
      <section
        v-if="isPanelOpen"
        class="fixed top-[calc(3rem+env(safe-area-inset-top,0px))] sm:top-[calc(3.5rem+env(safe-area-inset-top,0px))] bottom-[76px] right-0 z-[100] flex flex-col overflow-hidden rounded-t-3xl bg-gray-50 dark:bg-gray-900 shadow-[0_-8px_40px_rgba(0,0,0,0.2)] ring-1 ring-black/5 dark:ring-white/10 transition-[left] duration-300"
        :style="{ left: `${leftOffset}px` }"
        :aria-label="panelTitle"
      >
        <!-- Grip -->
        <div class="flex justify-center pt-2 pb-1 shrink-0">
          <div class="w-9 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
        </div>

        <!-- Panel header -->
        <header
          class="flex items-center justify-between gap-3 px-4 pb-2.5 shrink-0 border-b border-gray-100 dark:border-gray-800"
        >
          <div class="flex items-center gap-2 min-w-0">
            <span
              class="flex items-center justify-center w-7 h-7 rounded-lg shrink-0"
              :class="activeTab === 'wishlist'
                ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
                : 'bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400'"
            >
              <v-icon :name="activeTab === 'wishlist' ? 'bi-star-fill' : 'hi-solid-clipboard-list'" class="w-4 h-4" />
            </span>
            <h2 class="text-callout font-bold text-gray-900 dark:text-white truncate">
              {{ panelTitle }}
            </h2>
          </div>

          <button
            type="button"
            :aria-label="$t('fantasy.draft.menu.close')"
            class="flex items-center justify-center w-8 h-8 rounded-full text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 active:bg-gray-200 dark:active:bg-gray-700 active:scale-90 transition-all cursor-pointer"
            @click="closePanel"
          >
            <v-icon name="hi-solid-x" class="w-4 h-4" />
          </button>
        </header>

        <!-- Panel body -->
        <div class="flex-1 overflow-y-auto overscroll-contain px-2.5 py-3">
          <DraftPlayerPicked
            v-if="activeTab === 'boards'"
            ref="draftPickedRef"
            :fantasyLeagueUuid="fantasyLeagueUuid"
          />
          <div v-else-if="activeTab === 'wishlist'" class="max-w-xl mx-auto w-full">
            <DraftWishlist
              :fantasyLeagueUuid="fantasyLeagueUuid"
              :isMyTurn="isMyTurn"
            />
          </div>
        </div>
      </section>
    </Transition>

    <!-- Floating glass nav pill. Tracks the drawer width via leftOffset and,
         crucially, retreats out of the way when the on-screen keyboard opens so
         it never floats up into the middle of the screen while searching. -->
    <nav
      :aria-label="$t('fantasy.draft.menu.nav')"
      class="fixed right-0 bottom-0 z-[100] pointer-events-none flex justify-center transition-[left] duration-300"
      :style="{ left: `${leftOffset}px`, paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom, 0.75rem))' }"
    >
      <div
        class="pointer-events-auto flex items-center gap-0.5 p-1 rounded-full max-w-[calc(100%-1rem)] bg-white/80 dark:bg-gray-900/70 backdrop-blur-xl border border-black/[0.04] dark:border-white/10 shadow-xl shadow-black/10 dark:shadow-black/40 transition-[transform,opacity] duration-200 ease-out"
        :class="isKeyboardOpen ? 'translate-y-[160%] opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'"
      >
        <!-- Draft (home) -->
        <button
          type="button"
          :aria-label="$t('fantasy.draft.menu.room')"
          :aria-current="isDraftActive ? 'page' : undefined"
          class="flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 rounded-full transition-all duration-200 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30 cursor-pointer"
          :class="isDraftActive
            ? 'text-blue-600 dark:text-blue-400 bg-blue-500/15 ring-1 ring-inset ring-blue-500/25 dark:bg-blue-400/15 dark:ring-blue-400/25'
            : 'text-gray-400 dark:text-gray-500 active:text-gray-600 dark:active:text-gray-300'"
          @click="handleTabChange('draft')"
        >
          <v-icon name="gi-soccer-ball" class="w-5 h-5" :class="isDraftActive ? 'scale-110' : ''" />
          <span class="text-2xs font-semibold tracking-tight leading-none">{{ $t('fantasy.draft.menu.draft') }}</span>
        </button>

        <!-- Boards -->
        <button
          type="button"
          :aria-label="$t('fantasy.draft.menu.board')"
          :aria-current="activeTab === 'boards' ? 'page' : undefined"
          class="flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 rounded-full transition-all duration-200 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/30 cursor-pointer"
          :class="activeTab === 'boards'
            ? 'text-sky-600 dark:text-sky-400 bg-sky-500/15 ring-1 ring-inset ring-sky-500/25 dark:bg-sky-400/15 dark:ring-sky-400/25'
            : 'text-gray-400 dark:text-gray-500 active:text-gray-600 dark:active:text-gray-300'"
          @click="handleTabChange('boards')"
        >
          <v-icon name="hi-solid-clipboard-list" class="w-5 h-5" :class="activeTab === 'boards' ? 'scale-110' : ''" />
          <span class="text-2xs font-semibold tracking-tight leading-none">{{ $t('fantasy.draft.menu.boards') }}</span>
        </button>

        <!-- Wishlist (Deseos) -->
        <button
          type="button"
          :aria-label="$t('fantasy.draft.menu.wishlist')"
          :aria-current="activeTab === 'wishlist' ? 'page' : undefined"
          class="relative flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 rounded-full transition-all duration-200 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/30 cursor-pointer"
          :class="activeTab === 'wishlist'
            ? 'text-amber-600 dark:text-amber-400 bg-amber-500/15 ring-1 ring-inset ring-amber-500/25 dark:bg-amber-400/15 dark:ring-amber-400/25'
            : 'text-gray-400 dark:text-gray-500 active:text-gray-600 dark:active:text-gray-300'"
          @click="handleTabChange('wishlist')"
        >
          <v-icon
            :name="activeTab === 'wishlist' || wishlistCount > 0 ? 'bi-star-fill' : 'bi-star'"
            class="w-5 h-5 transition-transform"
            :class="activeTab === 'wishlist' ? 'scale-110' : ''"
          />
          <span class="text-2xs font-semibold tracking-tight leading-none">{{ $t('fantasy.draft.menu.wishlist') }}</span>

          <!-- Count badge -->
          <Transition name="badge-pop">
            <span
              v-if="wishlistCount > 0"
              class="absolute -top-0.5 right-1.5 min-w-[16px] h-4 px-1 flex items-center justify-center rounded-full bg-amber-500 text-white text-[9px] font-bold leading-none tabular-nums ring-2 ring-white dark:ring-gray-900"
            >
              {{ wishlistCount > 99 ? '99+' : wishlistCount }}
            </span>
          </Transition>
        </button>

        <!-- League -->
        <button
          type="button"
          :aria-label="$t('fantasy.draft.menu.leagueDetail')"
          class="flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 rounded-full transition-all duration-200 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30 text-gray-400 dark:text-gray-500 active:text-gray-600 dark:active:text-gray-300 cursor-pointer"
          @click="handleTabChange('league')"
        >
          <v-icon name="bi-trophy-fill" class="w-5 h-5" />
          <span class="text-2xs font-semibold tracking-tight leading-none">{{ $t('fantasy.draft.menu.league') }}</span>
        </button>
      </div>
    </nav>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import DraftPlayerPicked from '@/components/fantasy/draft/DraftPlayerPicked.vue'
import DraftWishlist from '@/components/fantasy/draft/DraftWishlist.vue'
import { useDraftWishlistStore } from '@/store/fantasy/useDraftWishlistStore'
import { useKeyboardInset } from '@/composables/useKeyboardInset'
import type { FantasyDraftPlayerPicked } from '@/interfaces/fantasy/draft/FantasyDraftPlayerPicked'

const router = useRouter()
const { t } = useI18n()

const props = withDefaults(defineProps<{
  leftOffset?: number
  fantasyLeagueUuid: string
  isMyTurn?: boolean
}>(), {
  leftOffset: 0,
  isMyTurn: false,
})

type PanelTab = 'boards' | 'wishlist'
const activeTab = ref<PanelTab | null>(null)
const draftPickedRef = ref<InstanceType<typeof DraftPlayerPicked> | null>(null)

const wishlistStore = useDraftWishlistStore()
const wishlistCount = computed(() => wishlistStore.count(props.fantasyLeagueUuid))

const { isKeyboardOpen } = useKeyboardInset()

const isPanelOpen = computed(() => activeTab.value !== null)
const isDraftActive = computed(() => activeTab.value === null)
const panelTitle = computed(() =>
  activeTab.value === 'wishlist'
    ? t('fantasy.draft.wishlist.title')
    : t('fantasy.draft.menu.board'),
)

function handleTabChange(tab: 'draft' | 'league' | PanelTab) {
  if (tab === 'draft') {
    activeTab.value = null
    return
  }
  if (tab === 'league') {
    router.push({ name: 'fantasyLeagueDetail', params: { uuid: props.fantasyLeagueUuid } })
    return
  }
  activeTab.value = activeTab.value === tab ? null : tab
}

function closePanel() {
  activeTab.value = null
}

function refresh() {
  draftPickedRef.value?.refresh()
}

function addPick(pick: FantasyDraftPlayerPicked) {
  draftPickedRef.value?.addPick(pick)
}

defineExpose({ refresh, addPick })
</script>

<style scoped>
/* Slide-up panel */
.slide-up-enter-active {
  transition: transform 0.32s cubic-bezier(0.32, 0.72, 0, 1), opacity 0.2s ease;
}
.slide-up-leave-active {
  transition: transform 0.24s cubic-bezier(0.5, 0, 0.75, 0), opacity 0.18s ease;
}
.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
  opacity: 0;
}

/* Backdrop */
.backdrop-enter-active,
.backdrop-leave-active {
  transition: opacity 0.25s ease;
}
.backdrop-enter-from,
.backdrop-leave-to {
  opacity: 0;
}

/* Badge pop */
.badge-pop-enter-active {
  transition: transform 0.28s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.2s ease;
}
.badge-pop-leave-active {
  transition: transform 0.18s ease, opacity 0.18s ease;
}
.badge-pop-enter-from,
.badge-pop-leave-to {
  transform: scale(0);
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .slide-up-enter-active,
  .slide-up-leave-active,
  .badge-pop-enter-active,
  .badge-pop-leave-active {
    transition: opacity 0.15s ease;
  }
}
</style>
