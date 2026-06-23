<script setup lang="ts">
withDefaults(
  defineProps<{ title?: string; icon?: string; message?: string }>(),
  {
    title: "Coming soon",
    icon: "hi-solid-sparkles",
    message: "This section is under construction. Stay tuned!",
  }
);
</script>

<template>
  <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 py-14 px-6 text-center">
    <div class="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gray-100 dark:bg-gray-700/60 flex items-center justify-center">
      <v-icon :name="icon" class="w-7 h-7 text-gray-300 dark:text-gray-500" />
    </div>
    <h3 class="text-callout font-semibold text-gray-900 dark:text-white mb-1">{{ title }}</h3>
    <p class="text-footnote text-gray-400 dark:text-gray-500 max-w-xs mx-auto leading-relaxed">
      {{ message }}
    </p>
    <span class="inline-flex items-center gap-1.5 mt-4 px-3 py-1 rounded-full text-2xs font-semibold bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400">
      <v-icon name="hi-solid-sparkles" class="w-3 h-3" />
      Under construction
    </span>
  </div>
</template>
