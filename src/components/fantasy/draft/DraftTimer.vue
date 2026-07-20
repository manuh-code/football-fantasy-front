<template>
  <div :class="compact ? '' : 'pb-1'">
    <!-- Active turn -->
    <div
      v-if="turn"
      role="timer"
      :aria-label="isMyTurn ? $t('fantasy.draft.timer.yourTurn') : $t('fantasy.draft.timer.userTurn', { name: turn.user?.firstname ?? $t('fantasy.draft.timer.unknown') })"
      class="flex items-center bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60 shadow-sm transition-[padding,border-radius,gap,box-shadow] duration-300 ease-out"
      :class="[
        compact ? 'rounded-xl gap-2.5 px-3 py-2' : 'rounded-2xl gap-3 px-4 py-3',
        c.card,
      ]"
    >
      <!-- Avatar wrapped by the countdown ring — the clock is on THIS player -->
      <div
        class="relative shrink-0 transition-[width,height] duration-300 ease-out"
        :class="compact ? 'w-9 h-9' : 'w-14 h-14'"
      >
        <svg
          class="absolute inset-0 h-full w-full -rotate-90"
          viewBox="0 0 36 36"
          aria-hidden="true"
        >
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
            cx="18"
            cy="18"
            r="16"
            fill="none"
            stroke-width="3"
            stroke-linecap="round"
            stroke="currentColor"
            class="ring-progress"
            :class="c.ring"
            :style="{ strokeDasharray: RING_C, strokeDashoffset: ringDashoffset }"
          />
        </svg>

        <div
          class="absolute inset-[9%] rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700"
          :class="{ 'ring-pulse': c.pulse }"
        >
          <img
            v-if="turn.user?.avatar"
            :src="turn.user.avatar"
            :alt="turn.user?.firstname ?? ''"
            class="w-full h-full object-cover"
          />
          <div
            v-else
            class="w-full h-full flex items-center justify-center font-bold text-gray-400 dark:text-gray-500"
            :class="compact ? 'text-2xs' : 'text-sm'"
          >
            {{ getInitials(turn.user) }}
          </div>
        </div>
      </div>

      <!-- Who + context -->
      <div class="min-w-0 flex-1">
        <p
          class="font-bold text-gray-900 dark:text-white leading-tight truncate transition-[font-size] duration-300"
          :class="compact ? 'text-xs' : 'text-sm'"
        >
          {{ isMyTurn ? $t('fantasy.draft.timer.yourTurn') : $t('fantasy.draft.timer.userTurn', { name: turn.user?.firstname ?? $t('fantasy.draft.timer.unknown') }) }}
        </p>
        <p
          v-if="!compact"
          class="text-2xs text-gray-500 dark:text-gray-400 mt-0.5 truncate"
        >
          {{ $t('fantasy.draft.timer.pickRound', { pick: turn.pick ?? '-', round: turn.round ?? '-' }) }}
        </p>
      </div>

      <!-- Countdown -->
      <div class="shrink-0 text-right leading-none">
        <span
          class="font-black tabular-nums tracking-tight transition-[font-size,color] duration-300"
          :class="[
            compact ? 'text-lg' : 'text-3xl',
            c.time,
            (urgency === 'critical' || expired) ? 'animate-pulse' : '',
          ]"
        >
          {{ displayTime }}
        </span>
        <p
          v-if="!compact"
          class="text-2xs font-medium mt-1 uppercase tracking-wider"
          :class="expired ? 'text-red-500/80 dark:text-red-400/80' : 'text-gray-400 dark:text-gray-500'"
        >
          {{ expired ? $t('fantasy.draft.timer.expired') : $t('fantasy.draft.timer.sec') }}
        </p>
      </div>
    </div>

    <!-- Waiting state -->
    <div
      v-else
      class="flex items-center bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60 shadow-sm transition-[padding,border-radius,gap] duration-300 ease-out"
      :class="compact ? 'rounded-xl gap-2.5 px-3 py-2' : 'rounded-2xl gap-3 px-4 py-3'"
    >
      <div
        class="flex items-center justify-center shrink-0 rounded-full bg-gray-100 dark:bg-gray-700/70 text-gray-400 dark:text-gray-500 transition-[width,height] duration-300 ease-out"
        :class="compact ? 'w-9 h-9' : 'w-14 h-14'"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="animate-pulse"
          :class="compact ? 'w-4 h-4' : 'w-6 h-6'"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd" />
        </svg>
      </div>

      <div class="min-w-0 flex-1">
        <p
          class="font-bold text-gray-900 dark:text-white leading-tight truncate transition-[font-size] duration-300"
          :class="compact ? 'text-xs' : 'text-sm'"
        >
          {{ $t('fantasy.draft.timer.waiting') }}
        </p>
        <p
          v-if="!compact"
          class="text-2xs text-gray-500 dark:text-gray-400 mt-0.5 truncate"
        >
          {{ $t('fantasy.draft.timer.waitingSub') }}
        </p>
      </div>

      <span class="inline-flex gap-1 shrink-0">
        <span class="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-500 animate-bounce" style="animation-delay: 0ms" />
        <span class="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-500 animate-bounce" style="animation-delay: 150ms" />
        <span class="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-500 animate-bounce" style="animation-delay: 300ms" />
      </span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { FantasyDraftTurnStarted } from '@/interfaces/fantasy/draft/FantasyDraftTurnStarted';
import { UserDataInterface } from '@/interfaces/user/userInterface';
import { useUserStore } from '@/store';
import { computed, onUnmounted, ref, watch } from 'vue';

const props = defineProps<{
  turn: FantasyDraftTurnStarted | null;
  compact?: boolean;
}>();

const emit = defineEmits<{
  expired: [];
}>();

const userStore = useUserStore();

const secondsLeft = ref(0);
const expired = ref(false);
let intervalId: ReturnType<typeof setInterval> | null = null;

// Circumference of the countdown ring (viewBox r=16). Progress drives the dash.
const RING_C = 2 * Math.PI * 16;

const isMyTurn = computed(() => {
  if (!props.turn?.user) return false;
  return userStore.getUserData?.uuid === props.turn.user.uuid;
});

const progress = computed(() => {
  if (!props.turn || !props.turn.duration_seconds || props.turn.duration_seconds <= 0) return 0;
  return Math.max(0, (secondsLeft.value / props.turn.duration_seconds) * 100);
});

const ringDashoffset = computed(() => RING_C * (1 - progress.value / 100));

const urgency = computed<'normal' | 'warning' | 'critical'>(() => {
  if (expired.value) return 'critical';
  if (secondsLeft.value <= 10) return 'critical';
  if (secondsLeft.value <= 20) return 'warning';
  return 'normal';
});

const displayTime = computed(() => {
  if (expired.value) return '0';
  const mins = Math.floor(secondsLeft.value / 60);
  const secs = secondsLeft.value % 60;
  return mins > 0 ? `${mins}:${String(secs).padStart(2, '0')}` : `${secs}`;
});

// Single source of truth for the visual state → keeps the palette map tidy.
type TimerState = 'mine' | 'other' | 'warning' | 'critical' | 'expired';

const state = computed<TimerState>(() => {
  if (expired.value) return 'expired';
  if (urgency.value === 'critical') return 'critical';
  if (urgency.value === 'warning') return 'warning';
  return isMyTurn.value ? 'mine' : 'other';
});

interface TimerPalette {
  ring: string; // stroke color of the progress ring (via currentColor)
  time: string; // color of the countdown number
  card: string; // accent applied to the card (ring/border emphasis)
  pulse: boolean; // soft-pulse the avatar (only when it's your turn)
}

const palette: Record<TimerState, TimerPalette> = {
  mine: {
    ring: 'text-emerald-500',
    time: 'text-emerald-600 dark:text-emerald-400',
    card: 'ring-1 ring-emerald-500/25',
    pulse: true,
  },
  other: {
    ring: 'text-blue-500 dark:text-blue-400',
    time: 'text-gray-900 dark:text-white',
    card: '',
    pulse: false,
  },
  warning: {
    ring: 'text-amber-500',
    time: 'text-amber-600 dark:text-amber-400',
    card: 'ring-1 ring-amber-500/25',
    pulse: false,
  },
  critical: {
    ring: 'text-red-500',
    time: 'text-red-600 dark:text-red-400',
    card: 'ring-1 ring-red-500/40',
    pulse: false,
  },
  expired: {
    ring: 'text-red-400',
    time: 'text-red-500 dark:text-red-400',
    card: 'ring-1 ring-red-500/25',
    pulse: false,
  },
};

const c = computed(() => palette[state.value]);

function calculateSecondsLeft(): number {
  if (!props.turn?.turn_started_at || !props.turn.duration_seconds) return 0;
  // turn_started_at comes as Unix timestamp (seconds with decimals) from Laravel
  const startedAt = Number(props.turn.turn_started_at) * 1000;
  const duration = Number(props.turn.duration_seconds) || 0;
  const endsAt = startedAt + duration * 1000;
  const now = Date.now();
  return Math.max(0, Math.ceil((endsAt - now) / 1000));
}

function startTimer() {
  stopTimer();
  expired.value = false;
  secondsLeft.value = calculateSecondsLeft();

  if (secondsLeft.value <= 0) {
    expired.value = true;
    emit('expired');
    return;
  }

  intervalId = setInterval(() => {
    secondsLeft.value = calculateSecondsLeft();
    if (secondsLeft.value <= 0) {
      expired.value = true;
      emit('expired');
      stopTimer();
    }
  }, 1000);
}

function stopTimer() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}

function getInitials(user: UserDataInterface | null): string {
  if (!user) return '?';
  const first = user.firstname?.charAt(0)?.toUpperCase() ?? '';
  const last = user.lastname?.charAt(0)?.toUpperCase() ?? '';
  return first + last || '?';
}

watch(
  () => props.turn,
  (newTurn) => {
    if (newTurn) {
      startTimer();
    } else {
      stopTimer();
      expired.value = false;
      secondsLeft.value = 0;
    }
  },
  { immediate: true, deep: true }
);

onUnmounted(() => {
  stopTimer();
});
</script>

<style scoped>
.tabular-nums {
  font-variant-numeric: tabular-nums;
}

/* Smooth countdown sweep + graceful color changes as urgency rises. */
.ring-progress {
  transition: stroke-dashoffset 1s linear, stroke 300ms ease;
}

@keyframes ring-pulse {
  0%, 100% {
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
  .animate-pulse,
  .animate-bounce {
    animation: none !important;
    transition: none !important;
  }
}
</style>
