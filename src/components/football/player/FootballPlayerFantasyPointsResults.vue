<template>
  <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60">
    <div class="px-4 py-3">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <div class="flex items-center gap-2 min-w-0">
          <v-icon name="hi-solid-chart-bar" class="w-[16px] h-[16px] text-emerald-500 dark:text-emerald-400 shrink-0" />
          <div class="min-w-0">
            <h3 class="text-[13px] font-semibold text-gray-900 dark:text-white">Fantasy Points Results</h3>
            <p v-if="rangeDescription" class="text-[11px] text-gray-400 dark:text-gray-500 tabular-nums truncate">{{ rangeDescription }}</p>
          </div>
        </div>

        <div v-if="fantasyPoints.length" class="flex items-center gap-2 shrink-0">
          <label for="fantasy-points-per-page" class="text-[11px] font-medium text-gray-500 dark:text-gray-400">
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
            class="w-20"
            @change="handlePerPageChange"
          />
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="py-12 text-center">
      <v-icon name="pr-spinner" class="w-5 h-5 text-gray-300 dark:text-gray-600 mx-auto mb-2" animation="spin" />
      <p class="text-[12px] text-gray-400 dark:text-gray-500">Loading fantasy points…</p>
    </div>

    <!-- Initial State -->
    <div v-else-if="!hasSearched" class="py-12 text-center">
      <v-icon name="hi-solid-lightning-bolt" class="w-8 h-8 text-gray-200 dark:text-gray-700 mx-auto mb-2" />
      <h3 class="text-[13px] font-medium text-gray-900 dark:text-white mb-1">Search fantasy points</h3>
      <p class="text-[12px] text-gray-400 dark:text-gray-500">Adjust filters and press search.</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="!fantasyPoints.length" class="py-12 text-center">
      <v-icon name="hi-solid-search" class="w-8 h-8 text-gray-200 dark:text-gray-700 mx-auto mb-2" />
      <h3 class="text-[13px] font-medium text-gray-900 dark:text-white mb-1">No results</h3>
      <p class="text-[12px] text-gray-400 dark:text-gray-500">Try a different filter combination.</p>
    </div>

    <!-- Results -->
    <div v-else class="space-y-0">
      <!-- Desktop Table -->
      <div class="hidden lg:block table-container overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-100 dark:divide-gray-700/60">
          <thead>
            <tr class="bg-gray-50/80 dark:bg-gray-750">
              <th class="px-3 py-2 text-left text-[11px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Player
              </th>
              <th class="px-3 py-2 text-left text-[11px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Team
              </th>
              <th class="px-3 py-2 text-left text-[11px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Pos
              </th>
              <th class="px-3 py-2 text-left text-[11px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                GP
              </th>
              <th class="px-3 py-2 text-left text-[11px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <button
                  type="button"
                  class="inline-flex items-center gap-1 active:text-emerald-600 dark:active:text-emerald-400 transition-colors"
                  @click="handleSort('total_points')"
                >
                  Pts
                  <v-icon :name="getSortIconName('total_points')" :class="['w-3 h-3', getSortIconClass('total_points')]" />
                </button>
              </th>
              <th class="px-3 py-2 text-left text-[11px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <button
                  type="button"
                  class="inline-flex items-center gap-1 active:text-emerald-600 dark:active:text-emerald-400 transition-colors"
                  @click="handleSort('average_points')"
                >
                  Avg
                  <v-icon :name="getSortIconName('average_points')" :class="['w-3 h-3', getSortIconClass('average_points')]" />
                </button>
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 dark:divide-gray-700/60">
            <tr
              v-for="point in fantasyPoints"
              :key="`fantasy-points-${point.player.uuid}`"
              class="active:bg-gray-50 dark:active:bg-gray-700/50"
            >
              <td class="px-3 py-2.5 whitespace-nowrap">
                <div class="flex items-center gap-2.5">
                  <PlayerAvatar :player="point.player" size="md" />
                  <div>
                    <div class="text-[13px] font-medium text-gray-900 dark:text-white">
                      {{ point.player.display_name }}
                    </div>
                    <div class="text-[11px] text-gray-400 dark:text-gray-500">
                      Age: {{ point.player.age }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-3 py-2.5 whitespace-nowrap">
                <div class="flex items-center gap-2">
                  <TeamLogo :team="point.team" size="sm" variant="rounded" />
                  <div>
                    <div class="text-[12px] font-medium text-gray-900 dark:text-white">
                      {{ point.team.name }}
                    </div>
                    <div class="text-[10px] text-gray-400 dark:text-gray-500">
                      {{ point.team.short_code }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-3 py-2.5 whitespace-nowrap">
                <span class="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                  {{ point.position?.name ?? 'N/D' }}
                </span>
              </td>
              <td class="px-3 py-2.5 whitespace-nowrap text-[12px] text-gray-600 dark:text-gray-300 tabular-nums">
                {{ formatFixtures(point.total_fixtures) }}
              </td>
              <td class="px-3 py-2.5 whitespace-nowrap text-[13px] font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
                {{ formatPoints(point.total_points) }}
              </td>
              <td class="px-3 py-2.5 whitespace-nowrap text-[13px] font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
                {{ formatPoints(point.average_points) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Mobile / Tablet Cards -->
      <div class="lg:hidden space-y-2 p-3">
        <div
          v-for="point in fantasyPoints"
          :key="`fantasy-points-card-${point.player.uuid}`"
          class="bg-white dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-600/50 p-3 active:scale-[0.98] transition-transform"
        >
          <div class="flex items-center gap-2.5 mb-2.5">
            <PlayerAvatar :player="point.player" size="md" />
            <div class="flex-1 min-w-0">
              <h4 class="text-[13px] font-medium text-gray-900 dark:text-white truncate">
                {{ point.player.display_name }}
              </h4>
              <p class="text-[11px] text-gray-400 dark:text-gray-500">
                {{ point.team.name }}
              </p>
            </div>
            <span class="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
              {{ point.position?.code ?? 'N/D' }}
            </span>
          </div>

          <div class="grid grid-cols-3 gap-2 pt-2.5 border-t border-gray-100 dark:border-gray-600/50">
            <div class="text-center">
              <p class="text-[10px] text-gray-400 dark:text-gray-500">Points</p>
              <p class="text-[15px] font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                {{ formatPoints(point.total_points) }}
              </p>
            </div>
            <div class="text-center">
              <p class="text-[10px] text-gray-400 dark:text-gray-500">Average</p>
              <p class="text-[15px] font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                {{ formatPoints(point.average_points) }}
              </p>
            </div>
            <div class="text-center">
              <p class="text-[10px] text-gray-400 dark:text-gray-500">GP</p>
              <p class="text-[15px] font-bold text-gray-900 dark:text-white tabular-nums">
                {{ formatFixtures(point.total_fixtures) }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Simple Pagination -->
      <div v-if="hasPagination" class="px-4 py-3 border-t border-gray-100 dark:border-gray-700/60 flex items-center justify-between">
        <button
          type="button"
          class="inline-flex items-center px-3 py-1.5 text-[12px] font-medium rounded-lg text-gray-600 dark:text-gray-300 active:bg-gray-100 dark:active:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          :disabled="!hasPrev"
          @click="emit('change-page', 'prev')"
        >
          <v-icon name="hi-solid-chevron-left" class="w-3.5 h-3.5 mr-1" />
          Previous
        </button>
        <span class="text-[11px] text-gray-400 dark:text-gray-500 tabular-nums">
          Page {{ currentPage }}
        </span>
        <button
          type="button"
          class="inline-flex items-center px-3 py-1.5 text-[12px] font-medium rounded-lg text-gray-600 dark:text-gray-300 active:bg-gray-100 dark:active:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          :disabled="!hasNext"
          @click="emit('change-page', 'next')"
        >
          Next
          <v-icon name="hi-solid-chevron-right" class="w-3.5 h-3.5 ml-1" />
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
.tabular-nums {
  font-variant-numeric: tabular-nums;
}

.table-container {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}
</style>
