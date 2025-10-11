<template>
    <div class="hidden lg:block table-container overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-700">
                <tr>
                    <th
                        :class="[
                            'px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors select-none',
                            sortBy === 'display_name' ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20' : 'text-gray-500 dark:text-gray-300'
                        ]"
                        @click="$emit('sort', 'display_name')">
                        <div class="flex items-center justify-between">
                            <span>Player</span>
                            <v-icon :name="getSortIcon('display_name')" class="w-4 h-4" />
                        </div>
                    </th>
                    <th
                        :class="[
                            'px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors select-none',
                            sortBy === 'team' ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20' : 'text-gray-500 dark:text-gray-300'
                        ]"
                        @click="$emit('sort', 'team')">
                        <div class="flex items-center justify-between">
                            <span>Team</span>
                            <v-icon :name="getSortIcon('team')" class="w-4 h-4" />
                        </div>
                    </th>
                    <th
                        :class="[
                            'px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors select-none',
                            sortBy === 'position' ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20' : 'text-gray-500 dark:text-gray-300'
                        ]"
                        @click="$emit('sort', 'position')">
                        <div class="flex items-center justify-between">
                            <span>Position</span>
                            <v-icon :name="getSortIcon('position')" class="w-4 h-4" />
                        </div>
                    </th>
                    <th
                        :class="[
                            'px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors select-none',
                            sortBy === 'age' ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20' : 'text-gray-500 dark:text-gray-300'
                        ]"
                        @click="$emit('sort', 'age')">
                        <div class="flex items-center justify-between">
                            <span>Age</span>
                            <v-icon :name="getSortIcon('age')" class="w-4 h-4" />
                        </div>
                    </th>
                    <th
                        :class="[
                            'px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors select-none',
                            sortBy === 'country' ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20' : 'text-gray-500 dark:text-gray-300'
                        ]"
                        @click="$emit('sort', 'country')">
                        <div class="flex items-center justify-between">
                            <span>Country</span>
                            <v-icon :name="getSortIcon('country')" class="w-4 h-4" />
                        </div>
                    </th>
                    <!-- Dynamic Statistics Columns -->
                    <th v-for="statKey in dynamicStatColumns" :key="statKey"
                        :class="[
                            'px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors select-none',
                            sortBy === statKey ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20' : 'text-gray-500 dark:text-gray-300'
                        ]"
                        @click="$emit('sort', statKey)">
                        <div class="flex items-center justify-between">
                            <span>{{ formatStatColumnName(statKey) }}</span>
                            <v-icon :name="getSortIcon(statKey)" class="w-4 h-4" />
                        </div>
                    </th>
                </tr>
            </thead>
            <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                <tr v-for="player in players" :key="player.uuid"
                    class="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <!-- Player Info -->
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="flex items-center">
                            <PlayerAvatar 
                                :player="player"
                                size="md"
                                variant="circle"
                            />
                            <div class="ml-4">
                                <div class="text-sm font-medium text-gray-900 dark:text-white">
                                    {{ player.display_name }}
                                </div>
                                <div class="text-sm text-gray-500 dark:text-gray-400">
                                    {{ player.common_name }}
                                </div>
                            </div>
                        </div>
                    </td>

                    <!-- Team -->
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="flex items-center">
                            <div class="mr-2">
                                <TeamLogo 
                                    :team="player.team"
                                    size="sm"
                                    variant="square"
                                />
                            </div>
                            <span class="text-sm text-gray-900 dark:text-white">
                                {{ player.team.name }}
                            </span>
                        </div>
                    </td>

                    <!-- Position -->
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {{ player.position?.name || '-' }}
                    </td>

                    <!-- Age -->
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {{ player.age }}
                    </td>

                    <!-- Country -->
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="flex items-center">
                            <img v-if="player.country.image_path" :src="player.country.image_path"
                                :alt="player.country.name ?? 'Unknown Country'" class="w-5 h-5 rounded mr-2" />
                            <span class="text-sm text-gray-900 dark:text-white">
                                {{ player.country.name }}
                            </span>
                        </div>
                    </td>

                    <!-- Dynamic Statistics -->
                    <td v-for="statKey in dynamicStatColumns" :key="`${player.uuid}-${statKey}`"
                        class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
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
import PlayerAvatar from '@/components/football/ui/PlayerAvatar.vue'
import TeamLogo from '@/components/football/ui/TeamLogo.vue'

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


</script>

<style scoped>
/* Responsive table improvements */
.table-container {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
}
</style>
