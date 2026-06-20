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

const HEADLINE_STATS: StatConfig[] = [
  { code: "BALL_POSSESSION", label: "Possession", isPercentage: true },
  { code: "SHOTS_TOTAL", label: "Shots" },
  { code: "SHOTS_ON_TARGET", label: "Shots on Target" },
  { code: "CORNERS", label: "Corners" },
  { code: "FOULS", label: "Fouls" },
  { code: "YELLOWCARDS", label: "Yellow Cards" },
  { code: "REDCARDS", label: "Red Cards" },
];

const SECONDARY_STATS: StatConfig[] = [
  { code: "SHOTS_OFF_TARGET", label: "Shots off Target" },
  { code: "SHOTS_INSIDEBOX", label: "Shots Inside Box" },
  { code: "SHOTS_OUTSIDEBOX", label: "Shots Outside Box" },
  { code: "SHOTS_BLOCKED", label: "Shots Blocked" },
  { code: "OFFSIDES", label: "Offsides" },
  { code: "PASSES", label: "Passes" },
  { code: "SUCCESSFUL_PASSES", label: "Accurate Passes" },
  { code: "SUCCESSFUL_PASSES_PERCENTAGE", label: "Pass Accuracy", isPercentage: true },
  { code: "KEY_PASSES", label: "Key Passes" },
  { code: "LONG_PASSES", label: "Long Passes" },
  { code: "SUCCESSFUL_LONG_PASSES", label: "Accurate Long Passes" },
  { code: "TACKLES", label: "Tackles" },
  { code: "INTERCEPTIONS", label: "Interceptions" },
  { code: "SAVES", label: "Saves" },
  { code: "BIG_CHANCES_CREATED", label: "Big Chances Created" },
  { code: "BIG_CHANCES_MISSED", label: "Big Chances Missed" },
  { code: "DUELS_WON", label: "Duels Won" },
  { code: "DRIBBLED_ATTEMPTS", label: "Dribble Attempts" },
  { code: "SUCCESSFUL_DRIBBLES", label: "Successful Dribbles" },
  { code: "ATTACKS", label: "Attacks" },
  { code: "DANGEROUS_ATTACKS", label: "Dangerous Attacks" },
  { code: "TOTAL_CROSSES", label: "Crosses" },
  { code: "ACCURATE_CROSSES", label: "Accurate Crosses" },
  { code: "GOAL_ATTEMPTS", label: "Goal Attempts" },
  { code: "FREE_KICKS", label: "Free Kicks" },
  { code: "GOAL_KICKS", label: "Goal Kicks" },
  { code: "THROWINS", label: "Throw Ins" },
  { code: "PENALTIES", label: "Penalties" },
  { code: "HIT_WOODWORK", label: "Hit Woodwork" },
  { code: "SUBSTITUTIONS", label: "Substitutions" },
  { code: "INJURIES", label: "Injuries" },
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
        :label="stat.config.label"
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
            :label="stat.config.label"
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
        {{ showMore ? "Show less" : `Show ${secondary.length} more stats` }}
        <v-icon
          name="hi-chevron-down"
          class="w-3.5 h-3.5 transition-transform duration-200"
          :class="{ 'rotate-180': showMore }"
        />
      </button>
    </template>
  </div>
</template>
