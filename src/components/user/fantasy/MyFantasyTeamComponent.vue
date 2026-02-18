<template>
  <div class="w-full">
    <!-- Loading State -->
    <div v-if="isLoading" class="flex items-center justify-center min-h-[400px]">
      <div class="flex flex-col items-center gap-4">
        <v-icon name="pr-spinner" class="w-12 h-12 text-blue-600 dark:text-blue-400" animation="spin" />
        <p class="text-gray-600 dark:text-gray-400 font-medium">Cargando tu equipo...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-xl p-6">
      <div class="flex items-center gap-3">
        <v-icon name="hi-solid-exclamation-circle" class="w-8 h-8 text-red-600 dark:text-red-400" />
        <div>
          <h3 class="text-lg font-semibold text-red-900 dark:text-red-100">Error al cargar el equipo</h3>
          <p class="text-sm text-red-700 dark:text-red-300">{{ error }}</p>
        </div>
      </div>
    </div>

    <!-- No League Selected -->
    <div v-else-if="!leagueUuid" class="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-900/30 rounded-xl p-6">
      <div class="flex items-center gap-3">
        <v-icon name="hi-solid-information-circle" class="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
        <div>
          <h3 class="text-lg font-semibold text-yellow-900 dark:text-yellow-100">No hay liga fantasy seleccionada</h3>
          <p class="text-sm text-yellow-700 dark:text-yellow-300">Por favor selecciona una liga fantasy para ver tu equipo.</p>
        </div>
      </div>
    </div>

    <!-- Fantasy Team Display -->
    <div v-else-if="players.length > 0">
      <!-- Team Header -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
        <div class="px-4 md:px-6 py-4">
          <div class="flex items-center justify-between flex-wrap gap-4">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 bg-gradient-to-br from-emerald-600 to-green-600 rounded-lg flex items-center justify-center">
                <v-icon name="hi-solid-user-group" class="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 class="text-xl font-bold text-gray-900 dark:text-white">Mi Equipo Fantasy</h2>
                <p class="text-sm text-gray-600 dark:text-gray-400">{{ starterPlayers.length }} titulares • {{ benchPlayers.length }} reservas</p>
              </div>
            </div>
            <div class="text-right">
              <p class="text-sm text-gray-500 dark:text-gray-400">Formación</p>
              <p class="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{{ formationDisplay }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Starters Section -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-6 overflow-hidden">
        <!-- Section Header -->
        <div class="bg-gradient-to-r from-emerald-600 to-green-600 px-4 md:px-6 py-3">
          <h3 class="text-lg font-bold text-white flex items-center gap-2">
            <v-icon name="hi-solid-star" class="w-5 h-5" />
            Titulares
          </h3>
        </div>

        <!-- Starters Table -->
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-600">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Posición
                </th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Jugador
                </th>
                <th class="px-4 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider hidden md:table-cell">
                  Pick
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
              <!-- Goalkeeper -->
              <tr v-for="player in goalkeepers" :key="player.football_player.uuid" 
                  class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150">
                <td class="px-4 py-4">
                  <div class="flex items-center gap-2">
                    <span class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-bold">
                      {{ player.position.code }}
                    </span>
                    <span class="text-xs font-medium text-gray-600 dark:text-gray-400 hidden sm:inline">Portero</span>
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
                      <p class="text-xs text-gray-500 dark:text-gray-400 md:hidden">
                        Pick #{{ player.pick_number }}
                      </p>
                    </div>
                  </div>
                </td>
                <td class="px-4 py-4 text-center hidden md:table-cell">
                  <span class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-bold">
                    {{ player.pick_number }}
                  </span>
                </td>
              </tr>

              <!-- Empty Goalkeeper slots -->
              <tr v-for="slot in emptyGoalkeeperSlots" :key="`empty-gk-${slot}`"
                  class="bg-gray-50/50 dark:bg-gray-700/20">
                <td class="px-4 py-4">
                  <div class="flex items-center gap-2">
                    <span class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-400 dark:text-blue-500 text-xs font-bold opacity-50">
                      GK
                    </span>
                    <span class="text-xs font-medium text-gray-400 dark:text-gray-500 hidden sm:inline">Portero</span>
                  </div>
                </td>
                <td class="px-4 py-4">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gray-200 dark:bg-gray-700 border-2 border-dashed border-gray-300 dark:border-gray-600"></div>
                    <p class="text-sm text-gray-400 dark:text-gray-500 italic">Posición vacía</p>
                  </div>
                </td>
                <td class="px-4 py-4 text-center hidden md:table-cell">
                  <span class="text-gray-400 dark:text-gray-500">-</span>
                </td>
              </tr>

              <!-- Defenders -->
              <tr v-for="player in defenders" :key="player.football_player.uuid" 
                  class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150">
                <td class="px-4 py-4">
                  <div class="flex items-center gap-2">
                    <span class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold">
                      {{ player.position.code }}
                    </span>
                    <span class="text-xs font-medium text-gray-600 dark:text-gray-400 hidden sm:inline">Defensa</span>
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
                      <p class="text-xs text-gray-500 dark:text-gray-400 md:hidden">
                        Pick #{{ player.pick_number }}
                      </p>
                    </div>
                  </div>
                </td>
                <td class="px-4 py-4 text-center hidden md:table-cell">
                  <span class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-bold">
                    {{ player.pick_number }}
                  </span>
                </td>
              </tr>

              <!-- Empty Defender slots -->
              <tr v-for="slot in emptyDefenderSlots" :key="`empty-def-${slot}`"
                  class="bg-gray-50/50 dark:bg-gray-700/20">
                <td class="px-4 py-4">
                  <div class="flex items-center gap-2">
                    <span class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 text-green-400 dark:text-green-500 text-xs font-bold opacity-50">
                      DF
                    </span>
                    <span class="text-xs font-medium text-gray-400 dark:text-gray-500 hidden sm:inline">Defensa</span>
                  </div>
                </td>
                <td class="px-4 py-4">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gray-200 dark:bg-gray-700 border-2 border-dashed border-gray-300 dark:border-gray-600"></div>
                    <p class="text-sm text-gray-400 dark:text-gray-500 italic">Posición vacía</p>
                  </div>
                </td>
                <td class="px-4 py-4 text-center hidden md:table-cell">
                  <span class="text-gray-400 dark:text-gray-500">-</span>
                </td>
              </tr>

              <!-- Midfielders -->
              <tr v-for="player in midfielders" :key="player.football_player.uuid" 
                  class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150">
                <td class="px-4 py-4">
                  <div class="flex items-center gap-2">
                    <span class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-xs font-bold">
                      {{ player.position.code }}
                    </span>
                    <span class="text-xs font-medium text-gray-600 dark:text-gray-400 hidden sm:inline">Centrocampista</span>
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
                      <p class="text-xs text-gray-500 dark:text-gray-400 md:hidden">
                        Pick #{{ player.pick_number }}
                      </p>
                    </div>
                  </div>
                </td>
                <td class="px-4 py-4 text-center hidden md:table-cell">
                  <span class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-bold">
                    {{ player.pick_number }}
                  </span>
                </td>
              </tr>

              <!-- Empty Midfielder slots -->
              <tr v-for="slot in emptyMidfielderSlots" :key="`empty-mid-${slot}`"
                  class="bg-gray-50/50 dark:bg-gray-700/20">
                <td class="px-4 py-4">
                  <div class="flex items-center gap-2">
                    <span class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-400 dark:text-yellow-500 text-xs font-bold opacity-50">
                      MF
                    </span>
                    <span class="text-xs font-medium text-gray-400 dark:text-gray-500 hidden sm:inline">Centrocampista</span>
                  </div>
                </td>
                <td class="px-4 py-4">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gray-200 dark:bg-gray-700 border-2 border-dashed border-gray-300 dark:border-gray-600"></div>
                    <p class="text-sm text-gray-400 dark:text-gray-500 italic">Posición vacía</p>
                  </div>
                </td>
                <td class="px-4 py-4 text-center hidden md:table-cell">
                  <span class="text-gray-400 dark:text-gray-500">-</span>
                </td>
              </tr>

              <!-- Attackers -->
              <tr v-for="player in attackers" :key="player.football_player.uuid" 
                  class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150">
                <td class="px-4 py-4">
                  <div class="flex items-center gap-2">
                    <span class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-bold">
                      {{ player.position.code }}
                    </span>
                    <span class="text-xs font-medium text-gray-600 dark:text-gray-400 hidden sm:inline">Delantero</span>
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
                      <p class="text-xs text-gray-500 dark:text-gray-400 md:hidden">
                        Pick #{{ player.pick_number }}
                      </p>
                    </div>
                  </div>
                </td>
                <td class="px-4 py-4 text-center hidden md:table-cell">
                  <span class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-bold">
                    {{ player.pick_number }}
                  </span>
                </td>
              </tr>

              <!-- Empty Attacker slots -->
              <tr v-for="slot in emptyAttackerSlots" :key="`empty-att-${slot}`"
                  class="bg-gray-50/50 dark:bg-gray-700/20">
                <td class="px-4 py-4">
                  <div class="flex items-center gap-2">
                    <span class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 text-red-400 dark:text-red-500 text-xs font-bold opacity-50">
                      FW
                    </span>
                    <span class="text-xs font-medium text-gray-400 dark:text-gray-500 hidden sm:inline">Delantero</span>
                  </div>
                </td>
                <td class="px-4 py-4">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gray-200 dark:bg-gray-700 border-2 border-dashed border-gray-300 dark:border-gray-600"></div>
                    <p class="text-sm text-gray-400 dark:text-gray-500 italic">Posición vacía</p>
                  </div>
                </td>
                <td class="px-4 py-4 text-center hidden md:table-cell">
                  <span class="text-gray-400 dark:text-gray-500">-</span>
                </td>
              </tr>

              <!-- Flex -->
              <tr v-for="player in flexPlayers" :key="player.football_player.uuid" 
                  class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150">
                <td class="px-4 py-4">
                  <div class="flex items-center gap-2">
                    <span class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-xs font-bold">
                      {{ player.position.code }}
                    </span>
                    <span class="text-xs font-medium text-gray-600 dark:text-gray-400 hidden sm:inline">Flex</span>
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
                      <p class="text-xs text-gray-500 dark:text-gray-400 md:hidden">
                        Pick #{{ player.pick_number }}
                      </p>
                    </div>
                  </div>
                </td>
                <td class="px-4 py-4 text-center hidden md:table-cell">
                  <span class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-bold">
                    {{ player.pick_number }}
                  </span>
                </td>
              </tr>

              <!-- Empty Flex slots -->
              <tr v-for="slot in emptyFlexSlots" :key="`empty-flex-${slot}`"
                  class="bg-gray-50/50 dark:bg-gray-700/20">
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
                    <div class="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gray-200 dark:bg-gray-700 border-2 border-dashed border-gray-300 dark:border-gray-600"></div>
                    <p class="text-sm text-gray-400 dark:text-gray-500 italic">Posición vacía</p>
                  </div>
                </td>
                <td class="px-4 py-4 text-center hidden md:table-cell">
                  <span class="text-gray-400 dark:text-gray-500">-</span>
                </td>
              </tr>
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
            Reserva (Bench)
          </h3>
        </div>

        <!-- Bench Table -->
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-600">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Posición
                </th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Jugador
                </th>
                <th class="px-4 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider hidden md:table-cell">
                  Pick
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
              <tr v-for="player in benchPlayers" :key="player.football_player.uuid" 
                  class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150">
                <td class="px-4 py-4">
                  <div class="flex items-center gap-2">
                    <span class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs font-bold">
                      {{ player.position.code }}
                    </span>
                    <span class="text-xs font-medium text-gray-600 dark:text-gray-400 hidden sm:inline">
                      {{ getPositionName(player.position.developer_name) }}
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
                      <p class="text-xs text-gray-500 dark:text-gray-400 md:hidden">
                        Pick #{{ player.pick_number }}
                      </p>
                    </div>
                  </div>
                </td>
                <td class="px-4 py-4 text-center hidden md:table-cell">
                  <span class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-bold">
                    {{ player.pick_number }}
                  </span>
                </td>
              </tr>

              <!-- Empty bench slots -->
              <tr v-for="slot in emptyBenchSlots" :key="`empty-${slot}`"
                  class="bg-gray-50/50 dark:bg-gray-700/20">
                <td class="px-4 py-4">
                  <div class="flex items-center gap-2">
                    <span class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 text-xs font-bold">
                      BN
                    </span>
                  </div>
                </td>
                <td class="px-4 py-4">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gray-200 dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600"></div>
                    <p class="text-sm text-gray-400 dark:text-gray-500 italic">Posición vacía</p>
                  </div>
                </td>
                <td class="px-4 py-4 text-center hidden md:table-cell">
                  <span class="text-gray-400 dark:text-gray-500">-</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
      <div class="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
        <v-icon name="hi-solid-user-group" class="w-10 h-10 text-gray-400 dark:text-gray-500" />
      </div>
      <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">No tienes jugadores en tu equipo</h3>
      <p class="text-gray-600 dark:text-gray-400 mb-4">Aún no has seleccionado jugadores para tu equipo fantasy.</p>
      <div class="max-w-md mx-auto mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
        <p class="text-sm text-gray-700 dark:text-gray-300 font-medium mb-2">Posiciones requeridas:</p>
        <ul class="text-sm text-gray-600 dark:text-gray-400 space-y-1">
          <li>• 1 Portero (GK)</li>
          <li>• 3 Defensas (DF)</li>
          <li>• 4 Centrocampistas (MF)</li>
          <li>• 2 Delanteros (FW)</li>
          <li>• 1 Flex (FX)</li>
          <li class="pt-2 border-t border-gray-300 dark:border-gray-600">• 6 Reservas (Bench)</li>
        </ul>
      </div>
      <button 
        @click="handleGoToLeagues"
        class="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200"
      >
        Ver mis ligas
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/user/useUserStore'
import { FantasyFootballPlayersResponse } from '@/interfaces/user/fantasy/FantasyFootballPlayersResponse'
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
const isLoading = ref(false)
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

const starterPlayers = computed(() => 
  players.value.filter(p => p.position.developer_name !== 'BENCH')
)

const benchPlayers = computed(() => 
  players.value.filter(p => p.position.developer_name === 'BENCH')
)

const emptyBenchSlots = computed(() => {
  const maxBenchSize = 6
  const currentBenchSize = benchPlayers.value.length
  return Math.max(0, maxBenchSize - currentBenchSize)
})

const emptyGoalkeeperSlots = computed(() => Math.max(0, 1 - goalkeepers.value.length))
const emptyDefenderSlots = computed(() => Math.max(0, 3 - defenders.value.length))
const emptyMidfielderSlots = computed(() => Math.max(0, 4 - midfielders.value.length))
const emptyAttackerSlots = computed(() => Math.max(0, 2 - attackers.value.length))
const emptyFlexSlots = computed(() => Math.max(0, 1 - flexPlayers.value.length))

const formationDisplay = computed(() => {
  return `${goalkeepers.value.length}-${defenders.value.length}-${midfielders.value.length}-${attackers.value.length}`
})

// Methods
function getPositionName(developerName: string): string {
  const positionNames: Record<string, string> = {
    'GOALKEEPER': 'Portero',
    'DEFENDER': 'Defensa',
    'MIDFIELDER': 'Centrocampista',
    'ATTACKER': 'Delantero',
    'FLEX': 'Flex',
    'BENCH': 'Reserva'
  }
  return positionNames[developerName] || developerName
}
async function loadPlayers() {
  if (!leagueUuid.value) {
    return
  }

  isLoading.value = true
  error.value = null

  try {
    players.value = await userStore.getFantasyFootballPlayersByLeagueUuid(leagueUuid.value)
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Error al cargar los jugadores'
    error.value = errorMessage
    toast.error('Error al cargar tu equipo fantasy', errorMessage, { duration: 3000 })
  } finally {
    isLoading.value = false
  }
}

function handleGoToLeagues() {
  router.push({ name: 'userFantasyLeague' })
}

// Lifecycle
onMounted(() => {
  loadPlayers()
})
</script>

<style scoped>
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
