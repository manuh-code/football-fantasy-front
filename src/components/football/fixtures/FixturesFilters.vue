<script setup lang="ts">
import SearchableSelectComponent from "@/components/ui/SearchableSelectComponent.vue";
import type { FootballRoundResponse } from "@/interfaces/football/round/FootballRoundResponse";
import type { FootballStageResponse } from "@/interfaces/football/stage/FootballStageResponse";
import type { FootballTeamResponse } from "@/interfaces/football/team/FootballTeamResponse";

type Mode = "regular" | "playoffs";

defineProps<{
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
}>();

// Two-way bindings with the parent
const mode = defineModel<Mode>("mode", { default: "regular" });
const roundUuid = defineModel<string | null>("roundUuid", { default: null });
const knockoutUuid = defineModel<string | null>("knockoutUuid", { default: null });
// Empty string / null both mean "no team focused" → browse the league by round.
const teamUuid = defineModel<string | null>("teamUuid", { default: null });
</script>

<template>
  <div class="px-4 py-3 border-b border-gray-100 dark:border-gray-800 space-y-3">
    <!-- ── Browse the league by round (hidden while a team is focused) ── -->
    <template v-if="!teamUuid">
      <!-- Mode segmented control (monochrome active thumb, FotMob-style) -->
      <div
        class="flex items-center gap-1 p-0.5 rounded-full bg-gray-100 dark:bg-gray-800"
        role="tablist"
        aria-label="Fixtures mode"
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
          <span>Regular Season</span>
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
          <span>Playoffs</span>
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
            Retry
          </button>
        </div>

        <SearchableSelectComponent
          v-else-if="rounds.length > 0"
          v-model="roundUuid"
          variant="minimal"
          :options="rounds"
          value-key="uuid"
          label-key="name"
          placeholder="Select a round"
          search-placeholder="Search round..."
          :clearable="false"
          accent-color="emerald"
          no-options-text="No rounds available"
        >
          <template #selected="{ option }">
            <span class="text-footnote font-semibold text-gray-900 dark:text-white truncate flex-1">
              Round {{ option.name }}
            </span>
            <span
              v-if="option.is_current"
              class="text-2xs font-bold tracking-wider text-emerald-600 dark:text-emerald-400 uppercase shrink-0"
            >
              Current
            </span>
          </template>
          <template #option="{ option }">
            <div class="flex-1 min-w-0 flex items-center gap-2">
              <span class="text-sm font-medium truncate">Round {{ option.name }}</span>
              <span
                v-if="option.is_current"
                class="text-2xs font-bold tracking-wider text-emerald-600 dark:text-emerald-400 uppercase shrink-0"
              >
                Current
              </span>
              <span
                v-else-if="option.finished"
                class="text-2xs text-gray-400 dark:text-gray-500 uppercase tracking-wider shrink-0"
              >
                Done
              </span>
            </div>
          </template>
        </SearchableSelectComponent>

        <div v-else class="text-center py-2 text-xs text-gray-400 dark:text-gray-500">
          No rounds available
        </div>
      </template>

      <!-- ── Playoffs: knockout stage selector ── -->
      <template v-else>
        <div
          v-if="stagesError"
          class="flex items-center justify-between gap-2 py-1"
        >
          <p class="text-xs text-red-500 dark:text-red-400">{{ stagesError }}</p>
          <button
            @click="emit('retry-stages')"
            class="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline"
          >
            Retry
          </button>
        </div>

        <SearchableSelectComponent
          v-else
          v-model="knockoutUuid"
          variant="minimal"
          :options="knockoutStages"
          value-key="uuid"
          label-key="name"
          placeholder="Select playoff stage"
          search-placeholder="Search stage..."
          :disabled="isLoadingStages || knockoutStages.length === 0"
          :loading="isLoadingStages"
          accent-color="amber"
          :searchable="knockoutStages.length > 5"
          :clearable="false"
        >
          <template #selected="{ option }">
            <span class="text-footnote font-semibold text-gray-900 dark:text-white truncate flex-1">
              {{ (option.name_complete as string | null) || option.name }}
            </span>
            <span
              v-if="option.is_current"
              class="text-2xs font-bold tracking-wider text-amber-600 dark:text-amber-400 uppercase shrink-0 ml-2"
            >
              Current
            </span>
          </template>
          <template #option="{ option }">
            <div class="flex-1 min-w-0 flex items-center gap-2">
              <span class="text-sm font-medium truncate">
                {{ (option.name_complete as string | null) || option.name }}
              </span>
              <span
                v-if="option.is_current"
                class="text-2xs font-bold tracking-wider text-amber-600 dark:text-amber-400 uppercase shrink-0"
              >
                Current
              </span>
              <span
                v-else-if="option.finished"
                class="text-2xs text-gray-400 dark:text-gray-500 uppercase tracking-wider shrink-0"
              >
                Done
              </span>
            </div>
          </template>
        </SearchableSelectComponent>
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
          Retry
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
        placeholder="Filter by team"
        search-placeholder="Search team..."
        :loading="isLoadingTeams"
        :searchable="teams.length > 6"
        :clearable="true"
        all-option
        all-option-label="All teams"
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
