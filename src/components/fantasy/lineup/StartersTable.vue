<template>
  <div
    class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
  >
    <!-- Section Header -->
    <div
      class="bg-gradient-to-r from-emerald-600 to-green-600 px-4 md:px-6 py-3"
    >
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-bold text-white flex items-center gap-2">
          <v-icon name="hi-solid-star" class="w-5 h-5" />
          Starters
        </h3>
        <slot name="header-action" />
      </div>
    </div>

    <!-- Starters Table -->
    <div class="overflow-x-auto">
      <table class="w-full">
        <thead
          class="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-600"
        >
          <tr>
            <th
              class="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider"
            >
              Position
            </th>
            <th
              class="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider"
            >
              Player
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
          <!-- Goalkeeper -->
          <template
            v-if="
              formation?.goalkeeper &&
              formation.goalkeeper.starter > 0
            "
          >
            <tr
              v-for="player in goalkeepers"
              :key="player.football_player.uuid"
              :data-player-uuid="player.football_player.uuid"
              :class="[{ 'player-highlight': isHighlighted(player.football_player.uuid) }]"
            >
              <td colspan="2" class="p-0">
                <div class="relative overflow-hidden">
                  <div
                    class="absolute inset-y-0 right-0 w-[76px] bg-red-500 flex items-center justify-center"
                  >
                    <div class="flex flex-col items-center gap-0.5">
                      <v-icon name="hi-solid-trash" class="w-5 h-5 text-white" />
                      <span class="text-[10px] text-white font-medium">Remove</span>
                    </div>
                  </div>
                  <div
                    class="relative flex items-center bg-white dark:bg-gray-800 swipe-row"
                    :style="{
                      transform: `translateX(${getSwipeOffset(player.football_player.uuid)}px)`,
                      transition: getSwipeTransition(player.football_player.uuid),
                    }"
                    @touchstart="onSwipeStart(player.football_player.uuid, $event)"
                    @touchmove="onSwipeMove(player.football_player.uuid, $event)"
                    @touchend="onSwipeEnd(player.football_player.uuid)"
                    @mousedown="onSwipeStart(player.football_player.uuid, $event)"
                  >
                    <div class="px-4 py-4 shrink-0">
                      <div class="flex items-center gap-2">
                        <span
                          class="inline-flex items-center justify-center min-w-[2rem] h-8 px-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-[10px] font-bold uppercase whitespace-nowrap"
                        >
                          {{ getPositionShortCode(player.position.developer_name, player.position.code) }}
                        </span>
                      </div>
                    </div>
                    <div class="px-4 py-4 flex-1 min-w-0">
                      <div class="flex items-center gap-3">
                        <img
                          :src="player.football_player.image_path || '/img/default-avatar.svg'"
                          :alt="player.football_player.display_name"
                          class="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
                        />
                        <div class="flex-1 min-w-0">
                          <p class="font-semibold text-gray-900 dark:text-white text-sm md:text-base truncate">
                            {{ player.football_player.display_name }}
                          </p>
                        </div>
                        <span
                          class="shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-md bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 text-xs font-bold"
                        >
                          {{ player.fantasy_points ?? 0 }} pts
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </td>
            </tr>

            <!-- Empty Goalkeeper slots -->
            <tr
              v-for="slot in emptyGoalkeeperSlots"
              :key="`empty-gk-${slot}`"
              @click="$emit('draftByPosition', 'GOALKEEPER')"
              class="bg-gray-50/50 dark:bg-gray-700/20 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors duration-150"
            >
              <td class="px-4 py-4">
                <div class="flex items-center gap-2">
                  <span class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-400 dark:text-blue-500 text-xs font-bold opacity-50">GK</span>
                  <span class="text-xs font-medium text-gray-400 dark:text-gray-500 hidden sm:inline">Goalkeeper</span>
                </div>
              </td>
              <td class="px-4 py-4">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gray-200 dark:bg-gray-700 border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center">
                    <v-icon name="hi-solid-plus" class="w-5 h-5 text-gray-400 dark:text-gray-500" />
                  </div>
                  <p class="text-sm text-gray-400 dark:text-gray-500 italic">Click to add player</p>
                </div>
              </td>
            </tr>
          </template>

          <!-- Defenders -->
          <template
            v-if="
              formation?.defender &&
              formation.defender.starter > 0
            "
          >
            <tr
              v-for="player in defenders"
              :key="player.football_player.uuid"
              :data-player-uuid="player.football_player.uuid"
              :class="[{ 'player-highlight': isHighlighted(player.football_player.uuid) }]"
            >
              <td colspan="2" class="p-0">
                <div class="relative overflow-hidden">
                  <div class="absolute inset-y-0 right-0 w-[76px] bg-red-500 flex items-center justify-center">
                    <div class="flex flex-col items-center gap-0.5">
                      <v-icon name="hi-solid-trash" class="w-5 h-5 text-white" />
                      <span class="text-[10px] text-white font-medium">Remove</span>
                    </div>
                  </div>
                  <div
                    class="relative flex items-center bg-white dark:bg-gray-800 swipe-row"
                    :style="{
                      transform: `translateX(${getSwipeOffset(player.football_player.uuid)}px)`,
                      transition: getSwipeTransition(player.football_player.uuid),
                    }"
                    @touchstart="onSwipeStart(player.football_player.uuid, $event)"
                    @touchmove="onSwipeMove(player.football_player.uuid, $event)"
                    @touchend="onSwipeEnd(player.football_player.uuid)"
                    @mousedown="onSwipeStart(player.football_player.uuid, $event)"
                  >
                    <div class="px-4 py-4 shrink-0">
                      <div class="flex items-center gap-2">
                        <span class="inline-flex items-center justify-center min-w-[2rem] h-8 px-2 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[10px] font-bold uppercase whitespace-nowrap">
                          {{ getPositionShortCode(player.position.developer_name, player.position.code) }}
                        </span>
                      </div>
                    </div>
                    <div class="px-4 py-4 flex-1 min-w-0">
                      <div class="flex items-center gap-3">
                        <img
                          :src="player.football_player.image_path || '/img/default-avatar.svg'"
                          :alt="player.football_player.display_name"
                          class="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
                        />
                        <div class="flex-1 min-w-0">
                          <p class="font-semibold text-gray-900 dark:text-white text-sm md:text-base truncate">
                            {{ player.football_player.display_name }}
                          </p>
                        </div>
                        <span class="shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-md bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 text-xs font-bold">
                          {{ player.fantasy_points ?? 0 }} pts
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </td>
            </tr>

            <!-- Empty Defender slots -->
            <tr
              v-for="slot in emptyDefenderSlots"
              :key="`empty-def-${slot}`"
              @click="$emit('draftByPosition', 'DEFENDER')"
              class="bg-gray-50/50 dark:bg-gray-700/20 cursor-pointer hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors duration-150"
            >
              <td class="px-4 py-4">
                <div class="flex items-center gap-2">
                  <span class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 text-green-400 dark:text-green-500 text-xs font-bold opacity-50">DF</span>
                  <span class="text-xs font-medium text-gray-400 dark:text-gray-500 hidden sm:inline">Defender</span>
                </div>
              </td>
              <td class="px-4 py-4">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gray-200 dark:bg-gray-700 border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center">
                    <v-icon name="hi-solid-plus" class="w-5 h-5 text-gray-400 dark:text-gray-500" />
                  </div>
                  <p class="text-sm text-gray-400 dark:text-gray-500 italic">Click to add player</p>
                </div>
              </td>
            </tr>
          </template>

          <!-- Midfielders -->
          <template
            v-if="
              formation?.midfielder &&
              formation.midfielder.starter > 0
            "
          >
            <tr
              v-for="player in midfielders"
              :key="player.football_player.uuid"
              :data-player-uuid="player.football_player.uuid"
              :class="[{ 'player-highlight': isHighlighted(player.football_player.uuid) }]"
            >
              <td colspan="2" class="p-0">
                <div class="relative overflow-hidden">
                  <div class="absolute inset-y-0 right-0 w-[76px] bg-red-500 flex items-center justify-center">
                    <div class="flex flex-col items-center gap-0.5">
                      <v-icon name="hi-solid-trash" class="w-5 h-5 text-white" />
                      <span class="text-[10px] text-white font-medium">Remove</span>
                    </div>
                  </div>
                  <div
                    class="relative flex items-center bg-white dark:bg-gray-800 swipe-row"
                    :style="{
                      transform: `translateX(${getSwipeOffset(player.football_player.uuid)}px)`,
                      transition: getSwipeTransition(player.football_player.uuid),
                    }"
                    @touchstart="onSwipeStart(player.football_player.uuid, $event)"
                    @touchmove="onSwipeMove(player.football_player.uuid, $event)"
                    @touchend="onSwipeEnd(player.football_player.uuid)"
                    @mousedown="onSwipeStart(player.football_player.uuid, $event)"
                  >
                    <div class="px-4 py-4 shrink-0">
                      <div class="flex items-center gap-2">
                        <span class="inline-flex items-center justify-center min-w-[2rem] h-8 px-2 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-[10px] font-bold uppercase whitespace-nowrap">
                          {{ getPositionShortCode(player.position.developer_name, player.position.code) }}
                        </span>
                      </div>
                    </div>
                    <div class="px-4 py-4 flex-1 min-w-0">
                      <div class="flex items-center gap-3">
                        <img
                          :src="player.football_player.image_path || '/img/default-avatar.svg'"
                          :alt="player.football_player.display_name"
                          class="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
                        />
                        <div class="flex-1 min-w-0">
                          <p class="font-semibold text-gray-900 dark:text-white text-sm md:text-base truncate">
                            {{ player.football_player.display_name }}
                          </p>
                        </div>
                        <span class="shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-md bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 text-xs font-bold">
                          {{ player.fantasy_points ?? 0 }} pts
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </td>
            </tr>

            <!-- Empty Midfielder slots -->
            <tr
              v-for="slot in emptyMidfielderSlots"
              :key="`empty-mid-${slot}`"
              @click="$emit('draftByPosition', 'MIDFIELDER')"
              class="bg-gray-50/50 dark:bg-gray-700/20 cursor-pointer hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition-colors duration-150"
            >
              <td class="px-4 py-4">
                <div class="flex items-center gap-2">
                  <span class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-400 dark:text-yellow-500 text-xs font-bold opacity-50">MF</span>
                  <span class="text-xs font-medium text-gray-400 dark:text-gray-500 hidden sm:inline">Midfielder</span>
                </div>
              </td>
              <td class="px-4 py-4">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gray-200 dark:bg-gray-700 border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center">
                    <v-icon name="hi-solid-plus" class="w-5 h-5 text-gray-400 dark:text-gray-500" />
                  </div>
                  <p class="text-sm text-gray-400 dark:text-gray-500 italic">Click to add player</p>
                </div>
              </td>
            </tr>
          </template>

          <!-- Attackers -->
          <template
            v-if="
              formation?.attacker &&
              formation.attacker.starter > 0
            "
          >
            <tr
              v-for="player in attackers"
              :key="player.football_player.uuid"
              :data-player-uuid="player.football_player.uuid"
              :class="[{ 'player-highlight': isHighlighted(player.football_player.uuid) }]"
            >
              <td colspan="2" class="p-0">
                <div class="relative overflow-hidden">
                  <div class="absolute inset-y-0 right-0 w-[76px] bg-red-500 flex items-center justify-center">
                    <div class="flex flex-col items-center gap-0.5">
                      <v-icon name="hi-solid-trash" class="w-5 h-5 text-white" />
                      <span class="text-[10px] text-white font-medium">Remove</span>
                    </div>
                  </div>
                  <div
                    class="relative flex items-center bg-white dark:bg-gray-800 swipe-row"
                    :style="{
                      transform: `translateX(${getSwipeOffset(player.football_player.uuid)}px)`,
                      transition: getSwipeTransition(player.football_player.uuid),
                    }"
                    @touchstart="onSwipeStart(player.football_player.uuid, $event)"
                    @touchmove="onSwipeMove(player.football_player.uuid, $event)"
                    @touchend="onSwipeEnd(player.football_player.uuid)"
                    @mousedown="onSwipeStart(player.football_player.uuid, $event)"
                  >
                    <div class="px-4 py-4 shrink-0">
                      <div class="flex items-center gap-2">
                        <span class="inline-flex items-center justify-center min-w-[2rem] h-8 px-2 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-[10px] font-bold uppercase whitespace-nowrap">
                          {{ getPositionShortCode(player.position.developer_name, player.position.code) }}
                        </span>
                      </div>
                    </div>
                    <div class="px-4 py-4 flex-1 min-w-0">
                      <div class="flex items-center gap-3">
                        <img
                          :src="player.football_player.image_path || '/img/default-avatar.svg'"
                          :alt="player.football_player.display_name"
                          class="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
                        />
                        <div class="flex-1 min-w-0">
                          <p class="font-semibold text-gray-900 dark:text-white text-sm md:text-base truncate">
                            {{ player.football_player.display_name }}
                          </p>
                        </div>
                        <span class="shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-md bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 text-xs font-bold">
                          {{ player.fantasy_points ?? 0 }} pts
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </td>
            </tr>

            <!-- Empty Attacker slots -->
            <tr
              v-for="slot in emptyAttackerSlots"
              :key="`empty-att-${slot}`"
              @click="$emit('draftByPosition', 'ATTACKER')"
              class="bg-gray-50/50 dark:bg-gray-700/20 cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-150"
            >
              <td class="px-4 py-4">
                <div class="flex items-center gap-2">
                  <span class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 text-red-400 dark:text-red-500 text-xs font-bold opacity-50">FW</span>
                  <span class="text-xs font-medium text-gray-400 dark:text-gray-500 hidden sm:inline">Forward</span>
                </div>
              </td>
              <td class="px-4 py-4">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gray-200 dark:bg-gray-700 border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center">
                    <v-icon name="hi-solid-plus" class="w-5 h-5 text-gray-400 dark:text-gray-500" />
                  </div>
                  <p class="text-sm text-gray-400 dark:text-gray-500 italic">Click to add player</p>
                </div>
              </td>
            </tr>
          </template>

          <!-- Flex -->
          <template
            v-if="formation?.flex && formation.flex > 0"
          >
            <tr
              v-for="player in flexPlayers"
              :key="player.football_player.uuid"
              :data-player-uuid="player.football_player.uuid"
              :class="[{ 'player-highlight': isHighlighted(player.football_player.uuid) }]"
            >
              <td colspan="2" class="p-0">
                <div class="relative overflow-hidden">
                  <div class="absolute inset-y-0 right-0 w-[76px] bg-red-500 flex items-center justify-center">
                    <div class="flex flex-col items-center gap-0.5">
                      <v-icon name="hi-solid-trash" class="w-5 h-5 text-white" />
                      <span class="text-[10px] text-white font-medium">Remove</span>
                    </div>
                  </div>
                  <div
                    class="relative flex items-center bg-white dark:bg-gray-800 swipe-row"
                    :style="{
                      transform: `translateX(${getSwipeOffset(player.football_player.uuid)}px)`,
                      transition: getSwipeTransition(player.football_player.uuid),
                    }"
                    @touchstart="onSwipeStart(player.football_player.uuid, $event)"
                    @touchmove="onSwipeMove(player.football_player.uuid, $event)"
                    @touchend="onSwipeEnd(player.football_player.uuid)"
                    @mousedown="onSwipeStart(player.football_player.uuid, $event)"
                  >
                    <div class="px-4 py-4 shrink-0">
                      <div class="flex items-center gap-2">
                        <span class="inline-flex items-center justify-center min-w-[2rem] h-8 px-2 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-[10px] font-bold uppercase whitespace-nowrap">
                          {{ getPositionShortCode(player.position.developer_name, player.position.code) }}
                        </span>
                      </div>
                    </div>
                    <div class="px-4 py-4 flex-1 min-w-0">
                      <div class="flex items-center gap-3">
                        <img
                          :src="player.football_player.image_path || '/img/default-avatar.svg'"
                          :alt="player.football_player.display_name"
                          class="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
                        />
                        <div class="flex-1 min-w-0">
                          <p class="font-semibold text-gray-900 dark:text-white text-sm md:text-base truncate">
                            {{ player.football_player.display_name }}
                          </p>
                        </div>
                        <span class="shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-md bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 text-xs font-bold">
                          {{ player.fantasy_points ?? 0 }} pts
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </td>
            </tr>

            <!-- Empty Flex slots -->
            <tr
              v-for="slot in emptyFlexSlots"
              :key="`empty-flex-${slot}`"
              @click="$emit('draftByPosition', 'FLEX')"
              class="bg-gray-50/50 dark:bg-gray-700/20 cursor-pointer hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors duration-150"
            >
              <td class="px-4 py-4">
                <div class="flex items-center gap-2">
                  <span class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-400 dark:text-purple-500 text-xs font-bold opacity-50">FX</span>
                  <span class="text-xs font-medium text-gray-400 dark:text-gray-500 hidden sm:inline">Flex</span>
                </div>
              </td>
              <td class="px-4 py-4">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gray-200 dark:bg-gray-700 border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center">
                    <v-icon name="hi-solid-plus" class="w-5 h-5 text-gray-400 dark:text-gray-500" />
                  </div>
                  <p class="text-sm text-gray-400 dark:text-gray-500 italic">Click to add player</p>
                </div>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { FantasyFootballPlayersResponse } from "@/interfaces/user/fantasy/FantasyFootballPlayersResponse";
import { FantasyLeagueFormationResponse } from "@/interfaces/fantasy/leagues/FantasyLeagueFormationResponse";

interface Props {
  /** All players (the component filters starters internally) */
  players: FantasyFootballPlayersResponse[];
  /** League formation configuration */
  formation: FantasyLeagueFormationResponse | null;
  /** UUID of the player to highlight */
  highlightedPlayerUuid?: string | null;
}

const props = withDefaults(defineProps<Props>(), {
  highlightedPlayerUuid: null,
});

defineEmits<{
  draftByPosition: [position: string];
}>();

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

// Utility
function getPositionShortCode(developerName: string, code: string): string {
  const shortCodes: Record<string, string> = {
    GOALKEEPER: "GK",
    DEFENDER: "DEF",
    MIDFIELDER: "MID",
    ATTACKER: "FW",
    FLEX: "FX",
  };
  return shortCodes[developerName] || code?.substring(0, 3) || "?";
}

function isHighlighted(playerUuid: string): boolean {
  return props.highlightedPlayerUuid === playerUuid;
}

// Swipe-to-delete
const swipeStates = ref<
  Record<string, { startX: number; startY: number; offsetX: number; swiping: boolean; open: boolean }>
>({});
const SWIPE_THRESHOLD = -60;
const SWIPE_ACTION_WIDTH = 76;

function getSwipeOffset(uuid: string): number {
  const state = swipeStates.value[uuid];
  if (!state) return 0;
  if (state.swiping) return Math.min(0, Math.max(-SWIPE_ACTION_WIDTH, state.offsetX));
  return state.open ? -SWIPE_ACTION_WIDTH : 0;
}

function getSwipeTransition(uuid: string): string {
  const state = swipeStates.value[uuid];
  if (state?.swiping) return "none";
  return "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)";
}

function onSwipeStart(uuid: string, e: TouchEvent | MouseEvent) {
  for (const id in swipeStates.value) {
    if (id !== uuid && swipeStates.value[id]?.open) {
      swipeStates.value[id].open = false;
      swipeStates.value[id].offsetX = 0;
    }
  }
  const point = "touches" in e ? e.touches[0] : e;
  const wasOpen = swipeStates.value[uuid]?.open || false;
  swipeStates.value[uuid] = {
    startX: point.clientX + (wasOpen ? SWIPE_ACTION_WIDTH : 0),
    startY: point.clientY,
    offsetX: wasOpen ? -SWIPE_ACTION_WIDTH : 0,
    swiping: false,
    open: wasOpen,
  };
  if (!("touches" in e)) {
    const onMouseMove = (ev: MouseEvent) => onSwipeMove(uuid, ev);
    const onMouseUp = () => {
      onSwipeEnd(uuid);
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  }
}

function onSwipeMove(uuid: string, e: TouchEvent | MouseEvent) {
  const state = swipeStates.value[uuid];
  if (!state) return;
  const point = "touches" in e ? e.touches[0] : e;
  const deltaX = point.clientX - state.startX;
  const deltaY = Math.abs(point.clientY - state.startY);
  if (!state.swiping) {
    if (Math.abs(deltaX) > 8 && Math.abs(deltaX) > deltaY) {
      state.swiping = true;
    } else {
      return;
    }
  }
  if (!("touches" in e)) e.preventDefault();
  state.offsetX = Math.min(0, Math.max(-SWIPE_ACTION_WIDTH, deltaX));
}

function onSwipeEnd(uuid: string) {
  const state = swipeStates.value[uuid];
  if (!state) return;
  if (!state.swiping) {
    if (state.open) {
      state.open = false;
      state.offsetX = 0;
    }
    return;
  }
  state.swiping = false;
  if (state.offsetX < SWIPE_THRESHOLD) {
    state.open = true;
    state.offsetX = -SWIPE_ACTION_WIDTH;
  } else {
    state.open = false;
    state.offsetX = 0;
  }
}
</script>

<style scoped>
.swipe-row {
  touch-action: pan-y;
  will-change: transform;
  user-select: none;
  -webkit-user-select: none;
  cursor: grab;
}
.swipe-row:active {
  cursor: grabbing;
}

@keyframes player-highlight {
  0% { background-color: rgba(59, 130, 246, 0.25); box-shadow: inset 0 0 0 2px rgba(59, 130, 246, 0.5); }
  50% { background-color: rgba(59, 130, 246, 0.1); box-shadow: inset 0 0 0 2px rgba(59, 130, 246, 0.25); }
  100% { background-color: transparent; box-shadow: none; }
}
.player-highlight {
  animation: player-highlight 2.5s ease-out forwards;
  border-radius: 0.5rem;
}
</style>
