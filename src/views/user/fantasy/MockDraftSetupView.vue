<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-4 md:py-8">
    <div class="container mx-auto px-4 max-w-2xl space-y-4">
      <!-- Intro -->
      <div class="text-center px-2">
        <v-icon name="ri-robot-line" class="w-9 h-9 mx-auto text-emerald-500 mb-2" />
        <h1 class="text-xl font-black text-gray-900 dark:text-white">
          {{ $t('fantasy.mockDraft.intro.title') }}
        </h1>
        <p class="text-2xs text-gray-500 dark:text-gray-400 mt-1 max-w-md mx-auto">
          {{ $t('fantasy.mockDraft.intro.body') }}
        </p>
      </div>

      <!-- Cargando opciones -->
      <div v-if="isLoading" class="flex items-center justify-center py-16">
        <v-icon name="pr-spinner" class="w-5 h-5 text-gray-300 dark:text-gray-600" animation="spin" />
      </div>

      <template v-else-if="options">
        <MockDraftSetupForm
          :options="options"
          :leagues="leagues"
          :is-submitting="isCreating"
          :preset-league-uuid="presetLeagueUuid"
          @submit="createMockDraft"
        />

        <!-- Mocks recientes -->
        <div
          v-if="recent.length"
          class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 overflow-hidden"
        >
          <div class="px-4 py-2.5">
            <h2 class="text-footnote font-semibold text-gray-900 dark:text-white">
              {{ $t('fantasy.mockDraft.recent.title') }}
            </h2>
            <p class="text-[0.5rem] text-gray-400 dark:text-gray-500">
              {{ $t('fantasy.mockDraft.recent.ttlNotice') }}
            </p>
          </div>

          <ul class="divide-y divide-gray-50 dark:divide-gray-700/30">
            <li
              v-for="mock in recent"
              :key="mock.uuid"
              class="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
            >
              <button type="button" class="flex items-center gap-3 flex-1 min-w-0 text-left" @click="openMock(mock)">
                <span
                  class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  :class="
                    mock.status === 'COMPLETED'
                      ? 'bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500'
                      : 'bg-emerald-50 text-emerald-500 dark:bg-emerald-500/10'
                  "
                >
                  <v-icon
                    :name="mock.status === 'COMPLETED' ? 'hi-solid-check' : 'ri-timer-flash-line'"
                    class="w-4 h-4"
                  />
                </span>
                <span class="min-w-0 flex-1">
                  <span class="block text-xs font-semibold text-gray-900 dark:text-white truncate">
                    {{ mock.fantasy_league_name || $t('fantasy.mockDraft.recent.freeMock') }}
                  </span>
                  <span class="block text-[0.5rem] text-gray-500 dark:text-gray-400">
                    {{ $t('fantasy.mockDraft.recent.detail', {
                      teams: mock.teams_count,
                      difficulty: $t(`fantasy.mockDraft.difficulty.${mock.difficulty}`),
                      picks: mock.picks_made,
                      total: mock.total_picks,
                    }) }}
                  </span>
                </span>
              </button>

              <button
                type="button"
                class="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-gray-300 hover:text-red-500 dark:text-gray-600 transition-colors"
                :aria-label="$t('fantasy.mockDraft.recent.delete')"
                @click="removeMock(mock)"
              >
                <v-icon name="hi-solid-trash" class="w-4 h-4" />
              </button>
            </li>
          </ul>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import MockDraftSetupForm from '@/components/fantasy/mockDraft/MockDraftSetupForm.vue'
import { mockDraftService } from '@/services/fantasy/mockDraft/MockDraftService'
import { useMockDraftStore } from '@/store/fantasy/useMockDraftStore'
import { useUserStore } from '@/store'
import { useFootballLeagueStore } from '@/store/football/league/useFootballLeagueStore'
import { useToast } from '@/composables/useToast'
import type {
  MockDraftCreatePayload,
  MockDraftOptions,
  MockDraftSummary,
} from '@/interfaces/fantasy/mockDraft/MockDraftResponse'
import type { FantasyLeaguesResponse } from '@/interfaces/fantasy/leagues/FantasyLeaguesResponse'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const toast = useToast()
const userStore = useUserStore()
const footballLeagueStore = useFootballLeagueStore()
const mockDraftStore = useMockDraftStore()

const options = ref<MockDraftOptions | null>(null)
const recent = ref<MockDraftSummary[]>([])
const leagues = ref<FantasyLeaguesResponse[]>([])
const isLoading = ref(true)
const isCreating = ref(false)

/** Entrar desde una liga con "practicar mi draft" preselecciona su preset. */
const presetLeagueUuid = computed(() => (route.query.league as string) ?? null)

async function loadLeagues(): Promise<void> {
  try {
    if (!userStore.getUserFantasyLeagues) {
      await userStore.getUserFantasyLeaguesFromApi()
    }
    leagues.value = userStore.getUserFantasyLeagues ?? []
  } catch (error) {
    // El preset es opcional: sin ligas el mock se configura a mano.
    console.error('Error loading fantasy leagues for mock draft preset:', error)
    leagues.value = []
  }
}

async function loadRecent(): Promise<void> {
  try {
    recent.value = await mockDraftService.getRecent()
  } catch (error) {
    console.error('Error loading recent mock drafts:', error)
    recent.value = []
  }
}

async function createMockDraft(payload: MockDraftCreatePayload): Promise<void> {
  isCreating.value = true
  try {
    // Sin preset de liga fantasy, el mock se juega con la liga de fútbol que el
    // usuario tiene seleccionada (el guard del router siempre deja una puesta).
    const draft = await mockDraftService.create({
      ...payload,
      football_league_uuid: payload.fantasy_league_uuid
        ? null
        : footballLeagueStore.getFootballLeagueUuid(),
    })
    mockDraftStore.setDraft(draft)
    router.push({ name: 'mockDraftRoom', params: { uuid: draft.uuid } })
  } catch (error) {
    console.error('Error creating mock draft:', error)
  } finally {
    isCreating.value = false
  }
}

function openMock(mock: MockDraftSummary): void {
  router.push({ name: 'mockDraftRoom', params: { uuid: mock.uuid } })
}

async function removeMock(mock: MockDraftSummary): Promise<void> {
  try {
    await mockDraftService.destroy(mock.uuid)
    recent.value = recent.value.filter((item) => item.uuid !== mock.uuid)
    toast.success(t('fantasy.mockDraft.recent.deleted'))
  } catch (error) {
    console.error('Error deleting mock draft:', error)
  }
}

onMounted(async () => {
  try {
    const [fetchedOptions] = await Promise.all([mockDraftService.getOptions(), loadLeagues(), loadRecent()])
    options.value = fetchedOptions
  } catch (error) {
    console.error('Error loading mock draft setup:', error)
  } finally {
    isLoading.value = false
  }
})
</script>
