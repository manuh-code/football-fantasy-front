import { ref, computed, onUnmounted } from 'vue'
import type { DraftTurn } from './useDraftChannel'

export function useDraftTimer() {
  const timeRemaining = ref(0)
  const timerExpired = ref(false)
  let intervalId: ReturnType<typeof setInterval> | null = null
  let currentTurnStartedAt: Date | null = null
  let currentPickTimer = 0

  function calculateRemaining(): number {
    if (!currentTurnStartedAt || currentPickTimer <= 0) return 0
    const now = Date.now()
    const started = currentTurnStartedAt.getTime()
    const elapsed = Math.floor((now - started) / 1000)
    return Math.max(0, currentPickTimer - elapsed)
  }

  function tick() {
    const remaining = calculateRemaining()
    timeRemaining.value = remaining
    if (remaining <= 0) {
      timerExpired.value = true
      stopTimer()
    }
  }

  function startInterval() {
    stopTimer()
    timerExpired.value = false
    tick()
    intervalId = setInterval(tick, 1000)
  }

  function stopTimer() {
    if (intervalId) {
      clearInterval(intervalId)
      intervalId = null
    }
  }

  function syncWithTurn(turn: DraftTurn | null) {
    stopTimer()
    if (!turn || !turn.turn_started_at || !turn.pick_timer) {
      timeRemaining.value = 0
      timerExpired.value = false
      currentTurnStartedAt = null
      currentPickTimer = 0
      return
    }
    currentTurnStartedAt = new Date(turn.turn_started_at)
    currentPickTimer = turn.pick_timer
    startInterval()
  }

  const timerProgress = computed(() => {
    if (currentPickTimer <= 0) return 1
    return timeRemaining.value / currentPickTimer
  })

  const formattedTime = computed(() => {
    const total = timeRemaining.value
    const minutes = Math.floor(total / 60)
    const seconds = total % 60
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  })

  const timerUrgency = computed<'normal' | 'warning' | 'critical'>(() => {
    if (currentPickTimer <= 0) return 'normal'
    const ratio = timeRemaining.value / currentPickTimer
    if (ratio <= 0.15 || timeRemaining.value <= 10) return 'critical'
    if (ratio <= 0.35 || timeRemaining.value <= 30) return 'warning'
    return 'normal'
  })

  onUnmounted(() => {
    stopTimer()
  })

  return {
    timeRemaining,
    timerExpired,
    timerProgress,
    formattedTime,
    timerUrgency,
    stopTimer,
    syncWithTurn,
  }
}
