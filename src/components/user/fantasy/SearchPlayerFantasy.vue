<template>
  <div class="w-full">
    <!-- Loading State -->
    <div
      v-if="isLoading && players.length === 0"
      class="flex items-center justify-center min-h-[300px]"
    >
      <div class="flex flex-col items-center gap-3">
        <v-icon
          name="pr-spinner"
          class="w-5 h-5 text-gray-300 dark:text-gray-600"
          animation="spin"
        />
        <p class="text-[13px] text-gray-400 dark:text-gray-500">
          Loading available players...
        </p>
      </div>
    </div>

    <!-- Error State -->
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
          <h3 class="text-[13px] font-semibold text-gray-900 dark:text-white">
            Error loading players
          </h3>
          <p class="text-[12px] text-gray-500 dark:text-gray-400 mt-0.5">
            {{ error }}
          </p>
        </div>
      </div>
    </div>

    <!-- No League Selected -->
    <div
      v-else-if="!leagueUuid"
      class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 p-5"
    >
      <div class="flex items-center gap-3">
        <v-icon
          name="hi-solid-information-circle"
          class="w-5 h-5 text-amber-500 dark:text-amber-400 shrink-0"
        />
        <div>
          <h3 class="text-[13px] font-semibold text-gray-900 dark:text-white">
            No fantasy league selected
          </h3>
          <p class="text-[12px] text-gray-500 dark:text-gray-400 mt-0.5">
            Please select a fantasy league to view available players.
          </p>
        </div>
      </div>
    </div>

    <!-- Players Content -->
    <div
      v-else-if="initialLoadComplete"
      class="space-y-4 relative"
      :class="{ 'max-h-[70vh] overflow-hidden': props.disabled }"
    >
      <!-- Disabled Overlay (waiting for turn) -->
      <div
        v-if="props.disabled"
        class="absolute inset-0 z-20 bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm rounded-2xl"
      >
        <div class="sticky top-0 h-[70vh] flex items-center justify-center">
          <div
            class="flex flex-col items-center gap-4 px-8 py-7 bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-200/80 dark:border-gray-700/80 mx-4 max-w-sm w-full"
          >
            <div
              class="w-14 h-14 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center"
            >
              <v-icon
                name="hi-solid-clock"
                class="w-7 h-7 text-amber-500 dark:text-amber-400 animate-pulse"
              />
            </div>
            <div class="text-center space-y-1">
              <p class="text-[16px] font-bold text-gray-800 dark:text-gray-100">
                Waiting for your turn...
              </p>
              <p class="text-[13px] text-gray-400 dark:text-gray-500">
                You can pick a player when it's your turn.
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Player Name Search -->
      <PlayerNameFilter
        :disabled="props.disabled"
        @search="onPlayerNameSearch"
      />

      <!-- Team Filter -->
      <TeamFilter
        :teams="teams"
        :selected-team="selectedTeam"
        :disabled="props.disabled"
        @update:selected-team="onTeamFilterChange"
      />

      <!-- Position Filters -->
      <PositionFilter
        :filters="positionFilters"
        :selected-position="selectedPosition"
        :disabled="props.disabled"
        @update:selected-position="handleFilterChange"
      />

      <!-- Show players if available -->
      <div
        v-if="(players.length > 0 && initialLoadComplete) || isLoading"
        class="relative"
      >
        <!-- Loading Overlay when filtering -->
        <div
          v-if="isLoading"
          class="absolute inset-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm z-10 rounded-2xl flex items-center justify-center"
        >
          <div class="flex flex-col items-center gap-2">
            <v-icon
              name="pr-spinner"
              class="w-5 h-5 text-gray-300 dark:text-gray-600"
              animation="spin"
            />
            <p class="text-[12px] text-gray-400 dark:text-gray-500">
              Filtering players...
            </p>
          </div>
        </div>

        <!-- Table Container -->
        <div
          class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 overflow-hidden"
        >
          <!-- Table Header -->
          <div
            class="px-4 py-3 border-b border-gray-100 dark:border-gray-700/60"
          >
            <div class="flex items-center gap-2">
              <v-icon
                name="hi-solid-clipboard-list"
                class="w-4 h-4 text-gray-400 dark:text-gray-500 shrink-0"
              />
              <h3
                class="text-[13px] font-semibold text-gray-900 dark:text-white"
              >
                Available Players
              </h3>
            </div>
          </div>

          <!-- Desktop Table -->
          <div class="hidden md:block overflow-x-auto">
            <table class="w-full">
              <thead
                class="bg-gray-50/80 dark:bg-gray-700/30 border-b border-gray-100 dark:border-gray-700/60"
              >
                <tr>
                  <th
                    class="px-3 py-2.5 text-center text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-16"
                  ></th>
                  <th
                    class="px-3 py-2.5 text-left text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    Player
                  </th>
                  <th
                    class="px-3 py-2.5 text-left text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    Team
                  </th>
                  <th
                    class="px-3 py-2.5 text-center text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    Pos
                  </th>
                  <th
                    class="px-3 py-2.5 text-center text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    Total
                  </th>
                  <th
                    class="px-3 py-2.5 text-center text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    Avg
                  </th>
                  <th
                    class="px-3 py-2.5 text-center text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    GP
                  </th>
                </tr>
              </thead>
              <TransitionGroup
                tag="tbody"
                :name="animateRemoval ? 'player-row' : undefined"
                class="divide-y divide-gray-100 dark:divide-gray-700/60"
              >
                <tr
                  v-for="player in players"
                  :key="player.player.uuid"
                  class="active:bg-gray-50 dark:active:bg-gray-700/50 transition-colors"
                >
                  <!-- Select Button -->
                  <td class="px-3 py-2.5">
                    <button
                      @click="handleAddPlayer(player)"
                      :disabled="
                        props.disabled || isAddingPlayer(player.player.uuid)
                      "
                      class="flex items-center justify-center w-8 h-8 rounded-xl bg-blue-500 dark:bg-blue-600 text-white transition-all active:scale-90 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
                      :class="[
                        isAddingPlayer(player.player.uuid)
                          ? 'opacity-50 cursor-not-allowed'
                          : '',
                      ]"
                    >
                      <v-icon
                        v-if="!isAddingPlayer(player.player.uuid)"
                        name="hi-solid-plus"
                        class="w-4 h-4"
                      />
                      <v-icon
                        v-else
                        name="pr-spinner"
                        class="w-3.5 h-3.5"
                        animation="spin"
                      />
                    </button>
                  </td>

                  <!-- Player Info -->
                  <td class="px-3 py-2.5">
                    <div class="flex items-center gap-2.5">
                      <img
                        :src="
                          player.player.image_path || '/img/default-avatar.svg'
                        "
                        :alt="player.player.display_name"
                        class="w-8 h-8 rounded-full object-cover border border-gray-200 dark:border-gray-600 shrink-0"
                      />
                      <div class="min-w-0">
                        <p
                          class="text-[13px] font-medium text-gray-900 dark:text-white truncate"
                        >
                          {{ player.player.display_name }}
                        </p>
                        <p
                          class="text-[11px] text-gray-400 dark:text-gray-500 truncate"
                        >
                          {{ player.player.common_name }}
                        </p>
                      </div>
                    </div>
                  </td>

                  <!-- Team -->
                  <td class="px-3 py-2.5">
                    <div class="flex items-center gap-1.5">
                      <img
                        :src="player.team.image_path || '/img/default-team.svg'"
                        :alt="player.team.name"
                        class="w-5 h-5 object-contain shrink-0"
                      />
                      <span
                        class="text-[12px] font-medium text-gray-600 dark:text-gray-400"
                      >
                        {{ player.team.short_code }}
                      </span>
                    </div>
                  </td>

                  <!-- Position -->
                  <td class="px-3 py-2.5 text-center">
                    <span
                      class="inline-flex items-center justify-center px-2 py-0.5 rounded-md text-[10px] font-bold"
                      :class="
                        getPositionColorClass(player.position.developer_name)
                      "
                    >
                      {{ player.position.code }}
                    </span>
                  </td>

                  <!-- Total Points -->
                  <td class="px-3 py-2.5 text-center">
                    <span
                      class="text-[13px] font-bold text-gray-900 dark:text-white tabular-nums"
                    >
                      {{ formatNumber(player.total_points, 1) }}
                    </span>
                  </td>

                  <!-- Average Points -->
                  <td class="px-3 py-2.5 text-center">
                    <span
                      class="text-[12px] font-semibold text-blue-600 dark:text-blue-400 tabular-nums"
                    >
                      {{ formatNumber(player.average_points, 2) }}
                    </span>
                  </td>

                  <!-- Fixtures -->
                  <td class="px-3 py-2.5 text-center">
                    <span
                      class="text-[12px] text-gray-500 dark:text-gray-400 tabular-nums"
                    >
                      {{ player.total_fixtures ?? 0 }}
                    </span>
                  </td>
                </tr>
              </TransitionGroup>
            </table>
          </div>

          <!-- Mobile Cards -->
          <TransitionGroup
            tag="div"
            :name="animateRemoval ? 'player-card' : undefined"
            class="md:hidden divide-y divide-gray-100 dark:divide-gray-700/60"
          >
            <div
              v-for="player in players"
              :key="player.player.uuid"
              class="px-4 py-3 active:bg-gray-50 dark:active:bg-gray-700/50 transition-colors"
            >
              <div class="flex items-center gap-3">
                <!-- Select Button -->
                <button
                  @click="handleAddPlayer(player)"
                  :disabled="
                    props.disabled || isAddingPlayer(player.player.uuid)
                  "
                  class="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-xl bg-blue-500 dark:bg-blue-600 text-white transition-all active:scale-90 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
                  :class="[
                    isAddingPlayer(player.player.uuid)
                      ? 'opacity-50 cursor-not-allowed'
                      : '',
                  ]"
                >
                  <v-icon
                    v-if="!isAddingPlayer(player.player.uuid)"
                    name="hi-solid-plus"
                    class="w-4 h-4"
                  />
                  <v-icon
                    v-else
                    name="pr-spinner"
                    class="w-3.5 h-3.5"
                    animation="spin"
                  />
                </button>

                <!-- Avatar -->
                <img
                  :src="player.player.image_path || '/img/default-avatar.svg'"
                  :alt="player.player.display_name"
                  class="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-gray-600 shrink-0"
                />

                <!-- Info -->
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2">
                    <p
                      class="text-[13px] font-medium text-gray-900 dark:text-white truncate"
                    >
                      {{ player.player.display_name }}
                    </p>
                    <span
                      class="inline-flex items-center justify-center px-1.5 py-0.5 rounded text-[9px] font-bold shrink-0"
                      :class="
                        getPositionColorClass(player.position.developer_name)
                      "
                    >
                      {{ player.position.code }}
                    </span>
                  </div>
                  <div class="flex items-center gap-1.5 mt-0.5">
                    <img
                      :src="player.team.image_path || '/img/default-team.svg'"
                      :alt="player.team.name"
                      class="w-3.5 h-3.5 object-contain"
                    />
                    <span class="text-[11px] text-gray-400 dark:text-gray-500">
                      {{ player.team.short_code }}
                    </span>
                  </div>
                </div>

                <!-- Stats -->
                <div class="flex items-center gap-3 shrink-0">
                  <div class="text-right">
                    <p
                      class="text-[13px] font-bold text-gray-900 dark:text-white tabular-nums"
                    >
                      {{ formatNumber(player.total_points, 1) }}
                    </p>
                    <p class="text-[10px] text-gray-400 dark:text-gray-500">
                      pts
                    </p>
                  </div>
                  <div class="text-right">
                    <p
                      class="text-[12px] font-semibold text-blue-600 dark:text-blue-400 tabular-nums"
                    >
                      {{ formatNumber(player.average_points, 2) }}
                    </p>
                    <p class="text-[10px] text-gray-400 dark:text-gray-500">
                      avg
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </TransitionGroup>
        </div>

        <!-- Loading More Indicator -->
        <div v-if="isLoadingMore" class="py-6 flex items-center justify-center">
          <v-icon
            name="pr-spinner"
            class="w-5 h-5 text-gray-300 dark:text-gray-600"
            animation="spin"
          />
        </div>

        <!-- End of List Indicator -->
        <div v-else-if="!hasMoreData" class="py-4 text-center">
          <p class="text-[12px] text-gray-400 dark:text-gray-500">
            {{ players.length }} players loaded
          </p>
        </div>

        <!-- Scroll Observer Target -->
        <div
          v-show="hasMoreData && !isLoadingMore"
          ref="observerTarget"
          class="h-20 w-full flex items-center justify-center"
        >
          <span class="text-xs text-gray-400">Scroll detector</span>
        </div>
      </div>

      <!-- Empty State -->
      <div
        v-else-if="initialLoadComplete && !isLoading"
        class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 p-10 text-center"
      >
        <div
          class="w-14 h-14 bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center mx-auto mb-3"
        >
          <v-icon
            name="hi-solid-users"
            class="w-7 h-7 text-gray-400 dark:text-gray-500"
          />
        </div>
        <h3
          class="text-[15px] font-semibold text-gray-900 dark:text-white mb-1"
        >
          {{
            selectedPosition === "ALL"
              ? "No players available"
              : "No players found"
          }}
        </h3>
        <p class="text-[13px] text-gray-500 dark:text-gray-400">
          {{
            selectedPosition === "ALL"
              ? "There are no players available at this moment."
              : `No ${selectedPosition.toLowerCase()} players available.`
          }}
        </p>
        <button
          v-if="selectedPosition !== 'ALL'"
          @click="handleFilterChange('ALL')"
          class="mt-4 px-4 py-2 bg-blue-500 active:bg-blue-600 text-white text-[13px] font-medium rounded-xl transition-colors"
        >
          View all positions
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { useRoute } from "vue-router";
import { FantasyPlayerDraftResponse } from "@/interfaces/fantasy/draft/FantasyPlayerDraftResponse";
import { FantasyPlayerDraftPayload } from "@/interfaces/fantasy/draft/FantasyPlayerDraftPayload";
import { FantasyAddPlayerPayload } from "@/interfaces/fantasy/draft/FantasyAddPlayerPayload";
import { FantasyLeaguesResponse } from "@/interfaces/fantasy/leagues/FantasyLeaguesResponse";
import { fantasyLeagueService } from "@/services/fantasy/leagues/FantasyLeagueService";
import { catalogService } from "@/services/catalog/CatalogService";
import { FootballTeamResponse } from "@/interfaces/football/team/FootballTeamResponse";
import { useToast } from "@/composables/useToast";
import PositionFilter from "@/components/user/fantasy/search/PositionFilter.vue";
import TeamFilter from "@/components/user/fantasy/search/TeamFilter.vue";
import PlayerNameFilter from "@/components/user/fantasy/search/PlayerNameFilter.vue";

interface Props {
  fantasyLeagueUuid?: string;
  mode?: "add" | "draft";
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  mode: "add",
  disabled: false,
});

const emit = defineEmits<{
  /** Emitted after a player is successfully added */
  "player-added": [player: FantasyPlayerDraftResponse];
}>();

// Router
const route = useRoute();

// Composables
const toast = useToast();

// State
const players = ref<FantasyPlayerDraftResponse[]>([]);
const league = ref<FantasyLeaguesResponse | null>(null);
const isLoading = ref(false);
const isLoadingMore = ref(false);
const error = ref<string | null>(null);
const currentPage = ref(1);
const perPage = ref(10);
const hasMoreData = ref(true);
const observerTarget = ref<HTMLElement | null>(null);
const addingPlayers = ref<Set<string>>(new Set());
const selectedPosition = ref<string>("ALL");
const selectedTeam = ref<string>("ALL");
const playerName = ref<string>("");
const teams = ref<FootballTeamResponse[]>([]);
const slotType = ref<string>("STARTER");
const initialLoadComplete = ref(false);
const animateRemoval = ref(false);
let observer: IntersectionObserver | null = null;

// Computed
const leagueUuid = computed(() => props.fantasyLeagueUuid);

const positionFilters = computed(() => {
  const filters: Array<{
    code: string;
    name: string;
    icon: string;
    color: string;
    activeClasses: string;
    iconBgActive: string;
    slotsTextActive: string;
    barColor: string;
    slots?: number;
  }> = [
    {
      code: "ALL",
      name: "All",
      icon: "hi-solid-view-grid",
      color: "text-gray-600 dark:text-gray-400",
      activeClasses:
        "text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700/60",
      iconBgActive: "bg-gray-700 dark:bg-gray-300",
      slotsTextActive: "text-gray-500 dark:text-gray-400",
      barColor: "bg-gray-700 dark:bg-gray-300",
    },
  ];

  if (league.value?.formation) {
    if (league.value.formation.goalkeeper?.starter > 0) {
      filters.push({
        code: "GOALKEEPER",
        name: "GK",
        icon: "hi-solid-shield-check",
        color: "text-blue-600 dark:text-blue-400",
        activeClasses:
          "text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20",
        iconBgActive:
          "bg-blue-600 dark:bg-blue-500 shadow-blue-500/30 shadow-md",
        slotsTextActive: "text-blue-500 dark:text-blue-400",
        barColor: "bg-blue-600 dark:bg-blue-400",
        slots: league.value.formation.goalkeeper.starter,
      });
    }
    if (league.value.formation.defender?.starter > 0) {
      filters.push({
        code: "DEFENDER",
        name: "DF",
        icon: "hi-solid-shield-exclamation",
        color: "text-emerald-600 dark:text-emerald-400",
        activeClasses:
          "text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/20",
        iconBgActive:
          "bg-emerald-600 dark:bg-emerald-500 shadow-emerald-500/30 shadow-md",
        slotsTextActive: "text-emerald-500 dark:text-emerald-400",
        barColor: "bg-emerald-600 dark:bg-emerald-400",
        slots: league.value.formation.defender.starter,
      });
    }
    if (league.value.formation.midfielder?.starter > 0) {
      filters.push({
        code: "MIDFIELDER",
        name: "MF",
        icon: "hi-solid-lightning-bolt",
        color: "text-amber-600 dark:text-amber-400",
        activeClasses:
          "text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/20",
        iconBgActive:
          "bg-amber-600 dark:bg-amber-500 shadow-amber-500/30 shadow-md",
        slotsTextActive: "text-amber-500 dark:text-amber-400",
        barColor: "bg-amber-600 dark:bg-amber-400",
        slots: league.value.formation.midfielder.starter,
      });
    }
    if (league.value.formation.attacker?.starter > 0) {
      filters.push({
        code: "ATTACKER",
        name: "FW",
        icon: "hi-solid-fire",
        color: "text-rose-600 dark:text-rose-400",
        activeClasses:
          "text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-900/20",
        iconBgActive:
          "bg-rose-600 dark:bg-rose-500 shadow-rose-500/30 shadow-md",
        slotsTextActive: "text-rose-500 dark:text-rose-400",
        barColor: "bg-rose-600 dark:bg-rose-400",
        slots: league.value.formation.attacker.starter,
      });
    }
  }

  return filters;
});

// Methods
function formatNumber(value: number | null | undefined, decimals = 2): string {
  const num = Number(value) || 0;
  return num.toFixed(decimals);
}

function getPositionColorClass(position: string): string {
  const colors: Record<string, string> = {
    GOALKEEPER:
      "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800",
    DEFENDER:
      "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800",
    MIDFIELDER:
      "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800",
    ATTACKER:
      "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800",
  };
  return (
    colors[position] ||
    "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-600"
  );
}

function isAddingPlayer(playerUuid: string): boolean {
  return addingPlayers.value.has(playerUuid);
}

async function loadLeague() {
  if (!leagueUuid.value) return;
  try {
    league.value = await fantasyLeagueService.showFantasyLeague(
      leagueUuid.value,
    );
  } catch (err: unknown) {
    console.error("Error loading league:", err);
  }
}

async function loadTeams() {
  if (!league.value?.current_football_season_uuid) return;
  try {
    teams.value = await catalogService.getTeamsBySeasonUuid(
      league.value.current_football_season_uuid,
    );
  } catch (err: unknown) {
    console.error("Error loading teams:", err);
  }
}

function onTeamFilterChange(value: string | number | null) {
  selectedTeam.value = String(value || "ALL");
  loadPlayers(false);
}

function onPlayerNameSearch(value: string) {
  playerName.value = value;
  loadPlayers(false);
}

function handleFilterChange(position: string) {
  selectedPosition.value = position;
  loadPlayers(false);
}

/**
 * Add or pick a player depending on the current mode.
 */
async function handleAddPlayer(player: FantasyPlayerDraftResponse) {
  if (props.disabled || !leagueUuid.value || isAddingPlayer(player.player.uuid))
    return;

  addingPlayers.value.add(player.player.uuid);

  try {
    if (props.mode === "draft") {
      const payload: FantasyAddPlayerPayload = {
        fantasy_league_uuid: leagueUuid.value,
        player_uuid: player.player.uuid,
        position_uuid: player.position.uuid,
        is_flex: null,
        is_starter: null,
      };

      await fantasyLeagueService.pickerPlayer(payload);

      toast.success(
        "Player picked",
        `${player.player.display_name} has been drafted`,
        { duration: 3000 },
      );
    } else {
      const payload: FantasyAddPlayerPayload = {
        fantasy_league_uuid: leagueUuid.value,
        player_uuid: player.player.uuid,
        position_uuid: player.position.uuid,
        is_flex: slotType.value === "FLEX",
        is_starter: slotType.value !== "BENCH",
      };

      await fantasyLeagueService.addPlayer(payload);

      toast.success(
        "Player added successfully",
        `${player.player.display_name} has been added to your team`,
        { duration: 3000 },
      );
    }

    // Remove from the local list with animation
    animateRemoval.value = true;
    players.value = players.value.filter(
      (p) => p.player.uuid !== player.player.uuid,
    );
    setTimeout(() => {
      animateRemoval.value = false;
    }, 500);

    emit("player-added", player);
  } catch (err: unknown) {
    const errorMessage =
      err instanceof Error ? err.message : "Error adding player";
    toast.error("Error", errorMessage);
    console.error("Error adding player:", errorMessage);
  } finally {
    addingPlayers.value.delete(player.player.uuid);
  }
}

async function loadPlayers(append = false) {
  if (!leagueUuid.value) return;

  if (append) {
    if (isLoadingMore.value || !hasMoreData.value) return;
    isLoadingMore.value = true;
  } else {
    isLoading.value = true;
    error.value = null;
    currentPage.value = 1;
    hasMoreData.value = true;
  }

  try {
    const payload: FantasyPlayerDraftPayload = {
      page: currentPage.value,
      per_page: perPage.value,
      filters: buildPayloadFilters(),
    };

    const response = await fantasyLeagueService.getPlayersToDraft(
      leagueUuid.value,
      payload,
    );

    players.value = append ? [...players.value, ...response] : response;
    handlePaginationResult(response.length, append);
  } catch (err: unknown) {
    const errorMessage =
      err instanceof Error ? err.message : "Error loading players";
    error.value = errorMessage;
  } finally {
    isLoading.value = false;
    isLoadingMore.value = false;
  }
}

function buildPayloadFilters(): FantasyPlayerDraftPayload["filters"] {
  const filters: Record<string, string> = {};

  if (selectedPosition.value !== "ALL" && league.value?.formation) {
    const positionMap: Record<string, string | undefined> = {
      GOALKEEPER: league.value.formation.goalkeeper?.uuid,
      DEFENDER: league.value.formation.defender?.uuid,
      MIDFIELDER: league.value.formation.midfielder?.uuid,
      ATTACKER: league.value.formation.attacker?.uuid,
    };
    const positionUuid = positionMap[selectedPosition.value];
    if (positionUuid) {
      filters.position_uuid = positionUuid;
    }
  }

  if (selectedTeam.value !== "ALL") {
    filters.team_uuid = selectedTeam.value;
  }

  if (playerName.value) {
    filters.player_name = playerName.value;
  }

  return Object.keys(filters).length > 0 ? filters : undefined;
}

function handlePaginationResult(responseLength: number, append: boolean) {
  if (responseLength < perPage.value) {
    hasMoreData.value = false;
  } else {
    hasMoreData.value = true;
    currentPage.value++;
    if (append) {
      setTimeout(() => setupIntersectionObserver(), 100);
    }
  }
}

function setupIntersectionObserver() {
  if (observer) {
    observer.disconnect();
  }

  if (!observerTarget.value) {
    setTimeout(() => setupIntersectionObserver(), 100);
    return;
  }

  observer = new IntersectionObserver(
    (entries) => {
      const [entry] = entries;
      if (
        entry.isIntersecting &&
        hasMoreData.value &&
        !isLoadingMore.value &&
        !isLoading.value
      ) {
        loadPlayers(true);
      }
    },
    {
      root: null,
      rootMargin: "300px",
      threshold: 0,
    },
  );

  observer.observe(observerTarget.value);
}

// Watch league uuid changes
watch(leagueUuid, async (newVal) => {
  if (newVal) {
    await loadLeague();
    await loadTeams();
    await loadPlayers();
  }
});

// Lifecycle
onMounted(async () => {
  await loadLeague();
  await loadTeams();

  // Check if there's a position filter in query params
  const positionFromQuery = route.query.position as string;
  if (
    positionFromQuery &&
    ["GOALKEEPER", "DEFENDER", "MIDFIELDER", "ATTACKER", "ALL"].includes(
      positionFromQuery,
    )
  ) {
    selectedPosition.value = positionFromQuery;
  }

  // Check if there's a slot type in query params
  const slotTypeFromQuery = route.query.slotType as string;
  if (slotTypeFromQuery) {
    slotType.value = slotTypeFromQuery;
  }

  await loadPlayers();
  initialLoadComplete.value = true;

  setTimeout(() => setupIntersectionObserver(), 1000);
});

onUnmounted(() => {
  if (observer) {
    observer.disconnect();
  }
});

/** Remove a player from the list by UUID (called from parent via ref) */
function removePlayerByUuid(playerUuid: string) {
  animateRemoval.value = true;
  players.value = players.value.filter((p) => p.player.uuid !== playerUuid);
  setTimeout(() => {
    animateRemoval.value = false;
  }, 500);
}

defineExpose({ removePlayerByUuid });
</script>

<style scoped>
/* Smooth transitions */
@media (prefers-reduced-motion: no-preference) {
  * {
    transition-duration: 0.2s;
  }
}

/* Hide scrollbar for filter tabs */
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

/* ── Desktop table row animations ── */
.player-row-enter-active {
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}
.player-row-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
.player-row-enter-from {
  opacity: 0;
  transform: translateX(-12px);
}
.player-row-leave-to {
  opacity: 0;
  transform: translateX(30px) scale(0.96);
}
.player-row-move {
  transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

/* ── Mobile card animations ── */
.player-card-enter-active {
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}
.player-card-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}
.player-card-enter-from {
  opacity: 0;
  transform: translateY(-8px);
}
.player-card-leave-to {
  opacity: 0;
  transform: translateX(40px) scale(0.95);
  max-height: 0;
  padding-top: 0;
  padding-bottom: 0;
  margin-top: 0;
  margin-bottom: 0;
  overflow: hidden;
}
.player-card-move {
  transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
