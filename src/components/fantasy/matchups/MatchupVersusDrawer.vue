<script setup lang="ts">
import { computed } from 'vue'
import type { FantasyFootballPlayerVersusResponse } from '@/interfaces/user/fantasy/FantasyFootballPlayerVersusResponse'
import type { FantasyLeagueMatchupResponse } from '@/interfaces/fantasy/matchups/FantasyLeagueMatchupResponse'
import type { FantasyFootballPlayer } from '@/interfaces/user/fantasy/FantasyFootballPlayersResponse'

interface Props {
  isOpen: boolean
  matchup: FantasyLeagueMatchupResponse | null
  versusData: FantasyFootballPlayerVersusResponse | null
  isLoading: boolean
  error: string | null
}

const props = defineProps<Props>()
const emit = defineEmits<{ close: [] }>()

// Position order for display
const positionOrder: Record<string, number> = { GK: 0, DEF: 1, MID: 2, FW: 3, FLEX: 4 }

function sortedStarters(players: FantasyFootballPlayer[]): FantasyFootballPlayer[] {
  return [...players]
    .filter((p) => p.is_starter || p.is_flex)
    .sort((a, b) => {
      const aOrder = positionOrder[a.position?.code ?? ''] ?? 99
      const bOrder = positionOrder[b.position?.code ?? ''] ?? 99
      return aOrder - bOrder
    })
}

function sortedBench(players: FantasyFootballPlayer[]): FantasyFootballPlayer[] {
  return players.filter((p) => !p.is_starter && !p.is_flex)
}

const homeName = computed(() => {
  if (props.versusData) {
    const u = props.versusData.home_lineup.user
    return [u.firstname, u.lastname].filter(Boolean).join(' ') || 'Home'
  }
  return props.matchup?.home.team.team_name ?? 'Home'
})

const awayName = computed(() => {
  if (props.versusData) {
    const u = props.versusData.away_lineup.user
    return [u.firstname, u.lastname].filter(Boolean).join(' ') || 'Away'
  }
  return props.matchup?.away.team.team_name ?? 'Away'
})

const homeScore = computed(() => props.matchup?.home.score ?? '—')
const awayScore = computed(() => props.matchup?.away.score ?? '—')
const isCompleted = computed(() => props.matchup?.status === 'completed')
</script>

<template>
  <!-- Backdrop -->
  <Transition name="fade">
    <div
      v-if="props.isOpen"
      class="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
      @click="emit('close')"
    />
  </Transition>

  <!-- Sheet -->
  <Transition name="slide-up">
    <div
      v-if="props.isOpen"
      class="fixed bottom-0 left-0 right-0 z-50 max-h-[90dvh] flex flex-col rounded-t-3xl bg-white dark:bg-gray-900 shadow-2xl overflow-hidden"
    >
      <!-- Handle -->
      <div class="flex justify-center pt-3 pb-1 shrink-0">
        <div class="w-10 h-1 rounded-full bg-gray-200 dark:bg-gray-700" />
      </div>

      <!-- Header: score summary -->
      <div class="px-4 pb-4 pt-2 shrink-0 border-b border-gray-100 dark:border-gray-800">
        <div class="flex items-center gap-3">
          <!-- Home avatar -->
          <div class="flex flex-col items-center gap-1 flex-1 min-w-0">
            <div
              class="w-10 h-10 rounded-full overflow-hidden border-2 bg-gray-100 dark:bg-gray-700 flex items-center justify-center"
              :class="isCompleted && matchup?.winner === matchup?.home.team.uuid
                ? 'border-emerald-400'
                : 'border-gray-200 dark:border-gray-600'"
            >
              <img
                v-if="matchup?.home.team.image_path"
                :src="matchup.home.team.image_path"
                :alt="matchup.home.team.team_name"
                class="w-full h-full object-cover"
              />
              <span v-else class="text-xs font-bold text-gray-500">
                {{ matchup?.home.team.team_name?.substring(0, 2).toUpperCase() }}
              </span>
            </div>
            <p class="text-2xs font-semibold text-gray-700 dark:text-gray-300 truncate w-full text-center px-1">
              {{ homeName }}
            </p>
          </div>

          <!-- Score -->
          <div class="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-gray-50 dark:bg-gray-800 shrink-0">
            <span class="text-xl font-extrabold tabular-nums text-gray-900 dark:text-white">{{ homeScore }}</span>
            <span class="text-footnote text-gray-300 dark:text-gray-600">–</span>
            <span class="text-xl font-extrabold tabular-nums text-gray-900 dark:text-white">{{ awayScore }}</span>
          </div>

          <!-- Away avatar -->
          <div class="flex flex-col items-center gap-1 flex-1 min-w-0">
            <div
              class="w-10 h-10 rounded-full overflow-hidden border-2 bg-gray-100 dark:bg-gray-700 flex items-center justify-center"
              :class="isCompleted && matchup?.winner === matchup?.away.team.uuid
                ? 'border-emerald-400'
                : 'border-gray-200 dark:border-gray-600'"
            >
              <img
                v-if="matchup?.away.team.image_path"
                :src="matchup.away.team.image_path"
                :alt="matchup.away.team.team_name"
                class="w-full h-full object-cover"
              />
              <span v-else class="text-xs font-bold text-gray-500">
                {{ matchup?.away.team.team_name?.substring(0, 2).toUpperCase() }}
              </span>
            </div>
            <p class="text-2xs font-semibold text-gray-700 dark:text-gray-300 truncate w-full text-center px-1">
              {{ awayName }}
            </p>
          </div>
        </div>
      </div>

      <!-- Scrollable content -->
      <div class="flex-1 overflow-y-auto overscroll-contain px-4 py-4 space-y-6">

        <!-- Loading skeleton -->
        <div v-if="props.isLoading" class="space-y-3">
          <div v-for="i in 8" :key="i" class="flex items-center justify-between gap-3">
            <div class="flex items-center gap-2 flex-1">
              <div class="w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-700 animate-pulse shrink-0" />
              <div class="flex-1 space-y-1">
                <div class="h-3 w-24 rounded bg-gray-100 dark:bg-gray-700 animate-pulse" />
                <div class="h-2 w-14 rounded bg-gray-50 dark:bg-gray-800 animate-pulse" />
              </div>
            </div>
            <div class="w-8 h-4 rounded bg-gray-100 dark:bg-gray-700 animate-pulse" />
            <div class="w-8 h-4 rounded bg-gray-100 dark:bg-gray-700 animate-pulse" />
            <div class="flex items-center gap-2 flex-1 justify-end">
              <div class="flex-1 space-y-1 text-right">
                <div class="h-3 w-24 rounded bg-gray-100 dark:bg-gray-700 animate-pulse ml-auto" />
                <div class="h-2 w-14 rounded bg-gray-50 dark:bg-gray-800 animate-pulse ml-auto" />
              </div>
              <div class="w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-700 animate-pulse shrink-0" />
            </div>
          </div>
        </div>

        <!-- Error -->
        <div
          v-else-if="props.error"
          class="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-center gap-2"
        >
          <v-icon name="hi-solid-exclamation-circle" class="w-5 h-5 text-red-500 shrink-0" />
          <p class="text-footnote text-red-700 dark:text-red-300">{{ props.error }}</p>
        </div>

        <!-- Lineups -->
        <template v-else-if="props.versusData">

          <!-- Section: Starters -->
          <div>
            <p class="text-2xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3">{{ $t('fantasy.matchups.starters') }}</p>
            <div class="space-y-2">
              <div
                v-for="(_, idx) in sortedStarters(versusData!.home_lineup.players)"
                :key="idx"
                class="flex items-center gap-2"
              >
                <!-- Home player -->
                <div class="flex items-center gap-2 flex-1 min-w-0">
                  <img
                    v-if="sortedStarters(versusData!.home_lineup.players)[idx]?.football_player.image_path"
                    :src="sortedStarters(versusData!.home_lineup.players)[idx].football_player.image_path"
                    :alt="sortedStarters(versusData!.home_lineup.players)[idx].football_player.display_name"
                    class="w-7 h-7 rounded-full object-cover bg-gray-100 dark:bg-gray-700 shrink-0"
                  />
                  <div v-else class="w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center shrink-0">
                    <span class="text-2xs font-bold text-gray-400">{{ sortedStarters(versusData!.home_lineup.players)[idx]?.position?.code }}</span>
                  </div>
                  <div class="min-w-0">
                    <p class="text-xs font-medium text-gray-800 dark:text-gray-200 truncate leading-tight">
                      {{ sortedStarters(versusData!.home_lineup.players)[idx]?.football_player.display_name }}
                    </p>
                    <p class="text-2xs text-gray-400 dark:text-gray-500 leading-tight">
                      {{ sortedStarters(versusData!.home_lineup.players)[idx]?.position?.name }}
                    </p>
                  </div>
                </div>

                <!-- Points -->
                <div class="flex items-center gap-1.5 shrink-0">
                  <span
                    class="text-footnote font-bold tabular-nums min-w-[28px] text-right"
                    :class="(sortedStarters(versusData!.home_lineup.players)[idx]?.fantasy_points ?? 0) >
                      (sortedStarters(versusData!.away_lineup.players)[idx]?.fantasy_points ?? 0)
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-gray-700 dark:text-gray-300'"
                  >
                    {{ sortedStarters(versusData!.home_lineup.players)[idx]?.fantasy_points ?? 0 }}
                  </span>
                  <span class="text-2xs text-gray-300 dark:text-gray-600">vs</span>
                  <span
                    class="text-footnote font-bold tabular-nums min-w-[28px] text-left"
                    :class="(sortedStarters(versusData!.away_lineup.players)[idx]?.fantasy_points ?? 0) >
                      (sortedStarters(versusData!.home_lineup.players)[idx]?.fantasy_points ?? 0)
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-gray-700 dark:text-gray-300'"
                  >
                    {{ sortedStarters(versusData!.away_lineup.players)[idx]?.fantasy_points ?? 0 }}
                  </span>
                </div>

                <!-- Away player -->
                <div class="flex items-center gap-2 flex-1 min-w-0 justify-end">
                  <div class="min-w-0 text-right">
                    <p class="text-xs font-medium text-gray-800 dark:text-gray-200 truncate leading-tight">
                      {{ sortedStarters(versusData!.away_lineup.players)[idx]?.football_player.display_name }}
                    </p>
                    <p class="text-2xs text-gray-400 dark:text-gray-500 leading-tight">
                      {{ sortedStarters(versusData!.away_lineup.players)[idx]?.position?.name }}
                    </p>
                  </div>
                  <img
                    v-if="sortedStarters(versusData!.away_lineup.players)[idx]?.football_player.image_path"
                    :src="sortedStarters(versusData!.away_lineup.players)[idx].football_player.image_path"
                    :alt="sortedStarters(versusData!.away_lineup.players)[idx].football_player.display_name"
                    class="w-7 h-7 rounded-full object-cover bg-gray-100 dark:bg-gray-700 shrink-0"
                  />
                  <div v-else class="w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center shrink-0">
                    <span class="text-2xs font-bold text-gray-400">{{ sortedStarters(versusData!.away_lineup.players)[idx]?.position?.code }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Divider -->
          <div class="border-t border-dashed border-gray-200 dark:border-gray-700/60" />

          <!-- Section: Bench -->
          <div v-if="sortedBench(versusData!.home_lineup.players).length || sortedBench(versusData!.away_lineup.players).length">
            <p class="text-2xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3">{{ $t('fantasy.matchups.bench') }}</p>
            <div class="space-y-2">
              <div
                v-for="(_, idx) in Array.from({ length: Math.max(sortedBench(versusData!.home_lineup.players).length, sortedBench(versusData!.away_lineup.players).length) })"
                :key="idx"
                class="flex items-center gap-2 opacity-60"
              >
                <!-- Home bench -->
                <div class="flex items-center gap-2 flex-1 min-w-0">
                  <template v-if="sortedBench(versusData!.home_lineup.players)[idx]">
                    <img
                      v-if="sortedBench(versusData!.home_lineup.players)[idx].football_player.image_path"
                      :src="sortedBench(versusData!.home_lineup.players)[idx].football_player.image_path"
                      :alt="sortedBench(versusData!.home_lineup.players)[idx].football_player.display_name"
                      class="w-7 h-7 rounded-full object-cover bg-gray-100 dark:bg-gray-700 shrink-0"
                    />
                    <div v-else class="w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center shrink-0">
                      <span class="text-2xs font-bold text-gray-400">{{ sortedBench(versusData!.home_lineup.players)[idx]?.position?.code }}</span>
                    </div>
                    <p class="text-xs font-medium text-gray-700 dark:text-gray-400 truncate">
                      {{ sortedBench(versusData!.home_lineup.players)[idx].football_player.display_name }}
                    </p>
                  </template>
                  <div v-else class="flex-1" />
                </div>

                <!-- Points -->
                <div class="flex items-center gap-1.5 shrink-0">
                  <span class="text-footnote font-bold tabular-nums min-w-[28px] text-right text-gray-600 dark:text-gray-400">
                    {{ sortedBench(versusData!.home_lineup.players)[idx]?.fantasy_points ?? '—' }}
                  </span>
                  <span class="text-2xs text-gray-300 dark:text-gray-600">vs</span>
                  <span class="text-footnote font-bold tabular-nums min-w-[28px] text-left text-gray-600 dark:text-gray-400">
                    {{ sortedBench(versusData!.away_lineup.players)[idx]?.fantasy_points ?? '—' }}
                  </span>
                </div>

                <!-- Away bench -->
                <div class="flex items-center gap-2 flex-1 min-w-0 justify-end">
                  <template v-if="sortedBench(versusData!.away_lineup.players)[idx]">
                    <p class="text-xs font-medium text-gray-700 dark:text-gray-400 truncate text-right">
                      {{ sortedBench(versusData!.away_lineup.players)[idx].football_player.display_name }}
                    </p>
                    <img
                      v-if="sortedBench(versusData!.away_lineup.players)[idx].football_player.image_path"
                      :src="sortedBench(versusData!.away_lineup.players)[idx].football_player.image_path"
                      :alt="sortedBench(versusData!.away_lineup.players)[idx].football_player.display_name"
                      class="w-7 h-7 rounded-full object-cover bg-gray-100 dark:bg-gray-700 shrink-0"
                    />
                    <div v-else class="w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center shrink-0">
                      <span class="text-2xs font-bold text-gray-400">{{ sortedBench(versusData!.away_lineup.players)[idx]?.position?.code }}</span>
                    </div>
                  </template>
                  <div v-else class="flex-1" />
                </div>
              </div>
            </div>
          </div>

          <!-- Total points row -->
          <div class="rounded-2xl bg-gray-50 dark:bg-gray-800 px-4 py-3 flex items-center justify-between">
            <span class="text-footnote font-bold text-gray-700 dark:text-gray-300">
              {{ versusData!.home_lineup.players.reduce((acc, p) => acc + (p.fantasy_points ?? 0), 0) }}
              <span class="text-2xs font-normal text-gray-400 dark:text-gray-500 ml-0.5">{{ $t('fantasy.matchups.pts') }}</span>
            </span>
            <span class="text-2xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">{{ $t('fantasy.matchups.total') }}</span>
            <span class="text-footnote font-bold text-gray-700 dark:text-gray-300">
              {{ versusData!.away_lineup.players.reduce((acc, p) => acc + (p.fantasy_points ?? 0), 0) }}
              <span class="text-2xs font-normal text-gray-400 dark:text-gray-500 ml-0.5">{{ $t('fantasy.matchups.pts') }}</span>
            </span>
          </div>

          <!-- Bottom safe area padding -->
          <div class="h-6" />
        </template>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.3s cubic-bezier(0.32, 0.72, 0, 1);
}
.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
}
</style>
