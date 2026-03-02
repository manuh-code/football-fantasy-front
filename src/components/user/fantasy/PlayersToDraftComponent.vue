<template>
  <div class="w-full pb-safe md:pl-[368px] transition-[padding] duration-300">
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
          <p class="text-[12px] text-gray-500 dark:text-gray-400 mt-0.5">{{ error }}</p>
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

    <!-- Players Table -->
    <div v-else-if="initialLoadComplete" class="space-y-4">

      <!-- ═══════════ DRAFT TIMER BAR (always visible when draft active) ═══════════ -->
      <div
        v-if="currentTurn && !isDraftComplete && draftPickTime > 0"
        class="rounded-2xl shadow-sm overflow-hidden transition-all duration-300"
        :class="draftTimerBannerClass"
      >
        <!-- Top row: turn info + countdown -->
        <div class="px-4 py-2.5 flex items-center gap-3">
          <!-- Turn indicator icon -->
          <div
            class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-white/20 backdrop-blur-sm"
            :class="isMyTurn ? 'animate-pulse' : ''"
          >
            <v-icon
              :name="isMyTurn ? 'hi-solid-cursor-click' : 'hi-solid-clock'"
              class="w-4 h-4 text-white"
            />
          </div>

          <!-- Turn text -->
          <div class="flex-1 min-w-0">
            <p class="font-semibold text-[13px] text-white leading-tight">
              {{
                draftTimerExpired
                  ? "Time's up! Skipping..."
                  : isMyTurn
                    ? "Your turn to pick!"
                    : `${currentTurn.user_name}'s turn...`
              }}
            </p>
            <p class="text-[11px] text-white/60 mt-0.5">
              Pick #{{ currentTurn.pick }} — Round {{ currentTurn.round }}
            </p>
          </div>

          <!-- Countdown number -->
          <div
            class="flex-shrink-0 flex items-center gap-1"
            :class="{ 'animate-bounce': draftTimerUrgency === 'critical' && !draftTimerExpired }"
          >
            <span
              class="text-2xl font-black text-white tabular-nums leading-none"
              :class="{
                'text-red-200 animate-pulse': draftTimerUrgency === 'critical',
                'text-yellow-200': draftTimerUrgency === 'warning',
              }"
            >
              {{ draftFormattedTime }}
            </span>
            <span class="text-[9px] text-white/40 font-medium">s</span>
          </div>
        </div>

        <!-- Progress bar -->
        <div class="px-4 pb-2.5">
          <div class="w-full h-1.5 rounded-full bg-white/20 overflow-hidden">
            <div
              class="h-full rounded-full transition-all duration-1000 ease-linear"
              :class="draftTimerBarColor"
              :style="{ width: `${draftTimerProgress * 100}%` }"
            />
          </div>
        </div>
      </div>

      <!-- Draft Order Carousel -->
      <DraftOrderCarousel
        v-if="league?.draft?.draft_order?.length"
        :draft-order="league.draft.draft_order"
        :current-turn="currentTurn"
        :is-draft-complete="isDraftComplete"
        :is-my-turn="isMyTurn"
        :pick-time="0"
      />

      <!-- Draft Complete Banner (when no carousel data) -->
      <div
        v-if="isDraftComplete && !league?.draft?.draft_order?.length"
        class="bg-gradient-to-r from-purple-500 to-indigo-500 dark:from-purple-600 dark:to-indigo-600 rounded-2xl p-5 text-center shadow-sm"
      >
        <p class="text-white font-semibold text-[13px]">
          Draft Complete! All players have been selected.
        </p>
      </div>

      <!-- Position Filters (iOS-style pills) -->
      <div class="px-1">
        <div class="flex items-center gap-2 overflow-x-auto scrollbar-hide py-1">
          <button
            v-for="filter in positionFilters"
            :key="filter.code"
            @click="handleFilterChange(filter.code)"
            class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[12px] font-semibold whitespace-nowrap transition-all duration-200 active:scale-[0.96] shrink-0"
            :class="[
              selectedPosition === filter.code
                ? filter.activeClasses + ' shadow-sm'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 active:bg-gray-50 dark:active:bg-gray-700/50',
            ]"
          >
            <v-icon
              :name="filter.icon"
              class="w-3.5 h-3.5"
              :class="[
                selectedPosition === filter.code
                  ? 'text-current'
                  : filter.color,
              ]"
            />
            {{ filter.name }}
            <span
              v-if="filter.slots"
              class="text-[10px] opacity-70"
            >{{ filter.slots }}</span>
          </button>
        </div>
      </div>

      <!-- Team Filter -->
      <div
        class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 overflow-visible"
      >
        <div class="px-4 py-3">
          <div class="flex flex-col sm:flex-row sm:items-center gap-3">
            <!-- Label -->
            <div class="flex items-center gap-2 flex-shrink-0">
              <v-icon
                name="hi-solid-user-group"
                class="w-4 h-4 text-gray-400 dark:text-gray-500 shrink-0"
              />
              <span
                class="text-[13px] font-semibold text-gray-700 dark:text-gray-300"
                >Team</span
              >
            </div>

            <!-- Team Selector -->
            <div class="flex-1">
              <SearchableSelectComponent
                v-model="selectedTeam"
                :options="teams"
                value-key="uuid"
                label-key="name"
                image-key="image_path"
                subtitle-key="short_code"
                placeholder="All teams"
                search-placeholder="Search team..."
                :all-option="true"
                all-option-label="All teams"
                all-option-value="ALL"
                accent-color="indigo"
                default-image="/img/default-team.svg"
                no-results-text="No teams found for"
                @change="onTeamFilterChange"
              />
            </div>

            <!-- Active Filters Summary -->
            <div
              v-if="selectedTeam !== 'ALL' || selectedPosition !== 'ALL'"
              class="flex items-center gap-2 flex-wrap sm:flex-shrink-0"
            >
              <span
                class="text-xs text-gray-400 dark:text-gray-500 hidden sm:inline"
                >Active:</span
              >
              <span
                v-if="selectedPosition !== 'ALL'"
                class="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
              >
                {{
                  selectedPosition === "GOALKEEPER"
                    ? "GK"
                    : selectedPosition === "DEFENDER"
                      ? "DF"
                      : selectedPosition === "MIDFIELDER"
                        ? "MF"
                        : "FW"
                }}
                <button
                  @click="handleFilterChange('ALL')"
                  class="hover:text-blue-900 dark:hover:text-blue-100"
                >
                  <v-icon name="hi-solid-x" class="w-3 h-3" />
                </button>
              </span>
              <span
                v-if="selectedTeamData"
                class="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300"
              >
                <img
                  :src="selectedTeamData.image_path || '/img/default-team.svg'"
                  :alt="selectedTeamData.short_code"
                  class="w-3.5 h-3.5 object-contain"
                />
                {{ selectedTeamData.short_code }}
                <button
                  @click="onTeamFilterChange('ALL')"
                  class="hover:text-indigo-900 dark:hover:text-indigo-100"
                >
                  <v-icon name="hi-solid-x" class="w-3 h-3" />
                </button>
              </span>
            </div>
          </div>
        </div>
      </div>

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

        <!-- Locked Overlay: not your turn -->
        <Transition name="fade">
          <div
            v-if="!canPick && !isDraftComplete && currentTurn && !isLoading"
            class="absolute inset-0 bg-gray-900/10 dark:bg-gray-900/20 backdrop-blur-[1px] z-[5] rounded-2xl flex items-start justify-center pt-6 pointer-events-none"
          >
            <div
              class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700/60 px-4 py-3 flex items-center gap-2.5 pointer-events-auto max-w-sm mx-4"
            >
              <v-icon
                name="hi-solid-lock-closed"
                class="w-4 h-4 text-amber-500 dark:text-amber-400 shrink-0"
              />
              <div>
                <p class="text-[13px] font-semibold text-gray-900 dark:text-white">
                  Waiting for {{ currentTurn?.user_name ?? "another player" }}
                </p>
                <p class="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
                  Players unlock when it's your turn
                </p>
              </div>
            </div>
          </div>
        </Transition>

        <!-- Table Container -->
        <div
          class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 overflow-hidden"
        >
          <!-- Table Header -->
          <div
            class="px-4 py-3 border-b border-gray-100 dark:border-gray-700/60"
          >
            <div class="flex items-center gap-2">
              <v-icon name="hi-solid-clipboard-list" class="w-4 h-4 text-gray-400 dark:text-gray-500 shrink-0" />
              <h3 class="text-[13px] font-semibold text-gray-900 dark:text-white">Available Players</h3>
            </div>
          </div>

          <!-- Desktop Table -->
          <div class="hidden md:block overflow-x-auto">
            <table class="w-full">
              <thead
                class="bg-gray-50/80 dark:bg-gray-700/30 border-b border-gray-100 dark:border-gray-700/60"
              >
                <tr>
                  <th class="px-3 py-2.5 text-center text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-16"></th>
                  <th class="px-3 py-2.5 text-left text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Player</th>
                  <th class="px-3 py-2.5 text-left text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Team</th>
                  <th class="px-3 py-2.5 text-center text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Pos</th>
                  <th class="px-3 py-2.5 text-center text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total</th>
                  <th class="px-3 py-2.5 text-center text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Avg</th>
                  <th class="px-3 py-2.5 text-center text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">GP</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100 dark:divide-gray-700/60">
                <tr
                  v-for="player in players"
                  :key="player.player.uuid"
                  class="active:bg-gray-50 dark:active:bg-gray-700/50 transition-colors"
                >
                  <!-- Select Button -->
                  <td class="px-3 py-2.5">
                    <button
                      @click="handleAddPlayer(player)"
                      :disabled="isAddingPlayer(player.player.uuid) || !canPick"
                      :class="[
                        'flex items-center justify-center w-8 h-8 rounded-xl transition-all active:scale-90',
                        canPick
                          ? 'bg-blue-500 dark:bg-blue-600 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed',
                        isAddingPlayer(player.player.uuid) ? 'opacity-50 cursor-not-allowed' : '',
                      ]"
                    >
                      <v-icon
                        v-if="!canPick && !isAddingPlayer(player.player.uuid)"
                        name="hi-solid-lock-closed"
                        class="w-3.5 h-3.5"
                      />
                      <v-icon
                        v-else-if="!isAddingPlayer(player.player.uuid)"
                        name="hi-solid-plus"
                        class="w-4 h-4"
                      />
                      <v-icon v-else name="pr-spinner" class="w-3.5 h-3.5" animation="spin" />
                    </button>
                  </td>

                  <!-- Player Info -->
                  <td class="px-3 py-2.5">
                    <div class="flex items-center gap-2.5">
                      <img
                        :src="player.player.image_path || '/img/default-avatar.svg'"
                        :alt="player.player.display_name"
                        class="w-8 h-8 rounded-full object-cover border border-gray-200 dark:border-gray-600 shrink-0"
                      />
                      <div class="min-w-0">
                        <p class="text-[13px] font-medium text-gray-900 dark:text-white truncate">
                          {{ player.player.display_name }}
                        </p>
                        <p class="text-[11px] text-gray-400 dark:text-gray-500 truncate">
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
                      <span class="text-[12px] font-medium text-gray-600 dark:text-gray-400">
                        {{ player.team.short_code }}
                      </span>
                    </div>
                  </td>

                  <!-- Position -->
                  <td class="px-3 py-2.5 text-center">
                    <span
                      class="inline-flex items-center justify-center px-2 py-0.5 rounded-md text-[10px] font-bold"
                      :class="getPositionColorClass(player.position.developer_name)"
                    >
                      {{ player.position.code }}
                    </span>
                  </td>

                  <!-- Total Points -->
                  <td class="px-3 py-2.5 text-center">
                    <span class="text-[13px] font-bold text-gray-900 dark:text-white tabular-nums">
                      {{ formatNumber(player.total_points, 1) }}
                    </span>
                  </td>

                  <!-- Average Points -->
                  <td class="px-3 py-2.5 text-center">
                    <span class="text-[12px] font-semibold text-blue-600 dark:text-blue-400 tabular-nums">
                      {{ formatNumber(player.average_points, 2) }}
                    </span>
                  </td>

                  <!-- Fixtures -->
                  <td class="px-3 py-2.5 text-center">
                    <span class="text-[12px] text-gray-500 dark:text-gray-400 tabular-nums">
                      {{ player.total_fixtures ?? 0 }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Mobile Cards -->
          <div class="md:hidden divide-y divide-gray-100 dark:divide-gray-700/60">
            <div
              v-for="player in players"
              :key="player.player.uuid"
              class="px-4 py-3 active:bg-gray-50 dark:active:bg-gray-700/50 transition-colors"
            >
              <div class="flex items-center gap-3">
                <!-- Select Button -->
                <button
                  @click="handleAddPlayer(player)"
                  :disabled="isAddingPlayer(player.player.uuid) || !canPick"
                  :class="[
                    'flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-xl transition-all active:scale-90',
                    canPick
                      ? 'bg-blue-500 dark:bg-blue-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed',
                    isAddingPlayer(player.player.uuid) ? 'opacity-50 cursor-not-allowed' : '',
                  ]"
                >
                  <v-icon
                    v-if="!canPick && !isAddingPlayer(player.player.uuid)"
                    name="hi-solid-lock-closed"
                    class="w-3.5 h-3.5"
                  />
                  <v-icon
                    v-else-if="!isAddingPlayer(player.player.uuid)"
                    name="hi-solid-plus"
                    class="w-4 h-4"
                  />
                  <v-icon v-else name="pr-spinner" class="w-3.5 h-3.5" animation="spin" />
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
                    <p class="text-[13px] font-medium text-gray-900 dark:text-white truncate">
                      {{ player.player.display_name }}
                    </p>
                    <span
                      class="inline-flex items-center justify-center px-1.5 py-0.5 rounded text-[9px] font-bold shrink-0"
                      :class="getPositionColorClass(player.position.developer_name)"
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
                    <p class="text-[13px] font-bold text-gray-900 dark:text-white tabular-nums">{{ formatNumber(player.total_points, 1) }}</p>
                    <p class="text-[10px] text-gray-400 dark:text-gray-500">pts</p>
                  </div>
                  <div class="text-right">
                    <p class="text-[12px] font-semibold text-blue-600 dark:text-blue-400 tabular-nums">{{ formatNumber(player.average_points, 2) }}</p>
                    <p class="text-[10px] text-gray-400 dark:text-gray-500">avg</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Loading More Indicator -->
        <div
          v-if="isLoadingMore"
          class="py-6 flex items-center justify-center"
        >
          <v-icon
            name="pr-spinner"
            class="w-5 h-5 text-gray-300 dark:text-gray-600"
            animation="spin"
          />
        </div>

        <!-- End of List Indicator -->
        <div
          v-else-if="!hasMoreData"
          class="py-4 text-center"
        >
          <p class="text-[12px] text-gray-400 dark:text-gray-500">
            {{ players.length }} players loaded
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
        <h3 class="text-[15px] font-semibold text-gray-900 dark:text-white mb-1">
          {{
            selectedPosition === "ALL"
              ? "No players available"
              : "No players found"
          }}
        </h3>
        <p class="text-[13px] text-gray-500 dark:text-gray-400">
          {{
            selectedPosition === "ALL"
              ? "There are no players available for draft at this moment."
              : `No ${selectedPosition.toLowerCase()} players available for draft.`
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

  <!-- Spacer on mobile so content doesn't hide behind persistent bottom sheet peek -->
  <div class="md:hidden h-20" />

  <!-- Team Drawer -->
  <DraftTeamDrawer
    v-model="showTeamDrawer"
    :fantasy-league-uuid="leagueUuid"
    :refresh-key="teamRefreshKey"
  />
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
import { SearchableSelectComponent } from "@/components/ui";
import DraftOrderCarousel from "@/components/fantasy/draft/DraftOrderCarousel.vue";
import DraftTeamDrawer from "@/components/fantasy/draft/DraftTeamDrawer.vue";
import { useToast } from "@/composables/useToast";
import { useDraftChannel } from "@/composables/useDraftChannel";
import { useUserStore } from "@/store"; // ya lo tienes en useAblyBroadcast

const userStore = useUserStore();

interface Props {
  fantasyLeagueUuid?: string;
}

const props = defineProps<Props>();

// 2. Inicializar el composable (después de definir leagueUuid computed)
const {
  currentTurn,
  isMyTurn,
  isDraftComplete,
  setInitialTurn,
  onPlayerPicked,
  onDraftActivated,
  onTurnSkipped,
  onAutoSkip,
} = useDraftChannel(
  props.fantasyLeagueUuid ?? "",
  userStore.getUserData?.uuid ?? "",
);

onTurnSkipped((payload) => {
  toast.warning(
    "Turn Skipped",
    `${payload.skipped_user_name} was not connected. Turn skipped.`,
    { duration: 3000 }
  );
}); 

// Auto-skip: triggered when a disconnected user's turn arrives (presence check)
onAutoSkip(async (turnUserName: string) => {
  if (!leagueUuid.value) return;
  const turnBeforeSkip = currentTurn.value?.pick;
  toast.warning(
    "Player Disconnected",
    `${turnUserName} is not in the draft room. Skipping turn...`,
    { duration: 4000 },
  );
  try {
    await fantasyLeagueService.skipDraftTurn(leagueUuid.value);
  } catch (err: unknown) {
    console.error("[Draft] Error auto-skipping disconnected user:", err);
  }
  // Polling fallback
  setTimeout(async () => {
    if (currentTurn.value?.pick === turnBeforeSkip && !isDraftComplete.value) {
      await pollCurrentTurn();
    }
  }, 3000);
});

// 3. Registrar callbacks
// Cuando otro usuario pickea → eliminar el jugador de la lista local
onPlayerPicked((payload) => {
  players.value = players.value.filter(
    (p) => p.player.uuid !== payload.player_uuid,
  );
  // Refresh team drawer data (useful if drawer is open)
  teamRefreshKey.value++;
});

// Cuando el admin activa el draft estando ya en la sala
onDraftActivated(() => {
  toast.info("Draft Started!", "The draft has been activated. Good luck! 🏆");
});

// 4. Computed: ¿puede el usuario actual seleccionar jugadores?
const canPick = computed(() => isMyTurn.value && !isDraftComplete.value);

// 5. Watch: notificar al usuario cuando sea su turno (via Ably real-time)
watch(isMyTurn, (newVal, oldVal) => {
  if (newVal && !oldVal && !isDraftComplete.value) {
    toast.success(
      "It's your turn!",
      "Select a player from the list below",
      { duration: 5000 },
    );
    // Try to play a notification sound
    try {
      const audio = new Audio("/sounds/turn-notification.mp3");
      audio.volume = 0.5;
      audio.play().catch(() => { /* browser may block autoplay */ });
    } catch { /* sound file may not exist */ }
  }
});

// 6. Watch: notificar cuando el draft se completa
// Cuando el draft se completa, persistir en BD
watch(isDraftComplete, async (isComplete) => {
  if (isComplete && leagueUuid.value) {
    try {
      await fantasyLeagueService.completeDraft(leagueUuid.value)
      toast.success('Draft Completed!', 'All picks have been made. The draft is now complete. 🎉')
    } catch (error) {
      console.error('[Draft] Error completing draft:', error)
    }
  }
})

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
const selectedTeam = ref<string>("ALL");
const teams = ref<FootballTeamResponse[]>([]);
const slotType = ref<string>("STARTER");
const initialLoadComplete = ref(false);
const showTeamDrawer = ref(false);
const teamRefreshKey = ref(0);
let observer: IntersectionObserver | null = null;

// Composables
const toast = useToast();

// ═══════════ STANDALONE DRAFT TIMER (independent of carousel) ═══════════
const draftTimeRemaining = ref(0);
const draftTimerExpired = ref(false);
let draftTimerInterval: ReturnType<typeof setInterval> | null = null;

const draftPickTime = computed(() => league.value?.draft?.pick_time ?? 0);

const draftFormattedTime = computed(() => {
  const t = draftTimeRemaining.value;
  if (t <= 0) return "0";
  if (t >= 60) {
    const m = Math.floor(t / 60);
    const s = t % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  }
  return String(t);
});

const draftTimerProgress = computed(() => {
  if (!draftPickTime.value || draftPickTime.value <= 0) return 0;
  return draftTimeRemaining.value / draftPickTime.value;
});

const draftTimerUrgency = computed<"normal" | "warning" | "critical">(() => {
  const pct = draftTimerProgress.value;
  if (pct <= 0.15) return "critical";
  if (pct <= 0.35) return "warning";
  return "normal";
});

const draftTimerBarColor = computed(() => {
  if (draftTimerUrgency.value === "critical") return "bg-red-400";
  if (draftTimerUrgency.value === "warning") return "bg-yellow-300";
  return "bg-white/80";
});

const draftTimerBannerClass = computed(() => {
  if (draftTimerExpired.value) {
    return "bg-gradient-to-r from-gray-600 to-gray-700";
  }
  if (draftTimerUrgency.value === "critical") {
    return isMyTurn.value
      ? "bg-gradient-to-r from-red-600 to-red-700 ring-2 ring-red-400 ring-offset-2 dark:ring-offset-gray-900"
      : "bg-gradient-to-r from-red-500 to-orange-500";
  }
  if (draftTimerUrgency.value === "warning") {
    return isMyTurn.value
      ? "bg-gradient-to-r from-amber-500 to-orange-500 ring-2 ring-amber-400 ring-offset-2 dark:ring-offset-gray-900"
      : "bg-gradient-to-r from-amber-500 to-yellow-500";
  }
  return isMyTurn.value
    ? "bg-gradient-to-r from-emerald-500 to-teal-500 ring-2 ring-emerald-400 ring-offset-2 dark:ring-offset-gray-900"
    : "bg-gradient-to-r from-blue-500 to-indigo-500";
});

function startDraftTimer() {
  stopDraftTimer();
  draftTimerExpired.value = false;
  if (!draftPickTime.value || draftPickTime.value <= 0 || isDraftComplete.value || !currentTurn.value) return;
  draftTimeRemaining.value = draftPickTime.value;
  draftTimerInterval = setInterval(() => {
    draftTimeRemaining.value--;
    if (draftTimeRemaining.value <= 0) {
      draftTimeRemaining.value = 0;
      draftTimerExpired.value = true;
      stopDraftTimer();
      handleTimerExpired();
    }
  }, 1000);
}

function stopDraftTimer() {
  if (draftTimerInterval) {
    clearInterval(draftTimerInterval);
    draftTimerInterval = null;
  }
}

// Restart timer whenever the current turn changes
watch(
  currentTurn,
  (newTurn) => {
    if (newTurn && !isDraftComplete.value) {
      startDraftTimer();
    } else {
      stopDraftTimer();
    }
  },
  { immediate: true },
);

// Stop timer when draft completes
watch(isDraftComplete, (done) => {
  if (done) stopDraftTimer();
});
// ═══════════ END DRAFT TIMER ═══════════

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

const selectedTeamData = computed(() => {
  if (selectedTeam.value === "ALL") return null;
  return teams.value.find((t) => t.uuid === selectedTeam.value) || null;
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
  if (!leagueUuid.value) {
    return;
  }

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

function handleFilterChange(position: string) {
  selectedPosition.value = position;
  // Reset and reload players with new filter
  loadPlayers(false);
}

/** Handle timer expiration — skip turn via API + poll fallback */
async function handleTimerExpired() {
  if (!leagueUuid.value) return;

  const turnBeforeSkip = currentTurn.value?.pick;

  if (isMyTurn.value) {
    // My turn expired — call skip immediately
    toast.warning(
      "Time's up!",
      "You lost your pick. The turn advances to the next player.",
      { duration: 5000 },
    );
    try {
      await fantasyLeagueService.skipDraftTurn(leagueUuid.value);
    } catch (err: unknown) {
      console.error("Error skipping turn:", err);
    }
  } else {
    // Not my turn — the turn user's timer expired.
    // Wait a short random delay then try skip as fallback
    toast.info(
      "Time expired",
      `${currentTurn.value?.user_name ?? "Player"} ran out of time.`,
      { duration: 3000 },
    );
    const fallbackDelay = 2000 + Math.random() * 3000;
    setTimeout(async () => {
      if (
        currentTurn.value?.pick === turnBeforeSkip &&
        !isDraftComplete.value
      ) {
        try {
          await fantasyLeagueService.skipDraftTurn(leagueUuid.value!);
        } catch {
          // Backend already processed — safe to ignore
        }
      }
    }, fallbackDelay);
  }

  // Polling fallback: if after 3s the turn hasn't changed via Ably, poll REST
  setTimeout(async () => {
    if (currentTurn.value?.pick === turnBeforeSkip && !isDraftComplete.value) {
      await pollCurrentTurn();
    }
  }, 3000);
}

/**
 * Poll the current draft turn via REST and update local state.
 * Used as a fallback when Ably events are delayed or lost.
 */
async function pollCurrentTurn() {
  if (!leagueUuid.value) return;
  try {
    const turn = await fantasyLeagueService.getCurrentDraftTurn(leagueUuid.value);
    setInitialTurn(turn);
  } catch (err: unknown) {
    console.error("[Draft] Error polling current turn:", err);
  }
}

async function handleAddPlayer(player: FantasyPlayerDraftResponse) {
  if (!canPick.value) {
    toast.warning(
      "Not your turn",
      `Waiting for ${currentTurn.value?.user_name ?? "another player"}...`,
    );
    return;
  }

  if (!leagueUuid.value || isAddingPlayer(player.player.uuid)) {
    return;
  }

  addingPlayers.value.add(player.player.uuid);

  try {
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

    players.value = players.value.filter(
      (p) => p.player.uuid !== player.player.uuid,
    );

    // Refresh team drawer and briefly show it
    teamRefreshKey.value++;
    showTeamDrawer.value = true;
  } catch (err: unknown) {
    const errorMessage =
      err instanceof Error ? err.message : "Error adding player";
    console.error("Error adding player:", errorMessage);
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
        !isLoading.value &&
        canPick.value
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

  // Check if there's a slot type in query params (BENCH, FLEX, or a starter position)
  const slotTypeFromQuery = route.query.slotType as string;
  if (slotTypeFromQuery) {
    slotType.value = slotTypeFromQuery;
  }

  await loadPlayers();

  // Mark initial load as complete
  initialLoadComplete.value = true;

  // Delay para asegurar que el DOM esté listo
  setTimeout(() => {
    setupIntersectionObserver();
  }, 1000);

  if (leagueUuid.value) {
    const initialTurn = await fantasyLeagueService.getCurrentDraftTurn(
      leagueUuid.value,
    );
    setInitialTurn(initialTurn);
  }
});

onUnmounted(() => {
  stopDraftTimer();
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

/* Hide scrollbar for filter tabs */
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

/* Fade transition for locked overlay */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
