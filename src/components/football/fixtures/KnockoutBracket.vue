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
interface BracketColumn {
  stage: FootballStageResponse;
  fixtures: FootballFixtureResponse[];
}

const columns = ref<BracketColumn[]>([]);
const isLoading = ref(false);
const loadError = ref<string | null>(null);
let loadedStageUuid: string | null = null;

// Height of the tallest round drives the shared column height so pairs align.
const maxRows = computed(() =>
  columns.value.reduce((max, c) => Math.max(max, c.fixtures.length), 1),
);

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
      .map((stage, i) => ({ stage, fixtures: fixturesPerStage[i] ?? [] }))
      // Drop rounds that have no fixtures so the tree stays tight.
      .filter((c) => c.fixtures.length > 0);

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

// Monochrome winner emphasis, matching FixturesList.
const resultClass = (fx: FootballFixtureResponse, location: "home" | "away"): string => {
  if (!hasScores(fx) || !isFinished(fx)) return "text-gray-700 dark:text-gray-200";
  const hs = scoreOf(homeTeam(fx));
  const as = scoreOf(awayTeam(fx));
  if (hs === as) return "text-gray-500 dark:text-gray-400";
  const won = (location === "home" && hs > as) || (location === "away" && as > hs);
  return won ? "text-gray-900 dark:text-white font-semibold" : "text-gray-400 dark:text-gray-500";
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
            <v-icon name="bi-trophy-fill" class="w-[18px] h-[18px] text-amber-500 dark:text-amber-400 shrink-0" />
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
                class="px-4 py-2 text-xs font-semibold rounded-full bg-amber-500 text-white hover:bg-amber-600 transition-colors"
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
                      class="ml-1.5 relative inline-flex w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0"
                    >
                      <span class="absolute inset-0 rounded-full bg-amber-400/60 animate-ping" />
                    </span>
                  </div>

                  <div class="kb-round__body">
                    <div v-for="fx in col.fixtures" :key="fx.uuid" class="kb-match">
                      <button
                        type="button"
                        @click="openMatch(fx)"
                        class="kb-card"
                        :class="isLive(fx) ? 'kb-card--live' : ''"
                      >
                        <!-- Meta -->
                        <div class="kb-card__meta">
                          <template v-if="isLive(fx)">
                            <span class="kb-live-dot" />
                            <span class="text-red-600 dark:text-red-400 font-bold">{{ $t('football.common.live') }}</span>
                          </template>
                          <template v-else-if="isFinished(fx)">
                            <span>FT</span>
                          </template>
                          <template v-else>
                            <span class="truncate">{{ fx.starting_date }} · {{ fx.hour }}</span>
                          </template>
                        </div>

                        <!-- Home -->
                        <div class="kb-row">
                          <TeamLogo :team="homeTeam(fx)" size="sm" />
                          <span class="kb-name" :class="resultClass(fx, 'home')" :title="teamName(homeTeam(fx))">
                            {{ teamName(homeTeam(fx)) }}
                          </span>
                          <span v-if="hasScores(fx)" class="kb-score" :class="resultClass(fx, 'home')">
                            {{ scoreOf(homeTeam(fx)) }}
                          </span>
                        </div>

                        <!-- Away -->
                        <div class="kb-row">
                          <TeamLogo :team="awayTeam(fx)" size="sm" />
                          <span class="kb-name" :class="resultClass(fx, 'away')" :title="teamName(awayTeam(fx))">
                            {{ teamName(awayTeam(fx)) }}
                          </span>
                          <span v-if="hasScores(fx)" class="kb-score" :class="resultClass(fx, 'away')">
                            {{ scoreOf(awayTeam(fx)) }}
                          </span>
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
:global(.dark) .kb-bracket {
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
:global(.dark) .kb-card {
  background: rgb(31 41 55);
  border-color: rgb(55 65 81);
}
:global(.dark) .kb-card:hover {
  background: rgb(38 48 63);
  border-color: rgb(71 85 105);
}
.kb-card--live {
  border-color: rgb(252 165 165);
}
:global(.dark) .kb-card--live {
  border-color: rgba(153, 27, 27, 0.5);
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
}
.kb-score {
  flex-shrink: 0;
  font-size: 14px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  min-width: 14px;
  text-align: right;
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
