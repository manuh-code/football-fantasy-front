<script setup lang="ts">
import { computed } from 'vue'
import type { FantasyFootballPlayerVersusResponse } from '@/interfaces/user/fantasy/FantasyFootballPlayerVersusResponse'
import type { FantasyLeagueMatchupResponse } from '@/interfaces/fantasy/matchups/FantasyLeagueMatchupResponse'
import type { FantasyFootballPlayer } from '@/interfaces/user/fantasy/FantasyFootballPlayersResponse'

interface Props {
  matchup: FantasyLeagueMatchupResponse
  versusData: FantasyFootballPlayerVersusResponse | null
  isLoading: boolean
  error: string | null
}

const props = defineProps<Props>()
const emit = defineEmits<{ close: [] }>()

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

const homeTotal = computed(() =>
  props.versusData?.home_lineup.players.reduce((sum, p) => sum + (p.fantasy_points ?? 0), 0) ?? 0,
)
const awayTotal = computed(() =>
  props.versusData?.away_lineup.players.reduce((sum, p) => sum + (p.fantasy_points ?? 0), 0) ?? 0,
)

const isCompleted = computed(() => props.matchup.status === 'completed')

function positionCode(p: FantasyFootballPlayer): string {
  const map: Record<string, string> = { GOALKEEPER: 'GK', DEFENDER: 'DEF', MIDFIELDER: 'MID', ATTACKER: 'FW', FLEX: 'FX' }
  return map[p.position?.developer_name ?? ''] ?? p.position?.code ?? '?'
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
  <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 overflow-hidden">

    <!-- ── Section Header ── -->
    <div class="px-4 py-3 border-b border-gray-100 dark:border-gray-700/60">
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

    <!-- ── Versus rows ── -->
    <template v-else-if="versusData">

      <!-- Starters subheader -->
      <div class="px-4 py-3 bg-gray-50 dark:bg-gray-700/40 border-b border-gray-100 dark:border-gray-700/60 flex items-center gap-2">
        <v-icon name="hi-solid-star" class="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0" />
        <h3 class="text-footnote font-semibold text-gray-900 dark:text-white">{{ $t('fantasy.matchups.starters') }}</h3>
      </div>

      <div class="divide-y divide-gray-100 dark:divide-gray-700/60">
        <div
          v-for="idx in starterRows"
          :key="`starter-${idx}`"
          class="flex items-center gap-3 px-4 py-2.5"
        >
          <!-- Home player -->
          <template v-if="homeStarters[idx]">
            <img
              :src="homeStarters[idx].football_player.image_path || '/img/default-avatar.svg'"
              :alt="homeStarters[idx].football_player.display_name"
              class="w-8 h-8 rounded-full object-cover border border-gray-200 dark:border-gray-600 shrink-0"
            />
            <div class="flex-1 min-w-0">
              <p class="text-footnote font-medium text-gray-900 dark:text-white truncate leading-tight">
                {{ homeStarters[idx].football_player.display_name }}
              </p>
              <p class="text-2xs text-gray-400 dark:text-gray-500 leading-tight">
                {{ homeStarters[idx].position?.name }}
              </p>
            </div>
          </template>
          <div v-else class="w-8 h-8 shrink-0" />
          <div v-if="!homeStarters[idx]" class="flex-1" />

          <!-- Points + position badge -->
          <div class="flex items-center gap-1 shrink-0">
            <span
              class="text-xs font-bold tabular-nums min-w-[26px] text-right"
              :class="(homeStarters[idx]?.fantasy_points ?? 0) > (awayStarters[idx]?.fantasy_points ?? 0)
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-gray-600 dark:text-gray-400'"
            >{{ homeStarters[idx]?.fantasy_points ?? 0 }}</span>
            <span
              class="inline-flex items-center justify-center w-7 h-7 rounded-lg text-2xs font-bold shrink-0"
              :class="positionColor(homeStarters[idx]?.position?.developer_name ?? awayStarters[idx]?.position?.developer_name ?? '')"
            >
              {{ positionCode(homeStarters[idx] ?? awayStarters[idx]) }}
            </span>
            <span
              class="text-xs font-bold tabular-nums min-w-[26px] text-left"
              :class="(awayStarters[idx]?.fantasy_points ?? 0) > (homeStarters[idx]?.fantasy_points ?? 0)
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-gray-600 dark:text-gray-400'"
            >{{ awayStarters[idx]?.fantasy_points ?? 0 }}</span>
          </div>

          <!-- Away player -->
          <template v-if="awayStarters[idx]">
            <div class="flex-1 min-w-0 text-right">
              <p class="text-footnote font-medium text-gray-900 dark:text-white truncate leading-tight">
                {{ awayStarters[idx].football_player.display_name }}
              </p>
              <p class="text-2xs text-gray-400 dark:text-gray-500 leading-tight">
                {{ awayStarters[idx].position?.name }}
              </p>
            </div>
            <img
              :src="awayStarters[idx].football_player.image_path || '/img/default-avatar.svg'"
              :alt="awayStarters[idx].football_player.display_name"
              class="w-8 h-8 rounded-full object-cover border border-gray-200 dark:border-gray-600 shrink-0"
            />
          </template>
          <div v-else class="flex-1" />
          <div v-if="!awayStarters[idx]" class="w-8 h-8 shrink-0" />
        </div>
      </div>

      <!-- Bench subheader -->
      <div
        v-if="benchRows.length"
        class="px-4 py-3 bg-gray-50 dark:bg-gray-700/40 border-y border-gray-100 dark:border-gray-700/60 flex items-center gap-2"
      >
        <v-icon name="hi-solid-users" class="w-4 h-4 text-gray-500 dark:text-gray-400 shrink-0" />
        <h3 class="text-footnote font-semibold text-gray-900 dark:text-white">{{ $t('fantasy.matchups.bench') }}</h3>
      </div>

      <div v-if="benchRows.length" class="divide-y divide-gray-100 dark:divide-gray-700/60">
        <div
          v-for="idx in benchRows"
          :key="`bench-${idx}`"
          class="flex items-center gap-3 px-4 py-2.5 opacity-60"
        >
          <!-- Home bench -->
          <template v-if="homeBench[idx]">
            <img
              :src="homeBench[idx].football_player.image_path || '/img/default-avatar.svg'"
              :alt="homeBench[idx].football_player.display_name"
              class="w-8 h-8 rounded-full object-cover border border-gray-200 dark:border-gray-600 shrink-0"
            />
            <div class="flex-1 min-w-0">
              <p class="text-footnote font-medium text-gray-900 dark:text-white truncate leading-tight">
                {{ homeBench[idx].football_player.display_name }}
              </p>
              <p class="text-2xs text-gray-400 dark:text-gray-500 leading-tight">
                {{ homeBench[idx].position?.name }}
              </p>
            </div>
          </template>
          <div v-else class="w-8 h-8 shrink-0" />
          <div v-if="!homeBench[idx]" class="flex-1" />

          <!-- Points + position badge -->
          <div class="flex items-center gap-1 shrink-0">
            <span class="text-xs font-bold tabular-nums min-w-[26px] text-right text-gray-500 dark:text-gray-400">
              {{ homeBench[idx]?.fantasy_points ?? '—' }}
            </span>
            <span
              class="inline-flex items-center justify-center w-7 h-7 rounded-lg text-2xs font-bold shrink-0"
              :class="positionColor(homeBench[idx]?.position?.developer_name ?? awayBench[idx]?.position?.developer_name ?? '')"
            >
              {{ positionCode(homeBench[idx] ?? awayBench[idx]) }}
            </span>
            <span class="text-xs font-bold tabular-nums min-w-[26px] text-left text-gray-500 dark:text-gray-400">
              {{ awayBench[idx]?.fantasy_points ?? '—' }}
            </span>
          </div>

          <!-- Away bench -->
          <template v-if="awayBench[idx]">
            <div class="flex-1 min-w-0 text-right">
              <p class="text-footnote font-medium text-gray-900 dark:text-white truncate leading-tight">
                {{ awayBench[idx].football_player.display_name }}
              </p>
              <p class="text-2xs text-gray-400 dark:text-gray-500 leading-tight">
                {{ awayBench[idx].position?.name }}
              </p>
            </div>
            <img
              :src="awayBench[idx].football_player.image_path || '/img/default-avatar.svg'"
              :alt="awayBench[idx].football_player.display_name"
              class="w-8 h-8 rounded-full object-cover border border-gray-200 dark:border-gray-600 shrink-0"
            />
          </template>
          <div v-else class="flex-1" />
          <div v-if="!awayBench[idx]" class="w-8 h-8 shrink-0" />
        </div>
      </div>

      <!-- Total row -->
      <div class="px-4 py-3 border-t border-gray-100 dark:border-gray-700/60 bg-gray-50 dark:bg-gray-700/40 flex items-center">
        <span
          class="text-footnote font-bold tabular-nums flex-1"
          :class="homeTotal > awayTotal ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-700 dark:text-gray-300'"
        >
          {{ homeTotal }}
          <span class="text-2xs font-normal text-gray-400 dark:text-gray-500 ml-0.5">{{ $t('fantasy.matchups.pts') }}</span>
        </span>
        <span class="text-2xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">{{ $t('fantasy.matchups.total') }}</span>
        <span
          class="text-footnote font-bold tabular-nums flex-1 text-right"
          :class="awayTotal > homeTotal ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-700 dark:text-gray-300'"
        >
          {{ awayTotal }}
          <span class="text-2xs font-normal text-gray-400 dark:text-gray-500 ml-0.5">{{ $t('fantasy.matchups.pts') }}</span>
        </span>
      </div>

    </template>
  </div>
</template>
