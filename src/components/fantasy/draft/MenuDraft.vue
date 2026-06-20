<template>
  <Teleport to="body">
    <!-- Backdrop -->
    <Transition name="backdrop">
      <div
        v-if="activeTab !== null"
        class="fixed inset-0 z-[99] bg-black/20 dark:bg-black/40"
        @click="closePanel"
      />
    </Transition>

    <!-- Fullscreen panel -->
    <Transition name="slide-up">
      <div
        v-if="activeTab === 'boards'"
        class="fixed top-[calc(3rem+env(safe-area-inset-top,0px))] sm:top-[calc(3.5rem+env(safe-area-inset-top,0px))] bottom-[72px] right-0 z-[100] overflow-y-auto overscroll-contain bg-white dark:bg-gray-900 transition-[left] duration-300"
        :style="{ left: `${leftOffset}px` }"
      >
        <div class="px-2 py-2 h-full">
          <DraftPlayerPicked
            ref="draftPickedRef"
            :fantasyLeagueUuid="fantasyLeagueUuid"
          />
        </div>
      </div>
    </Transition>

    <!-- Nav bar — floating glass pill (matches BottomNavBar), centered in the
         area to the right of the drawer so it tracks the drawer width. -->
    <nav
      aria-label="Draft navigation"
      class="fixed right-0 bottom-0 z-[100] pointer-events-none flex justify-center transition-[left] duration-300"
      :style="{ left: `${leftOffset}px`, paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom, 0.75rem))' }"
    >
      <div
        class="pointer-events-auto flex items-center gap-0.5 p-1 rounded-full max-w-[calc(100%-1rem)] bg-white/75 dark:bg-gray-900/65 backdrop-blur-xl border border-black/[0.04] dark:border-white/10 shadow-lg shadow-black/5 dark:shadow-black/30"
      >
        <!-- Draft (home) -->
        <button
          @click="handleTabChange('draft')"
          type="button"
          aria-label="Draft Room"
          :aria-current="activeTab === null || activeTab === 'draft' ? 'page' : undefined"
          class="flex flex-col items-center justify-center gap-0.5 px-3.5 py-1.5 rounded-full transition-all duration-200 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30"
          :class="activeTab === null || activeTab === 'draft'
            ? 'text-blue-600 dark:text-blue-400 bg-blue-500/10 dark:bg-blue-400/10'
            : 'text-gray-400 dark:text-gray-500 active:text-gray-600 dark:active:text-gray-300'"
        >
          <v-icon name="gi-soccer-ball" class="w-5 h-5" />
          <span class="text-2xs font-semibold tracking-tight leading-none">Draft</span>
        </button>

        <!-- Boards -->
        <button
          @click="handleTabChange('boards')"
          type="button"
          aria-label="Draft Board"
          :aria-current="activeTab === 'boards' ? 'page' : undefined"
          class="flex flex-col items-center justify-center gap-0.5 px-3.5 py-1.5 rounded-full transition-all duration-200 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30"
          :class="activeTab === 'boards'
            ? 'text-blue-600 dark:text-blue-400 bg-blue-500/10 dark:bg-blue-400/10'
            : 'text-gray-400 dark:text-gray-500 active:text-gray-600 dark:active:text-gray-300'"
        >
          <v-icon name="hi-solid-clipboard-list" class="w-5 h-5" />
          <span class="text-2xs font-semibold tracking-tight leading-none">Boards</span>
        </button>

        <!-- League -->
        <button
          @click="handleTabChange('league')"
          type="button"
          aria-label="League Detail"
          class="flex flex-col items-center justify-center gap-0.5 px-3.5 py-1.5 rounded-full transition-all duration-200 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30 text-gray-400 dark:text-gray-500 active:text-gray-600 dark:active:text-gray-300"
        >
          <v-icon name="bi-trophy-fill" class="w-5 h-5" />
          <span class="text-2xs font-semibold tracking-tight leading-none">League</span>
        </button>
      </div>
    </nav>
  </Teleport>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import DraftPlayerPicked from '@/components/fantasy/draft/DraftPlayerPicked.vue'
import type { FantasyDraftPlayerPicked } from '@/interfaces/fantasy/draft/FantasyDraftPlayerPicked'

const router = useRouter()

const props = withDefaults(defineProps<{
  leftOffset?: number
  fantasyLeagueUuid: string
}>(), {
  leftOffset: 0,
})

const activeTab = ref<string | null>(null)
const draftPickedRef = ref<InstanceType<typeof DraftPlayerPicked> | null>(null)

function handleTabChange(tab: string) {
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
  transition: transform 0.28s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.2s ease;
}
.slide-up-leave-active {
  transition: transform 0.22s cubic-bezier(0.5, 0, 0.75, 0), opacity 0.18s ease;
}
.slide-up-enter-from {
  transform: translateY(100%);
  opacity: 0;
}
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
</style>
