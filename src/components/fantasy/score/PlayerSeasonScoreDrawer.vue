<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { BottomSheet } from "@/components/ui";
import NationalityBadge from "@/components/football/ui/NationalityBadge.vue";
import { POSITION_BADGE, type LineupVariant } from "@/components/fantasy/lineup/lineupVariants";
import { usePositionShortCode } from "@/composables/usePositionShortCode";
import { fantasyLeagueService } from "@/services/fantasy/leagues/FantasyLeagueService";
import type {
  PlayerSeasonFixture,
  PlayerSeasonRound,
  PlayerSeasonScoreResponse,
  PlayerSeasonStat,
} from "@/interfaces/fantasy/score/PlayerSeasonScoreResponse";
import type { PlayerSeasonSeed } from "@/components/fantasy/score/playerSeasonSeed";
import { buildSeasonChart } from "@/components/fantasy/score/playerSeasonChart";
import PlayerSeasonLockedSections from "@/components/fantasy/score/PlayerSeasonLockedSections.vue";
import { openPremiumUpsell } from "@/composables/usePremiumUpsell";
import { PREMIUM_FEATURES } from "@/interfaces/user/billing/EntitlementsResponse";

/**
 * La temporada de un jugador con las reglas de la liga: el mismo total que su
 * fila en Jugadores, explicado de tres maneras que se leen de arriba abajo —
 * cómo le fue jornada a jornada (la gráfica), de dónde salen los puntos (por
 * estadística) y el registro partido a partido, que es además la tabla que
 * hace innecesario pasar el dedo por la gráfica para leer un valor.
 *
 * Se abre desde Jugadores, desde el pool del draft y desde el detalle por
 * jornada de Mi equipo; por eso recibe una `PlayerSeasonSeed` y no ninguna de
 * las tres formas de jugador.
 *
 * La cabecera y las tres cifras son de todos; las tres secciones, de Premium.
 * Sin suscripción el API las manda vacías con `requires_premium` y aquí se
 * pintan difuminadas (`PlayerSeasonLockedSections`), con la venta encima.
 */
interface Props {
  modelValue: boolean;
  leagueUuid: string;
  player: PlayerSeasonSeed | null;
  /** Para abrirse encima de otro cajón. */
  zIndex?: number;
}

const props = withDefaults(defineProps<Props>(), { zIndex: 120 });
const emit = defineEmits<{ "update:modelValue": [value: boolean] }>();

const { t } = useI18n();
const positionShort = usePositionShortCode();

const isLoading = ref(false);
const error = ref<string | null>(null);
const detail = ref<PlayerSeasonScoreResponse | null>(null);
/** Jornada fijada con un toque en la gráfica. */
const selectedIndex = ref<number | null>(null);
/** Jornada bajo el puntero o el foco — manda sobre la fijada mientras dura. */
const hoverIndex = ref<number | null>(null);
/** Filas del registro abiertas, por índice de jornada. */
const expanded = ref<Set<number>>(new Set());
// Descarta respuestas de un jugador anterior si se cambia rápido de fila.
let requestId = 0;

// ── Identidad: la semilla pinta al instante; la respuesta completa lo que falte.
const name = computed(() => props.player?.name || detail.value?.player?.display_name || "");
const image = computed(
  () => props.player?.imagePath || detail.value?.player?.image_path || "/img/default-avatar.svg",
);
const positionDev = computed(
  () => props.player?.positionDev ?? detail.value?.player?.position?.developer_name ?? "",
);
const teamImage = computed(() => props.player?.teamImage ?? detail.value?.team?.image_path ?? null);
const teamShort = computed(() => props.player?.teamShortCode ?? detail.value?.team?.short_code ?? null);
const country = computed(() => props.player?.country ?? detail.value?.player?.country ?? null);

// ── Cifras: manda el servidor; la fila de la que se vino las adelanta.
const summary = computed(() => detail.value?.summary ?? null);
const totalPoints = computed<number | null>(() => summary.value?.total_points ?? props.player?.totalPoints ?? null);
const averagePoints = computed<number | null>(
  () => summary.value?.average_points ?? props.player?.averagePoints ?? null,
);
const totalFixtures = computed<number | null>(
  () => summary.value?.total_fixtures ?? props.player?.totalFixtures ?? null,
);

/**
 * Un hueco sin cifra late solo mientras de verdad se espera algo: con un error
 * a la vista, una silueta latiendo para siempre promete una carga que no llega.
 */
const awaitingData = computed(() => isLoading.value || (!detail.value && !error.value));

const scope = computed(() => detail.value?.scope ?? null);
const scopeLabel = computed(() =>
  scope.value
    ? t("fantasy.playerSeason.scope", { stage: scope.value.stage.name, season: scope.value.season.name })
    : "",
);
const rulesLabel = computed(() =>
  detail.value?.fantasy_league?.name
    ? t("fantasy.playerSeason.rules", { league: detail.value.fantasy_league.name })
    : "",
);

const rounds = computed<PlayerSeasonRound[]>(() => detail.value?.rounds ?? []);
const hasPoints = computed(() => (summary.value?.rounds_played ?? 0) > 0);
/** Sin Premium: llegan el resumen y las cifras, pero ni jornadas ni desglose. */
const isLocked = computed(() => detail.value?.requires_premium === true);
const chart = computed(() => buildSeasonChart(rounds.value, summary.value?.average_points ?? 0));
const hasAbsent = computed(() => rounds.value.some((round) => round.status === "absent"));
const hasPending = computed(() => rounds.value.some((round) => round.status === "pending"));
/** Con muchas jornadas se rotula una sí y otra no; la elegida siempre. */
const denseAxis = computed(() => rounds.value.length > 18);
/**
 * Un rótulo del eje pegado al del cero se monta encima ("0" sobre "-4" cuando
 * lo negativo es poco): por debajo de ~17 px de separación se omite, y el
 * valor sigue en la lectura de la jornada y en el registro.
 */
const MIN_TICK_GAP = 0.12;
const showTopTick = computed(() => chart.value.baseline >= MIN_TICK_GAP);
const showBottomTick = computed(() => chart.value.minValue < 0 && 1 - chart.value.baseline >= MIN_TICK_GAP);

const activeIndex = computed(() => hoverIndex.value ?? selectedIndex.value);
const activeRound = computed(() =>
  activeIndex.value !== null ? rounds.value[activeIndex.value] ?? null : null,
);

const bestRound = computed(() => summary.value?.best_round ?? null);

// ── Desglose por estadística: primero lo que suma, luego lo que resta.
const stats = computed<PlayerSeasonStat[]>(() => detail.value?.stats ?? []);
const gained = computed(() => stats.value.filter((stat) => stat.points > 0));
const lost = computed(() =>
  stats.value.filter((stat) => stat.points < 0).sort((a, b) => a.points - b.points),
);
const gainedTotal = computed(() => gained.value.reduce((sum, stat) => sum + stat.points, 0));
const lostTotal = computed(() => lost.value.reduce((sum, stat) => sum + stat.points, 0));
/** Las barras de reparto se miden contra la estadística más grande, sume o reste. */
const statScale = computed(() => Math.max(0, ...stats.value.map((stat) => Math.abs(stat.points))));
const unattributed = computed(() => {
  const value = summary.value?.unattributed_points ?? 0;
  return Math.abs(value) >= 0.005 ? value : 0;
});

/** El registro va de la más reciente a la primera: lo último es lo que se busca. */
const logEntries = computed(() => rounds.value.map((round, index) => ({ round, index })).reverse());

// ── Formato ──

/** Como mucho dos decimales, sin colas si el número es entero. */
function fmt(n: number): string {
  return Number.isInteger(n) ? String(n) : Number(n.toFixed(2)).toString();
}

function signed(n: number): string {
  return n > 0 ? `+${fmt(n)}` : fmt(n);
}

function pointsClass(points: number): string {
  if (points > 0) return "text-emerald-600 dark:text-emerald-400";
  if (points < 0) return "text-rose-600 dark:text-rose-400";
  return "text-gray-400 dark:text-gray-500";
}

function positionBadgeClass(dev: string): string {
  return POSITION_BADGE[dev.toLowerCase() as LineupVariant] ?? POSITION_BADGE.bench;
}

function roundLabel(round: PlayerSeasonRound): string {
  return round.round
    ? t("fantasy.playerSeason.roundLabel", { name: round.round.name })
    : t("fantasy.playerSeason.looseFixture");
}

function roundShort(round: PlayerSeasonRound): string {
  return round.round
    ? t("fantasy.playerSeason.roundShort", { name: round.round.name })
    : t("fantasy.playerSeason.looseFixture");
}

/** Rótulo del eje: solo el número, que es lo único que cabe en 13 px. */
function axisLabel(round: PlayerSeasonRound): string {
  return round.round?.name ?? "·";
}

function opponentName(fixture: PlayerSeasonFixture): string {
  const team = fixture.opponent;
  return team?.short_code || team?.name || fixture.fixture?.name || "—";
}

function locationLabel(fixture: PlayerSeasonFixture): string {
  if (fixture.location === "home") return t("fantasy.playerSeason.home");
  if (fixture.location === "away") return t("fantasy.playerSeason.away");
  return "";
}

function outcomeLetter(fixture: PlayerSeasonFixture): string {
  switch (fixture.result?.outcome) {
    case "win":
      return t("fantasy.playerSeason.outcomeWin");
    case "draw":
      return t("fantasy.playerSeason.outcomeDraw");
    case "loss":
      return t("fantasy.playerSeason.outcomeLoss");
    default:
      return "";
  }
}

function outcomeLabel(fixture: PlayerSeasonFixture): string {
  switch (fixture.result?.outcome) {
    case "win":
      return t("fantasy.playerSeason.outcomeWinLabel");
    case "draw":
      return t("fantasy.playerSeason.outcomeDrawLabel");
    case "loss":
      return t("fantasy.playerSeason.outcomeLossLabel");
    default:
      return "";
  }
}

function outcomeClass(fixture: PlayerSeasonFixture): string {
  switch (fixture.result?.outcome) {
    case "win":
      return "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300";
    case "loss":
      return "bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300";
    default:
      return "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300";
  }
}

function equation(stat: { value: number; points_per_unit: number | null }): string {
  return stat.points_per_unit === null ? fmt(stat.value) : `${fmt(stat.value)} × ${fmt(stat.points_per_unit)}`;
}

function shareWidth(points: number): string {
  if (statScale.value <= 0) return "0%";
  return `${Math.max(2, (Math.abs(points) / statScale.value) * 100)}%`;
}

function barAria(round: PlayerSeasonRound): string {
  const nameText = round.round?.name ?? t("fantasy.playerSeason.looseFixture");
  if (round.status === "absent") return t("fantasy.playerSeason.barAbsentAria", { name: nameText });
  if (round.status === "pending") return t("fantasy.playerSeason.barPendingAria", { name: nameText });
  return t("fantasy.playerSeason.barAria", { name: nameText, points: fmt(round.total_points) });
}

function barColorClass(index: number, points: number): string {
  if (chart.value.bestIndex === index) return "bg-amber-500 dark:bg-amber-400";
  if (points < 0) return "bg-rose-500 dark:bg-rose-400";
  if (points === 0) return "bg-gray-300 dark:bg-gray-600";
  return "bg-emerald-500 dark:bg-emerald-400";
}

// ── Interacción ──

const plotRef = ref<HTMLElement | null>(null);
/** El dedo recorrió varias jornadas: el `click` que llega al soltar no cuenta. */
let scrubbed = false;
let scrubStart: number | null = null;

function selectRound(index: number) {
  if (scrubbed) {
    scrubbed = false;
    return;
  }
  selectedIndex.value = selectedIndex.value === index ? null : index;
}

/**
 * Pasar el ratón por una barra la lee sin fijarla. **Solo el ratón**: un toque
 * dispara también el `mouseenter` emulado del navegador, que dejaba la jornada
 * leída para siempre y un segundo toque ya no la soltaba.
 */
function onBarPointerEnter(event: PointerEvent, index: number) {
  if (event.pointerType === "mouse") hoverIndex.value = index;
}

function onPlotPointerLeave(event: PointerEvent) {
  if (event.pointerType === "mouse") hoverIndex.value = null;
}

function indexAt(clientX: number): number | null {
  const plot = plotRef.value;
  const count = chart.value.bars.length;
  if (!plot || count === 0) return null;
  const rect = plot.getBoundingClientRect();
  if (rect.width <= 0) return null;
  const ratio = (clientX - rect.left) / rect.width;
  return Math.min(count - 1, Math.max(0, Math.floor(ratio * count)));
}

/**
 * Con el dedo, cada columna mide lo que cabe entre 17 jornadas —unos 13 px en
 * un teléfono—, así que acertarle a una es difícil. Arrastrar por el lienzo va
 * leyendo jornada a jornada (la cruz que busca la X) y al soltar se queda fija
 * la última. El ratón no pasa por aquí: tiene el `mouseenter` de cada barra.
 */
function onPlotPointerMove(event: PointerEvent) {
  if (event.pointerType === "mouse" || event.buttons === 0) return;
  const index = indexAt(event.clientX);
  if (index === null) return;
  if (scrubStart === null) scrubStart = index;
  else if (index !== scrubStart) scrubbed = true;
  hoverIndex.value = index;
}

function onPlotPointerEnd(event: PointerEvent) {
  if (event.pointerType === "mouse") return;
  if (scrubbed && hoverIndex.value !== null) selectedIndex.value = hoverIndex.value;
  hoverIndex.value = null;
  scrubStart = null;
  // El `click` del toque llega después de `pointerup`; si no llega (se soltó
  // fuera de una barra), la bandera no debe quedarse puesta para el siguiente.
  if (scrubbed) setTimeout(() => (scrubbed = false), 400);
}

/**
 * La hoja de Premium se abre encima y el cajón se queda debajo: quien la cierra
 * sin comprar vuelve al mismo jugador. Es la hoja de cualquier candado de la
 * web, con el motivo de éste como subtítulo.
 */
function unlock() {
  openPremiumUpsell(PREMIUM_FEATURES.fantasyPlayerSeason);
}

function toggleRound(index: number) {
  const next = new Set(expanded.value);
  if (next.has(index)) next.delete(index);
  else next.add(index);
  expanded.value = next;
}

async function load() {
  const playerUuid = props.player?.uuid;
  if (!props.leagueUuid || !playerUuid) return;

  const current = ++requestId;
  isLoading.value = true;
  error.value = null;
  try {
    const response = await fantasyLeagueService.getPlayerSeasonScore(props.leagueUuid, playerUuid);
    if (current !== requestId) return;
    detail.value = response;
  } catch (e) {
    if (current !== requestId) return;
    // El interceptor ya avisó con el mensaje del servidor; aquí basta con
    // decir qué no se pudo cargar y ofrecer el reintento.
    error.value = t("fantasy.playerSeason.loadError");
    console.error("Error loading player season score:", e);
  } finally {
    if (current === requestId) isLoading.value = false;
  }
}

function reset() {
  requestId++;
  detail.value = null;
  error.value = null;
  isLoading.value = false;
  selectedIndex.value = null;
  hoverIndex.value = null;
  expanded.value = new Set();
}

function close() {
  emit("update:modelValue", false);
}

// Se pide al abrir y se limpia al cerrar, para que al reabrirse con otro
// jugador nunca asome la temporada del anterior.
watch(
  () => props.modelValue,
  (open) => {
    if (open) load();
    else reset();
  },
  { immediate: true },
);

watch(
  () => props.player?.uuid,
  (uuid, previous) => {
    if (!props.modelValue || !uuid || uuid === previous) return;
    reset();
    load();
  },
);
</script>

<template>
  <BottomSheet
    :is-visible="modelValue"
    size="xl"
    role="dialog"
    :aria-label="t('fantasy.playerSeason.sheetAria', { name })"
    :z-index="zIndex"
    @close="close"
  >
    <!-- Cabecera: quién es y el total de la temporada -->
    <template #header>
      <div v-if="player" class="flex items-center gap-3 w-full">
        <img
          :src="image"
          :alt="name"
          class="w-12 h-12 rounded-full object-cover border border-gray-200 dark:border-gray-600 shrink-0"
        />
        <div class="flex-1 min-w-0">
          <p class="text-base font-bold text-gray-900 dark:text-white leading-snug line-clamp-2 break-words">
            {{ name }}
          </p>
          <div class="flex items-center gap-1.5 mt-0.5">
            <span
              v-if="positionDev"
              class="inline-flex items-center justify-center px-1.5 py-0.5 rounded text-2xs font-bold shrink-0"
              :class="positionBadgeClass(positionDev)"
            >
              {{ positionShort(positionDev) }}
            </span>
            <img v-if="teamImage" :src="teamImage" :alt="teamShort ?? ''" class="w-3.5 h-3.5 object-contain shrink-0" />
            <span v-if="teamShort" class="text-2xs text-gray-400 dark:text-gray-500 truncate">{{ teamShort }}</span>
            <NationalityBadge :country="country" />
          </div>
        </div>
        <div class="text-right shrink-0">
          <!-- Cifra suelta y grande: proporcional, no tabular. -->
          <p v-if="totalPoints !== null" class="text-3xl font-black leading-none text-amber-600 dark:text-amber-400">
            {{ fmt(totalPoints) }}
          </p>
          <div v-else-if="awaitingData" class="h-8 w-14 ml-auto rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse" />
          <p v-else class="text-3xl font-black leading-none text-gray-300 dark:text-gray-600">—</p>
          <p class="text-2xs text-gray-400 dark:text-gray-500 mt-1 uppercase tracking-wide">
            {{ t("fantasy.playerSeason.totalLabel") }}
          </p>
        </div>
      </div>
    </template>

    <!-- Cifras de cabecera: salen de la fila de la que se vino mientras carga,
         así que el cajón no abre en blanco. -->
    <div class="grid grid-cols-3 gap-2 mb-4">
      <div class="rounded-2xl bg-gray-50 dark:bg-gray-800/70 px-3 py-2.5 min-w-0">
        <p class="text-2xs text-gray-500 dark:text-gray-400 truncate">{{ t("fantasy.playerSeason.kpiAverage") }}</p>
        <p v-if="averagePoints !== null" class="text-lg font-bold text-gray-900 dark:text-white leading-tight">
          {{ fmt(averagePoints) }}
        </p>
        <div v-else-if="awaitingData" class="h-5 w-10 mt-0.5 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
        <p v-else class="text-lg font-bold text-gray-300 dark:text-gray-600 leading-tight">—</p>
        <p class="text-2xs text-gray-400 dark:text-gray-500 truncate">{{ t("fantasy.playerSeason.kpiAverageHint") }}</p>
      </div>
      <div class="rounded-2xl bg-gray-50 dark:bg-gray-800/70 px-3 py-2.5 min-w-0">
        <p class="text-2xs text-gray-500 dark:text-gray-400 truncate">{{ t("fantasy.playerSeason.kpiFixtures") }}</p>
        <p v-if="totalFixtures !== null" class="text-lg font-bold text-gray-900 dark:text-white leading-tight">
          {{ totalFixtures }}
        </p>
        <div v-else-if="awaitingData" class="h-5 w-8 mt-0.5 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
        <p v-else class="text-lg font-bold text-gray-300 dark:text-gray-600 leading-tight">—</p>
        <p class="text-2xs text-gray-400 dark:text-gray-500 truncate">
          <template v-if="summary && summary.rounds_count > 0">
            {{ t("fantasy.playerSeason.kpiFixturesHint", { count: summary.rounds_count }, summary.rounds_count) }}
          </template>
          <template v-else>&nbsp;</template>
        </p>
      </div>
      <div class="rounded-2xl bg-gray-50 dark:bg-gray-800/70 px-3 py-2.5 min-w-0">
        <p class="text-2xs text-gray-500 dark:text-gray-400 truncate">{{ t("fantasy.playerSeason.kpiBest") }}</p>
        <template v-if="summary">
          <p class="text-lg font-bold leading-tight" :class="bestRound ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'">
            {{ bestRound ? signed(bestRound.total_points) : "—" }}
          </p>
          <p class="text-2xs text-gray-400 dark:text-gray-500 truncate">
            {{ bestRound?.round ? t("fantasy.playerSeason.roundLabel", { name: bestRound.round.name }) : '\u00a0' }}
          </p>
        </template>
        <template v-else>
          <div v-if="awaitingData" class="h-5 w-10 mt-0.5 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
          <p v-else class="text-lg font-bold text-gray-300 dark:text-gray-600 leading-tight">—</p>
          <p class="text-2xs">&nbsp;</p>
        </template>
      </div>
    </div>

    <!-- ── Cargando ── -->
    <div v-if="isLoading" class="space-y-4 animate-pulse" aria-hidden="true">
      <div class="rounded-2xl border border-gray-100 dark:border-gray-700/60 p-4">
        <div class="h-3 w-32 rounded-full bg-gray-200 dark:bg-gray-700 mb-4" />
        <div class="h-36 flex items-end gap-1.5">
          <div
            v-for="n in 12"
            :key="n"
            class="flex-1 rounded-t bg-gray-200 dark:bg-gray-700"
            :style="{ height: `${25 + ((n * 37) % 60)}%` }"
          />
        </div>
      </div>
      <div class="rounded-2xl border border-gray-100 dark:border-gray-700/60 overflow-hidden">
        <div v-for="r in 4" :key="r" class="flex items-center justify-between gap-3 px-4 py-3 border-b border-gray-50 dark:border-gray-700/40 last:border-b-0">
          <div class="h-3 rounded-full bg-gray-200 dark:bg-gray-700" :style="{ width: `${35 + (r * 13) % 30}%` }" />
          <div class="h-4 w-10 rounded bg-gray-200 dark:bg-gray-700" />
        </div>
      </div>
    </div>

    <!-- ── Error ── -->
    <div v-else-if="error" class="py-10 text-center">
      <v-icon name="hi-solid-exclamation-circle" class="w-8 h-8 text-red-400 mx-auto mb-3" />
      <p class="text-footnote text-red-500 dark:text-red-400 mb-4">{{ error }}</p>
      <button
        type="button"
        class="px-4 py-2 bg-red-500 text-white rounded-full text-footnote font-medium active:bg-red-600 transition-colors"
        @click="load"
      >
        {{ t("fantasy.playerSeason.retry") }}
      </button>
    </div>

    <template v-else-if="detail">
      <!-- De qué torneo salen los números, y con qué reglas -->
      <p v-if="scopeLabel" class="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mb-3 min-w-0">
        <v-icon name="hi-solid-calendar" class="w-3.5 h-3.5 shrink-0" />
        <span class="truncate">{{ scopeLabel }}<template v-if="rulesLabel"> · {{ rulesLabel }}</template></span>
      </p>

      <!-- El torneo en curso aún no puntúa: se enseña el anterior, como la lista -->
      <div
        v-if="scope?.is_fallback"
        class="flex items-start gap-2.5 px-3.5 py-3 mb-4 rounded-2xl bg-amber-50 dark:bg-amber-900/15 border border-amber-200 dark:border-amber-700/40"
      >
        <v-icon name="hi-solid-information-circle" class="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
        <div class="min-w-0">
          <p class="text-footnote font-semibold text-amber-800 dark:text-amber-300">
            {{ t("fantasy.playerSeason.fallbackTitle") }}
          </p>
          <p class="text-xs text-amber-700/90 dark:text-amber-400/90">
            {{ t("fantasy.playerSeason.fallbackBody", { stage: scope.stage.name, season: scope.season.name }) }}
          </p>
        </div>
      </div>

      <!-- Sin un solo punto en el torneo -->
      <div v-if="!hasPoints" class="py-10 text-center">
        <div class="w-14 h-14 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-3">
          <v-icon name="hi-solid-chart-bar" class="w-7 h-7 text-gray-400 dark:text-gray-500" />
        </div>
        <h3 class="text-callout font-semibold text-gray-900 dark:text-white mb-1">
          {{ t("fantasy.playerSeason.emptyTitle") }}
        </h3>
        <p class="text-footnote text-gray-400 dark:text-gray-500 max-w-xs mx-auto">
          {{ t("fantasy.playerSeason.emptyBody") }}
        </p>
      </div>

      <!-- Sin Premium: las mismas tres secciones, difuminadas y con la venta -->
      <PlayerSeasonLockedSections
        v-else-if="isLocked"
        :rounds-count="summary?.rounds_count ?? 0"
        @unlock="unlock"
      />

      <div v-else class="space-y-4">
        <!-- ── Puntos por jornada ── -->
        <section class="rounded-2xl border border-gray-100 dark:border-gray-700/60 p-4">
          <div class="flex items-baseline justify-between gap-2">
            <h3 class="text-footnote font-semibold text-gray-900 dark:text-white">
              {{ t("fantasy.playerSeason.chartTitle") }}
            </h3>
            <span class="text-2xs text-gray-400 dark:text-gray-500 tabular-nums shrink-0">
              {{ summary?.rounds_played }}/{{ summary?.rounds_count }}
            </span>
          </div>

          <!-- Lectura de la jornada elegida; sin elegir, la pista de que se puede -->
          <div class="min-h-[2.25rem] mt-1 mb-2 flex items-center" aria-live="polite">
            <template v-if="activeRound">
              <div class="flex items-center gap-1.5 min-w-0 text-xs text-gray-600 dark:text-gray-300">
                <span class="font-semibold text-gray-900 dark:text-white shrink-0">{{ roundLabel(activeRound) }}</span>
                <template v-if="activeRound.status === 'played' && activeRound.fixtures[0]">
                  <span class="text-gray-300 dark:text-gray-600">·</span>
                  <img
                    v-if="activeRound.fixtures[0].opponent?.image_path"
                    :src="activeRound.fixtures[0].opponent.image_path"
                    alt=""
                    class="w-3.5 h-3.5 object-contain shrink-0"
                  />
                  <span class="truncate">{{ t("fantasy.playerSeason.versus", { team: opponentName(activeRound.fixtures[0]) }) }}</span>
                  <span
                    v-if="activeRound.fixtures[0].result"
                    class="shrink-0 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-2xs font-bold tabular-nums"
                    :class="outcomeClass(activeRound.fixtures[0])"
                  >
                    {{ activeRound.fixtures[0].result.goals_for }}–{{ activeRound.fixtures[0].result.goals_against }}
                    {{ outcomeLetter(activeRound.fixtures[0]) }}
                  </span>
                  <span class="ml-auto pl-2 text-footnote font-extrabold tabular-nums shrink-0" :class="pointsClass(activeRound.total_points)">
                    {{ signed(activeRound.total_points) }}
                  </span>
                </template>
                <template v-else>
                  <span class="text-gray-300 dark:text-gray-600">·</span>
                  <span class="text-gray-400 dark:text-gray-500">
                    {{ activeRound.status === "absent" ? t("fantasy.playerSeason.absent") : t("fantasy.playerSeason.pending") }}
                  </span>
                </template>
              </div>
            </template>
            <p v-else class="text-2xs text-gray-400 dark:text-gray-500">{{ t("fantasy.playerSeason.chartHint") }}</p>
          </div>

          <!-- Lienzo: eje a la izquierda, barras que crecen desde el cero -->
          <div
            class="relative flex mt-3"
            role="group"
            :aria-label="t('fantasy.playerSeason.chartAria', {
              played: summary?.rounds_played ?? 0,
              count: summary?.rounds_count ?? 0,
              average: fmt(summary?.average_points ?? 0),
            })"
          >
            <div class="relative w-8 shrink-0 h-36 text-[10px] leading-none text-gray-400 dark:text-gray-500 tabular-nums" aria-hidden="true">
              <span v-if="showTopTick" class="absolute right-1.5 -translate-y-1/2" style="top: 0%">{{ fmt(chart.maxValue) }}</span>
              <span class="absolute right-1.5 -translate-y-1/2" :style="{ top: `${chart.baseline * 100}%` }">0</span>
              <span v-if="showBottomTick" class="absolute right-1.5 -translate-y-1/2" style="top: 100%">{{ fmt(chart.minValue) }}</span>
            </div>

            <!-- `pan-y`: el dedo que se arrastra en horizontal recorre las
                 jornadas; el vertical sigue desplazando el cajón. -->
            <div
              ref="plotRef"
              class="relative flex-1 h-36 touch-pan-y"
              @pointerleave="onPlotPointerLeave"
              @pointermove="onPlotPointerMove"
              @pointerup="onPlotPointerEnd"
              @pointercancel="onPlotPointerEnd"
            >
              <!-- Rejilla: filos sólidos, un paso sobre la superficie -->
              <div class="absolute inset-x-0 top-0 border-t border-gray-100 dark:border-gray-800" aria-hidden="true" />
              <div
                class="absolute inset-x-0 border-t border-gray-200 dark:border-gray-700"
                :style="{ top: `${chart.baseline * 100}%` }"
                aria-hidden="true"
              />
              <div
                v-if="chart.minValue < 0"
                class="absolute inset-x-0 bottom-0 border-t border-gray-100 dark:border-gray-800"
                aria-hidden="true"
              />

              <!-- Promedio: la única raya discontinua, porque es una referencia -->
              <div
                v-if="chart.average !== null"
                class="absolute inset-x-0 border-t border-dashed border-gray-400/80 dark:border-gray-500/80 pointer-events-none z-10"
                :style="{ top: `${chart.average * 100}%` }"
                aria-hidden="true"
              >
                <span class="absolute right-0 -top-3.5 px-1 rounded text-[10px] leading-3 font-semibold text-gray-500 dark:text-gray-400 bg-white/85 dark:bg-gray-900/85 tabular-nums">
                  {{ t("fantasy.playerSeason.averageShort", { value: fmt(summary?.average_points ?? 0) }) }}
                </span>
              </div>

              <div class="absolute inset-0 flex">
                <button
                  v-for="bar in chart.bars"
                  :key="bar.index"
                  type="button"
                  class="relative flex-1 h-full min-w-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/60 rounded-md"
                  :aria-label="barAria(rounds[bar.index])"
                  :aria-pressed="selectedIndex === bar.index"
                  @pointerenter="onBarPointerEnter($event, bar.index)"
                  @focus="hoverIndex = bar.index"
                  @blur="hoverIndex = null"
                  @click="selectRound(bar.index)"
                >
                  <!-- Jugó: barra con el extremo de datos redondeado -->
                  <span
                    v-if="bar.points !== null"
                    class="absolute left-1/2 -translate-x-1/2 w-[62%] max-w-[18px] transition-opacity duration-150"
                    :class="[
                      barColorClass(bar.index, bar.points),
                      bar.points < 0 ? 'rounded-b-[4px]' : 'rounded-t-[4px]',
                      activeIndex !== null && activeIndex !== bar.index ? 'opacity-35' : 'opacity-100',
                    ]"
                    :style="{
                      top: `${bar.top * 100}%`,
                      height: `max(2px, ${(bar.bottom - bar.top) * 100}%)`,
                    }"
                  />
                  <!-- No jugó: un punto en el cero. Sin cerrar: un aro. -->
                  <span
                    v-else
                    class="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full"
                    :class="[
                      bar.status === 'pending'
                        ? 'border border-gray-400 dark:border-gray-500 bg-white dark:bg-gray-900'
                        : 'bg-gray-300 dark:bg-gray-600',
                      activeIndex !== null && activeIndex !== bar.index ? 'opacity-40' : 'opacity-100',
                    ]"
                    :style="{ top: `${chart.baseline * 100}%` }"
                  />
                  <!-- La mejor jornada lleva su cifra: la única etiqueta directa -->
                  <span
                    v-if="bar.index === chart.bestIndex"
                    class="absolute left-1/2 -translate-x-1/2 -translate-y-full pb-0.5 text-[10px] leading-none font-bold text-amber-600 dark:text-amber-400 tabular-nums whitespace-nowrap"
                    :style="{ top: `${bar.top * 100}%` }"
                    aria-hidden="true"
                  >
                    {{ fmt(bar.points ?? 0) }}
                  </span>
                </button>
              </div>
            </div>
          </div>

          <!-- Eje X: número de jornada -->
          <div class="flex pl-8 mt-1.5" aria-hidden="true">
            <span
              v-for="bar in chart.bars"
              :key="bar.index"
              class="flex-1 min-w-0 text-center text-[10px] leading-none tabular-nums"
              :class="activeIndex === bar.index
                ? 'font-bold text-gray-900 dark:text-white'
                : 'text-gray-400 dark:text-gray-500'"
            >
              {{ denseAxis && bar.index % 2 === 1 && activeIndex !== bar.index ? "" : axisLabel(rounds[bar.index]) }}
            </span>
          </div>

          <!-- Leyenda de los huecos y de la raya: la forma también dice qué es -->
          <div class="flex flex-wrap items-center gap-x-3 gap-y-1 mt-3 text-2xs text-gray-400 dark:text-gray-500">
            <span class="inline-flex items-center gap-1.5">
              <span class="w-3 border-t border-dashed border-gray-400 dark:border-gray-500" aria-hidden="true" />
              {{ t("fantasy.playerSeason.legendAverage") }}
            </span>
            <span v-if="hasAbsent" class="inline-flex items-center gap-1.5">
              <span class="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600" aria-hidden="true" />
              {{ t("fantasy.playerSeason.legendAbsent") }}
            </span>
            <span v-if="hasPending" class="inline-flex items-center gap-1.5">
              <span class="w-1.5 h-1.5 rounded-full border border-gray-400 dark:border-gray-500" aria-hidden="true" />
              {{ t("fantasy.playerSeason.legendPending") }}
            </span>
          </div>
        </section>

        <!-- ── De dónde salen sus puntos ── -->
        <section
          v-if="gained.length || lost.length || unattributed"
          class="rounded-2xl border border-gray-100 dark:border-gray-700/60 overflow-hidden"
        >
          <h3 class="px-4 pt-3 pb-2 text-footnote font-semibold text-gray-900 dark:text-white">
            {{ t("fantasy.playerSeason.statsTitle") }}
          </h3>

          <template v-for="group in [
            { key: 'gained', label: t('fantasy.playerSeason.statsGained'), items: gained, total: gainedTotal },
            { key: 'lost', label: t('fantasy.playerSeason.statsLost'), items: lost, total: lostTotal },
          ]" :key="group.key">
            <div v-if="group.items.length">
              <div class="flex items-center justify-between px-4 pt-2 pb-1 text-2xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
                <span>{{ group.label }}</span>
                <span class="tabular-nums" :class="pointsClass(group.total)">{{ signed(group.total) }}</span>
              </div>
              <ul class="divide-y divide-gray-50 dark:divide-gray-700/40">
                <li v-for="(stat, s) in group.items" :key="stat.type?.uuid ?? `${group.key}-${s}`" class="px-4 py-2.5">
                  <div class="flex items-center justify-between gap-3">
                    <p class="text-footnote text-gray-700 dark:text-gray-300 truncate">{{ stat.type?.name }}</p>
                    <div class="flex items-center gap-2 shrink-0">
                      <!-- La ecuación: cada punto se remonta a una estadística -->
                      <span class="text-2xs tabular-nums text-gray-400 dark:text-gray-500">{{ equation(stat) }}</span>
                      <span class="min-w-[3rem] text-right text-footnote font-bold tabular-nums" :class="pointsClass(stat.points)">
                        {{ signed(stat.points) }}
                      </span>
                    </div>
                  </div>
                  <div class="flex items-center gap-2 mt-1.5">
                    <div class="flex-1 h-1 rounded-full bg-gray-100 dark:bg-gray-700/60 overflow-hidden" aria-hidden="true">
                      <div
                        class="h-full rounded-full"
                        :class="stat.points < 0 ? 'bg-rose-400 dark:bg-rose-500' : 'bg-emerald-400 dark:bg-emerald-500'"
                        :style="{ width: shareWidth(stat.points) }"
                      />
                    </div>
                    <span class="text-2xs text-gray-400 dark:text-gray-500 tabular-nums shrink-0">
                      {{ t("fantasy.playerSeason.statFixtures", { count: stat.fixtures }, stat.fixtures) }}
                    </span>
                  </div>
                </li>
              </ul>
            </div>
          </template>

          <!-- Lo que ninguna estadística explica, dicho en vez de callado -->
          <div v-if="unattributed" class="px-4 py-2.5 border-t border-gray-100 dark:border-gray-700/60">
            <div class="flex items-center justify-between gap-3">
              <p class="text-footnote text-gray-700 dark:text-gray-300">{{ t("fantasy.playerSeason.statsUnattributed") }}</p>
              <span class="min-w-[3rem] text-right text-footnote font-bold tabular-nums" :class="pointsClass(unattributed)">
                {{ signed(unattributed) }}
              </span>
            </div>
            <p class="text-2xs text-gray-400 dark:text-gray-500 mt-0.5">{{ t("fantasy.playerSeason.statsUnattributedHint") }}</p>
          </div>
        </section>

        <!-- ── Jornada a jornada: la tabla de la gráfica ── -->
        <section class="rounded-2xl border border-gray-100 dark:border-gray-700/60 overflow-hidden">
          <h3 class="px-4 pt-3 pb-2 text-footnote font-semibold text-gray-900 dark:text-white">
            {{ t("fantasy.playerSeason.logTitle") }}
          </h3>
          <ul class="divide-y divide-gray-100 dark:divide-gray-700/60">
            <li v-for="{ round, index } in logEntries" :key="round.round?.uuid ?? `loose-${index}`">
              <button
                type="button"
                class="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors disabled:cursor-default"
                :class="[
                  activeIndex === index ? 'bg-amber-50/60 dark:bg-amber-900/10' : '',
                  round.status === 'played' ? 'active:bg-gray-50 dark:active:bg-gray-800/60' : '',
                ]"
                :disabled="round.status !== 'played'"
                :aria-expanded="round.status === 'played' ? expanded.has(index) : undefined"
                @click="toggleRound(index)"
              >
                <span
                  class="w-10 shrink-0 text-center py-1 rounded-lg text-2xs font-bold tabular-nums"
                  :class="round.status === 'played'
                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200'
                    : 'bg-gray-50 dark:bg-gray-800/50 text-gray-400 dark:text-gray-500'"
                >
                  {{ roundShort(round) }}
                </span>

                <div class="flex-1 min-w-0">
                  <template v-if="round.status === 'played'">
                    <div v-for="(fx, f) in round.fixtures" :key="fx.fixture?.uuid ?? f" class="flex items-center gap-1.5 min-w-0">
                      <img
                        v-if="fx.opponent?.image_path"
                        :src="fx.opponent.image_path"
                        alt=""
                        class="w-4 h-4 object-contain shrink-0"
                      />
                      <span class="text-footnote font-semibold text-gray-900 dark:text-white truncate">
                        {{ t("fantasy.playerSeason.versus", { team: opponentName(fx) }) }}
                      </span>
                      <span v-if="locationLabel(fx)" class="text-2xs text-gray-400 dark:text-gray-500 shrink-0">
                        {{ locationLabel(fx) }}
                      </span>
                      <span
                        v-if="fx.result"
                        class="shrink-0 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-2xs font-bold tabular-nums"
                        :class="outcomeClass(fx)"
                        :aria-label="`${outcomeLabel(fx)} ${fx.result.goals_for}–${fx.result.goals_against}`"
                      >
                        {{ fx.result.goals_for }}–{{ fx.result.goals_against }} {{ outcomeLetter(fx) }}
                      </span>
                    </div>
                  </template>
                  <p v-else class="text-footnote text-gray-400 dark:text-gray-500">
                    {{ round.status === "absent" ? t("fantasy.playerSeason.absent") : t("fantasy.playerSeason.pending") }}
                  </p>
                </div>

                <span
                  v-if="round.status === 'played'"
                  class="shrink-0 text-footnote font-extrabold tabular-nums"
                  :class="pointsClass(round.total_points)"
                >
                  {{ signed(round.total_points) }}
                </span>
                <v-icon
                  v-if="round.status === 'played'"
                  name="hi-solid-chevron-down"
                  class="w-4 h-4 shrink-0 text-gray-300 dark:text-gray-600 transition-transform duration-200"
                  :class="expanded.has(index) ? 'rotate-180' : ''"
                  aria-hidden="true"
                />
              </button>

              <!-- El detalle del partido: el mismo libro de cuentas que el de la jornada -->
              <div v-if="expanded.has(index)" class="pb-2 bg-gray-50/60 dark:bg-gray-800/40">
                <div v-for="(fx, f) in round.fixtures" :key="fx.fixture?.uuid ?? f">
                  <p v-if="fx.fixture" class="px-4 pt-2 text-2xs text-gray-400 dark:text-gray-500 truncate">
                    {{ fx.fixture.name }}<template v-if="fx.fixture.starting_at"> · {{ fx.fixture.starting_at }}</template>
                  </p>
                  <div
                    v-for="(stat, s) in fx.stats"
                    :key="stat.type?.uuid ?? s"
                    class="flex items-center justify-between gap-3 pl-[4.25rem] pr-4 py-1.5"
                  >
                    <p class="text-xs text-gray-600 dark:text-gray-300 truncate">{{ stat.type?.name }}</p>
                    <div class="flex items-center gap-2 shrink-0">
                      <span class="text-2xs tabular-nums text-gray-400 dark:text-gray-500">
                        {{ fmt(stat.value) }} <span class="text-gray-300 dark:text-gray-600">×</span> {{ fmt(stat.points_per_unit) }}
                      </span>
                      <span class="min-w-[2.75rem] text-right text-xs font-bold tabular-nums" :class="pointsClass(stat.points)">
                        {{ signed(stat.points) }}
                      </span>
                    </div>
                  </div>
                  <p v-if="!fx.stats.length" class="pl-[4.25rem] pr-4 py-1.5 text-2xs text-gray-400 dark:text-gray-500">
                    {{ t("fantasy.playerSeason.statsUnattributedHint") }}
                  </p>
                </div>
              </div>
            </li>
          </ul>
        </section>
      </div>
    </template>
  </BottomSheet>
</template>
