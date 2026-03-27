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
      v-else-if="picks.length === 0"
      class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 p-8 text-center"
    >
      <div class="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center mx-auto mb-3">
        <v-icon name="hi-solid-clipboard-list" class="w-6 h-6 text-gray-400 dark:text-gray-500" />
      </div>
      <h3 class="text-[14px] font-semibold text-gray-900 dark:text-white mb-1">No picks yet</h3>
      <p class="text-[12px] text-gray-500 dark:text-gray-400">The draft board will update as players are picked.</p>
    </div>

    <!-- Draft Board Grid -->
    <div v-else class="overflow-x-auto scrollbar-hide rounded-2xl border border-gray-100 dark:border-gray-700/60 bg-white dark:bg-gray-800">
      <table class="w-full border-collapse min-w-max">
        <!-- Header: Participants -->
        <thead>
          <tr>
            <th
              v-for="(participant, idx) in participants"
              :key="participant.uuid ?? idx"
              class="sticky top-0 z-10 px-1.5 py-2 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-600"
              :class="{ 'border-r border-gray-100 dark:border-gray-700/40': idx < participants.length - 1 }"
            >
              <div class="flex flex-col items-center gap-1 min-w-[72px] sm:min-w-[80px]">
                <div class="w-8 h-8 rounded-full overflow-hidden ring-2 ring-white dark:ring-gray-800 bg-gray-200 dark:bg-gray-600">
                  <img
                    v-if="participant.avatar"
                    :src="participant.avatar"
                    :alt="participant.firstname ?? ''"
                    class="w-full h-full object-cover"
                  />
                  <div
                    v-else
                    class="w-full h-full flex items-center justify-center text-[10px] font-bold text-gray-500 dark:text-gray-400"
                  >
                    {{ userInitials(participant) }}
                  </div>
                </div>
                <span class="text-[9px] font-semibold text-gray-700 dark:text-gray-300 truncate max-w-[72px] text-center leading-tight">
                  {{ participant.firstname ?? 'Team' }} {{ (idx + 1) }}
                </span>
              </div>
            </th>
          </tr>
        </thead>

        <!-- Body: Rounds as rows, picks as cells -->
        <tbody>
          <tr
            v-for="round in boardRows"
            :key="round.number"
          >
            <td
              v-for="(cell, colIdx) in round.cells"
              :key="colIdx"
              class="px-1 py-1.5 align-top border-b border-gray-50 dark:border-gray-700/30"
              :class="{ 'border-r border-gray-100 dark:border-gray-700/40': colIdx < round.cells.length - 1 }"
            >
              <!-- Filled pick -->
              <div
                v-if="cell"
                class="flex flex-col items-center gap-0.5 min-w-[72px] sm:min-w-[80px] group"
              >
                <!-- Pick label -->
                <span
                  class="text-[8px] font-bold px-1 py-px rounded-full"
                  :class="positionPillClass(cell.player?.position?.developer_name)"
                  style="font-variant-numeric: tabular-nums"
                >
                  {{ round.number }}.{{ cell.pickInRound }} ({{ cell.pick }})
                </span>

                <!-- Player photo -->
                <div
                  class="w-10 h-10 sm:w-11 sm:h-11 rounded-full overflow-hidden border-2"
                  :class="positionBorderClass(cell.player?.position?.developer_name)"
                >
                  <img
                    v-if="cell.player?.image_path"
                    :src="cell.player.image_path"
                    :alt="cell.player.display_name"
                    class="w-full h-full object-cover"
                  />
                  <div
                    v-else
                    class="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-700 text-[10px] font-bold text-gray-400 dark:text-gray-500"
                  >
                    {{ playerInitials(cell.player) }}
                  </div>
                </div>

                <!-- Player name -->
                <p class="text-[9px] sm:text-[10px] font-semibold text-gray-800 dark:text-gray-200 text-center leading-tight truncate w-full max-w-[72px] sm:max-w-[80px]">
                  {{ shortName(cell.player) }}
                </p>

                <!-- Position badge -->
                <span
                  class="text-[7px] sm:text-[8px] font-bold px-1.5 py-px rounded"
                  :class="positionBadgeClass(cell.player?.position?.developer_name)"
                >
                  {{ cell.player?.position?.code ?? '—' }}
                </span>
              </div>

              <!-- Empty cell -->
              <div v-else class="flex items-center justify-center min-w-[72px] sm:min-w-[80px] h-[72px]">
                <div class="w-8 h-8 rounded-full border-2 border-dashed border-gray-200 dark:border-gray-600" />
              </div>
            </td>
          </tr>
        </tbody>
      </table>
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

// Derive unique participants in draft order from round 1 picks
const participants = computed<UserDataInterface[]>(() => {
  const round1 = picks.value
    .filter((p) => p.round === 1 && p.user !== null)
    .sort((a, b) => a.pick - b.pick);
  return round1.map((p) => p.user!);
});

const totalParticipants = computed(() => participants.value.length);

// Build board rows: each round is a row with cells ordered in snake
const boardRows = computed(() => {
  if (totalParticipants.value === 0) return [];

  const maxRound = Math.max(...picks.value.map((p) => p.round));
  const rows: { number: number; cells: (BoardCell | null)[] }[] = [];

  // Index picks by round+pick for O(1) lookup
  const pickMap = new Map<string, FantasyDraftPlayerPicked>();
  for (const p of picks.value) {
    pickMap.set(`${p.round}-${p.pick}`, p);
  }

  for (let r = 1; r <= maxRound; r++) {
    const isReversed = r % 2 === 0;
    const cells: (BoardCell | null)[] = [];

    for (let col = 0; col < totalParticipants.value; col++) {
      const pickInRound = col + 1;
      const globalPick = (r - 1) * totalParticipants.value + pickInRound;
      const pick = pickMap.get(`${r}-${globalPick}`);

      if (pick) {
        cells.push({
          pick: pick.pick,
          pickInRound,
          round: r,
          player: pick.player,
          user: pick.user,
        });
      } else {
        cells.push(null);
      }
    }

    // Snake: reverse even rounds
    rows.push({
      number: r,
      cells: isReversed ? cells.reverse() : cells,
    });
  }

  return rows;
});

interface BoardCell {
  pick: number;
  pickInRound: number;
  round: number;
  player: FootballPlayerResponse | null;
  user: UserDataInterface | null;
}

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

function addPick(pick: FantasyDraftPlayerPicked) {
  const exists = picks.value.some((p) => p.pick === pick.pick && p.round === pick.round);
  if (!exists) {
    picks.value.push(pick);
  }
}

onMounted(loadPicks);

defineExpose({ refresh: loadPicks, addPick });
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
