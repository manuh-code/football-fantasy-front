import { ref, computed, onUnmounted } from 'vue'
import type { DraftTurn } from './useDraftChannel'

export function useDraftTimer() {
  const timeRemaining = ref(0)
  const timerExpired = ref(false)
  const totalDuration = ref(60)
  let interval: ReturnType<typeof setInterval> | null = null

  // ── Derived state ─────────────────────────────────────────────

  /** Progress from 1 (full) to 0 (expired) */
  const timerProgress = computed(() => {
    if (totalDuration.value <= 0) return 1
    return Math.max(0, Math.min(1, timeRemaining.value / totalDuration.value))
  })

  /** Formatted time string (e.g. "0:45") */
  const formattedTime = computed(() => {
    const secs = Math.max(0, Math.ceil(timeRemaining.value))
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${m}:${String(s).padStart(2, '0')}`
  })

  /** Urgency level based on remaining percentage */
  const timerUrgency = computed<'normal' | 'warning' | 'critical'>(() => {
    if (timerExpired.value) return 'critical'
    const pct = timerProgress.value
    if (pct <= 0.2) return 'critical'
    if (pct <= 0.4) return 'warning'
    return 'normal'
  })

  // ── Core methods ──────────────────────────────────────────────

  /**
   * Start the countdown from a server-provided Unix timestamp.
   * @param turnStartedAt  Unix timestamp (float, e.g. 1710000000.483)
   * @param duration       Turn duration in seconds (default: 60)
   */
  function startFrom(turnStartedAt: number, duration = 60) {
    stop()
    totalDuration.value = duration
    timerExpired.value = false

    // Update 4 times per second for fluid UI
    interval = setInterval(() => {
      const elapsed = Date.now() / 1000 - turnStartedAt
      const remaining = duration - elapsed

      if (remaining <= 0) {
        timeRemaining.value = 0
        timerExpired.value = true
        stop()
        return
      }

      timeRemaining.value = remaining
    }, 250)
  }

  /**
   * Sync timer state from a DraftTurn object.
   * Extracts turn_started_at and pick_timer to start countdown.
   */
  function syncWithTurn(turn: DraftTurn | null) {
    if (!turn?.turn_started_at || !turn?.pick_timer) {
      stop()
      timeRemaining.value = 0
      timerExpired.value = false
      return
    }
    startFrom(turn.turn_started_at, turn.pick_timer)
  }

  function stop() {
    if (interval) {
      clearInterval(interval)
      interval = null
    }
  }

  onUnmounted(stop)

  return {
    timeRemaining,
    timerExpired,
    timerProgress,
    formattedTime,
    timerUrgency,
    startFrom,
    syncWithTurn,
    stop,
  }
}