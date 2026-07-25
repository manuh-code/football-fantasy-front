<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { FootballNextFixtureResponse } from "@/interfaces/football/fixture/FootballNextFixtureResponse";

interface Props {
  fixture: FootballNextFixtureResponse | null | undefined;
}

const props = defineProps<Props>();
const { locale, t } = useI18n();

const homeParticipant = computed(() =>
  props.fixture?.participants?.find(p => p.meta?.location === "home") ?? null,
);

const awayParticipant = computed(() =>
  props.fixture?.participants?.find(p => p.meta?.location === "away") ?? null,
);

const homeScore = computed(() =>
  props.fixture?.scores?.find(s => s.score.participant === "home") ?? null,
);

const awayScore = computed(() =>
  props.fixture?.scores?.find(s => s.score.participant === "away") ?? null,
);

const hasScore = computed(() => homeScore.value != null && awayScore.value != null);

// Kickoff shown only before the match has a result, so the row answers "when
// does my player play next?". Falls back to nothing if the date is unparseable.
const kickoff = computed(() => {
  const raw = props.fixture?.starting_at;
  if (!raw) return "";
  const date = new Date(raw.replace(" ", "T"));
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(locale.value === "es" ? "es-MX" : "en-US", {
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
});

// Accessible summary for screen readers / hover.
const ariaLabel = computed(() => {
  const home = homeParticipant.value?.short_code || homeParticipant.value?.name || "";
  const away = awayParticipant.value?.short_code || awayParticipant.value?.name || "";
  if (!home || !away) return "";
  if (hasScore.value) {
    return `${home} ${homeScore.value!.score.goals} - ${awayScore.value!.score.goals} ${away}`;
  }
  return `${home} ${t("fantasy.lineup.vs")} ${away}${kickoff.value ? ` · ${kickoff.value}` : ""}`;
});
</script>

<template>
  <span
    v-if="fixture && homeParticipant && awayParticipant"
    class="inline-flex items-center gap-1 px-1.5 py-0.5 bg-gray-100/80 dark:bg-gray-700/50 rounded-md ring-1 ring-black/5 dark:ring-white/10"
    :title="ariaLabel"
    :aria-label="ariaLabel"
  >
    <!-- Kickoff time — only while the match has no result yet -->
    <span
      v-if="!hasScore && kickoff"
      class="text-2xs font-medium text-gray-500 dark:text-gray-400 leading-none whitespace-nowrap"
    >{{ kickoff }}</span>

    <img
      :src="homeParticipant.image_path || '/img/default-avatar.svg'"
      :alt="homeParticipant.short_code"
      class="w-3.5 h-3.5 rounded-full object-contain shrink-0"
      loading="lazy"
    />

    <template v-if="hasScore">
      <span class="text-2xs font-bold text-gray-800 dark:text-gray-100 tabular-nums leading-none">{{ homeScore!.score.goals }}</span>
      <span class="text-2xs text-gray-400 dark:text-gray-500 leading-none">-</span>
      <span class="text-2xs font-bold text-gray-800 dark:text-gray-100 tabular-nums leading-none">{{ awayScore!.score.goals }}</span>
    </template>
    <span v-else class="text-2xs font-medium text-gray-400 dark:text-gray-500 leading-none">{{ t("fantasy.lineup.vs") }}</span>

    <img
      :src="awayParticipant.image_path || '/img/default-avatar.svg'"
      :alt="awayParticipant.short_code"
      class="w-3.5 h-3.5 rounded-full object-contain shrink-0"
      loading="lazy"
    />
  </span>
</template>
