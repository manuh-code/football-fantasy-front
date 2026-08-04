import { useI18n } from 'vue-i18n'

/**
 * Cómo se ve y cómo se nombra cada regla de puntuación.
 *
 * Vive aparte porque dos pantallas la necesitan: la tabla de reglas que ve
 * cualquier participante y el editor del admin. Tenerla duplicada haría que un
 * icono nuevo apareciera en una y no en la otra.
 */

export interface PositionMeta {
  icon: string
  badgeBg: string
  badgeText: string
  order: number
  labelKey: string
}

export const POSITION_META: Record<string, PositionMeta> = {
  GOALKEEPER: { icon: 'hi-solid-shield-check', badgeBg: 'bg-blue-50 dark:bg-blue-900/30', badgeText: 'text-blue-600 dark:text-blue-400', order: 0, labelKey: 'goalkeeper' },
  DEFENDER: { icon: 'hi-solid-shield-exclamation', badgeBg: 'bg-green-50 dark:bg-green-900/30', badgeText: 'text-green-600 dark:text-green-400', order: 1, labelKey: 'defender' },
  MIDFIELDER: { icon: 'hi-solid-lightning-bolt', badgeBg: 'bg-yellow-50 dark:bg-yellow-900/30', badgeText: 'text-yellow-600 dark:text-yellow-400', order: 2, labelKey: 'midfielder' },
  ATTACKER: { icon: 'hi-solid-fire', badgeBg: 'bg-red-50 dark:bg-red-900/30', badgeText: 'text-red-600 dark:text-red-400', order: 3, labelKey: 'attacker' },
}

export const DEFAULT_POSITION_META: PositionMeta = {
  icon: 'hi-solid-user-group',
  badgeBg: 'bg-gray-50 dark:bg-gray-800',
  badgeText: 'text-gray-500 dark:text-gray-400',
  order: 99,
  labelKey: '',
}

export const STAT_ICONS: Record<string, string> = {
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

/** Condición cruda tal como llega del API: JSON ya parseado o todavía en texto. */
export type ScoringCondition = string | number | boolean | null | Record<string, unknown> | unknown[]

export function useScoringRuleMeta() {
  const { t, te } = useI18n()

  const positionMeta = (developerName?: string | null): PositionMeta =>
    POSITION_META[developerName || ''] || DEFAULT_POSITION_META

  const positionLabel = (developerName?: string | null, fallback?: string | null): string => {
    const meta = POSITION_META[developerName || '']
    if (meta) return t(`fantasy.rules.positions.${meta.labelKey}`)
    return fallback || '—'
  }

  const statIcon = (developerName?: string | null): string =>
    STAT_ICONS[developerName || ''] || 'hi-solid-chart-bar'

  const statLabel = (developerName?: string | null, fallback?: string | null): string => {
    const key = developerName ? `fantasy.rules.stats.${developerName}` : ''
    if (key && te(key)) return t(key)
    return fallback || '—'
  }

  const parseCondition = (condition: ScoringCondition): Record<string, unknown> | null => {
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

  const conditionText = (condition: ScoringCondition): string | null => {
    const obj = parseCondition(condition)
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

  return { positionMeta, positionLabel, statIcon, statLabel, parseCondition, conditionText }
}
