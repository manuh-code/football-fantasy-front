<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import type { FootballEventResponse } from "@/interfaces/football/event/FootballEventResponse";

interface Props {
  event: FootballEventResponse;
  side: "home" | "away";
}

const props = defineProps<Props>();

const { t } = useI18n();

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

// Event names, by `developer_name`. These used to be written in English inside
// this component, so a Spanish reader got "Yellow Card" under the player's name
// while the rest of the card was translated.
//
// The fallback is the API's own `type.name`, which arrives already translated by
// Accept-Language: a type this map doesn't know still reads correctly, and only
// a type with no name at all reaches the generic label.
const EVENT_TITLE_KEYS: Record<string, string> = {
  GOAL: "goal",
  PENALTY: "penalty",
  OWNGOAL: "ownGoal",
  MISSED_PENALTY: "missedPenalty",
  PENALTY_SHOOTOUT_GOAL: "shootoutGoal",
  PENALTY_SHOOTOUT_MISS: "shootoutMiss",
  YELLOWCARD: "yellowCard",
  REDCARD: "redCard",
  YELLOWREDCARD: "secondYellow",
  VAR_CARD: "varCard",
  SUBSTITUTION: "substitution",
  HIGHLIGHT: "highlight",
};

const eventTitle = computed(() => {
  // VAR carries its outcome in free text, not in the type, so it needs the extra
  // branch — see isCancelledPenalty.
  if (developerName.value === "VAR") {
    return t(`football.matchCenter.eventTypes.${isCancelledPenalty.value ? "varCancelled" : "var"}`);
  }

  const key = EVENT_TITLE_KEYS[developerName.value];
  if (key) return t(`football.matchCenter.eventTypes.${key}`);

  return props.event.type?.name ?? t("football.matchCenter.eventTypes.fallback");
});

const secondaryLine = computed<string | null>(() => {
  const dev = developerName.value;
  if (dev === "GOAL" || dev === "PENALTY") {
    const parts: string[] = [];
    if (props.event.related_player_name) {
      parts.push(t("football.matchCenter.assist", { player: props.event.related_player_name }));
    }
    // `info` is free text from SportMonks ("Right foot shot") and arrives
    // untranslated. Shown as-is because there is no catalogue to translate it
    // against, not because it was overlooked.
    if (props.event.info) parts.push(props.event.info);
    return parts.length ? parts.join(" • ") : null;
  }
  if (dev === "SUBSTITUTION") {
    return props.event.related_player_name
      ? t("football.matchCenter.subbedOff", { player: props.event.related_player_name })
      : null;
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
