<template>
  <div class="space-y-4">
    <!-- Intro -->
    <div class="bg-gradient-to-r from-sky-50 to-blue-50 dark:from-sky-900/20 dark:to-blue-900/10 border border-sky-100 dark:border-sky-800/40 rounded-2xl p-4">
      <div class="flex items-start gap-3">
        <div class="w-9 h-9 rounded-xl bg-white dark:bg-gray-800 flex items-center justify-center shrink-0 ring-1 ring-sky-100 dark:ring-sky-800/60">
          <v-icon name="hi-solid-clipboard-list" class="w-4 h-4 text-sky-500" />
        </div>
        <div class="min-w-0">
          <h2 class="text-callout font-semibold text-gray-900 dark:text-white">{{ $t('fantasy.rules.title') }}</h2>
          <p class="text-footnote text-gray-500 dark:text-gray-400 mt-0.5">{{ $t('fantasy.rules.subtitle') }}</p>
        </div>
      </div>
      <p class="text-2xs text-gray-500 dark:text-gray-400 leading-relaxed mt-3">
        {{ $t('fantasy.rules.intro') }}
      </p>
    </div>

    <!-- Per-position accordion -->
    <div
      v-for="group in sortedGroups"
      :key="positionKey(group)"
      class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 overflow-hidden"
    >
      <button
        type="button"
        @click="toggle(positionKey(group))"
        :aria-expanded="isOpen(positionKey(group))"
        class="w-full flex items-center justify-between gap-3 p-4 text-left"
      >
        <div class="flex items-center gap-3 min-w-0">
          <div
            class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            :class="positionMeta(group).badgeBg"
          >
            <v-icon :name="positionMeta(group).icon" class="w-4 h-4" :class="positionMeta(group).badgeText" />
          </div>
          <div class="min-w-0">
            <h3 class="text-callout font-semibold text-gray-900 dark:text-white truncate">
              {{ positionLabel(group) }}
            </h3>
            <p class="text-2xs text-gray-400 dark:text-gray-500">{{ rulesCountLabel(group.rules.length) }}</p>
          </div>
        </div>
        <v-icon
          name="hi-solid-chevron-down"
          class="w-4 h-4 text-gray-400 dark:text-gray-500 transition-transform duration-300 shrink-0"
          :class="isOpen(positionKey(group)) ? 'rotate-180' : ''"
        />
      </button>

      <div
        class="overflow-hidden transition-[max-height,opacity] duration-300 ease-out"
        :style="{ maxHeight: isOpen(positionKey(group)) ? '4000px' : '0px', opacity: isOpen(positionKey(group)) ? 1 : 0 }"
        :aria-hidden="!isOpen(positionKey(group))"
      >
        <div class="px-4 pb-4 space-y-4" :inert="!isOpen(positionKey(group))">
          <!-- Positive points -->
          <div v-if="positives(group).length">
            <h4 class="text-2xs font-semibold uppercase tracking-wide text-emerald-500 dark:text-emerald-400 mb-2">
              {{ $t('fantasy.rules.positivesLabel') }}
            </h4>
            <div class="space-y-2">
              <div
                v-for="rule in positives(group)"
                :key="rule.uuid"
                class="flex items-center gap-3 bg-gray-50 dark:bg-gray-900/40 rounded-xl px-3 py-2.5"
              >
                <div class="w-8 h-8 rounded-lg bg-white dark:bg-gray-800 flex items-center justify-center shrink-0 ring-1 ring-gray-100 dark:ring-gray-700">
                  <v-icon :name="statIcon(rule)" class="w-4 h-4 text-emerald-500" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-footnote font-medium text-gray-900 dark:text-white leading-tight truncate">
                    {{ statLabel(rule) }}
                  </p>
                  <p
                    v-if="conditionText(rule)"
                    class="text-2xs text-sky-600 dark:text-sky-400 leading-snug flex items-center gap-1 mt-0.5"
                  >
                    <v-icon name="hi-solid-adjustments" class="w-3 h-3 shrink-0" />
                    <span class="truncate">{{ conditionText(rule) }}</span>
                  </p>
                </div>
                <span class="inline-flex items-center justify-center min-w-[3rem] px-2 py-1 rounded-lg text-footnote font-bold bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 shrink-0">
                  +{{ rule.points }}
                </span>
              </div>
            </div>
          </div>

          <!-- Penalties -->
          <div v-if="negatives(group).length">
            <h4 class="text-2xs font-semibold uppercase tracking-wide text-red-500 dark:text-red-400 mb-2">
              {{ $t('fantasy.rules.penaltiesLabel') }}
            </h4>
            <div class="space-y-2">
              <div
                v-for="rule in negatives(group)"
                :key="rule.uuid"
                class="flex items-center gap-3 bg-gray-50 dark:bg-gray-900/40 rounded-xl px-3 py-2.5"
              >
                <div class="w-8 h-8 rounded-lg bg-white dark:bg-gray-800 flex items-center justify-center shrink-0 ring-1 ring-gray-100 dark:ring-gray-700">
                  <v-icon :name="statIcon(rule)" class="w-4 h-4 text-red-500" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-footnote font-medium text-gray-900 dark:text-white leading-tight truncate">
                    {{ statLabel(rule) }}
                  </p>
                  <p
                    v-if="conditionText(rule)"
                    class="text-2xs text-sky-600 dark:text-sky-400 leading-snug flex items-center gap-1 mt-0.5"
                  >
                    <v-icon name="hi-solid-adjustments" class="w-3 h-3 shrink-0" />
                    <span class="truncate">{{ conditionText(rule) }}</span>
                  </p>
                </div>
                <span class="inline-flex items-center justify-center min-w-[3rem] px-2 py-1 rounded-lg text-footnote font-bold bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 shrink-0">
                  {{ rule.points }}
                </span>
              </div>
            </div>
          </div>

          <!-- Neutral (0 points) -->
          <div v-if="neutrals(group).length">
            <h4 class="text-2xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-2">
              {{ $t('fantasy.rules.neutralLabel') }}
            </h4>
            <div class="space-y-2">
              <div
                v-for="rule in neutrals(group)"
                :key="rule.uuid"
                class="flex items-center gap-3 bg-gray-50 dark:bg-gray-900/40 rounded-xl px-3 py-2.5 opacity-70"
              >
                <div class="w-8 h-8 rounded-lg bg-white dark:bg-gray-800 flex items-center justify-center shrink-0 ring-1 ring-gray-100 dark:ring-gray-700">
                  <v-icon :name="statIcon(rule)" class="w-4 h-4 text-gray-400 dark:text-gray-500" />
                </div>
                <p class="flex-1 min-w-0 text-footnote font-medium text-gray-500 dark:text-gray-400 leading-tight truncate">
                  {{ statLabel(rule) }}
                </p>
                <span class="inline-flex items-center justify-center min-w-[3rem] px-2 py-1 rounded-lg text-footnote font-bold bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 shrink-0">
                  0
                </span>
              </div>
            </div>
          </div>

          <p
            v-if="!positives(group).length && !negatives(group).length && !neutrals(group).length"
            class="text-2xs text-gray-400 dark:text-gray-500 text-center py-2"
          >
            {{ $t('fantasy.rules.noRulesForPosition') }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, PropType } from 'vue'
import { useI18n } from 'vue-i18n'
import { FantasyLeagueScoringRules, FantasyRule } from '@/interfaces/fantasy/leagues/FantasyLeagueScoringRules'

const props = defineProps({
  scoringData: {
    type: Array as PropType<FantasyLeagueScoringRules[]>,
    required: true,
  },
})

const { t, te } = useI18n()

interface PositionMeta {
  icon: string
  badgeBg: string
  badgeText: string
  order: number
  labelKey: string
}

const POSITION_META: Record<string, PositionMeta> = {
  GOALKEEPER: { icon: 'hi-solid-shield-check', badgeBg: 'bg-blue-50 dark:bg-blue-900/30', badgeText: 'text-blue-600 dark:text-blue-400', order: 0, labelKey: 'goalkeeper' },
  DEFENDER: { icon: 'hi-solid-shield-exclamation', badgeBg: 'bg-green-50 dark:bg-green-900/30', badgeText: 'text-green-600 dark:text-green-400', order: 1, labelKey: 'defender' },
  MIDFIELDER: { icon: 'hi-solid-lightning-bolt', badgeBg: 'bg-yellow-50 dark:bg-yellow-900/30', badgeText: 'text-yellow-600 dark:text-yellow-400', order: 2, labelKey: 'midfielder' },
  ATTACKER: { icon: 'hi-solid-fire', badgeBg: 'bg-red-50 dark:bg-red-900/30', badgeText: 'text-red-600 dark:text-red-400', order: 3, labelKey: 'attacker' },
}
const DEFAULT_POSITION_META: PositionMeta = {
  icon: 'hi-solid-user-group',
  badgeBg: 'bg-gray-50 dark:bg-gray-800',
  badgeText: 'text-gray-500 dark:text-gray-400',
  order: 99,
  labelKey: '',
}

const STAT_ICONS: Record<string, string> = {
  GOALS: 'gi-soccer-ball',
  PENALTIES_SCORED: 'md-sportssoccer',
  ASSISTS: 'hi-solid-user-add',
  OWN_GOALS: 'hi-solid-x-circle',
  YELLOWRED_CARDS: 'hi-solid-exclamation-circle',
  REDCARDS: 'hi-solid-ban',
  FOULS: 'hi-solid-exclamation',
  PENALTIES_MISSES: 'md-cancel',
  PENALTIES_COMMITTED: 'hi-solid-x',
  PENALTIES_WON: 'hi-solid-plus-circle',
  PENALTIES_SAVED: 'bi-shield-check',
  GOALKEEPER_CLEANSHEET: 'hi-solid-shield-check',
  GOALKEEPER_GOALS_CONCEDED: 'hi-solid-shield-exclamation',
  GOALS_CONCEDED: 'hi-solid-shield-exclamation',
  HIT_WOODWORK: 'hi-solid-lightning-bolt',
  SAVES: 'hi-solid-eye',
  ACCURATE_PASSES: 'hi-solid-switch-horizontal',
  KEY_PASSES: 'hi-solid-sparkles',
  TACKLES: 'gi-crossed-swords',
  INTERCEPTIONS: 'hi-solid-filter',
  CLEARANCES: 'hi-solid-arrow-up',
  DUELS_WON: 'bi-trophy',
  SHOTS_ON_TARGET: 'hi-solid-location-marker',
  SUCCESSFUL_DRIBBLES: 'hi-solid-cursor-click',
  BLOCKED_SHOTS: 'hi-solid-shield-exclamation',
}

function positionDevName(group: FantasyLeagueScoringRules): string {
  return group.position?.developer_name || ''
}

function positionMeta(group: FantasyLeagueScoringRules): PositionMeta {
  return POSITION_META[positionDevName(group)] || DEFAULT_POSITION_META
}

function positionLabel(group: FantasyLeagueScoringRules): string {
  const meta = POSITION_META[positionDevName(group)]
  if (meta) return t(`fantasy.rules.positions.${meta.labelKey}`)
  return group.position?.name || '—'
}

function positionKey(group: FantasyLeagueScoringRules): string {
  return group.position?.uuid || group.position?.code || positionDevName(group) || 'unknown'
}

const sortedGroups = computed(() =>
  [...(props.scoringData || [])]
    .filter((group) => group.position)
    .sort((a, b) => positionMeta(a).order - positionMeta(b).order),
)

function rulesCountLabel(count: number): string {
  return t('fantasy.rules.rulesCount', { count }, count)
}

function statIcon(rule: FantasyRule): string {
  const devName = rule.type?.developer_name || ''
  return STAT_ICONS[devName] || 'hi-solid-chart-bar'
}

function statLabel(rule: FantasyRule): string {
  const devName = rule.type?.developer_name
  const key = devName ? `fantasy.rules.stats.${devName}` : ''
  if (key && te(key)) return t(key)
  return rule.type?.name || rule.type?.code || '—'
}

function parseCondition(condition: FantasyRule['condition']): Record<string, unknown> | null {
  if (condition === null || condition === undefined) return null
  if (typeof condition === 'string') {
    if (!condition.trim()) return null
    try {
      const parsed = JSON.parse(condition)
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : null
    } catch {
      return null
    }
  }
  if (typeof condition === 'object' && !Array.isArray(condition)) {
    return Object.keys(condition).length ? (condition as Record<string, unknown>) : null
  }
  return null
}

function conditionText(rule: FantasyRule): string | null {
  const obj = parseCondition(rule.condition)
  if (!obj) return null

  if (obj.range && typeof obj.range === 'object') {
    const range = obj.range as Record<string, unknown>
    return t('fantasy.rules.conditionRange', { min: range.min, max: range.max })
  }
  if (obj.every !== undefined) return t('fantasy.rules.conditionEvery', { value: obj.every })
  if (obj.exact !== undefined) return t('fantasy.rules.conditionExact', { value: obj.exact })
  if (obj.multiplier !== undefined) return t('fantasy.rules.conditionMultiplier', { value: obj.multiplier })
  if (obj.min_rating !== undefined) return t('fantasy.rules.conditionMinRating', { value: obj.min_rating })
  if (obj.min_minutes !== undefined) return t('fantasy.rules.conditionMinMinutes', { value: obj.min_minutes })
  if (obj.minutes !== undefined) return t('fantasy.rules.conditionMinutes', { value: obj.minutes })
  return t('fantasy.rules.conditionBadge')
}

function positives(group: FantasyLeagueScoringRules): FantasyRule[] {
  return [...group.rules].filter((rule) => rule.points > 0).sort((a, b) => b.points - a.points)
}

function negatives(group: FantasyLeagueScoringRules): FantasyRule[] {
  return [...group.rules].filter((rule) => rule.points < 0).sort((a, b) => a.points - b.points)
}

function neutrals(group: FantasyLeagueScoringRules): FantasyRule[] {
  return group.rules.filter((rule) => rule.points === 0)
}

// Accordion: the first position (goalkeeper, by sort order) starts open.
const openPositions = ref<Set<string>>(new Set())

watch(
  sortedGroups,
  (groups) => {
    if (groups.length && openPositions.value.size === 0) {
      openPositions.value = new Set([positionKey(groups[0])])
    }
  },
  { immediate: true },
)

function isOpen(key: string): boolean {
  return openPositions.value.has(key)
}

function toggle(key: string): void {
  const next = new Set(openPositions.value)
  if (next.has(key)) next.delete(key)
  else next.add(key)
  openPositions.value = next
}
</script>
