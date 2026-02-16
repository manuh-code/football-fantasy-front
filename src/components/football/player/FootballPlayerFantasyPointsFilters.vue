<template>
  <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
    <div class="px-4 md:px-6 py-3 md:py-4 border-b border-gray-200 dark:border-gray-700">
      <div class="flex items-center gap-2 md:gap-3">
        <div class="w-8 h-8 md:w-10 md:h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
          <v-icon name="hi-solid-lightning-bolt" class="w-4 h-4 md:w-5 md:h-5 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div class="min-w-0">
          <h2 class="text-base md:text-xl font-semibold text-gray-900 dark:text-white truncate">Fantasy Points Filters</h2>
          <p class="hidden md:block text-sm text-gray-600 dark:text-gray-400">
            Choose teams and stages to analyse league fantasy points.
          </p>
        </div>
      </div>
    </div>

    <div class="p-4 md:p-6">
      <form @submit.prevent="emit('search')" class="space-y-4">
        <!-- Filters Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <!-- Teams -->
        <div>
          <MultiselectComponent
            v-model="localSelectedTeams"
            :options="teamOptions"
            value-key="uuid"
            label-key="name"
            label="Teams"
            placeholder="Select teams"
            :disabled="disabled || isLoadingTeams || !teamOptions.length"
            :loading="isLoadingTeams"
            no-result-text="No teams found."
            :no-options-text="isLoadingTeams ? 'Loading teams…' : 'No teams available'"
          />
        </div>

        <!-- Positions -->
        <div>
          <MultiselectComponent
            v-model="localSelectedPositions"
            :options="positionOptions"
            value-key="uuid"
            label-key="name"
            label="Positions"
            placeholder="Select positions"
            :disabled="disabled || isLoadingPositions || !positionOptions.length"
            :loading="isLoadingPositions"
            no-result-text="No positions found."
            :no-options-text="isLoadingPositions ? 'Loading positions…' : 'No positions available'"
          />
        </div>

        <!-- Stages -->
        <div>
          <MultiselectComponent
            v-model="localSelectedStages"
            :options="stageOptions"
            value-key="uuid"
            label-key="name"
            label="Stages"
            placeholder="Select stages"
            :disabled="disabled || isLoadingStages || !stageOptions.length"
            :loading="isLoadingStages"
            no-result-text="No stages found."
            :no-options-text="isLoadingStages ? 'Loading stages…' : 'No stages available'"
          />
        </div>
        </div>

        <!-- Initial state -->
        <div v-if="disabled && isInitializing">
          <div class="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/60 rounded-lg border border-dashed border-gray-300 dark:border-gray-600">
            <v-icon name="pr-spinner" class="w-3 h-3 mr-2" animation="spin" />
            Preparing league data…
          </div>
        </div>

        <!-- Message when there is no active season -->
        <div v-else-if="disabled && !isInitializing">
          <div class="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 bg-amber-50 dark:bg-amber-900/30 rounded-lg border border-amber-200 dark:border-amber-700">
            <v-icon name="hi-solid-information-circle" class="w-4 h-4 mr-2 text-amber-600 dark:text-amber-400" />
            This league does not have an active season to query fantasy points.
          </div>
        </div>

        <!-- Actions -->
        <div class="flex flex-col md:flex-row justify-end gap-3">
          <ButtonComponent
            type="button"
            variant="outline"
            size="md"
            text="Clear filters"
            @click="emit('clear')"
            :disabled="isSearching"
            :full-width="true"
            class="md:w-auto"
          />
          <ButtonComponent
            type="submit"
            variant="primary"
            size="md"
            text="Find points"
            icon="hi-solid-search"
            :loading="isSearching"
            :disabled="disabled || isSearching"
            :full-width="true"
            class="md:w-auto"
          />
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ButtonComponent, MultiselectComponent } from '@/components/ui'
import type { FootballTeamResponse } from '@/interfaces/football/team/FootballTeamResponse'
import type { FootballStageResponse } from '@/interfaces/football/stage/FootballStageResponse'
import type { TypeResponse } from '@/interfaces/football/type/TypeResponse'

interface Props {
  selectedTeams: FootballTeamResponse[]
  selectedPositions: TypeResponse[]
  selectedStages: FootballStageResponse[]
  teams: FootballTeamResponse[]
  stages: FootballStageResponse[]
  positions: TypeResponse[]
  isLoadingTeams: boolean
  isLoadingStages: boolean
  isLoadingPositions: boolean
  isSearching: boolean
  disabled?: boolean
  isInitializing?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  isInitializing: false
})

const emit = defineEmits<{
  'update:selectedTeams': [value: FootballTeamResponse[]]
  'update:selectedPositions': [value: TypeResponse[]]
  'update:selectedStages': [value: FootballStageResponse[]]
  search: []
  clear: []
}>()

type TeamOption = FootballTeamResponse & Record<string, unknown>
type PositionOption = TypeResponse & Record<string, unknown>
type StageOption = FootballStageResponse & Record<string, unknown>

const teamOptions = computed<TeamOption[]>(() => props.teams as TeamOption[])
const positionOptions = computed<PositionOption[]>(() => props.positions as PositionOption[])

const stageOptions = computed<StageOption[]>(() => {
  if (!props.stages.length) {
    return []
  }

  return [...props.stages]
    .sort((a, b) => a.sort_order - b.sort_order) as StageOption[]
})

const localSelectedTeams = computed<TeamOption[]>({
  get: () => props.selectedTeams as TeamOption[],
  set: value => emit('update:selectedTeams', Array.isArray(value) ? value as FootballTeamResponse[] : [])
})

const localSelectedPositions = computed<PositionOption[]>({
  get: () => props.selectedPositions as PositionOption[],
  set: value => emit('update:selectedPositions', Array.isArray(value) ? value as TypeResponse[] : [])
})

const localSelectedStages = computed<StageOption[]>({
  get: () => props.selectedStages as StageOption[],
  set: value => emit('update:selectedStages', Array.isArray(value) ? value as FootballStageResponse[] : [])
})
</script>
