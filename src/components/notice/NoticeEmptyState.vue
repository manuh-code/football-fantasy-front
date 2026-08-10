<template>
  <!-- Un vacío explicado: dice qué va a aparecer aquí, no sólo que no hay nada. -->
  <div class="flex flex-col items-center justify-center text-center px-6 py-12">
    <div
      class="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center"
      aria-hidden="true"
    >
      <v-icon name="hi-solid-bell" class="w-6 h-6 text-gray-400 dark:text-gray-500" />
    </div>
    <p class="mt-4 text-callout font-bold text-gray-900 dark:text-white">
      {{ $t("notice.empty.title") }}
    </p>
    <p class="mt-1.5 text-footnote leading-relaxed text-gray-600 dark:text-gray-400 max-w-[38ch]">
      {{ $t("notice.empty.body") }}
    </p>
  </div>
</template>
