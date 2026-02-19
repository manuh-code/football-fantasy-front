<template>
  <div class="w-full">
    <!-- Loading State -->
    <div v-if="isLoading && players.length === 0" class="flex items-center justify-center min-h-[400px]">
      <div class="flex flex-col items-center gap-4">
        <v-icon name="pr-spinner" class="w-12 h-12 text-blue-600 dark:text-blue-400" animation="spin" />
        <p class="text-gray-600 dark:text-gray-400 font-medium">Loading your team...</p>
      </div>
    </div>

    <!-- Loading Rounds State -->
    <div v-else-if="isLoadingRounds && rounds.length === 0" class="flex items-center justify-center min-h-[400px]">
      <div class="flex flex-col items-center gap-4">
        <v-icon name="pr-spinner" class="w-12 h-12 text-blue-600 dark:text-blue-400" animation="spin" />
        <p class="text-gray-600 dark:text-gray-400 font-medium">Loading rounds...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-xl p-6">
      <div class="flex items-center gap-3">
        <v-icon name="hi-solid-exclamation-circle" class="w-8 h-8 text-red-600 dark:text-red-400" />
        <div>
          <h3 class="text-lg font-semibold text-red-900 dark:text-red-100">Error loading team</h3>
          <p class="text-sm text-red-700 dark:text-red-300">{{ error }}</p>
        </div>
      </div>
    </div>

    <!-- No League Selected -->
    <div v-else-if="!leagueUuid" class="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-900/30 rounded-xl p-6">
      <div class="flex items-center gap-3">
        <v-icon name="hi-solid-information-circle" class="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
        <div>
          <h3 class="text-lg font-semibold text-yellow-900 dark:text-yellow-100">No fantasy league selected</h3>
          <p class="text-sm text-yellow-700 dark:text-yellow-300">Please select a fantasy league to view your team.</p>
        </div>
      </div>
    </div>

    <!-- Round Selector -->
    <div v-else-if="rounds.length > 0" class="mb-6">
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <!-- Mobile Header -->
        <div class="sm:hidden bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-3">
          <div class="flex items-center gap-2">
            <v-icon name="hi-solid-calendar" class="w-5 h-5 text-white" />
            <span class="text-sm font-semibold text-white">Select Round</span>
          </div>
        </div>

        <!-- Content -->
        <div class="p-4 sm:p-6">
          <!-- Desktop Header -->
          <div class="hidden sm:flex items-center gap-3 mb-4">
            <div class="p-2.5 bg-blue-50 dark:bg-blue-900/30 rounded-xl">
              <v-icon name="hi-solid-calendar" class="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 class="text-base font-semibold text-gray-900 dark:text-white">Select Round</h3>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Choose a round to view your lineup</p>
            </div>
          </div>

          <!-- Select Container -->
          <div class="relative">
            <select
              v-model="selectedRoundUuid"
              class="w-full px-4 py-3.5 pr-12 bg-gray-50 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white text-sm sm:text-base font-medium focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 focus:bg-white dark:focus:bg-gray-700 transition-all duration-200 appearance-none cursor-pointer hover:border-blue-300 dark:hover:border-blue-500 hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="isLoadingRounds || isLoading"
            >
              <option v-for="round in rounds" :key="round.uuid" :value="round.uuid">
                {{ round.round.name }}
                <template v-if="round.is_current"> 🔵 Current</template>
                <template v-if="round.is_completed"> ✓ Completed</template>
              </option>
            </select>
            
            <!-- Custom Icon -->
            <div class="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
              <v-icon 
                name="hi-solid-chevron-down" 
                class="w-5 h-5 transition-transform duration-200"
                :class="isLoadingRounds || isLoading ? 'text-gray-300 dark:text-gray-600' : 'text-blue-500 dark:text-blue-400'" 
              />
            </div>
          </div>

          <!-- Round Info Badges -->
          <div v-if="selectedRoundUuid && !isLoadingRounds" class="mt-3 flex flex-wrap items-center gap-2">
            <template v-for="round in rounds" :key="round.uuid">
              <template v-if="round.uuid === selectedRoundUuid">
                <div v-if="round.is_current" class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-full">
                  <div class="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span class="text-xs font-semibold text-blue-700 dark:text-blue-300">Current Round</span>
                </div>
                <div v-if="round.is_completed" class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-full">
                  <v-icon name="hi-solid-check-circle" class="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                  <span class="text-xs font-semibold text-green-700 dark:text-green-300">Completed</span>
                </div>
                <div v-if="!round.is_current && !round.is_completed" class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-full">
                  <v-icon name="hi-solid-clock" class="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
                  <span class="text-xs font-semibold text-gray-600 dark:text-gray-400">Upcoming</span>
                </div>
              </template>
            </template>
          </div>

          <!-- Loading indicator -->
          <div v-if="isLoadingRounds" class="mt-3 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <v-icon name="pr-spinner" class="w-4 h-4" animation="spin" />
            <span>Loading rounds...</span>
          </div>

          <!-- Loading players indicator -->
          <div v-if="isLoading && !isLoadingRounds" class="mt-3 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <v-icon name="pr-spinner" class="w-4 h-4" animation="spin" />
            <span>Loading lineup...</span>
          </div>
        </div>
      </div>

      <!-- Fantasy Team Display -->
      <div v-if="players.length > 0" class="mt-6">
    

      <!-- Starters Section -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-6 overflow-hidden">
        <!-- Section Header -->
        <div class="bg-gradient-to-r from-emerald-600 to-green-600 px-4 md:px-6 py-3">
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
            <thead class="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-600">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Position
                </th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Player
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
              <!-- Goalkeeper -->
              <template v-if="league?.formation?.goalkeeper && league.formation.goalkeeper.starter > 0">
              <tr v-for="player in goalkeepers" :key="player.football_player.uuid" 
                  class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150">
                <td class="px-4 py-4">
                  <div class="flex items-center gap-2">
                    <span class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-bold">
                      {{ player.position.code }}
                    </span>
                  </div>
                </td>
                <td class="px-4 py-4">
                  <div class="flex items-center gap-3">
                    <img 
                      :src="player.football_player.image_path || '/img/default-avatar.svg'" 
                      :alt="player.football_player.display_name"
                      class="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
                    />
                    <div>
                      <p class="font-semibold text-gray-900 dark:text-white text-sm md:text-base">
                        {{ player.football_player.display_name }}
                      </p>
                    </div>
                  </div>
                </td>
              </tr>

              <!-- Empty Goalkeeper slots -->
              <tr v-for="slot in emptyGoalkeeperSlots" :key="`empty-gk-${slot}`"
                  @click="handleDraftPlayerByPosition('GOALKEEPER')"
                  class="bg-gray-50/50 dark:bg-gray-700/20 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors duration-150">
                <td class="px-4 py-4">
                  <div class="flex items-center gap-2">
                    <span class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-400 dark:text-blue-500 text-xs font-bold opacity-50">
                      GK
                    </span>
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
              <template v-if="league?.formation?.defender && league.formation.defender.starter > 0">
              <tr v-for="player in defenders" :key="player.football_player.uuid" 
                  class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150">
                <td class="px-4 py-4">
                  <div class="flex items-center gap-2">
                    <span class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold">
                      {{ player.position.code }}
                    </span>
                  </div>
                </td>
                <td class="px-4 py-4">
                  <div class="flex items-center gap-3">
                    <img 
                      :src="player.football_player.image_path || '/img/default-avatar.svg'" 
                      :alt="player.football_player.display_name"
                      class="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
                    />
                    <div>
                      <p class="font-semibold text-gray-900 dark:text-white text-sm md:text-base">
                        {{ player.football_player.display_name }}
                      </p>
                    </div>
                  </div>
                </td>
              </tr>

              <!-- Empty Defender slots -->
              <tr v-for="slot in emptyDefenderSlots" :key="`empty-def-${slot}`"
                  @click="handleDraftPlayerByPosition('DEFENDER')"
                  class="bg-gray-50/50 dark:bg-gray-700/20 cursor-pointer hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors duration-150">
                <td class="px-4 py-4">
                  <div class="flex items-center gap-2">
                    <span class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 text-green-400 dark:text-green-500 text-xs font-bold opacity-50">
                      DF
                    </span>
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
              <template v-if="league?.formation?.midfielder && league.formation.midfielder.starter > 0">
              <tr v-for="player in midfielders" :key="player.football_player.uuid" 
                  class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150">
                <td class="px-4 py-4">
                  <div class="flex items-center gap-2">
                    <span class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-xs font-bold">
                      {{ player.position.code }}
                    </span>
                  </div>
                </td>
                <td class="px-4 py-4">
                  <div class="flex items-center gap-3">
                    <img 
                      :src="player.football_player.image_path || '/img/default-avatar.svg'" 
                      :alt="player.football_player.display_name"
                      class="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
                    />
                    <div>
                      <p class="font-semibold text-gray-900 dark:text-white text-sm md:text-base">
                        {{ player.football_player.display_name }}
                      </p>
                    </div>
                  </div>
                </td>
              </tr>

              <!-- Empty Midfielder slots -->
              <tr v-for="slot in emptyMidfielderSlots" :key="`empty-mid-${slot}`"
                  @click="handleDraftPlayerByPosition('MIDFIELDER')"
                  class="bg-gray-50/50 dark:bg-gray-700/20 cursor-pointer hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition-colors duration-150">
                <td class="px-4 py-4">
                  <div class="flex items-center gap-2">
                    <span class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-400 dark:text-yellow-500 text-xs font-bold opacity-50">
                      MF
                    </span>
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
              <template v-if="league?.formation?.attacker && league.formation.attacker.starter > 0">
              <tr v-for="player in attackers" :key="player.football_player.uuid" 
                  class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150">
                <td class="px-4 py-4">
                  <div class="flex items-center gap-2">
                    <span class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-bold">
                      {{ player.position.code }}
                    </span>
                  </div>
                </td>
                <td class="px-4 py-4">
                  <div class="flex items-center gap-3">
                    <img 
                      :src="player.football_player.image_path || '/img/default-avatar.svg'" 
                      :alt="player.football_player.display_name"
                      class="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
                    />
                    <div>
                      <p class="font-semibold text-gray-900 dark:text-white text-sm md:text-base">
                        {{ player.football_player.display_name }}
                      </p>
                    </div>
                  </div>
                </td>
              </tr>

              <!-- Empty Attacker slots -->
              <tr v-for="slot in emptyAttackerSlots" :key="`empty-att-${slot}`"
                  @click="handleDraftPlayerByPosition('ATTACKER')"
                  class="bg-gray-50/50 dark:bg-gray-700/20 cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-150">
                <td class="px-4 py-4">
                  <div class="flex items-center gap-2">
                    <span class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 text-red-400 dark:text-red-500 text-xs font-bold opacity-50">
                      FW
                    </span>
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
              <template v-if="league?.formation?.flex && league.formation.flex > 0">
              <tr v-for="player in flexPlayers" :key="player.football_player.uuid" 
                  class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150">
                <td class="px-4 py-4">
                  <div class="flex items-center gap-2">
                    <span class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-xs font-bold">
                      {{ player.position.code }}
                    </span>
                  </div>
                </td>
                <td class="px-4 py-4">
                  <div class="flex items-center gap-3">
                    <img 
                      :src="player.football_player.image_path || '/img/default-avatar.svg'" 
                      :alt="player.football_player.display_name"
                      class="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
                    />
                    <div>
                      <p class="font-semibold text-gray-900 dark:text-white text-sm md:text-base">
                        {{ player.football_player.display_name }}
                      </p>
                    </div>
                  </div>
                </td>
              </tr>

              <!-- Empty Flex slots -->
              <tr v-for="slot in emptyFlexSlots" :key="`empty-flex-${slot}`"
                  @click="handleDraftPlayerByPosition('FLEX')"
                  class="bg-gray-50/50 dark:bg-gray-700/20 cursor-pointer hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors duration-150">
                <td class="px-4 py-4">
                  <div class="flex items-center gap-2">
                    <span class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-400 dark:text-purple-500 text-xs font-bold opacity-50">
                      FX
                    </span>
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

      <!-- Bench Section -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <!-- Section Header -->
        <div class="bg-gradient-to-r from-gray-600 to-gray-700 px-4 md:px-6 py-3">
          <h3 class="text-lg font-bold text-white flex items-center gap-2">
            <v-icon name="hi-solid-users" class="w-5 h-5" />
            Bench
          </h3>
        </div>

        <!-- Bench Table -->
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-600">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Position
                </th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Player
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
              <template v-if="league?.formation?.bench && league.formation.bench > 0">
              <tr v-for="player in benchPlayers" :key="player.football_player.uuid" 
                  class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150">
                <td class="px-4 py-4">
                  <div class="flex items-center gap-2">
                    <span class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs font-bold">
                      {{ player.position.code }}
                    </span>
                  </div>
                </td>
                <td class="px-4 py-4">
                  <div class="flex items-center gap-3">
                    <img 
                      :src="player.football_player.image_path || '/img/default-avatar.svg'" 
                      :alt="player.football_player.display_name"
                      class="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
                    />
                    <div>
                      <p class="font-semibold text-gray-900 dark:text-white text-sm md:text-base">
                        {{ player.football_player.display_name }}
                      </p>
                    </div>
                  </div>
                </td>
              </tr>

              <!-- Empty bench slots -->
              <tr v-for="slot in emptyBenchSlots" :key="`empty-${slot}`"
                  @click="handleDraftPlayerByPosition('BENCH')"
                  class="bg-gray-50/50 dark:bg-gray-700/20 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600/30 transition-colors duration-150">
                <td class="px-4 py-4">
                  <div class="flex items-center gap-2">
                    <span class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 text-xs font-bold">
                      BN
                    </span>
                  </div>
                </td>
                <td class="px-4 py-4">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gray-200 dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center">
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
      </div>

      <!-- Empty State -->
      <div v-else class="mt-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
        <div class="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
          <v-icon name="hi-solid-user-group" class="w-10 h-10 text-gray-400 dark:text-gray-500" />
        </div>
        <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">No players in your team</h3>
        <p class="text-gray-600 dark:text-gray-400 mb-4">You haven't selected players for your fantasy team yet.</p>
        <div v-if="league?.formation" class="max-w-md mx-auto mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <p class="text-sm text-gray-700 dark:text-gray-300 font-medium mb-2">Required positions:</p>
          <ul class="text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <li v-if="league.formation.goalkeeper?.starter > 0">• {{ league.formation.goalkeeper.starter }} Goalkeeper(s) (GK)</li>
            <li v-if="league.formation.defender?.starter > 0">• {{ league.formation.defender.starter }} Defender(s) (DF)</li>
            <li v-if="league.formation.midfielder?.starter > 0">• {{ league.formation.midfielder.starter }} Midfielder(s) (MF)</li>
            <li v-if="league.formation.attacker?.starter > 0">• {{ league.formation.attacker.starter }} Forward(s) (FW)</li>
            <li v-if="league.formation.flex > 0">• {{ league.formation.flex }} Flex (FX)</li>
            <li v-if="league.formation.bench > 0" class="pt-2 border-t border-gray-300 dark:border-gray-600">• {{ league.formation.bench }} Bench (BN)</li>
          </ul>
        </div>
        <div class="flex flex-col sm:flex-row gap-3 justify-center">
          <button 
            @click="goToDraftPlayers"
            class="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2"
          >
            <v-icon name="hi-solid-user-add" class="w-5 h-5" />
            Draft Players
          </button>
          <button 
            @click="handleGoToLeagues"
            class="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors duration-200"
          >
            View my leagues
          </button>
        </div>
      </div>
    </div>

    <!-- No Rounds Available -->
    <div v-else-if="!isLoadingRounds && rounds.length === 0" class="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-900/30 rounded-xl p-6">
      <div class="flex items-center gap-3">
        <v-icon name="hi-solid-information-circle" class="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
        <div>
          <h3 class="text-lg font-semibold text-yellow-900 dark:text-yellow-100">No rounds available</h3>
          <p class="text-sm text-yellow-700 dark:text-yellow-300">There are no rounds configured for this fantasy league yet.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/user/useUserStore'
import { FantasyFootballPlayersResponse } from '@/interfaces/user/fantasy/FantasyFootballPlayersResponse'
import { FantasyRoundResponse } from '@/interfaces/fantasy/rounds/FantasyRoundResponse'
import { FantasyFootballLineupPayload } from '@/interfaces/fantasy/leagues/FantasyFootballLineupPayload'
import { FantasyLeaguesResponse } from '@/interfaces/fantasy/leagues/FantasyLeaguesResponse'
import { fantasyLeagueService } from '@/services/fantasy/leagues/FantasyLeagueService'
import { useToast } from '@/composables/useToast'

interface Props {
  fantasyLeagueUuid?: string
}

const props = defineProps<Props>()

// Router and stores
const router = useRouter()
const userStore = useUserStore()
const toast = useToast()

// State
const players = ref<FantasyFootballPlayersResponse[]>([])
const rounds = ref<FantasyRoundResponse[]>([])
const league = ref<FantasyLeaguesResponse | null>(null)
const selectedRoundUuid = ref<string | null>(null)
const isLoading = ref(false)
const isLoadingRounds = ref(true) // Start with true to prevent flash
const error = ref<string | null>(null)

// Computed
const leagueUuid = computed(() => props.fantasyLeagueUuid)

const goalkeepers = computed(() => 
  players.value.filter(p => p.position.developer_name === 'GOALKEEPER')
)

const defenders = computed(() => 
  players.value.filter(p => p.position.developer_name === 'DEFENDER')
)

const midfielders = computed(() => 
  players.value.filter(p => p.position.developer_name === 'MIDFIELDER')
)

const attackers = computed(() => 
  players.value.filter(p => p.position.developer_name === 'ATTACKER')
)

const flexPlayers = computed(() => 
  players.value.filter(p => p.position.developer_name === 'FLEX')
)

const benchPlayers = computed(() => 
  players.value.filter(p => p.position.developer_name === 'BENCH')
)

const emptyBenchSlots = computed(() => {
  const maxBenchSize = league.value?.formation?.bench ?? 6
  const currentBenchSize = benchPlayers.value.length
  return Math.max(0, maxBenchSize - currentBenchSize)
})

const emptyGoalkeeperSlots = computed(() => {
  const required = league.value?.formation?.goalkeeper?.starter ?? 1
  return Math.max(0, required - goalkeepers.value.length)
})

const emptyDefenderSlots = computed(() => {
  const required = league.value?.formation?.defender?.starter ?? 3
  return Math.max(0, required - defenders.value.length)
})

const emptyMidfielderSlots = computed(() => {
  const required = league.value?.formation?.midfielder?.starter ?? 4
  return Math.max(0, required - midfielders.value.length)
})

const emptyAttackerSlots = computed(() => {
  const required = league.value?.formation?.attacker?.starter ?? 2
  return Math.max(0, required - attackers.value.length)
})

const emptyFlexSlots = computed(() => {
  const required = league.value?.formation?.flex ?? 1
  return Math.max(0, required - flexPlayers.value.length)
})

// Methods
function getPositionName(developerName: string): string {
  const positionNames: Record<string, string> = {
    'GOALKEEPER': 'Goalkeeper',
    'DEFENDER': 'Defender',
    'MIDFIELDER': 'Midfielder',
    'ATTACKER': 'Forward',
    'FLEX': 'Flex',
    'BENCH': 'Bench'
  }
  return positionNames[developerName] || developerName
}

async function loadLeague() {
  if (!leagueUuid.value) {
    return
  }

  try {
    league.value = await fantasyLeagueService.showFantasyLeague(leagueUuid.value)
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Error loading league'
    console.error('Error loading league:', errorMessage)
  }
}

async function loadRounds() {
  if (!leagueUuid.value) {
    isLoadingRounds.value = false
    return
  }

  isLoadingRounds.value = true

  try {
    rounds.value = await fantasyLeagueService.getFantasyRoundsByLeagueUuid(leagueUuid.value)
    
    // Auto-select current round
    const currentRound = rounds.value.find(r => r.is_current)
    if (currentRound) {
      selectedRoundUuid.value = currentRound.uuid
    } else if (rounds.value.length > 0) {
      selectedRoundUuid.value = rounds.value[0].uuid
    }
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Error loading rounds'
    toast.error('Error loading rounds', errorMessage, { duration: 3000 })
  } finally {
    isLoadingRounds.value = false
  }
}

async function loadPlayers() {
  if (!leagueUuid.value || !selectedRoundUuid.value) {
    return
  }

  isLoading.value = true
  error.value = null

  try {
    const payload: FantasyFootballLineupPayload = {
      fantasy_round_uuid: selectedRoundUuid.value
    }
    players.value = await userStore.getFantasyFootballPlayersByLeagueUuid(leagueUuid.value, payload)
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Error loading players'
    error.value = errorMessage
    toast.error('Error loading your fantasy team', errorMessage, { duration: 3000 })
  } finally {
    isLoading.value = false
  }
}

function handleGoToLeagues() {
  router.push({ name: 'userFantasyLeague' })
}

function goToDraftPlayers() {
  if (leagueUuid.value) {
    router.push({ 
      name: 'playersToDraft', 
      params: { uuid: leagueUuid.value } 
    })
  }
}

function handleDraftPlayerByPosition(position: string) {
  if (!leagueUuid.value) return
  router.push({
    name: 'playersToDraft',
    params: { uuid: leagueUuid.value },
    query: { position: position === 'BENCH' || position === 'FLEX' ? 'ALL' : position }
  })
}

// Watch for round changes
watch(selectedRoundUuid, () => {
  if (selectedRoundUuid.value) {
    loadPlayers()
  }
})

// Lifecycle
onMounted(async () => {
  await loadLeague()
  await loadRounds()
})
</script>

<style scoped>
/* Remove native select arrow in all browsers */
select {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  background-image: none;
}

select::-ms-expand {
  display: none;
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
</style>
