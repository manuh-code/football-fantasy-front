<template>
  <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
    <div class="px-4 md:px-6 py-3 md:py-4 border-b border-gray-200 dark:border-gray-700">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div class="flex items-center gap-2 md:gap-3 min-w-0">
          <div class="w-8 h-8 md:w-10 md:h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
            <v-icon name="hi-solid-chart-bar" class="w-4 h-4 md:w-5 md:h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div class="min-w-0">
            <h3 class="text-base md:text-lg font-semibold text-gray-900 dark:text-white truncate">Fantasy Points Results</h3>
            <p v-if="rangeDescription" class="text-sm text-gray-600 dark:text-gray-400 truncate">{{ rangeDescription }}</p>
          </div>
        </div>

        <div v-if="fantasyPoints.length" class="flex items-center gap-2 flex-shrink-0">
          <label for="fantasy-points-per-page" class="text-sm font-medium text-gray-700 dark:text-gray-300">
            Show
          </label>
          <SearchableSelectComponent
            :model-value="String(perPage)"
            :options="perPageSelectOptions"
            value-key="value"
            label-key="label"
            :searchable="false"
            :clearable="false"
            accent-color="gray"
            class="w-20 md:w-24"
            @change="handlePerPageChange"
          />
          <span class="text-sm text-gray-600 dark:text-gray-400">per page</span>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="p-6 md:p-8 text-center">
      <div class="animate-spin rounded-full h-10 w-10 md:h-12 md:w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
  <p class="text-sm md:text-base text-gray-600 dark:text-gray-400">Loading fantasy points…</p>
    </div>

    <!-- Initial State -->
    <div v-else-if="!hasSearched" class="p-6 md:p-8 text-center">
      <div class="w-12 h-12 md:w-16 md:h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full mx-auto mb-4 flex items-center justify-center">
        <v-icon name="hi-solid-lightning-bolt" class="w-6 h-6 md:w-8 md:h-8 text-emerald-600 dark:text-emerald-400" />
      </div>
      <h3 class="text-base md:text-lg font-medium text-gray-900 dark:text-white mb-2">Search fantasy points</h3>
      <p class="text-sm md:text-base text-gray-600 dark:text-gray-400">
        Adjust the filters and press search to display the results.
      </p>
    </div>

    <!-- Empty State -->
    <div v-else-if="!fantasyPoints.length" class="p-6 md:p-8 text-center">
      <div class="w-12 h-12 md:w-16 md:h-16 bg-gray-100 dark:bg-gray-700 rounded-full mx-auto mb-4 flex items-center justify-center">
        <v-icon name="hi-solid-search" class="w-6 h-6 md:w-8 md:h-8 text-gray-400" />
      </div>
      <h3 class="text-base md:text-lg font-medium text-gray-900 dark:text-white mb-2">No results</h3>
      <p class="text-sm md:text-base text-gray-600 dark:text-gray-400">
        No players matched the selected filters. Try a different combination.
      </p>
    </div>

    <!-- Results -->
    <div v-else class="space-y-0">
      <!-- Desktop Table -->
      <div class="hidden lg:block table-container overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Jugador
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Equipo
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Posición
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Partidos
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                <button
                  type="button"
                  class="inline-flex items-center gap-1 text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                  @click="handleSort('total_points')"
                >
                  Total points
                  <v-icon :name="getSortIconName('total_points')" :class="['w-4 h-4', getSortIconClass('total_points')]" />
                </button>
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                <button
                  type="button"
                  class="inline-flex items-center gap-1 text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                  @click="handleSort('average_points')"
                >
                  Average
                  <v-icon :name="getSortIconName('average_points')" :class="['w-4 h-4', getSortIconClass('average_points')]" />
                </button>
              </th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            <tr
              v-for="point in fantasyPoints"
              :key="`fantasy-points-${point.player.uuid}`"
              class="hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <PlayerAvatar :player="point.player" size="md" />
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900 dark:text-white">
                      {{ point.player.display_name }}
                    </div>
                    <div class="text-xs text-gray-500 dark:text-gray-400">
                      Age: {{ point.player.age }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <TeamLogo :team="point.team" size="sm" variant="rounded" class="mr-3" />
                  <div>
                    <div class="text-sm font-medium text-gray-900 dark:text-white">
                      {{ point.team.name }}
                    </div>
                    <div class="text-xs text-gray-500 dark:text-gray-400">
                      {{ point.team.short_code }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                  {{ point.position?.name ?? 'N/D' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                {{ formatFixtures(point.total_fixtures) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-emerald-600 dark:text-emerald-400 font-semibold">
                {{ formatPoints(point.total_points) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-emerald-600 dark:text-emerald-400 font-semibold">
                {{ formatPoints(point.average_points) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Mobile / Tablet Cards -->
      <div class="lg:hidden space-y-4 p-4">
        <div
          v-for="point in fantasyPoints"
          :key="`fantasy-points-card-${point.player.uuid}`"
          class="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-4 shadow-sm"
        >
          <div class="flex items-center gap-3 mb-4">
            <PlayerAvatar :player="point.player" size="lg" />
            <div class="flex-1 min-w-0">
              <h4 class="text-base font-semibold text-gray-900 dark:text-white truncate">
                {{ point.player.display_name }}
              </h4>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                {{ point.team.name }}
              </p>
            </div>
            <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200">
              {{ point.position?.code ?? 'N/D' }}
            </span>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
              <p class="text-xs text-gray-500 dark:text-gray-400">Total points</p>
              <p class="text-lg font-semibold text-emerald-600 dark:text-emerald-400">
                {{ formatPoints(point.total_points) }}
              </p>
            </div>
            <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
              <p class="text-xs text-gray-500 dark:text-gray-400">Average</p>
              <p class="text-lg font-semibold text-emerald-600 dark:text-emerald-400">
                {{ formatPoints(point.average_points) }}
              </p>
            </div>
            <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
              <p class="text-xs text-gray-500 dark:text-gray-400">Matches</p>
              <p class="text-lg font-semibold text-gray-900 dark:text-white">
                {{ formatFixtures(point.total_fixtures) }}
              </p>
            </div>
            <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
              <p class="text-xs text-gray-500 dark:text-gray-400">Team</p>
              <p class="text-sm font-medium text-gray-900 dark:text-white truncate">
                {{ point.team.short_code }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Simple Pagination -->
      <div v-if="hasPagination" class="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <button
          type="button"
          class="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          :disabled="!hasPrev"
          @click="emit('change-page', 'prev')"
        >
          <v-icon name="hi-solid-chevron-left" class="w-4 h-4 mr-2" />
          Previous
        </button>
        <div class="text-sm text-gray-600 dark:text-gray-400">
          Page {{ currentPage }}
        </div>
        <button
          type="button"
          class="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          :disabled="!hasNext"
          @click="emit('change-page', 'next')"
        >
          Next
          <v-icon name="hi-solid-chevron-right" class="w-4 h-4 ml-2" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, defineEmits, defineProps, withDefaults } from 'vue'
import { SearchableSelectComponent } from '@/components/ui'
import PlayerAvatar from '@/components/football/ui/PlayerAvatar.vue'
import TeamLogo from '@/components/football/ui/TeamLogo.vue'
import type { FootballPlayerFantasyPointsResponse } from '@/interfaces/football/player/FootballPlayerFantasyPointsResponse'
import type { ApiSimplePagination } from '@/interfaces/api/ApiSimplePagination'
import type { ApiLinks } from '@/interfaces/api/ApiLinks'

type SortField = 'total_points' | 'average_points' | 'total_fixtures'

interface PerPageOption extends Record<string, string | number | boolean | null | undefined> {
  value: string
  label: string
}

interface Props {
  fantasyPoints: FootballPlayerFantasyPointsResponse[]
  isLoading: boolean
  hasSearched: boolean
  pagination: ApiSimplePagination | null
  links: ApiLinks | null
  perPage: number
  perPageOptions: { value: number; label: string }[]
  sortBy: SortField
  sortDirection: 'asc' | 'desc'
}

const props = withDefaults(defineProps<Props>(), {
  fantasyPoints: () => [],
  isLoading: false,
  hasSearched: false,
  pagination: null,
  links: null,
  perPage: 15,
  perPageOptions: () => [
    { value: 10, label: '10' },
    { value: 15, label: '15' },
    { value: 25, label: '25' }
  ],
  sortBy: 'total_points',
  sortDirection: 'desc'
})

const emit = defineEmits<{
  'change-page': ['prev' | 'next']
  'update:perPage': [value: number]
  sort: [column: SortField]
}>()

const formatPoints = (value: number | string | null | undefined) => {
  const numeric = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(numeric)) {
    return '0.00'
  }
  return numeric.toFixed(2)
}

const formatFixtures = (value: number | null | undefined) => {
  if (value === null || value === undefined) {
    return 'N/D'
  }
  return value
}

const perPageSelectOptions = computed<PerPageOption[]>(() =>
  props.perPageOptions.map(option => ({
    value: String(option.value),
    label: option.label
  }))
)

const rangeDescription = computed(() => {
  if (!props.fantasyPoints.length || !props.pagination) {
    if (!props.fantasyPoints.length) {
      return ''
    }
    const count = props.fantasyPoints.length
    return `Showing ${count} players`
  }

  const from = props.pagination.from ?? 0
  const to = props.pagination.to ?? (from + props.fantasyPoints.length - 1)
  return `Showing ${from}-${to} players`
})

const currentPage = computed(() => props.pagination?.current_page ?? 1)

const hasPrev = computed(() => {
  if (props.links) {
    return props.links.prev !== null
  }
  const current = props.pagination?.current_page ?? 1
  return current > 1
})

const hasNext = computed(() => {
  if (props.links) {
    return props.links.next !== null
  }
  return props.fantasyPoints.length === props.perPage
})

const hasPagination = computed(() => hasPrev.value || hasNext.value)

const handlePerPageChange = (value: string | number | null) => {
  if (value === null) return
  const parsed = typeof value === 'number' ? value : parseInt(value, 10)
  if (Number.isNaN(parsed)) return
  emit('update:perPage', parsed)
}

const handleSort = (column: SortField) => {
  emit('sort', column)
}

const getSortIconName = (column: SortField) => {
  if (props.sortBy !== column) {
    return 'ri-arrow-up-down-fill'
  }
  return props.sortDirection === 'asc' ? 'hi-solid-sort-ascending' : 'hi-solid-sort-descending'
}

const getSortIconClass = (column: SortField) => {
  if (props.sortBy !== column) {
    return 'text-gray-400'
  }
  return 'text-emerald-600 dark:text-emerald-400'
}
</script>

<style scoped>
.table-container {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
