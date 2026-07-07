<script setup lang="ts">
import { computed } from "vue";
import SearchableSelectComponent from "@/components/ui/SearchableSelectComponent.vue";
import RoundCarousel from "@/components/ui/RoundCarousel.vue";
import PlayoffsFilters from "@/components/football/fixtures/PlayoffsFilters.vue";
import type { FootballRoundResponse } from "@/interfaces/football/round/FootballRoundResponse";
import type { FootballStageResponse } from "@/interfaces/football/stage/FootballStageResponse";
import type { FootballTeamResponse } from "@/interfaces/football/team/FootballTeamResponse";

type Mode = "regular" | "playoffs";

const props = defineProps<{
  // Regular Season vs. Playoffs is chosen by the parent Home tab, so this is a
  // read-only prop now — the filter just renders the selector for the mode.
  mode: Mode;
  rounds: FootballRoundResponse[];
  isLoadingRounds: boolean;
  roundsError: string | null;
  knockoutStages: FootballStageResponse[];
  isLoadingStages: boolean;
  stagesError: string | null;
  teams: FootballTeamResponse[];
  isLoadingTeams: boolean;
  teamsError: string | null;
}>();

const emit = defineEmits<{
  "retry-rounds": [];
  "retry-stages": [];
  "retry-teams": [];
  "open-bracket": [];
}>();

// Two-way bindings with the parent
const roundUuid = defineModel<string | null>("roundUuid", { default: null });
const knockoutUuid = defineModel<string | null>("knockoutUuid", { default: null });
// Empty string / null both mean "no team focused" → browse the league by round.
const teamUuid = defineModel<string | null>("teamUuid", { default: null });

// Bridge the uuid-based round selection (roundUuid) with the index-based
// RoundCarousel (v-model is the selected round's position in the list).
const selectedRoundIndex = computed<number>({
  get: () => {
    const idx = props.rounds.findIndex((r) => r.uuid === roundUuid.value);
    return idx === -1 ? 0 : idx;
  },
  set: (index: number) => {
    const round = props.rounds[index];
    if (round) roundUuid.value = round.uuid;
  },
});
</script>

<template>
  <div class="border-b border-gray-100 dark:border-gray-800">
    <!-- ── Round/stage selector for the active mode (hidden while a team is focused) ── -->
    <template v-if="!teamUuid">
      <div class="px-4 py-3">
        <!-- Regular Season: round carousel -->
        <template v-if="mode === 'regular'">
          <div v-if="isLoadingRounds" class="flex items-center justify-center py-2">
            <v-icon name="pr-spinner" class="w-4 h-4 text-gray-300 dark:text-gray-600" animation="spin" />
          </div>

          <div v-else-if="roundsError" class="flex items-center justify-between gap-2 py-1">
            <p class="text-xs text-red-500 dark:text-red-400">{{ roundsError }}</p>
            <button
              @click="emit('retry-rounds')"
              class="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              {{ $t('common.actions.retry') }}
            </button>
          </div>

          <RoundCarousel
            v-else-if="rounds.length > 0"
            :rounds="rounds"
            v-model="selectedRoundIndex"
          />

          <div v-else class="text-center py-2 text-xs text-gray-400 dark:text-gray-500">
            {{ $t('football.rounds.noRounds') }}
          </div>
        </template>

        <!-- Playoffs: knockout stage selector + bracket shortcut -->
        <PlayoffsFilters
          v-else
          v-model:knockout-uuid="knockoutUuid"
          :knockout-stages="knockoutStages"
          :is-loading-stages="isLoadingStages"
          :stages-error="stagesError"
          @retry-stages="emit('retry-stages')"
          @open-bracket="emit('open-bracket')"
        />
      </div>
    </template>

    <!-- ── Filter by team (available in both tabs; the only control when focused) ── -->
    <div
      v-if="isLoadingTeams || teamsError || teams.length > 0"
      class="px-4 py-3"
      :class="{ 'border-t border-gray-100 dark:border-gray-800': !teamUuid }"
    >
      <div v-if="teamsError" class="flex items-center justify-between gap-2 py-1">
        <p class="text-xs text-red-500 dark:text-red-400">{{ teamsError }}</p>
        <button
          @click="emit('retry-teams')"
          class="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
        >
          {{ $t('common.actions.retry') }}
        </button>
      </div>

      <SearchableSelectComponent
        v-else
        v-model="teamUuid"
        variant="minimal"
        :options="teams"
        value-key="uuid"
        label-key="name"
        image-key="image_path"
        :placeholder="$t('football.fixtures.filterByTeam')"
        :search-placeholder="$t('football.fixtures.searchTeam')"
        :loading="isLoadingTeams"
        :searchable="teams.length > 6"
        :clearable="true"
        all-option
        :all-option-label="$t('football.fixtures.allTeams')"
        accent-color="emerald"
        no-options-text="No teams available"
      >
        <template #selected="{ option }">
          <span class="text-footnote font-semibold text-gray-900 dark:text-white truncate flex-1">
            {{ option.name }}
          </span>
        </template>
      </SearchableSelectComponent>
    </div>
  </div>
</template>
