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
</script>

<script lang="ts">
import { computed } from 'vue'
export default { name: 'RoundSelector' }
</script>

<template>
  <div class="w-full">
    <!-- Loading -->
    <div v-if="isLoadingRounds" class="flex items-center justify-center py-3">
      <v-icon name="pr-spinner" class="w-4 h-4 text-gray-300 dark:text-gray-600" animation="spin" />
    </div>

    <!-- Stepper -->
    <div v-else class="flex items-center">
      <!-- Prev arrow -->
      <button
        @click="emit('selectPrevious')"
        :disabled="!canSelectPrevious || isLoadingContent"
        class="shrink-0 w-9 h-9 flex items-center justify-center rounded-full transition-all active:scale-90"
        :class="canSelectPrevious && !isLoadingContent
          ? 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
          : 'text-gray-200 dark:text-gray-700 pointer-events-none'"
      >
        <v-icon name="hi-solid-chevron-left" class="w-4 h-4" />
      </button>

      <!-- Center: round info -->
      <div class="flex-1 flex flex-col items-center justify-center min-w-0 select-none">
        <div class="flex items-center gap-1.5">
          <span class="text-[13px] font-bold text-gray-900 dark:text-white truncate">
            {{ selectedRound ? extractRoundLabel(selectedRound.round.name) : '—' }}
          </span>
          <!-- Status badge -->
          <span
            v-if="selectedRound?.is_current"
            class="inline-flex items-center px-1.5 py-0.5 text-[9px] font-bold uppercase rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 leading-none"
          >
            Live
          </span>
          <span
            v-else-if="selectedRound?.is_completed"
            class="inline-flex items-center px-1.5 py-0.5 text-[9px] font-bold uppercase rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 leading-none"
          >
            Final
          </span>
        </div>
        <span
          v-if="selectedRound"
          class="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5"
        >
          {{ formatRoundDate(selectedRound.round.starting_at) }}
        </span>

        <!-- Loading indicator -->
        <div v-if="isLoadingContent" class="mt-1.5 w-8 h-0.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
          <div class="h-full w-full bg-blue-500 rounded-full animate-[loading_1s_ease-in-out_infinite]" />
        </div>
      </div>

      <!-- Next arrow -->
      <button
        @click="emit('selectNext')"
        :disabled="!canSelectNext || isLoadingContent"
        class="shrink-0 w-9 h-9 flex items-center justify-center rounded-full transition-all active:scale-90"
        :class="canSelectNext && !isLoadingContent
          ? 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
          : 'text-gray-200 dark:text-gray-700 pointer-events-none'"
      >
        <v-icon name="hi-solid-chevron-right" class="w-4 h-4" />
      </button>
    </div>
  </div>
</template>

<style scoped>
@keyframes loading {
  0%, 100% { transform: translateX(-100%); }
  50% { transform: translateX(100%); }
}
</style>
