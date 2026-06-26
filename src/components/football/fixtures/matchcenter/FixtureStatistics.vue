<script setup lang="ts">
import { computed, ref } from "vue";
import type { FootballStatisticResponse } from "@/interfaces/football/fixture/FootballStatisticResponse";
import type { FootballTeamResponse } from "@/interfaces/football/team/FootballTeamResponse";
import FixtureStatBar from "./FixtureStatBar.vue";

interface Props {
  statistics: FootballStatisticResponse[];
  homeTeam: FootballTeamResponse | undefined;
  awayTeam: FootballTeamResponse | undefined;
}

const props = defineProps<Props>();

interface StatConfig {
  code: string;
  label: string;
  isPercentage?: boolean;
}

// `label` holds an i18n key resolved with $t in the template.
const HEADLINE_STATS: StatConfig[] = [
  { code: "BALL_POSSESSION", label: "football.stats.possession", isPercentage: true },
  { code: "SHOTS_TOTAL", label: "football.stats.shots" },
  { code: "SHOTS_ON_TARGET", label: "football.stats.shotsOnTarget" },
  { code: "CORNERS", label: "football.stats.corners" },
  { code: "FOULS", label: "football.stats.fouls" },
  { code: "YELLOWCARDS", label: "football.stats.yellowCards" },
  { code: "REDCARDS", label: "football.stats.redCards" },
];

const SECONDARY_STATS: StatConfig[] = [
  { code: "SHOTS_OFF_TARGET", label: "football.stats.shotsOffTarget" },
  { code: "SHOTS_INSIDEBOX", label: "football.stats.shotsInsideBox" },
  { code: "SHOTS_OUTSIDEBOX", label: "football.stats.shotsOutsideBox" },
  { code: "SHOTS_BLOCKED", label: "football.stats.shotsBlocked" },
  { code: "OFFSIDES", label: "football.stats.offsides" },
  { code: "PASSES", label: "football.stats.passes" },
  { code: "SUCCESSFUL_PASSES", label: "football.stats.accuratePasses" },
  { code: "SUCCESSFUL_PASSES_PERCENTAGE", label: "football.stats.passAccuracy", isPercentage: true },
  { code: "KEY_PASSES", label: "football.stats.keyPasses" },
  { code: "LONG_PASSES", label: "football.stats.longPasses" },
  { code: "SUCCESSFUL_LONG_PASSES", label: "football.stats.accurateLongPasses" },
  { code: "TACKLES", label: "football.stats.tackles" },
  { code: "INTERCEPTIONS", label: "football.stats.interceptions" },
  { code: "SAVES", label: "football.stats.saves" },
  { code: "BIG_CHANCES_CREATED", label: "football.stats.bigChancesCreated" },
  { code: "BIG_CHANCES_MISSED", label: "football.stats.bigChancesMissed" },
  { code: "DUELS_WON", label: "football.stats.duelsWon" },
  { code: "DRIBBLED_ATTEMPTS", label: "football.stats.dribbleAttempts" },
  { code: "SUCCESSFUL_DRIBBLES", label: "football.stats.successfulDribbles" },
  { code: "ATTACKS", label: "football.stats.attacks" },
  { code: "DANGEROUS_ATTACKS", label: "football.stats.dangerousAttacks" },
  { code: "TOTAL_CROSSES", label: "football.stats.crosses" },
  { code: "ACCURATE_CROSSES", label: "football.stats.accurateCrosses" },
  { code: "GOAL_ATTEMPTS", label: "football.stats.goalAttempts" },
  { code: "FREE_KICKS", label: "football.stats.freeKicks" },
  { code: "GOAL_KICKS", label: "football.stats.goalKicks" },
  { code: "THROWINS", label: "football.stats.throwIns" },
  { code: "PENALTIES", label: "football.stats.penalties" },
  { code: "HIT_WOODWORK", label: "football.stats.hitWoodwork" },
  { code: "SUBSTITUTIONS", label: "football.stats.substitutions" },
  { code: "INJURIES", label: "football.stats.injuries" },
];

interface ResolvedStat {
  config: StatConfig;
  home: number;
  away: number;
}

const statsByCode = computed(() => {
  const map = new Map<string, { home: number; away: number }>();
  for (const s of props.statistics) {
    const code = s.type?.developer_name;
    if (!code) continue;
    const entry = map.get(code) ?? { home: 0, away: 0 };
    if (s.location === "home") entry.home = s.data?.value ?? 0;
    else entry.away = s.data?.value ?? 0;
    map.set(code, entry);
  }
  return map;
});

const resolve = (configs: StatConfig[]): ResolvedStat[] => {
  const out: ResolvedStat[] = [];
  for (const c of configs) {
    const entry = statsByCode.value.get(c.code);
    if (!entry) continue;
    if (entry.home === 0 && entry.away === 0) continue;
    out.push({ config: c, home: entry.home, away: entry.away });
  }
  return out;
};

const headline = computed(() => resolve(HEADLINE_STATS));
const secondary = computed(() => resolve(SECONDARY_STATS));

const showMore = ref(false);
const hasAnyStat = computed(() => headline.value.length > 0 || secondary.value.length > 0);
</script>

<template>
  <div v-if="hasAnyStat" class="px-4 pt-2 pb-5">
    <!-- Headline stats -->
    <div class="divide-y divide-gray-100 dark:divide-gray-800/60">
      <FixtureStatBar
        v-for="stat in headline"
        :key="stat.config.code"
        :label="$t(stat.config.label)"
        :home-value="stat.home"
        :away-value="stat.away"
        :is-percentage="stat.config.isPercentage"
      />
    </div>

    <!-- Show more toggle + secondary stats -->
    <template v-if="secondary.length > 0">
      <Transition
        enter-active-class="transition-all duration-300 ease-out"
        leave-active-class="transition-all duration-200 ease-in"
        enter-from-class="opacity-0 max-h-0"
        enter-to-class="opacity-100 max-h-[2000px]"
        leave-from-class="opacity-100 max-h-[2000px]"
        leave-to-class="opacity-0 max-h-0"
      >
        <div v-if="showMore" class="divide-y divide-gray-100 dark:divide-gray-800/60 overflow-hidden">
          <FixtureStatBar
            v-for="stat in secondary"
            :key="stat.config.code"
            :label="$t(stat.config.label)"
            :home-value="stat.home"
            :away-value="stat.away"
            :is-percentage="stat.config.isPercentage"
          />
        </div>
      </Transition>

      <button
        @click="showMore = !showMore"
        class="mt-3 w-full flex items-center justify-center gap-1 py-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
      >
        {{ showMore ? $t('football.matchCenter.showLess') : $t('football.matchCenter.showMoreStats', { count: secondary.length }) }}
        <v-icon
          name="hi-chevron-down"
          class="w-3.5 h-3.5 transition-transform duration-200"
          :class="{ 'rotate-180': showMore }"
        />
      </button>
    </template>
  </div>
</template>
