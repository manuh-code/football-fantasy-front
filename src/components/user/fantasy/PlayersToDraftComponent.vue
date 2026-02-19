<template>
  <div class="w-full">
    <!-- Loading State -->
    <div
      v-if="isLoading && players.length === 0"
      class="flex items-center justify-center min-h-[400px]"
    >
      <div class="flex flex-col items-center gap-4">
        <v-icon
          name="pr-spinner"
          class="w-12 h-12 text-blue-600 dark:text-blue-400"
          animation="spin"
        />
        <p class="text-gray-600 dark:text-gray-400 font-medium">
          Loading available players...
        </p>
      </div>
    </div>

    <!-- Error State -->
    <div
      v-else-if="error"
      class="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-xl p-6"
    >
      <div class="flex items-center gap-3">
        <v-icon
          name="hi-solid-exclamation-circle"
          class="w-8 h-8 text-red-600 dark:text-red-400"
        />
        <div>
          <h3 class="text-lg font-semibold text-red-900 dark:text-red-100">
            Error loading players
          </h3>
          <p class="text-sm text-red-700 dark:text-red-300">{{ error }}</p>
        </div>
      </div>
    </div>

    <!-- No League Selected -->
    <div
      v-else-if="!leagueUuid"
      class="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-900/30 rounded-xl p-6"
    >
      <div class="flex items-center gap-3">
        <v-icon
          name="hi-solid-information-circle"
          class="w-8 h-8 text-yellow-600 dark:text-yellow-400"
        />
        <div>
          <h3
            class="text-lg font-semibold text-yellow-900 dark:text-yellow-100"
          >
            No fantasy league selected
          </h3>
          <p class="text-sm text-yellow-700 dark:text-yellow-300">
            Please select a fantasy league to view available players.
          </p>
        </div>
      </div>
    </div>

    <!-- Players Table -->
    <div v-else-if="initialLoadComplete" class="space-y-6">
      <!-- Position Filters -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div class="p-4">
          <div class="flex items-center gap-3 mb-4">
            <v-icon name="hi-solid-filter" class="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300">Filter by Position</h3>
          </div>
          
          <!-- Horizontal Filter Buttons -->
          <div class="flex items-center gap-2 overflow-x-auto pb-2">
            <button
              v-for="filter in positionFilters"
              :key="filter.code"
              @click="handleFilterChange(filter.code)"
              :class="[
                'flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 whitespace-nowrap',
                selectedPosition === filter.code
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md scale-105'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              ]"
            >
              <v-icon 
                :name="filter.icon" 
                class="w-4 h-4"
                :class="selectedPosition === filter.code ? 'text-white' : filter.color"
              />
              <span>{{ filter.name }}</span>
              <span 
                :class="[
                  'px-2 py-0.5 rounded-full text-xs font-bold',
                  selectedPosition === filter.code
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
                ]"
              >
                {{ getPlayerCountByPosition(filter.code) }}
              </span>
            </button>
          </div>
        </div>
      </div>

      <!-- Show players if available -->
      <div v-if="(players.length > 0 && initialLoadComplete) || isLoading" class="relative">
        <!-- Loading Overlay when filtering -->
        <div
          v-if="isLoading"
          class="absolute inset-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm z-10 rounded-xl flex items-center justify-center"
        >
          <div class="flex flex-col items-center gap-3">
            <v-icon
              name="pr-spinner"
              class="w-10 h-10 text-blue-600 dark:text-blue-400"
              animation="spin"
            />
            <p class="text-sm font-medium text-gray-600 dark:text-gray-400">
              Filtering players...
            </p>
          </div>
        </div>

        <!-- Table Container -->
        <div
          class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
        >
          <!-- Table Header -->
          <div
            class="bg-gradient-to-r from-blue-600 to-blue-700 px-4 md:px-6 py-4"
          >
            <h3 class="text-lg font-bold text-white flex items-center gap-2">
              <v-icon name="hi-solid-clipboard-list" class="w-5 h-5" />
              Available Players
            </h3>
          </div>

          <!-- Desktop Table -->
          <div class="hidden md:block overflow-x-auto">
            <table class="w-full">
              <thead
                class="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-600"
              >
                <tr>
                  <th
                    class="px-4 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider w-20"
                  >
                    Select
                  </th>
                  <th
                    class="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider"
                  >
                    Player
                  </th>
                  <th
                    class="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider"
                  >
                    Team
                  </th>
                  <th
                    class="px-4 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider"
                  >
                    Position
                  </th>
                  <th
                    class="px-4 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider"
                  >
                    Total Points
                  </th>
                  <th
                    class="px-4 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider"
                  >
                    Avg Points
                  </th>
                  <th
                    class="px-4 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider"
                  >
                    Fixtures
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                <tr
                  v-for="player in players"
                  :key="player.player.uuid"
                  class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150"
                >
                  <!-- Select Button -->
                  <td class="px-4 py-4">
                    <button
                      @click="handleAddPlayer(player)"
                      :disabled="isAddingPlayer(player.player.uuid)"
                      class="group relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 hover:from-blue-600 hover:to-blue-700 dark:hover:from-blue-500 dark:hover:to-blue-600 shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-md"
                      :title="
                        isAddingPlayer(player.player.uuid)
                          ? 'Adding player...'
                          : 'Select player'
                      "
                    >
                      <v-icon
                        v-if="!isAddingPlayer(player.player.uuid)"
                        name="hi-solid-plus-circle"
                        class="w-6 h-6 text-white group-hover:rotate-90 transition-transform duration-300"
                      />
                      <v-icon
                        v-else
                        name="pr-spinner"
                        class="w-5 h-5 text-white"
                        animation="spin"
                      />
                    </button>
                  </td>

                  <!-- Player Info -->
                  <td class="px-4 py-4">
                    <div class="flex items-center gap-3">
                      <img
                        :src="
                          player.player.image_path || '/img/default-avatar.svg'
                        "
                        :alt="player.player.display_name"
                        class="w-12 h-12 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
                      />
                      <div>
                        <p class="font-semibold text-gray-900 dark:text-white">
                          {{ player.player.display_name }}
                        </p>
                        <p class="text-xs text-gray-500 dark:text-gray-400">
                          {{ player.player.common_name }}
                        </p>
                      </div>
                    </div>
                  </td>

                  <!-- Team -->
                  <td class="px-4 py-4">
                    <div class="flex items-center gap-2">
                      <img
                        :src="player.team.image_path || '/img/default-team.svg'"
                        :alt="player.team.name"
                        class="w-8 h-8 object-contain"
                      />
                      <span
                        class="text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        {{ player.team.short_code }}
                      </span>
                    </div>
                  </td>

                  <!-- Position -->
                  <td class="px-4 py-4 text-center">
                    <span
                      class="inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-bold"
                      :class="
                        getPositionColorClass(player.position.developer_name)
                      "
                    >
                      {{ player.position.code }}
                    </span>
                  </td>

                  <!-- Total Points -->
                  <td class="px-4 py-4 text-center">
                    <div class="flex flex-col items-center">
                      <span
                        class="text-lg font-bold text-gray-900 dark:text-white"
                      >
                        {{ formatNumber(player.total_points, 1) }}
                      </span>
                    </div>
                  </td>

                  <!-- Average Points -->
                  <td class="px-4 py-4 text-center">
                    <span
                      class="text-sm font-semibold text-blue-600 dark:text-blue-400"
                    >
                      {{ formatNumber(player.average_points, 2) }}
                    </span>
                  </td>

                  <!-- Fixtures -->
                  <td class="px-4 py-4 text-center">
                    <span class="text-sm text-gray-600 dark:text-gray-400">
                      {{ player.total_fixtures ?? 0 }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Mobile Cards -->
          <div class="md:hidden divide-y divide-gray-200 dark:divide-gray-700">
            <div
              v-for="player in players"
              :key="player.player.uuid"
              class="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150"
            >
              <div class="flex items-start gap-3">
                <!-- Select Button -->
                <button
                  @click="handleAddPlayer(player)"
                  :disabled="isAddingPlayer(player.player.uuid)"
                  class="flex-shrink-0 group relative flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 hover:from-blue-600 hover:to-blue-700 dark:hover:from-blue-500 dark:hover:to-blue-600 shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-md"
                  :title="
                    isAddingPlayer(player.player.uuid)
                      ? 'Adding player...'
                      : 'Select player'
                  "
                >
                  <v-icon
                    v-if="!isAddingPlayer(player.player.uuid)"
                    name="hi-solid-plus-circle"
                    class="w-6 h-6 text-white group-hover:rotate-90 transition-transform duration-300"
                  />
                  <v-icon
                    v-else
                    name="pr-spinner"
                    class="w-5 h-5 text-white"
                    animation="spin"
                  />
                </button>

                <!-- Player Info -->
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 mb-2">
                    <img
                      :src="
                        player.player.image_path || '/img/default-avatar.svg'
                      "
                      :alt="player.player.display_name"
                      class="w-12 h-12 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
                    />
                    <div class="flex-1 min-w-0">
                      <p
                        class="font-semibold text-gray-900 dark:text-white truncate"
                      >
                        {{ player.player.display_name }}
                      </p>
                      <div class="flex items-center gap-2 mt-1">
                        <img
                          :src="
                            player.team.image_path || '/img/default-team.svg'
                          "
                          :alt="player.team.name"
                          class="w-5 h-5 object-contain"
                        />
                        <span class="text-xs text-gray-500 dark:text-gray-400">
                          {{ player.team.short_code }}
                        </span>
                        <span
                          class="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-bold"
                          :class="
                            getPositionColorClass(
                              player.position.developer_name,
                            )
                          "
                        >
                          {{ player.position.code }}
                        </span>
                      </div>
                    </div>
                  </div>

                  <!-- Stats -->
                  <div class="grid grid-cols-3 gap-2 mt-3">
                    <div
                      class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2 text-center"
                    >
                      <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">
                        Total Pts
                      </p>
                      <p
                        class="text-sm font-bold text-gray-900 dark:text-white"
                      >
                        {{ formatNumber(player.total_points, 1) }}
                      </p>
                    </div>
                    <div
                      class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2 text-center"
                    >
                      <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">
                        Avg Pts
                      </p>
                      <p
                        class="text-sm font-bold text-blue-600 dark:text-blue-400"
                      >
                        {{ formatNumber(player.average_points, 2) }}
                      </p>
                    </div>
                    <div
                      class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2 text-center"
                    >
                      <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">
                        Fixtures
                      </p>
                      <p
                        class="text-sm font-bold text-gray-900 dark:text-white"
                      >
                        {{ player.total_fixtures ?? 0 }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Loading More Indicator -->
        <div
          v-if="isLoadingMore"
          class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          <div class="flex items-center justify-center gap-3">
            <v-icon
              name="pr-spinner"
              class="w-6 h-6 text-blue-600 dark:text-blue-400"
              animation="spin"
            />
            <span class="text-gray-600 dark:text-gray-400 font-medium"
              >Loading more players...</span
            >
          </div>
        </div>

        <!-- End of List Indicator -->
        <div
          v-else-if="!hasMoreData"
          class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 text-center"
        >
          <div
            class="flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400"
          >
            <v-icon name="hi-solid-check-circle" class="w-5 h-5" />
            <span class="text-sm font-medium"
              >You've reached the end of the list</span
            >
          </div>
          <p class="text-xs text-gray-400 dark:text-gray-500 mt-2">
            Total: {{ players.length }} players
          </p>
        </div>

        <!-- Scroll Observer Target - Always present when hasMoreData -->
        <div
          v-show="hasMoreData && !isLoadingMore"
          ref="observerTarget"
          class="h-20 w-full flex items-center justify-center"
        >
          <span class="text-xs text-gray-400">Scroll detector</span>
        </div>
      </div>

      <!-- Empty State inside main container -->
      <div
        v-else-if="initialLoadComplete && !isLoading"
        class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center"
      >
        <div
          class="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <v-icon
            name="hi-solid-users"
            class="w-10 h-10 text-gray-400 dark:text-gray-500"
          />
        </div>
        <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          {{ selectedPosition === 'ALL' ? 'No players available' : 'No players found' }}
        </h3>
        <p class="text-gray-600 dark:text-gray-400">
          {{ selectedPosition === 'ALL' 
            ? 'There are no players available for draft at this moment.' 
            : `There are no ${selectedPosition.toLowerCase()} players available for draft.` 
          }}
        </p>
        <button
          v-if="selectedPosition !== 'ALL'"
          @click="handleFilterChange('ALL')"
          class="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200"
        >
          View all positions
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRoute } from "vue-router";
import { FantasyPlayerDraftResponse } from "@/interfaces/fantasy/draft/FantasyPlayerDraftResponse";
import { FantasyPlayerDraftPayload } from "@/interfaces/fantasy/draft/FantasyPlayerDraftPayload";
import { FantasyAddPlayerPayload } from "@/interfaces/fantasy/draft/FantasyAddPlayerPayload";
import { FantasyLeaguesResponse } from "@/interfaces/fantasy/leagues/FantasyLeaguesResponse";
import { fantasyLeagueService } from "@/services/fantasy/leagues/FantasyLeagueService";
import { useToast } from "@/composables/useToast";

interface Props {
  fantasyLeagueUuid?: string;
}

const props = defineProps<Props>();

// Router
const route = useRoute();

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
const initialLoadComplete = ref(false);
let observer: IntersectionObserver | null = null;

// Composables
const toast = useToast();

// Computed
const leagueUuid = computed(() => props.fantasyLeagueUuid);

const positionFilters = computed(() => {
  const filters = [
    { code: "ALL", name: "All", icon: "hi-solid-view-grid", color: "text-gray-600 dark:text-gray-400" }
  ];
  
  if (league.value?.formation) {
    if (league.value.formation.goalkeeper?.starter > 0) {
      filters.push({
        code: "GOALKEEPER",
        name: "GK",
        icon: "hi-solid-shield-check",
        color: "text-blue-600 dark:text-blue-400"
      });
    }
    if (league.value.formation.defender?.starter > 0) {
      filters.push({
        code: "DEFENDER",
        name: "DF",
        icon: "hi-solid-shield-exclamation",
        color: "text-green-600 dark:text-green-400"
      });
    }
    if (league.value.formation.midfielder?.starter > 0) {
      filters.push({
        code: "MIDFIELDER",
        name: "MF",
        icon: "hi-solid-lightning-bolt",
        color: "text-yellow-600 dark:text-yellow-400"
      });
    }
    if (league.value.formation.attacker?.starter > 0) {
      filters.push({
        code: "ATTACKER",
        name: "FW",
        icon: "hi-solid-fire",
        color: "text-red-600 dark:text-red-400"
      });
    }
  }
  
  return filters;
});

const getPlayerCountByPosition = (position: string) => {
  // When a filter is active, show the current count from API
  return players.value.length;
};

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
  if (!leagueUuid.value) {
    return;
  }

  try {
    league.value = await fantasyLeagueService.showFantasyLeague(leagueUuid.value);
  } catch (err: unknown) {
    console.error("Error loading league:", err);
  }
}

function handleFilterChange(position: string) {
  selectedPosition.value = position;
  // Reset and reload players with new filter
  loadPlayers(false);
}

async function handleAddPlayer(player: FantasyPlayerDraftResponse) {
  if (!leagueUuid.value || isAddingPlayer(player.player.uuid)) {
    return;
  }

  addingPlayers.value.add(player.player.uuid);

  try {
    const payload: FantasyAddPlayerPayload = {
      fantasy_league_uuid: leagueUuid.value,
      player_uuid: player.player.uuid,
      position_uuid: player.position.uuid,
      is_flex: false, // This can be modified based on your logic
      is_starter: true, // This can be modified based on your logic
    };

    await fantasyLeagueService.addPlayer(payload);

    toast.success(
      "Player added successfully",
      `${player.player.display_name} has been added to your team`,
      { duration: 3000 },
    );

    // Remove player from the list after successful addition
    players.value = players.value.filter(
      (p) => p.player.uuid !== player.player.uuid,
    );
  } catch (err: unknown) {
    const errorMessage =
      err instanceof Error ? err.message : "Error adding player";
    toast.error("Failed to add player", errorMessage, { duration: 3000 });
  } finally {
    addingPlayers.value.delete(player.player.uuid);
  }
}

async function loadPlayers(append = false) {
  if (!leagueUuid.value) {
    return;
  }

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
    };

    // Add position filter if not "ALL"
    if (selectedPosition.value !== "ALL" && league.value?.formation) {
      const positionMap: Record<string, string | undefined> = {
        GOALKEEPER: league.value.formation.goalkeeper?.uuid,
        DEFENDER: league.value.formation.defender?.uuid,
        MIDFIELDER: league.value.formation.midfielder?.uuid,
        ATTACKER: league.value.formation.attacker?.uuid,
      };

      const positionUuid = positionMap[selectedPosition.value];
      if (positionUuid) {
        payload.filters = {
          position_uuid: positionUuid,
        };
      }
    }

    const response = await fantasyLeagueService.getPlayersToDraft(
      leagueUuid.value,
      payload,
    );

    if (append) {
      players.value = [...players.value, ...response];
    } else {
      players.value = response;
    }

    // Si recibimos menos elementos que el per_page, significa que no hay más datos
    if (response.length < perPage.value) {
      hasMoreData.value = false;
    } else {
      hasMoreData.value = true;
      currentPage.value++;

      // Reconectar observer después de cargar
      if (append) {
        setTimeout(() => {
          setupIntersectionObserver();
        }, 100);
      }
    }
  } catch (err: unknown) {
    const errorMessage =
      err instanceof Error ? err.message : "Error loading players";
    error.value = errorMessage;
    toast.error("Error loading players", errorMessage, { duration: 3000 });
  } finally {
    isLoading.value = false;
    isLoadingMore.value = false;
  }
}

function setupIntersectionObserver() {
  // Disconnect previous observer if exists
  if (observer) {
    observer.disconnect();
  }

  if (!observerTarget.value) {
    setTimeout(() => {
      setupIntersectionObserver();
    }, 100);
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

// Lifecycle
onMounted(async () => {
  await loadLeague();
  
  // Check if there's a position filter in query params
  const positionFromQuery = route.query.position as string;
  if (positionFromQuery && ['GOALKEEPER', 'DEFENDER', 'MIDFIELDER', 'ATTACKER', 'ALL'].includes(positionFromQuery)) {
    selectedPosition.value = positionFromQuery;
  }
  
  await loadPlayers();
  
  // Mark initial load as complete
  initialLoadComplete.value = true;
  
  // Delay para asegurar que el DOM esté listo
  setTimeout(() => {
    setupIntersectionObserver();
  }, 1000);
});

onUnmounted(() => {
  if (observer) {
    observer.disconnect();
  }
});
</script>

<style scoped>
/* Smooth transitions */
@media (prefers-reduced-motion: no-preference) {
  * {
    transition-duration: 0.2s;
  }
}
</style>
