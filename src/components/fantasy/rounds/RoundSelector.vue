<script setup lang="ts">
import type { FantasyRoundResponse } from '@/interfaces/fantasy/rounds/FantasyRoundResponse'

interface Props {
  rounds: FantasyRoundResponse[]
  selectedRoundUuid: string | null
  isLoadingRounds?: boolean
  isLoadingContent?: boolean
  canSelectPrevious: boolean
  canSelectNext: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isLoadingRounds: false,
  isLoadingContent: false,
})

const emit = defineEmits<{
  (e: 'update:selectedRoundUuid', uuid: string): void
  (e: 'selectPrevious'): void
  (e: 'selectNext'): void
}>()

/**
 * Extract a short label from the round name (e.g. "Regular Season - 10" → "J10")
 */
function extractRoundLabel(name: string): string {
  const match = name.match(/(\d+)/)
  return match ? `J${match[1]}` : name.substring(0, 6)
}

/**
 * Format a date string to a short, readable format.
 */
function formatRoundDate(dateStr: string): string {
  try {
    const date = new Date(dateStr)
    return date.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })
  } catch {
    return ''
  }
}

const selectedRound = computed(() =>
  props.rounds.find((r) => r.uuid === props.selectedRoundUuid) || null
)

// Template refs for scrolling
const roundsScrollContainer = ref<HTMLElement | null>(null)
const selectedRoundEl = ref<HTMLElement | null>(null)

function selectRound(uuid: string) {
  emit('update:selectedRoundUuid', uuid)
}

defineExpose({
  roundsScrollContainer,
  selectedRoundEl,
})
</script>

<script lang="ts">
import { ref, computed } from 'vue'
export default { name: 'RoundSelector' }
</script>

<template>
  <div
    class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
  >
    <!-- Header with navigation arrows -->
    <div
      class="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700"
    >
      <div class="flex items-center gap-2">
        <v-icon
          name="hi-solid-calendar"
          class="w-4 h-4 text-blue-500 dark:text-blue-400"
        />
        <span class="text-sm font-semibold text-gray-700 dark:text-gray-300">Round</span>
      </div>

      <!-- Prev/Next arrows -->
      <div class="flex items-center gap-1">
        <button
          @click="emit('selectPrevious')"
          :disabled="!canSelectPrevious || isLoadingContent"
          class="p-1.5 rounded-lg transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          title="Previous round"
        >
          <v-icon name="hi-solid-chevron-left" class="w-4 h-4" />
        </button>
        <button
          @click="emit('selectNext')"
          :disabled="!canSelectNext || isLoadingContent"
          class="p-1.5 rounded-lg transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          title="Next round"
        >
          <v-icon name="hi-solid-chevron-right" class="w-4 h-4" />
        </button>
      </div>
    </div>

    <!-- Scrollable round chips -->
    <div
      ref="roundsScrollContainer"
      class="flex gap-2 px-4 py-3 overflow-x-auto scrollbar-hide scroll-smooth"
    >
      <button
        v-for="round in rounds"
        :key="round.uuid"
        :ref="(el) => { if (round.uuid === selectedRoundUuid) selectedRoundEl = el as HTMLElement }"
        @click="selectRound(round.uuid)"
        :disabled="isLoadingContent"
        class="relative flex-shrink-0 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 border disabled:opacity-50 disabled:cursor-not-allowed"
        :class="[
          round.uuid === selectedRoundUuid
            ? round.is_current
              ? 'bg-blue-500 text-white border-blue-500 shadow-md shadow-blue-500/25'
              : round.is_completed
                ? 'bg-green-500 text-white border-green-500 shadow-md shadow-green-500/25'
                : 'bg-gray-800 dark:bg-white text-white dark:text-gray-900 border-gray-800 dark:border-white shadow-md'
            : round.is_current
              ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/30'
              : round.is_completed
                ? 'bg-gray-50 dark:bg-gray-700/30 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                : 'bg-white dark:bg-gray-700/20 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/40',
        ]"
      >
        <!-- Current round indicator dot -->
        <span
          v-if="round.is_current && round.uuid !== selectedRoundUuid"
          class="absolute -top-1 -right-1 w-2.5 h-2.5 bg-blue-500 rounded-full border-2 border-white dark:border-gray-800 animate-pulse"
        ></span>

        <div class="flex items-center gap-1.5">
          <v-icon
            v-if="round.is_completed"
            name="hi-solid-check-circle"
            class="w-3 h-3"
            :class="round.uuid === selectedRoundUuid ? 'text-white/80' : 'text-green-400 dark:text-green-500'"
          />
          {{ extractRoundLabel(round.round.name) }}
        </div>
      </button>
    </div>

    <!-- Selected round detail bar -->
    <div
      v-if="selectedRound"
      class="flex items-center justify-between px-4 py-2.5 bg-gray-50 dark:bg-gray-700/30 border-t border-gray-100 dark:border-gray-700"
    >
      <div class="flex items-center gap-2 min-w-0">
        <span class="text-sm font-medium text-gray-900 dark:text-white truncate">
          {{ selectedRound.round.name }}
        </span>
        <span
          v-if="selectedRound.is_current"
          class="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-[10px] font-bold rounded-full whitespace-nowrap"
        >
          <span class="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span>
          LIVE
        </span>
        <span
          v-else-if="selectedRound.is_completed"
          class="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-[10px] font-bold rounded-full whitespace-nowrap"
        >
          <v-icon name="hi-solid-check" class="w-2.5 h-2.5" />
          DONE
        </span>
      </div>
      <span
        v-if="selectedRound.round.starting_at"
        class="text-[11px] text-gray-500 dark:text-gray-400 whitespace-nowrap ml-2"
      >
        {{ formatRoundDate(selectedRound.round.starting_at) }}
      </span>
    </div>

    <!-- Loading indicators -->
    <div
      v-if="isLoadingRounds"
      class="px-4 py-3 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400"
    >
      <v-icon name="pr-spinner" class="w-4 h-4" animation="spin" />
      <span>Loading rounds...</span>
    </div>
    <div
      v-else-if="isLoadingContent"
      class="px-4 py-2 flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500 border-t border-gray-100 dark:border-gray-700"
    >
      <v-icon name="pr-spinner" class="w-3 h-3" animation="spin" />
      <span>Loading...</span>
    </div>
  </div>
</template>

<style scoped>
/* Hide scrollbar for round chips */
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>
