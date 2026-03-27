<template>
  <div :class="compact ? '' : 'pb-1'">
    <!-- Active turn -->
    <div
      v-if="turn"
      class="overflow-hidden shadow-sm transition-all duration-300"
      :class="[
        bannerClasses,
        compact ? 'rounded-xl' : 'rounded-2xl',
      ]"
    >
      <div class="relative">
        <!-- Full layout -->
        <div
          class="transition-opacity duration-150"
          :class="compact ? 'opacity-0 pointer-events-none absolute inset-x-0 top-0' : 'opacity-100 relative'"
        >
          <div class="px-4 py-3 flex items-center gap-3">
            <div class="relative flex-shrink-0">
              <div
                class="w-11 h-11 rounded-full overflow-hidden ring-2 ring-white/30"
                :class="{ 'animate-pulse-soft': isMyTurn }"
              >
                <img
                  v-if="turn.user?.avatar"
                  :src="turn.user.avatar"
                  :alt="turn.user?.firstname ?? ''"
                  class="w-full h-full object-cover"
                />
                <div
                  v-else
                  class="w-full h-full flex items-center justify-center bg-white/20 text-sm font-bold text-white"
                >
                  {{ getInitials(turn.user) }}
                </div>
              </div>
            </div>

            <div class="flex-1 min-w-0">
              <p class="text-sm font-bold text-white leading-tight truncate">
                {{ isMyTurn ? 'Your turn!' : `${turn.user?.firstname ?? 'Unknown'}'s turn` }}
              </p>
              <p class="text-[11px] text-white/70 mt-0.5">
                Pick #{{ turn.pick ?? '-' }} · Round {{ turn.round ?? '-' }}
              </p>
            </div>

            <div class="flex-shrink-0 text-right">
              <span
                class="text-3xl font-black text-white tabular-nums leading-none tracking-tight"
                :class="timerTextClass"
              >
                {{ displayTime }}
              </span>
              <p class="text-[9px] text-white/50 font-medium mt-0.5 uppercase tracking-wider">
                {{ expired ? 'Expired' : 'sec' }}
              </p>
            </div>
          </div>

          <!-- Progress bar -->
          <div class="px-4 pb-2">
            <div class="w-full h-1 rounded-full bg-white/20 overflow-hidden">
              <div
                class="h-full rounded-full transition-all duration-1000 ease-linear"
                :class="progressBarClass"
                :style="{ width: `${progress}%` }"
              />
            </div>
          </div>
        </div>

        <!-- Compact layout -->
        <div
          class="transition-opacity duration-150"
          :class="compact ? 'opacity-100 relative' : 'opacity-0 pointer-events-none absolute inset-x-0 top-0'"
        >
          <div class="px-3 py-1.5 flex items-center gap-2">
            <div class="w-6 h-6 rounded-full overflow-hidden ring-1 ring-white/20 flex-shrink-0">
              <img
                v-if="turn.user?.avatar"
                :src="turn.user.avatar"
                :alt="turn.user?.firstname ?? ''"
                class="w-full h-full object-cover"
              />
              <div
                v-else
                class="w-full h-full flex items-center justify-center bg-white/20 text-[9px] font-bold text-white"
              >
                {{ getInitials(turn.user) }}
              </div>
            </div>

            <p class="text-xs font-semibold text-white truncate flex-1 min-w-0">
              {{ isMyTurn ? 'Your turn!' : `${turn.user?.firstname ?? 'Unknown'}` }}
            </p>

            <!-- Compact progress -->
            <div class="w-12 h-1 rounded-full bg-white/20 overflow-hidden flex-shrink-0">
              <div
                class="h-full rounded-full transition-all duration-1000 ease-linear"
                :class="progressBarClass"
                :style="{ width: `${progress}%` }"
              />
            </div>

            <span
              class="text-sm font-black text-white tabular-nums leading-none flex-shrink-0"
              :class="timerTextClass"
            >
              {{ displayTime }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Waiting state -->
    <div
      v-else
      class="overflow-hidden shadow-sm bg-gradient-to-r from-gray-500 to-gray-600 dark:from-gray-600 dark:to-gray-700 transition-all duration-300"
      :class="compact ? 'rounded-xl' : 'rounded-2xl'"
    >
      <div class="relative">
        <!-- Full waiting -->
        <div
          class="transition-opacity duration-150"
          :class="compact ? 'opacity-0 pointer-events-none absolute inset-x-0 top-0' : 'opacity-100 relative'"
        >
          <div class="px-4 py-3 flex items-center gap-3">
            <div class="w-11 h-11 rounded-full flex items-center justify-center bg-white/15">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-white animate-pulse" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-bold text-white leading-tight">
                Waiting for draft...
              </p>
              <p class="text-[11px] text-white/60 mt-0.5">
                The timer will start when a turn begins
              </p>
            </div>
            <div class="flex-shrink-0">
              <span class="inline-flex gap-1">
                <span class="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce" style="animation-delay: 0ms" />
                <span class="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce" style="animation-delay: 150ms" />
                <span class="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce" style="animation-delay: 300ms" />
              </span>
            </div>
          </div>
        </div>
        <!-- Compact waiting -->
        <div
          class="transition-opacity duration-150"
          :class="compact ? 'opacity-100 relative' : 'opacity-0 pointer-events-none absolute inset-x-0 top-0'"
        >
          <div class="px-3 py-1.5 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-white/70 animate-pulse flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd" />
            </svg>
            <p class="text-xs font-semibold text-white/80 truncate">
              Waiting for draft...
            </p>
            <span class="inline-flex gap-0.5 flex-shrink-0">
              <span class="w-1 h-1 rounded-full bg-white/40 animate-bounce" style="animation-delay: 0ms" />
              <span class="w-1 h-1 rounded-full bg-white/40 animate-bounce" style="animation-delay: 150ms" />
              <span class="w-1 h-1 rounded-full bg-white/40 animate-bounce" style="animation-delay: 300ms" />
            </span>
          </div>
        </div>
      </div>
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

const isMyTurn = computed(() => {
  if (!props.turn?.user) return false;
  return userStore.getUserData?.uuid === props.turn.user.uuid;
});

const progress = computed(() => {
  if (!props.turn || !props.turn.duration_seconds || props.turn.duration_seconds <= 0) return 0;
  return Math.max(0, (secondsLeft.value / props.turn.duration_seconds) * 100);
});

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

const bannerClasses = computed(() => {
  if (expired.value) {
    return 'bg-gradient-to-r from-red-500 to-red-600 dark:from-red-600 dark:to-red-700';
  }
  if (urgency.value === 'critical') {
    return isMyTurn.value
      ? 'bg-gradient-to-r from-red-500 to-orange-500 dark:from-red-600 dark:to-orange-600'
      : 'bg-gradient-to-r from-red-400 to-orange-400 dark:from-red-500 dark:to-orange-500';
  }
  if (urgency.value === 'warning') {
    return isMyTurn.value
      ? 'bg-gradient-to-r from-amber-500 to-orange-500 dark:from-amber-600 dark:to-orange-600'
      : 'bg-gradient-to-r from-amber-400 to-orange-400 dark:from-amber-500 dark:to-orange-500';
  }
  return isMyTurn.value
    ? 'bg-gradient-to-r from-green-500 to-emerald-500 dark:from-green-600 dark:to-emerald-600'
    : 'bg-gradient-to-r from-blue-500 to-indigo-500 dark:from-blue-600 dark:to-indigo-600';
});

const timerTextClass = computed(() => {
  if (expired.value) return 'text-white/60';
  if (urgency.value === 'critical') return 'text-red-100 animate-pulse';
  if (urgency.value === 'warning') return 'text-yellow-100';
  return 'text-white';
});

const progressBarClass = computed(() => {
  if (expired.value) return 'bg-white/30';
  if (urgency.value === 'critical') return 'bg-red-300';
  if (urgency.value === 'warning') return 'bg-yellow-300';
  return 'bg-white';
});

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

@keyframes pulse-soft {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.85;
    transform: scale(1.03);
  }
}
.animate-pulse-soft {
  animation: pulse-soft 2s ease-in-out infinite;
}

/* Crossfade between full ↔ compact handled by CSS opacity transitions */
</style>
