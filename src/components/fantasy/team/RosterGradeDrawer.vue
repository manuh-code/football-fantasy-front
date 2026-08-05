<template>
  <BottomSheet
    :is-visible="modelValue"
    size="lg"
    icon="hi-solid-chart-bar"
    icon-variant="emerald"
    :title="$t('fantasy.rosterGrade.title')"
    :subtitle="grade?.round?.name ? $t('football.rounds.round', { name: grade.round.name }) : ''"
    role="dialog"
    autofocus
    @close="emit('update:modelValue', false)"
  >
    <template v-if="grade">
      <!-- Sin puntos de referencia: la nota existe pero no significa nada
           (toda la liga empata en cero), así que se explica en vez de mostrar
           un dato hueco con pinta de real. -->
      <div
        v-if="!grade.scored"
        class="rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 px-4 py-3.5 flex items-start gap-3"
      >
        <v-icon name="hi-solid-information-circle" class="w-5 h-5 text-amber-500 shrink-0 mt-px" />
        <div class="min-w-0">
          <p class="text-footnote font-semibold text-gray-900 dark:text-white">
            {{ $t('fantasy.rosterGrade.unscoredTitle') }}
          </p>
          <p class="text-xs text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">
            {{ $t('fantasy.rosterGrade.unscoredBody', { players: grade.roster.length }) }}
          </p>
        </div>
      </div>

      <template v-else>
        <!-- ── Nota ── -->
        <div class="flex items-center gap-4">
          <div
            class="w-20 h-20 rounded-2xl flex items-center justify-center shrink-0"
            :class="gradeTheme.box"
          >
            <span class="text-4xl font-black leading-none tabular-nums" :class="gradeTheme.text">
              {{ grade.grade }}
            </span>
          </div>

          <div class="min-w-0 flex-1">
            <p class="text-callout font-bold text-gray-900 dark:text-white">
              {{ $t('fantasy.rosterGrade.position', {
                position: grade.user_position,
                total: grade.ranking.length,
              }) }}
            </p>
            <p
              class="inline-flex items-center gap-1 mt-1.5 px-2 py-1 rounded-lg text-xs font-bold tabular-nums"
              :class="grade.difference >= 0
                ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                : 'bg-red-50 dark:bg-red-500/10 text-red-500 dark:text-red-400'"
            >
              <v-icon
                :name="grade.difference >= 0 ? 'hi-solid-arrow-up' : 'hi-solid-arrow-down'"
                class="w-3 h-3 shrink-0"
              />
              {{ grade.difference >= 0 ? '+' : '' }}{{ grade.difference }}
              <span class="font-medium opacity-80">{{ $t('fantasy.rosterGrade.differenceSuffix') }}</span>
            </p>
          </div>
        </div>

        <!-- ── Las tres cifras que sostienen la nota ── -->
        <dl class="grid grid-cols-3 gap-2 mt-4">
          <!-- flex-col-reverse: en el DOM va término y luego valor (como manda
               una lista de definición), pero en pantalla manda la cifra. -->
          <div
            v-for="stat in headlineStats"
            :key="stat.label"
            class="flex flex-col-reverse rounded-xl bg-gray-50 dark:bg-gray-800/60 px-2 py-2.5 text-center"
          >
            <dt class="text-2xs text-gray-500 dark:text-gray-400 mt-1 truncate">
              {{ stat.label }}
            </dt>
            <dd class="text-callout font-black text-gray-900 dark:text-white tabular-nums leading-none">
              {{ stat.value }}
            </dd>
          </div>
        </dl>

        <!-- ── Fuerza por línea ── -->
        <section class="mt-5">
          <div class="flex items-baseline justify-between gap-2 mb-3">
            <h3 class="text-2xs uppercase tracking-wider font-semibold text-gray-400 dark:text-gray-500">
              {{ $t('fantasy.rosterGrade.byLine') }}
            </h3>
            <p class="flex items-center gap-1 text-2xs text-gray-400 dark:text-gray-500">
              <span class="inline-block w-px h-3 bg-gray-400 dark:bg-gray-500" aria-hidden="true" />
              {{ $t('fantasy.rosterGrade.averageMark') }}
            </p>
          </div>

          <ul class="space-y-3">
            <li v-for="(line, index) in grade.by_position" :key="line.code">
              <div class="flex items-center justify-between gap-2 mb-1">
                <span class="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  {{ $t(`fantasy.positions.${line.code}`) }}
                </span>
                <div class="flex items-center gap-2 shrink-0 tabular-nums">
                  <span class="text-xs font-semibold text-gray-700 dark:text-gray-300">{{ line.points }}</span>
                  <span
                    class="text-2xs font-bold w-11 text-right"
                    :class="line.difference >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'"
                  >
                    {{ line.difference >= 0 ? '+' : '' }}{{ Math.round(line.difference) }}
                  </span>
                  <span
                    class="w-7 text-center text-2xs font-black px-1 py-0.5 rounded"
                    :class="lineBadgeClass(line.grade)"
                  >
                    {{ line.grade }}
                  </span>
                </div>
              </div>

              <!-- La media de la liga está clavada en el 50 % de cada barra: la
                   longitud se normaliza contra la media de ESA línea, así que un
                   portero (44 pts) y un mediocampo (822) se leen en la misma
                   escala y basta recorrer la columna para ver quién pasa la
                   marca. -->
              <div class="relative h-3 flex items-center">
                <div class="h-2.5 w-full rounded-full bg-gray-100 dark:bg-gray-700/60 overflow-hidden">
                  <div
                    class="h-full rounded-full line-bar"
                    :class="line.difference >= 0 ? 'bg-emerald-500' : 'bg-red-400 dark:bg-red-500'"
                    :style="barStyle(line, index)"
                  />
                </div>
                <!-- La marca sobresale de la barra para que nunca la tape el
                     relleno, ni siquiera cuando la línea duplica a la media. -->
                <span class="absolute left-1/2 inset-y-0 w-px bg-gray-400 dark:bg-gray-500" aria-hidden="true" />
              </div>
            </li>
          </ul>

          <p
            v-if="weakestLine"
            class="flex items-start gap-2 mt-3 text-xs text-gray-600 dark:text-gray-400"
          >
            <v-icon name="hi-solid-light-bulb" class="w-3.5 h-3.5 text-amber-500 shrink-0 mt-px" />
            <span>
              {{ $t('fantasy.rosterGrade.weakestLine', { line: $t(`fantasy.positions.${weakestLine.code}`) }) }}
            </span>
          </p>
        </section>

        <!-- ── Mejor titular ── -->
        <section v-if="grade.best_player" class="mt-5">
          <h3 class="text-2xs uppercase tracking-wider font-semibold text-gray-400 dark:text-gray-500 mb-2">
            {{ $t('fantasy.rosterGrade.bestPlayer') }}
          </h3>
          <div class="flex items-center gap-3 rounded-2xl border border-gray-100 dark:border-gray-700/60 px-3 py-2.5">
            <div class="w-11 h-11 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700 shrink-0">
              <img
                v-if="grade.best_player.player?.image_path"
                :src="grade.best_player.player.image_path"
                :alt="grade.best_player.player?.display_name ?? ''"
                class="w-full h-full object-cover"
                loading="lazy"
              />
              <div
                v-else
                class="w-full h-full flex items-center justify-center text-2xs font-bold text-gray-400 dark:text-gray-500"
              >
                {{ playerInitials(grade.best_player.player) }}
              </div>
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-footnote font-bold text-gray-900 dark:text-white truncate">
                {{ grade.best_player.player?.display_name }}
              </p>
              <p v-if="grade.best_player.position_code" class="text-2xs text-gray-500 dark:text-gray-400 mt-0.5">
                {{ $t(`fantasy.positions.${grade.best_player.position_code}`) }}
              </p>
            </div>
            <span class="shrink-0 text-callout font-black text-gray-900 dark:text-white tabular-nums">
              {{ grade.best_player.total_points }}
            </span>
          </div>
        </section>

        <!-- ── Clasificación ── -->
        <section class="mt-5">
          <h3 class="text-2xs uppercase tracking-wider font-semibold text-gray-400 dark:text-gray-500 mb-2">
            {{ $t('fantasy.rosterGrade.rankingTitle') }}
          </h3>
          <ul class="rounded-2xl border border-gray-100 dark:border-gray-700/60 divide-y divide-gray-50 dark:divide-gray-700/40 overflow-hidden">
            <li
              v-for="entry in grade.ranking"
              :key="entry.key"
              class="flex items-center gap-3 px-3 py-2.5"
              :class="entry.is_user ? 'bg-emerald-50/70 dark:bg-emerald-500/5' : ''"
            >
              <span class="w-4 shrink-0 text-2xs font-bold text-gray-400 dark:text-gray-500 tabular-nums">
                {{ entry.position }}
              </span>
              <span
                class="w-7 h-7 rounded-full overflow-hidden flex items-center justify-center text-2xs font-bold shrink-0"
                :class="entry.is_user
                  ? 'bg-emerald-500 text-white'
                  : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300'"
              >
                <img
                  v-if="entry.avatar"
                  :src="entry.avatar"
                  :alt="entry.name"
                  class="w-full h-full object-cover"
                  loading="lazy"
                />
                <template v-else>{{ entry.initials }}</template>
              </span>
              <span
                class="flex-1 min-w-0 text-xs truncate"
                :class="entry.is_user
                  ? 'font-bold text-gray-900 dark:text-white'
                  : 'font-medium text-gray-700 dark:text-gray-300'"
              >
                {{ entry.name }}
              </span>
              <span class="shrink-0 text-xs font-bold text-gray-700 dark:text-gray-300 tabular-nums">
                {{ entry.total_points }}
              </span>
            </li>
          </ul>
        </section>

        <p class="text-2xs text-gray-400 dark:text-gray-500 mt-4 leading-relaxed">
          {{ $t('fantasy.rosterGrade.disclaimer') }}
        </p>
      </template>
    </template>
  </BottomSheet>
</template>

<script lang="ts" setup>
import { computed, type CSSProperties } from 'vue'
import { useI18n } from 'vue-i18n'
import { BottomSheet } from '@/components/ui'
import { playerInitials } from '@/components/fantasy/draft/shared/draftShared'
import type { RosterGrade, RosterGradeLine } from '@/interfaces/fantasy/team/RosterGrade'

/**
 * La boleta completa de la plantilla, en un bottom sheet.
 *
 * No pide datos: los recibe ya cargados de RosterGradeCard, que es quien tiene
 * la tarjeta compacta en pantalla. Una sola petición alimenta las dos vistas.
 */
const props = defineProps<{ modelValue: boolean; grade: RosterGrade | null }>()
const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()

const { t } = useI18n()

const gradeTheme = computed(() => gradeThemeFor(props.grade?.grade ?? ''))

/** Los tres números de los que sale la nota, sin tener que leer el desglose. */
const headlineStats = computed(() => {
  const grade = props.grade
  if (!grade) return []

  return [
    { label: t('fantasy.rosterGrade.statStarters'), value: grade.user_points },
    { label: t('fantasy.rosterGrade.statAverage'), value: grade.rivals_average },
    { label: t('fantasy.rosterGrade.statBench'), value: grade.bench_points },
  ]
})

/** La línea más floja del once, si de verdad está por debajo de la media. */
const weakestLine = computed<RosterGradeLine | null>(() => {
  const lines = props.grade?.by_position ?? []
  if (lines.length === 0) return null

  const worst = [...lines].sort((a, b) => a.difference - b.difference)[0]
  return worst.difference < 0 ? worst : null
})

function gradeThemeFor(letter: string): { box: string; text: string } {
  if (letter.startsWith('A')) {
    return { box: 'bg-emerald-50 dark:bg-emerald-500/10', text: 'text-emerald-500' }
  }
  if (letter.startsWith('B')) {
    return { box: 'bg-blue-50 dark:bg-blue-500/10', text: 'text-blue-500' }
  }
  if (letter.startsWith('C')) {
    return { box: 'bg-amber-50 dark:bg-amber-500/10', text: 'text-amber-500' }
  }
  return { box: 'bg-red-50 dark:bg-red-500/10', text: 'text-red-500' }
}

function lineBadgeClass(letter: string): string {
  const theme = gradeThemeFor(letter)
  return `${theme.box} ${theme.text}`
}

/**
 * Ancho de la barra con la media de la liga anclada en el 50 %: la misma
 * distancia visual significa lo mismo en todas las líneas, aunque un portero y
 * un mediocampo jueguen en escalas de puntos muy distintas.
 */
function barWidth(line: RosterGradeLine): string {
  if (line.points <= 0) return '0%'
  if (line.rivals_average <= 0) return '100%'

  const ratio = line.points / line.rivals_average
  return `${Math.min(100, Math.max(3, ratio * 50))}%`
}

/** El escalonado de arriba abajo va en el estilo porque depende del índice. */
function barStyle(line: RosterGradeLine, index: number): CSSProperties {
  return { width: barWidth(line), animationDelay: `${index * 60}ms` }
}
</script>

<style scoped>
.tabular-nums {
  font-variant-numeric: tabular-nums;
}

/* Las barras crecen desde cero al abrir el sheet, escalonadas de arriba abajo:
   ver dónde se detiene cada una respecto de la marca de la media es justo la
   lectura de esta pantalla, así que el movimiento la cuenta en lugar de
   decorarla. Solo se anima el ancho de una barra corta, nunca el layout. */
.line-bar {
  animation: line-bar-grow 420ms cubic-bezier(0.32, 0.72, 0, 1) backwards;
  transition: width 300ms cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes line-bar-grow {
  from {
    width: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .line-bar {
    animation: none;
    transition: none;
  }
}
</style>
