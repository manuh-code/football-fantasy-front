<script setup lang="ts">
import { ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import BottomSheet from "@/components/ui/BottomSheet.vue";
import { footballPlayerService } from "@/services/football/player/FootballPlayerService";
import type {
  FootballPlayerStatisticByStageResponse,
  FootballStatisticDetail,
} from "@/interfaces/football/player/FootballPlayerStatisticByStageResponse";
import { formatPlayerStatValue } from "@/utils/playerStatistics";

/**
 * The full ranking for one statistic.
 *
 * The panel behind it only holds a podium, so the rest is fetched when the
 * drawer opens rather than shipped with every card: a busy stat runs to several
 * hundred players and nine of those lists is most of a megabyte nobody reads.
 */
const props = defineProps<{
  statistic: FootballPlayerStatisticByStageResponse | null;
  stageUuid: string;
  isOpen: boolean;
}>();

const emit = defineEmits<{ close: [] }>();

const { t } = useI18n();

const FALLBACK = "/img/default-avatar.svg";

const rows = ref<FootballStatisticDetail[]>([]);
const isLoading = ref(false);
const error = ref(false);

async function load(): Promise<void> {
  const statistic = props.statistic;
  if (!statistic) return;

  isLoading.value = true;
  error.value = false;
  // Start from the podium already on screen so the sheet opens with content.
  rows.value = statistic.statistics;

  try {
    const response = await footballPlayerService.getPlayerStatisticByStage(
      props.stageUuid,
      statistic.key,
    );
    rows.value = response.data[0]?.statistics ?? statistic.statistics;
  } catch {
    error.value = true;
  } finally {
    isLoading.value = false;
  }
}

watch(
  () => [props.isOpen, props.statistic?.key],
  ([open]) => {
    if (open) load();
  },
  { immediate: true },
);

const playerImg = (path: string | null | undefined): string =>
  !path || path.includes("placeholder") ? FALLBACK : path;

const onImgError = (event: Event): void => {
  (event.target as HTMLImageElement).src = FALLBACK;
};

const rankColor = (index: number): string => {
  if (index === 0) return "text-amber-500";
  if (index === 1) return "text-gray-400 dark:text-gray-400";
  if (index === 2) return "text-amber-700 dark:text-amber-600";
  return "text-gray-300 dark:text-gray-600";
};
</script>

<template>
  <BottomSheet
    :is-visible="isOpen && !!props.statistic"
    :title="props.statistic?.type"
    :subtitle="props.statistic ? t('football.statistics.rankedPlayers', { count: props.statistic.total }) : ''"
    icon="hi-solid-chart-bar"
    icon-variant="emerald"
    size="xl"
    role="dialog"
    @close="emit('close')"
  >
    <ul class="space-y-1.5" :aria-busy="isLoading">
      <li
        v-for="(detail, index) in rows"
        :key="detail.player.uuid"
        class="flex items-center gap-3 rounded-xl px-3 py-2"
        :class="index === 0
          ? 'bg-amber-50 dark:bg-amber-900/10'
          : 'bg-gray-50 dark:bg-gray-800/40'"
      >
        <span
          class="w-6 shrink-0 text-center text-xs font-extrabold tabular-nums"
          :class="rankColor(index)"
        >{{ index + 1 }}</span>

        <img
          :src="playerImg(detail.player.image_path)"
          :alt="detail.player.display_name"
          loading="lazy"
          class="w-9 h-9 rounded-full object-cover shrink-0 bg-gray-100 dark:bg-gray-700 ring-1 ring-gray-200 dark:ring-gray-700"
          @error="onImgError"
        />

        <div class="flex-1 min-w-0">
          <p class="text-footnote font-semibold text-gray-900 dark:text-white truncate leading-snug">
            {{ detail.player.display_name }}
          </p>
          <span v-if="detail.player.position" class="text-2xs text-gray-400 dark:text-gray-500">
            {{ detail.player.position }}
          </span>
        </div>

        <span
          class="shrink-0 text-callout font-extrabold tabular-nums"
          :class="index === 0 ? 'text-amber-500' : 'text-emerald-600 dark:text-emerald-400'"
        >
          {{ formatPlayerStatValue(detail.value) }}
        </span>
      </li>
    </ul>

    <!-- Rows below the podium arrive a beat later; the placeholders hold the
         scroll height so the list does not jump when they land. -->
    <div v-if="isLoading" class="space-y-1.5 mt-1.5 animate-pulse" aria-hidden="true">
      <div
        v-for="row in 6"
        :key="row"
        class="h-[52px] rounded-xl bg-gray-50 dark:bg-gray-800/40"
      />
    </div>

    <p v-else-if="error" class="pt-3 text-center text-2xs text-amber-600 dark:text-amber-400">
      {{ t('football.statistics.partialRanking') }}
    </p>
  </BottomSheet>
</template>

<style scoped>
.tabular-nums {
  font-variant-numeric: tabular-nums;
}

@media (prefers-reduced-motion: reduce) {
  .animate-pulse {
    animation: none;
  }
}
</style>
