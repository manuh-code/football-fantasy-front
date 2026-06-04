<script setup lang="ts">
import { computed, ref, watch, onMounted } from "vue";
import { footballFixtureService } from "@/services/football/fixture/FootballFixtureService";
import type { FootballFixtureResponse } from "@/interfaces/football/fixture/FootballFixtureResponse";
import type { FootballTeamResponse } from "@/interfaces/football/team/FootballTeamResponse";
import type { FootballHeadToHeadStats } from "@/interfaces/football/fixture/FootballHeadToHeadStatsResponse";
import TeamLogo from "@/components/football/ui/TeamLogo.vue";

interface Props {
  fixtureUuid: string | null;
  homeTeam: FootballTeamResponse | undefined;
  awayTeam: FootballTeamResponse | undefined;
}

const props = defineProps<Props>();

const fixtures = ref<FootballFixtureResponse[]>([]);
const stats = ref<FootballHeadToHeadStats | null>(null);
const isLoading = ref(false);
const loadError = ref<string | null>(null);

const load = async (uuid: string) => {
  isLoading.value = true;
  loadError.value = null;
  fixtures.value = [];
  stats.value = null;
  try {
    const response = await footballFixtureService.getHeadToHeadByFixture(uuid);
    fixtures.value = response.data ?? [];
    stats.value = response.meta?.stats ?? null;
  } catch (err) {
    console.error("Error loading head-to-head:", err);
    loadError.value = "Couldn't load head-to-head. Please try again.";
  } finally {
    isLoading.value = false;
  }
};

const retry = () => {
  if (props.fixtureUuid) load(props.fixtureUuid);
};

onMounted(() => {
  if (props.fixtureUuid) load(props.fixtureUuid);
});

watch(
  () => props.fixtureUuid,
  (uuid) => {
    if (uuid) load(uuid);
  }
);

// ── Record summary (home wins / draws / away wins) ──
const sameTeam = (a: { uuid?: string; sm_id?: number }, b?: FootballTeamResponse): boolean => {
  if (!b) return false;
  return a.uuid === b.uuid || (a.sm_id != null && a.sm_id === b.sm_id);
};

const homeWins = computed(
  () => stats.value?.teams.find((t) => sameTeam(t, props.homeTeam))?.wins ?? 0
);
const awayWins = computed(
  () => stats.value?.teams.find((t) => sameTeam(t, props.awayTeam))?.wins ?? 0
);
const draws = computed(() => stats.value?.draws ?? 0);
const totalGames = computed(() => homeWins.value + awayWins.value + draws.value);

const pct = (n: number): number =>
  totalGames.value > 0 ? (n / totalGames.value) * 100 : 0;

const hasSummary = computed(() => stats.value !== null && totalGames.value > 0);

// ── Historical fixtures ──
const homeOf = (f: FootballFixtureResponse): FootballTeamResponse | undefined =>
  f.participants?.find((p) => p.meta?.location === "home");
const awayOf = (f: FootballFixtureResponse): FootballTeamResponse | undefined =>
  f.participants?.find((p) => p.meta?.location === "away");

const scoreOf = (team: FootballTeamResponse | undefined): number | null =>
  team?.current_score?.score ?? null;

const formatDate = (f: FootballFixtureResponse): string => {
  if (f.starting_at_timestamp) {
    const d = new Date(f.starting_at_timestamp * 1000);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
    }
  }
  return f.starting_at ?? "";
};

// Newest meeting first.
const orderedFixtures = computed(() =>
  [...fixtures.value].sort(
    (a, b) => (b.starting_at_timestamp ?? 0) - (a.starting_at_timestamp ?? 0)
  )
);
</script>

<template>
  <div class="px-4 pt-3 pb-6">
    <!-- Loading skeleton -->
    <div v-if="isLoading" class="animate-pulse">
      <!-- Summary block -->
      <div class="mb-6">
        <!-- "X games" label -->
        <div class="flex justify-center mb-3">
          <div class="h-3 w-16 rounded-full bg-gray-200 dark:bg-gray-700" />
        </div>

        <!-- 3 stat columns -->
        <div class="flex items-end justify-between mb-2">
          <div class="flex flex-col items-center gap-1.5">
            <div class="h-8 w-8 rounded-md bg-gray-200 dark:bg-gray-700" />
            <div class="h-2.5 w-14 rounded-full bg-gray-100 dark:bg-gray-800" />
          </div>
          <div class="flex flex-col items-center gap-1.5">
            <div class="h-8 w-8 rounded-md bg-gray-200 dark:bg-gray-700" />
            <div class="h-2.5 w-10 rounded-full bg-gray-100 dark:bg-gray-800" />
          </div>
          <div class="flex flex-col items-center gap-1.5">
            <div class="h-8 w-8 rounded-md bg-gray-200 dark:bg-gray-700" />
            <div class="h-2.5 w-16 rounded-full bg-gray-100 dark:bg-gray-800" />
          </div>
        </div>

        <!-- Proportional bar -->
        <div class="h-2.5 w-full rounded-full bg-gray-200 dark:bg-gray-700" />
      </div>

      <!-- "Previous meetings" divider -->
      <div class="flex items-center gap-2 mb-3">
        <div class="flex-1 h-px bg-gray-100 dark:bg-gray-800" />
        <div class="h-2.5 w-28 rounded-full bg-gray-100 dark:bg-gray-800" />
        <div class="flex-1 h-px bg-gray-100 dark:bg-gray-800" />
      </div>

      <!-- 5 meeting rows -->
      <ul class="space-y-2">
        <li
          v-for="i in 5"
          :key="i"
          class="rounded-xl bg-gray-50 dark:bg-gray-800/40 px-3 py-2.5"
        >
          <!-- Date line -->
          <div class="flex justify-center mb-2">
            <div class="h-2.5 rounded-full bg-gray-200 dark:bg-gray-700"
              :class="i % 2 === 0 ? 'w-36' : 'w-44'" />
          </div>
          <!-- Teams + score grid -->
          <div class="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
            <!-- Home side -->
            <div class="flex items-center gap-1.5 justify-end">
              <div class="h-3 rounded-full bg-gray-200 dark:bg-gray-700"
                :class="i % 3 === 0 ? 'w-16' : 'w-20'" />
              <div class="w-4 h-4 rounded-sm bg-gray-200 dark:bg-gray-700 shrink-0" />
            </div>
            <!-- Score chip -->
            <div class="h-5 w-12 rounded-md bg-gray-200 dark:bg-gray-700 shrink-0" />
            <!-- Away side -->
            <div class="flex items-center gap-1.5">
              <div class="w-4 h-4 rounded-sm bg-gray-200 dark:bg-gray-700 shrink-0" />
              <div class="h-3 rounded-full bg-gray-200 dark:bg-gray-700"
                :class="i % 2 === 0 ? 'w-20' : 'w-14'" />
            </div>
          </div>
        </li>
      </ul>
    </div>

    <!-- Error -->
    <div v-else-if="loadError" class="py-12 flex flex-col items-center text-center">
      <v-icon name="hi-solid-exclamation-circle" class="w-9 h-9 text-red-400 dark:text-red-500 mb-3" />
      <p class="text-[13px] text-red-500 dark:text-red-400 mb-3">{{ loadError }}</p>
      <button
        @click="retry"
        class="px-4 py-2 text-[12px] font-semibold rounded-full bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"
      >
        Retry
      </button>
    </div>

    <!-- Empty -->
    <div
      v-else-if="!hasSummary && orderedFixtures.length === 0"
      class="py-12 flex flex-col items-center text-center"
    >
      <v-icon name="md-comparearrows-round" class="w-9 h-9 text-gray-200 dark:text-gray-700 mb-2" />
      <p class="text-[13px] text-gray-400 dark:text-gray-500">No head-to-head history yet</p>
    </div>

    <template v-else>
      <!-- ── Record summary ── -->
      <div v-if="hasSummary" class="mb-6">
        <!-- Total games -->
        <p class="text-center text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-3">
          {{ totalGames }} games
        </p>

        <!-- Win / Draw / Win numbers -->
        <div class="flex items-end justify-between mb-2">
          <div class="text-center">
            <p class="text-[26px] font-extrabold leading-none text-emerald-600 dark:text-emerald-400 tabular-nums">
              {{ homeWins }}
            </p>
            <p class="text-[10px] font-medium text-gray-400 dark:text-gray-500 mt-1">Home wins</p>
          </div>
          <div class="text-center">
            <p class="text-[26px] font-extrabold leading-none text-gray-500 dark:text-gray-400 tabular-nums">
              {{ draws }}
            </p>
            <p class="text-[10px] font-medium text-gray-400 dark:text-gray-500 mt-1">Draws</p>
          </div>
          <div class="text-center">
            <p class="text-[26px] font-extrabold leading-none text-sky-600 dark:text-sky-400 tabular-nums">
              {{ awayWins }}
            </p>
            <p class="text-[10px] font-medium text-gray-400 dark:text-gray-500 mt-1">Away wins</p>
          </div>
        </div>

        <!-- Proportional bar -->
        <div class="flex h-2.5 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800">
          <div class="bg-emerald-500 dark:bg-emerald-400 transition-all duration-300" :style="{ width: `${pct(homeWins)}%` }" />
          <div class="bg-gray-300 dark:bg-gray-600 transition-all duration-300" :style="{ width: `${pct(draws)}%` }" />
          <div class="bg-sky-500 dark:bg-sky-400 transition-all duration-300" :style="{ width: `${pct(awayWins)}%` }" />
        </div>
      </div>

      <!-- ── Previous meetings ── -->
      <div v-if="orderedFixtures.length > 0">
        <div class="flex items-center gap-2 mb-3">
          <div class="flex-1 h-px bg-gray-200 dark:bg-gray-700/60" />
          <span class="text-[10px] font-bold tracking-widest uppercase text-gray-400 dark:text-gray-500">
            Previous meetings
          </span>
          <div class="flex-1 h-px bg-gray-200 dark:bg-gray-700/60" />
        </div>

        <ul class="space-y-2">
          <li
            v-for="f in orderedFixtures"
            :key="f.uuid"
            class="rounded-xl bg-gray-50 dark:bg-gray-800/40 px-3 py-2.5"
          >
            <p class="text-center text-[10px] text-gray-400 dark:text-gray-500 mb-1.5">
              {{ formatDate(f) }}
              <span v-if="f.league?.name"> • {{ f.league.name }}</span>
            </p>
            <div class="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
              <!-- Home -->
              <div class="flex items-center gap-2 min-w-0 justify-end">
                <span
                  class="text-[12px] font-medium truncate"
                  :class="homeOf(f)?.meta?.winner
                    ? 'text-gray-900 dark:text-white font-semibold'
                    : 'text-gray-500 dark:text-gray-400'"
                >
                  {{ homeOf(f)?.name }}
                </span>
                <TeamLogo :team="homeOf(f)" size="xs" />
              </div>

              <!-- Score -->
              <div class="shrink-0 px-2 py-0.5 rounded-md bg-white dark:bg-gray-900 text-[13px] font-bold tabular-nums text-gray-900 dark:text-white">
                {{ scoreOf(homeOf(f)) ?? "-" }} – {{ scoreOf(awayOf(f)) ?? "-" }}
              </div>

              <!-- Away -->
              <div class="flex items-center gap-2 min-w-0">
                <TeamLogo :team="awayOf(f)" size="xs" />
                <span
                  class="text-[12px] font-medium truncate"
                  :class="awayOf(f)?.meta?.winner
                    ? 'text-gray-900 dark:text-white font-semibold'
                    : 'text-gray-500 dark:text-gray-400'"
                >
                  {{ awayOf(f)?.name }}
                </span>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </template>
  </div>
</template>

<style scoped>
.tabular-nums {
  font-variant-numeric: tabular-nums;
}
</style>
