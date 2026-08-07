<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import BottomSheet from "@/components/ui/BottomSheet.vue";
import type { PlayerStatisticOption } from "@/interfaces/football/player/FootballPlayerStatisticByStageResponse";

/**
 * Picker for which statistics the panel ranks.
 *
 * A stage reports dozens of metrics and the panel can only show a handful at a
 * time, so the choice lives here rather than in a chip rail that would run off
 * the screen. Selection is staged inside the sheet and only applied on confirm:
 * every toggle otherwise costs a request and reshuffles the list under the
 * user's thumb while they are still deciding.
 */
const props = defineProps<{
  isOpen: boolean;
  options: PlayerStatisticOption[];
  selected: string[];
}>();

const emit = defineEmits<{
  close: [];
  apply: [keys: string[]];
}>();

const { t } = useI18n();

const MAX_SELECTED = 12;

const draft = ref<string[]>([]);
const search = ref("");
const searchInput = ref<HTMLInputElement | null>(null);

// Reopening always starts from what is on screen, never from a half-finished
// edit the user abandoned last time.
watch(
  () => props.isOpen,
  (open) => {
    if (!open) return;
    draft.value = [...props.selected];
    search.value = "";
    nextTick(() => searchInput.value?.focus());
  },
  { immediate: true },
);

// Stat names are accented in Spanish ("Calificación"); searching should not
// require the user to type the accent.
const normalize = (value: string): string =>
  value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

const groups = computed(() => {
  const term = normalize(search.value.trim());
  const map = new Map<string, { label: string; options: PlayerStatisticOption[] }>();

  for (const option of props.options) {
    if (term && !normalize(option.name).includes(term)) continue;
    const group = map.get(option.stat_group_key) ?? { label: option.stat_group, options: [] };
    group.options.push(option);
    map.set(option.stat_group_key, group);
  }

  return Array.from(map, ([key, group]) => ({ key, ...group }));
});

const matchCount = computed(() =>
  groups.value.reduce((total, group) => total + group.options.length, 0),
);

const isSelected = (key: string): boolean => draft.value.includes(key);
const isFull = computed(() => draft.value.length >= MAX_SELECTED);

const toggle = (key: string): void => {
  const at = draft.value.indexOf(key);
  if (at !== -1) {
    draft.value.splice(at, 1);
    return;
  }
  if (isFull.value) return;
  draft.value.push(key);
};

const apply = (): void => {
  if (draft.value.length === 0) return;
  emit("apply", [...draft.value]);
};
</script>

<template>
  <BottomSheet
    :is-visible="isOpen"
    :title="t('football.statistics.filter.title')"
    :subtitle="t('football.statistics.filter.subtitle', { count: draft.length, max: MAX_SELECTED })"
    icon="hi-solid-adjustments"
    icon-variant="emerald"
    size="xl"
    role="dialog"
    @close="emit('close')"
  >
    <!-- Search: the list is long enough that scanning it beats scrolling it -->
    <div class="sticky -top-px z-10 -mx-1 px-1 pb-3 bg-white dark:bg-gray-800">
      <label class="relative block">
        <span class="sr-only">{{ t('football.statistics.filter.searchLabel') }}</span>
        <v-icon
          name="hi-solid-search"
          class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 pointer-events-none"
          aria-hidden="true"
        />
        <input
          ref="searchInput"
          v-model="search"
          type="search"
          autocomplete="off"
          :placeholder="t('football.statistics.filter.searchPlaceholder')"
          class="w-full h-11 pl-9 pr-3 rounded-xl text-footnote bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        />
      </label>
    </div>

    <p
      v-if="matchCount === 0"
      class="py-10 text-center text-footnote text-gray-400 dark:text-gray-500"
    >
      {{ t('football.statistics.filter.noMatches', { term: search.trim() }) }}
    </p>

    <div v-for="group in groups" :key="group.key" class="mb-4 last:mb-0">
      <div class="flex items-center gap-3 mb-2">
        <span class="text-2xs font-bold tracking-[0.16em] uppercase text-gray-400 dark:text-gray-500 shrink-0">
          {{ group.label }}
        </span>
        <span class="flex-1 h-px bg-gray-100 dark:bg-gray-700/60" />
      </div>

      <div class="flex flex-wrap gap-2">
        <button
          v-for="option in group.options"
          :key="option.key"
          type="button"
          role="checkbox"
          :aria-checked="isSelected(option.key)"
          :disabled="!isSelected(option.key) && isFull"
          class="inline-flex items-center gap-1.5 min-h-[44px] px-3 py-2 rounded-xl text-footnote font-medium border transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          :class="isSelected(option.key)
            ? 'bg-emerald-50 dark:bg-emerald-500/15 border-emerald-500 text-emerald-700 dark:text-emerald-300'
            : 'bg-white dark:bg-gray-900/40 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'"
          @click="toggle(option.key)"
        >
          <v-icon
            v-if="isSelected(option.key)"
            name="hi-solid-check"
            class="w-3.5 h-3.5 shrink-0"
            aria-hidden="true"
          />
          <span>{{ option.name }}</span>
        </button>
      </div>
    </div>

    <template #footer>
      <div class="flex items-center gap-3">
        <button
          type="button"
          class="h-11 px-4 rounded-xl text-footnote font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/60 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 cursor-pointer"
          @click="emit('close')"
        >
          {{ t('common.actions.cancel') }}
        </button>
        <button
          type="button"
          :disabled="draft.length === 0"
          class="flex-1 h-11 rounded-xl text-footnote font-bold text-white bg-emerald-500 hover:bg-emerald-600 active:scale-[0.99] transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          @click="apply"
        >
          {{ t('football.statistics.filter.apply', { count: draft.length }) }}
        </button>
      </div>
    </template>
  </BottomSheet>
</template>
