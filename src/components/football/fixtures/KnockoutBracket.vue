<script setup lang="ts">
import { computed, ref, watch, onMounted, onBeforeUnmount } from "vue";
import { useI18n } from "vue-i18n";
import { catalogService } from "@/services/catalog/CatalogService";
import { footballFixtureService } from "@/services/football/fixture/FootballFixtureService";
import type { FootballStageResponse } from "@/interfaces/football/stage/FootballStageResponse";
import type { FootballFixtureResponse } from "@/interfaces/football/fixture/FootballFixtureResponse";
import type { FootballTeamResponse } from "@/interfaces/football/team/FootballTeamResponse";
import TeamLogo from "@/components/football/ui/TeamLogo.vue";
import FixtureMatchCenter from "./FixtureMatchCenter.vue";

interface Props {
  isOpen: boolean;
  /** Parent stage whose knockout sub-stages form the bracket. */
  stageUuid: string;
}

const props = defineProps<Props>();
const emit = defineEmits<{ close: [] }>();

const { t } = useI18n();

// ── Data ──
/** A knockout tie: a single match, or the two legs of a home-and-away round. */
interface BracketTie {
  key: string;
  legs: FootballFixtureResponse[]; // ordered by leg (1 → 2)
  twoLegged: boolean;
  teamA?: FootballTeamResponse; // orientation fixed to the first leg's home team
  teamB?: FootballTeamResponse; // …and its away team
  aggA: number | null; // aggregate goals for teamA across played legs
  aggB: number | null;
  winnerSmId: number | null; // team that advanced (null while undecided)
  primary: FootballFixtureResponse; // leg opened when the card is tapped
}

interface BracketColumn {
  stage: FootballStageResponse;
  fixtures: FootballFixtureResponse[];
  ties: BracketTie[];
}

const columns = ref<BracketColumn[]>([]);
const isLoading = ref(false);
const loadError = ref<string | null>(null);
let loadedStageUuid: string | null = null;

// Height of the tallest round drives the shared column height so pairs align.
// Ties (not raw fixtures) are the rows, so two-legged matches collapse to one.
const maxRows = computed(() =>
  columns.value.reduce((max, c) => Math.max(max, c.ties.length), 1),
);

// Index of the final round → its winner gets the champion (gold) treatment.
const lastColIndex = computed(() => columns.value.length - 1);

const loadBracket = async (parentStageUuid: string) => {
  if (!parentStageUuid) return;
  isLoading.value = true;
  loadError.value = null;
  columns.value = [];
  try {
    const stages = await catalogService.getKnockoutStageByStage(parentStageUuid);
    // Bracket flows left → right in play order (sort_order ascending).
    const ordered = [...stages].sort((a, b) => a.sort_order - b.sort_order);

    const fixturesPerStage = await Promise.all(
      ordered.map((s) => footballFixtureService.getAllFixturesByStage(s.uuid)),
    );

    columns.value = ordered
      .map((stage, i) => {
        const fixtures = fixturesPerStage[i] ?? [];
        return { stage, fixtures, ties: buildTies(fixtures) };
      })
      // Drop rounds that have no fixtures so the tree stays tight.
      .filter((c) => c.ties.length > 0);

    loadedStageUuid = parentStageUuid;
  } catch (err) {
    console.error("Error loading knockout bracket:", err);
    loadError.value = t("football.fixtures.errors.stageFixturesLoad");
  } finally {
    isLoading.value = false;
  }
};

const retry = () => loadBracket(props.stageUuid);

// Load on open (and when the parent stage changes while already open).
watch(
  () => [props.isOpen, props.stageUuid] as const,
  ([open, stageUuid]) => {
    if (open && stageUuid && stageUuid !== loadedStageUuid) {
      loadBracket(stageUuid);
    }
  },
  { immediate: true },
);

// ── Fixture helpers (mirror FixturesList) ──
const homeTeam = (fx: FootballFixtureResponse): FootballTeamResponse | undefined =>
  fx.participants?.find((p) => p.meta?.location === "home");
const awayTeam = (fx: FootballFixtureResponse): FootballTeamResponse | undefined =>
  fx.participants?.find((p) => p.meta?.location === "away");

const teamName = (team: FootballTeamResponse | undefined): string => team?.name || "TBD";

const hasScores = (fx: FootballFixtureResponse): boolean => {
  const h = homeTeam(fx);
  const a = awayTeam(fx);
  return (
    h?.current_score !== undefined &&
    h?.current_score !== null &&
    a?.current_score !== undefined &&
    a?.current_score !== null
  );
};

const scoreOf = (team: FootballTeamResponse | undefined): number => team?.current_score?.score ?? 0;

const isLive = (fx: FootballFixtureResponse): boolean => {
  if (fx.state) {
    const s = fx.state.name.toLowerCase();
    return s.includes("live") || s.includes("in play") || s.includes("ht") || s.includes("half time");
  }
  return false;
};

const isFinished = (fx: FootballFixtureResponse): boolean => {
  if (fx.state) return fx.state.state.includes("FT");
  const h = homeTeam(fx);
  return h?.meta?.winner !== null && h?.meta?.winner !== undefined;
};

// Winner of a single match by score (null while drawn / unfinished).
const matchWinnerSmId = (fx: FootballFixtureResponse): number | null => {
  if (!hasScores(fx) || !isFinished(fx)) return null;
  const hs = scoreOf(homeTeam(fx));
  const as = scoreOf(awayTeam(fx));
  if (hs === as) return null;
  return hs > as ? homeTeam(fx)?.sm_id ?? null : awayTeam(fx)?.sm_id ?? null;
};

// ── Two-legged tie grouping ──
// A knockout round is either a single match (leg "1/1") or home-and-away (legs
// "1/2" + "2/2"). We fold the two legs into one tie so the bracket shows a
// single card with the aggregate result and the tree geometry stays correct.
const isSingleLeg = (fx: FootballFixtureResponse): boolean => !fx.leg || fx.leg === "1/1";

const legNumber = (fx: FootballFixtureResponse): number => {
  const n = parseInt((fx.leg ?? "1/1").split("/")[0], 10);
  return Number.isFinite(n) ? n : 1;
};

// Order-independent key from the two participants, used to pair legs when the
// API doesn't send the `aggregate` include.
const teamKey = (fx: FootballFixtureResponse): string =>
  (fx.participants ?? [])
    .map((p) => p.sm_id)
    .filter((id): id is number => id != null)
    .sort((a, b) => a - b)
    .join("-");

// Goals a specific team scored in a leg, matched by team identity (sm_id) so
// the home/away swap between legs doesn't matter.
const goalsForTeam = (
  fx: FootballFixtureResponse,
  team: FootballTeamResponse | undefined,
): number | null => {
  if (!team) return null;
  const p = fx.participants?.find((pp) => pp.sm_id === team.sm_id);
  return p?.current_score?.score ?? null;
};

// Team that advanced: provider aggregate first, then result_info (which names
// the winning team), then a plain aggregate-goals fallback.
const tieWinnerSmId = (
  legs: FootballFixtureResponse[],
  teamA: FootballTeamResponse | undefined,
  teamB: FootballTeamResponse | undefined,
  aggA: number | null,
  aggB: number | null,
): number | null => {
  const withWinner = legs.map((l) => l.aggregate).find((a) => a?.winner_participant_sm_id);
  if (withWinner?.winner_participant_sm_id) return withWinner.winner_participant_sm_id;

  const info = legs.map((l) => l.result_info).find((s) => !!s)?.toLowerCase();
  if (info) {
    for (const team of [teamA, teamB]) {
      if (!team) continue;
      const name = team.name?.toLowerCase();
      const code = team.short_code?.toLowerCase();
      if ((name && info.includes(name)) || (code && code.length > 1 && info.includes(code))) {
        return team.sm_id;
      }
    }
  }

  // Last resort — ignores away-goals / penalties, so only used when nothing
  // above resolved the tie.
  if (aggA !== null && aggB !== null && aggA !== aggB) {
    return aggA > aggB ? teamA?.sm_id ?? null : teamB?.sm_id ?? null;
  }
  return null;
};

// Fixture opened when a two-legged card is tapped: the live leg, else the most
// recently played, else the last leg.
const primaryLeg = (legs: FootballFixtureResponse[]): FootballFixtureResponse => {
  const live = legs.find((l) => isLive(l));
  if (live) return live;
  for (let i = legs.length - 1; i >= 0; i--) {
    if (hasScores(legs[i])) return legs[i];
  }
  return legs[legs.length - 1];
};

const makeTie = (legs: FootballFixtureResponse[]): BracketTie => {
  const ordered = [...legs].sort(
    (a, b) => legNumber(a) - legNumber(b) || a.starting_at_timestamp - b.starting_at_timestamp,
  );
  const first = ordered[0];
  const twoLegged = !(ordered.length === 1 && isSingleLeg(first));

  // Orientation is fixed to the first leg so home/away swaps don't flip rows.
  const teamA = homeTeam(first);
  const teamB = awayTeam(first);

  let aggA: number | null = null;
  let aggB: number | null = null;
  for (const leg of ordered) {
    const a = goalsForTeam(leg, teamA);
    const b = goalsForTeam(leg, teamB);
    if (a !== null && b !== null) {
      aggA = (aggA ?? 0) + a;
      aggB = (aggB ?? 0) + b;
    }
  }

  return {
    key: ordered.map((l) => l.uuid).join("+"),
    legs: ordered,
    twoLegged,
    teamA,
    teamB,
    aggA,
    aggB,
    winnerSmId: twoLegged ? tieWinnerSmId(ordered, teamA, teamB, aggA, aggB) : null,
    primary: primaryLeg(ordered),
  };
};

// Fold a round's fixtures into ties. Single matches pass through 1:1; two-legged
// matches group by the `aggregate` include, or pair by teams when it's null.
const buildTies = (fixtures: FootballFixtureResponse[]): BracketTie[] => {
  const ties: BracketTie[] = [];
  const used = new Set<string>();

  for (const fx of fixtures) {
    if (used.has(fx.uuid)) continue;

    if (isSingleLeg(fx)) {
      used.add(fx.uuid);
      ties.push(makeTie([fx]));
      continue;
    }

    let group: FootballFixtureResponse[];
    const uuids = fx.aggregate?.fixtures_uuids;
    if (uuids && uuids.length) {
      // Provider grouped the legs for us (fx is always kept in its own tie).
      group = fixtures.filter(
        (f) => (f.uuid === fx.uuid || uuids.includes(f.uuid)) && !used.has(f.uuid),
      );
    } else {
      // aggregate is null → pair the fixtures that share the same two teams.
      const key = teamKey(fx);
      group = fixtures.filter(
        (f) => !isSingleLeg(f) && !used.has(f.uuid) && teamKey(f) === key,
      );
    }
    if (group.length === 0) group = [fx];

    group.forEach((f) => used.add(f.uuid));
    ties.push(makeTie(group));
  }

  return ties;
};

// ── Tie display helpers ──
const tieIsLive = (tie: BracketTie): boolean => tie.legs.some((l) => isLive(l));

// Advancement encoding shared by the template. A row is either the team that
// advanced ("adv"), the one eliminated ("out"), the champion at the final round
// ("champ"), or undecided ("neutral"). Color carries this — emerald = advanced,
// gold = champion — so the winning path reads at a glance.
type RowState = "adv" | "out" | "champ" | "neutral";

const rowStateTie = (tie: BracketTie, side: "a" | "b", isFinal: boolean): RowState => {
  if (tie.winnerSmId == null) return "neutral";
  const team = side === "a" ? tie.teamA : tie.teamB;
  if (team?.sm_id === tie.winnerSmId) return isFinal ? "champ" : "adv";
  return "out";
};

const rowStateMatch = (
  fx: FootballFixtureResponse,
  location: "home" | "away",
  isFinal: boolean,
): RowState => {
  const winner = matchWinnerSmId(fx);
  if (winner == null) return "neutral";
  const team = location === "home" ? homeTeam(fx) : awayTeam(fx);
  if (team?.sm_id === winner) return isFinal ? "champ" : "adv";
  return "out";
};

// A decided tie in the final column paints its winner as champion (gold).
const tieHasWinner = (tie: BracketTie): boolean =>
  tie.twoLegged ? tie.winnerSmId != null : matchWinnerSmId(tie.legs[0]) != null;

const rowClass = (state: RowState): string =>
  state === "neutral" ? "" : `kb-row--${state}`;

// Per-leg mini score from team A's orientation, e.g. "2-1"; "–" when unplayed.
const legScore = (tie: BracketTie, leg: FootballFixtureResponse): string => {
  const a = goalsForTeam(leg, tie.teamA);
  const b = goalsForTeam(leg, tie.teamB);
  if (a === null || b === null) return "–";
  return `${a}-${b}`;
};

// Tooltip: the provider's aggregate detail/result, else the raw result_info.
const tieTitle = (tie: BracketTie): string => {
  const agg = tie.legs.map((l) => l.aggregate).find((a) => !!a?.detail || !!a?.result);
  if (agg) return agg.detail || agg.result || "";
  return tie.legs.map((l) => l.result_info).find((s) => !!s) ?? "";
};

// ── Match center (nested) ──
const matchCenterOpen = ref(false);
const selectedFixtureUuid = ref<string | null>(null);

const openMatch = (fx: FootballFixtureResponse) => {
  selectedFixtureUuid.value = fx.uuid;
  matchCenterOpen.value = true;
};

// ── Drag-to-pan (mouse only; touch keeps native momentum scroll) ──
const scrollRef = ref<HTMLElement | null>(null);
const isDragging = ref(false);
let startX = 0;
let startY = 0;
let startScrollLeft = 0;
let startScrollTop = 0;
let activePointer: number | null = null;

const onPointerDown = (e: PointerEvent) => {
  if (e.pointerType !== "mouse") return;
  const el = scrollRef.value;
  if (!el) return;
  isDragging.value = true;
  startX = e.clientX;
  startY = e.clientY;
  startScrollLeft = el.scrollLeft;
  startScrollTop = el.scrollTop;
  activePointer = e.pointerId;
  el.setPointerCapture(e.pointerId);
};

const onPointerMove = (e: PointerEvent) => {
  if (!isDragging.value) return;
  const el = scrollRef.value;
  if (!el) return;
  el.scrollLeft = startScrollLeft - (e.clientX - startX);
  el.scrollTop = startScrollTop - (e.clientY - startY);
};

const onPointerUp = () => {
  if (!isDragging.value) return;
  isDragging.value = false;
  const el = scrollRef.value;
  if (el && activePointer !== null) {
    try {
      el.releasePointerCapture(activePointer);
    } catch {
      /* already released */
    }
  }
  activePointer = null;
};

// ── Overlay behavior: body scroll lock + Escape to close ──
const lockBody = (lock: boolean) => {
  if (typeof document !== "undefined") {
    document.body.style.overflow = lock ? "hidden" : "";
  }
};

watch(
  () => props.isOpen,
  (open) => {
    lockBody(open);
    if (open) {
      // Reset the pan position when (re)opening.
      requestAnimationFrame(() => {
        if (scrollRef.value) {
          scrollRef.value.scrollLeft = 0;
          scrollRef.value.scrollTop = 0;
        }
      });
    }
  },
);

// The nested match center clears the body lock on close — re-assert it so the
// page behind the bracket stays locked while the bracket is still open.
watch(matchCenterOpen, (mcOpen) => {
  if (!mcOpen && props.isOpen) lockBody(true);
});

const onKeydown = (e: KeyboardEvent) => {
  if (e.key === "Escape" && props.isOpen && !matchCenterOpen.value) emit("close");
};

onMounted(() => window.addEventListener("keydown", onKeydown));
onBeforeUnmount(() => {
  window.removeEventListener("keydown", onKeydown);
  lockBody(false);
});
</script>

<template>
  <Teleport to="body">
    <!-- Backdrop -->
    <Transition name="kb-fade">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-[115] bg-black/60 backdrop-blur-sm"
        @click="emit('close')"
      />
    </Transition>

    <!-- Sheet -->
    <Transition name="kb-slide">
      <div
        v-if="isOpen"
        class="fixed inset-x-0 bottom-0 z-[120] flex justify-center pointer-events-none"
      >
        <div
          class="flex flex-col w-full bg-white dark:bg-gray-900 shadow-2xl rounded-t-3xl md:rounded-3xl h-[92dvh] md:h-[88dvh] md:max-w-5xl overflow-hidden pointer-events-auto"
          role="dialog"
          :aria-label="$t('football.fixtures.bracketAria')"
        >
          <!-- Header -->
          <div class="flex items-center gap-3 px-4 py-3 border-b border-gray-100 dark:border-gray-800 shrink-0">
            <span class="grid place-items-center w-8 h-8 rounded-[10px] bg-amber-50 dark:bg-amber-400/10 text-amber-500 dark:text-amber-400 shrink-0">
              <v-icon name="bi-trophy-fill" class="w-[17px] h-[17px]" />
            </span>
            <h2 class="text-callout font-semibold text-gray-900 dark:text-white flex-1 truncate">
              {{ $t('football.fixtures.bracketTitle') }}
            </h2>
            <button
              type="button"
              @click="emit('close')"
              :aria-label="$t('football.fixtures.bracketClose')"
              class="shrink-0 p-1.5 rounded-full text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <v-icon name="hi-solid-x" class="w-5 h-5" />
            </button>
          </div>

          <!-- Body -->
          <div class="flex-1 min-h-0 relative">
            <!-- Loading skeleton -->
            <div v-if="isLoading" class="h-full overflow-hidden p-4">
              <div class="flex gap-9">
                <div v-for="col in 4" :key="col" class="w-[200px] shrink-0 space-y-3">
                  <div class="h-4 w-24 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
                  <div
                    v-for="row in Math.max(1, Math.round(8 / col))"
                    :key="row"
                    class="h-[64px] rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse"
                  />
                </div>
              </div>
            </div>

            <!-- Error -->
            <div v-else-if="loadError" class="h-full flex flex-col items-center justify-center text-center px-6">
              <v-icon name="hi-solid-exclamation-circle" class="w-9 h-9 text-red-400 dark:text-red-500 mb-3" />
              <p class="text-footnote text-red-500 dark:text-red-400 mb-3">{{ loadError }}</p>
              <button
                @click="retry"
                class="px-4 py-2 text-xs font-semibold rounded-full bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"
              >
                {{ $t('common.actions.retry') }}
              </button>
            </div>

            <!-- Empty -->
            <div
              v-else-if="columns.length === 0"
              class="h-full flex flex-col items-center justify-center text-center px-6 text-gray-400 dark:text-gray-500"
            >
              <v-icon name="bi-trophy" class="w-8 h-8 mb-2 text-gray-200 dark:text-gray-700" />
              <p class="text-footnote">{{ $t('football.fixtures.bracketEmpty') }}</p>
            </div>

            <!-- Bracket (pan in both axes) -->
            <div
              v-else
              ref="scrollRef"
              class="kb-scroll h-full select-none"
              :class="{ 'cursor-grabbing': isDragging, 'cursor-grab': !isDragging }"
              @pointerdown="onPointerDown"
              @pointermove="onPointerMove"
              @pointerup="onPointerUp"
              @pointercancel="onPointerUp"
              @pointerleave="onPointerUp"
            >
              <div class="kb-bracket" :style="{ '--kb-rows': maxRows }">
                <div
                  v-for="(col, i) in columns"
                  :key="col.stage.uuid"
                  class="kb-round"
                  :class="{ 'kb-round--first': i === 0, 'kb-round--last': i === columns.length - 1 }"
                >
                  <div class="kb-round__title">
                    <span class="truncate">{{ col.stage.name }}</span>
                    <span
                      v-if="col.stage.is_current"
                      class="ml-1.5 relative inline-flex w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 shrink-0"
                    >
                      <span class="absolute inset-0 rounded-full bg-emerald-500/60 dark:bg-emerald-400/60 animate-ping" />
                    </span>
                  </div>

                  <div class="kb-round__body">
                    <div v-for="tie in col.ties" :key="tie.key" class="kb-match">
                      <!-- Two-legged tie: aggregate score + per-leg breakdown -->
                      <button
                        v-if="tie.twoLegged"
                        type="button"
                        @click="openMatch(tie.primary)"
                        class="kb-card"
                        :class="[
                          tieIsLive(tie) ? 'kb-card--live' : '',
                          i === lastColIndex && tieHasWinner(tie) ? 'kb-card--champ' : '',
                        ]"
                        :title="tieTitle(tie)"
                      >
                        <!-- Meta -->
                        <div class="kb-card__meta">
                          <template v-if="tieIsLive(tie)">
                            <span class="kb-live-dot" />
                            <span class="text-red-600 dark:text-red-400 font-bold">{{ $t('football.common.live') }}</span>
                          </template>
                          <template v-else>
                            <v-icon name="hi-solid-switch-horizontal" class="w-3 h-3 shrink-0" />
                            <span class="truncate">{{ $t('football.fixtures.twoLegged') }}</span>
                          </template>
                          <span class="kb-legs ml-auto">
                            <template v-for="(leg, li) in tie.legs" :key="leg.uuid">
                              <span :class="isLive(leg) ? 'text-red-600 dark:text-red-400 font-bold' : ''">{{ legScore(tie, leg) }}</span>
                              <span v-if="li < tie.legs.length - 1" class="mx-1 text-gray-300 dark:text-gray-600">·</span>
                            </template>
                          </span>
                        </div>

                        <!-- Team A (first-leg home) — aggregate -->
                        <div class="kb-row" :class="rowClass(rowStateTie(tie, 'a', i === lastColIndex))">
                          <TeamLogo :team="tie.teamA" size="sm" />
                          <span class="kb-name" :title="teamName(tie.teamA)">{{ teamName(tie.teamA) }}</span>
                          <v-icon v-if="rowStateTie(tie, 'a', i === lastColIndex) === 'adv'" name="hi-solid-check" class="kb-mark kb-mark--adv" />
                          <v-icon v-else-if="rowStateTie(tie, 'a', i === lastColIndex) === 'champ'" name="bi-trophy-fill" class="kb-mark kb-mark--champ" />
                          <span v-if="tie.aggA !== null" class="kb-score">{{ tie.aggA }}</span>
                        </div>

                        <!-- Team B (first-leg away) — aggregate -->
                        <div class="kb-row" :class="rowClass(rowStateTie(tie, 'b', i === lastColIndex))">
                          <TeamLogo :team="tie.teamB" size="sm" />
                          <span class="kb-name" :title="teamName(tie.teamB)">{{ teamName(tie.teamB) }}</span>
                          <v-icon v-if="rowStateTie(tie, 'b', i === lastColIndex) === 'adv'" name="hi-solid-check" class="kb-mark kb-mark--adv" />
                          <v-icon v-else-if="rowStateTie(tie, 'b', i === lastColIndex) === 'champ'" name="bi-trophy-fill" class="kb-mark kb-mark--champ" />
                          <span v-if="tie.aggB !== null" class="kb-score">{{ tie.aggB }}</span>
                        </div>
                      </button>

                      <!-- Single match -->
                      <button
                        v-else
                        type="button"
                        @click="openMatch(tie.legs[0])"
                        class="kb-card"
                        :class="[
                          isLive(tie.legs[0]) ? 'kb-card--live' : '',
                          i === lastColIndex && tieHasWinner(tie) ? 'kb-card--champ' : '',
                        ]"
                      >
                        <!-- Meta -->
                        <div class="kb-card__meta">
                          <template v-if="isLive(tie.legs[0])">
                            <span class="kb-live-dot" />
                            <span class="text-red-600 dark:text-red-400 font-bold">{{ $t('football.common.live') }}</span>
                          </template>
                          <template v-else-if="isFinished(tie.legs[0])">
                            <span>FT</span>
                          </template>
                          <template v-else>
                            <span class="truncate">{{ tie.legs[0].starting_date }} · {{ tie.legs[0].hour }}</span>
                          </template>
                        </div>

                        <!-- Home -->
                        <div class="kb-row" :class="rowClass(rowStateMatch(tie.legs[0], 'home', i === lastColIndex))">
                          <TeamLogo :team="homeTeam(tie.legs[0])" size="sm" />
                          <span class="kb-name" :title="teamName(homeTeam(tie.legs[0]))">{{ teamName(homeTeam(tie.legs[0])) }}</span>
                          <v-icon v-if="rowStateMatch(tie.legs[0], 'home', i === lastColIndex) === 'adv'" name="hi-solid-check" class="kb-mark kb-mark--adv" />
                          <v-icon v-else-if="rowStateMatch(tie.legs[0], 'home', i === lastColIndex) === 'champ'" name="bi-trophy-fill" class="kb-mark kb-mark--champ" />
                          <span v-if="hasScores(tie.legs[0])" class="kb-score">{{ scoreOf(homeTeam(tie.legs[0])) }}</span>
                        </div>

                        <!-- Away -->
                        <div class="kb-row" :class="rowClass(rowStateMatch(tie.legs[0], 'away', i === lastColIndex))">
                          <TeamLogo :team="awayTeam(tie.legs[0])" size="sm" />
                          <span class="kb-name" :title="teamName(awayTeam(tie.legs[0]))">{{ teamName(awayTeam(tie.legs[0])) }}</span>
                          <v-icon v-if="rowStateMatch(tie.legs[0], 'away', i === lastColIndex) === 'adv'" name="hi-solid-check" class="kb-mark kb-mark--adv" />
                          <v-icon v-else-if="rowStateMatch(tie.legs[0], 'away', i === lastColIndex) === 'champ'" name="bi-trophy-fill" class="kb-mark kb-mark--champ" />
                          <span v-if="hasScores(tie.legs[0])" class="kb-score">{{ scoreOf(awayTeam(tie.legs[0])) }}</span>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Nested match center (opens on card tap) -->
    <FixtureMatchCenter
      :is-open="matchCenterOpen"
      :fixture-uuid="selectedFixtureUuid"
      :stage-uuid="props.stageUuid"
      @close="matchCenterOpen = false"
    />
  </Teleport>
</template>

<style scoped>
/* Pannable canvas: both axes, momentum on touch. */
.kb-scroll {
  overflow: auto;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
  touch-action: pan-x pan-y;
}
.kb-scroll::-webkit-scrollbar {
  height: 8px;
  width: 8px;
}
.kb-scroll::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.4);
  border-radius: 9999px;
}

/* --kb-gap is half the horizontal gap between rounds; connectors span it. */
.kb-bracket {
  --kb-gap: 18px;
  --kb-line: rgb(203 213 225); /* slate-300 */
  display: flex;
  align-items: stretch;
  width: max-content;
  padding: 16px calc(var(--kb-gap) + 8px) 24px 16px;
}
.dark .kb-bracket {
  --kb-line: rgb(51 65 85); /* slate-700 */
}

.kb-round {
  display: flex;
  flex-direction: column;
  flex: 0 0 auto;
  width: 210px;
}
.kb-round + .kb-round {
  margin-left: calc(var(--kb-gap) * 2);
}

.kb-round__title {
  display: flex;
  align-items: center;
  height: 30px;
  padding: 0 4px;
  margin-bottom: 4px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: rgb(107 114 128);
}

/* Shared body height across rounds → paired matches line up between columns. */
.kb-round__body {
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  min-height: calc(var(--kb-rows) * 84px);
}

.kb-match {
  flex: 1 1 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
  min-height: 84px;
  padding: 6px 0;
}

/* Pair bracket "]" connector from each odd match down to its even sibling. */
.kb-round:not(.kb-round--last) .kb-match:nth-child(odd)::after {
  content: "";
  position: absolute;
  left: 100%;
  top: 50%;
  width: var(--kb-gap);
  height: 100%;
  border: 2px solid var(--kb-line);
  border-left: 0;
  border-radius: 0 8px 8px 0;
  pointer-events: none;
}

/* Incoming horizontal line into each match (every round except the first). */
.kb-round:not(.kb-round--first) .kb-match::before {
  content: "";
  position: absolute;
  right: 100%;
  top: 50%;
  width: var(--kb-gap);
  height: 2px;
  background: var(--kb-line);
  transform: translateY(-1px);
  pointer-events: none;
}

/* Match card */
.kb-card {
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;
  padding: 8px 10px;
  border-radius: 12px;
  background: rgb(249 250 251);
  border: 1px solid rgb(243 244 246);
  text-align: left;
  transition: background 0.15s, border-color 0.15s, transform 0.1s;
}
.kb-card:hover {
  background: rgb(255 255 255);
  border-color: rgb(226 232 240);
}
.kb-card:active {
  transform: scale(0.98);
}
.dark .kb-card {
  background: rgb(31 41 55);
  border-color: rgb(55 65 81);
}
.dark .kb-card:hover {
  background: rgb(38 48 63);
  border-color: rgb(71 85 105);
}
.kb-card--live {
  border-color: rgb(252 165 165);
}
.dark .kb-card--live {
  border-color: rgba(153, 27, 27, 0.5);
}

/* Champion card: the decided final tie. Reserved gold — the only place it
   appears besides the header trophy. Keeps its ground on hover too. */
.kb-card--champ,
.kb-card--champ:hover {
  background: #fffbeb;
  border-color: rgba(217, 119, 6, 0.55);
}
.dark .kb-card--champ,
.dark .kb-card--champ:hover {
  background: rgba(251, 191, 36, 0.09);
  border-color: rgba(251, 191, 36, 0.45);
}
.kb-card--champ .kb-card__meta {
  color: #b45309;
}
.dark .kb-card--champ .kb-card__meta {
  color: #fbbf24;
}

/* Dark-mode neutral colors (base rule sets the light neutrals). Must be
   explicit — the card sets no text color, so dark mode would be unreadable. */
.dark .kb-name {
  color: rgb(203 213 225); /* slate-300 */
}
.dark .kb-score {
  color: rgb(241 245 249); /* slate-100 */
}

/* Advancement encoding: emerald = advanced, muted = eliminated, gold = champion. */
.kb-row--adv .kb-name {
  color: #059669;
  font-weight: 700;
}
.kb-row--adv .kb-score {
  color: #059669;
}
.dark .kb-row--adv .kb-name,
.dark .kb-row--adv .kb-score {
  color: #34d399;
}

.kb-row--out .kb-name,
.kb-row--out .kb-score {
  color: rgb(148 163 184); /* slate-400 */
}
.dark .kb-row--out .kb-name,
.dark .kb-row--out .kb-score {
  color: rgb(100 116 139); /* slate-500 */
}

.kb-row--champ .kb-name {
  color: #b45309;
  font-weight: 800;
}
.kb-row--champ .kb-score {
  color: #b45309;
}
.dark .kb-row--champ .kb-name,
.dark .kb-row--champ .kb-score {
  color: #fbbf24;
}

/* Advance check (emerald) / champion trophy (gold), between name and score. */
.kb-mark {
  flex-shrink: 0;
  width: 13px;
  height: 13px;
}
.kb-mark--adv {
  color: #059669;
}
.dark .kb-mark--adv {
  color: #34d399;
}
.kb-mark--champ {
  width: 14px;
  height: 14px;
  color: #d97706;
}
.dark .kb-mark--champ {
  color: #fbbf24;
}

.kb-card__meta {
  display: flex;
  align-items: center;
  gap: 5px;
  height: 14px;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.02em;
  color: rgb(156 163 175);
  overflow: hidden;
}

.kb-live-dot {
  width: 6px;
  height: 6px;
  border-radius: 9999px;
  background: rgb(239 68 68);
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.18);
  flex-shrink: 0;
}

/* Per-leg score breakdown inside a two-legged tie's meta row. */
.kb-legs {
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
  padding-left: 6px;
  font-variant-numeric: tabular-nums;
  color: rgb(107 114 128);
}
.dark .kb-legs {
  color: rgb(148 163 184);
}

.kb-row {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}
.kb-name {
  flex: 1 1 auto;
  min-width: 0;
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: rgb(51 65 85); /* slate-700 — neutral; state modifiers override */
}
.kb-score {
  flex-shrink: 0;
  font-size: 14px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  min-width: 14px;
  text-align: right;
  color: rgb(15 23 42); /* ink — neutral; state modifiers override */
}

/* Transitions */
.kb-fade-enter-active,
.kb-fade-leave-active {
  transition: opacity 0.25s ease;
}
.kb-fade-enter-from,
.kb-fade-leave-to {
  opacity: 0;
}

.kb-slide-enter-active {
  transition: transform 0.32s cubic-bezier(0.32, 0.72, 0, 1);
}
.kb-slide-leave-active {
  transition: transform 0.28s ease-in;
}
.kb-slide-enter-from,
.kb-slide-leave-to {
  transform: translateY(100%);
}

@media (prefers-reduced-motion: reduce) {
  .kb-slide-enter-active,
  .kb-slide-leave-active,
  .kb-fade-enter-active,
  .kb-fade-leave-active {
    transition: opacity 0.2s ease;
    transform: none !important;
  }
  .animate-ping {
    animation: none !important;
  }
}
</style>
