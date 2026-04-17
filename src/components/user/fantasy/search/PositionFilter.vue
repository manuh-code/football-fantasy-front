<script setup lang="ts">
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

withDefaults(defineProps<Props>(), {
  disabled: false,
})

const emit = defineEmits<{
  'update:selectedPosition': [value: string]
}>()
</script>

<template>
  <div class="px-1">
    <div class="flex items-center gap-2 overflow-x-auto scrollbar-hide py-1">
      <button
        v-for="filter in filters"
        :key="filter.code"
        @click="emit('update:selectedPosition', filter.code)"
        :disabled="disabled"
        class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[12px] font-semibold whitespace-nowrap transition-all duration-200 active:scale-[0.96] shrink-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
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
