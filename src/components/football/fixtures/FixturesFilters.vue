<script setup lang="ts">
import { computed } from "vue";
import SearchableSelectComponent from "@/components/ui/SearchableSelectComponent.vue";
import RoundCarousel from "@/components/ui/RoundCarousel.vue";
import KnockoutRoundCarousel from "@/components/ui/KnockoutRoundCarousel.vue";
import type { FootballRoundResponse } from "@/interfaces/football/round/FootballRoundResponse";
import type { FootballStageResponse } from "@/interfaces/football/stage/FootballStageResponse";
import type { FootballTeamResponse } from "@/interfaces/football/team/FootballTeamResponse";

type Mode = "regular" | "playoffs";

const props = defineProps<{
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
const mode = defineModel<Mode>("mode", { default: "regular" });
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

// Same index↔uuid bridge for the knockout stage carousel (playoffs mode).
const selectedKnockoutIndex = computed<number>({
  get: () => {
    const idx = props.knockoutStages.findIndex((s) => s.uuid === knockoutUuid.value);
    return idx === -1 ? 0 : idx;
  },
  set: (index: number) => {
    const stage = props.knockoutStages[index];
    if (stage) knockoutUuid.value = stage.uuid;
  },
});
</script>

<template>
  <div class="px-4 py-3 border-b border-gray-100 dark:border-gray-800 space-y-3">
    <!-- ── Browse the league by round (hidden while a team is focused) ── -->
    <template v-if="!teamUuid">
      <!-- Mode segmented control (monochrome active thumb, FotMob-style) -->
      <div
        class="flex items-center gap-1 p-0.5 rounded-full bg-gray-100 dark:bg-gray-800"
        role="tablist"
        :aria-label="$t('football.fixtures.modeAria')"
      >
        <button
          type="button"
          role="tab"
          :aria-selected="mode === 'regular'"
          @click="mode = 'regular'"
          class="flex-1 flex items-center justify-center gap-1.5 h-8 px-2 rounded-full text-xs font-semibold tracking-wide transition-all duration-200"
          :class="mode === 'regular'
            ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'"
        >
          <v-icon name="md-sportssoccer" class="w-3.5 h-3.5 shrink-0" />
          <span>{{ $t('football.fixtures.regularSeason') }}</span>
        </button>
        <button
          type="button"
          role="tab"
          :aria-selected="mode === 'playoffs'"
          @click="mode = 'playoffs'"
          class="flex-1 flex items-center justify-center gap-1.5 h-8 px-2 rounded-full text-xs font-semibold tracking-wide transition-all duration-200"
          :class="mode === 'playoffs'
            ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'"
        >
          <v-icon name="bi-trophy-fill" class="w-3.5 h-3.5 shrink-0" />
          <span>{{ $t('football.fixtures.playoffs') }}</span>
        </button>
      </div>

      <!-- ── Regular Season: round selector ── -->
      <template v-if="mode === 'regular'">
        <div v-if="isLoadingRounds" class="flex items-center justify-center py-2">
          <v-icon name="pr-spinner" class="w-4 h-4 text-gray-300 dark:text-gray-600" animation="spin" />
        </div>

        <div
          v-else-if="roundsError"
          class="flex items-center justify-between gap-2 py-1"
        >
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

      <!-- ── Playoffs: knockout stage selector (carousel) ── -->
      <template v-else>
        <div v-if="isLoadingStages" class="flex items-center justify-center py-2">
          <v-icon name="pr-spinner" class="w-4 h-4 text-gray-300 dark:text-gray-600" animation="spin" />
        </div>

        <div
          v-else-if="stagesError"
          class="flex items-center justify-between gap-2 py-1"
        >
          <p class="text-xs text-red-500 dark:text-red-400">{{ stagesError }}</p>
          <button
            @click="emit('retry-stages')"
            class="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline"
          >
           {{ $t('common.actions.retry') }}
          </button>
        </div>

        <template v-else-if="knockoutStages.length > 0">
          <KnockoutRoundCarousel
            :stages="knockoutStages"
            v-model="selectedKnockoutIndex"
          />

          <!-- Open the full knockout tree (FotMob-style bracket overlay) -->
          <button
            type="button"
            @click="emit('open-bracket')"
            class="mt-2 w-full flex items-center justify-center gap-1.5 h-8 rounded-full text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors"
          >
            <v-icon name="hi-solid-view-grid" class="w-3.5 h-3.5 shrink-0" />
            <span>{{ $t('football.fixtures.bracketOpen') }}</span>
          </button>
        </template>

        <div v-else class="text-center py-2 text-xs text-gray-400 dark:text-gray-500">
          {{ $t('football.fixtures.noPlayoffs') }}
        </div>
      </template>
    </template>

    <!-- ── Focus a single team (becomes a removable chip when selected) ── -->
    <div v-if="isLoadingTeams || teamsError || teams.length > 0">
      <div
        v-if="teamsError"
        class="flex items-center justify-between gap-2 py-1"
      >
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
