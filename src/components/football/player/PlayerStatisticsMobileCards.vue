<template>
    <div class="md:hidden space-y-4 p-4">
        <!-- Sort Controls for Mobile -->
        <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white">Players</h3>
            <div class="flex items-center gap-2">
                <button @click="showMobileSortMenu = !showMobileSortMenu"
                    class="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                    <v-icon name="ri-arrow-up-down-fill" class="w-4 h-4" />
                    <span>Sort</span>
                </button>
            </div>
        </div>

        <!-- Mobile Sort Menu -->
        <div v-if="showMobileSortMenu" class="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div class="grid grid-cols-2 gap-2">
                <button v-for="column in ['display_name', 'team', 'position', 'age', 'country']" :key="column"
                    @click="$emit('sort', column); showMobileSortMenu = false"
                    :class="[
                        'px-3 py-2 text-sm rounded-lg text-left transition-colors',
                        sortBy === column 
                            ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' 
                            : 'bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-500'
                    ]">
                    <div class="flex items-center justify-between">
                        <span>{{ column === 'display_name' ? 'Player' : formatStatColumnName(column) }}</span>
                        <v-icon v-if="sortBy === column" :name="getSortIcon(column)" class="w-4 h-4" />
                    </div>
                </button>
            </div>
            
            <!-- Statistics Sort Options -->
            <div v-if="dynamicStatColumns.length > 0" class="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                <h4 class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Statistics</h4>
                <div class="grid grid-cols-2 gap-2">
                    <button v-for="statKey in dynamicStatColumns.slice(0, 6)" :key="statKey"
                        @click="$emit('sort', statKey); showMobileSortMenu = false"
                        :class="[
                            'px-3 py-2 text-sm rounded-lg text-left transition-colors',
                            sortBy === statKey 
                                ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' 
                                : 'bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-500'
                        ]">
                        <div class="flex items-center justify-between">
                            <span class="truncate">{{ formatStatColumnName(statKey) }}</span>
                            <v-icon v-if="sortBy === statKey" :name="getSortIcon(statKey)" class="w-4 h-4" />
                        </div>
                    </button>
                </div>
            </div>
        </div>

        <!-- Player Cards -->
        <div v-for="player in players" :key="player.uuid"
            class="player-card bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-4 hover:shadow-md transition-shadow">
            <!-- Player Header -->
            <div class="flex items-center space-x-3 mb-3">
                <img :src="player.image_path || '/img/default-avatar.svg'"
                    :alt="player.display_name"
                    class="w-12 h-12 rounded-full border border-gray-200 dark:border-gray-600 object-cover"
                    @error="handleImageError" />
                <div class="flex-1 min-w-0">
                    <h4 class="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {{ player.display_name }}
                    </h4>
                    <p class="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {{ player.common_name }}
                    </p>
                </div>
            </div>

            <!-- Player Details Grid -->
            <div class="grid grid-cols-2 gap-3 mb-3">
                <!-- Team -->
                <div class="flex items-center space-x-2">
                    <img v-if="player.team.image_path" :src="player.team.image_path"
                        :alt="player.team.name" class="w-5 h-5 rounded"
                        @error="handleTeamImageError" />
                    <div class="min-w-0">
                        <p class="text-xs text-gray-500 dark:text-gray-400">Team</p>
                        <p class="text-sm text-gray-900 dark:text-white truncate">{{ player.team.name }}</p>
                    </div>
                </div>

                <!-- Position -->
                <div>
                    <p class="text-xs text-gray-500 dark:text-gray-400">Position</p>
                    <p class="text-sm text-gray-900 dark:text-white">{{ player.position?.name || '-' }}</p>
                </div>

                <!-- Age -->
                <div>
                    <p class="text-xs text-gray-500 dark:text-gray-400">Age</p>
                    <p class="text-sm text-gray-900 dark:text-white">{{ player.age }}</p>
                </div>

                <!-- Country -->
                <div class="flex items-center space-x-2">
                    <img v-if="player.country.image_path" :src="player.country.image_path"
                        :alt="player.country.name ?? ''" class="w-4 h-4 rounded" />
                    <div class="min-w-0">
                        <p class="text-xs text-gray-500 dark:text-gray-400">Country</p>
                        <p class="text-sm text-gray-900 dark:text-white truncate">{{ player.country.name }}</p>
                    </div>
                </div>
            </div>

            <!-- Statistics (if available) -->
            <div v-if="dynamicStatColumns.length > 0" class="border-t border-gray-200 dark:border-gray-600 pt-3">
                <h5 class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Statistics</h5>
                <div class="grid grid-cols-2 gap-2">
                    <div v-for="statKey in dynamicStatColumns.slice(0, 4)" :key="statKey" class="text-center">
                        <p class="text-xs text-gray-500 dark:text-gray-400 truncate">{{ formatStatColumnName(statKey) }}</p>
                        <p class="text-sm font-medium text-gray-900 dark:text-white">
                            {{ formatStatValue(player.statistics?.details?.[statKey]) }}
                        </p>
                    </div>
                </div>
                
                <!-- Show more stats button if there are more than 4 -->
                <button v-if="dynamicStatColumns.length > 4" 
                    @click="togglePlayerStats(player.uuid)"
                    class="mt-2 w-full text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
                    {{ expandedPlayers.includes(player.uuid) ? 'Show Less' : `Show ${dynamicStatColumns.length - 4} More Stats` }}
                </button>
                
                <!-- Expanded statistics -->
                <div v-if="expandedPlayers.includes(player.uuid)" class="mt-3 pt-3 border-t border-gray-100 dark:border-gray-600">
                    <div class="grid grid-cols-2 gap-2">
                        <div v-for="statKey in dynamicStatColumns.slice(4)" :key="statKey" class="text-center">
                            <p class="text-xs text-gray-500 dark:text-gray-400 truncate">{{ formatStatColumnName(statKey) }}</p>
                            <p class="text-sm font-medium text-gray-900 dark:text-white">
                                {{ formatStatValue(player.statistics?.details?.[statKey]) }}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits } from 'vue'
import type { FootballPlayerStatisticResponse } from '@/interfaces/football/player/FootballPlayerStatisticResponse'

// Props
interface Props {
    players: FootballPlayerStatisticResponse[]
    dynamicStatColumns: string[]
    sortBy: string | null
    sortDirection: 'asc' | 'desc' | null
    expandedPlayers: string[]
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
    sort: [column: string]
    'toggle-player-stats': [playerUuid: string]
}>()

// Local state
const showMobileSortMenu = ref(false)

// Methods
const getSortIcon = (column: string): string => {
    if (props.sortBy !== column) {
        return 'hi-selector' // Default sort icon
    }
    return props.sortDirection === 'asc' ? 'hi-solid-sort-ascending' : 'hi-solid-sort-descending'
}

const formatStatColumnName = (statKey: string): string => {
    return statKey
        .replace(/_/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase())
}

const formatStatValue = (value: number | undefined | null): string => {
    if (value === undefined || value === null) return '-'
    if (typeof value === 'number') {
        return value % 1 === 0 ? value.toString() : value.toFixed(2)
    }
    return String(value)
}

const togglePlayerStats = (playerUuid: string) => {
    emit('toggle-player-stats', playerUuid)
}

const handleImageError = (event: Event) => {
    const img = event.target as HTMLImageElement
    if (!img.dataset.fallbackUsed) {
        img.dataset.fallbackUsed = 'true'
        img.src = '/img/default-avatar.svg'
    }
}

const handleTeamImageError = (event: Event) => {
    const img = event.target as HTMLImageElement
    if (!img.dataset.fallbackUsed) {
        img.dataset.fallbackUsed = 'true'
        img.style.display = 'none'
    }
}
</script>

<style scoped>
/* Mobile card hover effects */
.player-card {
    transition: all 0.2s ease-in-out;
}

.player-card:active {
    transform: scale(0.98);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>
