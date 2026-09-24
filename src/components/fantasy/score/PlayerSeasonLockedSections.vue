<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import PremiumBadge from "@/components/premium/PremiumBadge.vue";
import { teaserAverage, teaserBars } from "@/components/fantasy/score/playerSeasonTeaser";

/**
 * Las tres secciones de pago del cajón de temporada, difuminadas.
 *
 * Los títulos quedan nítidos a propósito: el usuario tiene que saber qué se
 * pierde —la gráfica, el desglose, el registro—, no ver un borrón sin nombre.
 * Debajo va una silueta hecha de formas (`playerSeasonTeaser.ts`), no de datos:
 * sin Premium el API no manda el detalle, así que no hay nada que destapar.
 *
 * La venta va encima de la primera sección, la que se ve sin desplazar. Tocar
 * cualquiera de las tres lleva al mismo sitio; el botón de cada una existe para
 * el teclado y el lector de pantalla, que no "tocan" una tarjeta.
 */
interface Props {
  /** Jornadas del torneo: lo único real de la silueta. */
  roundsCount: number;
}

const props = defineProps<Props>();
const emit = defineEmits<{ unlock: [] }>();

const { t } = useI18n();

const bars = computed(() => teaserBars(props.roundsCount));
const average = computed(() => teaserAverage(bars.value));

/** Filas de relleno del desglose: ancho de la etiqueta y de la barra de reparto, en %. */
const STAT_ROWS = [
  { label: 46, share: 96, negative: false },
  { label: 30, share: 42, negative: false },
  { label: 38, share: 20, negative: false },
  { label: 34, share: 12, negative: true },
];

/** Filas de relleno del registro: ancho del rival, en %, y color del resultado. */
const LOG_ROWS = [
  { text: 52, outcome: "win" },
  { text: 40, outcome: "draw" },
  { text: 58, outcome: "loss" },
  { text: 44, outcome: "win" },
] as const;

function outcomeClass(outcome: (typeof LOG_ROWS)[number]["outcome"]): string {
  if (outcome === "win") return "bg-emerald-200 dark:bg-emerald-800/60";
  if (outcome === "loss") return "bg-rose-200 dark:bg-rose-800/60";
  return "bg-gray-200 dark:bg-gray-700";
}

function lockedAria(section: string): string {
  return t("fantasy.playerSeason.lockedAria", { section });
}

function unlock() {
  emit("unlock");
}
</script>

<template>
  <div class="space-y-4">
    <!-- ── Puntos por jornada: aquí va la venta ── -->
    <section class="rounded-2xl border border-gray-100 dark:border-gray-700/60 p-4 cursor-pointer" @click="unlock">
      <div class="flex items-center justify-between gap-2">
        <h3 class="text-footnote font-semibold text-gray-900 dark:text-white">
          {{ t("fantasy.playerSeason.chartTitle") }}
        </h3>
        <PremiumBadge class="shrink-0" />
      </div>

      <div class="relative mt-3 min-h-[13.5rem]">
        <!-- Silueta: formas sin datos, por eso basta con difuminarla -->
        <div class="blur-[5px] select-none pointer-events-none pt-4" aria-hidden="true">
          <div class="relative h-40 ml-6 border-b border-gray-200 dark:border-gray-700">
            <div
              class="absolute inset-x-0 border-t border-dashed border-gray-400/80 dark:border-gray-500/80"
              :style="{ top: `${(1 - average) * 100}%` }"
            />
            <div class="absolute inset-0 flex items-end">
              <div v-for="(height, index) in bars" :key="index" class="relative flex-1 h-full min-w-0">
                <span
                  class="absolute bottom-0 left-1/2 -translate-x-1/2 w-[62%] max-w-[18px] rounded-t-[4px] bg-emerald-500/80 dark:bg-emerald-400/80"
                  :style="{ height: `${height * 100}%` }"
                />
              </div>
            </div>
          </div>
          <div class="flex ml-6 mt-2">
            <span v-for="(_, index) in bars" :key="index" class="flex-1 flex justify-center">
              <span class="w-2 h-2 rounded-full bg-gray-200 dark:bg-gray-700" />
            </span>
          </div>
        </div>

        <!-- La venta, encima de la silueta. Sin tarjeta propia: un velo que se
             aclara hacia los bordes deja asomar las barras, que es justo lo
             que invita a destaparlas. -->
        <div class="locked-veil absolute inset-0 flex flex-col items-center justify-center text-center px-6">
          <div
            class="mb-2 grid place-items-center w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 ring-4 ring-white/70 dark:ring-gray-900/60"
            aria-hidden="true"
          >
            <v-icon name="hi-solid-lock-closed" class="w-5 h-5" />
          </div>
          <p class="max-w-[16rem] text-callout font-bold text-gray-900 dark:text-white leading-snug">
            {{ t("fantasy.playerSeason.lockedTitle") }}
          </p>
          <p class="mt-1 max-w-[16rem] text-xs text-gray-600 dark:text-gray-300">
            {{ t("fantasy.playerSeason.lockedBody") }}
          </p>
          <button
            type="button"
            class="mt-3 inline-flex items-center justify-center gap-1.5 min-h-[2.5rem] px-5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 text-footnote font-bold shadow-md active:scale-[0.98] transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/60 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900"
            @click.stop="unlock"
          >
            <v-icon name="hi-solid-sparkles" class="w-4 h-4" aria-hidden="true" />
            {{ t("fantasy.playerSeason.lockedCta") }}
          </button>
        </div>
      </div>
    </section>

    <!-- ── De dónde salen sus puntos ── -->
    <section
      class="relative rounded-2xl border border-gray-100 dark:border-gray-700/60 overflow-hidden cursor-pointer"
      @click="unlock"
    >
      <div class="flex items-center justify-between gap-2 px-4 pt-3 pb-2">
        <h3 class="text-footnote font-semibold text-gray-900 dark:text-white">
          {{ t("fantasy.playerSeason.statsTitle") }}
        </h3>
        <PremiumBadge class="shrink-0" />
      </div>
      <div class="blur-[5px] select-none pointer-events-none pb-2" aria-hidden="true">
        <div v-for="(row, index) in STAT_ROWS" :key="index" class="px-4 py-2.5">
          <div class="flex items-center justify-between gap-3">
            <span class="h-3 rounded-full bg-gray-300 dark:bg-gray-600" :style="{ width: `${row.label}%` }" />
            <span
              class="h-3.5 w-10 rounded"
              :class="row.negative ? 'bg-rose-300 dark:bg-rose-500/60' : 'bg-emerald-300 dark:bg-emerald-500/60'"
            />
          </div>
          <div class="mt-2 h-1 rounded-full bg-gray-100 dark:bg-gray-700/60 overflow-hidden">
            <div
              class="h-full rounded-full"
              :class="row.negative ? 'bg-rose-400 dark:bg-rose-500' : 'bg-emerald-400 dark:bg-emerald-500'"
              :style="{ width: `${row.share}%` }"
            />
          </div>
        </div>
      </div>
      <div class="absolute inset-x-0 top-10 bottom-0 flex items-center justify-center">
        <button
          type="button"
          class="inline-flex items-center gap-1.5 min-h-[2.25rem] px-3.5 rounded-full bg-white/90 dark:bg-gray-900/90 shadow ring-1 ring-amber-500/25 text-xs font-semibold text-amber-700 dark:text-amber-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/60"
          :aria-label="lockedAria(t('fantasy.playerSeason.statsTitle'))"
          @click.stop="unlock"
        >
          <v-icon name="hi-solid-lock-closed" class="w-3.5 h-3.5" aria-hidden="true" />
          {{ t("premium.locked") }}
        </button>
      </div>
    </section>

    <!-- ── Jornada a jornada ── -->
    <section
      class="relative rounded-2xl border border-gray-100 dark:border-gray-700/60 overflow-hidden cursor-pointer"
      @click="unlock"
    >
      <div class="flex items-center justify-between gap-2 px-4 pt-3 pb-2">
        <h3 class="text-footnote font-semibold text-gray-900 dark:text-white">
          {{ t("fantasy.playerSeason.logTitle") }}
        </h3>
        <PremiumBadge class="shrink-0" />
      </div>
      <ul class="blur-[5px] select-none pointer-events-none divide-y divide-gray-100 dark:divide-gray-700/60" aria-hidden="true">
        <li v-for="(row, index) in LOG_ROWS" :key="index" class="flex items-center gap-3 px-4 py-3">
          <span class="w-10 h-6 shrink-0 rounded-lg bg-gray-100 dark:bg-gray-800" />
          <span class="w-4 h-4 shrink-0 rounded-full bg-gray-300 dark:bg-gray-600" />
          <span class="h-3 rounded-full bg-gray-300 dark:bg-gray-600" :style="{ width: `${row.text}%` }" />
          <span class="h-4 w-10 shrink-0 rounded-md" :class="outcomeClass(row.outcome)" />
          <span class="ml-auto h-3.5 w-8 shrink-0 rounded bg-emerald-300 dark:bg-emerald-500/60" />
        </li>
      </ul>
      <div class="absolute inset-x-0 top-10 bottom-0 flex items-center justify-center">
        <button
          type="button"
          class="inline-flex items-center gap-1.5 min-h-[2.25rem] px-3.5 rounded-full bg-white/90 dark:bg-gray-900/90 shadow ring-1 ring-amber-500/25 text-xs font-semibold text-amber-700 dark:text-amber-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/60"
          :aria-label="lockedAria(t('fantasy.playerSeason.logTitle'))"
          @click.stop="unlock"
        >
          <v-icon name="hi-solid-lock-closed" class="w-3.5 h-3.5" aria-hidden="true" />
          {{ t("premium.locked") }}
        </button>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* Velo de la venta: opaco donde va el texto, transparente hacia los bordes. */
.locked-veil {
  background: radial-gradient(ellipse 75% 70% at center, rgb(255 255 255 / 0.9) 35%, rgb(255 255 255 / 0) 100%);
}

/* `.dark` vive en <html>; con `scoped` el atributo va solo a `.locked-veil`. */
.dark .locked-veil {
  background: radial-gradient(ellipse 75% 70% at center, rgb(17 24 39 / 0.88) 35%, rgb(17 24 39 / 0) 100%);
}
</style>
