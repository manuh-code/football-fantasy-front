<template>
  <div class="space-y-6">
    <div v-if="isLoading" class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div class="flex flex-col items-center justify-center gap-4 py-16">
        <div class="h-12 w-12 rounded-full border-4 border-emerald-500/30 border-t-emerald-600 animate-spin"></div>
        <p class="text-sm text-gray-600 dark:text-gray-300">Loading management tools...</p>
      </div>
    </div>

    <div v-else-if="errorMessage" class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div class="py-12 px-6 text-center space-y-4">
        <div class="w-16 h-16 mx-auto rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
          <v-icon name="hi-solid-exclamation" class="w-8 h-8 text-red-600 dark:text-red-400" />
        </div>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Unable to load management data</h3>
        <p class="text-sm text-gray-600 dark:text-gray-400 max-w-lg mx-auto">{{ errorMessage }}</p>
        <ButtonComponent
          variant="outline"
          size="sm"
          text="Retry"
          @click="fetchLeagueDetails"
        />
      </div>
    </div>

    <template v-else>
      <section class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div class="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
              <v-icon name="hi-solid-clipboard-check" class="w-6 h-6 text-emerald-600 dark:text-emerald-300" />
            </div>
            <div class="space-y-1">
              <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Fantasy Rules</h2>
              <p v-if="league?.name" class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                {{ league.name }}
              </p>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                Configure how players earn points for each position inside your fantasy league.
              </p>
            </div>
          </div>
        </div>

        <div class="p-6">
          <div v-if="!hasScoringRules" class="text-center py-10">
            <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
              <v-icon name="hi-solid-document-text" class="w-8 h-8 text-gray-400" />
            </div>
            <p class="text-sm text-gray-600 dark:text-gray-400">No scoring rules available for this league yet.</p>
          </div>

          <form v-else class="space-y-6" @submit.prevent="handleSubmit">
            <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <p class="text-sm text-gray-600 dark:text-gray-400 max-w-2xl">
                Review and adjust the scoring weights by position. Use the collapsible panels to keep the interface tidy while editing.
              </p>
              <div class="flex flex-wrap gap-2">
                <ButtonComponent
                  variant="ghost"
                  size="sm"
                  type="button"
                  text="Expand all"
                  :disabled="areAllExpanded"
                  @click="expandAll"
                />
                <ButtonComponent
                  variant="ghost"
                  size="sm"
                  type="button"
                  text="Collapse all"
                  :disabled="!areAnyExpanded"
                  @click="collapseAll"
                />
              </div>
            </div>

            <div
              v-for="group in scoringRulesForm"
              :key="group.positionUuid"
              class="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden"
            >
              <button
                type="button"
                class="w-full flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-6 py-4 bg-gray-50 dark:bg-gray-900/60 border-b border-gray-200 dark:border-gray-700 text-left"
                :aria-expanded="isGroupExpanded(group.positionUuid)"
                @click="toggleGroup(group.positionUuid)"
              >
                <div>
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{{ group.positionName }}</h3>
                  <p class="text-sm text-gray-500 dark:text-gray-400">
                    {{ group.rules.length }} {{ group.rules.length === 1 ? 'rule' : 'rules' }} configured
                  </p>
                </div>
                <div class="flex items-center gap-3">
                  <span
                    v-if="group.positionCode"
                    class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 uppercase tracking-wide"
                  >
                    {{ group.positionCode }}
                  </span>
                  <v-icon
                    name="hi-solid-chevron-down"
                    class="w-5 h-5 text-gray-500 dark:text-gray-300 transition-transform duration-200"
                    :class="{ 'rotate-180': isGroupExpanded(group.positionUuid) }"
                  />
                </div>
              </button>

              <Transition
                enter-active-class="transition duration-200 ease-out"
                enter-from-class="opacity-0 -translate-y-2"
                enter-to-class="opacity-100 translate-y-0"
                leave-active-class="transition duration-150 ease-in"
                leave-from-class="opacity-100 translate-y-0"
                leave-to-class="opacity-0 -translate-y-1"
              >
                <div
                  v-if="isGroupExpanded(group.positionUuid)"
                  class="divide-y divide-gray-200 dark:divide-gray-700"
                >
                  <div v-for="rule in group.rules" :key="rule.uuid" class="p-6 space-y-4 bg-white dark:bg-gray-800">
                  <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div class="space-y-1">
                      <div class="flex items-center gap-2">
                        <h4 class="text-base font-semibold text-gray-900 dark:text-white">{{ rule.typeName }}</h4>
                        <span
                          v-if="rule.typeCode"
                          class="px-2 py-0.5 text-[11px] font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-md uppercase tracking-wide"
                        >
                          {{ rule.typeCode }}
                        </span>
                      </div>
                      <p class="text-sm text-gray-500 dark:text-gray-400">
                        Define the point value granted when this action occurs.
                      </p>
                    </div>

                    <div class="md:w-36">
                      <label :for="`points-${rule.uuid}`" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Points
                      </label>
                      <input
                        :id="`points-${rule.uuid}`"
                        type="number"
                        min="-50"
                        max="100"
                        step="0.5"
                        class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                        :value="rule.points"
                        @input="updatePoints(rule, $event)"
                      />
                    </div>
                  </div>

                  <div v-if="Object.keys(rule.condition).length" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div
                      v-for="(value, key) in rule.condition"
                      :key="`${rule.uuid}-${key}`"
                      class="flex flex-col gap-2"
                    >
                      <label :for="`condition-${rule.uuid}-${key}`" class="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {{ formatConditionLabel(key) }}
                      </label>

                      <template v-if="isBooleanCondition(value)">
                        <label
                          :for="`condition-${rule.uuid}-${key}`"
                          class="inline-flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300"
                        >
                          <input
                            :id="`condition-${rule.uuid}-${key}`"
                            type="checkbox"
                            class="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                            :checked="Boolean(value)"
                            @change="updateConditionBoolean(rule, key, $event)"
                          />
                          <span>Enable {{ formatConditionLabel(key).toLowerCase() }}</span>
                        </label>
                      </template>

                      <template v-else>
                        <input
                          :id="`condition-${rule.uuid}-${key}`"
                          type="number"
                          :step="getConditionStep(key)"
                          class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                          :value="getConditionNumberValue(rule.condition, key)"
                          @input="updateConditionNumber(rule, key, $event)"
                        />
                      </template>

                      <p v-if="getConditionHelperText(key)" class="text-xs text-gray-500 dark:text-gray-400">
                        {{ getConditionHelperText(key) }}
                      </p>
                    </div>
                  </div>
                  <div v-else class="text-sm text-gray-500 dark:text-gray-400 italic">
                    No special conditions configured for this rule.
                  </div>
                </div>
                </div>
              </Transition>
            </div>

            <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-end">
              <ButtonComponent
                variant="outline"
                size="sm"
                type="button"
                text="Reset Changes"
                :disabled="!hasChanges"
                @click="resetForm"
              />
              <ButtonComponent
                variant="primary"
                size="sm"
                type="submit"
                text="Save Rules"
                :disabled="!hasChanges || isSaving"
                :loading="isSaving"
              />
            </div>
          </form>
        </div>
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, defineProps, onMounted, ref, watch } from 'vue'
import { fantasyLeagueService } from '@/services/fantasy/leagues/FantasyLeagueService'
import type { FantasyLeaguesResponse } from '@/interfaces/fantasy/leagues/FantasyLeaguesResponse'
import type { FantasyLeagueScoringRules, FantasyRuleCondition } from '@/interfaces/fantasy/leagues/FantasyLeagueScoringRules'
import { useToast } from '@/composables/useToast'
import { ButtonComponent } from '@/components/ui'
import type { ScoreRulePayload } from '@/interfaces/fantasy/score/ScoreRulePayload'

interface Props {
  uuid: string
}

const props = defineProps<Props>()

const toast = useToast()

const league = ref<FantasyLeaguesResponse | null>(null)
const isLoading = ref(true)
const isSaving = ref(false)
const errorMessage = ref('')

interface RuleForm {
  uuid: string
  typeUuid: string
  typeName: string
  typeCode: string
  points: number
  condition: ConditionRecord
}

interface PositionGroupForm {
  positionUuid: string
  positionName: string
  positionCode: string
  rules: RuleForm[]
}

type ConditionRecord = Record<string, number | boolean | null>

const scoringRulesForm = ref<PositionGroupForm[]>([])
const initialFormSnapshot = ref('[]')
const expandedGroups = ref<Record<string, boolean>>({})

const hasScoringRules = computed(() => scoringRulesForm.value.length > 0)
const hasChanges = computed(() => JSON.stringify(scoringRulesForm.value) !== initialFormSnapshot.value)
const areAllExpanded = computed(() =>
  scoringRulesForm.value.length > 0 && scoringRulesForm.value.every((group) => expandedGroups.value[group.positionUuid])
)
const areAnyExpanded = computed(() =>
  scoringRulesForm.value.some((group) => expandedGroups.value[group.positionUuid])
)

const isGroupExpanded = (positionUuid: string) => Boolean(expandedGroups.value[positionUuid])

const toggleGroup = (positionUuid: string) => {
  expandedGroups.value = {
    ...expandedGroups.value,
    [positionUuid]: !expandedGroups.value[positionUuid]
  }
}

const expandAll = () => {
  const nextState: Record<string, boolean> = {}
  scoringRulesForm.value.forEach((group) => {
    nextState[group.positionUuid] = true
  })
  expandedGroups.value = nextState
}

const collapseAll = () => {
  const nextState: Record<string, boolean> = {}
  scoringRulesForm.value.forEach((group) => {
    nextState[group.positionUuid] = false
  })
  expandedGroups.value = nextState
}

const initializeExpandState = (groups: PositionGroupForm[]) => {
  const nextState: Record<string, boolean> = {}
  groups.forEach((group, index) => {
    nextState[group.positionUuid] = groups.length <= 2 ? true : index === 0
  })
  expandedGroups.value = nextState
}

const fetchLeagueDetails = async () => {
  if (!props.uuid) {
    errorMessage.value = 'League identifier is required to load management tools.'
    isLoading.value = false
    return
  }

  isLoading.value = true
  errorMessage.value = ''

  try {
    const response = await fantasyLeagueService.showFantasyLeague(props.uuid)
    league.value = response
    buildFormState(response.scoring_rules)
  } catch (error) {
    console.error('Error loading management data:', error)
    errorMessage.value = 'Failed to load fantasy league management data. Please try again later.'
    toast.error('Error', 'Unable to load management information for this league.')
  } finally {
    isLoading.value = false
  }
}

const buildFormState = (rules: FantasyLeagueScoringRules[] | null) => {
  if (!rules || !rules.length) {
    scoringRulesForm.value = []
    initialFormSnapshot.value = '[]'
    expandedGroups.value = {}
    return
  }

  const normalized = rules.map((group, index) => ({
    positionUuid: group.position?.uuid || `position-${index}`,
    positionName: group.position?.name || 'Unknown Position',
    positionCode: group.position?.code || '',
    rules: group.rules.map((rule) => ({
      uuid: rule.uuid,
      typeUuid: rule.type?.uuid || '',
      typeName: rule.type?.name || 'Unnamed Rule',
      typeCode: rule.type?.code || '',
      points: rule.points,
      condition: normalizeCondition(rule.condition)
    }))
  }))

  scoringRulesForm.value = normalized
  initialFormSnapshot.value = JSON.stringify(normalized)
  initializeExpandState(normalized)
}

const normalizeCondition = (condition: FantasyRuleCondition | null): ConditionRecord => {
  if (!condition) {
    return {}
  }

  const normalized: ConditionRecord = {}

  Object.entries(condition).forEach(([key, value]) => {
    if (typeof value === 'boolean' || typeof value === 'number' || value === null) {
      normalized[key] = value
    }
  })

  return normalized
}

const isBooleanCondition = (value: number | boolean | null) => typeof value === 'boolean'

const formatConditionLabel = (key: string) => key.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())

const getConditionStep = (key: string) => (key.includes('rating') ? 0.1 : 1)

const getConditionHelperText = (key: string) => {
  switch (key) {
    case 'every':
      return 'Applies each time the action happens the specified number of times.'
    case 'min_rating':
      return 'Minimum rating required for the player to earn these points.'
    case 'min_minutes':
      return 'Minimum minutes played required before the rule activates.'
    case 'multiplier':
      return 'When enabled, the resulting points will be multiplied.'
    default:
      return ''
  }
}

const getConditionNumberValue = (condition: ConditionRecord, key: string) => {
  const value = condition[key]
  return typeof value === 'number' ? value : ''
}

const updatePoints = (rule: RuleForm, event: Event) => {
  const target = event.target as HTMLInputElement
  rule.points = Number(target.value)
}

const updateConditionNumber = (rule: RuleForm, key: string, event: Event) => {
  const target = event.target as HTMLInputElement
  const rawValue = target.value.trim()

  if (rawValue === '') {
    rule.condition[key] = null
    return
  }

  const parsedValue = Number(rawValue)
  if (!Number.isNaN(parsedValue)) {
    rule.condition[key] = parsedValue
  }
}

const updateConditionBoolean = (rule: RuleForm, key: string, event: Event) => {
  const target = event.target as HTMLInputElement
  rule.condition[key] = target.checked
}

const resetForm = () => {
  if (!hasChanges.value) {
    return
  }

  scoringRulesForm.value = JSON.parse(initialFormSnapshot.value) as PositionGroupForm[]
  initializeExpandState(scoringRulesForm.value)
}

const buildScoreRulesPayload = (): ScoreRulePayload => {
  const scoreRules = scoringRulesForm.value.flatMap((group) =>
    group.rules.map((rule) => ({
      type_uuid: rule.typeUuid,
      position_uuid: group.positionUuid,
      points: rule.points,
      condition: serializeCondition(rule.condition)
    }))
  )

  return { score_rules: scoreRules }
}

const serializeCondition = (condition: ConditionRecord) => {
  const cleaned: Record<string, number | boolean> = {}

  Object.entries(condition).forEach(([key, value]) => {
    if (typeof value === 'boolean') {
      cleaned[key] = value
    } else if (typeof value === 'number' && !Number.isNaN(value)) {
      cleaned[key] = value
    }
  })

  return Object.keys(cleaned).length ? JSON.stringify(cleaned) : '{}'
}

const handleSubmit = async () => {
  if (!hasChanges.value) {
    toast.info('No changes', 'There are no new adjustments to save.')
    return
  }

  if (!props.uuid) {
    toast.error('Missing league', 'A league identifier is required to update the score rules.')
    return
  }

  isSaving.value = true

  try {
    const payload = buildScoreRulesPayload()
    await fantasyLeagueService.updateScoreRules(payload, props.uuid)
    initialFormSnapshot.value = JSON.stringify(scoringRulesForm.value)
    toast.success('Rules updated', 'Fantasy scoring rules were saved successfully.')
  } catch (error) {
    console.error('Error updating score rules:', error)
    toast.error('Error', 'We could not save the updated rules. Please try again later.')
  } finally {
    isSaving.value = false
  }
}

onMounted(fetchLeagueDetails)

watch(
  () => props.uuid,
  (newUuid, oldUuid) => {
    if (newUuid && newUuid !== oldUuid) {
      fetchLeagueDetails()
    }
  }
)
</script>
