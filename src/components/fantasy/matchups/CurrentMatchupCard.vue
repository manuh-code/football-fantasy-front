<template>
  <!-- Skeleton Loading -->
  <div v-if="isLoading" class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/60 p-5">
    <div class="flex items-center justify-center gap-3">
      <div class="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 animate-pulse" />
      <div class="h-4 w-10 bg-gray-100 dark:bg-gray-700 rounded animate-pulse" />
      <div class="h-6 w-6 bg-gray-100 dark:bg-gray-700 rounded-full animate-pulse" />
      <div class="h-4 w-10 bg-gray-100 dark:bg-gray-700 rounded animate-pulse" />
      <div class="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 animate-pulse" />
    </div>
  </div>

  <!-- Matchup Card -->
  <div
    v-else-if="matchup"
    class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/60 overflow-hidden"
  >
    
    <!-- Matchup Body -->
    <div class="px-4 py-4">
      <div class="flex items-center justify-between">
        <!-- Home Team -->
        <button
          type="button"
          class="group flex flex-col items-center gap-1.5 flex-1 min-w-0 rounded-xl p-1 -m-1 transition-transform active:scale-[0.97] focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
          :aria-label="matchup.home.team.team_name"
          @click="selectTeam(matchup.home.team)"
        >
          <div class="relative">
            <div class="w-14 h-14 rounded-full bg-gray-50 dark:bg-gray-700/50 border-2 border-gray-100 dark:border-gray-600 flex items-center justify-center overflow-hidden transition-colors group-hover:border-emerald-300 dark:group-hover:border-emerald-500/50">
              <img
                v-if="matchup.home.team.image_path"
                :src="matchup.home.team.image_path"
                :alt="matchup.home.team.team_name"
                class="w-full h-full object-cover"
                @error="($event.target as HTMLImageElement).src = '/img/default-avatar.svg'"
              />
              <div v-else-if="matchup.home.team.svg" v-html="matchup.home.team.svg" class="w-10 h-10" />
              <v-icon v-else name="hi-solid-user-group" class="w-6 h-6 text-gray-300 dark:text-gray-500" />
            </div>
            <span
              v-if="isEditable(matchup.home.team)"
              class="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white dark:border-gray-800 flex items-center justify-center shadow-sm"
            >
              <v-icon name="hi-solid-pencil" class="w-2.5 h-2.5 text-white" />
            </span>
          </div>
          <p class="text-2xs font-semibold text-gray-700 dark:text-gray-300 text-center truncate w-full px-1 transition-colors group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
            {{ matchup.home.team.team_name }}
          </p>
        </button>

        <!-- Score — also the entry point into the lineups drawer -->
        <button
          type="button"
          class="group flex flex-col items-center gap-1 px-2 py-1 -m-1 shrink-0 rounded-xl transition-transform active:scale-[0.95] focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
          :aria-label="$t('fantasy.matchups.viewLineups')"
          @click="emit('view-lineups')"
        >
          <div class="flex items-center gap-2">
            <!-- Each score carries an emerald underline when it's the one ahead,
                 so the leader reads at a glance even before a winner is decided. -->
            <span class="flex flex-col items-center gap-0.5">
              <span class="text-2xl font-black tabular-nums leading-none" :class="scoreClass('home')">
                {{ matchup.home.score }}
              </span>
              <span
                class="h-0.5 w-5 rounded-full transition-colors"
                :class="leadingSide === 'home' ? 'bg-emerald-500 dark:bg-emerald-400' : 'bg-transparent'"
              />
            </span>
            <span class="text-2xs font-medium text-gray-300 dark:text-gray-600 uppercase -mt-1">vs</span>
            <span class="flex flex-col items-center gap-0.5">
              <span class="text-2xl font-black tabular-nums leading-none" :class="scoreClass('away')">
                {{ matchup.away.score }}
              </span>
              <span
                class="h-0.5 w-5 rounded-full transition-colors"
                :class="leadingSide === 'away' ? 'bg-emerald-500 dark:bg-emerald-400' : 'bg-transparent'"
              />
            </span>
          </div>
          <span class="flex items-center gap-0.5 text-2xs font-medium text-gray-400 dark:text-gray-500 transition-colors group-hover:text-emerald-500 dark:group-hover:text-emerald-400">
            <v-icon name="hi-solid-eye" class="w-2.5 h-2.5" />
            {{ $t('fantasy.matchups.viewLineups') }}
          </span>
        </button>

        <!-- Away Team -->
        <button
          type="button"
          class="group flex flex-col items-center gap-1.5 flex-1 min-w-0 rounded-xl p-1 -m-1 transition-transform active:scale-[0.97] focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
          :aria-label="matchup.away.team.team_name"
          @click="selectTeam(matchup.away.team)"
        >
          <div class="relative">
            <div class="w-14 h-14 rounded-full bg-gray-50 dark:bg-gray-700/50 border-2 border-gray-100 dark:border-gray-600 flex items-center justify-center overflow-hidden transition-colors group-hover:border-emerald-300 dark:group-hover:border-emerald-500/50">
              <img
                v-if="matchup.away.team.image_path"
                :src="matchup.away.team.image_path"
                :alt="matchup.away.team.team_name"
                class="w-full h-full object-cover"
                @error="($event.target as HTMLImageElement).src = '/img/default-avatar.svg'"
              />
              <div v-else-if="matchup.away.team.svg" v-html="matchup.away.team.svg" class="w-10 h-10" />
              <v-icon v-else name="hi-solid-user-group" class="w-6 h-6 text-gray-300 dark:text-gray-500" />
            </div>
            <span
              v-if="isEditable(matchup.away.team)"
              class="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white dark:border-gray-800 flex items-center justify-center shadow-sm"
            >
              <v-icon name="hi-solid-pencil" class="w-2.5 h-2.5 text-white" />
            </span>
          </div>
          <p class="text-2xs font-semibold text-gray-700 dark:text-gray-300 text-center truncate w-full px-1 transition-colors group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
            {{ matchup.away.team.team_name }}
          </p>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { FantasyLeagueMatchupResponse } from "@/interfaces/fantasy/matchups/FantasyLeagueMatchupResponse";
import type { FantasyTeamData } from "@/interfaces/fantasy/team/FantasyUserTeamResponse";

interface Props {
  matchup: FantasyLeagueMatchupResponse | null;
  roundName?: string;
  isLoading?: boolean;
  /** UUID of the current user's own team — shows an edit affordance on that side. */
  editableTeamUuid?: string | null;
}

const props = withDefaults(defineProps<Props>(), {
  roundName: "Matchup",
  isLoading: false,
  editableTeamUuid: null,
});

const emit = defineEmits<{
  "team-select": [team: FantasyTeamData];
  "view-lineups": [];
}>();

/**
 * Which side is ahead. Prefer the decided `winner`; while a round is still live
 * (no winner yet) fall back to whoever currently has the higher score, so the
 * card highlights a leader instead of dimming both sides. `null` = tie / no data.
 */
const leadingSide = computed<"home" | "away" | null>(() => {
  const m = props.matchup;
  if (!m) return null;
  if (m.winner) {
    if (m.winner === m.home.team.uuid) return "home";
    if (m.winner === m.away.team.uuid) return "away";
    return null;
  }
  const home = Number(m.home.score) || 0;
  const away = Number(m.away.score) || 0;
  if (home === away) return null;
  return home > away ? "home" : "away";
});

/** Trailing side is dimmed; leader and ties stay at full strength. */
function scoreClass(side: "home" | "away"): string {
  if (leadingSide.value === null || leadingSide.value === side) {
    return "text-gray-900 dark:text-white";
  }
  return "text-gray-400 dark:text-gray-500";
}

function selectTeam(team: FantasyTeamData) {
  emit("team-select", team);
}

function isEditable(team: FantasyTeamData): boolean {
  return !!props.editableTeamUuid && team.uuid === props.editableTeamUuid;
}
</script>
