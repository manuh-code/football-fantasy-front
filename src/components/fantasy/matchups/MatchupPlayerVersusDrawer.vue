<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { BottomSheet } from "@/components/ui";
import NationalityBadge from "@/components/football/ui/NationalityBadge.vue";
import PlayerVersusRadar from "@/components/football/player/versus/PlayerVersusRadar.vue";
import { usePositionShortCode } from "@/composables/usePositionShortCode";
import { footballPlayerService } from "@/services/football/player/FootballPlayerService";
import type { FantasyFootballPlayer } from "@/interfaces/user/fantasy/FantasyFootballPlayersResponse";
import type { FantasyPlayerScoreVersusResponse } from "@/interfaces/fantasy/score/FantasyPlayerScoreVersusResponse";

interface Props {
  modelValue: boolean;
  leagueUuid: string;
  roundUuid: string;
  /** Home player — side "one" (emerald). Seeds the header instantly, before the fetch lands. */
  playerOne: FantasyFootballPlayer | null;
  /** Away player — side "two" (sky). */
  playerTwo: FantasyFootballPlayer | null;
}

const props = defineProps<Props>();
const emit = defineEmits<{ "update:modelValue": [value: boolean] }>();

const { t } = useI18n();
const positionShort = usePositionShortCode();

// Both sides share the palette the standalone player-versus feature already uses,
// so "emerald = the one on the left, sky = the one on the right" stays consistent.
const COLOR_ONE = "#10b981"; // emerald-500
const COLOR_TWO = "#0ea5e9"; // sky-500
const RADAR_MAX_AXES = 8; // radar stays legible up to ~8 axes

const isLoading = ref(false);
const error = ref<string | null>(null);
const detail = ref<FantasyPlayerScoreVersusResponse | null>(null);

// ── Header identity: prefer the lineup seed (instant + carries the team crest,
//    which the response's football_player object does not), fall back to the fetch.
const oneName = computed(
  () => props.playerOne?.football_player?.display_name ?? detail.value?.player_one.player.display_name ?? "",
);
const twoName = computed(
  () => props.playerTwo?.football_player?.display_name ?? detail.value?.player_two.player.display_name ?? "",
);
const oneImage = computed(
  () => props.playerOne?.football_player?.image_path || detail.value?.player_one.player.image_path || "/img/default-avatar.svg",
);
const twoImage = computed(
  () => props.playerTwo?.football_player?.image_path || detail.value?.player_two.player.image_path || "/img/default-avatar.svg",
);
const onePosDev = computed(
  () => props.playerOne?.position?.developer_name ?? detail.value?.player_one.player.position?.developer_name ?? "",
);
const twoPosDev = computed(
  () => props.playerTwo?.position?.developer_name ?? detail.value?.player_two.player.position?.developer_name ?? "",
);
const oneCountry = computed(() => props.playerOne?.football_player?.country ?? detail.value?.player_one.player.country ?? null);
const twoCountry = computed(() => props.playerTwo?.football_player?.country ?? detail.value?.player_two.player.country ?? null);

const roundSubtitle = computed(() => {
  const name = detail.value?.round?.round?.name;
  return name ? t("fantasy.matchups.roundFallback") + " " + name : "";
});

// ── Headline totals — the round total falls back to the lineup points until the fetch lands.
const oneTotal = computed(() => detail.value?.summary.one_total ?? props.playerOne?.fantasy_points ?? 0);
const twoTotal = computed(() => detail.value?.summary.two_total ?? props.playerTwo?.fantasy_points ?? 0);
const leader = computed(() => {
  if (detail.value) return detail.value.summary.leader;
  if (oneTotal.value > twoTotal.value) return "one";
  if (twoTotal.value > oneTotal.value) return "two";
  return null;
});
const difference = computed(() => detail.value?.summary.difference ?? Math.abs(oneTotal.value - twoTotal.value));

// Win-share bar — clamps negatives so a red-card total never flips the split.
const dominance = computed(() => {
  const a = Math.max(0, oneTotal.value);
  const b = Math.max(0, twoTotal.value);
  const sum = a + b;
  return sum > 0 ? (a / sum) * 100 : 50;
});

// ── Radar: top scoring stats, each axis normalized to the higher of the two so
//    the axis leader hits 100 (raw points across stat types aren't comparable).
const radar = computed(() => {
  const stats = detail.value?.stats ?? [];
  const usable = stats
    .filter((s) => Math.max(0, s.one.points) > 0 || Math.max(0, s.two.points) > 0)
    .slice(0, RADAR_MAX_AXES);
  const labels: string[] = [];
  const valuesA: number[] = [];
  const valuesB: number[] = [];
  for (const s of usable) {
    const a = Math.max(0, s.one.points);
    const b = Math.max(0, s.two.points);
    const max = Math.max(a, b);
    labels.push(s.type.name);
    valuesA.push(max > 0 ? Math.round((a / max) * 100) : 0);
    valuesB.push(max > 0 ? Math.round((b / max) * 100) : 0);
  }
  return { labels, valuesA, valuesB };
});

const hasStats = computed(() => (detail.value?.stats.length ?? 0) > 0);
const hasFixtures = computed(
  () => !!detail.value && (detail.value.player_one.fixtures.length > 0 || detail.value.player_two.fixtures.length > 0),
);
const isEmpty = computed(() => !!detail.value && !hasStats.value && !hasFixtures.value);

function positionBadgeClass(dev: string): string {
  const map: Record<string, string> = {
    GOALKEEPER: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
    DEFENDER: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
    MIDFIELDER: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400",
    ATTACKER: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400",
    FLEX: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400",
  };
  return map[dev] ?? "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400";
}

/** Trim floats to at most 2 decimals; keep integers clean. */
function fmt(n: number): string {
  return Number.isInteger(n) ? String(n) : Number(n.toFixed(2)).toString();
}
function signed(n: number): string {
  return n > 0 ? `+${fmt(n)}` : fmt(n);
}
/** Mirrored-bar width: share of the larger of the two point totals (negatives → 0). */
function barPct(points: number, other: number): number {
  const v = Math.max(0, points);
  const max = Math.max(v, Math.max(0, other));
  return max > 0 ? (v / max) * 100 : 0;
}

async function load() {
  const oneUuid = props.playerOne?.football_player?.uuid;
  const twoUuid = props.playerTwo?.football_player?.uuid;
  if (!props.leagueUuid || !props.roundUuid || !oneUuid || !twoUuid) return;

  isLoading.value = true;
  error.value = null;
  try {
    const response = await footballPlayerService.getPlayerFantasyScoreVersus(
      props.leagueUuid,
      props.roundUuid,
      oneUuid,
      twoUuid,
    );
    detail.value = response.data;
  } catch (e) {
    error.value = e instanceof Error ? e.message : t("fantasy.matchups.versus.loadError");
    console.error("Error loading player versus score:", e);
  } finally {
    isLoading.value = false;
  }
}

function close() {
  emit("update:modelValue", false);
}

// Fetch on open; clear on close so a reopened duel never flashes the previous pair.
watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      load();
    } else {
      detail.value = null;
      error.value = null;
    }
  },
);
</script>

<template>
  <BottomSheet
    :is-visible="modelValue"
    size="xl"
    icon="md-comparearrows-round"
    icon-variant="emerald"
    :title="$t('fantasy.matchups.versus.title')"
    :subtitle="roundSubtitle"
    @close="close"
  >
    <!-- ── Scoreboard hero: two players face off around a VS medallion ── -->
    <div class="grid grid-cols-[1fr_auto_1fr] items-start gap-1.5 sm:gap-3">
      <!-- Player one (emerald) -->
      <div class="flex flex-col items-center text-center gap-1 min-w-0">
        <span class="rounded-full ring-2 ring-offset-2 ring-offset-white dark:ring-offset-gray-900" :style="{ '--tw-ring-color': COLOR_ONE }">
          <img :src="oneImage" :alt="oneName" class="w-14 h-14 rounded-full object-cover" />
        </span>
        <p class="mt-1 text-footnote font-bold text-gray-900 dark:text-white truncate max-w-full">{{ oneName }}</p>
        <div class="flex items-center justify-center gap-1 flex-wrap">
          <span class="inline-flex items-center justify-center px-1.5 py-0.5 rounded text-2xs font-bold" :class="positionBadgeClass(onePosDev)">
            {{ positionShort(onePosDev) }}
          </span>
          <img v-if="playerOne?.team" :src="playerOne.team.image_path" :alt="playerOne.team.short_code" class="w-3.5 h-3.5 object-contain" />
          <NationalityBadge :country="oneCountry" />
        </div>
        <p class="mt-1 text-3xl font-black tabular-nums leading-none" :style="{ color: COLOR_ONE }">{{ fmt(oneTotal) }}</p>
        <p class="text-2xs uppercase tracking-wide text-gray-400 dark:text-gray-500">{{ $t('fantasy.matchups.versus.pts') }}</p>
      </div>

      <!-- Center: VS medallion + directional lead margin -->
      <div class="flex flex-col items-center justify-center gap-1.5 pt-7">
        <span
          class="relative grid place-items-center w-12 h-12 rounded-full shrink-0 shadow-md"
          :style="{ background: `conic-gradient(${COLOR_ONE} 0deg 180deg, ${COLOR_TWO} 180deg 360deg)` }"
        >
          <span class="absolute inset-[3px] rounded-full bg-white dark:bg-gray-900 grid place-items-center">
            <span class="text-2xs font-extrabold tracking-[0.12em] text-gray-700 dark:text-gray-200">VS</span>
          </span>
        </span>
        <!-- Leader margin: the arrow points at the winning side (meaning isn't carried by color alone) -->
        <span
          v-if="leader"
          class="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-2xs font-extrabold tabular-nums whitespace-nowrap"
          :style="{ color: leader === 'one' ? COLOR_ONE : COLOR_TWO }"
        >
          <v-icon :name="leader === 'one' ? 'hi-solid-arrow-left' : 'hi-solid-arrow-right'" class="w-2.5 h-2.5" />
          +{{ fmt(difference) }}
        </span>
        <span v-else class="px-1.5 py-0.5 rounded-full text-2xs font-bold text-gray-400 dark:text-gray-500">
          {{ $t('fantasy.matchups.versus.tie') }}
        </span>
      </div>

      <!-- Player two (sky) -->
      <div class="flex flex-col items-center text-center gap-1 min-w-0">
        <span class="rounded-full ring-2 ring-offset-2 ring-offset-white dark:ring-offset-gray-900" :style="{ '--tw-ring-color': COLOR_TWO }">
          <img :src="twoImage" :alt="twoName" class="w-14 h-14 rounded-full object-cover" />
        </span>
        <p class="mt-1 text-footnote font-bold text-gray-900 dark:text-white truncate max-w-full">{{ twoName }}</p>
        <div class="flex items-center justify-center gap-1 flex-wrap">
          <span class="inline-flex items-center justify-center px-1.5 py-0.5 rounded text-2xs font-bold" :class="positionBadgeClass(twoPosDev)">
            {{ positionShort(twoPosDev) }}
          </span>
          <img v-if="playerTwo?.team" :src="playerTwo.team.image_path" :alt="playerTwo.team.short_code" class="w-3.5 h-3.5 object-contain" />
          <NationalityBadge :country="twoCountry" />
        </div>
        <p class="mt-1 text-3xl font-black tabular-nums leading-none" :style="{ color: COLOR_TWO }">{{ fmt(twoTotal) }}</p>
        <p class="text-2xs uppercase tracking-wide text-gray-400 dark:text-gray-500">{{ $t('fantasy.matchups.versus.pts') }}</p>
      </div>
    </div>

    <!-- Win-share bar: the split of total points between the two -->
    <div class="mt-4 flex h-2 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800">
      <div class="h-full transition-all duration-500" :style="{ width: `${dominance}%`, backgroundColor: COLOR_ONE }" />
      <div class="h-full flex-1 transition-all duration-500" :style="{ backgroundColor: COLOR_TWO }" />
    </div>

    <!-- ── Loading skeleton ── -->
    <div v-if="isLoading" class="mt-6 space-y-6 animate-pulse">
      <div class="flex justify-center">
        <div class="w-[220px] h-[220px] rounded-full bg-gray-100 dark:bg-gray-800" />
      </div>
      <div class="space-y-4">
        <div v-for="i in 5" :key="i">
          <div class="flex justify-center mb-1.5">
            <div class="h-2.5 w-24 rounded-full bg-gray-100 dark:bg-gray-800" />
          </div>
          <div class="flex items-center gap-2">
            <div class="w-12 h-4 rounded bg-gray-200 dark:bg-gray-700 shrink-0" />
            <div class="flex-1 flex items-center gap-1">
              <div class="flex-1 h-1.5 rounded-full bg-gray-100 dark:bg-gray-800" />
              <div class="flex-1 h-1.5 rounded-full bg-gray-100 dark:bg-gray-800" />
            </div>
            <div class="w-12 h-4 rounded bg-gray-200 dark:bg-gray-700 shrink-0" />
          </div>
        </div>
      </div>
    </div>

    <!-- ── Error ── -->
    <div v-else-if="error" class="mt-8 py-8 text-center">
      <v-icon name="hi-solid-exclamation-circle" class="w-8 h-8 text-red-400 mx-auto mb-3" />
      <p class="text-footnote text-red-500 dark:text-red-400 mb-4">{{ error }}</p>
      <button
        type="button"
        class="px-4 py-1.5 bg-red-500 text-white rounded-full text-footnote font-medium active:bg-red-600 transition-colors"
        @click="load"
      >
        {{ $t('fantasy.matchups.versus.retry') }}
      </button>
    </div>

    <!-- ── Empty ── -->
    <div v-else-if="isEmpty" class="mt-8 py-8 text-center">
      <div class="w-14 h-14 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-3">
        <v-icon name="hi-solid-chart-bar" class="w-7 h-7 text-gray-400 dark:text-gray-500" />
      </div>
      <h3 class="text-callout font-semibold text-gray-900 dark:text-white mb-1">{{ $t('fantasy.matchups.versus.noData') }}</h3>
      <p class="text-footnote text-gray-400 dark:text-gray-500 max-w-xs mx-auto">{{ $t('fantasy.matchups.versus.noDataBody') }}</p>
    </div>

    <!-- ── Comparison ── -->
    <template v-else-if="detail">
      <!-- Radar: points profile -->
      <section v-if="radar.labels.length >= 3" class="mt-6">
        <div class="flex items-center gap-2 mb-1">
          <v-icon name="hi-solid-chart-bar" class="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400 shrink-0" />
          <h3 class="text-2xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
            {{ $t('fantasy.matchups.versus.pointsProfile') }}
          </h3>
        </div>
        <p class="text-2xs text-gray-400 dark:text-gray-500 mb-2">{{ $t('fantasy.matchups.versus.pointsProfileHint') }}</p>
        <!-- Legend -->
        <div class="flex items-center justify-center gap-4 mb-1">
          <span class="flex items-center gap-1.5 min-w-0">
            <span class="w-2.5 h-2.5 rounded-full shrink-0" :style="{ backgroundColor: COLOR_ONE }" />
            <span class="text-2xs font-semibold text-gray-700 dark:text-gray-200 truncate">{{ oneName }}</span>
          </span>
          <span class="flex items-center gap-1.5 min-w-0">
            <span class="w-2.5 h-2.5 rounded-full shrink-0" :style="{ backgroundColor: COLOR_TWO }" />
            <span class="text-2xs font-semibold text-gray-700 dark:text-gray-200 truncate">{{ twoName }}</span>
          </span>
        </div>
        <PlayerVersusRadar
          :labels="radar.labels"
          :dataset-a="{ name: oneName, values: radar.valuesA, color: COLOR_ONE }"
          :dataset-b="{ name: twoName, values: radar.valuesB, color: COLOR_TWO }"
        />
      </section>

      <!-- Per-stat breakdown: the precise, at-a-glance ledger behind the radar -->
      <section v-if="hasStats" class="mt-6">
        <div class="flex items-center gap-2 mb-3">
          <v-icon name="hi-solid-adjustments" class="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400 shrink-0" />
          <h3 class="text-2xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
            {{ $t('fantasy.matchups.versus.breakdown') }}
          </h3>
        </div>

        <div class="space-y-3.5">
          <div v-for="stat in detail.stats" :key="stat.type.uuid">
            <p class="text-center text-2xs font-medium text-gray-500 dark:text-gray-400 mb-1">{{ stat.type.name }}</p>
            <div class="flex items-center gap-2">
              <!-- One side: points (bold, colored when leading) + raw value -->
              <div class="w-14 text-right shrink-0 leading-tight">
                <span
                  class="text-xs font-extrabold tabular-nums"
                  :class="stat.leader === 'one' ? '' : 'text-gray-400 dark:text-gray-500'"
                  :style="stat.leader === 'one' ? { color: COLOR_ONE } : {}"
                >{{ signed(stat.one.points) }}</span>
                <span class="block text-[10px] tabular-nums text-gray-400 dark:text-gray-500">{{ fmt(stat.one.value) }}</span>
              </div>
              <!-- Mirrored bars, sized by points -->
              <div class="flex-1 flex items-center gap-1">
                <div class="flex-1 h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden flex justify-end">
                  <div class="h-full rounded-full transition-all duration-300" :style="{ width: `${barPct(stat.one.points, stat.two.points)}%`, backgroundColor: COLOR_ONE }" />
                </div>
                <div class="flex-1 h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                  <div class="h-full rounded-full transition-all duration-300" :style="{ width: `${barPct(stat.two.points, stat.one.points)}%`, backgroundColor: COLOR_TWO }" />
                </div>
              </div>
              <!-- Two side -->
              <div class="w-14 text-left shrink-0 leading-tight">
                <span
                  class="text-xs font-extrabold tabular-nums"
                  :class="stat.leader === 'two' ? '' : 'text-gray-400 dark:text-gray-500'"
                  :style="stat.leader === 'two' ? { color: COLOR_TWO } : {}"
                >{{ signed(stat.two.points) }}</span>
                <span class="block text-[10px] tabular-nums text-gray-400 dark:text-gray-500">{{ fmt(stat.two.value) }}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Fixtures behind each score -->
      <section v-if="hasFixtures" class="mt-6">
        <div class="flex items-center gap-2 mb-3">
          <v-icon name="hi-solid-calendar" class="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400 shrink-0" />
          <h3 class="text-2xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
            {{ $t('fantasy.matchups.versus.fixtures') }}
          </h3>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div v-for="(side, i) in [detail.player_one, detail.player_two]" :key="i" class="min-w-0">
            <div class="flex items-center gap-1.5 mb-1.5">
              <span class="w-2 h-2 rounded-full shrink-0" :style="{ backgroundColor: i === 0 ? COLOR_ONE : COLOR_TWO }" />
              <span class="text-2xs font-semibold text-gray-700 dark:text-gray-200 truncate">{{ i === 0 ? oneName : twoName }}</span>
            </div>
            <ul class="space-y-1.5">
              <li
                v-for="fx in side.fixtures"
                :key="fx.uuid"
                class="rounded-lg bg-gray-50 dark:bg-gray-800/60 px-2 py-1.5"
              >
                <p class="text-2xs font-medium text-gray-800 dark:text-gray-200 leading-tight break-words">{{ fx.name }}</p>
                <p v-if="fx.starting_at" class="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">{{ fx.starting_at }}</p>
              </li>
              <li v-if="!side.fixtures.length" class="text-2xs text-gray-400 dark:text-gray-500 px-2 py-1.5">—</li>
            </ul>
          </div>
        </div>
      </section>
    </template>
  </BottomSheet>
</template>
