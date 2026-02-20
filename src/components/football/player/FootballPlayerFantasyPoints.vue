<template>
	<div class="space-y-6">
		<FootballPlayerFantasyPointsFilters
			:teams="teams"
			:stages="stages"
			:positions="positions"
			:is-loading-teams="isLoadingTeams"
			:is-loading-stages="isLoadingStages"
			:is-loading-positions="isLoadingPositions"
			:is-searching="isLoadingFantasyPoints"
			:disabled="!isSeasonAvailable"
			:is-initializing="isInitializing"
			v-model:selected-teams="filters.teams"
			v-model:selected-positions="filters.positions"
			v-model:selected-stages="filters.stages"
			@search="handleSearch"
			@clear="clearFilters"
		/>

		<FootballPlayerFantasyPointsResults
			ref="resultsSection"
			:fantasy-points="fantasyPoints"
			:is-loading="isLoadingFantasyPoints"
			:has-searched="hasSearched"
			:pagination="pagination"
			:links="paginationLinks"
			:per-page="perPage"
			:per-page-options="perPageOptions"
			:sort-by="sortBy"
			:sort-direction="sortDirection"
			@change-page="changePage"
			@update:per-page="updatePerPage"
			@sort="handleSort"
		/>
	</div>
</template>

<script setup lang="ts">
/* eslint-disable no-undef */
import { ref, reactive, computed, watch, nextTick } from 'vue'
import FootballPlayerFantasyPointsFilters from '@/components/football/player/FootballPlayerFantasyPointsFilters.vue'
import FootballPlayerFantasyPointsResults from '@/components/football/player/FootballPlayerFantasyPointsResults.vue'
import { useToast } from '@/composables/useToast'
import { catalogService } from '@/services/catalog/CatalogService'
import { fantasyLeagueService } from '@/services/fantasy/leagues/FantasyLeagueService'
import { footballPlayerService } from '@/services/football/player/FootballPlayerService'
import type { FootballTeamResponse } from '@/interfaces/football/team/FootballTeamResponse'
import type { FootballStageResponse } from '@/interfaces/football/stage/FootballStageResponse'
import type { FootballPlayerFantasyPointsResponse } from '@/interfaces/football/player/FootballPlayerFantasyPointsResponse'
import type { FootballPlayerFantasyPointsPayload } from '@/interfaces/football/player/FootballPlayerFantasyPointsPayload'
import type { ApiSimplePagination } from '@/interfaces/api/ApiSimplePagination'
import type { ApiPagination } from '@/interfaces/api/ApiPagination'
import type { ApiLinks } from '@/interfaces/api/ApiLinks'
import type { TypeResponse } from '@/interfaces/football/type/TypeResponse'

interface Props {
	fantasyLeagueUuid: string
}

type SortField = 'total_points' | 'average_points' | 'total_fixtures'

const props = defineProps<Props>()
const toast = useToast()

const teams = ref<FootballTeamResponse[]>([])
const stages = ref<FootballStageResponse[]>([])
const positions = ref<TypeResponse[]>([])
const fantasyPoints = ref<FootballPlayerFantasyPointsResponse[]>([])

const filters = reactive({
	teams: [] as FootballTeamResponse[],
	positions: [] as TypeResponse[],
	stages: [] as FootballStageResponse[]
})

const isInitializing = ref(false)
const isLoadingTeams = ref(false)
const isLoadingStages = ref(false)
const isLoadingPositions = ref(false)
const isLoadingFantasyPoints = ref(false)
const hasSearched = ref(false)

const currentSeasonUuid = ref('')
const defaultStages = ref<FootballStageResponse[]>([])

const pagination = ref<ApiSimplePagination | null>(null)
const paginationLinks = ref<ApiLinks | null>(null)

const perPage = ref(15)
const perPageOptions = [
	{ value: 10, label: '10' },
	{ value: 15, label: '15' },
	{ value: 25, label: '25' },
	{ value: 50, label: '50' },
	{ value: 100, label: '100' }
]

const sortBy = ref<SortField>('total_points')
const sortDirection = ref<'asc' | 'desc'>('desc')

const isSeasonAvailable = computed(() => currentSeasonUuid.value.length > 0)

const hasPrevPage = computed(() => {
	if (!pagination.value) {
		return false
	}
	if (paginationLinks.value) {
		return paginationLinks.value.prev !== null
	}
	return pagination.value.current_page > 1
})

const hasNextPage = computed(() => {
	if (!pagination.value) {
		return false
	}
	if (paginationLinks.value) {
		return paginationLinks.value.next !== null
	}
	return fantasyPoints.value.length === perPage.value
})

const resetState = () => {
	teams.value = []
	stages.value = []
	positions.value = []
	fantasyPoints.value = []
	filters.teams = []
	filters.positions = []
	filters.stages = []
	currentSeasonUuid.value = ''
	defaultStages.value = []
	pagination.value = null
	paginationLinks.value = null
	hasSearched.value = false
	isLoadingTeams.value = false
	isLoadingStages.value = false
	isLoadingPositions.value = false
	isLoadingFantasyPoints.value = false
	perPage.value = 15
	sortBy.value = 'total_points'
	sortDirection.value = 'desc'
}

const loadTeams = async (seasonUuid: string) => {
	isLoadingTeams.value = true
	try {
		const response = await catalogService.getTeamsBySeasonUuid(seasonUuid)
		teams.value = [...response].sort((a, b) => a.name.localeCompare(b.name))

		filters.teams = filters.teams.filter(team =>
			teams.value.some(option => option.uuid === team.uuid)
		)
	} catch (error) {
		console.error('Error loading teams:', error)
		teams.value = []
	} finally {
		isLoadingTeams.value = false
	}
}

const loadPositions = async () => {
	isLoadingPositions.value = true
	try {
		const response = await catalogService.getTypePosition()
		positions.value = [...response].sort((a, b) => a.name.localeCompare(b.name))
	} catch (error) {
		console.error('Error loading positions:', error)
		positions.value = []
	} finally {
		isLoadingPositions.value = false
	}
}

const loadStages = async (seasonUuid: string) => {
	isLoadingStages.value = true
	try {
		const response = await catalogService.getStagesBySeasonUuid(seasonUuid)
		stages.value = [...response].sort((a, b) => a.sort_order - b.sort_order)

		const currentStage = stages.value.find(stage => stage.is_current)
		const fallbackStage = currentStage || stages.value[0]
		defaultStages.value = fallbackStage ? [fallbackStage] : []

		if (filters.stages.length === 0 && defaultStages.value.length > 0) {
			filters.stages = [...defaultStages.value]
		} else {
			filters.stages = filters.stages.filter(stage =>
				stages.value.some(option => option.uuid === stage.uuid)
			)
		}
	} catch (error) {
		console.error('Error loading stages:', error)
		stages.value = []
		defaultStages.value = []
		filters.stages = []
	} finally {
		isLoadingStages.value = false
	}
}

const initialize = async (leagueUuid: string) => {
	if (!leagueUuid) {
		resetState()
		return
	}

	isInitializing.value = true
	try {
		const league = await fantasyLeagueService.showFantasyLeague(leagueUuid)

		if (!league.current_football_season_uuid) {
			toast.info('Info', 'This league does not have an active season.')
			currentSeasonUuid.value = ''
			return
		}

		currentSeasonUuid.value = league.current_football_season_uuid

		await Promise.all([
			loadTeams(currentSeasonUuid.value),
			loadStages(currentSeasonUuid.value),
			loadPositions()
		])
	} catch (error) {
		console.error('Error initialising fantasy points:', error)
		resetState()
	} finally {
		isInitializing.value = false
	}
}

const buildPaginationFromFull = (payload: ApiPagination): ApiSimplePagination => {
	return {
		current_page: payload.current_page,
		current_page_url: payload.path ? `${payload.path}?page=${payload.current_page}` : '',
		from: payload.from,
		path: payload.path,
		per_page: payload.per_page,
		to: payload.to
	}
}

const searchFantasyPoints = async (page = 1) => {
	if (!isSeasonAvailable.value) {
		toast.warning('Warning', 'There is no active season to request fantasy points.')
		return
	}

	isLoadingFantasyPoints.value = true
	hasSearched.value = true

	try {
		const payload: FootballPlayerFantasyPointsPayload = {
			page,
			per_page: perPage.value,
			filters: {
				team_uuids: filters.teams.length ? filters.teams.map(team => team.uuid) : null,
				position_uuids: filters.positions.length ? filters.positions.map(position => position.uuid) : null,
				stage_uuids: filters.stages.map(stage => stage.uuid)
			},
			sort_direction: sortDirection.value,
			sort_by: sortBy.value
		}

		const response = await footballPlayerService.getPlayerFantasyScore(payload, props.fantasyLeagueUuid)
		fantasyPoints.value = Array.isArray(response.data) ? response.data : []

		const paginationData = response.pagination

		if (paginationData) {
			if ('last_page' in paginationData) {
				pagination.value = buildPaginationFromFull(paginationData as ApiPagination)
			} else {
				pagination.value = paginationData as ApiSimplePagination
			}

			perPage.value = pagination.value.per_page
		} else {
			const from = fantasyPoints.value.length ? (page - 1) * perPage.value + 1 : 0
			const to = fantasyPoints.value.length ? from + fantasyPoints.value.length - 1 : 0
			pagination.value = {
				current_page: page,
				current_page_url: '',
				from,
				path: '',
				per_page: perPage.value,
				to
			}
		}

		paginationLinks.value = response.links
	} catch (error) {
		console.error('Error loading fantasy points:', error)
		fantasyPoints.value = []
		pagination.value = null
		paginationLinks.value = null
	} finally {
		isLoadingFantasyPoints.value = false
	}
}

const handleSearch = async () => {
	await searchFantasyPoints(1)
	scrollToResults()
}

const clearFilters = () => {
	filters.teams = []
	filters.positions = []
	filters.stages = defaultStages.value.length > 0 ? [...defaultStages.value] : []
	fantasyPoints.value = []
	pagination.value = null
	paginationLinks.value = null
	hasSearched.value = false
	sortBy.value = 'total_points'
	sortDirection.value = 'desc'
}

const changePage = (direction: 'prev' | 'next') => {
	if (!pagination.value) {
		return
	}

	const currentPage = pagination.value.current_page

	if (direction === 'prev') {
		if (!hasPrevPage.value) {
			return
		}
		searchFantasyPoints(Math.max(1, currentPage - 1))
	} else {
		if (!hasNextPage.value) {
			return
		}
		searchFantasyPoints(currentPage + 1)
	}
}

const updatePerPage = (value: number) => {
	if (perPage.value === value) {
		return
	}

	perPage.value = value
	if (hasSearched.value) {
		searchFantasyPoints(1)
	}
}

const handleSort = (column: SortField) => {
	if (sortBy.value === column) {
		sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
	} else {
		sortBy.value = column
		sortDirection.value = 'desc'
	}

	if (hasSearched.value) {
		searchFantasyPoints(1)
	}
}

const scrollToResults = () => {
	nextTick(() => {
		setTimeout(() => {
			const resultsElement = resultsSection.value?.$el
			if (resultsElement) {
				const rect = resultsElement.getBoundingClientRect()
				const offset = 80
				const scrollPosition = window.pageYOffset + rect.top - offset
				window.scrollTo({
					top: scrollPosition,
					behavior: 'smooth'
				})
			}
		}, 300)
	})
}

const resultsSection = ref()

watch(
	() => props.fantasyLeagueUuid,
	async newUuid => {
		resetState()
		if (newUuid) {
			await initialize(newUuid)
		}
	},
	{ immediate: true }
)
</script>
