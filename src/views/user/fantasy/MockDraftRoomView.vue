<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-4 md:py-6 pb-24">
    <div class="container mx-auto px-4 max-w-7xl">
      <!-- Cargando -->
      <div v-if="mockDraftStore.isLoading" class="flex items-center justify-center py-20">
        <v-icon name="pr-spinner" class="w-5 h-5 text-gray-300 dark:text-gray-600" animation="spin" />
      </div>

      <!-- Mock expirado o inexistente: el estado en Redis tiene TTL -->
      <div
        v-else-if="loadFailed"
        class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 px-5 py-8 text-center space-y-3"
      >
        <v-icon name="hi-solid-clock" class="w-10 h-10 text-gray-400 dark:text-gray-500 mx-auto" />
        <h2 class="text-lg font-bold text-gray-900 dark:text-white">
          {{ $t('fantasy.mockDraft.expired.title') }}
        </h2>
        <p class="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
          {{ $t('fantasy.mockDraft.expired.body') }}
        </p>
        <ButtonComponent variant="primary" size="sm" :text="$t('fantasy.mockDraft.expired.cta')" @click="goToSetup" />
      </div>

      <!-- Boleta final -->
      <template v-else-if="results">
        <DraftCompleted class="mb-2.5" />
        <DraftResultsCard :results="results">
          <template #actions>
            <ButtonComponent
              variant="primary"
              size="sm"
              full-width
              :text="$t('fantasy.mockDraft.results.newMock')"
              @click="goToSetup"
            />
            <ButtonComponent
              variant="outline"
              size="sm"
              full-width
              :text="$t('fantasy.draft.menu.board')"
              @click="showBoardPanel = true"
            />
          </template>
        </DraftResultsCard>
      </template>

      <!-- Sala -->
      <div v-else-if="draft" class="space-y-2.5">
        <!-- Barra superior fija: reloj + acciones -->
        <div ref="timerSentinelRef" class="h-0" />
        <div
          class="draft-sticky sticky top-[calc(3rem+env(safe-area-inset-top,0px))] sm:top-[calc(3.5rem+env(safe-area-inset-top,0px))] z-40 space-y-1.5"
        >
          <DraftTimerCard
            :contender="contenderOnTheClock"
            :pick="draft.current_pick"
            :round="draft.current_round"
            :total-rounds="draft.rounds"
            :is-my-turn="mockDraftStore.isMyTurn"
            :duration-seconds="draft.duration_seconds"
            :ends-at="turnEndsAt"
            :compact="isTimerCompact"
            @expired="handleTimerExpired"
          />

          <div
            class="flex items-center gap-1.5 bg-white dark:bg-gray-800 rounded-xl px-2.5 py-1.5 border border-gray-100 dark:border-gray-700/40 shadow-sm"
          >
            <span
              class="flex items-center gap-1.5 text-[0.5rem] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mr-auto truncate"
            >
              <v-icon name="ri-robot-line" class="w-3.5 h-3.5 text-amber-500" />
              {{ $t('fantasy.mockDraft.room.practiceMode') }}
            </span>
            <button
              type="button"
              :disabled="!mockDraftStore.isMyTurn || mockDraftStore.isPicking"
              class="px-2.5 py-1 rounded-lg text-2xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
              @click="handleAutoPick"
            >
              {{ $t('fantasy.mockDraft.room.autoPick') }}
            </button>
            <button
              type="button"
              :disabled="mockDraftStore.isPicking"
              class="px-2.5 py-1 rounded-lg text-2xs font-semibold bg-gray-100 text-gray-600 dark:bg-gray-700/60 dark:text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
              @click="handleSimulate"
            >
              {{ $t('fantasy.mockDraft.room.simulate') }}
            </button>
          </div>
        </div>

        <DraftBoardStrip
          :contenders="contenders"
          :picks="boardPicks"
          :rounds="draft.rounds"
          :total-picks="draft.total_picks"
          :current-pick="draft.current_pick"
          :snake-order="draft.snake_order"
        />

        <!-- Indicador de mi turno -->
        <Transition name="my-turn-bar">
          <div v-if="mockDraftStore.isMyTurn" class="relative overflow-hidden rounded-xl h-1.5">
            <div
              class="absolute inset-0 my-turn-bar-shine bg-gradient-to-r from-emerald-400 via-green-300 to-emerald-400 dark:from-emerald-500 dark:via-green-400 dark:to-emerald-500"
            />
          </div>
        </Transition>

        <!-- Mismo buscador que el draft real, alimentado por el pool del mock -->
        <div class="transition-all duration-500 rounded-2xl" :class="{ 'my-turn-glow': mockDraftStore.isMyTurn }">
          <SearchPlayerFantasy
            :key="draft.uuid"
            ref="searchPlayerRef"
            mode="draft"
            :mock-draft-uuid="draft.uuid"
            :mock-formation="searchFormation"
            :mock-season-uuid="draft.football_season_uuid"
            :disabled="!mockDraftStore.isMyTurn"
            @mock-pick="handlePick"
          />
        </div>

        <div class="h-16" />
      </div>
    </div>

    <!-- Panel de board + wishlist, igual que en el draft real -->
    <MockDraftMenu
      v-if="draft"
      :mock-draft-uuid="draft.uuid"
      :contenders="contenders"
      :picks="allBoardPicks"
      :snake-order="draft.snake_order"
      :is-my-turn="mockDraftStore.isMyTurn"
      :force-open-board="showBoardPanel"
      :my-team="mockDraftStore.myTeam"
      :my-roster="myRoster"
      :formation="draft.formation"
      :pick-handler="handlePick"
      @board-closed="showBoardPanel = false"
      @leave="goToSetup"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ButtonComponent } from '@/components/ui'
import DraftBoardStrip from '@/components/fantasy/draft/shared/DraftBoardStrip.vue'
import DraftResultsCard from '@/components/fantasy/draft/shared/DraftResultsCard.vue'
import DraftTimerCard from '@/components/fantasy/draft/shared/DraftTimerCard.vue'
import DraftCompleted from '@/components/fantasy/draft/DraftCompleted.vue'
import MockDraftMenu from '@/components/fantasy/mockDraft/MockDraftMenu.vue'
import SearchPlayerFantasy from '@/components/user/fantasy/SearchPlayerFantasy.vue'
import { useMockDraftAdapters } from '@/components/fantasy/mockDraft/useMockDraftAdapters'
import { mockDraftService } from '@/services/fantasy/mockDraft/MockDraftService'
import catalogService from '@/services/catalog/CatalogService'
import { useMockDraftStore } from '@/store/fantasy/useMockDraftStore'
import { useDraftWishlistStore } from '@/store/fantasy/useDraftWishlistStore'
import { useToast } from '@/composables/useToast'
import type { FantasyPlayerDraftResponse } from '@/interfaces/fantasy/draft/FantasyPlayerDraftResponse'
import type { DraftResults } from '@/interfaces/fantasy/draft/DraftResults'
import type { MockDraftPickResponse } from '@/interfaces/fantasy/mockDraft/MockDraftResponse'
import type { TypeResponse } from '@/interfaces/football/type/TypeResponse'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const toast = useToast()
const mockDraftStore = useMockDraftStore()
const wishlistStore = useDraftWishlistStore()

const mockDraftUuid = computed(() => route.params.uuid as string)
const draft = computed(() => mockDraftStore.draft)
const results = ref<DraftResults | null>(null)
const loadFailed = ref(false)
const showBoardPanel = ref(false)
const positions = ref<TypeResponse[]>([])

const searchPlayerRef = ref<InstanceType<typeof SearchPlayerFantasy> | null>(null)

const visiblePicks = computed(() => mockDraftStore.visiblePicks)
const allPicks = computed(() => draft.value?.picks ?? [])

const { contenders, boardPicks, searchFormation } = useMockDraftAdapters(draft, visiblePicks, positions)
// La tabla del panel muestra el draft completo, sin recortar por el revelado.
const { boardPicks: allBoardPicks } = useMockDraftAdapters(draft, allPicks, positions)

const contenderOnTheClock = computed(
  () => contenders.value.find((c) => c.key === String(draft.value?.current_slot)) ?? null,
)

/** Momento en que expira tu turno, para el card compartido del reloj. */
const turnEndsAt = computed(() => {
  if (!mockDraftStore.turnStartedAt || !draft.value?.duration_seconds) return null
  return mockDraftStore.turnStartedAt + draft.value.duration_seconds * 1000
})

/** Mi plantilla, recortada a lo ya revelado en pantalla. */
const myRoster = computed(() =>
  draft.value ? mockDraftStore.rosterFor(draft.value.user_slot) : [],
)

/** Wishlist en orden de preferencia — la que respeta el autopick del backend. */
const wishlistUuids = computed(() =>
  wishlistStore.items(mockDraftUuid.value).map((item) => item.player.uuid),
)

// Timer compacto al hacer scroll, igual que en la sala del draft real.
const timerSentinelRef = ref<HTMLElement | null>(null)
const isTimerCompact = ref(false)
let timerObserver: IntersectionObserver | null = null

async function loadPositions(): Promise<void> {
  try {
    positions.value = await catalogService.getTypePosition()
  } catch (error) {
    console.error('Error loading positions for mock draft:', error)
  }
}

async function load(): Promise<void> {
  loadFailed.value = false
  results.value = null

  // El snapshot pudo llegar ya del formulario de creación: evita un fetch de
  // más al entrar en la sala recién creada.
  if (mockDraftStore.draft?.uuid === mockDraftUuid.value) {
    await maybeLoadResults()
    return
  }

  try {
    await mockDraftStore.load(mockDraftUuid.value)
    await maybeLoadResults()
  } catch (error) {
    console.error('Error loading mock draft:', error)
    loadFailed.value = true
  }
}

/** Un mock terminado se abre directamente en su boleta. */
async function maybeLoadResults(): Promise<void> {
  if (!mockDraftStore.isCompleted) return

  try {
    results.value = await mockDraftService.getResults(mockDraftUuid.value)
    wishlistStore.clear(mockDraftUuid.value)
  } catch (error) {
    console.error('Error loading mock draft results:', error)
  }
}

/**
 * Retira del buscador y de la wishlist a todos los que acaban de ser fichados.
 *
 * En el draft real esto lo dispara el eco `player.selected` de Ably; aquí no
 * hay realtime, así que la ráfaga que devuelve el pick es la única señal de que
 * esos jugadores ya no están disponibles. Se hace de golpe (y no al ritmo de la
 * animación del board) para que la lista nunca llegue a ofrecer a alguien que
 * ya tiene dueño: el turno no se habilita hasta que el revelado termina.
 */
function prunePickedPlayers(response: MockDraftPickResponse | null): void {
  const playerUuids = (response?.new_picks ?? [])
    .map((pick) => pick.player?.uuid)
    .filter((uuid): uuid is string => !!uuid)

  if (playerUuids.length === 0) return

  // En una sola pasada: retirarlos uno a uno rompe la animación de salida de la
  // lista y deja filas fantasma (ver removePlayersByUuids).
  searchPlayerRef.value?.removePlayersByUuids(playerUuids)
  playerUuids.forEach((uuid) => wishlistStore.remove(mockDraftUuid.value, uuid))
}

function announcePicks(response: MockDraftPickResponse | null): void {
  prunePickedPlayers(response)

  const botPicks = response?.new_picks.filter((pick) => !pick.is_user) ?? []
  const lastBotPick = botPicks[botPicks.length - 1]

  if (lastBotPick?.player) {
    toast.info(
      t('fantasy.mockDraft.room.botPicked', { name: lastBotPick.team_name ?? '' }),
      lastBotPick.player.display_name ?? '',
      { image: lastBotPick.player.image_path, duration: 4000 },
    )
  }
}

/** Ficha un jugador. Sirve tanto al buscador como a la wishlist. */
async function handlePick(entry: FantasyPlayerDraftResponse): Promise<void> {
  try {
    const response = await mockDraftStore.pick(entry.player.uuid)
    toast.success(
      t('fantasy.search.pickedTitle'),
      t('fantasy.search.pickedBody', { name: entry.player.display_name }),
      { duration: 2500 },
    )
    announcePicks(response)
  } catch (error) {
    console.error('Error picking player in mock draft:', error)
  }
}

async function handleAutoPick(): Promise<void> {
  try {
    announcePicks(await mockDraftStore.autoPick(wishlistUuids.value))
  } catch (error) {
    console.error('Error auto picking in mock draft:', error)
  }
}

async function handleSimulate(): Promise<void> {
  try {
    prunePickedPlayers(await mockDraftStore.simulate(wishlistUuids.value))
  } catch (error) {
    console.error('Error simulating mock draft:', error)
  }
}

/**
 * Se acabó tu tiempo: el backend no corta el turno por reloj (no hay rivales a
 * quienes bloquear), es el cliente quien pide el autopick — con tu wishlist
 * como prioridad, para que un despiste no te cueste el pick.
 */
function handleTimerExpired(): void {
  if (!mockDraftStore.isMyTurn || mockDraftStore.isPicking) return
  toast.info(t('fantasy.mockDraft.room.timeUp'), t('fantasy.mockDraft.room.timeUpBody'))
  handleAutoPick()
}

// Cuando el mock termina (por picks o por simulación), pasar a la boleta.
watch(
  () => mockDraftStore.isCompleted,
  async (completed) => {
    if (completed && !mockDraftStore.isRevealing) await maybeLoadResults()
  },
)

watch(mockDraftUuid, load)

function goToSetup(): void {
  router.push({ name: 'mockDraftSetup' })
}

onMounted(async () => {
  if (timerSentinelRef.value) {
    timerObserver = new IntersectionObserver(([entry]) => {
      isTimerCompact.value = !entry.isIntersecting
    })
    timerObserver.observe(timerSentinelRef.value)
  }

  await Promise.all([loadPositions(), load()])
})

onUnmounted(() => {
  timerObserver?.disconnect()
  timerObserver = null
  mockDraftStore.reset()
})
</script>

<style scoped>
/* Igual que en la sala del draft real: la barra sticky se promueve a su propia
   capa para que el contenido de detrás no parpadee al hacer scroll. */
.draft-sticky {
  will-change: transform;
  transform: translateZ(0);
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
}

.my-turn-bar-enter-active {
  transition: all 0.6s ease-out;
}
.my-turn-bar-leave-active {
  transition: all 0.4s ease-in;
}
.my-turn-bar-enter-from,
.my-turn-bar-leave-to {
  opacity: 0;
  transform: scaleX(0);
}

.my-turn-bar-shine {
  background-size: 200% 100%;
  animation: barShine 2s ease-in-out infinite;
}

@keyframes barShine {
  0% {
    background-position: 100% 0;
  }
  50% {
    background-position: 0% 0;
  }
  100% {
    background-position: 100% 0;
  }
}

.my-turn-glow {
  box-shadow:
    0 0 0 2px rgba(52, 211, 153, 0.5),
    0 0 12px rgba(52, 211, 153, 0.25),
    0 0 24px rgba(52, 211, 153, 0.1);
  animation: turnGlow 2.5s ease-in-out infinite;
}

@keyframes turnGlow {
  0%,
  100% {
    box-shadow:
      0 0 0 2px rgba(52, 211, 153, 0.4),
      0 0 12px rgba(52, 211, 153, 0.2),
      0 0 24px rgba(52, 211, 153, 0.08);
  }
  50% {
    box-shadow:
      0 0 0 2px rgba(52, 211, 153, 0.7),
      0 0 20px rgba(52, 211, 153, 0.35),
      0 0 40px rgba(52, 211, 153, 0.15);
  }
}

@media (prefers-reduced-motion: reduce) {
  .my-turn-glow,
  .my-turn-bar-shine {
    animation: none;
  }
}
</style>
