<script setup lang="ts">
import { computed } from "vue";
import type { FootballFixtureResponse } from "@/interfaces/football/fixture/FootballFixtureResponse";
import type { FootballTeamResponse } from "@/interfaces/football/team/FootballTeamResponse";
import TeamLogo from "@/components/football/ui/TeamLogo.vue";
import FixturesListSkeleton from "./FixturesListSkeleton.vue";

const props = defineProps<{
  fixtures: FootballFixtureResponse[];
  isLoading: boolean;
  error: string | null;
  emptyIcon: string;
  emptyMessage: string;
}>();

const emit = defineEmits<{
  "fixture-selected": [fixture: FootballFixtureResponse];
  retry: [];
}>();

// Group fixtures by their kickoff date so the list reads as day sections. The
// `starting_date` string is used verbatim as the group key AND header — the API
// already returns it clean, so it must not be reformatted. Insertion order is
// preserved (fixtures arrive already sorted).
const groupedFixtures = computed(() => {
  const groups: { date: string; items: FootballFixtureResponse[] }[] = [];
  const indexByDate = new Map<string, number>();
  for (const fixture of props.fixtures) {
    const date = fixture.starting_date;
    let idx = indexByDate.get(date);
    if (idx === undefined) {
      idx = groups.length;
      indexByDate.set(date, idx);
      groups.push({ date, items: [] });
    }
    groups[idx].items.push(fixture);
  }
  return groups;
});

// ── Fixture helpers ──
const getHomeParticipant = (fixture: FootballFixtureResponse): FootballTeamResponse | undefined =>
  fixture.participants?.find((p) => p.meta?.location === "home");

const getAwayParticipant = (fixture: FootballFixtureResponse): FootballTeamResponse | undefined =>
  fixture.participants?.find((p) => p.meta?.location === "away");

const getTeamName = (team: FootballTeamResponse | undefined): string => team?.name || "TBD";

const hasScores = (fixture: FootballFixtureResponse): boolean => {
  const home = getHomeParticipant(fixture);
  const away = getAwayParticipant(fixture);
  return (
    home?.current_score !== undefined &&
    home?.current_score !== null &&
    away?.current_score !== undefined &&
    away?.current_score !== null
  );
};

const getHomeScore = (fixture: FootballFixtureResponse): number =>
  getHomeParticipant(fixture)?.current_score?.score ?? 0;

const getAwayScore = (fixture: FootballFixtureResponse): number =>
  getAwayParticipant(fixture)?.current_score?.score ?? 0;

const isMatchLive = (fixture: FootballFixtureResponse): boolean => {
  if (fixture.state) {
    const stateName = fixture.state.name.toLowerCase();
    return (
      stateName.includes("live") ||
      stateName.includes("in play") ||
      stateName.includes("ht") ||
      stateName.includes("half time")
    );
  }
  if (!hasScores(fixture)) return false;
  const home = getHomeParticipant(fixture);
  const away = getAwayParticipant(fixture);
  const matchStarted = new Date(fixture.starting_at).getTime() <= Date.now();
  const noWinnerDecided = home?.meta?.winner === null && away?.meta?.winner === null;
  return matchStarted && noWinnerDecided && hasScores(fixture);
};

const isMatchFinished = (fixture: FootballFixtureResponse): boolean => {
  if (fixture.state) return fixture.state.state.includes("FT");
  const home = getHomeParticipant(fixture);
  return home?.meta?.winner !== null && home?.meta?.winner !== undefined;
};


const getFixtureStateText = (fixture: FootballFixtureResponse): string => {
  if (fixture.state) {
    const stateName = fixture.state.name.toLowerCase();
    if (stateName.includes("finished") || stateName.includes("ft")) return "FT";
    if (stateName.includes("live") || stateName.includes("in play")) return "LIVE";
    if (stateName.includes("ht") || stateName.includes("half time")) return "HT";
    if (stateName.includes("postponed")) return "POSTPONED";
    if (stateName.includes("cancelled")) return "CANCELLED";
    return fixture.state.name;
  }
  if (isMatchFinished(fixture)) return "FT";
  if (isMatchLive(fixture)) return "LIVE";
  // Scheduled matches show their kickoff hour at the top of the card instead.
  return "";
};

// Monochrome result emphasis (FotMob/Apple style): bold the winner, mute the loser.
const getTeamResultClass = (
  fixture: FootballFixtureResponse,
  location: "home" | "away",
): string => {
  if (!hasScores(fixture) || !isMatchFinished(fixture)) {
    return "text-gray-700 dark:text-gray-200";
  }
  const homeScore = getHomeScore(fixture);
  const awayScore = getAwayScore(fixture);
  if (homeScore === awayScore) return "text-gray-500 dark:text-gray-400";
  const teamWon =
    (location === "home" && homeScore > awayScore) ||
    (location === "away" && awayScore > homeScore);
  return teamWon
    ? "text-gray-900 dark:text-white font-semibold"
    : "text-gray-400 dark:text-gray-500";
};
</script>

<template>
  <!-- Loading skeleton -->
  <FixturesListSkeleton v-if="isLoading" />

  <!-- Error -->
  <div v-else-if="error" class="px-4 py-12 flex flex-col items-center text-center">
    <v-icon
      name="hi-solid-exclamation-circle"
      class="w-9 h-9 text-red-400 dark:text-red-500 mb-3"
    />
    <p class="text-footnote text-red-500 dark:text-red-400 mb-3">{{ error }}</p>
    <button
      @click="emit('retry')"
      class="px-4 py-2 text-xs font-semibold rounded-full bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"
    >
     {{ $t('common.actions.retry') }}
    </button>
  </div>

  <!-- Empty -->
  <div
    v-else-if="fixtures.length === 0"
    class="px-4 py-12 text-center text-gray-400 dark:text-gray-500"
  >
    <v-icon :name="emptyIcon" class="w-8 h-8 mx-auto mb-2 text-gray-200 dark:text-gray-700" />
    <p class="text-footnote">{{ emptyMessage }}</p>
  </div>

  <!-- List grouped by kickoff date -->
  <div v-else>
    <section v-for="group in groupedFixtures" :key="group.date">
      <!-- Date header (raw, unformatted value from the API) -->
      <div class="px-4 py-2 bg-gray-50 dark:bg-gray-800/40 border-b border-gray-100 dark:border-gray-700/50">
        <span class="text-2xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
          {{ group.date }}
        </span>
      </div>

      <!-- Fixtures for this date -->
      <div class="divide-y divide-gray-100 dark:divide-gray-700/50">
        <div
          v-for="(fixture, fIdx) in group.items"
          :key="fixture.uuid || fixture.name + '-' + fIdx"
          @click="emit('fixture-selected', fixture)"
          class="fixture-cell relative transition-colors cursor-pointer"
          :class="[
            isMatchLive(fixture)
              ? 'bg-red-50/40 dark:bg-red-900/5 border-l-[3px] border-l-red-500 dark:border-l-red-400'
              : 'border-l-[3px] border-l-transparent',
            'px-4 py-3 active:bg-gray-50 dark:active:bg-gray-700/30',
          ]"
        >
          <!-- LIVE badge top -->
          <div v-if="isMatchLive(fixture)" class="flex items-center gap-1.5 mb-2">
            <span class="live-dot relative flex h-2 w-2">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            <span class="text-2xs font-bold text-red-600 dark:text-red-400 tracking-widest uppercase">{{ $t('football.fixtures.live') }}</span>
          </div>

          <!-- Kickoff hour (not live) — raw value from the API, no formatting -->
          <div v-else class="text-center mb-2">
            <span class="text-2xs font-medium text-gray-400 dark:text-gray-500 tracking-wide">
              {{ fixture.hour }}
            </span>
          </div>

          <!-- Match row -->
          <div class="flex items-center gap-2">
            <!-- Home -->
            <div class="flex items-center gap-2 flex-1 min-w-0">
              <TeamLogo :team="getHomeParticipant(fixture)" size="md" />
              <span
                :class="getTeamResultClass(fixture, 'home')"
                class="text-footnote font-medium truncate"
                :title="getTeamName(getHomeParticipant(fixture))"
              >
                {{ getTeamName(getHomeParticipant(fixture)) }}
              </span>
            </div>

            <!-- Score center -->
            <div class="flex flex-col items-center shrink-0 min-w-[56px]">
              <div
                class="tabular-nums"
                :class="[
                  hasScores(fixture) ? 'font-bold text-gray-900 dark:text-white' : '',
                  isMatchLive(fixture) ? 'text-2xl' : 'text-xl',
                ]"
              >
                <template v-if="hasScores(fixture)">
                  {{ getHomeScore(fixture) }}<span :class="isMatchLive(fixture) ? 'text-red-300 dark:text-red-700 mx-0.5' : 'text-gray-300 dark:text-gray-600 mx-0.5'">-</span>{{ getAwayScore(fixture) }}
                </template>
                <span v-else class="text-2xs font-semibold text-gray-300 dark:text-gray-600 uppercase tracking-wider">vs</span>
              </div>
              <span
                v-if="!isMatchLive(fixture) && getFixtureStateText(fixture)"
                class="text-2xs font-semibold mt-0.5 tracking-wide text-gray-400 dark:text-gray-500"
              >
                {{ getFixtureStateText(fixture) }}
              </span>
            </div>

            <!-- Away -->
            <div class="flex items-center gap-2 flex-1 min-w-0 justify-end">
              <span
                :class="getTeamResultClass(fixture, 'away')"
                class="text-footnote font-medium truncate text-right"
                :title="getTeamName(getAwayParticipant(fixture))"
              >
                {{ getTeamName(getAwayParticipant(fixture)) }}
              </span>
              <TeamLogo :team="getAwayParticipant(fixture)" size="md" />
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.tabular-nums {
  font-variant-numeric: tabular-nums;
}

.fixture-cell {
  -webkit-tap-highlight-color: transparent;
}

.live-dot {
  line-height: 0;
}
</style>
