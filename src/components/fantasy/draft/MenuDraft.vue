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
        class="fixed top-[calc(3rem+env(safe-area-inset-top,0px))] sm:top-[calc(3.5rem+env(safe-area-inset-top,0px))] bottom-[52px] right-0 z-[100] overflow-y-auto overscroll-contain bg-white dark:bg-gray-900 transition-[left] duration-300"
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

    <!-- Nav bar -->
    <nav
      aria-label="Draft navigation"
      class="fixed bottom-0 right-0 z-[100] bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-t border-gray-100 dark:border-gray-800 transition-[left] duration-300"
      :style="{ left: `${leftOffset}px` }"
    >
      <div
        class="flex items-center justify-around px-1 pt-1.5 pb-1.5"
        style="padding-bottom: max(0.375rem, env(safe-area-inset-bottom, 0.375rem))"
      >
        <!-- Draft (home) -->
        <button
          @click="handleTabChange('draft')"
          :class="[
            'flex flex-col items-center justify-center gap-0.5 w-16 py-1 rounded-xl transition-colors duration-150',
            activeTab === null || activeTab === 'draft'
              ? 'text-blue-500 dark:text-blue-400'
              : 'text-gray-400 dark:text-gray-500 active:text-gray-600'
          ]"
          aria-label="Draft Room"
        >
          <v-icon
            name="gi-soccer-ball"
            :class="['w-[22px] h-[22px] transition-transform duration-150', activeTab === null || activeTab === 'draft' ? 'scale-110' : '']"
          />
          <span class="text-[10px] font-medium leading-tight">Draft</span>
        </button>

        <!-- Boards -->
        <button
          @click="handleTabChange('boards')"
          :class="[
            'flex flex-col items-center justify-center gap-0.5 w-16 py-1 rounded-xl transition-colors duration-150',
            activeTab === 'boards'
              ? 'text-blue-500 dark:text-blue-400'
              : 'text-gray-400 dark:text-gray-500 active:text-gray-600'
          ]"
          aria-label="Draft Board"
        >
          <v-icon
            name="hi-solid-clipboard-list"
            :class="['w-[22px] h-[22px] transition-transform duration-150', activeTab === 'boards' ? 'scale-110' : '']"
          />
          <span class="text-[10px] font-medium leading-tight">Boards</span>
        </button>

        <!-- League -->
        <button
          @click="handleTabChange('league')"
          class="flex flex-col items-center justify-center gap-0.5 w-16 py-1 rounded-xl transition-colors duration-150 text-gray-400 dark:text-gray-500 active:text-gray-600"
          aria-label="League Detail"
        >
          <v-icon
            name="bi-trophy-fill"
            class="w-[22px] h-[22px] transition-transform duration-150"
          />
          <span class="text-[10px] font-medium leading-tight">League</span>
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
