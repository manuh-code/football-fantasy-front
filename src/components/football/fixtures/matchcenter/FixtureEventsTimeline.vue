<script setup lang="ts">
import { computed, ref } from "vue";
import type { FootballEventResponse } from "@/interfaces/football/event/FootballEventResponse";
import type { FootballEventFilterResponse } from "@/interfaces/football/event/FootballEventFilterResponse";
import type { FootballTeamResponse } from "@/interfaces/football/team/FootballTeamResponse";
import type { TypeResponse } from "@/interfaces/football/type/TypeResponse";
import FixtureEventItem from "./FixtureEventItem.vue";

interface Props {
  events: FootballEventResponse[];
  homeTeam: FootballTeamResponse | undefined;
  awayTeam: FootballTeamResponse | undefined;
  eventFilters: FootballEventFilterResponse | null;
}

const props = defineProps<Props>();

// Whitelist of types we know how to render in the timeline.
// Extended to cover every type the backend may return (see /matchcenter API).
const TIMELINE_TYPES = new Set([
  "GOAL",
  "PENALTY",
  "OWNGOAL",
  "MISSED_PENALTY",
  "PENALTY_SHOOTOUT_GOAL",
  "PENALTY_SHOOTOUT_MISS",
  "YELLOWCARD",
  "REDCARD",
  "YELLOWREDCARD",
  "SUBSTITUTION",
  "VAR",
  "VAR_CARD",
  "HIGHLIGHT",
]);

// ── Filter visual mapping (icon vs colored card) ──
type FilterStyle =
  | { kind: "icon"; icon: string; iconClass: string }
  | { kind: "card"; cardClass: string };

const FILTER_STYLES: Record<string, FilterStyle> = {
  GOAL: { kind: "icon", icon: "md-sportssoccer", iconClass: "text-emerald-500 dark:text-emerald-400" },
  PENALTY: { kind: "icon", icon: "md-sportssoccer", iconClass: "text-emerald-500 dark:text-emerald-400" },
  PENALTY_SHOOTOUT_GOAL: { kind: "icon", icon: "md-sportssoccer", iconClass: "text-emerald-500 dark:text-emerald-400" },
  OWNGOAL: { kind: "icon", icon: "md-sportssoccer", iconClass: "text-red-500 dark:text-red-400" },
  MISSED_PENALTY: { kind: "icon", icon: "md-sportssoccer", iconClass: "text-gray-400 dark:text-gray-500" },
  PENALTY_SHOOTOUT_MISS: { kind: "icon", icon: "md-sportssoccer", iconClass: "text-gray-400 dark:text-gray-500" },
  YELLOWCARD: { kind: "card", cardClass: "bg-amber-400" },
  REDCARD: { kind: "card", cardClass: "bg-red-500" },
  YELLOWREDCARD: { kind: "card", cardClass: "bg-gradient-to-br from-amber-400 to-red-500" },
  VAR_CARD: { kind: "card", cardClass: "bg-violet-500" },
  SUBSTITUTION: { kind: "icon", icon: "hi-solid-switch-horizontal", iconClass: "text-blue-500 dark:text-blue-400" },
  VAR: { kind: "icon", icon: "md-replay", iconClass: "text-violet-500 dark:text-violet-400" },
  HIGHLIGHT: { kind: "icon", icon: "hi-solid-star", iconClass: "text-amber-500 dark:text-amber-400" },
};

const styleFor = (developerName: string): FilterStyle =>
  FILTER_STYLES[developerName] ?? {
    kind: "icon",
    icon: "md-sportssoccer",
    iconClass: "text-gray-400 dark:text-gray-500",
  };

// ── Filter state ──
// Source of truth for the filter chips:
//   1. Use `eventFilters.eventTypes` from the API when present.
//   2. Otherwise derive the unique event types from the events array, so
//      the bar still appears even when the backend doesn't send eventFilters.
const availableFilters = computed<TypeResponse[]>(() => {
  const fromApi = (props.eventFilters?.eventTypes ?? []).filter(
    (t) => !!t?.developer_name,
  );
  if (fromApi.length > 0) return fromApi;

  const seen = new Map<string, TypeResponse>();
  for (const event of props.events) {
    const t = event.type;
    if (
      t?.developer_name &&
      !seen.has(t.developer_name) &&
      TIMELINE_TYPES.has(t.developer_name)
    ) {
      seen.set(t.developer_name, t);
    }
  }
  return Array.from(seen.values());
});

const hasFilters = computed(() => availableFilters.value.length > 0);

const selectedFilters = ref<Set<string>>(new Set());

const isFilterActive = (developerName: string) => selectedFilters.value.has(developerName);

const isAllActive = computed(() => selectedFilters.value.size === 0);

const toggleFilter = (developerName: string) => {
  const next = new Set(selectedFilters.value);
  if (next.has(developerName)) next.delete(developerName);
  else next.add(developerName);
  selectedFilters.value = next;
};

const clearFilters = () => {
  selectedFilters.value = new Set();
};

// ── Filtered + grouped events ──
const filteredEvents = computed(() => {
  const base = props.events.filter((e) =>
    TIMELINE_TYPES.has(e.type?.developer_name ?? ""),
  );
  if (selectedFilters.value.size === 0) return base;
  return base.filter((e) =>
    selectedFilters.value.has(e.type?.developer_name ?? ""),
  );
});

interface PeriodGroup {
  key: string;
  label: string;
  events: FootballEventResponse[];
}

const groupedByPeriod = computed<PeriodGroup[]>(() => {
  const groups = new Map<string, PeriodGroup>();
  for (const event of filteredEvents.value) {
    const periodDev = event.period?.type?.developer_name ?? "OTHER";
    const periodLabel = event.period?.type?.name ?? "Other";
    if (!groups.has(periodDev)) {
      groups.set(periodDev, { key: periodDev, label: periodLabel, events: [] });
    }
    groups.get(periodDev)!.events.push(event);
  }
  const order: Record<string, number> = {
    "1ST_HALF": 1,
    "2ND_HALF": 2,
    "EXTRA_TIME_1ST_HALF": 3,
    "EXTRA_TIME_2ND_HALF": 4,
    "PENALTY_SHOOTOUT": 5,
  };
  const out = Array.from(groups.values());
  out.sort((a, b) => (order[a.key] ?? 99) - (order[b.key] ?? 99));
  for (const g of out) {
    g.events.sort((a, b) => {
      if (a.minute !== b.minute) return a.minute - b.minute;
      const aExtra = a.extra_minute ?? 0;
      const bExtra = b.extra_minute ?? 0;
      if (aExtra !== bExtra) return aExtra - bExtra;
      return a.sort_order - b.sort_order;
    });
  }
  return out;
});

const sideOf = (event: FootballEventResponse): "home" | "away" => {
  if (props.homeTeam && event.participant_id === props.homeTeam.sm_id) return "home";
  return "away";
};

const showEmptyMatchingFilters = computed(
  () => filteredEvents.value.length === 0 && selectedFilters.value.size > 0,
);
</script>

<template>
  <div class="px-4 pt-2 pb-5">
    <!-- Filter row -->
    <div
      v-if="hasFilters"
      class="filter-row -mx-4 px-4 mb-4 flex items-center gap-2 overflow-x-auto"
      role="tablist"
      aria-label="Event filters"
    >
      <!-- "All" chip -->
      <button
        type="button"
        role="tab"
        :aria-selected="isAllActive"
        @click="clearFilters"
        class="shrink-0 inline-flex items-center gap-1.5 h-7 px-3 rounded-full text-[11px] font-semibold tracking-wide whitespace-nowrap transition-colors"
        :class="isAllActive
          ? 'bg-emerald-500 text-white shadow-sm'
          : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'"
      >
        All
      </button>

      <!-- Type chips -->
      <button
        v-for="filter in availableFilters"
        :key="filter.uuid"
        type="button"
        role="tab"
        :aria-selected="isFilterActive(filter.developer_name)"
        @click="toggleFilter(filter.developer_name)"
        class="shrink-0 inline-flex items-center gap-1.5 h-7 px-3 rounded-full text-[11px] font-semibold tracking-wide whitespace-nowrap transition-colors"
        :class="isFilterActive(filter.developer_name)
          ? 'bg-emerald-500 text-white shadow-sm'
          : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'"
      >
        <template v-if="styleFor(filter.developer_name).kind === 'card'">
          <div
            class="w-2 h-3 rounded-[1.5px] shadow-sm shrink-0"
            :class="(styleFor(filter.developer_name) as { kind: 'card'; cardClass: string }).cardClass"
          />
        </template>
        <template v-else>
          <v-icon
            :name="(styleFor(filter.developer_name) as { kind: 'icon'; icon: string; iconClass: string }).icon"
            class="w-3.5 h-3.5 shrink-0"
            :class="isFilterActive(filter.developer_name)
              ? 'text-white'
              : (styleFor(filter.developer_name) as { kind: 'icon'; icon: string; iconClass: string }).iconClass"
          />
        </template>
        <span>{{ filter.name }}</span>
      </button>
    </div>

    <!-- Events grouped by period -->
    <div v-if="filteredEvents.length > 0" class="space-y-6">
      <div
        v-for="group in groupedByPeriod"
        :key="group.key"
        class="relative"
      >
        <!-- Period header -->
        <div class="flex items-center gap-2 mb-3">
          <div class="flex-1 h-px bg-gray-200 dark:bg-gray-700/60" />
          <span class="text-[10px] font-bold tracking-widest uppercase text-gray-400 dark:text-gray-500">
            {{ group.label }}
          </span>
          <div class="flex-1 h-px bg-gray-200 dark:bg-gray-700/60" />
        </div>

        <!-- Events list — FotMob style: each event takes most of the row width and is
             aligned to its team's side, so player names render in full (no truncation). -->
        <div class="space-y-3.5">
          <div
            v-for="event in group.events"
            :key="event.id"
            class="flex"
            :class="sideOf(event) === 'home' ? 'justify-start' : 'justify-end'"
          >
            <div class="w-[88%] sm:w-[85%]">
              <FixtureEventItem :event="event" :side="sideOf(event)" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty: filter active but no matches -->
    <div
      v-else-if="showEmptyMatchingFilters"
      class="text-center py-6 text-gray-400 dark:text-gray-500"
    >
      <v-icon name="hi-solid-filter" class="w-7 h-7 mx-auto mb-2 text-gray-200 dark:text-gray-700" />
      <p class="text-[12px]">No events match the selected filters</p>
      <button
        @click="clearFilters"
        class="mt-2 text-[12px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
      >
        Clear filters
      </button>
    </div>

    <!-- Empty: no events at all -->
    <div
      v-else
      class="text-center py-6 text-gray-400 dark:text-gray-500"
    >
      <v-icon name="md-sportssoccer" class="w-7 h-7 mx-auto mb-2 text-gray-200 dark:text-gray-700" />
      <p class="text-[12px]">No events yet</p>
    </div>
  </div>
</template>

<style scoped>
.filter-row {
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.filter-row::-webkit-scrollbar {
  display: none;
}
</style>
