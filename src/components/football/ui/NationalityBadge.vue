<script setup lang="ts">
import type { CountryResponse } from "@/interfaces/country/CountryResponse";

// Small nationality chip (flag + FIFA code) shared across lineup / matchup rows
// so the treatment stays identical everywhere. Renders nothing when there is no
// country data to show.
defineProps<{
  country: CountryResponse | null | undefined;
}>();
</script>

<template>
  <span
    v-if="country && (country.image_path || country.fifa_name || country.name)"
    class="inline-flex items-center gap-1 px-1.5 py-0.5 bg-gray-50 dark:bg-gray-700/40 rounded-md"
    :title="country.name || country.fifa_name || ''"
  >
    <img
      v-if="country.image_path"
      :src="country.image_path"
      :alt="country.name || country.fifa_name || ''"
      class="w-3.5 h-3.5 rounded object-cover shrink-0"
      loading="lazy"
    />
    <span
      v-if="country.fifa_name || country.name"
      class="text-2xs font-semibold text-gray-700 dark:text-gray-200 leading-none"
    >
      {{ country.fifa_name || country.name }}
    </span>
  </span>
</template>
