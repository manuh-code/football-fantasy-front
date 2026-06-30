<template>
  <Teleport to="body">
    <!-- Backdrop -->
    <Transition name="ob-backdrop">
      <div
        v-if="isVisible"
        class="fixed inset-0 z-[130] bg-black/50 backdrop-blur-[2px]"
      />
    </Transition>

    <!-- Card -->
    <Transition name="ob-card">
      <div
        v-if="isVisible && currentStep"
        ref="cardRef"
        class="fixed z-[130] bottom-0 inset-x-0 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:bottom-auto md:top-1/2 md:-translate-y-1/2 md:w-[420px] bg-white dark:bg-gray-900 rounded-t-3xl md:rounded-3xl shadow-[0_-8px_40px_rgba(0,0,0,0.18)] dark:shadow-[0_-8px_40px_rgba(0,0,0,0.6)] overflow-hidden"
        role="dialog"
        aria-modal="true"
        :aria-label="$t('onboarding.progress', { current: currentIndex + 1, total: steps.length })"
        tabindex="-1"
      >
        <!-- Skip -->
        <div class="flex justify-end px-4 pt-4">
          <button
            type="button"
            @click="skip"
            class="text-xs font-medium text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 px-2 py-1 rounded-lg transition-colors"
          >
            {{ $t('onboarding.actions.skip') }}
          </button>
        </div>

        <!-- Slide area -->
        <div class="relative overflow-hidden px-7 pb-2 min-h-[248px]">
          <Transition :name="direction">
            <div
              :key="currentIndex"
              class="flex flex-col items-center text-center"
            >
              <div
                :class="['w-20 h-20 rounded-2xl flex items-center justify-center mb-5', iconBgClass]"
              >
                <v-icon :name="currentStep.icon" :class="['w-9 h-9', iconColorClass]" />
              </div>
              <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {{ $t(currentStep.titleKey) }}
              </h2>
              <p class="text-sm leading-relaxed text-gray-500 dark:text-gray-400 max-w-[20rem]">
                {{ $t(currentStep.bodyKey) }}
              </p>
            </div>
          </Transition>
        </div>

        <!-- Dots -->
        <div class="flex items-center justify-center gap-2 py-4">
          <span
            v-for="(_, i) in steps"
            :key="i"
            :class="[
              'rounded-full transition-all duration-300',
              i === currentIndex ? 'w-5 h-1.5 bg-emerald-500' : 'w-1.5 h-1.5 bg-gray-300 dark:bg-gray-600',
            ]"
          />
        </div>

        <!-- Footer -->
        <div class="flex items-center gap-3 px-7 pb-7 pt-1">
          <button
            v-if="currentIndex > 0"
            type="button"
            @click="back"
            class="flex-shrink-0 px-4 py-3 rounded-xl text-sm font-semibold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 active:scale-95 transition-all"
          >
            {{ $t('onboarding.actions.back') }}
          </button>
          <button
            type="button"
            @click="next"
            class="flex-1 px-4 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 shadow-lg shadow-emerald-600/20 active:scale-95 transition-all"
          >
            {{ isLast ? $t('onboarding.actions.start') : $t('onboarding.actions.next') }}
          </button>
        </div>

        <!-- Safe area bottom padding on iOS -->
        <div class="h-[env(safe-area-inset-bottom)]" />
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onUnmounted } from 'vue'
import type { OnboardingStep } from './onboardingSteps'

interface Props {
  isVisible: boolean
  steps: OnboardingStep[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  // Emitido al terminar todos los pasos o al saltar. El padre marca el flag y oculta.
  finish: []
}>()

const cardRef = ref<HTMLElement | null>(null)
const currentIndex = ref(0)
// Dirección de la transición horizontal entre diapositivas.
const direction = ref<'slide-next' | 'slide-prev'>('slide-next')

const currentStep = computed<OnboardingStep | undefined>(() => props.steps[currentIndex.value])
const isLast = computed(() => currentIndex.value >= props.steps.length - 1)

const iconBgClass = computed(() => {
  const classes: Record<string, string> = {
    emerald: 'bg-emerald-100 dark:bg-emerald-900/30',
    blue: 'bg-blue-100 dark:bg-blue-900/30',
    amber: 'bg-amber-100 dark:bg-amber-900/30',
    red: 'bg-red-100 dark:bg-red-900/30',
  }
  return classes[currentStep.value?.variant ?? 'emerald']
})

const iconColorClass = computed(() => {
  const classes: Record<string, string> = {
    emerald: 'text-emerald-600 dark:text-emerald-400',
    blue: 'text-blue-600 dark:text-blue-400',
    amber: 'text-amber-600 dark:text-amber-400',
    red: 'text-red-600 dark:text-red-400',
  }
  return classes[currentStep.value?.variant ?? 'emerald']
})

function next() {
  if (isLast.value) {
    finish()
    return
  }
  direction.value = 'slide-next'
  currentIndex.value++
}

function back() {
  if (currentIndex.value === 0) return
  direction.value = 'slide-prev'
  currentIndex.value--
}

function skip() {
  finish()
}

function finish() {
  emit('finish')
}

// Lock body scroll while visible (mismo truco que BottomSheet para no saltar al tope).
let lockedScrollY = 0
function lockScroll() {
  lockedScrollY = window.scrollY || document.documentElement.scrollTop
  document.body.style.overflow = 'hidden'
  document.body.style.position = 'fixed'
  document.body.style.top = `-${lockedScrollY}px`
  document.body.style.width = '100%'
}
function unlockScroll() {
  document.body.style.overflow = ''
  document.body.style.position = ''
  document.body.style.top = ''
  document.body.style.width = ''
  window.scrollTo({ top: lockedScrollY, behavior: 'instant' })
}

watch(
  () => props.isVisible,
  (visible) => {
    if (visible) {
      // Siempre empezar desde la primera diapositiva al abrir.
      currentIndex.value = 0
      direction.value = 'slide-next'
      lockScroll()
      nextTick(() => cardRef.value?.focus())
    } else {
      unlockScroll()
    }
  },
)

function handleKeydown(e: KeyboardEvent) {
  if (!props.isVisible) return
  if (e.key === 'Escape') {
    skip()
  } else if (e.key === 'ArrowRight') {
    next()
  } else if (e.key === 'ArrowLeft') {
    back()
  }
}
document.addEventListener('keydown', handleKeydown)

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  if (props.isVisible) unlockScroll()
})
</script>

<style scoped>
/* Backdrop fade */
.ob-backdrop-enter-active {
  transition: opacity 0.25s ease;
}
.ob-backdrop-leave-active {
  transition: opacity 0.2s ease;
}
.ob-backdrop-enter-from,
.ob-backdrop-leave-to {
  opacity: 0;
}

/* Card — mobile: slide from bottom, desktop: scale + fade centered */
.ob-card-enter-active {
  transition: all 0.35s cubic-bezier(0.21, 1.02, 0.73, 1);
}
.ob-card-leave-active {
  transition: all 0.2s ease-in;
}
.ob-card-enter-from,
.ob-card-leave-to {
  opacity: 0;
  transform: translateY(100%);
}

@media (min-width: 768px) {
  .ob-card-enter-from,
  .ob-card-leave-to {
    opacity: 0;
    transform: translate(-50%, -48%) scale(0.96);
  }
  .ob-card-enter-to,
  .ob-card-leave-from {
    transform: translate(-50%, -50%) scale(1);
  }
}

/* Direction-aware horizontal slide between steps */
.slide-next-enter-active,
.slide-next-leave-active,
.slide-prev-enter-active,
.slide-prev-leave-active {
  transition: transform 0.3s cubic-bezier(0.32, 0.72, 0, 1), opacity 0.3s ease;
}
.slide-next-leave-active,
.slide-prev-leave-active {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
}
.slide-next-enter-from {
  transform: translateX(100%);
  opacity: 0;
}
.slide-next-leave-to {
  transform: translateX(-100%);
  opacity: 0;
}
.slide-prev-enter-from {
  transform: translateX(-100%);
  opacity: 0;
}
.slide-prev-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .ob-backdrop-enter-active,
  .ob-backdrop-leave-active,
  .ob-card-enter-active,
  .ob-card-leave-active,
  .slide-next-enter-active,
  .slide-next-leave-active,
  .slide-prev-enter-active,
  .slide-prev-leave-active {
    transition: opacity 0.2s ease !important;
    transform: none !important;
  }
}
</style>
