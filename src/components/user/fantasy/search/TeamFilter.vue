<script setup lang="ts">
import { FootballTeamResponse } from '@/interfaces/football/team/FootballTeamResponse'
import { SearchableSelectComponent } from '@/components/ui'

interface Props {
  teams: FootballTeamResponse[]
  selectedTeam: string
  disabled?: boolean
}

withDefaults(defineProps<Props>(), {
  disabled: false,
})

const emit = defineEmits<{
  'update:selectedTeam': [value: string]
}>()

function onTeamChange(value: string | number | null) {
  emit('update:selectedTeam', String(value || 'ALL'))
}
</script>

<template>
  <SearchableSelectComponent
    id="fantasy-search-team-filter"
    :model-value="selectedTeam"
    @update:model-value="onTeamChange"
    :options="teams"
    value-key="uuid"
    label-key="name"
    image-key="image_path"
    subtitle-key="short_code"
    :placeholder="$t('fantasy.search.allTeams')"
    :search-placeholder="$t('fantasy.search.searchTeam')"
    :all-option="true"
    all-option-label="All teams"
    all-option-value="ALL"
    accent-color="indigo"
    default-image="/img/default-team.svg"
    no-results-text="No teams found for"
    :disabled="disabled"
  />
</template>

<style scoped>
/* Match the height/shape of the other filter controls (search input, participant
   select) — the shared select's own default is shorter and less rounded, which
   made this filter visibly out of line with its siblings. */
:deep(#fantasy-search-team-filter) {
  height: 2.75rem;
  border-radius: 0.75rem;
}
</style>
