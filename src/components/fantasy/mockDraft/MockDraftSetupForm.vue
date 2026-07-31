<template>
  <form
    class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 p-5 space-y-5"
    @submit.prevent="submit"
  >
    <div>
      <h2 class="text-lg font-bold text-gray-900 dark:text-white">
        {{ $t('fantasy.mockDraft.setup.title') }}
      </h2>
      <p class="text-2xs text-gray-500 dark:text-gray-400 mt-1">
        {{ $t('fantasy.mockDraft.setup.subtitle') }}
      </p>
    </div>

    <!-- Preset: usar la configuración de una de mis ligas -->
    <div v-if="leagues.length">
      <label class="block text-2xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
        {{ $t('fantasy.mockDraft.setup.preset') }}
      </label>
      <select
        v-model="form.fantasy_league_uuid"
        class="w-full px-3 py-2 text-sm rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
      >
        <option :value="null">{{ $t('fantasy.mockDraft.setup.presetNone') }}</option>
        <option v-for="league in leagues" :key="league.uuid" :value="league.uuid">
          {{ league.name }}
        </option>
      </select>
      <p v-if="form.fantasy_league_uuid" class="text-[0.5rem] text-emerald-600 dark:text-emerald-400 mt-1">
        {{ $t('fantasy.mockDraft.setup.presetHint') }}
      </p>
    </div>

    <!-- Número de equipos -->
    <div :class="{ 'opacity-50 pointer-events-none': usesPreset }">
      <label class="block text-2xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
        {{ $t('fantasy.mockDraft.setup.teams') }}
        <span class="font-normal text-gray-400">({{ form.teams_count }})</span>
      </label>
      <input
        v-model.number="form.teams_count"
        type="range"
        :min="options.teams.min"
        :max="options.teams.max"
        class="w-full accent-emerald-500"
      />
      <div class="flex justify-between text-[0.5rem] text-gray-400">
        <span>{{ options.teams.min }}</span>
        <span>{{ options.teams.max }}</span>
      </div>
    </div>

    <!-- Tu posición en el orden -->
    <div>
      <label class="block text-2xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
        {{ $t('fantasy.mockDraft.setup.slot') }}
      </label>
      <div class="flex gap-1 overflow-x-auto scrollbar-hide pb-1">
        <button
          type="button"
          class="shrink-0 px-2.5 py-1.5 rounded-lg text-2xs font-semibold transition-colors"
          :class="chipClass(form.user_slot === null)"
          @click="form.user_slot = null"
        >
          {{ $t('fantasy.mockDraft.setup.slotRandom') }}
        </button>
        <button
          v-for="slot in slotOptions"
          :key="slot"
          type="button"
          class="shrink-0 w-8 h-8 rounded-lg text-2xs font-bold transition-colors"
          :class="chipClass(form.user_slot === slot)"
          @click="form.user_slot = slot"
        >
          {{ slot + 1 }}
        </button>
      </div>
    </div>

    <!-- Tiempo por pick -->
    <div>
      <label class="block text-2xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
        {{ $t('fantasy.mockDraft.setup.timer') }}
      </label>
      <div class="grid grid-cols-4 gap-1.5">
        <button
          v-for="timer in options.pick_timer.options"
          :key="timer"
          type="button"
          class="py-2 rounded-lg text-2xs font-semibold transition-colors"
          :class="chipClass(form.pick_timer === timer)"
          @click="form.pick_timer = timer"
        >
          {{ timer === 0 ? $t('fantasy.mockDraft.setup.timerNone') : `${timer}s` }}
        </button>
      </div>
    </div>

    <!-- Dificultad de los bots -->
    <div>
      <label class="block text-2xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
        {{ $t('fantasy.mockDraft.setup.difficulty') }}
      </label>
      <div class="grid grid-cols-3 gap-1.5">
        <button
          v-for="level in options.difficulties"
          :key="level"
          type="button"
          class="py-2 rounded-lg text-2xs font-semibold transition-colors"
          :class="chipClass(form.difficulty === level)"
          @click="form.difficulty = level"
        >
          {{ $t(`fantasy.mockDraft.difficulty.${level}`) }}
        </button>
      </div>
      <p class="text-[0.5rem] text-gray-400 dark:text-gray-500 mt-1.5">
        {{ $t(`fantasy.mockDraft.difficultyHint.${form.difficulty}`) }}
      </p>
    </div>

    <!-- Orden snake -->
    <label class="flex items-center justify-between gap-3 cursor-pointer">
      <span class="min-w-0">
        <span class="block text-2xs font-semibold text-gray-700 dark:text-gray-300">
          {{ $t('fantasy.mockDraft.setup.snake') }}
        </span>
        <span class="block text-[0.5rem] text-gray-400 dark:text-gray-500">
          {{ $t('fantasy.mockDraft.setup.snakeHint') }}
        </span>
      </span>
      <input v-model="form.snake_order" type="checkbox" class="w-9 h-5 accent-emerald-500 shrink-0" />
    </label>

    <ButtonComponent
      variant="primary"
      size="md"
      type="submit"
      always-full-width
      :loading="isSubmitting"
      :disabled="isSubmitting"
      :text="isSubmitting ? $t('fantasy.mockDraft.setup.creating') : $t('fantasy.mockDraft.setup.start')"
    />
  </form>
</template>

<script lang="ts" setup>
import { computed, reactive, watch } from 'vue'
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

function chipClass(active: boolean): string {
  return active
    ? 'bg-emerald-500 text-white'
    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700/60 dark:text-gray-300 dark:hover:bg-gray-700'
}

// Al elegir un preset, reflejar sus participantes en el slider; y si el slot
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
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
