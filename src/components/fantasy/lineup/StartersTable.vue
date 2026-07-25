<template>
  <div
    class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 overflow-hidden"
  >
    <!-- Section Header -->
    <div class="px-4 py-3 border-b border-gray-100 dark:border-gray-700/60">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <v-icon name="hi-solid-star" class="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0" />
          <h3 class="text-footnote font-semibold text-gray-900 dark:text-white">{{ $t('fantasy.lineup.starters') }}</h3>
        </div>
        <slot name="header-action" />
      </div>
    </div>

    <!-- Starters List -->
    <div class="divide-y divide-gray-100 dark:divide-gray-700/60">
      <!-- Goalkeeper -->
      <template v-if="formation?.goalkeeper && formation.goalkeeper.starter > 0 && (!addingPlayerPosition || addingPlayerPosition === 'GOALKEEPER')">
        <LineupPlayerRow
          v-for="player in goalkeepers"
          :key="player.football_player.uuid"
          :player="player"
          variant="goalkeeper"
          :adding-player-position="addingPlayerPosition"
          :can-view-score="canViewScore"
          :fantasy-round-uuid="fantasyRoundUuid"
          :highlighted="isHighlighted(player.football_player.uuid)"
          :swappable="isSwappable(player)"
          :removing="removingPlayer === player.football_player.uuid"
          :disable-remove="disableRemove"
          @select="$emit('swapPlayer', player.football_player.uuid, 'GOALKEEPER')"
          @remove="removePlayer(player.football_player.uuid, player.football_player.display_name)"
          @open-swap="openSwapDrawer('GOALKEEPER', true, false, player)"
          @open-score="openScoreDrawer(player)"
        />
        <LineupEmptySlot
          v-for="slot in emptyGoalkeeperSlots" :key="`empty-gk-${slot}`"
          variant="goalkeeper"
          :active="addingPlayerPosition === 'GOALKEEPER'"
          :label="addingPlayerPosition === 'GOALKEEPER' ? $t('fantasy.lineup.placeHere') : $t('fantasy.lineup.addGoalkeeper')"
          :show-swap="!addingPlayerPosition && !!fantasyRoundUuid"
          @add="$emit('draftByPosition', 'GOALKEEPER')"
          @open-swap="openSwapDrawer('GOALKEEPER', true, false, null)"
        />
      </template>

      <!-- Defenders -->
      <template v-if="formation?.defender && formation.defender.starter > 0 && (!addingPlayerPosition || addingPlayerPosition === 'DEFENDER')">
        <LineupPlayerRow
          v-for="player in defenders"
          :key="player.football_player.uuid"
          :player="player"
          variant="defender"
          :adding-player-position="addingPlayerPosition"
          :can-view-score="canViewScore"
          :fantasy-round-uuid="fantasyRoundUuid"
          :highlighted="isHighlighted(player.football_player.uuid)"
          :swappable="isSwappable(player)"
          :removing="removingPlayer === player.football_player.uuid"
          :disable-remove="disableRemove"
          @select="$emit('swapPlayer', player.football_player.uuid, 'DEFENDER')"
          @remove="removePlayer(player.football_player.uuid, player.football_player.display_name)"
          @open-swap="openSwapDrawer('DEFENDER', true, false, player)"
          @open-score="openScoreDrawer(player)"
        />
        <LineupEmptySlot
          v-for="slot in emptyDefenderSlots" :key="`empty-def-${slot}`"
          variant="defender"
          :active="addingPlayerPosition === 'DEFENDER'"
          :label="addingPlayerPosition === 'DEFENDER' ? $t('fantasy.lineup.placeHere') : $t('fantasy.lineup.addDefender')"
          :show-swap="!addingPlayerPosition && !!fantasyRoundUuid"
          @add="$emit('draftByPosition', 'DEFENDER')"
          @open-swap="openSwapDrawer('DEFENDER', true, false, null)"
        />
      </template>

      <!-- Midfielders -->
      <template v-if="formation?.midfielder && formation.midfielder.starter > 0 && (!addingPlayerPosition || addingPlayerPosition === 'MIDFIELDER')">
        <LineupPlayerRow
          v-for="player in midfielders"
          :key="player.football_player.uuid"
          :player="player"
          variant="midfielder"
          :adding-player-position="addingPlayerPosition"
          :can-view-score="canViewScore"
          :fantasy-round-uuid="fantasyRoundUuid"
          :highlighted="isHighlighted(player.football_player.uuid)"
          :swappable="isSwappable(player)"
          :removing="removingPlayer === player.football_player.uuid"
          :disable-remove="disableRemove"
          @select="$emit('swapPlayer', player.football_player.uuid, 'MIDFIELDER')"
          @remove="removePlayer(player.football_player.uuid, player.football_player.display_name)"
          @open-swap="openSwapDrawer('MIDFIELDER', true, false, player)"
          @open-score="openScoreDrawer(player)"
        />
        <LineupEmptySlot
          v-for="slot in emptyMidfielderSlots" :key="`empty-mid-${slot}`"
          variant="midfielder"
          :active="addingPlayerPosition === 'MIDFIELDER'"
          :label="addingPlayerPosition === 'MIDFIELDER' ? $t('fantasy.lineup.placeHere') : $t('fantasy.lineup.addMidfielder')"
          :show-swap="!addingPlayerPosition && !!fantasyRoundUuid"
          @add="$emit('draftByPosition', 'MIDFIELDER')"
          @open-swap="openSwapDrawer('MIDFIELDER', true, false, null)"
        />
      </template>

      <!-- Attackers -->
      <template v-if="formation?.attacker && formation.attacker.starter > 0 && (!addingPlayerPosition || addingPlayerPosition === 'ATTACKER')">
        <LineupPlayerRow
          v-for="player in attackers"
          :key="player.football_player.uuid"
          :player="player"
          variant="attacker"
          :adding-player-position="addingPlayerPosition"
          :can-view-score="canViewScore"
          :fantasy-round-uuid="fantasyRoundUuid"
          :highlighted="isHighlighted(player.football_player.uuid)"
          :swappable="isSwappable(player)"
          :removing="removingPlayer === player.football_player.uuid"
          :disable-remove="disableRemove"
          @select="$emit('swapPlayer', player.football_player.uuid, 'ATTACKER')"
          @remove="removePlayer(player.football_player.uuid, player.football_player.display_name)"
          @open-swap="openSwapDrawer('ATTACKER', true, false, player)"
          @open-score="openScoreDrawer(player)"
        />
        <LineupEmptySlot
          v-for="slot in emptyAttackerSlots" :key="`empty-att-${slot}`"
          variant="attacker"
          :active="addingPlayerPosition === 'ATTACKER'"
          :label="addingPlayerPosition === 'ATTACKER' ? $t('fantasy.lineup.placeHere') : $t('fantasy.lineup.addForward')"
          :show-swap="!addingPlayerPosition && !!fantasyRoundUuid"
          @add="$emit('draftByPosition', 'ATTACKER')"
          @open-swap="openSwapDrawer('ATTACKER', true, false, null)"
        />
      </template>

      <!-- Flex -->
      <template v-if="formation?.flex && formation.flex > 0">
        <LineupPlayerRow
          v-for="player in flexPlayers"
          :key="player.football_player.uuid"
          :player="player"
          variant="flex"
          :adding-player-position="addingPlayerPosition"
          :can-view-score="canViewScore"
          :fantasy-round-uuid="fantasyRoundUuid"
          :highlighted="isHighlighted(player.football_player.uuid)"
          :swappable="isSwappable(player)"
          :removing="removingPlayer === player.football_player.uuid"
          :disable-remove="disableRemove"
          @select="$emit('swapPlayer', player.football_player.uuid, 'FLEX')"
          @remove="removePlayer(player.football_player.uuid, player.football_player.display_name)"
          @open-swap="openSwapDrawer('FLEX', true, true, player)"
          @open-score="openScoreDrawer(player)"
        />
        <LineupEmptySlot
          v-for="slot in emptyFlexSlots" :key="`empty-flex-${slot}`"
          variant="flex"
          :active="addingPlayerPosition != null"
          :label="addingPlayerPosition != null ? $t('fantasy.lineup.placeHereFlex') : $t('fantasy.lineup.addFlex')"
          :show-swap="!addingPlayerPosition && !!fantasyRoundUuid"
          @add="$emit('draftByPosition', 'FLEX')"
          @open-swap="openSwapDrawer('FLEX', true, true, null)"
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
    :slot-is-starter="swapSlotIsStarter"
    :slot-is-flex="swapSlotIsFlex"
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
  /** All players (the component filters starters internally) */
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
}

const props = withDefaults(defineProps<Props>(), {
  highlightedPlayerUuid: null,
  addingPlayerPosition: null,
  fantasyRoundUuid: '',
  disableRemove: false,
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
const swapSlotPosition = ref('');
const swapSlotIsStarter = ref(true);
const swapSlotIsFlex = ref(false);

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

function openSwapDrawer(
  position: string,
  isStarter: boolean,
  isFlex: boolean,
  targetPlayer: FantasyFootballPlayer | null = null,
) {
  swapSlotPosition.value = position;
  swapSlotIsStarter.value = isStarter;
  swapSlotIsFlex.value = isFlex;
  swapTargetPlayer.value = targetPlayer;
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

// Filtered player groups
const goalkeepers = computed(() =>
  props.players.filter(
    (p) => p.is_starter && !p.is_flex && p.position.developer_name === "GOALKEEPER",
  ),
);

const defenders = computed(() =>
  props.players.filter(
    (p) => p.is_starter && !p.is_flex && p.position.developer_name === "DEFENDER",
  ),
);

const midfielders = computed(() =>
  props.players.filter(
    (p) => p.is_starter && !p.is_flex && p.position.developer_name === "MIDFIELDER",
  ),
);

const attackers = computed(() =>
  props.players.filter(
    (p) => p.is_starter && !p.is_flex && p.position.developer_name === "ATTACKER",
  ),
);

const flexPlayers = computed(() => props.players.filter((p) => p.is_flex));

// Empty slot computations
const emptyGoalkeeperSlots = computed(() => {
  const required = props.formation?.goalkeeper?.starter ?? 1;
  return Math.max(0, required - goalkeepers.value.length);
});

const emptyDefenderSlots = computed(() => {
  const required = props.formation?.defender?.starter ?? 3;
  return Math.max(0, required - defenders.value.length);
});

const emptyMidfielderSlots = computed(() => {
  const required = props.formation?.midfielder?.starter ?? 4;
  return Math.max(0, required - midfielders.value.length);
});

const emptyAttackerSlots = computed(() => {
  const required = props.formation?.attacker?.starter ?? 2;
  return Math.max(0, required - attackers.value.length);
});

const emptyFlexSlots = computed(() => {
  const required = props.formation?.flex ?? 1;
  return Math.max(0, required - flexPlayers.value.length);
});

function isSwappable(player: FantasyFootballPlayer): boolean {
  if (!props.addingPlayerPosition) return false;
  return player.position.developer_name === props.addingPlayerPosition || player.is_flex;
}

function isHighlighted(playerUuid: string): boolean {
  return props.highlightedPlayerUuid === playerUuid;
}
</script>
