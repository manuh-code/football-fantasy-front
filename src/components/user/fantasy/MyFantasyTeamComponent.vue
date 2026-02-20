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
          Loading your team...
        </p>
      </div>
    </div>

    <!-- Loading Rounds State -->
    <div
      v-else-if="isLoadingRounds && rounds.length === 0"
      class="flex items-center justify-center min-h-[400px]"
    >
      <div class="flex flex-col items-center gap-4">
        <v-icon
          name="pr-spinner"
          class="w-12 h-12 text-blue-600 dark:text-blue-400"
          animation="spin"
        />
        <p class="text-gray-600 dark:text-gray-400 font-medium">
          Loading rounds...
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
            Error loading team
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
            Please select a fantasy league to view your team.
          </p>
        </div>
      </div>
    </div>

    <!-- Round Selector -->
    <div v-else-if="rounds.length > 0" class="mb-6">
      <!-- Round Navigation -->
      <div
        class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
      >
        <!-- Header with navigation arrows -->
        <div
          class="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700"
        >
          <div class="flex items-center gap-2">
            <v-icon
              name="hi-solid-calendar"
              class="w-4 h-4 text-blue-500 dark:text-blue-400"
            />
            <span class="text-sm font-semibold text-gray-700 dark:text-gray-300"
              >Round</span
            >
          </div>

          <!-- Prev/Next arrows -->
          <div class="flex items-center gap-1">
            <button
              @click="selectPreviousRound"
              :disabled="!canSelectPrevious || isLoading"
              class="p-1.5 rounded-lg transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              title="Previous round"
            >
              <v-icon name="hi-solid-chevron-left" class="w-4 h-4" />
            </button>
            <button
              @click="selectNextRound"
              :disabled="!canSelectNext || isLoading"
              class="p-1.5 rounded-lg transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              title="Next round"
            >
              <v-icon name="hi-solid-chevron-right" class="w-4 h-4" />
            </button>
          </div>
        </div>

        <!-- Scrollable round chips -->
        <div
          ref="roundsScrollContainer"
          class="flex gap-2 px-4 py-3 overflow-x-auto scrollbar-hide scroll-smooth"
        >
          <button
            v-for="round in rounds"
            :key="round.uuid"
            :ref="
              (el) => {
                if (round.uuid === selectedRoundUuid)
                  selectedRoundEl = el as HTMLElement;
              }
            "
            @click="selectedRoundUuid = round.uuid"
            :disabled="isLoading"
            class="relative flex-shrink-0 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 border disabled:opacity-50 disabled:cursor-not-allowed"
            :class="[
              round.uuid === selectedRoundUuid
                ? round.is_current
                  ? 'bg-blue-500 text-white border-blue-500 shadow-md shadow-blue-500/25'
                  : round.is_completed
                    ? 'bg-green-500 text-white border-green-500 shadow-md shadow-green-500/25'
                    : 'bg-gray-800 dark:bg-white text-white dark:text-gray-900 border-gray-800 dark:border-white shadow-md'
                : round.is_current
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/30'
                  : round.is_completed
                    ? 'bg-gray-50 dark:bg-gray-700/30 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                    : 'bg-white dark:bg-gray-700/20 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/40',
            ]"
          >
            <!-- Current round indicator dot -->
            <span
              v-if="round.is_current && round.uuid !== selectedRoundUuid"
              class="absolute -top-1 -right-1 w-2.5 h-2.5 bg-blue-500 rounded-full border-2 border-white dark:border-gray-800 animate-pulse"
            ></span>

            <div class="flex items-center gap-1.5">
              <v-icon
                v-if="round.is_completed"
                name="hi-solid-check-circle"
                class="w-3 h-3"
                :class="
                  round.uuid === selectedRoundUuid
                    ? 'text-white/80'
                    : 'text-green-400 dark:text-green-500'
                "
              />
              {{ extractRoundLabel(round.round.name) }}
            </div>
          </button>
        </div>

        <!-- Selected round detail bar -->
        <div
          v-if="selectedRound"
          class="flex items-center justify-between px-4 py-2.5 bg-gray-50 dark:bg-gray-700/30 border-t border-gray-100 dark:border-gray-700"
        >
          <div class="flex items-center gap-2 min-w-0">
            <span
              class="text-sm font-medium text-gray-900 dark:text-white truncate"
              >{{ selectedRound.round.name }}</span
            >
            <span
              v-if="selectedRound.is_current"
              class="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-[10px] font-bold rounded-full whitespace-nowrap"
            >
              <span
                class="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"
              ></span>
              LIVE
            </span>
            <span
              v-else-if="selectedRound.is_completed"
              class="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-[10px] font-bold rounded-full whitespace-nowrap"
            >
              <v-icon name="hi-solid-check" class="w-2.5 h-2.5" />
              DONE
            </span>
          </div>
          <span
            v-if="selectedRound.round.starting_at"
            class="text-[11px] text-gray-500 dark:text-gray-400 whitespace-nowrap ml-2"
          >
            {{ formatRoundDate(selectedRound.round.starting_at) }}
          </span>
        </div>

        <!-- Loading indicators -->
        <div
          v-if="isLoadingRounds"
          class="px-4 py-3 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400"
        >
          <v-icon name="pr-spinner" class="w-4 h-4" animation="spin" />
          <span>Loading rounds...</span>
        </div>
        <div
          v-else-if="isLoading"
          class="px-4 py-2 flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500 border-t border-gray-100 dark:border-gray-700"
        >
          <v-icon name="pr-spinner" class="w-3 h-3" animation="spin" />
          <span>Loading lineup...</span>
        </div>
      </div>

      <!-- Fantasy Team Display -->
      <div class="mt-6">
        <!-- Starters Section -->
        <div
          class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-6 overflow-hidden"
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
              <button
                @click="goToDraftPlayers"
                class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-medium rounded-lg backdrop-blur-sm transition-all duration-200 border border-white/30 hover:border-white/50"
                title="View available players to draft"
              >
                <v-icon name="hi-solid-user-add" class="w-3.5 h-3.5" />
                <span class="hidden sm:inline">Add Players</span>
                <span class="sm:hidden">Add</span>
              </button>
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
                    league?.formation?.goalkeeper &&
                    league.formation.goalkeeper.starter > 0
                  "
                >
                  <tr
                    v-for="player in goalkeepers"
                    :key="player.football_player.uuid"
                    :data-player-uuid="player.football_player.uuid"
                    :class="[
                      {
                        'player-highlight': isHighlighted(
                          player.football_player.uuid,
                        ),
                      },
                    ]"
                  >
                    <td colspan="2" class="p-0">
                      <div class="relative overflow-hidden">
                        <div
                          class="absolute inset-y-0 right-0 w-[76px] bg-red-500 flex items-center justify-center"
                        >
                          <div class="flex flex-col items-center gap-0.5">
                            <v-icon
                              name="hi-solid-trash"
                              class="w-5 h-5 text-white"
                            />
                            <span class="text-[10px] text-white font-medium"
                              >Remove</span
                            >
                          </div>
                        </div>
                        <div
                          class="relative flex items-center bg-white dark:bg-gray-800 swipe-row"
                          :style="{
                            transform: `translateX(${getSwipeOffset(player.football_player.uuid)}px)`,
                            transition: getSwipeTransition(
                              player.football_player.uuid,
                            ),
                          }"
                          @touchstart="
                            onSwipeStart(player.football_player.uuid, $event)
                          "
                          @touchmove="
                            onSwipeMove(player.football_player.uuid, $event)
                          "
                          @touchend="onSwipeEnd(player.football_player.uuid)"
                          @mousedown="
                            onSwipeStart(player.football_player.uuid, $event)
                          "
                        >
                          <div class="px-4 py-4 shrink-0">
                            <div class="flex items-center gap-2">
                              <span
                                class="inline-flex items-center justify-center min-w-[2rem] h-8 px-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-[10px] font-bold uppercase whitespace-nowrap"
                              >
                                {{
                                  getPositionShortCode(
                                    player.position.developer_name,
                                    player.position.code,
                                  )
                                }}
                              </span>
                            </div>
                          </div>
                          <div class="px-4 py-4 flex-1 min-w-0">
                            <div class="flex items-center gap-3">
                              <img
                                :src="
                                  player.football_player.image_path ||
                                  '/img/default-avatar.svg'
                                "
                                :alt="player.football_player.display_name"
                                class="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
                              />
                              <div class="flex-1 min-w-0">
                                <p
                                  class="font-semibold text-gray-900 dark:text-white text-sm md:text-base truncate"
                                >
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
                    @click="handleDraftPlayerByPosition('GOALKEEPER')"
                    class="bg-gray-50/50 dark:bg-gray-700/20 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors duration-150"
                  >
                    <td class="px-4 py-4">
                      <div class="flex items-center gap-2">
                        <span
                          class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-400 dark:text-blue-500 text-xs font-bold opacity-50"
                        >
                          GK
                        </span>
                        <span
                          class="text-xs font-medium text-gray-400 dark:text-gray-500 hidden sm:inline"
                          >Goalkeeper</span
                        >
                      </div>
                    </td>
                    <td class="px-4 py-4">
                      <div class="flex items-center gap-3">
                        <div
                          class="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gray-200 dark:bg-gray-700 border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center"
                        >
                          <v-icon
                            name="hi-solid-plus"
                            class="w-5 h-5 text-gray-400 dark:text-gray-500"
                          />
                        </div>
                        <p
                          class="text-sm text-gray-400 dark:text-gray-500 italic"
                        >
                          Click to add player
                        </p>
                      </div>
                    </td>
                  </tr>
                </template>

                <!-- Defenders -->
                <template
                  v-if="
                    league?.formation?.defender &&
                    league.formation.defender.starter > 0
                  "
                >
                  <tr
                    v-for="player in defenders"
                    :key="player.football_player.uuid"
                    :data-player-uuid="player.football_player.uuid"
                    :class="[
                      {
                        'player-highlight': isHighlighted(
                          player.football_player.uuid,
                        ),
                      },
                    ]"
                  >
                    <td colspan="2" class="p-0">
                      <div class="relative overflow-hidden">
                        <div
                          class="absolute inset-y-0 right-0 w-[76px] bg-red-500 flex items-center justify-center"
                        >
                          <div class="flex flex-col items-center gap-0.5">
                            <v-icon
                              name="hi-solid-trash"
                              class="w-5 h-5 text-white"
                            />
                            <span class="text-[10px] text-white font-medium"
                              >Remove</span
                            >
                          </div>
                        </div>
                        <div
                          class="relative flex items-center bg-white dark:bg-gray-800 swipe-row"
                          :style="{
                            transform: `translateX(${getSwipeOffset(player.football_player.uuid)}px)`,
                            transition: getSwipeTransition(
                              player.football_player.uuid,
                            ),
                          }"
                          @touchstart="
                            onSwipeStart(player.football_player.uuid, $event)
                          "
                          @touchmove="
                            onSwipeMove(player.football_player.uuid, $event)
                          "
                          @touchend="onSwipeEnd(player.football_player.uuid)"
                          @mousedown="
                            onSwipeStart(player.football_player.uuid, $event)
                          "
                        >
                          <div class="px-4 py-4 shrink-0">
                            <div class="flex items-center gap-2">
                              <span
                                class="inline-flex items-center justify-center min-w-[2rem] h-8 px-2 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[10px] font-bold uppercase whitespace-nowrap"
                              >
                                {{
                                  getPositionShortCode(
                                    player.position.developer_name,
                                    player.position.code,
                                  )
                                }}
                              </span>
                            </div>
                          </div>
                          <div class="px-4 py-4 flex-1 min-w-0">
                            <div class="flex items-center gap-3">
                              <img
                                :src="
                                  player.football_player.image_path ||
                                  '/img/default-avatar.svg'
                                "
                                :alt="player.football_player.display_name"
                                class="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
                              />
                              <div class="flex-1 min-w-0">
                                <p
                                  class="font-semibold text-gray-900 dark:text-white text-sm md:text-base truncate"
                                >
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

                  <!-- Empty Defender slots -->
                  <tr
                    v-for="slot in emptyDefenderSlots"
                    :key="`empty-def-${slot}`"
                    @click="handleDraftPlayerByPosition('DEFENDER')"
                    class="bg-gray-50/50 dark:bg-gray-700/20 cursor-pointer hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors duration-150"
                  >
                    <td class="px-4 py-4">
                      <div class="flex items-center gap-2">
                        <span
                          class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 text-green-400 dark:text-green-500 text-xs font-bold opacity-50"
                        >
                          DF
                        </span>
                        <span
                          class="text-xs font-medium text-gray-400 dark:text-gray-500 hidden sm:inline"
                          >Defender</span
                        >
                      </div>
                    </td>
                    <td class="px-4 py-4">
                      <div class="flex items-center gap-3">
                        <div
                          class="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gray-200 dark:bg-gray-700 border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center"
                        >
                          <v-icon
                            name="hi-solid-plus"
                            class="w-5 h-5 text-gray-400 dark:text-gray-500"
                          />
                        </div>
                        <p
                          class="text-sm text-gray-400 dark:text-gray-500 italic"
                        >
                          Click to add player
                        </p>
                      </div>
                    </td>
                  </tr>
                </template>

                <!-- Midfielders -->
                <template
                  v-if="
                    league?.formation?.midfielder &&
                    league.formation.midfielder.starter > 0
                  "
                >
                  <tr
                    v-for="player in midfielders"
                    :key="player.football_player.uuid"
                    :data-player-uuid="player.football_player.uuid"
                    :class="[
                      {
                        'player-highlight': isHighlighted(
                          player.football_player.uuid,
                        ),
                      },
                    ]"
                  >
                    <td colspan="2" class="p-0">
                      <div class="relative overflow-hidden">
                        <div
                          class="absolute inset-y-0 right-0 w-[76px] bg-red-500 flex items-center justify-center"
                        >
                          <div class="flex flex-col items-center gap-0.5">
                            <v-icon
                              name="hi-solid-trash"
                              class="w-5 h-5 text-white"
                            />
                            <span class="text-[10px] text-white font-medium"
                              >Remove</span
                            >
                          </div>
                        </div>
                        <div
                          class="relative flex items-center bg-white dark:bg-gray-800 swipe-row"
                          :style="{
                            transform: `translateX(${getSwipeOffset(player.football_player.uuid)}px)`,
                            transition: getSwipeTransition(
                              player.football_player.uuid,
                            ),
                          }"
                          @touchstart="
                            onSwipeStart(player.football_player.uuid, $event)
                          "
                          @touchmove="
                            onSwipeMove(player.football_player.uuid, $event)
                          "
                          @touchend="onSwipeEnd(player.football_player.uuid)"
                          @mousedown="
                            onSwipeStart(player.football_player.uuid, $event)
                          "
                        >
                          <div class="px-4 py-4 shrink-0">
                            <div class="flex items-center gap-2">
                              <span
                                class="inline-flex items-center justify-center min-w-[2rem] h-8 px-2 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-[10px] font-bold uppercase whitespace-nowrap"
                              >
                                {{
                                  getPositionShortCode(
                                    player.position.developer_name,
                                    player.position.code,
                                  )
                                }}
                              </span>
                            </div>
                          </div>
                          <div class="px-4 py-4 flex-1 min-w-0">
                            <div class="flex items-center gap-3">
                              <img
                                :src="
                                  player.football_player.image_path ||
                                  '/img/default-avatar.svg'
                                "
                                :alt="player.football_player.display_name"
                                class="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
                              />
                              <div class="flex-1 min-w-0">
                                <p
                                  class="font-semibold text-gray-900 dark:text-white text-sm md:text-base truncate"
                                >
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

                  <!-- Empty Midfielder slots -->
                  <tr
                    v-for="slot in emptyMidfielderSlots"
                    :key="`empty-mid-${slot}`"
                    @click="handleDraftPlayerByPosition('MIDFIELDER')"
                    class="bg-gray-50/50 dark:bg-gray-700/20 cursor-pointer hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition-colors duration-150"
                  >
                    <td class="px-4 py-4">
                      <div class="flex items-center gap-2">
                        <span
                          class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-400 dark:text-yellow-500 text-xs font-bold opacity-50"
                        >
                          MF
                        </span>
                        <span
                          class="text-xs font-medium text-gray-400 dark:text-gray-500 hidden sm:inline"
                          >Midfielder</span
                        >
                      </div>
                    </td>
                    <td class="px-4 py-4">
                      <div class="flex items-center gap-3">
                        <div
                          class="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gray-200 dark:bg-gray-700 border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center"
                        >
                          <v-icon
                            name="hi-solid-plus"
                            class="w-5 h-5 text-gray-400 dark:text-gray-500"
                          />
                        </div>
                        <p
                          class="text-sm text-gray-400 dark:text-gray-500 italic"
                        >
                          Click to add player
                        </p>
                      </div>
                    </td>
                  </tr>
                </template>

                <!-- Attackers -->
                <template
                  v-if="
                    league?.formation?.attacker &&
                    league.formation.attacker.starter > 0
                  "
                >
                  <tr
                    v-for="player in attackers"
                    :key="player.football_player.uuid"
                    :data-player-uuid="player.football_player.uuid"
                    :class="[
                      {
                        'player-highlight': isHighlighted(
                          player.football_player.uuid,
                        ),
                      },
                    ]"
                  >
                    <td colspan="2" class="p-0">
                      <div class="relative overflow-hidden">
                        <div
                          class="absolute inset-y-0 right-0 w-[76px] bg-red-500 flex items-center justify-center"
                        >
                          <div class="flex flex-col items-center gap-0.5">
                            <v-icon
                              name="hi-solid-trash"
                              class="w-5 h-5 text-white"
                            />
                            <span class="text-[10px] text-white font-medium"
                              >Remove</span
                            >
                          </div>
                        </div>
                        <div
                          class="relative flex items-center bg-white dark:bg-gray-800 swipe-row"
                          :style="{
                            transform: `translateX(${getSwipeOffset(player.football_player.uuid)}px)`,
                            transition: getSwipeTransition(
                              player.football_player.uuid,
                            ),
                          }"
                          @touchstart="
                            onSwipeStart(player.football_player.uuid, $event)
                          "
                          @touchmove="
                            onSwipeMove(player.football_player.uuid, $event)
                          "
                          @touchend="onSwipeEnd(player.football_player.uuid)"
                          @mousedown="
                            onSwipeStart(player.football_player.uuid, $event)
                          "
                        >
                          <div class="px-4 py-4 shrink-0">
                            <div class="flex items-center gap-2">
                              <span
                                class="inline-flex items-center justify-center min-w-[2rem] h-8 px-2 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-[10px] font-bold uppercase whitespace-nowrap"
                              >
                                {{
                                  getPositionShortCode(
                                    player.position.developer_name,
                                    player.position.code,
                                  )
                                }}
                              </span>
                            </div>
                          </div>
                          <div class="px-4 py-4 flex-1 min-w-0">
                            <div class="flex items-center gap-3">
                              <img
                                :src="
                                  player.football_player.image_path ||
                                  '/img/default-avatar.svg'
                                "
                                :alt="player.football_player.display_name"
                                class="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
                              />
                              <div class="flex-1 min-w-0">
                                <p
                                  class="font-semibold text-gray-900 dark:text-white text-sm md:text-base truncate"
                                >
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

                  <!-- Empty Attacker slots -->
                  <tr
                    v-for="slot in emptyAttackerSlots"
                    :key="`empty-att-${slot}`"
                    @click="handleDraftPlayerByPosition('ATTACKER')"
                    class="bg-gray-50/50 dark:bg-gray-700/20 cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-150"
                  >
                    <td class="px-4 py-4">
                      <div class="flex items-center gap-2">
                        <span
                          class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 text-red-400 dark:text-red-500 text-xs font-bold opacity-50"
                        >
                          FW
                        </span>
                        <span
                          class="text-xs font-medium text-gray-400 dark:text-gray-500 hidden sm:inline"
                          >Forward</span
                        >
                      </div>
                    </td>
                    <td class="px-4 py-4">
                      <div class="flex items-center gap-3">
                        <div
                          class="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gray-200 dark:bg-gray-700 border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center"
                        >
                          <v-icon
                            name="hi-solid-plus"
                            class="w-5 h-5 text-gray-400 dark:text-gray-500"
                          />
                        </div>
                        <p
                          class="text-sm text-gray-400 dark:text-gray-500 italic"
                        >
                          Click to add player
                        </p>
                      </div>
                    </td>
                  </tr>
                </template>

                <!-- Flex -->
                <template
                  v-if="league?.formation?.flex && league.formation.flex > 0"
                >
                  <tr
                    v-for="player in flexPlayers"
                    :key="player.football_player.uuid"
                    :data-player-uuid="player.football_player.uuid"
                    :class="[
                      {
                        'player-highlight': isHighlighted(
                          player.football_player.uuid,
                        ),
                      },
                    ]"
                  >
                    <td colspan="2" class="p-0">
                      <div class="relative overflow-hidden">
                        <div
                          class="absolute inset-y-0 right-0 w-[76px] bg-red-500 flex items-center justify-center"
                        >
                          <div class="flex flex-col items-center gap-0.5">
                            <v-icon
                              name="hi-solid-trash"
                              class="w-5 h-5 text-white"
                            />
                            <span class="text-[10px] text-white font-medium"
                              >Remove</span
                            >
                          </div>
                        </div>
                        <div
                          class="relative flex items-center bg-white dark:bg-gray-800 swipe-row"
                          :style="{
                            transform: `translateX(${getSwipeOffset(player.football_player.uuid)}px)`,
                            transition: getSwipeTransition(
                              player.football_player.uuid,
                            ),
                          }"
                          @touchstart="
                            onSwipeStart(player.football_player.uuid, $event)
                          "
                          @touchmove="
                            onSwipeMove(player.football_player.uuid, $event)
                          "
                          @touchend="onSwipeEnd(player.football_player.uuid)"
                          @mousedown="
                            onSwipeStart(player.football_player.uuid, $event)
                          "
                        >
                          <div class="px-4 py-4 shrink-0">
                            <div class="flex items-center gap-2">
                              <span
                                class="inline-flex items-center justify-center min-w-[2rem] h-8 px-2 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-[10px] font-bold uppercase whitespace-nowrap"
                              >
                                {{
                                  getPositionShortCode(
                                    player.position.developer_name,
                                    player.position.code,
                                  )
                                }}
                              </span>
                            </div>
                          </div>
                          <div class="px-4 py-4 flex-1 min-w-0">
                            <div class="flex items-center gap-3">
                              <img
                                :src="
                                  player.football_player.image_path ||
                                  '/img/default-avatar.svg'
                                "
                                :alt="player.football_player.display_name"
                                class="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
                              />
                              <div class="flex-1 min-w-0">
                                <p
                                  class="font-semibold text-gray-900 dark:text-white text-sm md:text-base truncate"
                                >
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

                  <!-- Empty Flex slots -->
                  <tr
                    v-for="slot in emptyFlexSlots"
                    :key="`empty-flex-${slot}`"
                    @click="handleDraftPlayerByPosition('FLEX')"
                    class="bg-gray-50/50 dark:bg-gray-700/20 cursor-pointer hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors duration-150"
                  >
                    <td class="px-4 py-4">
                      <div class="flex items-center gap-2">
                        <span
                          class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-400 dark:text-purple-500 text-xs font-bold opacity-50"
                        >
                          FX
                        </span>
                        <span
                          class="text-xs font-medium text-gray-400 dark:text-gray-500 hidden sm:inline"
                          >Flex</span
                        >
                      </div>
                    </td>
                    <td class="px-4 py-4">
                      <div class="flex items-center gap-3">
                        <div
                          class="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gray-200 dark:bg-gray-700 border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center"
                        >
                          <v-icon
                            name="hi-solid-plus"
                            class="w-5 h-5 text-gray-400 dark:text-gray-500"
                          />
                        </div>
                        <p
                          class="text-sm text-gray-400 dark:text-gray-500 italic"
                        >
                          Click to add player
                        </p>
                      </div>
                    </td>
                  </tr>
                </template>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Bench Section -->
        <div
          class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
        >
          <!-- Section Header -->
          <div
            class="bg-gradient-to-r from-gray-600 to-gray-700 px-4 md:px-6 py-3"
          >
            <h3 class="text-lg font-bold text-white flex items-center gap-2">
              <v-icon name="hi-solid-users" class="w-5 h-5" />
              Bench
            </h3>
          </div>

          <!-- Bench Table -->
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
                <template
                  v-if="league?.formation?.bench && league.formation.bench > 0"
                >
                  <tr
                    v-for="player in benchPlayers"
                    :key="player.football_player.uuid"
                    :data-player-uuid="player.football_player.uuid"
                    :class="[
                      {
                        'player-highlight': isHighlighted(
                          player.football_player.uuid,
                        ),
                      },
                    ]"
                  >
                    <td colspan="2" class="p-0">
                      <div class="relative overflow-hidden">
                        <div
                          class="absolute inset-y-0 right-0 w-[76px] bg-red-500 flex items-center justify-center"
                        >
                          <div class="flex flex-col items-center gap-0.5">
                            <v-icon
                              name="hi-solid-trash"
                              class="w-5 h-5 text-white"
                            />
                            <span class="text-[10px] text-white font-medium"
                              >Remove</span
                            >
                          </div>
                        </div>
                        <div
                          class="relative flex items-center bg-white dark:bg-gray-800 swipe-row"
                          :style="{
                            transform: `translateX(${getSwipeOffset(player.football_player.uuid)}px)`,
                            transition: getSwipeTransition(
                              player.football_player.uuid,
                            ),
                          }"
                          @touchstart="
                            onSwipeStart(player.football_player.uuid, $event)
                          "
                          @touchmove="
                            onSwipeMove(player.football_player.uuid, $event)
                          "
                          @touchend="onSwipeEnd(player.football_player.uuid)"
                          @mousedown="
                            onSwipeStart(player.football_player.uuid, $event)
                          "
                        >
                          <div class="px-4 py-4 shrink-0">
                            <div class="flex items-center gap-2">
                              <span
                                class="inline-flex items-center justify-center min-w-[2rem] h-8 px-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-[10px] font-bold uppercase whitespace-nowrap"
                              >
                                {{
                                  getPositionShortCode(
                                    player.position.developer_name,
                                    player.position.code,
                                  )
                                }}
                              </span>
                            </div>
                          </div>
                          <div class="px-4 py-4 flex-1 min-w-0">
                            <div class="flex items-center gap-3">
                              <img
                                :src="
                                  player.football_player.image_path ||
                                  '/img/default-avatar.svg'
                                "
                                :alt="player.football_player.display_name"
                                class="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
                              />
                              <div class="flex-1 min-w-0">
                                <p
                                  class="font-semibold text-gray-900 dark:text-white text-sm md:text-base truncate"
                                >
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

                  <!-- Empty bench slots -->
                  <tr
                    v-for="slot in emptyBenchSlots"
                    :key="`empty-${slot}`"
                    @click="handleDraftPlayerByPosition('BENCH')"
                    class="bg-gray-50/50 dark:bg-gray-700/20 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600/30 transition-colors duration-150"
                  >
                    <td class="px-4 py-4">
                      <div class="flex items-center gap-2">
                        <span
                          class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 text-xs font-bold"
                        >
                          BN
                        </span>
                      </div>
                    </td>
                    <td class="px-4 py-4">
                      <div class="flex items-center gap-3">
                        <div
                          class="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gray-200 dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center"
                        >
                          <v-icon
                            name="hi-solid-plus"
                            class="w-5 h-5 text-gray-400 dark:text-gray-500"
                          />
                        </div>
                        <p
                          class="text-sm text-gray-400 dark:text-gray-500 italic"
                        >
                          Click to add player
                        </p>
                      </div>
                    </td>
                  </tr>
                </template>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- No Rounds Available -->
    <div
      v-else-if="!isLoadingRounds && rounds.length === 0"
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
            No rounds available
          </h3>
          <p class="text-sm text-yellow-700 dark:text-yellow-300">
            There are no rounds configured for this fantasy league yet.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useUserStore } from "@/store/user/useUserStore";
import { FantasyFootballPlayersResponse } from "@/interfaces/user/fantasy/FantasyFootballPlayersResponse";
import { FantasyRoundResponse } from "@/interfaces/fantasy/rounds/FantasyRoundResponse";
import { FantasyFootballLineupPayload } from "@/interfaces/fantasy/leagues/FantasyFootballLineupPayload";
import { FantasyLeaguesResponse } from "@/interfaces/fantasy/leagues/FantasyLeaguesResponse";
import { fantasyLeagueService } from "@/services/fantasy/leagues/FantasyLeagueService";

interface Props {
  fantasyLeagueUuid?: string;
}

const props = defineProps<Props>();

// Router and stores
const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

// State
const players = ref<FantasyFootballPlayersResponse[]>([]);
const rounds = ref<FantasyRoundResponse[]>([]);
const league = ref<FantasyLeaguesResponse | null>(null);
const selectedRoundUuid = ref<string | null>(null);
const isLoading = ref(false);
const isLoadingRounds = ref(true); // Start with true to prevent flash
const error = ref<string | null>(null);
const highlightedPlayerUuid = ref<string | null>(null);
const roundsScrollContainer = ref<HTMLElement | null>(null);
const selectedRoundEl = ref<HTMLElement | null>(null);

// Computed
const leagueUuid = computed(() => props.fantasyLeagueUuid);

const selectedRound = computed(
  () => rounds.value.find((r) => r.uuid === selectedRoundUuid.value) || null,
);

const selectedRoundIndex = computed(() =>
  rounds.value.findIndex((r) => r.uuid === selectedRoundUuid.value),
);

const canSelectPrevious = computed(() => selectedRoundIndex.value > 0);
const canSelectNext = computed(
  () => selectedRoundIndex.value < rounds.value.length - 1,
);

// Starters: is_starter === true AND is_flex === false, filtered by real position
const goalkeepers = computed(() =>
  players.value.filter(
    (p) =>
      p.is_starter && !p.is_flex && p.position.developer_name === "GOALKEEPER",
  ),
);

const defenders = computed(() =>
  players.value.filter(
    (p) =>
      p.is_starter && !p.is_flex && p.position.developer_name === "DEFENDER",
  ),
);

const midfielders = computed(() =>
  players.value.filter(
    (p) =>
      p.is_starter && !p.is_flex && p.position.developer_name === "MIDFIELDER",
  ),
);

const attackers = computed(() =>
  players.value.filter(
    (p) =>
      p.is_starter && !p.is_flex && p.position.developer_name === "ATTACKER",
  ),
);

// Flex: is_flex === true (regardless of position)
const flexPlayers = computed(() => players.value.filter((p) => p.is_flex));

// Bench: is_starter === false (and not flex)
const benchPlayers = computed(() =>
  players.value.filter((p) => !p.is_starter && !p.is_flex),
);

const emptyBenchSlots = computed(() => {
  const maxBenchSize = league.value?.formation?.bench ?? 6;
  const currentBenchSize = benchPlayers.value.length;
  return Math.max(0, maxBenchSize - currentBenchSize);
});

const emptyGoalkeeperSlots = computed(() => {
  const required = league.value?.formation?.goalkeeper?.starter ?? 1;
  return Math.max(0, required - goalkeepers.value.length);
});

const emptyDefenderSlots = computed(() => {
  const required = league.value?.formation?.defender?.starter ?? 3;
  return Math.max(0, required - defenders.value.length);
});

const emptyMidfielderSlots = computed(() => {
  const required = league.value?.formation?.midfielder?.starter ?? 4;
  return Math.max(0, required - midfielders.value.length);
});

const emptyAttackerSlots = computed(() => {
  const required = league.value?.formation?.attacker?.starter ?? 2;
  return Math.max(0, required - attackers.value.length);
});

const emptyFlexSlots = computed(() => {
  const required = league.value?.formation?.flex ?? 1;
  return Math.max(0, required - flexPlayers.value.length);
});

// Methods

/**
 * Returns a short abbreviation for a position developer_name.
 * Falls back to the first 3 characters of code if not mapped.
 */
function getPositionShortCode(developerName: string, code: string): string {
  const shortCodes: Record<string, string> = {
    GOALKEEPER: "GK",
    DEFENDER: "DEF",
    MIDFIELDER: "MID",
    ATTACKER: "FW",
    FLEX: "FX",
    BENCH: "BN",
  };
  return shortCodes[developerName] || code?.substring(0, 3) || "?";
}

function getPositionName(developerName: string): string {
  const positionNames: Record<string, string> = {
    GOALKEEPER: "Goalkeeper",
    DEFENDER: "Defender",
    MIDFIELDER: "Midfielder",
    ATTACKER: "Forward",
    FLEX: "Flex",
    BENCH: "Bench",
  };
  return positionNames[developerName] || developerName;
}

/**
 * Extract a short label from the round name (e.g. "Regular Season - 10" → "J10")
 */
function extractRoundLabel(name: string): string {
  const match = name.match(/(\d+)/);
  return match ? `J${match[1]}` : name.substring(0, 6);
}

/**
 * Format a date string to a short, readable format.
 */
function formatRoundDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString("es-MX", { day: "numeric", month: "short" });
  } catch {
    return "";
  }
}

function selectPreviousRound() {
  if (canSelectPrevious.value) {
    selectedRoundUuid.value = rounds.value[selectedRoundIndex.value - 1].uuid;
    scrollToSelectedRound();
  }
}

function selectNextRound() {
  if (canSelectNext.value) {
    selectedRoundUuid.value = rounds.value[selectedRoundIndex.value + 1].uuid;
    scrollToSelectedRound();
  }
}

function scrollToSelectedRound() {
  nextTick(() => {
    if (selectedRoundEl.value && roundsScrollContainer.value) {
      selectedRoundEl.value.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  });
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
    const errorMessage =
      err instanceof Error ? err.message : "Error loading league";
    console.error("Error loading league:", errorMessage);
  }
}

async function loadRounds() {
  if (!leagueUuid.value) {
    isLoadingRounds.value = false;
    return;
  }

  isLoadingRounds.value = true;

  try {
    rounds.value = await fantasyLeagueService.getFantasyRoundsByLeagueUuid(
      leagueUuid.value,
    );

    // Auto-select current round
    const currentRound = rounds.value.find((r) => r.is_current);
    if (currentRound) {
      selectedRoundUuid.value = currentRound.uuid;
    } else if (rounds.value.length > 0) {
      selectedRoundUuid.value = rounds.value[0].uuid;
    }

    // Scroll to selected round chip after render
    scrollToSelectedRound();
  } catch (err: unknown) {
    const errorMessage =
      err instanceof Error ? err.message : "Error loading rounds";
    console.error('Error loading rounds:', errorMessage);
  } finally {
    isLoadingRounds.value = false;
  }
}

async function loadPlayers() {
  if (!leagueUuid.value || !selectedRoundUuid.value) {
    return;
  }

  isLoading.value = true;
  error.value = null;

  try {
    const payload: FantasyFootballLineupPayload = {
      fantasy_round_uuid: selectedRoundUuid.value,
    };
    players.value = await userStore.getFantasyFootballPlayersByLeagueUuid(
      leagueUuid.value,
      payload,
    );

    // Check for highlighted player from route query
    await nextTick();
    checkHighlightPlayer();
  } catch (err: unknown) {
    const errorMessage =
      err instanceof Error ? err.message : "Error loading players";
    error.value = errorMessage;
  } finally {
    isLoading.value = false;
  }
}

function handleGoToLeagues() {
  router.push({ name: "userFantasyLeague" });
}

function goToDraftPlayers() {
  if (leagueUuid.value) {
    router.push({
      name: "playersToDraft",
      params: { uuid: leagueUuid.value },
    });
  }
}

function handleDraftPlayerByPosition(position: string) {
  if (!leagueUuid.value) return;
  router.push({
    name: "playersToDraft",
    params: { uuid: leagueUuid.value },
    query: {
      position: position === "BENCH" || position === "FLEX" ? "ALL" : position,
      slotType: position,
    },
  });
}

/**
 * Check if there's a highlightPlayer query param and apply highlight animation.
 * Scrolls to the player row and removes the query param after a delay.
 */
function checkHighlightPlayer() {
  const playerUuid = route.query.highlightPlayer as string | undefined;
  if (!playerUuid) return;

  highlightedPlayerUuid.value = playerUuid;

  // Scroll to the highlighted player row
  nextTick(() => {
    const el = document.querySelector(`[data-player-uuid="${playerUuid}"]`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  });

  // Remove highlight after animation completes and clean query param
  setTimeout(() => {
    highlightedPlayerUuid.value = null;
    // Remove highlightPlayer from query without full navigation
    const query = { ...route.query };
    delete query.highlightPlayer;
    router.replace({ query });
  }, 3000);
}

/** Check if a player should be highlighted */
function isHighlighted(playerUuid: string): boolean {
  return highlightedPlayerUuid.value === playerUuid;
}

// Swipe-to-delete state
const swipeStates = ref<
  Record<
    string,
    {
      startX: number;
      startY: number;
      offsetX: number;
      swiping: boolean;
      open: boolean;
    }
  >
>({});
const SWIPE_THRESHOLD = -60;
const SWIPE_ACTION_WIDTH = 76;

function getSwipeOffset(uuid: string): number {
  const state = swipeStates.value[uuid];
  if (!state) return 0;
  if (state.swiping)
    return Math.min(0, Math.max(-SWIPE_ACTION_WIDTH, state.offsetX));
  return state.open ? -SWIPE_ACTION_WIDTH : 0;
}

function getSwipeTransition(uuid: string): string {
  const state = swipeStates.value[uuid];
  if (state?.swiping) return "none";
  return "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)";
}

function onSwipeStart(uuid: string, e: TouchEvent | MouseEvent) {
  // Close any other open swipes
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

  // For mouse, attach global listeners so drag works even outside the element
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

  // Prevent text selection on desktop during drag
  if (!("touches" in e)) {
    e.preventDefault();
  }

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

// Watch for round changes
watch(selectedRoundUuid, () => {
  if (selectedRoundUuid.value) {
    loadPlayers();
  }
});

// Lifecycle
onMounted(async () => {
  await loadLeague();
  await loadRounds();
});
</script>

<style scoped>
/* Hide scrollbar for round chips */
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

/* Swipe-to-delete row */
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

/* Smooth transitions */
@media (prefers-reduced-motion: no-preference) {
  * {
    transition-duration: 0.2s;
  }
}

/* Responsive table */
@media (max-width: 640px) {
  table {
    font-size: 0.875rem;
  }
}

/* Highlight animation for newly added player */
@keyframes player-highlight {
  0% {
    background-color: rgba(59, 130, 246, 0.25);
    box-shadow: inset 0 0 0 2px rgba(59, 130, 246, 0.5);
  }
  50% {
    background-color: rgba(59, 130, 246, 0.1);
    box-shadow: inset 0 0 0 2px rgba(59, 130, 246, 0.25);
  }
  100% {
    background-color: transparent;
    box-shadow: none;
  }
}

.player-highlight {
  animation: player-highlight 2.5s ease-out forwards;
  border-radius: 0.5rem;
}

@media (prefers-color-scheme: dark) {
  @keyframes player-highlight {
    0% {
      background-color: rgba(59, 130, 246, 0.3);
      box-shadow: inset 0 0 0 2px rgba(96, 165, 250, 0.5);
    }
    50% {
      background-color: rgba(59, 130, 246, 0.15);
      box-shadow: inset 0 0 0 2px rgba(96, 165, 250, 0.25);
    }
    100% {
      background-color: transparent;
      box-shadow: none;
    }
  }
}
</style>
