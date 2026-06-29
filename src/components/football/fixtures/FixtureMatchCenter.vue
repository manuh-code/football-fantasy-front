<script setup lang="ts">
import { computed, ref, watch, onBeforeUnmount, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import type * as Ably from "ably";
import { footballFixtureService } from "@/services/football/fixture/FootballFixtureService";
import { useAblyBroadcast } from "@/composables/broadcast/useAblyBroadcast";
import type { FootballFixtureResponse } from "@/interfaces/football/fixture/FootballFixtureResponse";
import type { FootballTeamResponse } from "@/interfaces/football/team/FootballTeamResponse";
import type { ScoreResponse } from "@/interfaces/football/fixture/ScoreResponse";
import type { FootballEventResponse } from "@/interfaces/football/event/FootballEventResponse";
import type { FootballStatisticResponse } from "@/interfaces/football/fixture/FootballStatisticResponse";
import type { FootballFixtureLineupStatsResponse } from "@/interfaces/football/fixture/FootballFixtureLineupStatsResponse";
import type { FootballFixtureCommentResponse } from "@/interfaces/football/fixture/FootballFixtureCommentResponse";
import FixtureScoreboardHeader from "./matchcenter/FixtureScoreboardHeader.vue";
import FixtureEventsTimeline from "./matchcenter/FixtureEventsTimeline.vue";
import FixtureStatistics from "./matchcenter/FixtureStatistics.vue";
import FixtureMatchCenterSkeleton from "./matchcenter/FixtureMatchCenterSkeleton.vue";
import FixtureAccordion from "./matchcenter/FixtureAccordion.vue";
import FixtureMatchInfo from "./matchcenter/FixtureMatchInfo.vue";
import FixtureSidelined from "./matchcenter/FixtureSidelined.vue";
import FixtureLatestMatches from "./matchcenter/FixtureLatestMatches.vue";
import FixtureLineups from "./matchcenter/FixtureLineups.vue";
import FixtureComments from "./matchcenter/FixtureComments.vue";
import FixtureManOfTheMatch from "./matchcenter/FixtureManOfTheMatch.vue";
import FixtureHeadToHead from "./matchcenter/FixtureHeadToHead.vue";
import FixtureLineupStats from "./matchcenter/FixtureLineupStats.vue";
import FixtureMatchTabs, { type MatchTab } from "./matchcenter/FixtureMatchTabs.vue";

interface Props {
  isOpen: boolean;
  fixtureUuid: string | null;
  /** Stage the fixture belongs to — forwarded to the scoreboard header for the team-profile drawer. */
  stageUuid?: string | null;
}

const props = defineProps<Props>();
const emit = defineEmits<{ close: [] }>();

const { t } = useI18n();

const fixture = ref<FootballFixtureResponse | null>(null);
const isLoading = ref(false);
const loadError = ref<string | null>(null);

// ── Linear tab menu ──
const activeTab = ref<MatchTab>("info");

// ── Sticky + Shrink scoreboard ──
const scrollBody = ref<HTMLElement | null>(null);
const isHeaderCollapsed = ref(false);

// Collapse/expand uses wide hysteresis + a post-toggle lock so the layout reflow
// triggered by the shrink animation can't bounce the state back (flicker).
const COLLAPSE_AT = 64; // scroll past this → collapse
const EXPAND_AT = 10; // scroll back under this → expand
const MIN_SCROLLABLE = 160; // only collapse when there's clearly room to scroll
const TOGGLE_LOCK_MS = 360; // ~ the header transition duration
let scrollTicking = false;
let toggleLockUntil = 0;

const onScroll = (e: Event) => {
  if (scrollTicking) return;
  const el = e.target as HTMLElement;
  scrollTicking = true;
  requestAnimationFrame(() => {
    scrollTicking = false;
    if (performance.now() < toggleLockUntil) return;
    const top = el.scrollTop;
    if (!isHeaderCollapsed.value) {
      const maxScroll = el.scrollHeight - el.clientHeight;
      if (top > COLLAPSE_AT && maxScroll > MIN_SCROLLABLE) {
        isHeaderCollapsed.value = true;
        toggleLockUntil = performance.now() + TOGGLE_LOCK_MS;
      }
    } else if (top < EXPAND_AT) {
      isHeaderCollapsed.value = false;
      toggleLockUntil = performance.now() + TOGGLE_LOCK_MS;
    }
  });
};

const homeTeam = computed<FootballTeamResponse | undefined>(() =>
  fixture.value?.participants?.find((p) => p.meta?.location === "home")
);
const awayTeam = computed<FootballTeamResponse | undefined>(() =>
  fixture.value?.participants?.find((p) => p.meta?.location === "away")
);

// Reset scroll + expanded header when switching tabs.
watch(activeTab, () => {
  if (scrollBody.value) scrollBody.value.scrollTop = 0;
  isHeaderCollapsed.value = false;
  toggleLockUntil = 0;
});

const loadFixture = async (uuid: string) => {
  isLoading.value = true;
  loadError.value = null;
  fixture.value = null;
  activeTab.value = "info";
  isHeaderCollapsed.value = false;
  toggleLockUntil = 0;
  try {
    const response = await footballFixtureService.getMatchCenterFixture(uuid);
    fixture.value = response.data;
    subscribeRealtime(uuid);
  } catch (err) {
    console.error("Error loading match center fixture:", err);
    loadError.value = t("football.matchCenter.loadError");
  } finally {
    isLoading.value = false;
  }
};

const retry = () => {
  if (props.fixtureUuid) loadFixture(props.fixtureUuid);
};

// ── Real-time updates (Ably) ──────────────────────────────────────────────
// A single channel per fixture feeds every section of the match center. Each
// event mutates the reactive `fixture` object in place, so the change flows
// down to the relevant child component through its props (scoreboard, events
// timeline, statistics, player stats and live commentary).
const { matchCenterFixtureChannel } = useAblyBroadcast();
let liveChannel: Ably.RealtimeChannel | null = null;

// Backend may publish a single item or a batch — normalize to an array.
const toArray = <T,>(payload: T | T[]): T[] =>
  Array.isArray(payload) ? payload : payload != null ? [payload] : [];

// 1. match-center-score → keep the scoreboard header in sync.
const onScore = (msg: Ably.InboundMessage) => {
  const f = fixture.value;
  if (!f?.participants) return;
  for (const s of toArray<ScoreResponse>(msg.data)) {
    const side = s.score?.participant;
    const goals = s.score?.goals;
    if (side == null || goals == null) continue;
    const participant = f.participants.find((p) => p.meta?.location === side);
    if (!participant) continue;
    if (participant.current_score) {
      participant.current_score.score = goals;
    } else {
      participant.current_score = { score: goals, participant: side, description: s.description ?? "" };
    }
  }
};

// 2. match-center-event → append / replace events in the timeline.
const onEvent = (msg: Ably.InboundMessage) => {
  const f = fixture.value;
  if (!f) return;
  if (!f.events) f.events = [];
  for (const e of toArray<FootballEventResponse>(msg.data)) {
    const idx = f.events.findIndex((x) => x.id === e.id);
    if (idx !== -1) f.events[idx] = e;
    else f.events.push(e);
  }
};

// 3. match-center-statistics → upsert each stat by type + side.
const onStatistics = (msg: Ably.InboundMessage) => {
  const f = fixture.value;
  if (!f) return;
  if (!f.statistics) f.statistics = [];
  for (const s of toArray<FootballStatisticResponse>(msg.data)) {
    const idx = f.statistics.findIndex(
      (x) => x.type_id === s.type_id && x.location === s.location
    );
    if (idx !== -1) f.statistics[idx] = s;
    else f.statistics.push(s);
  }
};

// 4. match-center-lineup-stats → replace the top list for each stat type.
const onLineupStats = (msg: Ably.InboundMessage) => {
  const f = fixture.value;
  if (!f) return;
  if (!f.lineupStats) f.lineupStats = [];
  for (const ls of toArray<FootballFixtureLineupStatsResponse>(msg.data)) {
    const idx = f.lineupStats.findIndex((x) => x.type?.uuid === ls.type?.uuid);
    if (idx !== -1) f.lineupStats[idx] = ls;
    else f.lineupStats.push(ls);
  }
};

// 5. match-center-comments → append / replace live commentary by order.
const onComments = (msg: Ably.InboundMessage) => {
  const f = fixture.value;
  if (!f) return;
  if (!f.comments) f.comments = [];
  for (const c of toArray<FootballFixtureCommentResponse>(msg.data)) {
    const idx = f.comments.findIndex((x) => x.order === c.order);
    if (idx !== -1) f.comments[idx] = c;
    else f.comments.push(c);
  }
};

const subscribeRealtime = (uuid: string) => {
  unsubscribeRealtime();
  liveChannel = matchCenterFixtureChannel(uuid);
  liveChannel.subscribe("match-center-score", onScore);
  liveChannel.subscribe("match-center-event", onEvent);
  liveChannel.subscribe("match-center-statistics", onStatistics);
  liveChannel.subscribe("match-center-lineup-stats", onLineupStats);
  liveChannel.subscribe("match-center-comments", onComments);
};

const unsubscribeRealtime = () => {
  if (!liveChannel) return;
  liveChannel.unsubscribe("match-center-score", onScore);
  liveChannel.unsubscribe("match-center-event", onEvent);
  liveChannel.unsubscribe("match-center-statistics", onStatistics);
  liveChannel.unsubscribe("match-center-lineup-stats", onLineupStats);
  liveChannel.unsubscribe("match-center-comments", onComments);
  liveChannel = null;
};

watch(
  () => [props.isOpen, props.fixtureUuid] as const,
  ([open, uuid]) => {
    if (open && uuid) loadFixture(uuid);
    if (!open) {
      unsubscribeRealtime();
      fixture.value = null;
      loadError.value = null;
    }
  }
);

const onKeydown = (e: KeyboardEvent) => {
  if (e.key === "Escape" && props.isOpen) emit("close");
};

onMounted(() => {
  window.addEventListener("keydown", onKeydown);
});
onBeforeUnmount(() => {
  window.removeEventListener("keydown", onKeydown);
  unsubscribeRealtime();
});

watch(
  () => props.isOpen,
  (open) => {
    if (typeof document !== "undefined") {
      document.body.style.overflow = open ? "hidden" : "";
    }
    if (!open) {
      dragOffsetY.value = 0;
      isDragging.value = false;
    }
  }
);

// ── Drag-to-dismiss ──
const dragOffsetY = ref(0);
const isDragging = ref(false);
const dragStartY = ref(0);
const dragStartTime = ref(0);

const onDragStart = (e: PointerEvent) => {
  if (e.pointerType === "mouse" && e.button !== 0) return;
  isDragging.value = true;
  dragStartY.value = e.clientY;
  dragStartTime.value = Date.now();
  dragOffsetY.value = 0;
  (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
};

const onDragMove = (e: PointerEvent) => {
  if (!isDragging.value) return;
  const delta = e.clientY - dragStartY.value;
  dragOffsetY.value = delta > 0 ? delta : delta * 0.15;
};

const onDragEnd = (e: PointerEvent) => {
  if (!isDragging.value) return;
  isDragging.value = false;
  try {
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
  } catch {
    // ignore
  }
  const elapsed = Date.now() - dragStartTime.value;
  const velocity = elapsed > 0 ? dragOffsetY.value / elapsed : 0;
  const shouldClose = dragOffsetY.value > 100 || velocity > 0.6;
  dragOffsetY.value = 0;
  if (shouldClose) emit("close");
};
</script>

<template>
  <Teleport to="body">
    <!-- Backdrop. z-[115] sits above the RoundFixturesDrawer sheet (z-[110]) so the
         Match Center fully covers it when opened from inside the rounds drawer. -->
    <Transition name="mc-fade">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-[115] bg-black/60 backdrop-blur-sm"
        @click="emit('close')"
      />
    </Transition>

    <!-- Sheet wrapper (Vue Transition: slide in/out). z-[120] is the highest in the stack:
         above FooterMenu (z-100), RoundFixturesDrawer (z-[110]) and its own backdrop. -->
    <Transition name="mc-slide">
      <div
        v-if="isOpen"
        class="fixed bottom-0 left-0 right-0 z-[120] md:left-4 md:right-4 md:bottom-4 md:max-w-2xl md:mx-auto pointer-events-none"
      >
        <!-- Inner sheet (drag transform applied here, decoupled from Vue Transition) -->
        <div
          :style="{
            transform: `translateY(${dragOffsetY}px)`,
            transition: isDragging
              ? 'none'
              : 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)',
          }"
          class="flex flex-col bg-white dark:bg-gray-900 shadow-2xl rounded-t-3xl md:rounded-3xl h-[92dvh] md:h-[88dvh] overflow-hidden pointer-events-auto"
          role="dialog"
          aria-modal="true"
          :aria-label="$t('football.matchCenter.aria')"
        >
          <!-- Draggable handle (thin grab area; close button is independent) -->
          <div
            @pointerdown="onDragStart"
            @pointermove="onDragMove"
            @pointerup="onDragEnd"
            @pointercancel="onDragEnd"
            class="relative shrink-0 cursor-grab active:cursor-grabbing touch-none select-none"
          >
            <div class="flex justify-center pt-2.5 pb-2">
              <div class="w-10 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600" />
            </div>

          
          </div>

          <!-- Scrollable body (extra padding-bottom to clear iOS home indicator) -->
          <div
            ref="scrollBody"
            @scroll="onScroll"
            class="flex-1 overflow-y-auto overscroll-contain"
          >
            <!-- Content wrapper -->
            <div style="padding-bottom: calc(2rem + env(safe-area-inset-bottom))">
            <!-- Loading skeleton -->
            <FixtureMatchCenterSkeleton v-if="isLoading" />

            <!-- Error -->
            <div
              v-else-if="loadError"
              class="px-4 py-12 flex flex-col items-center text-center"
            >
              <v-icon
                name="hi-solid-exclamation-circle"
                class="w-9 h-9 text-red-400 dark:text-red-500 mb-3"
              />
              <p class="text-footnote text-red-500 dark:text-red-400 mb-3">{{ loadError }}</p>
              <button
                @click="retry"
                class="px-4 py-2 text-xs font-semibold rounded-full bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"
              >
                {{ $t('common.actions.retry') }}
              </button>
            </div>

            <!-- Loaded -->
            <template v-else-if="fixture">
              <!-- Sticky cluster: shrinking match hero + linear tab menu.
                   Stays pinned (opaque, above the scrolling content) while the
                   per-tab content scrolls underneath. -->
              <div
                class="sticky top-0 z-30 bg-white dark:bg-gray-900 transition-shadow duration-300"
                :class="isHeaderCollapsed ? 'shadow-md shadow-black/5 dark:shadow-black/40' : ''"
              >
                <FixtureScoreboardHeader
                  :fixture="fixture"
                  :collapsed="isHeaderCollapsed"
                  :stage-uuid="stageUuid"
                />
                <div class="border-b border-gray-100 dark:border-gray-800">
                  <FixtureMatchTabs v-model="activeTab" />
                </div>
              </div>

              <!-- Per-tab content -->
              <Transition name="mc-tab" mode="out-in">
                <!-- ── Info: full overview (accordions) ── -->
                <div key="info" v-if="activeTab === 'info'">
                  <!-- Man of the Match -->
                  <FixtureManOfTheMatch
                    v-if="fixture.manOfTheMatch?.player"
                    :man-of-the-match="fixture.manOfTheMatch"
                  />

                  <!-- Events -->
                  <FixtureAccordion
                    :title="$t('football.matchCenter.events')"
                    icon="md-sportssoccer"
                    :default-open="false"
                  >
                    <FixtureEventsTimeline
                      :events="fixture.events ?? []"
                      :event-filters="fixture.eventFilters"
                      :home-team="homeTeam"
                      :away-team="awayTeam"
                    />
                  </FixtureAccordion>

                  <!-- Statistics -->
                  <FixtureAccordion
                    v-if="fixture.statistics && fixture.statistics.length > 0"
                    :title="$t('football.matchCenter.statistics')"
                    icon="hi-solid-chart-bar"
                    :default-open="false"
                  >
                    <FixtureStatistics
                      :statistics="fixture.statistics"
                      :home-team="homeTeam"
                      :away-team="awayTeam"
                    />
                  </FixtureAccordion>

                  <!-- Latest Matches — recent form for both teams (collapsed) -->
                  <FixtureAccordion
                    v-if="(homeTeam?.latest && homeTeam.latest.length > 0) || (awayTeam?.latest && awayTeam.latest.length > 0)"
                    :title="$t('football.matchCenter.latestMatches')"
                    icon="md-history"
                    :default-open="false"
                  >
                    <FixtureLatestMatches
                      :home-team="homeTeam"
                      :away-team="awayTeam"
                    />
                  </FixtureAccordion>

                  <!-- Match Info — Venue + Weather (collapsed) -->
                  <FixtureAccordion
                    v-if="fixture.venue || fixture.weatherReport"
                    :title="$t('football.matchCenter.matchInfo')"
                    icon="hi-solid-information-circle"
                    :default-open="false"
                  >
                    <FixtureMatchInfo
                      :venue="fixture.venue"
                      :weather="fixture.weatherReport"
                    />
                  </FixtureAccordion>

                  <!-- Sidelined (collapsed) -->
                  <FixtureAccordion
                    v-if="fixture.sidelined && fixture.sidelined.length > 0"
                    :title="$t('football.matchCenter.sidelined')"
                    icon="hi-solid-user"
                    icon-class="text-red-500 dark:text-red-400"
                    :default-open="false"
                  >
                    <template #trailing>
                      <span class="text-2xs font-normal text-gray-400 dark:text-gray-500 tabular-nums">
                        {{ fixture.sidelined.length }}
                      </span>
                    </template>
                    <FixtureSidelined :sidelined="fixture.sidelined" />
                  </FixtureAccordion>
                </div>

                <!-- ── Comments (live commentary) ── -->
                <FixtureComments
                  v-else-if="activeTab === 'comments'"
                  key="comments"
                  :comments="fixture.comments"
                />

                <!-- ── Events only ── -->
                <FixtureEventsTimeline
                  v-else-if="activeTab === 'events'"
                  key="events"
                  :events="fixture.events ?? []"
                  :event-filters="fixture.eventFilters"
                  :home-team="homeTeam"
                  :away-team="awayTeam"
                />

                <!-- ── Statistics only ── -->
                <div key="stats" v-else-if="activeTab === 'stats'">
                  <FixtureStatistics
                    v-if="fixture.statistics && fixture.statistics.length > 0"
                    :statistics="fixture.statistics"
                    :home-team="homeTeam"
                    :away-team="awayTeam"
                  />
                  <div v-else class="px-4 py-12 flex flex-col items-center text-center">
                    <v-icon name="hi-solid-chart-bar" class="w-9 h-9 text-gray-200 dark:text-gray-700 mb-2" />
                    <p class="text-footnote text-gray-400 dark:text-gray-500">{{ $t('football.matchCenter.noStatistics') }}</p>
                  </div>
                </div>

                <!-- ── Lineups only ── -->
                <FixtureLineups
                  v-else-if="activeTab === 'lineups'"
                  key="lineups"
                  :lineups="fixture.lineups"
                  :formations="fixture.formations"
                  :home-team="homeTeam"
                  :away-team="awayTeam"
                />

                <!-- ── Player stats (lineup stats) ── -->
                <FixtureLineupStats
                  v-else-if="activeTab === 'playerstats'"
                  key="playerstats"
                  :lineup-stats="fixture.lineupStats"
                />

                <!-- ── Head to Head ── -->
                <FixtureHeadToHead
                  v-else
                  key="head2head"
                  :fixture-uuid="fixture.uuid"
                  :home-team="homeTeam"
                  :away-team="awayTeam"
                />
              </Transition>
            </template>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.mc-fade-enter-active,
.mc-fade-leave-active {
  transition: opacity 0.2s ease;
}
.mc-fade-enter-from,
.mc-fade-leave-to {
  opacity: 0;
}

.mc-slide-enter-active,
.mc-slide-leave-active {
  transition: transform 0.35s cubic-bezier(0.32, 0.72, 0, 1);
}
.mc-slide-enter-from,
.mc-slide-leave-to {
  transform: translateY(100%);
}

.tabular-nums {
  font-variant-numeric: tabular-nums;
}
</style>
