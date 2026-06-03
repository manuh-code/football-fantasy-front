<script setup lang="ts">
import { computed } from "vue";
import type { FootballFixtureResponse } from "@/interfaces/football/fixture/FootballFixtureResponse";
import type { FootballTeamResponse } from "@/interfaces/football/team/FootballTeamResponse";

interface Props {
  fixture: FootballFixtureResponse;
  /** When true the header renders in its compact "scrolled" state (Sticky + Shrink). */
  collapsed?: boolean;
}

const props = withDefaults(defineProps<Props>(), { collapsed: false });

const FALLBACK_LOGO = "/img/default-avatar.svg";
const teamImage = (team?: FootballTeamResponse): string => team?.image_path || FALLBACK_LOGO;
const onImgError = (e: Event) => {
  (e.target as HTMLImageElement).src = FALLBACK_LOGO;
};

const homeTeam = computed<FootballTeamResponse | undefined>(() =>
  props.fixture.participants?.find((p) => p.meta?.location === "home")
);
const awayTeam = computed<FootballTeamResponse | undefined>(() =>
  props.fixture.participants?.find((p) => p.meta?.location === "away")
);

const homeScore = computed(() => homeTeam.value?.current_score?.score ?? null);
const awayScore = computed(() => awayTeam.value?.current_score?.score ?? null);
const hasScore = computed(() => homeScore.value !== null && awayScore.value !== null);

const stateName = computed(() => props.fixture.state?.name?.toLowerCase() ?? "");
const stateCode = computed(() => props.fixture.state?.state?.toUpperCase() ?? "");

const isLive = computed(() => {
  if (!stateName.value) return false;
  return (
    stateName.value.includes("live") ||
    stateName.value.includes("in play") ||
    stateName.value.includes("ht") ||
    stateName.value.includes("half time")
  );
});

const isFinished = computed(() => stateCode.value.includes("FT") || stateName.value.includes("finished"));

const stateLabel = computed(() => {
  if (!props.fixture.state) return "";
  if (isLive.value) {
    if (stateName.value.includes("half time") || stateCode.value === "HT") return "HALF TIME";
    return "LIVE";
  }
  if (isFinished.value) return "FULL TIME";
  if (stateName.value.includes("postponed")) return "POSTPONED";
  if (stateName.value.includes("cancelled")) return "CANCELLED";
  return props.fixture.state.name;
});

const stateBadgeClass = computed(() => {
  if (isLive.value) {
    return "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300";
  }
  if (isFinished.value) {
    return "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300";
  }
  return "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400";
});

const formattedKickoff = computed(() => {
  if (!props.fixture.starting_at_timestamp) return props.fixture.starting_at;
  const date = new Date(props.fixture.starting_at_timestamp * 1000);
  if (isNaN(date.getTime())) return props.fixture.starting_at;
  const dateStr = date.toLocaleDateString("en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
  const timeStr = date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${dateStr} • ${timeStr}`;
});

const teamName = (team?: FootballTeamResponse): string => team?.name ?? "TBD";
const shortCode = (team?: FootballTeamResponse): string =>
  team?.short_code ?? teamName(team).substring(0, 3).toUpperCase();

const homeWinner = computed(() => homeTeam.value?.meta?.winner === true);
const awayWinner = computed(() => awayTeam.value?.meta?.winner === true);
</script>

<template>
  <div
    class="relative px-4 transition-all duration-300 ease-out bg-gradient-to-b from-emerald-50/60 via-white to-white dark:from-emerald-950/30 dark:via-gray-900 dark:to-gray-900"
    :class="collapsed ? 'pt-1.5 pb-1.5' : 'pt-4 pb-5'"
  >
    <!-- League + round row (collapses away on scroll) -->
    <div
      class="overflow-hidden transition-all duration-300 ease-out"
      :class="collapsed ? 'max-h-0 opacity-0 mb-0' : 'max-h-8 opacity-100 mb-4'"
    >
      <div class="flex items-center justify-center gap-2">
        <img
          v-if="fixture.league?.image_path"
          :src="fixture.league.image_path"
          :alt="fixture.league.name"
          class="w-4 h-4 object-contain shrink-0"
        />
        <span class="text-[11px] font-medium text-gray-500 dark:text-gray-400 truncate">
          {{ fixture.league?.name ?? "League" }}
        </span>
        <span v-if="fixture.round?.name" class="text-[11px] text-gray-300 dark:text-gray-600">•</span>
        <span v-if="fixture.round?.name" class="text-[11px] text-gray-500 dark:text-gray-400">
          Round {{ fixture.round.name }}
        </span>
      </div>
    </div>

    <!-- Scoreboard row -->
    <div class="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
      <!-- Home team -->
      <div class="flex flex-col items-center min-w-0 transition-all duration-300 ease-out" :class="collapsed ? 'gap-0' : 'gap-2'">
        <div
          class="flex items-center justify-center shrink-0 transition-all duration-300 ease-out"
          :class="collapsed ? 'w-7 h-7' : 'w-12 h-12'"
        >
          <img
            :src="teamImage(homeTeam)"
            :alt="teamName(homeTeam)"
            class="max-w-full max-h-full object-contain"
            @error="onImgError"
          />
        </div>
        <!-- Name + short code (fully hidden when collapsed) -->
        <div
          class="overflow-hidden text-center min-w-0 w-full transition-all duration-300 ease-out"
          :class="collapsed ? 'max-h-0 opacity-0' : 'max-h-12 opacity-100'"
        >
          <p
            class="text-[14px] font-semibold truncate"
            :class="homeWinner ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-900 dark:text-white'"
            :title="teamName(homeTeam)"
          >
            {{ teamName(homeTeam) }}
          </p>
          <p class="text-[10px] font-medium text-gray-400 dark:text-gray-500 tracking-wider">
            {{ shortCode(homeTeam) }}
          </p>
        </div>
      </div>

      <!-- Score / Kickoff -->
      <div class="flex flex-col items-center shrink-0 px-2">
        <template v-if="hasScore">
          <div class="flex items-center gap-2">
            <span
              class="font-extrabold tabular-nums leading-none transition-all duration-300 ease-out"
              :class="[collapsed ? 'text-[26px]' : 'text-[44px]', homeWinner ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-900 dark:text-white']"
            >
              {{ homeScore }}
            </span>
            <span
              class="font-light text-gray-300 dark:text-gray-600 transition-all duration-300 ease-out"
              :class="collapsed ? 'text-[16px]' : 'text-[24px]'"
            >–</span>
            <span
              class="font-extrabold tabular-nums leading-none transition-all duration-300 ease-out"
              :class="[collapsed ? 'text-[26px]' : 'text-[44px]', awayWinner ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-900 dark:text-white']"
            >
              {{ awayScore }}
            </span>
          </div>
        </template>
        <template v-else>
          <span
            class="font-bold text-gray-400 dark:text-gray-500 tracking-wide transition-all duration-300 ease-out"
            :class="collapsed ? 'text-[15px]' : 'text-[18px]'"
          >VS</span>
          <span
            v-if="!collapsed"
            class="text-[10px] text-gray-400 dark:text-gray-500 mt-1 whitespace-nowrap"
          >
            {{ formattedKickoff }}
          </span>
        </template>

        <!-- State badge (collapses away on scroll to keep the bar thin) -->
        <div
          v-if="stateLabel"
          class="overflow-hidden transition-all duration-300 ease-out"
          :class="collapsed ? 'max-h-0 opacity-0 mt-0' : 'max-h-6 opacity-100 mt-2'"
        >
          <div
            class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full"
            :class="stateBadgeClass"
          >
            <span v-if="isLive" class="relative flex h-1.5 w-1.5">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span class="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500" />
            </span>
            <span class="text-[10px] font-bold tracking-widest">{{ stateLabel }}</span>
          </div>
        </div>
      </div>

      <!-- Away team -->
      <div class="flex flex-col items-center min-w-0 transition-all duration-300 ease-out" :class="collapsed ? 'gap-0' : 'gap-2'">
        <div
          class="flex items-center justify-center shrink-0 transition-all duration-300 ease-out"
          :class="collapsed ? 'w-7 h-7' : 'w-12 h-12'"
        >
          <img
            :src="teamImage(awayTeam)"
            :alt="teamName(awayTeam)"
            class="max-w-full max-h-full object-contain"
            @error="onImgError"
          />
        </div>
        <!-- Name + short code (fully hidden when collapsed) -->
        <div
          class="overflow-hidden text-center min-w-0 w-full transition-all duration-300 ease-out"
          :class="collapsed ? 'max-h-0 opacity-0' : 'max-h-12 opacity-100'"
        >
          <p
            class="text-[14px] font-semibold truncate"
            :class="awayWinner ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-900 dark:text-white'"
            :title="teamName(awayTeam)"
          >
            {{ teamName(awayTeam) }}
          </p>
          <p class="text-[10px] font-medium text-gray-400 dark:text-gray-500 tracking-wider">
            {{ shortCode(awayTeam) }}
          </p>
        </div>
      </div>
    </div>

    <!-- Venue row (collapses away on scroll) -->
    <div
      v-if="fixture.venue?.name"
      class="overflow-hidden transition-all duration-300 ease-out"
      :class="collapsed ? 'max-h-0 opacity-0 mt-0' : 'max-h-8 opacity-100 mt-4'"
    >
      <div class="flex items-center justify-center gap-1.5 text-gray-500 dark:text-gray-400">
        <v-icon name="hi-solid-location-marker" class="w-3 h-3 shrink-0" />
        <span class="text-[11px] truncate">
          {{ fixture.venue.name }}<span v-if="fixture.venue.city_name">, {{ fixture.venue.city_name }}</span>
        </span>
      </div>
    </div>
  </div>
</template>
