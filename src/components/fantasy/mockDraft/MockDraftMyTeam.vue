<template>
  <div
    class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 overflow-hidden"
  >
    <div class="px-4 py-2.5 flex items-center justify-between">
      <div class="min-w-0">
        <h3 class="text-footnote font-semibold text-gray-900 dark:text-white leading-tight truncate">
          {{ team?.name ?? $t('fantasy.mockDraft.myTeam.title') }}
        </h3>
        <p class="text-2xs text-gray-500 dark:text-gray-400">
          {{ $t('fantasy.mockDraft.myTeam.filled', { filled: roster.length, total: totalSlots }) }}
        </p>
      </div>
      <span class="text-sm font-black text-emerald-600 dark:text-emerald-400 tabular-nums shrink-0">
        {{ team?.total_points ?? 0 }}
      </span>
    </div>

    <!-- Necesidades: qué te falta por llenar -->
    <div class="px-3 pb-2 flex gap-1 overflow-x-auto scrollbar-hide">
      <span
        v-for="need in needs"
        :key="need.key"
        class="shrink-0 px-2 py-0.5 rounded-lg text-2xs font-semibold"
        :class="
          need.missing > 0
            ? 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'
            : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
        "
      >
        {{ $t(`fantasy.positionsShort.${need.key}`) }} {{ need.filled }}/{{ need.total }}
      </span>
    </div>

    <!-- Plantilla agrupada por tipo de slot -->
    <div v-if="!roster.length" class="px-4 py-8 text-center">
      <v-icon name="hi-solid-user-add" class="w-8 h-8 mx-auto text-gray-300 dark:text-gray-600 mb-2" />
      <p class="text-2xs text-gray-500 dark:text-gray-400">
        {{ $t('fantasy.mockDraft.myTeam.empty') }}
      </p>
    </div>

    <template v-else>
      <div v-for="group in groups" :key="group.key">
        <p
          v-if="group.picks.length"
          class="px-4 py-1 text-[0.5rem] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-700/30"
        >
          {{ $t(`fantasy.mockDraft.myTeam.${group.key}`) }}
        </p>
        <ul class="divide-y divide-gray-50 dark:divide-gray-700/30">
          <li v-for="pick in group.picks" :key="pick.pick" class="flex items-center gap-2.5 px-3 py-2">
            <div class="w-8 h-8 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700 shrink-0">
              <img
                v-if="pick.player?.image_path"
                :src="pick.player.image_path"
                :alt="pick.player?.display_name ?? ''"
                class="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-xs font-semibold text-gray-900 dark:text-white truncate">
                {{ pick.player?.display_name ?? '—' }}
              </p>
              <p class="text-[0.5rem] text-gray-500 dark:text-gray-400 truncate">
                {{ pick.position?.code ? $t(`fantasy.positionsShort.${pick.position.code}`) : '' }}
                · {{ pick.team?.name }} · R{{ pick.round }}
                <span v-if="pick.auto_picked"> · {{ $t('fantasy.mockDraft.myTeam.auto') }}</span>
              </p>
            </div>
            <span class="text-xs font-bold text-gray-700 dark:text-gray-300 tabular-nums shrink-0">
              {{ pick.total_points }}
            </span>
          </li>
        </ul>
      </div>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import type { MockDraftFormation, MockDraftPick, MockDraftTeam } from '@/interfaces/fantasy/mockDraft/MockDraftResponse'

const props = defineProps<{
  team: MockDraftTeam | null
  /** Plantilla ya recortada a lo revelado en pantalla. */
  roster: MockDraftPick[]
  formation: MockDraftFormation
}>()

const FORMATION_KEYS: (keyof MockDraftFormation)[] = [
  'goalkeeper',
  'defender',
  'midfielder',
  'attacker',
  'flex',
  'bench',
]

const totalSlots = computed(() => FORMATION_KEYS.reduce((total, key) => total + (props.formation[key] ?? 0), 0))

/**
 * Ocupación por slot. Se recalcula sobre la plantilla ya revelada (no sobre
 * `team.counts`, que viene del snapshot completo) para que los contadores no se
 * adelanten a los fichajes que todavía están apareciendo en pantalla.
 */
const needs = computed(() =>
  FORMATION_KEYS.map((key) => {
    const total = props.formation[key] ?? 0
    const filled = props.roster.filter((pick) => slotKey(pick) === key).length
    return { key, total, filled, missing: Math.max(0, total - filled) }
  }).filter((need) => need.total > 0),
)

function slotKey(pick: MockDraftPick): string {
  if (pick.is_flex) return 'flex'
  if (!pick.is_starter) return 'bench'
  return pick.position?.code ?? ''
}

const groups = computed(() => [
  { key: 'starters', picks: props.roster.filter((pick) => pick.is_starter && !pick.is_flex) },
  { key: 'flex', picks: props.roster.filter((pick) => pick.is_flex) },
  { key: 'bench', picks: props.roster.filter((pick) => !pick.is_starter) },
])
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.tabular-nums {
  font-variant-numeric: tabular-nums;
}
</style>
