<template>
    <div class="hidden md:block lg:hidden table-container overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-700">
                <tr>
                    <th
                        :class="[
                            'px-4 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors select-none',
                            sortBy === 'display_name' ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20' : 'text-gray-500 dark:text-gray-300'
                        ]"
                        @click="$emit('sort', 'display_name')">
                        <div class="flex items-center justify-between min-w-[150px]">
                            <span>Player</span>
                            <v-icon :name="getSortIcon('display_name')" class="w-4 h-4 ml-2" />
                        </div>
                    </th>
                    <th
                        :class="[
                            'px-4 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors select-none',
                            sortBy === 'team' ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20' : 'text-gray-500 dark:text-gray-300'
                        ]"
                        @click="$emit('sort', 'team')">
                        <div class="flex items-center justify-between min-w-[120px]">
                            <span>Team</span>
                            <v-icon :name="getSortIcon('team')" class="w-4 h-4 ml-2" />
                        </div>
                    </th>
                    <th
                        :class="[
                            'px-4 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors select-none',
                            sortBy === 'position' ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20' : 'text-gray-500 dark:text-gray-300'
                        ]"
                        @click="$emit('sort', 'position')">
                        <div class="flex items-center justify-between min-w-[100px]">
                            <span>Pos</span>
                            <v-icon :name="getSortIcon('position')" class="w-4 h-4 ml-2" />
                        </div>
                    </th>
                    <th
                        :class="[
                            'px-4 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors select-none',
                            sortBy === 'age' ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20' : 'text-gray-500 dark:text-gray-300'
                        ]"
                        @click="$emit('sort', 'age')">
                        <div class="flex items-center justify-between min-w-[80px]">
                            <span>Age</span>
                            <v-icon :name="getSortIcon('age')" class="w-4 h-4 ml-2" />
                        </div>
                    </th>
                    <!-- Dynamic Statistics Columns (condensed) -->
                    <th v-for="statKey in dynamicStatColumns.slice(0, 3)" :key="statKey"
                        :class="[
                            'px-4 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors select-none',
                            sortBy === statKey ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20' : 'text-gray-500 dark:text-gray-300'
                        ]"
                        @click="$emit('sort', statKey)">
                        <div class="flex items-center justify-between min-w-[100px]">
                            <span class="truncate">{{ formatStatColumnName(statKey).split(' ')[0] }}</span>
                            <v-icon :name="getSortIcon(statKey)" class="w-4 h-4 ml-2" />
                        </div>
                    </th>
                </tr>
            </thead>
            <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                <tr v-for="player in players" :key="player.uuid"
                    class="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <!-- Player Info -->
                    <td class="px-4 py-3 whitespace-nowrap">
                        <div class="flex items-center">
                            <img :src="player.image_path || '/img/default-avatar.svg'"
                                :alt="player.display_name"
                                class="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-600 object-cover"
                                @error="handleImageError" />
                            <div class="ml-3">
                                <div class="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[120px]">
                                    {{ player.display_name }}
                                </div>
                                <div class="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[120px]">
                                    {{ player.common_name }}
                                </div>
                            </div>
                        </div>
                    </td>

                    <!-- Team -->
                    <td class="px-4 py-3 whitespace-nowrap">
                        <div class="flex items-center">
                            <img v-if="player.team.image_path" :src="player.team.image_path"
                                :alt="player.team.name" class="w-5 h-5 rounded mr-2"
                                @error="handleTeamImageError" />
                            <span class="text-sm text-gray-900 dark:text-white truncate max-w-[100px]">
                                {{ player.team.name }}
                            </span>
                        </div>
                    </td>

                    <!-- Position -->
                    <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {{ player.position?.name || '-' }}
                    </td>

                    <!-- Age -->
                    <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {{ player.age }}
                    </td>

                    <!-- Dynamic Statistics (limited) -->
                    <td v-for="statKey in dynamicStatColumns.slice(0, 3)" :key="`${player.uuid}-${statKey}`"
                        class="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {{ formatStatValue(player.statistics?.details?.[statKey]) }}
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'
import type { FootballPlayerStatisticResponse } from '@/interfaces/football/player/FootballPlayerStatisticResponse'

// Props
interface Props {
    players: FootballPlayerStatisticResponse[]
    dynamicStatColumns: string[]
    sortBy: string | null
    sortDirection: 'asc' | 'desc' | null
}

const props = defineProps<Props>()

// Emits
defineEmits<{
    sort: [column: string]
}>()

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
/* Responsive table improvements */
.table-container {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
}
</style>
