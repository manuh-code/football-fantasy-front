<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
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

const { t } = useI18n()

/**
 * Extract a short label from the round name (e.g. "Regular Season - 10" → "Jornada 10")
 */
function extractRoundLabel(name: string): string {
  const match = name.match(/(\d+)/)
  return match ? `${t('football.rounds.rounds')} ${match[1]}` : name.substring(0, 6)
}

const selectedIndex = computed(() =>
  props.rounds.findIndex((r) => r.uuid === props.selectedRoundUuid)
)

const stripRef = ref<HTMLElement | null>(null)

// --- Mouse drag-to-scroll (touch/pen keep native scrolling) ---
const isDragging = ref(false)
let startX = 0
let startScroll = 0
let moved = false
let activePointer: number | null = null

const onPointerDown = (e: PointerEvent) => {
  if (e.pointerType !== 'mouse') return
  const strip = stripRef.value
  if (!strip) return
  isDragging.value = true
  moved = false
  startX = e.clientX
  startScroll = strip.scrollLeft
  activePointer = e.pointerId
  strip.setPointerCapture(e.pointerId)
}

const onPointerMove = (e: PointerEvent) => {
  if (!isDragging.value) return
  const strip = stripRef.value
  if (!strip) return
  const dx = e.clientX - startX
  if (Math.abs(dx) > 3) moved = true
  strip.scrollLeft = startScroll - dx
}

const onPointerUp = () => {
  if (!isDragging.value) return
  isDragging.value = false
  const strip = stripRef.value
  if (strip && activePointer !== null) {
    try {
      strip.releasePointerCapture(activePointer)
    } catch {
      /* pointer already released */
    }
  }
  activePointer = null
  // Reset after the (suppressed) click has had a chance to fire.
  setTimeout(() => (moved = false), 0)
}

// --- Selection ---
const onRoundClick = (round: FantasyRoundResponse) => {
  if (moved) return // ignore clicks that were actually drags
  if (props.isLoadingContent || round.uuid === props.selectedRoundUuid) return
  emit('update:selectedRoundUuid', round.uuid)
}

// --- Keep the selected round centered ---
const centerSelected = async () => {
  await nextTick()
  const strip = stripRef.value
  if (!strip || selectedIndex.value < 0) return
  const button = strip.querySelectorAll('button')[selectedIndex.value] as HTMLElement | undefined
  if (!button) return
  const stripRect = strip.getBoundingClientRect()
  const btnRect = button.getBoundingClientRect()
  const target =
    strip.scrollLeft + (btnRect.left - stripRect.left) - (stripRect.width / 2 - btnRect.width / 2)
  strip.scrollTo({ left: target, behavior: 'smooth' })
}

watch(() => props.selectedRoundUuid, centerSelected)
watch(() => props.rounds, () => nextTick(centerSelected), { deep: false })
onMounted(centerSelected)
</script>

<script lang="ts">
export default { name: 'RoundSelector' }
</script>

<template>
  <div class="w-full">
    <!-- Loading -->
    <div v-if="isLoadingRounds" class="flex items-center justify-center py-3">
      <v-icon name="pr-spinner" class="w-4 h-4 text-gray-300 dark:text-gray-600" animation="spin" />
    </div>

    <!-- Swipeable round strip -->
    <div v-else class="flex items-center gap-1.5">
      <!-- Prev -->
      <button
        type="button"
        @click="emit('selectPrevious')"
        :disabled="!canSelectPrevious || isLoadingContent"
        :aria-label="$t('football.rounds.previous')"
        class="shrink-0 p-1.5 rounded-full text-gray-400 dark:text-gray-500 active:text-emerald-500 disabled:opacity-30 disabled:pointer-events-none transition-colors"
      >
        <v-icon name="hi-solid-chevron-left" class="w-5 h-5" />
      </button>

      <!-- Draggable / swipeable strip -->
      <div
        ref="stripRef"
        class="flex-1 flex gap-2 overflow-x-auto hide-scrollbar snap-x snap-mandatory px-1 py-1 select-none cursor-grab transition-opacity"
        :class="[
          { 'cursor-grabbing': isDragging },
          isLoadingContent ? 'opacity-50 pointer-events-none' : '',
        ]"
        @pointerdown="onPointerDown"
        @pointermove="onPointerMove"
        @pointerup="onPointerUp"
        @pointercancel="onPointerUp"
        @pointerleave="onPointerUp"
      >
        <button
          v-for="round in rounds"
          :key="round.uuid"
          type="button"
          @click="onRoundClick(round)"
          :class="[
            'snap-center shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all active:scale-95',
            round.uuid === selectedRoundUuid
              ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25'
              : round.is_completed
                ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300',
          ]"
        >
          {{ extractRoundLabel(round.round.name) }}
          <span
            v-if="round.is_current"
            class="relative inline-flex w-2 h-2 rounded-full"
            :class="round.uuid === selectedRoundUuid ? 'bg-white' : 'bg-emerald-400'"
          >
            <span
              class="absolute inset-0 rounded-full animate-ping"
              :class="round.uuid === selectedRoundUuid ? 'bg-white/70' : 'bg-emerald-400/60'"
            />
          </span>
        </button>
      </div>

      <!-- Next -->
      <button
        type="button"
        @click="emit('selectNext')"
        :disabled="!canSelectNext || isLoadingContent"
        :aria-label="$t('football.rounds.next')"
        class="shrink-0 p-1.5 rounded-full text-gray-400 dark:text-gray-500 active:text-emerald-500 disabled:opacity-30 disabled:pointer-events-none transition-colors"
      >
        <v-icon name="hi-solid-chevron-right" class="w-5 h-5" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}
.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

@media (prefers-reduced-motion: reduce) {
  .animate-ping {
    animation: none !important;
  }
  * {
    transition: none !important;
    transform: none !important;
  }
}
</style>
