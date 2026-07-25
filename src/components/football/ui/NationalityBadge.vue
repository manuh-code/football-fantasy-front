<script setup lang="ts">
import { computed } from "vue";
import type { CountryResponse } from "@/interfaces/country/CountryResponse";

// Small nationality chip (flag + FIFA code) shared across lineup / matchup rows
// so the treatment stays identical everywhere. Renders nothing when there is no
// country data worth showing — and never an empty chip when the flag is missing.
const props = defineProps<{
  country: CountryResponse | null | undefined;
}>();

// Short, uppercase code for information scent (flags alone are hard to tell
// apart at 14px). Prefers the FIFA name, falls back to the country name.
const code = computed(() => {
  const c = props.country;
  if (!c) return "";
  return (c.fifa_name || c.name || "").slice(0, 3).toUpperCase();
});

const label = computed(() => props.country?.name || props.country?.fifa_name || "");

// Only render when there is something meaningful to show (a flag or a code).
const hasContent = computed(
  () => !!props.country && (!!props.country.image_path || !!code.value),
);
</script>

<template>
  <span
    v-if="hasContent"
    class="inline-flex items-center gap-1 pl-0.5 pr-1.5 py-0.5 bg-gray-100/80 dark:bg-gray-700/50 rounded-md ring-1 ring-black/5 dark:ring-white/10"
    :title="label"
    :aria-label="label"
  >
    <img
      v-if="country?.image_path"
      :src="country.image_path"
      :alt="label"
      class="w-3.5 h-3.5 rounded-[3px] object-cover shrink-0 ring-1 ring-black/10 dark:ring-white/10"
      loading="lazy"
    />
    <span
      v-if="code"
      class="text-2xs font-semibold uppercase tracking-wide leading-none text-gray-600 dark:text-gray-300"
    >{{ code }}</span>
  </span>
</template>
