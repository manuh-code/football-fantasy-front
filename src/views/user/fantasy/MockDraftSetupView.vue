<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-4 md:py-8">
    <div class="container mx-auto px-4 max-w-2xl space-y-3">
      <!-- Intro -->
      <header
        class="relative overflow-hidden rounded-2xl px-5 py-6 text-center shadow-sm bg-gradient-to-br from-emerald-700 to-teal-800"
      >
        <div class="absolute -top-10 -right-8 w-32 h-32 rounded-full bg-white/10 blur-2xl" aria-hidden="true" />
        <div class="absolute -bottom-12 -left-10 w-32 h-32 rounded-full bg-black/10 blur-2xl" aria-hidden="true" />

        <div class="relative">
          <span
            class="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white/15 ring-1 ring-inset ring-white/25 backdrop-blur-sm mb-3"
          >
            <v-icon name="ri-robot-line" class="w-6 h-6 text-white" />
          </span>
          <h1 class="text-2xl font-black text-white tracking-tight">
            {{ $t('fantasy.mockDraft.intro.title') }}
          </h1>
          <p class="text-xs text-white/90 mt-1.5 max-w-sm mx-auto leading-relaxed">
            {{ $t('fantasy.mockDraft.intro.body') }}
          </p>

          <ul class="flex flex-wrap items-center justify-center gap-1.5 mt-4">
            <li
              v-for="badge in badges"
              :key="badge.key"
              class="flex items-center gap-1 px-2 py-1 rounded-full bg-white/10 ring-1 ring-inset ring-white/20 text-2xs font-semibold text-white"
            >
              <v-icon :name="badge.icon" class="w-3 h-3" />
              {{ $t(`fantasy.mockDraft.intro.badges.${badge.key}`) }}
            </li>
          </ul>
        </div>
      </header>

      <!-- Cargando opciones: esqueleto con la misma silueta del formulario para
           que la vista no dé un salto al resolverse. -->
      <div v-if="isLoading" class="space-y-3" aria-busy="true" :aria-label="$t('common.states.loading')">
        <div
          v-for="block in 3"
          :key="block"
          class="rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60 p-4 animate-pulse"
        >
          <div class="flex items-center gap-2.5 mb-4">
            <div class="w-8 h-8 rounded-xl bg-gray-200 dark:bg-gray-700 shrink-0" />
            <div class="flex-1 space-y-1.5">
              <div class="h-3 w-1/3 rounded bg-gray-200 dark:bg-gray-700" />
              <div class="h-2 w-1/2 rounded bg-gray-100 dark:bg-gray-700/60" />
            </div>
          </div>
          <div class="h-11 rounded-xl bg-gray-100 dark:bg-gray-700/60" />
        </div>
      </div>

      <!-- Las opciones no cargaron: sin ellas no hay formulario que pintar. -->
      <div
        v-else-if="!options"
        class="rounded-2xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700/60 p-6 text-center"
      >
        <span
          class="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400 mb-3"
        >
          <v-icon name="hi-solid-exclamation-circle" class="w-6 h-6" />
        </span>
        <h2 class="text-base font-bold text-gray-900 dark:text-white">
          {{ $t('fantasy.mockDraft.setup.errorTitle') }}
        </h2>
        <p class="text-2xs text-gray-500 dark:text-gray-400 mt-1 mb-4 max-w-xs mx-auto">
          {{ $t('fantasy.mockDraft.setup.errorBody') }}
        </p>
        <ButtonComponent
          variant="primary"
          size="md"
          icon="hi-solid-refresh"
          :text="$t('common.actions.retry')"
          @click="load"
        />
      </div>

      <template v-else>
        <MockDraftSetupForm
          :options="options"
          :leagues="leagues"
          :is-submitting="isCreating"
          :preset-league-uuid="presetLeagueUuid"
          @submit="createMockDraft"
        />

        <!-- Mocks recientes -->
        <section
          v-if="recent.length"
          class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 overflow-hidden"
        >
          <div class="flex items-center gap-2.5 px-4 pt-4 pb-3">
            <span
              class="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
            >
              <v-icon name="md-history" class="w-4 h-4" />
            </span>
            <div class="min-w-0">
              <h2 class="text-sm font-bold text-gray-900 dark:text-white leading-tight">
                {{ $t('fantasy.mockDraft.recent.title') }}
              </h2>
              <p class="text-2xs text-gray-500 dark:text-gray-400 leading-tight">
                {{ $t('fantasy.mockDraft.recent.ttlNotice') }}
              </p>
            </div>
          </div>

          <ul class="divide-y divide-gray-100 dark:divide-gray-700/60 border-t border-gray-100 dark:border-gray-700/60">
            <li v-for="mock in recent" :key="mock.uuid" class="flex items-stretch">
              <button
                type="button"
                class="flex items-center gap-3 flex-1 min-w-0 text-left px-4 py-3 transition-colors cursor-pointer touch-manipulation hover:bg-gray-50 dark:hover:bg-gray-700/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-500/50"
                @click="openMock(mock)"
              >
                <span
                  class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  :class="
                    mock.status === 'COMPLETED'
                      ? 'bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500'
                      : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
                  "
                >
                  <v-icon
                    :name="mock.status === 'COMPLETED' ? 'hi-solid-check' : 'ri-timer-flash-line'"
                    class="w-5 h-5"
                  />
                </span>

                <span class="min-w-0 flex-1">
                  <span class="flex items-center gap-1.5">
                    <span class="text-sm font-semibold text-gray-900 dark:text-white truncate">
                      {{ mock.fantasy_league_name || $t('fantasy.mockDraft.recent.freeMock') }}
                    </span>
                    <span
                      class="shrink-0 px-1.5 py-0.5 rounded-md text-2xs font-bold"
                      :class="
                        mock.status === 'COMPLETED'
                          ? 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                          : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400'
                      "
                    >
                      {{
                        mock.status === 'COMPLETED'
                          ? $t('fantasy.mockDraft.recent.statusCompleted')
                          : $t('fantasy.mockDraft.recent.statusActive')
                      }}
                    </span>
                  </span>

                  <span class="block text-2xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                    {{ $t('fantasy.mockDraft.recent.detail', {
                      teams: mock.teams_count,
                      difficulty: $t(`fantasy.mockDraft.difficulty.${mock.difficulty}`),
                      picks: mock.picks_made,
                      total: mock.total_picks,
                    }) }}
                    <template v-if="relativeTime(mock.created_at)">
                      · {{ relativeTime(mock.created_at) }}
                    </template>
                  </span>

                  <span
                    v-if="mock.status !== 'COMPLETED' && mock.total_picks"
                    class="block h-1 mt-1.5 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden"
                  >
                    <span
                      class="block h-full rounded-full bg-emerald-600 dark:bg-emerald-400"
                      :style="{ width: `${Math.round((mock.picks_made / mock.total_picks) * 100)}%` }"
                    />
                  </span>
                </span>

                <v-icon name="hi-solid-chevron-right" class="w-4 h-4 shrink-0 text-gray-400 dark:text-gray-500" />
              </button>

              <!-- Borrar es destructivo e irreversible: el primer toque arma la
                   confirmación y se desarma sola a los pocos segundos. -->
              <button
                type="button"
                class="shrink-0 min-w-[44px] px-3 flex items-center justify-center transition-colors cursor-pointer touch-manipulation focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-red-500/50"
                :class="
                  pendingDelete === mock.uuid
                    ? 'bg-red-600 text-white'
                    : 'text-gray-500 hover:text-red-600 hover:bg-red-50 dark:text-gray-400 dark:hover:bg-red-500/10'
                "
                :aria-label="
                  pendingDelete === mock.uuid
                    ? $t('fantasy.mockDraft.recent.confirmDelete')
                    : $t('fantasy.mockDraft.recent.delete')
                "
                @click="requestDelete(mock)"
              >
                <span v-if="pendingDelete === mock.uuid" class="text-2xs font-bold whitespace-nowrap">
                  {{ $t('fantasy.mockDraft.recent.confirmDelete') }}
                </span>
                <v-icon v-else name="hi-solid-trash" class="w-4 h-4" />
              </button>
            </li>
          </ul>
        </section>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import MockDraftSetupForm from '@/components/fantasy/mockDraft/MockDraftSetupForm.vue'
import { ButtonComponent } from '@/components/ui'
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
const { t, locale } = useI18n()
const toast = useToast()
const userStore = useUserStore()
const footballLeagueStore = useFootballLeagueStore()
const mockDraftStore = useMockDraftStore()

const options = ref<MockDraftOptions | null>(null)
const recent = ref<MockDraftSummary[]>([])
const leagues = ref<FantasyLeaguesResponse[]>([])
const isLoading = ref(true)
const isCreating = ref(false)
/** Mock cuyo botón de borrar está armado, a la espera del segundo toque. */
const pendingDelete = ref<string | null>(null)
let pendingDeleteTimer: ReturnType<typeof setTimeout> | null = null

const badges = [
  { key: 'free', icon: 'hi-solid-sparkles' },
  { key: 'instant', icon: 'hi-solid-lightning-bolt' },
  { key: 'noRisk', icon: 'hi-solid-shield-check' },
] as const

/** Entrar desde una liga con "practicar mi draft" preselecciona su preset. */
const presetLeagueUuid = computed(() => (route.query.league as string) ?? null)

/** "hace 2 horas" para los mocks recientes, en el idioma activo. */
function relativeTime(iso: string | null): string | null {
  if (!iso) return null
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return null

  const diff = date.getTime() - Date.now()
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ['day', 86_400_000],
    ['hour', 3_600_000],
    ['minute', 60_000],
  ]
  const formatter = new Intl.RelativeTimeFormat(locale.value, { numeric: 'auto' })
  for (const [unit, ms] of units) {
    if (Math.abs(diff) >= ms) return formatter.format(Math.round(diff / ms), unit)
  }
  return t('fantasy.mockDraft.recent.justNow')
}

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

function clearPendingDelete(): void {
  if (pendingDeleteTimer) clearTimeout(pendingDeleteTimer)
  pendingDeleteTimer = null
  pendingDelete.value = null
}

function requestDelete(mock: MockDraftSummary): void {
  if (pendingDelete.value === mock.uuid) {
    clearPendingDelete()
    void removeMock(mock)
    return
  }
  if (pendingDeleteTimer) clearTimeout(pendingDeleteTimer)
  pendingDelete.value = mock.uuid
  pendingDeleteTimer = setTimeout(clearPendingDelete, 4000)
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

async function load(): Promise<void> {
  isLoading.value = true
  try {
    const [fetchedOptions] = await Promise.all([mockDraftService.getOptions(), loadLeagues(), loadRecent()])
    options.value = fetchedOptions
  } catch (error) {
    console.error('Error loading mock draft setup:', error)
    options.value = null
  } finally {
    isLoading.value = false
  }
}

onMounted(load)
onUnmounted(clearPendingDelete)
</script>
