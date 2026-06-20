<script setup lang="ts">
import { computed } from "vue";
import type { FootballEventResponse } from "@/interfaces/football/event/FootballEventResponse";

interface Props {
  event: FootballEventResponse;
  side: "home" | "away";
}

const props = defineProps<Props>();

const developerName = computed(() => props.event.type?.developer_name ?? "");

const minuteLabel = computed(() => {
  const m = props.event.minute;
  const extra = props.event.extra_minute;
  if (extra && extra > 0) return `${m}+${extra}'`;
  return `${m}'`;
});

const iconName = computed(() => {
  switch (developerName.value) {
    case "GOAL":
    case "PENALTY":
    case "OWNGOAL":
      return "md-sportssoccer";
    case "YELLOWCARD":
    case "REDCARD":
    case "YELLOWREDCARD":
      return "";
    case "SUBSTITUTION":
      return "hi-solid-switch-horizontal";
    case "VAR":
      return "md-replay";
    default:
      return "md-sportssoccer";
  }
});

const iconColor = computed(() => {
  switch (developerName.value) {
    case "GOAL":
    case "PENALTY":
      return "text-emerald-500 dark:text-emerald-400";
    case "OWNGOAL":
      return "text-red-500 dark:text-red-400";
    case "SUBSTITUTION":
      return "text-blue-500 dark:text-blue-400";
    case "VAR":
      return "text-violet-500 dark:text-violet-400";
    default:
      return "text-gray-500 dark:text-gray-400";
  }
});

const cardColor = computed(() => {
  if (developerName.value === "YELLOWCARD") return "bg-amber-400";
  if (developerName.value === "REDCARD") return "bg-red-500";
  if (developerName.value === "YELLOWREDCARD") return "bg-gradient-to-br from-amber-400 to-red-500";
  return "";
});

const isCard = computed(() =>
  ["YELLOWCARD", "REDCARD", "YELLOWREDCARD"].includes(developerName.value)
);

const isCancelledPenalty = computed(() => {
  if (developerName.value !== "VAR") return false;
  const addition = props.event.addition?.toLowerCase() ?? "";
  return addition.includes("cancelled") || addition.includes("penalty");
});

const eventTitle = computed(() => {
  switch (developerName.value) {
    case "GOAL":
      return "Goal";
    case "PENALTY":
      return "Penalty";
    case "OWNGOAL":
      return "Own Goal";
    case "YELLOWCARD":
      return "Yellow Card";
    case "REDCARD":
      return "Red Card";
    case "YELLOWREDCARD":
      return "Second Yellow";
    case "SUBSTITUTION":
      return "Substitution";
    case "VAR":
      return isCancelledPenalty.value ? "VAR — Cancelled" : "VAR";
    default:
      return props.event.type?.name ?? "Event";
  }
});

const secondaryLine = computed<string | null>(() => {
  const dev = developerName.value;
  if (dev === "GOAL" || dev === "PENALTY") {
    const parts: string[] = [];
    if (props.event.related_player_name) parts.push(`Assist: ${props.event.related_player_name}`);
    if (props.event.info) parts.push(props.event.info);
    return parts.length ? parts.join(" • ") : null;
  }
  if (dev === "SUBSTITUTION") {
    return props.event.related_player_name ? `Off: ${props.event.related_player_name}` : null;
  }
  if (isCard.value) {
    return props.event.info ?? null;
  }
  if (dev === "VAR") {
    return props.event.addition ?? null;
  }
  return props.event.info || props.event.addition || null;
});

const isHome = computed(() => props.side === "home");
</script>

<template>
  <div
    class="flex items-start gap-2"
    :class="isHome ? 'flex-row pr-3' : 'flex-row-reverse pl-3'"
  >
    <!-- Minute pill -->
    <div
      class="shrink-0 min-w-[40px] h-6 px-2 rounded-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 mt-0.5"
    >
      <span class="text-2xs font-bold tabular-nums text-gray-700 dark:text-gray-300">
        {{ minuteLabel }}
      </span>
    </div>

    <!-- Icon / card -->
    <div class="shrink-0 w-5 h-5 flex items-center justify-center mt-0.5">
      <div v-if="isCard" :class="['w-2.5 h-3.5 rounded-[2px] shadow-sm', cardColor]" />
      <v-icon
        v-else
        :name="iconName"
        class="w-4 h-4"
        :class="iconColor"
      />
    </div>

    <!-- Content -->
    <div class="flex-1 min-w-0" :class="isHome ? 'text-left' : 'text-right'">
      <div class="flex items-start gap-1.5" :class="isHome ? 'justify-start' : 'justify-end'">
        <p
          class="text-footnote font-semibold text-gray-900 dark:text-white break-words"
          :class="isCancelledPenalty ? 'line-through text-gray-400 dark:text-gray-500' : ''"
        >
          {{ event.player_name }}
        </p>
        <span
          v-if="developerName === 'PENALTY'"
          class="text-2xs font-bold px-1 py-px rounded bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 shrink-0 mt-0.5"
        >
          P
        </span>
      </div>
      <p class="text-2xs text-gray-500 dark:text-gray-400 break-words">
        {{ eventTitle }}
      </p>
      <p
        v-if="secondaryLine"
        class="text-2xs text-gray-400 dark:text-gray-500 break-words italic"
      >
        {{ secondaryLine }}
      </p>
    </div>
  </div>
</template>
