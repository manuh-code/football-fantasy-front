<template>
  <div :class="compact ? '' : 'pb-1'">
    <div
      role="timer"
      :aria-label="headline"
      class="timer-surface flex items-center bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60 shadow-sm transition-[padding,border-radius,gap,box-shadow] duration-300 ease-out"
      :class="[compact ? 'rounded-xl gap-2.5 px-3 py-2' : 'rounded-2xl gap-3 px-4 py-3', palette.card]"
    >
      <!-- Avatar del participante en el reloj, envuelto por el anillo -->
      <div
        class="ring-wrap relative shrink-0 transition-[width,height] duration-300 ease-out"
        :class="compact ? 'w-9 h-9' : 'w-14 h-14'"
      >
        <svg class="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 36 36" aria-hidden="true">
          <circle
            cx="18"
            cy="18"
            r="16"
            fill="none"
            stroke-width="3"
            stroke="currentColor"
            class="text-gray-200 dark:text-gray-700"
          />
          <circle
            v-if="hasTimer"
            cx="18"
            cy="18"
            r="16"
            fill="none"
            stroke-width="3"
            stroke-linecap="round"
            stroke="currentColor"
            class="ring-progress"
            :class="palette.ring"
            :style="{ strokeDasharray: RING_C, strokeDashoffset: ringDashoffset }"
          />
        </svg>

        <div
          class="absolute inset-[9%] rounded-full overflow-hidden flex items-center justify-center font-bold"
          :class="[
            compact ? 'text-2xs' : 'text-sm',
            contender?.isMe
              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300'
              : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400',
            isMyTurn ? 'ring-pulse' : '',
          ]"
        >
          <img
            v-if="contender?.avatar"
            :src="contender.avatar"
            :alt="contender.name"
            class="w-full h-full object-cover"
          />
          <template v-else>{{ contender?.initials ?? '?' }}</template>
        </div>
      </div>

      <!-- Quién está en el reloj -->
      <div class="min-w-0 flex-1">
        <p
          class="font-bold text-gray-900 dark:text-white leading-tight truncate transition-[font-size] duration-300"
          :class="compact ? 'text-xs' : 'text-sm'"
        >
          {{ headline }}
        </p>
        <!-- Con el turno en tregua, el pick/ronda cede el sitio: esa misma
             información está en el board justo debajo, y lo que hace falta
             explicar es por qué el reloj es tan corto. -->
        <p v-if="!compact && absent" class="flex items-center gap-1 min-w-0 text-2xs font-medium text-amber-600 dark:text-amber-400 mt-0.5">
          <v-icon name="ri-robot-line" class="w-3 h-3 shrink-0" />
          <span class="truncate">{{ $t('fantasy.draft.timer.absent') }}</span>
        </p>
        <p v-else-if="!compact && contender" class="text-2xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
          {{ $t('fantasy.draft.timer.pickRound', { pick: pick ?? '-', round: round ?? '-' }) }}
          <span v-if="totalRounds"> / {{ totalRounds }}</span>
        </p>
        <p v-else-if="!compact" class="text-2xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
          {{ $t('fantasy.draft.timer.waitingSub') }}
        </p>
      </div>

      <!-- Cuenta atrás. En compacto la subline no existe, así que el motivo de
           la tregua viaja como icono pegado al número. -->
      <div class="shrink-0 flex items-center gap-1.5 text-right leading-none">
        <v-icon
          v-if="absent && compact"
          name="ri-robot-line"
          class="w-3.5 h-3.5 text-amber-500 dark:text-amber-400"
          :aria-label="$t('fantasy.draft.timer.absent')"
        />
        <div>
          <template v-if="hasTimer">
            <span
              class="count-surface inline-block font-black tabular-nums tracking-tight transition-[font-size,color] duration-300"
              :class="[compact ? 'text-lg' : 'text-3xl', palette.time, urgency === 'critical' || expired ? 'animate-pulse' : '']"
            >
              {{ displayTime }}
            </span>
            <p
              v-if="!compact && expired"
              class="text-2xs font-medium mt-1 uppercase tracking-wider text-red-500/80 dark:text-red-400/80"
            >
              {{ $t('fantasy.draft.timer.expired') }}
            </p>
          </template>
          <v-icon
            v-else
            name="hi-solid-clock"
            class="text-gray-300 dark:text-gray-600"
            :class="compact ? 'w-4 h-4' : 'w-6 h-6'"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import type { DraftContender } from '@/components/fantasy/draft/shared/draftShared'

/**
 * El card del turno, compartido por el draft real y el mock draft.
 *
 * Es agnóstico de dónde sale el reloj: recibe `endsAt` ya calculado (epoch en
 * milisegundos). El draft real lo deriva del `turn_started_at` del servidor,
 * porque ahí sí hay rivales a los que sería injusto adelantarse; el mock lo
 * arranca localmente cuando la sala termina de revelar los picks de los bots.
 */
const props = withDefaults(
  defineProps<{
    contender: DraftContender | null
    pick: number | null
    round: number | null
    totalRounds?: number | null
    isMyTurn: boolean
    /** Duración del turno en segundos. 0 o null = sin límite de tiempo. */
    durationSeconds: number | null
    /** Momento en que expira el turno (Date.now() + restante). */
    endsAt: number | null
    compact?: boolean
    /** Texto alternativo cuando no hay nadie en el reloj (esperando). */
    waitingLabel?: string | null
    /**
     * El del reloj no está conectado a la sala, así que su turno corre con una
     * duración reducida y se resuelve por autopick. Solo el draft real lo usa:
     * en el mock nadie puede ausentarse.
     */
    absent?: boolean
  }>(),
  { totalRounds: null, compact: false, waitingLabel: null, absent: false },
)

const emit = defineEmits<{ expired: [] }>()

const RING_C = 2 * Math.PI * 16

const { t } = useI18n()

const secondsLeft = ref(0)
const expired = ref(false)
let intervalId: ReturnType<typeof setInterval> | null = null

const hasTimer = computed(() => !!props.durationSeconds && props.durationSeconds > 0 && !!props.endsAt)

const headline = computed(() => {
  if (!props.contender) return props.waitingLabel ?? t('fantasy.draft.timer.waiting')
  if (props.isMyTurn) return t('fantasy.draft.timer.yourTurn')
  return t('fantasy.draft.timer.userTurn', { name: props.contender.name })
})

const displayTime = computed(() => {
  if (expired.value) return '0'
  const mins = Math.floor(secondsLeft.value / 60)
  const secs = secondsLeft.value % 60
  return mins > 0 ? `${mins}:${String(secs).padStart(2, '0')}` : `${secs}`
})

const urgency = computed(() => {
  if (!hasTimer.value) return 'idle'
  const total = props.durationSeconds ?? 0
  const ratio = total > 0 ? secondsLeft.value / total : 1
  if (ratio <= 0.15) return 'critical'
  if (ratio <= 0.35) return 'warning'
  return 'idle'
})

const palette = computed(() => {
  if (expired.value) {
    return { ring: 'text-red-400', time: 'text-red-500 dark:text-red-400', card: 'ring-1 ring-red-500/25' }
  }
  if (urgency.value === 'critical') {
    return { ring: 'text-red-500', time: 'text-red-600 dark:text-red-400', card: 'ring-1 ring-red-500/40' }
  }
  if (urgency.value === 'warning') {
    return { ring: 'text-amber-500', time: 'text-amber-600 dark:text-amber-400', card: 'ring-1 ring-amber-500/25' }
  }
  if (props.isMyTurn) {
    return { ring: 'text-emerald-500', time: 'text-emerald-600 dark:text-emerald-400', card: 'ring-1 ring-emerald-500/25' }
  }
  return { ring: 'text-blue-500 dark:text-blue-400', time: 'text-gray-900 dark:text-white', card: '' }
})

const ringDashoffset = computed(() => {
  const total = props.durationSeconds ?? 0
  if (total <= 0) return 0
  return RING_C * (1 - secondsLeft.value / total)
})

function stopTimer(): void {
  if (intervalId) {
    clearInterval(intervalId)
    intervalId = null
  }
}

function tick(): void {
  secondsLeft.value = Math.max(0, Math.ceil(((props.endsAt ?? 0) - Date.now()) / 1000))

  if (secondsLeft.value <= 0) {
    expired.value = true
    stopTimer()
    emit('expired')
  }
}

watch(
  () => [props.endsAt, props.durationSeconds, props.isMyTurn] as const,
  () => {
    stopTimer()
    expired.value = false

    if (!hasTimer.value) {
      secondsLeft.value = props.durationSeconds ?? 0
      return
    }

    tick()

    if (!expired.value) {
      intervalId = setInterval(tick, 1000)
    }
  },
  { immediate: true },
)

onUnmounted(stopTimer)
</script>

<style scoped>
.tabular-nums {
  font-variant-numeric: tabular-nums;
}

/* El card vive dentro de un contenedor sticky y el anillo repinta cada frame.
   Promoverlo a su propia capa de composición evita que el contenido de detrás
   parpadee al hacer scroll (mismo tratamiento que tenía DraftTimer). */
.timer-surface,
.ring-wrap,
.count-surface {
  transform: translateZ(0);
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
  -webkit-text-size-adjust: 100%;
  text-size-adjust: 100%;
}

.ring-wrap {
  contain: paint;
}

.ring-progress {
  transition: stroke-dashoffset 1s linear, stroke 300ms ease;
}

@keyframes ring-pulse {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.9;
    transform: scale(1.04);
  }
}
.ring-pulse {
  animation: ring-pulse 2s ease-in-out infinite;
}

@media (prefers-reduced-motion: reduce) {
  .ring-progress,
  .ring-pulse,
  .animate-pulse {
    animation: none !important;
    transition: none !important;
  }
}
</style>
