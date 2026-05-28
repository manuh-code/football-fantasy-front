<script setup lang="ts">
import { computed } from "vue";
import type { FootballEventResponse } from "@/interfaces/football/event/FootballEventResponse";
import type { FootballTeamResponse } from "@/interfaces/football/team/FootballTeamResponse";
import FixtureEventItem from "./FixtureEventItem.vue";

interface Props {
  events: FootballEventResponse[];
  homeTeam: FootballTeamResponse | undefined;
  awayTeam: FootballTeamResponse | undefined;
}

const props = defineProps<Props>();

const TIMELINE_TYPES = new Set([
  "GOAL",
  "PENALTY",
  "OWNGOAL",
  "YELLOWCARD",
  "REDCARD",
  "YELLOWREDCARD",
  "SUBSTITUTION",
  "VAR",
]);

const filteredEvents = computed(() =>
  props.events.filter((e) => TIMELINE_TYPES.has(e.type?.developer_name ?? ""))
);

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
</script>

<template>
  <section v-if="filteredEvents.length > 0" class="px-4 py-5">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-[15px] font-bold text-gray-900 dark:text-white">Events</h3>
      <span class="text-[11px] text-gray-400 dark:text-gray-500 tabular-nums">
        {{ filteredEvents.length }}
      </span>
    </div>

    <div class="space-y-6">
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

        <!-- Events list -->
        <div class="relative">
          <!-- Center vertical line -->
          <div
            class="absolute top-0 bottom-0 left-1/2 w-px bg-gray-200 dark:bg-gray-700/40 -translate-x-px"
            aria-hidden="true"
          />

          <div class="space-y-4">
            <div
              v-for="event in group.events"
              :key="event.id"
              class="grid grid-cols-2 gap-2"
            >
              <!-- Home side -->
              <div v-if="sideOf(event) === 'home'" class="col-start-1 col-end-2 flex justify-end">
                <div class="w-full max-w-full">
                  <FixtureEventItem :event="event" side="home" />
                </div>
              </div>
              <div v-else class="col-start-1 col-end-2" />

              <!-- Away side -->
              <div v-if="sideOf(event) === 'away'" class="col-start-2 col-end-3 flex justify-start">
                <div class="w-full max-w-full">
                  <FixtureEventItem :event="event" side="away" />
                </div>
              </div>
              <div v-else class="col-start-2 col-end-3" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Empty state -->
  <section v-else class="px-4 py-5">
    <div class="flex items-center justify-between mb-3">
      <h3 class="text-[15px] font-bold text-gray-900 dark:text-white">Events</h3>
    </div>
    <div class="text-center py-6 text-gray-400 dark:text-gray-500">
      <v-icon name="md-sportssoccer" class="w-7 h-7 mx-auto mb-2 text-gray-200 dark:text-gray-700" />
      <p class="text-[12px]">No events yet</p>
    </div>
  </section>
</template>
