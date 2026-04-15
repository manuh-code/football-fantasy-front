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
    :model-value="selectedTeam"
    @update:model-value="onTeamChange"
    :options="teams"
    value-key="uuid"
    label-key="name"
    image-key="image_path"
    subtitle-key="short_code"
    placeholder="All teams"
    search-placeholder="Search team..."
    :all-option="true"
    all-option-label="All teams"
    all-option-value="ALL"
    accent-color="indigo"
    default-image="/img/default-team.svg"
    no-results-text="No teams found for"
    :disabled="disabled"
  />
</template>
