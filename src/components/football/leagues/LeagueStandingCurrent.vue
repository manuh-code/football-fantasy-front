<template>
    <div class="w-full mt-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <!-- Card Header -->
        <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div class="flex items-center gap-3">
                <div
                    class="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                    <v-icon name="bi-trophy-fill" class="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                    <h2 class="text-xl font-semibold text-gray-900 dark:text-white">League Standings</h2>
                    <p class="text-sm text-gray-600 dark:text-gray-400">Current standings for the selected league</p>
                </div>
            </div>
        </div>

        <!-- Card Body -->
        <div class="p-6">

            <div v-if="!leagueUuid" class="text-center py-8 text-gray-500 dark:text-gray-400">No league selected.</div>

            <div v-else>
                <div v-if="loading" class="text-center py-8 text-gray-400 dark:text-gray-500">
                    <div class="flex items-center justify-center">
                        <v-icon name="pr-spinner" class="w-6 h-6 text-gray-400 dark:text-gray-500" animation="spin"
                            aria-hidden="true" />
                        <span class="sr-only">Loading standings...</span>
                    </div>
                </div>

                <div v-else-if="error" class="text-center py-8 text-red-500">{{ error }}</div>

                <div v-else-if="standings.length === 0" class="text-center py-8 text-gray-400 dark:text-gray-500">
                    <NoResults title="No standings available"
                        description="Standings are not available for this league yet." icon="bi-trophy-fill" />
                </div>

                <div v-else>
                    <!-- Desktop / Desktop+ table (styled like PlayerStatisticsDesktopTable) - show from md and up -->
                    <div
                        class="hidden md:block table-container overflow-x-auto bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-lg">
                        <table class="table-fixed min-w-[720px] w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <colgroup>
                                <col style="width:56px" />
                                <col style="width:260px" />
                                <col style="width:56px" />
                                <col style="width:56px" />
                                <col style="width:56px" />
                                <col style="width:56px" />
                                <col style="width:72px" />
                                <col style="width:72px" />
                                <col style="width:72px" />
                                <col style="width:120px" />
                            </colgroup>
                            <thead class="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th
                                        class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors select-none">
                                        #</th>
                                    <th
                                        class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors select-none">
                                        Team</th>
                                    <th
                                        class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors select-none">
                                        M</th>
                                    <th
                                        class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors select-none">
                                        W</th>
                                    <th
                                        class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors select-none">
                                        D</th>
                                    <th
                                        class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors select-none">
                                        L</th>
                                    <th
                                        class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors select-none">
                                        GF</th>
                                    <th
                                        class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors select-none">
                                        GA</th>
                                    <th
                                        class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors select-none">
                                        +/-</th>
                                    <th
                                        class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors select-none">
                                        Last 5</th>
                                </tr>
                            </thead>
                            <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                <tr v-for="(row, idx) in standings" :key="row.team?.uuid || idx"
                                    class="hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{{
                                        row.position }}</td>
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <div class="flex items-center">
                                            <img :src="row.team?.image_path || '/img/default-avatar.svg'"
                                                :alt="row.team?.name"
                                                class="w-8 h-8 rounded-full border border-gray-100 dark:border-gray-700 object-cover" />
                                            <div class="ml-4">
                                                <div class="text-sm font-medium text-gray-900 dark:text-white">{{
                                                    row.team?.name }}</div>
                                                <div class="text-sm text-gray-500 dark:text-gray-400">{{
                                                    row.team?.short_code || '' }}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td
                                        class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white text-center">
                                        {{ getStat(row.statistics, 'overall-matches-played') }}</td>
                                    <td
                                        class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white text-center">
                                        {{ getStat(row.statistics, 'overall-won') }}</td>
                                    <td
                                        class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white text-center">
                                        {{ getStat(row.statistics, 'overall-draw') }}</td>
                                    <td
                                        class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white text-center">
                                        {{ getStat(row.statistics, 'overall-lost') }}</td>
                                    <td
                                        class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white text-center">
                                        {{ getStat(row.statistics, 'overall-goals-for') }}</td>
                                    <td
                                        class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white text-center">
                                        {{ getStat(row.statistics, 'overall-goals-against') }}</td>
                                    <td
                                        class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white text-center">
                                        {{ getStat(row.statistics, 'goal-difference') }}</td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm">
                                        <div class="flex items-center justify-start gap-1">
                                            <template v-for="(f, i) in lastFive(row.form)" :key="i">
                                                <span :title="f.form" class="w-3.5 h-3.5 rounded-full inline-block"
                                                    :class="formColor(f.form)"></span>
                                            </template>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <!-- Mobile stacked cards -->
                    <ul class="md:hidden space-y-3">
                        <li v-for="(row, idx) in standings" :key="row.team?.uuid || idx"
                            class="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-lg p-3">
                            <div class="flex items-center justify-between">
                                <div class="flex items-center gap-3">
                                    <div class="text-sm font-semibold text-gray-800 dark:text-gray-100">{{ row.position
                                        }}.</div>
                                    <img :src="row.team?.image_path || '/img/default-avatar.svg'" :alt="row.team?.name"
                                        class="w-8 h-8 rounded-full" />
                                    <div class="flex flex-col">
                                        <span class="text-sm font-medium text-gray-800 dark:text-gray-100">{{
                                            row.team?.name }}</span>
                                        <span class="text-xs text-gray-400">M {{ getStat(row.statistics,
                                            'overall-matches-played') }} · Pts
                                            {{ row.points ?? '-' }}</span>
                                    </div>
                                </div>
                                <div class="flex items-center gap-2">
                                    <div class="text-sm text-gray-700 dark:text-gray-200">{{ getStat(row.statistics,
                                        'goal-difference') }}
                                    </div>
                                </div>
                            </div>
                            <div class="mt-3 flex items-center justify-between">
                                <div class="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-200">
                                    <div>W {{ getStat(row.statistics, 'overall-won') }}</div>
                                    <div>D {{ getStat(row.statistics, 'overall-draw') }}</div>
                                    <div>L {{ getStat(row.statistics, 'overall-lost') }}</div>
                                </div>
                                <div class="flex items-center gap-1">
                                    <template v-for="(f, i) in lastFive(row.form)" :key="i">
                                        <span :title="f.form" class="w-3.5 h-3.5 rounded-full inline-block"
                                            :class="formColor(f.form)"></span>
                                    </template>
                                </div>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import footballLeagueService from '@/services/football/league/FootballLeagueService'
import NoResults from '@/components/ui/NoResults.vue'
import { useFootballLeagueStore } from '@/store/football/league/useFootballLeagueStore'
import type { FootballLeagueStandingsResponse } from '@/interfaces/football/league/FootballLeagueStandingsResponse'

const store = useFootballLeagueStore()
const leagueUuid = store.getFootballLeagueUuid()

const standings = ref<FootballLeagueStandingsResponse[]>([])
const loading = ref(false)
const error = ref('')

type StatLike = { type?: { code?: string }; value?: number } | Array<{ type?: { code?: string }; value?: number }>
const getStat = (stats: StatLike | undefined, code: string) => {
    if (!stats) return '-'
    if (Array.isArray(stats)) {
        const found = stats.find(s => s?.type?.code === code)
        return found?.value ?? '-'
    }
    // support single-object shape
    const single = stats as { type?: { code?: string }; value?: number }
    if (single?.type?.code === code) return single.value ?? '-'
    return '-'
}

type FormLike = { form?: string; sort_order?: number } | Array<{ form?: string; sort_order?: number }>
const lastFive = (formArr: FormLike | undefined) => {
    if (!formArr) return []
    if (Array.isArray(formArr)) {
        return formArr.slice(-5)
    }
    // single object -> return as single-entry array
    return [formArr]
}

const formColor = (f: string | undefined) => {
    if (!f) return 'bg-gray-300 dark:bg-gray-700'
    const s = (f || '').toUpperCase()
    if (s === 'W') return 'bg-emerald-500'
    if (s === 'L') return 'bg-red-500'
    if (s === 'D') return 'bg-yellow-400'
    return 'bg-gray-300 dark:bg-gray-700'
}

const fetchStandings = async () => {
    if (!leagueUuid) return
    loading.value = true
    error.value = ''
    standings.value = []
    try {
        const res = await footballLeagueService.getCurrentStandings(leagueUuid)
        if (Array.isArray(res)) standings.value = res
        else standings.value = []
    } catch (e) {
        error.value = 'Failed to load standings.'
    } finally {
        loading.value = false
    }
}

onMounted(() => {
    fetchStandings()
})
</script>

<style scoped>
.dark .dark\:bg-gray-850 {
    background-color: #0b1220;
}

.table-container {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
}
</style>
