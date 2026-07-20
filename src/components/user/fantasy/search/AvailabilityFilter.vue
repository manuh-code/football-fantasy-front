<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

interface Props {
  selectedAvailability: string
  disabled?: boolean
}

withDefaults(defineProps<Props>(), {
  disabled: false,
})

const emit = defineEmits<{
  'update:selectedAvailability': [value: string]
}>()

const { t } = useI18n()

interface AvailabilityOption {
  code: string
  name: string
  icon: string
  color: string
  activeClasses: string
}

// Fixed set of availability states — colors encode meaning:
// available = emerald (free), all = gray (neutral), taken = rose (occupied).
const options = computed<AvailabilityOption[]>(() => [
  {
    code: 'available',
    name: t('fantasy.search.availabilityAvailable'),
    icon: 'hi-solid-check-circle',
    color: 'text-emerald-600 dark:text-emerald-400',
    activeClasses:
      'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/20',
  },
  {
    code: 'all',
    name: t('fantasy.search.availabilityAll'),
    icon: 'hi-solid-view-grid',
    color: 'text-gray-600 dark:text-gray-400',
    activeClasses: 'text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700/60',
  },
  {
    code: 'taken',
    name: t('fantasy.search.availabilityTaken'),
    icon: 'hi-solid-lock-closed',
    color: 'text-rose-600 dark:text-rose-400',
    activeClasses:
      'text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-900/20',
  },
])
</script>

<template>
  <div class="px-1">
    <div class="flex items-center gap-2 overflow-x-auto scrollbar-hide py-1">
      <button
        v-for="option in options"
        :key="option.code"
        @click="emit('update:selectedAvailability', option.code)"
        :disabled="disabled"
        class="inline-flex items-center gap-1.5 h-11 px-3.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 active:scale-[0.96] shrink-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
        :class="[
          selectedAvailability === option.code
            ? option.activeClasses + ' shadow-sm'
            : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 active:bg-gray-50 dark:active:bg-gray-700/50',
        ]"
      >
        <v-icon
          :name="option.icon"
          class="w-3.5 h-3.5"
          :class="[
            selectedAvailability === option.code ? 'text-current' : option.color,
          ]"
        />
        {{ option.name }}
      </button>
    </div>
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
</style>
