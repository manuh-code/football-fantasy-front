<script setup lang="ts">
import { computed } from 'vue'
import type { FantasyFootballPlayerVersusResponse } from '@/interfaces/user/fantasy/FantasyFootballPlayerVersusResponse'
import type { FantasyLeagueMatchupResponse } from '@/interfaces/fantasy/matchups/FantasyLeagueMatchupResponse'
import type { FantasyFootballPlayer } from '@/interfaces/user/fantasy/FantasyFootballPlayersResponse'
import { usePositionShortCode } from '@/composables/usePositionShortCode'
import NationalityBadge from '@/components/football/ui/NationalityBadge.vue'

interface Props {
  matchup: FantasyLeagueMatchupResponse
  versusData: FantasyFootballPlayerVersusResponse | null
  isLoading: boolean
  error: string | null
  /** Drop the card chrome + internal header so it can nest inside a collapsible. */
  embedded?: boolean
}

const props = withDefaults(defineProps<Props>(), { embedded: false })
const emit = defineEmits<{ close: [] }>()

const positionShort = usePositionShortCode()

const positionOrder: Record<string, number> = { GOALKEEPER: 0, DEFENDER: 1, MIDFIELDER: 2, ATTACKER: 3, FLEX: 4 }

function sortedStarters(players: FantasyFootballPlayer[]): FantasyFootballPlayer[] {
  return [...players]
    .filter((p) => p.is_starter || p.is_flex)
    .sort((a, b) => (positionOrder[a.position?.developer_name ?? ''] ?? 99) - (positionOrder[b.position?.developer_name ?? ''] ?? 99))
}

function sortedBench(players: FantasyFootballPlayer[]): FantasyFootballPlayer[] {
  return players.filter((p) => !p.is_starter && !p.is_flex)
}

const homeStarters = computed(() => props.versusData ? sortedStarters(props.versusData.home_lineup.players) : [])
const awayStarters = computed(() => props.versusData ? sortedStarters(props.versusData.away_lineup.players) : [])
const homeBench = computed(() => props.versusData ? sortedBench(props.versusData.home_lineup.players) : [])
const awayBench = computed(() => props.versusData ? sortedBench(props.versusData.away_lineup.players) : [])

const starterRows = computed(() =>
  Array.from({ length: Math.max(homeStarters.value.length, awayStarters.value.length) }, (_, i) => i),
)
const benchRows = computed(() =>
  Array.from({ length: Math.max(homeBench.value.length, awayBench.value.length) }, (_, i) => i),
)

const isCompleted = computed(() => props.matchup.status === 'completed')

/** Per-position duel outcome — drives the winner emphasis on each rung. */
function starterHomeWins(idx: number): boolean {
  return (homeStarters.value[idx]?.fantasy_points ?? 0) > (awayStarters.value[idx]?.fantasy_points ?? 0)
}
function starterAwayWins(idx: number): boolean {
  return (awayStarters.value[idx]?.fantasy_points ?? 0) > (homeStarters.value[idx]?.fantasy_points ?? 0)
}
function scoreChipClass(isWinner: boolean): string {
  return isWinner
    ? 'bg-emerald-50 dark:bg-emerald-900/25 text-emerald-700 dark:text-emerald-300 font-extrabold'
    : 'text-gray-400 dark:text-gray-500 font-semibold'
}

function positionColor(developerName: string): string {
  const map: Record<string, string> = {
    GOALKEEPER: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
    DEFENDER: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
    MIDFIELDER: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
    ATTACKER: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
    FLEX: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
  }
  return map[developerName] ?? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
}
</script>

<template>
  <div :class="embedded ? '' : 'bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 overflow-hidden'">

    <!-- ── Section Header (hidden when embedded — the parent card owns it) ── -->
    <div v-if="!embedded" class="px-4 py-3 border-b border-gray-100 dark:border-gray-700/60">
      <div class="flex items-center gap-3">
        <!-- Home team -->
        <div class="flex items-center gap-2 flex-1 min-w-0">
          <div class="w-7 h-7 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 shrink-0 flex items-center justify-center">
            <img v-if="matchup.home.team.image_path" :src="matchup.home.team.image_path" :alt="matchup.home.team.team_name" class="w-full h-full object-cover" />
            <span v-else class="text-2xs font-bold text-gray-500">{{ matchup.home.team.team_name.substring(0, 2).toUpperCase() }}</span>
          </div>
          <p class="text-footnote font-semibold text-gray-900 dark:text-white truncate">{{ matchup.home.team.team_name }}</p>
        </div>
        <!-- Score + close -->
        <div class="flex items-center gap-2 shrink-0">
          <div class="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-gray-50 dark:bg-gray-700/60">
            <span class="text-footnote font-extrabold tabular-nums leading-none" :class="isCompleted && matchup.winner === matchup.home.team.uuid ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-900 dark:text-white'">{{ matchup.home.score }}</span>
            <span class="text-2xs text-gray-300 dark:text-gray-600">–</span>
            <span class="text-footnote font-extrabold tabular-nums leading-none" :class="isCompleted && matchup.winner === matchup.away.team.uuid ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-900 dark:text-white'">{{ matchup.away.score }}</span>
          </div>
          <button
            class="w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 active:scale-90 transition-all"
            @click="emit('close')"
          >
            <v-icon name="hi-solid-x" class="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>
        <!-- Away team -->
        <div class="flex items-center gap-2 flex-1 min-w-0 justify-end">
          <p class="text-footnote font-semibold text-gray-900 dark:text-white truncate text-right">{{ matchup.away.team.team_name }}</p>
          <div class="w-7 h-7 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 shrink-0 flex items-center justify-center">
            <img v-if="matchup.away.team.image_path" :src="matchup.away.team.image_path" :alt="matchup.away.team.team_name" class="w-full h-full object-cover" />
            <span v-else class="text-2xs font-bold text-gray-500">{{ matchup.away.team.team_name.substring(0, 2).toUpperCase() }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Loading skeleton ── -->
    <div v-if="isLoading" class="divide-y divide-gray-100 dark:divide-gray-700/60">
      <div v-for="i in 10" :key="i" class="flex items-center gap-2 px-4 py-2.5">
        <div class="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 animate-pulse shrink-0" />
        <div class="flex-1 space-y-1.5">
          <div class="h-3 w-20 rounded bg-gray-100 dark:bg-gray-700 animate-pulse" />
          <div class="h-2 w-12 rounded bg-gray-50 dark:bg-gray-800 animate-pulse" />
        </div>
        <div class="w-7 h-5 rounded bg-gray-100 dark:bg-gray-700 animate-pulse" />
        <div class="w-7 h-5 rounded bg-gray-100 dark:bg-gray-700 animate-pulse" />
        <div class="flex-1 space-y-1.5 flex flex-col items-end">
          <div class="h-3 w-20 rounded bg-gray-100 dark:bg-gray-700 animate-pulse" />
          <div class="h-2 w-12 rounded bg-gray-50 dark:bg-gray-800 animate-pulse" />
        </div>
        <div class="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 animate-pulse shrink-0" />
      </div>
    </div>

    <!-- ── Error ── -->
    <div v-else-if="error" class="px-4 py-4 flex items-center gap-2">
      <v-icon name="hi-solid-exclamation-circle" class="w-5 h-5 text-red-500 shrink-0" />
      <p class="text-footnote text-red-700 dark:text-red-300">{{ error }}</p>
    </div>

    <!-- ── Versus lineups — a position-by-position duel ladder ── -->
    <template v-else-if="versusData">

      <!-- Starters eyebrow -->
      <div class="px-4 py-2.5 bg-gray-50/80 dark:bg-gray-700/30 border-b border-gray-100 dark:border-gray-700/60 flex items-center gap-2">
        <v-icon name="hi-solid-star" class="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400 shrink-0" />
        <h3 class="text-2xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">{{ $t('fantasy.matchups.starters') }}</h3>
      </div>

      <!-- Duel ladder: a center spine threads the position rungs together -->
      <div class="relative">
        <div
          class="pointer-events-none absolute inset-y-0 left-1/2 -translate-x-1/2 w-px bg-gray-200/80 dark:bg-gray-700/70"
          aria-hidden="true"
        />
        <div class="relative divide-y divide-gray-100 dark:divide-gray-700/60">
          <div
            v-for="idx in starterRows"
            :key="`starter-${idx}`"
            class="flex items-center gap-1.5 sm:gap-3 px-2 sm:px-4 py-2.5"
          >
            <!-- Home player -->
            <template v-if="homeStarters[idx]">
              <img
                :src="homeStarters[idx].football_player.image_path || '/img/default-avatar.svg'"
                :alt="homeStarters[idx].football_player.display_name"
                class="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border border-gray-200 dark:border-gray-600 shrink-0"
              />
              <div class="flex-1 min-w-0">
                <p
                  :title="homeStarters[idx].football_player.display_name"
                  class="text-2xs sm:text-footnote font-medium text-gray-900 dark:text-white leading-tight line-clamp-2 break-words"
                >
                  {{ homeStarters[idx].football_player.display_name }}
                </p>
                <div class="flex flex-wrap items-center gap-1 mt-0.5">
                  <img
                    v-if="homeStarters[idx].team"
                    :src="homeStarters[idx].team.image_path"
                    :alt="homeStarters[idx].team.short_code"
                    class="w-3.5 h-3.5 object-contain shrink-0"
                  />
                  <NationalityBadge :country="homeStarters[idx].football_player.country" />
                </div>
              </div>
            </template>
            <div v-else class="w-7 h-7 sm:w-8 sm:h-8 shrink-0" />
            <div v-if="!homeStarters[idx]" class="flex-1" />

            <!-- Duel: score · position rung · score -->
            <div class="relative z-10 flex items-center gap-0.5 sm:gap-1.5 shrink-0">
              <span
                class="min-w-[20px] sm:min-w-[30px] px-1 sm:px-1.5 py-0.5 rounded-md text-2xs sm:text-xs tabular-nums text-center transition-colors"
                :class="scoreChipClass(starterHomeWins(idx))"
              >{{ homeStarters[idx]?.fantasy_points ?? 0 }}</span>
              <span
                class="inline-flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-lg text-2xs font-bold shrink-0 ring-2 sm:ring-4 ring-white dark:ring-gray-800"
                :class="positionColor(homeStarters[idx]?.position?.developer_name ?? awayStarters[idx]?.position?.developer_name ?? '')"
              >
                {{ positionShort((homeStarters[idx] ?? awayStarters[idx])?.position?.developer_name) }}
              </span>
              <span
                class="min-w-[20px] sm:min-w-[30px] px-1 sm:px-1.5 py-0.5 rounded-md text-2xs sm:text-xs tabular-nums text-center transition-colors"
                :class="scoreChipClass(starterAwayWins(idx))"
              >{{ awayStarters[idx]?.fantasy_points ?? 0 }}</span>
            </div>

            <!-- Away player -->
            <template v-if="awayStarters[idx]">
              <div class="flex-1 min-w-0 text-right">
                <p
                  :title="awayStarters[idx].football_player.display_name"
                  class="text-2xs sm:text-footnote font-medium text-gray-900 dark:text-white leading-tight line-clamp-2 break-words"
                >
                  {{ awayStarters[idx].football_player.display_name }}
                </p>
                <div class="flex flex-wrap items-center justify-end gap-1 mt-0.5">
                  <NationalityBadge :country="awayStarters[idx].football_player.country" />
                  <img
                    v-if="awayStarters[idx].team"
                    :src="awayStarters[idx].team.image_path"
                    :alt="awayStarters[idx].team.short_code"
                    class="w-3.5 h-3.5 object-contain shrink-0"
                  />
                </div>
              </div>
              <img
                :src="awayStarters[idx].football_player.image_path || '/img/default-avatar.svg'"
                :alt="awayStarters[idx].football_player.display_name"
                class="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border border-gray-200 dark:border-gray-600 shrink-0"
              />
            </template>
            <div v-else class="flex-1" />
            <div v-if="!awayStarters[idx]" class="w-7 h-7 sm:w-8 sm:h-8 shrink-0" />
          </div>
        </div>
      </div>

      <!-- Bench eyebrow -->
      <div
        v-if="benchRows.length"
        class="px-4 py-2.5 bg-gray-50/80 dark:bg-gray-700/30 border-y border-gray-100 dark:border-gray-700/60 flex items-center gap-2"
      >
        <v-icon name="hi-solid-users" class="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 shrink-0" />
        <h3 class="text-2xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">{{ $t('fantasy.matchups.bench') }}</h3>
      </div>

      <div v-if="benchRows.length" class="divide-y divide-gray-100 dark:divide-gray-700/60">
        <div
          v-for="idx in benchRows"
          :key="`bench-${idx}`"
          class="flex items-center gap-1.5 sm:gap-3 px-2 sm:px-4 py-2.5 opacity-60"
        >
          <!-- Home bench -->
          <template v-if="homeBench[idx]">
            <img
              :src="homeBench[idx].football_player.image_path || '/img/default-avatar.svg'"
              :alt="homeBench[idx].football_player.display_name"
              class="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border border-gray-200 dark:border-gray-600 shrink-0"
            />
            <div class="flex-1 min-w-0">
              <p
                :title="homeBench[idx].football_player.display_name"
                class="text-2xs sm:text-footnote font-medium text-gray-900 dark:text-white leading-tight line-clamp-2 break-words"
              >
                {{ homeBench[idx].football_player.display_name }}
              </p>
              <div class="flex flex-wrap items-center gap-1 mt-0.5">
                <img
                  v-if="homeBench[idx].team"
                  :src="homeBench[idx].team.image_path"
                  :alt="homeBench[idx].team.short_code"
                  class="w-3.5 h-3.5 object-contain shrink-0"
                />
                <NationalityBadge :country="homeBench[idx].football_player.country" />
              </div>
            </div>
          </template>
          <div v-else class="w-7 h-7 sm:w-8 sm:h-8 shrink-0" />
          <div v-if="!homeBench[idx]" class="flex-1" />

          <!-- Points + position badge -->
          <div class="flex items-center gap-0.5 sm:gap-1.5 shrink-0">
            <span class="min-w-[20px] sm:min-w-[30px] text-2xs sm:text-xs font-semibold tabular-nums text-center text-gray-400 dark:text-gray-500">
              {{ homeBench[idx]?.fantasy_points ?? '—' }}
            </span>
            <span
              class="inline-flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-lg text-2xs font-bold shrink-0"
              :class="positionColor(homeBench[idx]?.position?.developer_name ?? awayBench[idx]?.position?.developer_name ?? '')"
            >
              {{ positionShort((homeBench[idx] ?? awayBench[idx])?.position?.developer_name) }}
            </span>
            <span class="min-w-[20px] sm:min-w-[30px] text-2xs sm:text-xs font-semibold tabular-nums text-center text-gray-400 dark:text-gray-500">
              {{ awayBench[idx]?.fantasy_points ?? '—' }}
            </span>
          </div>

          <!-- Away bench -->
          <template v-if="awayBench[idx]">
            <div class="flex-1 min-w-0 text-right">
              <p
                :title="awayBench[idx].football_player.display_name"
                class="text-2xs sm:text-footnote font-medium text-gray-900 dark:text-white leading-tight line-clamp-2 break-words"
              >
                {{ awayBench[idx].football_player.display_name }}
              </p>
              <div class="flex flex-wrap items-center justify-end gap-1 mt-0.5">
                <NationalityBadge :country="awayBench[idx].football_player.country" />
                <img
                  v-if="awayBench[idx].team"
                  :src="awayBench[idx].team.image_path"
                  :alt="awayBench[idx].team.short_code"
                  class="w-3.5 h-3.5 object-contain shrink-0"
                />
              </div>
            </div>
            <img
              :src="awayBench[idx].football_player.image_path || '/img/default-avatar.svg'"
              :alt="awayBench[idx].football_player.display_name"
              class="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border border-gray-200 dark:border-gray-600 shrink-0"
            />
          </template>
          <div v-else class="flex-1" />
          <div v-if="!awayBench[idx]" class="w-7 h-7 sm:w-8 sm:h-8 shrink-0" />
        </div>
      </div>

    </template>
  </div>
</template>
