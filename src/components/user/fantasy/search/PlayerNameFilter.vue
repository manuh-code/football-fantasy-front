<script setup lang="ts">
import { ref, watch } from 'vue'

interface Props {
  disabled?: boolean
}

withDefaults(defineProps<Props>(), {
  disabled: false,
})

const emit = defineEmits<{
  search: [value: string]
}>()

const query = ref('')
let debounceTimer: ReturnType<typeof setTimeout> | null = null

watch(query, (value) => {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    emit('search', value.trim())
  }, 400)
})

function clear() {
  query.value = ''
  emit('search', '')
}
</script>

<template>
  <div class="relative">
    <v-icon
      name="hi-solid-search"
      class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 pointer-events-none"
    />
    <input
      v-model="query"
      type="text"
      :disabled="disabled"
      placeholder="Search player..."
      class="w-full pl-9 pr-9 py-2.5 text-[13px] text-gray-900 dark:text-white bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 dark:focus:border-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    />
    <button
      v-if="query"
      @click="clear"
      class="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
    >
      <v-icon name="hi-solid-x-circle" class="w-4 h-4" />
    </button>
  </div>
</template>
