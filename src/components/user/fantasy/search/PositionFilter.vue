<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue'

interface PositionFilterOption {
  code: string
  name: string
  icon: string
  color: string
  activeClasses: string
  slots?: number
}

interface Props {
  filters: PositionFilterOption[]
  selectedPosition: string
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
})

const emit = defineEmits<{
  'update:selectedPosition': [value: string]
}>()

// Edge fade hint: the pill row overflows on narrow phones with no visual cue
// that it scrolls — same pattern as TopTabsBar.vue.
const scrollContainerRef = ref<HTMLElement | null>(null)
const canScrollLeft = ref(false)
const canScrollRight = ref(false)

const updateEdges = (): void => {
  const el = scrollContainerRef.value
  if (!el) return
  canScrollLeft.value = el.scrollLeft > 2
  canScrollRight.value = el.scrollLeft < el.scrollWidth - el.clientWidth - 2
}

onMounted(() => {
  nextTick(updateEdges)
  window.addEventListener('resize', updateEdges)
})
onUnmounted(() => window.removeEventListener('resize', updateEdges))

watch(() => props.filters, () => nextTick(updateEdges))
</script>

<template>
  <div class="px-1 relative">
    <div
      ref="scrollContainerRef"
      class="flex items-center gap-2 overflow-x-auto scrollbar-hide py-1"
      @scroll="updateEdges"
    >
      <button
        v-for="filter in filters"
        :key="filter.code"
        @click="emit('update:selectedPosition', filter.code)"
        :disabled="disabled"
        class="inline-flex items-center gap-1.5 h-11 px-3.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 active:scale-[0.96] shrink-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
        :class="[
          selectedPosition === filter.code
            ? filter.activeClasses + ' shadow-sm'
            : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 active:bg-gray-50 dark:active:bg-gray-700/50',
        ]"
      >
        <v-icon
          :name="filter.icon"
          class="w-3.5 h-3.5"
          :class="[
            selectedPosition === filter.code
              ? 'text-current'
              : filter.color,
          ]"
        />
        {{ filter.name }}
      </button>
    </div>

    <!-- Edge fades hinting there are more pills to scroll to. -->
    <div
      class="filter-edge-fade left-0 bg-gradient-to-r from-gray-50 dark:from-gray-900 to-transparent"
      :class="canScrollLeft ? 'opacity-100' : 'opacity-0'"
      aria-hidden="true"
    />
    <div
      class="filter-edge-fade right-0 bg-gradient-to-l from-gray-50 dark:from-gray-900 to-transparent"
      :class="canScrollRight ? 'opacity-100' : 'opacity-0'"
      aria-hidden="true"
    />
  </div>
</template>

<style scoped>
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

.filter-edge-fade {
  position: absolute;
  top: 0.25rem;
  bottom: 0.25rem;
  width: 1.25rem;
  pointer-events: none;
  transition: opacity 0.2s ease;
}
</style>
