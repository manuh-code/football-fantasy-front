<template>
  <div class="w-full">
    <!-- Loading -->
    <div v-if="isLoading" class="flex items-center justify-center py-12">
      <div class="flex flex-col items-center gap-3">
        <v-icon
          name="pr-spinner"
          class="w-5 h-5 text-gray-300 dark:text-gray-600"
          animation="spin"
        />
        <p class="text-[13px] text-gray-400 dark:text-gray-500">Loading draft board...</p>
      </div>
    </div>

    <!-- Error -->
    <div
      v-else-if="error"
      class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 p-5"
    >
      <div class="flex items-center gap-3">
        <v-icon
          name="hi-solid-exclamation-circle"
          class="w-5 h-5 text-red-500 dark:text-red-400 shrink-0"
        />
        <div>
          <h3 class="text-[13px] font-semibold text-gray-900 dark:text-white">Failed to load draft board</h3>
          <p class="text-[12px] text-gray-500 dark:text-gray-400 mt-0.5">{{ error }}</p>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="roundsData.length === 0"
      class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 p-8 text-center"
    >
      <div class="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center mx-auto mb-3">
        <v-icon name="hi-solid-clipboard-list" class="w-6 h-6 text-gray-400 dark:text-gray-500" />
      </div>
      <h3 class="text-[14px] font-semibold text-gray-900 dark:text-white mb-1">No picks yet</h3>
      <p class="text-[12px] text-gray-500 dark:text-gray-400">The draft board will update as players are picked.</p>
    </div>

    <!-- Draft Board -->
    <div v-else class="space-y-2">
      <div
        v-for="round in roundsData"
        :key="round.number"
        class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 overflow-hidden"
      >
        <!-- Round Header -->
        <div class="flex items-center justify-between px-3.5 py-2 border-b border-gray-100 dark:border-gray-700/60 bg-gray-50/80 dark:bg-gray-700/30">
          <div class="flex items-center gap-2">
            <span class="text-[11px] font-bold text-gray-900 dark:text-white uppercase tracking-wider">
              Round {{ round.number }}
            </span>
            <span class="text-[10px] text-gray-400 dark:text-gray-500">
              {{ round.picks.length }} {{ round.picks.length === 1 ? 'pick' : 'picks' }}
            </span>
          </div>
          <!-- Snake direction indicator -->
          <v-icon
            :name="round.isReversed ? 'hi-solid-arrow-left' : 'hi-solid-arrow-right'"
            class="w-3 h-3 text-gray-400 dark:text-gray-500"
          />
        </div>

        <!-- Picks Row — horizontal scroll -->
        <div
          class="flex gap-2 px-3 py-2.5 overflow-x-auto scrollbar-hide"
          :class="{ 'flex-row-reverse': round.isReversed }"
        >
          <div
            v-for="pick in round.picks"
            :key="pick.pick"
            class="shrink-0 w-[72px] sm:w-[80px] flex flex-col items-center gap-1.5"
          >
            <!-- Pick number pill -->
            <span
              class="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
              :class="positionPillClass(pick.player?.position?.developer_name)"
              style="font-variant-numeric: tabular-nums"
            >
              #{{ pick.pick }}
            </span>

            <!-- Player photo -->
            <div class="relative">
              <div
                class="w-11 h-11 sm:w-12 sm:h-12 rounded-full overflow-hidden border-2"
                :class="positionBorderClass(pick.player?.position?.developer_name)"
              >
                <img
                  v-if="pick.player?.image_path"
                  :src="pick.player.image_path"
                  :alt="pick.player.display_name"
                  class="w-full h-full object-cover"
                />
                <div
                  v-else
                  class="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-700 text-[11px] font-bold text-gray-400 dark:text-gray-500"
                >
                  {{ playerInitials(pick.player) }}
                </div>
              </div>

              <!-- User avatar badge -->
              <div
                class="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full overflow-hidden ring-2 ring-white dark:ring-gray-800"
              >
                <img
                  v-if="pick.user?.avatar"
                  :src="pick.user.avatar"
                  :alt="pick.user.firstname ?? ''"
                  class="w-full h-full object-cover"
                />
                <div
                  v-else
                  class="w-full h-full flex items-center justify-center bg-blue-500 text-[7px] font-bold text-white"
                >
                  {{ userInitials(pick.user) }}
                </div>
              </div>
            </div>

            <!-- Player name -->
            <p class="text-[10px] sm:text-[11px] font-semibold text-gray-800 dark:text-gray-200 text-center leading-tight truncate w-full">
              {{ shortName(pick.player) }}
            </p>

            <!-- Position badge -->
            <span
              class="text-[8px] font-bold px-1.5 py-0.5 rounded"
              :class="positionBadgeClass(pick.player?.position?.developer_name)"
            >
              {{ pick.player?.position?.code ?? '—' }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import { fantasyLeagueService } from '@/services/fantasy/leagues/FantasyLeagueService';
import type { FantasyDraftPlayerPicked } from '@/interfaces/fantasy/draft/FantasyDraftPlayerPicked';
import type { FootballPlayerResponse } from '@/interfaces/football/player/FootballPlayerResponse';
import type { UserDataInterface } from '@/interfaces/user/userInterface';

const props = defineProps<{
  fantasyLeagueUuid: string;
}>();

const picks = ref<FantasyDraftPlayerPicked[]>([]);
const isLoading = ref(false);
const error = ref<string | null>(null);

const roundsData = computed(() => {
  const grouped = new Map<number, FantasyDraftPlayerPicked[]>();
  for (const pick of picks.value) {
    if (!grouped.has(pick.round)) {
      grouped.set(pick.round, []);
    }
    grouped.get(pick.round)!.push(pick);
  }
  return Array.from(grouped.entries())
    .sort(([a], [b]) => a - b)
    .map(([roundNumber, roundPicks]) => ({
      number: roundNumber,
      picks: roundPicks.sort((a, b) => a.pick - b.pick),
      isReversed: roundNumber % 2 === 0,
    }));
});

function shortName(player: FootballPlayerResponse | null): string {
  if (!player) return '—';
  return player.common_name || player.display_name || '—';
}

function playerInitials(player: FootballPlayerResponse | null): string {
  if (!player?.display_name) return '?';
  const parts = player.display_name.split(' ');
  return parts.length >= 2
    ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
    : player.display_name.substring(0, 2).toUpperCase();
}

function userInitials(user: UserDataInterface | null): string {
  if (!user) return '?';
  const first = user.firstname?.charAt(0)?.toUpperCase() ?? '';
  const last = user.lastname?.charAt(0)?.toUpperCase() ?? '';
  return first + last || '?';
}

const POSITION_CLASSES: Record<string, { pill: string; border: string; badge: string }> = {
  GOALKEEPER: {
    pill: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300',
    border: 'border-blue-300 dark:border-blue-600',
    badge: 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
  },
  DEFENDER: {
    pill: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-300 dark:border-emerald-600',
    badge: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
  },
  MIDFIELDER: {
    pill: 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300',
    border: 'border-amber-300 dark:border-amber-600',
    badge: 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
  },
  ATTACKER: {
    pill: 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300',
    border: 'border-rose-300 dark:border-rose-600',
    badge: 'bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400',
  },
};
const DEFAULT_POS = {
  pill: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400',
  border: 'border-gray-200 dark:border-gray-600',
  badge: 'bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400',
};

function positionPillClass(pos?: string) { return (pos && POSITION_CLASSES[pos]?.pill) ?? DEFAULT_POS.pill; }
function positionBorderClass(pos?: string) { return (pos && POSITION_CLASSES[pos]?.border) ?? DEFAULT_POS.border; }
function positionBadgeClass(pos?: string) { return (pos && POSITION_CLASSES[pos]?.badge) ?? DEFAULT_POS.badge; }

async function loadPicks() {
  isLoading.value = true;
  error.value = null;
  try {
    picks.value = await fantasyLeagueService.getDraftPlayerPicked(props.fantasyLeagueUuid);
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load picks';
  } finally {
    isLoading.value = false;
  }
}

onMounted(loadPicks);

defineExpose({ refresh: loadPicks });
</script>

<style scoped>
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>
