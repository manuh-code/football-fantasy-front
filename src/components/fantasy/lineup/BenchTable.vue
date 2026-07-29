<template>
  <div
    class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 overflow-hidden"
  >
    <!-- Section Header -->
    <div class="px-4 py-3 border-b border-gray-100 dark:border-gray-700/60">
      <div class="flex items-center gap-2">
        <v-icon name="hi-solid-users" class="w-4 h-4 text-gray-500 dark:text-gray-400 shrink-0" />
        <h3 class="text-footnote font-semibold text-gray-900 dark:text-white">{{ $t('fantasy.lineup.bench') }}</h3>
      </div>
    </div>

    <!-- Bench List -->
    <div class="divide-y divide-gray-100 dark:divide-gray-700/60">
      <template v-if="formation?.bench && formation.bench > 0">
        <LineupPlayerRow
          v-for="player in benchPlayers"
          v-show="!addingPlayerPosition || isSwappable(player)"
          :key="player.football_player.uuid"
          :player="player"
          variant="bench"
          :adding-player-position="addingPlayerPosition"
          :can-view-score="canViewScore"
          :fantasy-round-uuid="fantasyRoundUuid"
          :reference-score="referenceScore"
          :highlighted="isHighlighted(player.football_player.uuid)"
          :swappable="isSwappable(player)"
          :removing="removingPlayer === player.football_player.uuid"
          :disable-remove="disableRemove"
          @select="$emit('swapPlayer', player.football_player.uuid, 'BENCH')"
          @remove="removePlayer(player.football_player.uuid, player.football_player.display_name)"
          @open-swap="openSwapDrawer(player)"
          @open-score="openScoreDrawer(player)"
        />

        <!-- Empty bench slots -->
        <LineupEmptySlot
          v-for="slot in emptyBenchSlots" :key="`empty-${slot}`"
          variant="bench"
          :active="addingPlayerPosition != null"
          :label="addingPlayerPosition != null ? $t('fantasy.lineup.placeOnBench') : $t('fantasy.lineup.addBench')"
          :show-swap="!addingPlayerPosition && !!fantasyRoundUuid"
          @add="$emit('draftByPosition', 'BENCH')"
          @open-swap="openSwapDrawer(null)"
        />
      </template>
    </div>
  </div>

  <!-- Swap Player Drawer -->
  <SwapPlayerDrawer
    v-if="fantasyRoundUuid"
    v-model="swapDrawerOpen"
    :players="players"
    :target-player="swapTargetPlayer"
    :slot-position="swapSlotPosition"
    :slot-is-starter="false"
    :slot-is-flex="false"
    :league-uuid="leagueUuid"
    :fantasy-round-uuid="fantasyRoundUuid"
    @lineup-updated="emit('lineupUpdated')"
  />

  <!-- Player Score Detail Drawer -->
  <PlayerFantasyScoreDrawer
    v-model="scoreDrawerOpen"
    :league-uuid="leagueUuid"
    :round-uuid="fantasyRoundUuid ?? ''"
    :player="scorePlayer"
  />
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { FantasyFootballPlayer } from "@/interfaces/user/fantasy/FantasyFootballPlayersResponse";
import { FantasyLeagueFormationResponse } from "@/interfaces/fantasy/leagues/FantasyLeagueFormationResponse";
import LineupPlayerRow from "@/components/fantasy/lineup/LineupPlayerRow.vue";
import LineupEmptySlot from "@/components/fantasy/lineup/LineupEmptySlot.vue";
import SwapPlayerDrawer from "@/components/fantasy/lineup/SwapPlayerDrawer.vue";
import PlayerFantasyScoreDrawer from "@/components/fantasy/lineup/PlayerFantasyScoreDrawer.vue";
import { fantasyLeagueService } from "@/services/fantasy/leagues/FantasyLeagueService";
import { useToast } from "@/composables/useToast";

const { addToast } = useToast();
const { t } = useI18n();

interface Props {
  /** All players (the component filters bench internally) */
  players: FantasyFootballPlayer[];
  /** League formation configuration */
  formation: FantasyLeagueFormationResponse | null;
  /** Fantasy league UUID for player removal */
  leagueUuid: string;
  /** UUID of the player to highlight */
  highlightedPlayerUuid?: string | null;
  /** developer_name of the position being added — shows swap icon on matching empty slots */
  addingPlayerPosition?: string | null;
  /** Fantasy round UUID required for lineup update */
  fantasyRoundUuid?: string;
  /** Disables the swipe-to-delete action (e.g. while in draft mode) */
  disableRemove?: boolean;
  /** Round top score across the team — drives each row's relative points color. */
  referenceScore?: number;
}

const props = withDefaults(defineProps<Props>(), {
  highlightedPlayerUuid: null,
  addingPlayerPosition: null,
  fantasyRoundUuid: '',
  disableRemove: false,
  referenceScore: 0,
});

const emit = defineEmits<{
  draftByPosition: [position: string];
  playerRemoved: [playerUuid: string];
  swapPlayer: [playerUuid: string, position: string];
  lineupUpdated: [];
}>();

// ==================== Swap drawer ====================
const swapDrawerOpen = ref(false);
const swapTargetPlayer = ref<FantasyFootballPlayer | null>(null);
const swapSlotPosition = ref('BENCH');

// ==================== Player score drawer ====================
const scoreDrawerOpen = ref(false);
const scorePlayer = ref<FantasyFootballPlayer | null>(null);

// Score detail only needs a round context and stays out of swap/draft mode.
// Locked (in_play) players are intentionally included — viewing their stats is
// the one action they keep, even though editing (swap/remove) stays disabled.
const canViewScore = computed(
  () => !!props.fantasyRoundUuid && !props.addingPlayerPosition,
);

function openScoreDrawer(player: FantasyFootballPlayer) {
  if (!canViewScore.value) return;
  scorePlayer.value = player;
  scoreDrawerOpen.value = true;
}

function openSwapDrawer(targetPlayer: FantasyFootballPlayer | null = null) {
  swapTargetPlayer.value = targetPlayer;
  // Use the bench player's actual position so the drawer filters correctly
  swapSlotPosition.value = targetPlayer?.position?.developer_name ?? 'BENCH';
  swapDrawerOpen.value = true;
}

const removingPlayer = ref<string | null>(null);

async function removePlayer(playerUuid: string, playerName: string) {
  if (removingPlayer.value) return;
  removingPlayer.value = playerUuid;
  try {
    await fantasyLeagueService.lineupPlayerRemove({
      fantasy_league_uuid: props.leagueUuid,
      player_uuid: playerUuid,
    });
    addToast({
      type: 'success',
      title: t('fantasy.lineup.playerRemovedTitle'),
      message: t('fantasy.lineup.playerRemovedMsg', { name: playerName }),
    });
    emit('playerRemoved', playerUuid);
  } catch {
    addToast({
      type: 'error',
      title: t('fantasy.lineup.removeErrorTitle'),
      message: t('fantasy.lineup.removeErrorMsg', { name: playerName }),
    });
  } finally {
    removingPlayer.value = null;
  }
}

// Bench: is_starter === false and not flex (filter out entries with null football_player)
const benchPlayers = computed(() =>
  props.players.filter((p) => !p.is_starter && !p.is_flex && p.football_player),
);

const emptyBenchSlots = computed(() => {
  const maxBenchSize = props.formation?.bench ?? 6;
  const currentBenchSize = benchPlayers.value.length;
  return Math.max(0, maxBenchSize - currentBenchSize);
});

function isSwappable(player: FantasyFootballPlayer): boolean {
  if (!props.addingPlayerPosition) return false;
  return player.position.developer_name === props.addingPlayerPosition || player.is_flex;
}

function isHighlighted(playerUuid: string): boolean {
  return props.highlightedPlayerUuid === playerUuid;
}
</script>
