import { ref, computed, watch, onUnmounted, type Ref, type ComputedRef } from 'vue'

/**
 * Composable that manages a countdown timer for the fantasy draft.
 *
 * - Default duration: 60 seconds (overridden by `pickTimeSeconds` if > 0).
 * - Automatically (re)starts when `currentTurn` changes.
 * - Stops when draft completes.
 * - Exposes reactive state for the UI (progress, urgency, formatted time, etc.).
 *
 * @param pickTimeSeconds  – Seconds per pick coming from the league config (0 = use default 60).
 * @param currentTurn      – Ref to the current draft turn object (null when no active turn).
 * @param isDraftComplete  – Ref that becomes `true` once the draft finishes.
 * @param isMyTurn         – Ref that indicates whether it's the current user's turn.
 * @param onExpired        – Callback executed once the timer reaches 0.
 */
export function useDraftTimer(
  pickTimeSeconds: ComputedRef<number> | Ref<number>,
  currentTurn: Ref<unknown>,
  isDraftComplete: Ref<boolean>,
  isMyTurn: Ref<boolean>,
  onExpired: () => void,
) {
  // ── Constants ──────────────────────────────────────────────────
  const DEFAULT_PICK_TIME = 60

  // ── State ──────────────────────────────────────────────────────
  const timeRemaining = ref(0)
  const expired = ref(false)
  let timerInterval: ReturnType<typeof setInterval> | null = null

  /**
   * Generation counter — incremented every time `start()` is called.
   * The interval callback checks this to ensure it doesn't expire
   * a stale timer after the turn has already changed.
   */
  let generation = 0

  // ── Computed ───────────────────────────────────────────────────

  /** Effective duration: uses backend value when > 0, otherwise 60 s */
  const duration = computed(() => {
    const backendValue = pickTimeSeconds.value
    return backendValue > 0 ? backendValue : DEFAULT_PICK_TIME
  })

  /** Formatted countdown string (e.g. "1:05" or "42") */
  const formattedTime = computed(() => {
    const t = timeRemaining.value
    if (t <= 0) return '0'
    if (t >= 60) {
      const m = Math.floor(t / 60)
      const s = t % 60
      return `${m}:${s.toString().padStart(2, '0')}`
    }
    return String(t)
  })

  /** Fraction remaining (1 → just started, 0 → expired) */
  const progress = computed(() => {
    if (duration.value <= 0) return 0
    return timeRemaining.value / duration.value
  })

  /** Urgency level based on remaining percentage */
  const urgency = computed<'normal' | 'warning' | 'critical'>(() => {
    const pct = progress.value
    if (pct <= 0.15) return 'critical'
    if (pct <= 0.35) return 'warning'
    return 'normal'
  })

  /** TailwindCSS class for the progress bar fill */
  const barColor = computed(() => {
    if (urgency.value === 'critical') return 'bg-red-400'
    if (urgency.value === 'warning') return 'bg-yellow-300'
    return 'bg-white/80'
  })

  /** TailwindCSS classes for the entire timer banner */
  const bannerClass = computed(() => {
    if (expired.value) {
      return 'bg-gradient-to-r from-gray-600 to-gray-700'
    }
    if (urgency.value === 'critical') {
      return isMyTurn.value
        ? 'bg-gradient-to-r from-red-600 to-red-700 ring-2 ring-red-400 ring-offset-2 dark:ring-offset-gray-900'
        : 'bg-gradient-to-r from-red-500 to-orange-500'
    }
    if (urgency.value === 'warning') {
      return isMyTurn.value
        ? 'bg-gradient-to-r from-amber-500 to-orange-500 ring-2 ring-amber-400 ring-offset-2 dark:ring-offset-gray-900'
        : 'bg-gradient-to-r from-amber-500 to-yellow-500'
    }
    return isMyTurn.value
      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 ring-2 ring-emerald-400 ring-offset-2 dark:ring-offset-gray-900'
      : 'bg-gradient-to-r from-blue-500 to-indigo-500'
  })

  // ── Methods ────────────────────────────────────────────────────

  function start() {
    stop()
    expired.value = false
    if (isDraftComplete.value || !currentTurn.value) return

    // Bump generation so any lingering old interval callback becomes a no-op
    const gen = ++generation

    timeRemaining.value = duration.value

    timerInterval = setInterval(() => {
      // Guard: if generation changed, this interval is stale (turn changed)
      if (gen !== generation) {
        clearInterval(timerInterval!)
        timerInterval = null
        return
      }

      timeRemaining.value--
      if (timeRemaining.value <= 0) {
        timeRemaining.value = 0
        expired.value = true
        stop()
        onExpired()
      }
    }, 1000)
  }

  function stop() {
    if (timerInterval) {
      clearInterval(timerInterval)
      timerInterval = null
    }
  }

  // ── Watchers ───────────────────────────────────────────────────

  // Restart timer whenever the current turn changes
  watch(
    currentTurn,
    (newTurn) => {
      if (newTurn && !isDraftComplete.value) {
        start()
      } else {
        stop()
      }
    },
    { immediate: true },
  )

  // Stop timer when draft completes
  watch(isDraftComplete, (done) => {
    if (done) stop()
  })

  // ── Cleanup ────────────────────────────────────────────────────
  onUnmounted(() => stop())

  return {
    /** Seconds left on the clock */
    timeRemaining,
    /** Whether the timer has hit 0 */
    expired,
    /** Effective pick-time duration in use */
    duration,
    /** e.g. "42" or "1:05" */
    formattedTime,
    /** 0-1 fraction of time remaining */
    progress,
    /** 'normal' | 'warning' | 'critical' */
    urgency,
    /** Tailwind class for progress bar */
    barColor,
    /** Tailwind classes for the banner wrapper */
    bannerClass,
    /** Manually (re)start the timer */
    start,
    /** Manually stop the timer */
    stop,
  }
}
