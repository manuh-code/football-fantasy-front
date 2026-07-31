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

    <!-- Panel deslizante (Board / Deseos) -->
    <Transition name="slide-up">
      <section
        v-if="isPanelOpen"
        class="fixed top-[calc(3rem+env(safe-area-inset-top,0px))] sm:top-[calc(3.5rem+env(safe-area-inset-top,0px))] left-0 right-0 z-[100] flex flex-col overflow-hidden rounded-t-3xl bg-gray-50 dark:bg-gray-900 shadow-[0_-8px_40px_rgba(0,0,0,0.2)] ring-1 ring-black/5 dark:ring-white/10"
        :style="panelStyle"
        :aria-label="panelTitle"
      >
        <!-- Zona arrastrable: solo el handle + header cierran con swipe, para
             que el scroll propio de la lista de abajo nunca se confunda con
             el gesto de cerrar. -->
        <div @touchstart="onTouchStart" @touchmove="onTouchMove" @touchend="onTouchEnd">
          <div class="flex justify-center pt-2 pb-1 shrink-0">
            <div class="w-9 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
          </div>

          <header
            class="flex items-center justify-between gap-3 px-4 pb-2.5 shrink-0 border-b border-gray-100 dark:border-gray-800"
          >
            <div class="flex items-center gap-2 min-w-0">
              <span
                class="flex items-center justify-center w-7 h-7 rounded-lg shrink-0"
                :class="headerIconClass"
              >
                <v-icon :name="headerIconName" class="w-4 h-4" />
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
        </div>

        <div class="flex-1 overflow-y-auto overscroll-contain px-2.5 py-3">
          <DraftPicksTable
            v-if="activeTab === 'boards'"
            :contenders="contenders"
            :picks="picks"
            :snake-order="snakeOrder"
          />
          <div v-else-if="activeTab === 'wishlist'" class="max-w-xl mx-auto w-full">
            <DraftWishlist
              :fantasyLeagueUuid="mockDraftUuid"
              :isMyTurn="isMyTurn"
              :pickHandler="pickHandler"
            />
          </div>
          <div v-else-if="activeTab === 'team'" class="max-w-xl mx-auto w-full">
            <MockDraftMyTeam :team="myTeam" :roster="myRoster" :formation="formation" />
          </div>
        </div>
      </section>
    </Transition>

    <!-- Píldora flotante de navegación, igual que la del draft real.
         `bottom` sigue a keyboardInset de forma continua (no solo por encima
         del umbral de teclado) para que la barra de herramientas de iOS Safari
         no la deje flotando a media pantalla al cargar o al hacer scroll —
         ver useKeyboardInset. -->
    <nav
      :aria-label="$t('fantasy.draft.menu.nav')"
      class="fixed left-0 right-0 z-[100] pointer-events-none flex justify-center"
      :style="{
        bottom: `${keyboardInset}px`,
        paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom, 0.75rem))',
      }"
    >
      <div
        class="pointer-events-auto flex items-center gap-0.5 p-1 rounded-full max-w-[calc(100%-1rem)] bg-white/80 dark:bg-gray-900/70 backdrop-blur-xl border border-black/[0.04] dark:border-white/10 shadow-xl shadow-black/10 dark:shadow-black/40 transition-[transform,opacity] duration-200 ease-out"
        :class="isKeyboardOpen ? 'translate-y-[160%] opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'"
      >
        <button
          type="button"
          :aria-label="$t('fantasy.draft.menu.room')"
          :aria-current="activeTab === null ? 'page' : undefined"
          class="flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 rounded-full transition-all duration-200 active:scale-95 cursor-pointer"
          :class="
            activeTab === null
              ? 'text-blue-600 dark:text-blue-400 bg-blue-500/15 ring-1 ring-inset ring-blue-500/25 dark:bg-blue-400/15 dark:ring-blue-400/25'
              : 'text-gray-400 dark:text-gray-500 active:text-gray-600 dark:active:text-gray-300'
          "
          @click="activeTab = null"
        >
          <v-icon name="gi-soccer-ball" class="w-5 h-5" :class="activeTab === null ? 'scale-110' : ''" />
          <span class="text-2xs font-semibold tracking-tight leading-none">{{ $t('fantasy.draft.menu.draft') }}</span>
        </button>

        <button
          type="button"
          :aria-label="$t('fantasy.draft.menu.board')"
          :aria-current="activeTab === 'boards' ? 'page' : undefined"
          class="flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 rounded-full transition-all duration-200 active:scale-95 cursor-pointer"
          :class="
            activeTab === 'boards'
              ? 'text-sky-600 dark:text-sky-400 bg-sky-500/15 ring-1 ring-inset ring-sky-500/25 dark:bg-sky-400/15 dark:ring-sky-400/25'
              : 'text-gray-400 dark:text-gray-500 active:text-gray-600 dark:active:text-gray-300'
          "
          @click="toggleTab('boards')"
        >
          <v-icon name="hi-solid-clipboard-list" class="w-5 h-5" :class="activeTab === 'boards' ? 'scale-110' : ''" />
          <span class="text-2xs font-semibold tracking-tight leading-none">{{ $t('fantasy.draft.menu.boards') }}</span>
        </button>

        <button
          type="button"
          :aria-label="$t('fantasy.draft.menu.wishlist')"
          :aria-current="activeTab === 'wishlist' ? 'page' : undefined"
          class="relative flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 rounded-full transition-all duration-200 active:scale-95 cursor-pointer"
          :class="
            activeTab === 'wishlist'
              ? 'text-amber-600 dark:text-amber-400 bg-amber-500/15 ring-1 ring-inset ring-amber-500/25 dark:bg-amber-400/15 dark:ring-amber-400/25'
              : 'text-gray-400 dark:text-gray-500 active:text-gray-600 dark:active:text-gray-300'
          "
          @click="toggleTab('wishlist')"
        >
          <v-icon
            :name="activeTab === 'wishlist' || wishlistCount > 0 ? 'bi-star-fill' : 'bi-star'"
            class="w-5 h-5 transition-transform"
            :class="activeTab === 'wishlist' ? 'scale-110' : ''"
          />
          <span class="text-2xs font-semibold tracking-tight leading-none">{{ $t('fantasy.draft.menu.wishlist') }}</span>

          <Transition name="badge-pop">
            <span
              v-if="wishlistCount > 0"
              class="absolute -top-0.5 right-1.5 min-w-[16px] h-4 px-1 flex items-center justify-center rounded-full bg-amber-500 text-white text-[9px] font-bold leading-none tabular-nums ring-2 ring-white dark:ring-gray-900"
            >
              {{ wishlistCount > 99 ? '99+' : wishlistCount }}
            </span>
          </Transition>
        </button>

        <button
          type="button"
          :aria-label="$t('fantasy.mockDraft.myTeam.title')"
          :aria-current="activeTab === 'team' ? 'page' : undefined"
          class="flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 rounded-full transition-all duration-200 active:scale-95 cursor-pointer"
          :class="
            activeTab === 'team'
              ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/15 ring-1 ring-inset ring-emerald-500/25 dark:bg-emerald-400/15 dark:ring-emerald-400/25'
              : 'text-gray-400 dark:text-gray-500 active:text-gray-600 dark:active:text-gray-300'
          "
          @click="toggleTab('team')"
        >
          <v-icon name="hi-solid-user-group" class="w-5 h-5" :class="activeTab === 'team' ? 'scale-110' : ''" />
          <span class="text-2xs font-semibold tracking-tight leading-none">{{ $t('fantasy.mockDraft.myTeam.tab') }}</span>
        </button>

        <button
          type="button"
          :aria-label="$t('fantasy.mockDraft.room.exit')"
          class="flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 rounded-full transition-all duration-200 active:scale-95 text-gray-400 dark:text-gray-500 active:text-gray-600 dark:active:text-gray-300 cursor-pointer"
          @click="emit('leave')"
        >
          <v-icon name="ri-robot-line" class="w-5 h-5" />
          <span class="text-2xs font-semibold tracking-tight leading-none">{{ $t('fantasy.mockDraft.room.exit') }}</span>
        </button>
      </div>
    </nav>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import DraftPicksTable from '@/components/fantasy/draft/shared/DraftPicksTable.vue'
import DraftWishlist from '@/components/fantasy/draft/DraftWishlist.vue'
import MockDraftMyTeam from '@/components/fantasy/mockDraft/MockDraftMyTeam.vue'
import { useDraftWishlistStore } from '@/store/fantasy/useDraftWishlistStore'
import { useKeyboardInset } from '@/composables/useKeyboardInset'
import { useDismissibleSheet } from '@/composables/useDismissibleSheet'
import type { DraftBoardPick, DraftContender } from '@/components/fantasy/draft/shared/draftShared'
import type { FantasyPlayerDraftResponse } from '@/interfaces/fantasy/draft/FantasyPlayerDraftResponse'
import type {
  MockDraftFormation,
  MockDraftPick,
  MockDraftTeam,
} from '@/interfaces/fantasy/mockDraft/MockDraftResponse'

/**
 * La misma píldora flotante y el mismo panel del draft real, para el mock.
 *
 * No comparte componente con MenuDraft porque las acciones difieren (el mock no
 * tiene liga a la que volver ni drawer lateral que esquivar), pero sí comparte
 * la tabla de picks y la wishlist, que es lo que el usuario realmente usa.
 */
const props = withDefaults(
  defineProps<{
    mockDraftUuid: string
    contenders: DraftContender[]
    picks: DraftBoardPick[]
    snakeOrder?: boolean
    isMyTurn?: boolean
    /** Permite a la sala abrir el board desde la boleta final. */
    forceOpenBoard?: boolean
    myTeam: MockDraftTeam | null
    myRoster: MockDraftPick[]
    formation: MockDraftFormation
    /** Cómo fichar desde la wishlist; lo provee la sala. */
    pickHandler?: (player: FantasyPlayerDraftResponse) => Promise<void>
  }>(),
  { snakeOrder: true, isMyTurn: false, forceOpenBoard: false, pickHandler: undefined },
)

const emit = defineEmits<{ leave: []; 'board-closed': [] }>()

type PanelTab = 'boards' | 'wishlist' | 'team'

const { t } = useI18n()
const wishlistStore = useDraftWishlistStore()
const { isKeyboardOpen, keyboardInset } = useKeyboardInset()

const activeTab = ref<PanelTab | null>(null)

const wishlistCount = computed(() => wishlistStore.count(props.mockDraftUuid))
const isPanelOpen = computed(() => activeTab.value !== null)
const panelTitle = computed(() => {
  if (activeTab.value === 'wishlist') return t('fantasy.draft.wishlist.title')
  if (activeTab.value === 'team') return t('fantasy.mockDraft.myTeam.title')
  return t('fantasy.draft.menu.board')
})

const headerIconName = computed(() => {
  if (activeTab.value === 'wishlist') return 'bi-star-fill'
  if (activeTab.value === 'team') return 'hi-solid-user-group'
  return 'hi-solid-clipboard-list'
})

const headerIconClass = computed(() => {
  if (activeTab.value === 'wishlist') {
    return 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
  }
  if (activeTab.value === 'team') {
    return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
  }
  return 'bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400'
})

function toggleTab(tab: PanelTab): void {
  activeTab.value = activeTab.value === tab ? null : tab
}

function closePanel(): void {
  if (activeTab.value === 'boards') emit('board-closed')
  activeTab.value = null
}

const { dragOffset, onTouchStart, onTouchMove, onTouchEnd } = useDismissibleSheet(isPanelOpen, closePanel)

const panelStyle = computed(() => {
  const style: Record<string, string> = { bottom: `calc(76px + ${keyboardInset.value}px)` }

  if (dragOffset.value > 0) {
    style.transform = `translateY(${dragOffset.value}px)`
    style.transition = 'none'
  }

  return style
})

watch(
  () => props.forceOpenBoard,
  (open) => {
    if (open) activeTab.value = 'boards'
  },
)
</script>

<style scoped>
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

.backdrop-enter-active,
.backdrop-leave-active {
  transition: opacity 0.25s ease;
}
.backdrop-enter-from,
.backdrop-leave-to {
  opacity: 0;
}

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

.tabular-nums {
  font-variant-numeric: tabular-nums;
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
