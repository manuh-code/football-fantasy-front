<script setup lang="ts">
import { ref, watch } from "vue";
import BottomSheet from "@/components/ui/BottomSheet.vue";
import type {
  Statistic,
  Team,
} from "@/interfaces/football/team/FootballTeamTopStatisticResponse";
import { formatTeamStatValue, hasTeamStatDetail } from "@/utils/teamStatistics";
import TeamStatValueDetail from "./TeamStatValueDetail.vue";

const props = defineProps<{
  statistic: Statistic | null;
  isOpen: boolean;
}>();
const emit = defineEmits<{ close: [] }>();

const FALLBACK = "/img/default-avatar.svg";

// One expanded breakdown at a time; collapse when the stat changes.
const expandedTeam = ref<string | null>(null);
watch(
  () => props.statistic,
  () => (expandedTeam.value = null),
);
const toggleTeam = (team: Team) => {
  if (!hasTeamStatDetail(team.value)) return;
  expandedTeam.value = expandedTeam.value === team.uuid ? null : team.uuid;
};

const teamImg = (path: string | null | undefined): string => {
  if (!path || path.includes("placeholder")) return FALLBACK;
  return path;
};
const onImgError = (e: Event) => {
  (e.target as HTMLImageElement).src = FALLBACK;
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
    :title="props.statistic?.type.name"
    size="xl"
    role="dialog"
    @close="emit('close')"
  >
    <ul v-if="props.statistic" class="space-y-1.5">
      <li
        v-for="(team, index) in props.statistic.teams"
        :key="team.uuid"
        class="rounded-xl"
        :class="index === 0
          ? 'bg-amber-50 dark:bg-amber-900/10'
          : 'bg-gray-50 dark:bg-gray-800/40'"
      >
        <div
          class="flex items-center gap-3 px-3 py-2"
          :class="hasTeamStatDetail(team.value) ? 'cursor-pointer' : ''"
          @click="toggleTeam(team)"
        >
          <!-- Rank -->
          <span
            class="w-6 shrink-0 text-center text-xs font-extrabold tabular-nums"
            :class="rankColor(index)"
          >{{ index + 1 }}</span>

          <!-- Logo -->
          <img
            :src="teamImg(team.image_path)"
            :alt="team.short_code || team.name"
            class="w-9 h-9 rounded-full object-contain shrink-0 bg-gray-100 dark:bg-gray-700 ring-1 ring-gray-200 dark:ring-gray-700"
            @error="onImgError"
          />

          <!-- Name -->
          <div class="flex-1 min-w-0">
            <p class="text-footnote font-semibold text-gray-900 dark:text-white truncate leading-snug">
              {{ team.name }}
            </p>
            <span class="text-2xs text-gray-400 dark:text-gray-500">
              {{ team.short_code }}
            </span>
          </div>

          <!-- Value -->
          <span
            class="shrink-0 text-callout font-extrabold tabular-nums"
            :class="index === 0
              ? 'text-amber-500'
              : 'text-emerald-600 dark:text-emerald-400'"
          >
            {{ formatTeamStatValue(team.value) }}
          </span>

          <!-- Expand hint -->
          <v-icon
            v-if="hasTeamStatDetail(team.value)"
            name="hi-solid-chevron-down"
            class="w-3.5 h-3.5 shrink-0 text-gray-300 dark:text-gray-600 transition-transform"
            :class="expandedTeam === team.uuid ? 'rotate-180' : ''"
          />
        </div>

        <!-- Breakdown: details table + referenced players -->
        <div
          v-if="expandedTeam === team.uuid"
          class="px-3 pb-3 pl-[3.25rem]"
        >
          <TeamStatValueDetail :value="team.value" />
        </div>
      </li>
    </ul>
  </BottomSheet>
</template>

<style scoped>
.tabular-nums {
  font-variant-numeric: tabular-nums;
}
</style>
