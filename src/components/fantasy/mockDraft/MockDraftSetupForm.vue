<template>
  <form class="space-y-3" @submit.prevent="submit">
    <div class="px-1 pt-1">
      <h2 class="text-base font-bold text-gray-900 dark:text-white">
        {{ $t('fantasy.mockDraft.setup.title') }}
      </h2>
      <p class="text-2xs text-gray-500 dark:text-gray-400">
        {{ $t('fantasy.mockDraft.setup.subtitle') }}
      </p>
    </div>

    <!-- Preset: usar la configuración de una de mis ligas -->
    <section
      v-if="leagues.length"
      class="rounded-2xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700/60 p-4"
    >
      <div class="flex items-center gap-2.5 mb-3">
        <span
          class="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
        >
          <v-icon name="hi-solid-badge-check" class="w-4 h-4" />
        </span>
        <div class="min-w-0">
          <h3 class="text-sm font-bold text-gray-900 dark:text-white leading-tight">
            {{ $t('fantasy.mockDraft.setup.preset') }}
          </h3>
          <p class="text-2xs text-gray-500 dark:text-gray-400 leading-tight">
            {{ $t('fantasy.mockDraft.setup.presetSubtitle') }}
          </p>
        </div>
      </div>

      <div class="relative">
        <select
          v-model="form.fantasy_league_uuid"
          class="w-full h-11 pl-3 pr-9 text-sm font-medium rounded-xl appearance-none bg-none bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 focus-visible:border-emerald-500 transition-colors"
        >
          <option :value="null">{{ $t('fantasy.mockDraft.setup.presetNone') }}</option>
          <option v-for="league in leagues" :key="league.uuid" :value="league.uuid">
            {{ league.name }}
          </option>
        </select>
        <v-icon
          name="hi-solid-chevron-down"
          class="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 pointer-events-none"
        />
      </div>

      <p
        v-if="usesPreset"
        class="flex items-start gap-1.5 text-2xs text-emerald-700 dark:text-emerald-400 mt-2"
      >
        <v-icon name="hi-solid-information-circle" class="w-3.5 h-3.5 shrink-0 mt-px" />
        <span>{{ $t('fantasy.mockDraft.setup.presetHint') }}</span>
      </p>
    </section>

    <!-- Sala: equipos + tu posición -->
    <section
      class="rounded-2xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700/60 divide-y divide-gray-100 dark:divide-gray-700/60"
    >
      <!-- Número de equipos -->
      <div class="p-4">
        <div class="flex items-center gap-2.5 mb-3">
          <span
            class="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-400"
          >
            <v-icon name="hi-solid-user-group" class="w-4 h-4" />
          </span>
          <div class="min-w-0 flex-1">
            <h3 class="text-sm font-bold text-gray-900 dark:text-white leading-tight">
              {{ $t('fantasy.mockDraft.setup.teams') }}
            </h3>
            <p class="text-2xs text-gray-500 dark:text-gray-400 leading-tight">
              {{ $t('fantasy.mockDraft.setup.teamsHint') }}
            </p>
          </div>
          <span
            v-if="usesPreset"
            class="flex items-center gap-1 shrink-0 px-2 py-1 rounded-full text-2xs font-semibold bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
          >
            <v-icon name="hi-solid-lock-closed" class="w-3 h-3" />
            {{ $t('fantasy.mockDraft.setup.lockedByLeague') }}
          </span>
        </div>

        <div class="flex items-center gap-3">
          <button
            type="button"
            class="w-11 h-11 shrink-0 rounded-xl flex items-center justify-center bg-gray-100 text-gray-600 dark:bg-gray-700/60 dark:text-gray-300 transition-all duration-150 cursor-pointer touch-manipulation active:scale-90 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100"
            :disabled="usesPreset || form.teams_count <= options.teams.min"
            :aria-label="$t('fantasy.mockDraft.setup.teamsDecrease')"
            @click="stepTeams(-1)"
          >
            <v-icon name="hi-solid-minus" class="w-4 h-4" />
          </button>

          <div class="flex-1 text-center" aria-live="polite">
            <span class="block text-3xl font-black text-gray-900 dark:text-white tabular-nums leading-none">
              {{ form.teams_count }}
            </span>
          </div>

          <button
            type="button"
            class="w-11 h-11 shrink-0 rounded-xl flex items-center justify-center bg-gray-100 text-gray-600 dark:bg-gray-700/60 dark:text-gray-300 transition-all duration-150 cursor-pointer touch-manipulation active:scale-90 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100"
            :disabled="usesPreset || form.teams_count >= options.teams.max"
            :aria-label="$t('fantasy.mockDraft.setup.teamsIncrease')"
            @click="stepTeams(1)"
          >
            <v-icon name="hi-solid-plus" class="w-4 h-4" />
          </button>
        </div>

        <div class="mt-3 h-1 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
          <div
            class="h-full rounded-full bg-sky-600 dark:bg-sky-400 transition-[width] duration-300 ease-out"
            :style="{ width: `${teamsProgress}%` }"
          />
        </div>
        <div class="flex justify-between text-2xs text-gray-500 dark:text-gray-400 tabular-nums mt-1">
          <span>{{ options.teams.min }}</span>
          <span>{{ options.teams.max }}</span>
        </div>
      </div>

      <!-- Tu posición en el orden -->
      <div class="p-4">
        <div class="flex items-center gap-2.5 mb-3">
          <span
            class="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
          >
            <v-icon name="hi-solid-hashtag" class="w-4 h-4" />
          </span>
          <div class="min-w-0">
            <h3 class="text-sm font-bold text-gray-900 dark:text-white leading-tight">
              {{ $t('fantasy.mockDraft.setup.slot') }}
            </h3>
            <p class="text-2xs text-gray-500 dark:text-gray-400 leading-tight">
              {{ $t('fantasy.mockDraft.setup.slotHint') }}
            </p>
          </div>
        </div>

        <button
          type="button"
          class="w-full h-11 mb-2 rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5 transition-all duration-150 cursor-pointer touch-manipulation active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
          :class="chipClass(form.user_slot === null)"
          :aria-pressed="form.user_slot === null"
          @click="form.user_slot = null"
        >
          <v-icon name="hi-solid-sparkles" class="w-4 h-4" />
          {{ $t('fantasy.mockDraft.setup.slotRandom') }}
        </button>

        <div class="grid grid-cols-6 sm:grid-cols-8 gap-2">
          <button
            v-for="slot in slotOptions"
            :key="slot"
            type="button"
            class="h-11 rounded-xl text-sm font-bold tabular-nums transition-all duration-150 cursor-pointer touch-manipulation active:scale-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
            :class="chipClass(form.user_slot === slot)"
            :aria-label="$t('fantasy.mockDraft.setup.slotPick', { pick: slot + 1 })"
            :aria-pressed="form.user_slot === slot"
            @click="form.user_slot = slot"
          >
            {{ slot + 1 }}
          </button>
        </div>

        <p
          v-if="firstPicks.length"
          class="flex items-start gap-1.5 text-2xs text-blue-600 dark:text-blue-400 mt-2.5"
        >
          <v-icon name="hi-solid-information-circle" class="w-3.5 h-3.5 shrink-0 mt-px" />
          <span>{{ $t('fantasy.mockDraft.setup.slotPicks', { picks: firstPicks.join(', ') }) }}</span>
        </p>
      </div>
    </section>

    <!-- Reglas: tiempo por pick + orden serpiente -->
    <section
      class="rounded-2xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700/60 divide-y divide-gray-100 dark:divide-gray-700/60"
    >
      <div class="p-4">
        <div class="flex items-center gap-2.5 mb-3">
          <span
            class="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400"
          >
            <v-icon name="hi-solid-clock" class="w-4 h-4" />
          </span>
          <div class="min-w-0">
            <h3 class="text-sm font-bold text-gray-900 dark:text-white leading-tight">
              {{ $t('fantasy.mockDraft.setup.timer') }}
            </h3>
            <p class="text-2xs text-gray-500 dark:text-gray-400 leading-tight">
              {{ $t('fantasy.mockDraft.setup.timerHint') }}
            </p>
          </div>
        </div>

        <div class="grid grid-cols-4 gap-2">
          <button
            v-for="timer in options.pick_timer.options"
            :key="timer"
            type="button"
            class="h-11 rounded-xl text-sm font-semibold tabular-nums transition-all duration-150 cursor-pointer touch-manipulation active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
            :class="chipClass(form.pick_timer === timer)"
            :aria-pressed="form.pick_timer === timer"
            @click="form.pick_timer = timer"
          >
            {{ timer === 0 ? $t('fantasy.mockDraft.setup.timerNone') : `${timer}s` }}
          </button>
        </div>
      </div>

      <!-- Orden serpiente -->
      <button
        type="button"
        role="switch"
        :aria-checked="form.snake_order"
        class="w-full flex items-center gap-2.5 p-4 text-left cursor-pointer touch-manipulation transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/30 rounded-b-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-500/50"
        @click="form.snake_order = !form.snake_order"
      >
        <span
          class="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors"
          :class="
            form.snake_order
              ? 'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400'
              : 'bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500'
          "
        >
          <v-icon name="ri-arrow-up-down-fill" class="w-4 h-4" />
        </span>
        <span class="min-w-0 flex-1">
          <span class="block text-sm font-bold text-gray-900 dark:text-white leading-tight">
            {{ $t('fantasy.mockDraft.setup.snake') }}
          </span>
          <span class="block text-2xs text-gray-500 dark:text-gray-400 leading-tight">
            {{ $t('fantasy.mockDraft.setup.snakeHint') }}
          </span>
        </span>
        <span
          class="relative shrink-0 w-11 h-6 rounded-full transition-colors duration-200"
          :class="form.snake_order ? 'bg-emerald-600' : 'bg-gray-300 dark:bg-gray-600'"
        >
          <span
            class="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ease-out"
            :class="form.snake_order ? 'translate-x-5' : 'translate-x-0'"
          />
        </span>
      </button>
    </section>

    <!-- Dificultad de los bots -->
    <section
      class="rounded-2xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700/60 p-4"
    >
      <div class="flex items-center gap-2.5 mb-3">
        <span
          class="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400"
        >
          <v-icon name="ri-robot-line" class="w-4 h-4" />
        </span>
        <div class="min-w-0">
          <h3 class="text-sm font-bold text-gray-900 dark:text-white leading-tight">
            {{ $t('fantasy.mockDraft.setup.difficulty') }}
          </h3>
          <p class="text-2xs text-gray-500 dark:text-gray-400 leading-tight">
            {{ $t('fantasy.mockDraft.setup.difficultyHintShort') }}
          </p>
        </div>
      </div>

      <div class="grid grid-cols-3 gap-2">
        <button
          v-for="(level, index) in options.difficulties"
          :key="level"
          type="button"
          class="flex flex-col items-center justify-center gap-2 py-3 rounded-xl border transition-all duration-150 cursor-pointer touch-manipulation active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
          :class="
            form.difficulty === level
              ? 'bg-emerald-700 border-emerald-700 text-white shadow-sm shadow-emerald-700/25'
              : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 dark:bg-gray-700/40 dark:border-gray-600/60 dark:text-gray-300 dark:hover:bg-gray-700'
          "
          :aria-pressed="form.difficulty === level"
          @click="form.difficulty = level"
        >
          <span class="flex items-end gap-0.5 h-3.5" aria-hidden="true">
            <span
              v-for="bar in 3"
              :key="bar"
              class="w-1 rounded-full transition-colors duration-150"
              :class="[
                bar === 1 ? 'h-1.5' : bar === 2 ? 'h-2.5' : 'h-3.5',
                bar <= index + 1
                  ? form.difficulty === level
                    ? 'bg-white'
                    : 'bg-gray-400 dark:bg-gray-400'
                  : form.difficulty === level
                    ? 'bg-white/30'
                    : 'bg-gray-200 dark:bg-gray-600',
              ]"
            />
          </span>
          <span class="text-2xs font-bold">{{ $t(`fantasy.mockDraft.difficulty.${level}`) }}</span>
        </button>
      </div>

      <p class="text-2xs text-gray-500 dark:text-gray-400 mt-2.5 leading-snug">
        {{ $t(`fantasy.mockDraft.difficultyHint.${form.difficulty}`) }}
      </p>
    </section>

    <!-- Resumen + CTA -->
    <section
      class="rounded-2xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700/60 p-4 space-y-3"
    >
      <div>
        <p class="text-2xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">
          {{ $t('fantasy.mockDraft.setup.recapTitle') }}
        </p>
        <ul class="flex flex-wrap gap-1.5">
          <li
            v-for="pill in recap"
            :key="pill"
            class="px-2 py-1 rounded-lg text-2xs font-semibold bg-gray-100 text-gray-600 dark:bg-gray-700/60 dark:text-gray-300"
          >
            {{ pill }}
          </li>
        </ul>
      </div>

      <ButtonComponent
        variant="primary"
        size="lg"
        type="submit"
        always-full-width
        icon="hi-solid-lightning-bolt"
        :loading="isSubmitting"
        :disabled="isSubmitting"
        :text="isSubmitting ? $t('fantasy.mockDraft.setup.creating') : $t('fantasy.mockDraft.setup.start')"
      />
    </section>
  </form>
</template>

<script lang="ts" setup>
import { computed, reactive, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { ButtonComponent } from '@/components/ui'
import type { MockDraftCreatePayload, MockDraftOptions } from '@/interfaces/fantasy/mockDraft/MockDraftResponse'
import type { FantasyLeaguesResponse } from '@/interfaces/fantasy/leagues/FantasyLeaguesResponse'

const props = defineProps<{
  options: MockDraftOptions
  /** Ligas del usuario, para el preset. */
  leagues: FantasyLeaguesResponse[]
  isSubmitting: boolean
  /** Preseleccionar una liga (al entrar desde "practicar mi draft"). */
  presetLeagueUuid?: string | null
}>()

const emit = defineEmits<{ submit: [payload: MockDraftCreatePayload] }>()

const { t } = useI18n()

const form = reactive<Required<Omit<MockDraftCreatePayload, 'football_league_uuid'>>>({
  fantasy_league_uuid: props.presetLeagueUuid ?? null,
  teams_count: props.options.teams.default,
  user_slot: null,
  pick_timer: props.options.pick_timer.default,
  snake_order: true,
  difficulty: props.options.default_difficulty,
})

/** Con preset, el nº de equipos lo manda la liga: se muestra pero no se edita. */
const usesPreset = computed(() => !!form.fantasy_league_uuid)

const slotOptions = computed(() => Array.from({ length: form.teams_count }, (_, index) => index))

/** Posición del stepper dentro del rango permitido, para la barra de progreso. */
const teamsProgress = computed(() => {
  const { min, max } = props.options.teams
  if (max <= min) return 100
  return ((form.teams_count - min) / (max - min)) * 100
})

/**
 * Los tres primeros picks que le tocarían al usuario con el slot elegido. Es la
 * información que de verdad decide la posición: con serpiente, el último en
 * elegir de la ronda 1 encadena dos picks seguidos.
 */
const firstPicks = computed<number[]>(() => {
  if (form.user_slot === null) return []
  const slot = form.user_slot
  const teams = form.teams_count
  return [1, 2, 3].map((round) => {
    const positionInRound = form.snake_order && round % 2 === 0 ? teams - slot : slot + 1
    return (round - 1) * teams + positionInRound
  })
})

/** Resumen legible de la sala, justo encima del botón de crear. */
const recap = computed<string[]>(() => {
  const pills = [
    t('fantasy.mockDraft.setup.recapTeams', { teams: form.teams_count }),
    form.user_slot === null
      ? t('fantasy.mockDraft.setup.slotRandom')
      : t('fantasy.mockDraft.setup.slotPick', { pick: form.user_slot + 1 }),
    form.pick_timer === 0 ? t('fantasy.mockDraft.setup.timerNone') : `${form.pick_timer}s`,
    t(`fantasy.mockDraft.difficulty.${form.difficulty}`),
  ]
  if (form.snake_order) pills.push(t('fantasy.mockDraft.setup.recapSnake'))
  return pills
})

function chipClass(active: boolean): string {
  return active
    ? 'bg-emerald-700 text-white shadow-sm shadow-emerald-700/25'
    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700/60 dark:text-gray-300 dark:hover:bg-gray-700'
}

function stepTeams(delta: number): void {
  const next = form.teams_count + delta
  if (next < props.options.teams.min || next > props.options.teams.max) return
  form.teams_count = next
}

// Al elegir un preset, reflejar sus participantes en el stepper; y si el slot
// elegido se sale del nuevo tamaño de sala, volver a "al azar".
watch(
  () => form.fantasy_league_uuid,
  (uuid) => {
    const league = props.leagues.find((item) => item.uuid === uuid)
    if (league?.participants_count) {
      form.teams_count = league.participants_count
    }
  },
)

watch(
  () => form.teams_count,
  (count) => {
    if (form.user_slot !== null && form.user_slot >= count) {
      form.user_slot = null
    }
  },
)

function submit(): void {
  emit('submit', {
    fantasy_league_uuid: form.fantasy_league_uuid,
    teams_count: form.teams_count,
    user_slot: form.user_slot,
    pick_timer: form.pick_timer,
    snake_order: form.snake_order,
    difficulty: form.difficulty,
  })
}
</script>

<style scoped>
.tabular-nums {
  font-variant-numeric: tabular-nums;
}
</style>
