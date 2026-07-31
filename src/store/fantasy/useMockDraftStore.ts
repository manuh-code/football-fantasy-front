import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { mockDraftService } from '@/services/fantasy/mockDraft/MockDraftService'
import type {
  MockDraftPick,
  MockDraftPickResponse,
  MockDraftResponse,
  MockDraftTeam,
} from '@/interfaces/fantasy/mockDraft/MockDraftResponse'

/**
 * Presupuesto total (ms) para revelar la ráfaga de picks de los bots.
 *
 * Cuando pickeas, el backend resuelve de golpe todos los turnos de bots hasta
 * que te vuelve a tocar y los devuelve juntos. Soltarlos de golpe en pantalla
 * se siente como un salto; revelarlos uno a uno se siente como una sala de
 * draft. El presupuesto es fijo (no un delay por pick) para que una ráfaga
 * larga —11 bots en una liga de 12— no te robe medio turno.
 */
const REVEAL_BUDGET_MS = 1800
const REVEAL_MAX_STEP_MS = 550

/**
 * Estado de la sala de mock draft.
 *
 * El servidor es la fuente de verdad (cada pick devuelve la instantánea
 * completa), así que aquí no se reconstruye nada a mano: solo se guarda esa
 * instantánea y se controla cuántos picks se han revelado ya en pantalla.
 */
export const useMockDraftStore = defineStore('mockDraft', () => {
  const draft = ref<MockDraftResponse | null>(null)
  const isLoading = ref(false)
  const isPicking = ref(false)
  /**
   * Simular resuelve todos los picks que faltan de una vez, así que es la única
   * acción que puede tardar lo bastante como para que la sala parezca colgada.
   * Va aparte de `isPicking` para poder avisar de que se está simulando sin
   * poner ese mismo cartel en cada fichaje normal.
   */
  const isSimulating = ref(false)
  /** Cuántos picks del board están visibles (los demás se están revelando). */
  const revealedCount = ref(0)
  const isRevealing = ref(false)
  /** Marca de tiempo local del inicio de tu turno — ver el comentario de `turnStartedAt`. */
  const turnStartedAt = ref<number | null>(null)

  let revealTimer: ReturnType<typeof setTimeout> | null = null

  const isCompleted = computed(() => draft.value?.status === 'COMPLETED')

  /**
   * Es tu turno solo cuando el servidor lo dice Y ya terminó la animación de
   * revelado: si no, el botón de pickear se activaría mientras todavía están
   * apareciendo los fichajes de los bots.
   */
  const isMyTurn = computed(
    () => !!draft.value?.is_user_turn && !isRevealing.value && !isCompleted.value,
  )

  const myTeam = computed<MockDraftTeam | null>(
    () => draft.value?.teams.find((team) => team.is_user) ?? null,
  )

  const teamOnTheClock = computed<MockDraftTeam | null>(() => {
    if (!draft.value || draft.value.current_slot === null) return null
    return draft.value.teams.find((team) => team.slot === draft.value?.current_slot) ?? null
  })

  /** Picks visibles ahora mismo, del más reciente al más antiguo. */
  const visiblePicks = computed<MockDraftPick[]>(() =>
    (draft.value?.picks ?? []).slice(0, revealedCount.value),
  )

  const lastPick = computed<MockDraftPick | null>(
    () => visiblePicks.value[visiblePicks.value.length - 1] ?? null,
  )

  /** Plantilla de cada equipo recortada a lo ya revelado, para el board. */
  function rosterFor(slot: number): MockDraftPick[] {
    return visiblePicks.value.filter((pick) => pick.team_slot === slot)
  }

  function stopReveal(): void {
    if (revealTimer) {
      clearTimeout(revealTimer)
      revealTimer = null
    }
    isRevealing.value = false
  }

  /**
   * Termina el revelado de golpe. Se usa al volver a la pestaña: Chrome limita
   * los setTimeout de las pestañas en segundo plano a uno por segundo, así que
   * una ráfaga de 8 bots que debía durar 1,8 s se queda a medias — y como el
   * turno del usuario está bloqueado mientras se revela, volvería a una sala
   * que no le deja pickear todavía.
   */
  function finishReveal(): void {
    if (!isRevealing.value) return

    stopReveal()
    revealedCount.value = draft.value?.picks.length ?? 0
    markTurnStart()
  }

  function handleVisibility(): void {
    if (!document.hidden) finishReveal()
  }

  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', handleVisibility)
  }

  /**
   * Aplica una instantánea revelando progresivamente los picks nuevos.
   * `instant` la aplica de golpe (carga inicial, simulación completa).
   */
  function applySnapshot(snapshot: MockDraftResponse, instant = false): void {
    stopReveal()
    const previous = revealedCount.value
    draft.value = snapshot

    const total = snapshot.picks.length
    const pending = total - previous

    if (instant || pending <= 0) {
      revealedCount.value = total
      markTurnStart()
      return
    }

    revealedCount.value = previous
    isRevealing.value = true

    const step = Math.min(REVEAL_MAX_STEP_MS, Math.max(120, Math.floor(REVEAL_BUDGET_MS / pending)))

    const tick = () => {
      revealedCount.value += 1

      if (revealedCount.value >= total) {
        stopReveal()
        markTurnStart()
        return
      }

      revealTimer = setTimeout(tick, step)
    }

    revealTimer = setTimeout(tick, step)
  }

  /**
   * Arranca el reloj del turno en el cliente.
   *
   * El backend manda `turn_started_at`, pero lo arranca en el instante en que
   * resuelve el pick — antes de que el navegador haya terminado de revelar la
   * ráfaga de bots. Como en un mock no hay rivales humanos a los que sea justo
   * o injusto adelantarse, el reloj arranca cuando la sala está de verdad lista
   * para que elijas, y no te come segundos de animación.
   */
  function markTurnStart(): void {
    turnStartedAt.value = draft.value?.is_user_turn ? Date.now() : null
  }

  async function load(uuid: string): Promise<void> {
    isLoading.value = true
    try {
      revealedCount.value = 0
      applySnapshot(await mockDraftService.show(uuid, { silent: true }), true)
    } finally {
      isLoading.value = false
    }
  }

  function setDraft(snapshot: MockDraftResponse): void {
    revealedCount.value = 0
    applySnapshot(snapshot, true)
  }

  /**
   * Pickea y encadena la ráfaga de bots. Devuelve los fichajes nuevos para que
   * la vista pueda anunciarlos.
   */
  async function pick(playerUuid: string): Promise<MockDraftPickResponse | null> {
    if (!draft.value || isPicking.value) return null

    isPicking.value = true
    try {
      const result = await mockDraftService.pick(draft.value.uuid, playerUuid)
      applySnapshot(result.draft)
      return result
    } finally {
      isPicking.value = false
    }
  }

  async function autoPick(wishlistPlayerUuids: string[] = []): Promise<MockDraftPickResponse | null> {
    if (!draft.value || isPicking.value) return null

    isPicking.value = true
    try {
      const result = await mockDraftService.autoPick(draft.value.uuid, wishlistPlayerUuids)
      applySnapshot(result.draft)
      return result
    } finally {
      isPicking.value = false
    }
  }

  /** Termina el mock de golpe: sin animación, el interés está en el resultado. */
  async function simulate(wishlistPlayerUuids: string[] = []): Promise<MockDraftPickResponse | null> {
    if (!draft.value || isPicking.value) return null

    isPicking.value = true
    isSimulating.value = true
    try {
      const result = await mockDraftService.simulate(draft.value.uuid, wishlistPlayerUuids)
      applySnapshot(result.draft, true)
      return result
    } finally {
      isPicking.value = false
      isSimulating.value = false
    }
  }

  function reset(): void {
    stopReveal()
    draft.value = null
    revealedCount.value = 0
    turnStartedAt.value = null
    isLoading.value = false
    isPicking.value = false
    isSimulating.value = false
  }

  return {
    draft,
    isLoading,
    isPicking,
    isSimulating,
    isRevealing,
    revealedCount,
    turnStartedAt,
    isCompleted,
    isMyTurn,
    myTeam,
    teamOnTheClock,
    visiblePicks,
    lastPick,
    rosterFor,
    finishReveal,
    load,
    setDraft,
    pick,
    autoPick,
    simulate,
    reset,
  }
})
