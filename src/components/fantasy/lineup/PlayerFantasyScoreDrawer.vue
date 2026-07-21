<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { BottomSheet } from "@/components/ui";
import NationalityBadge from "@/components/football/ui/NationalityBadge.vue";
import { usePositionShortCode } from "@/composables/usePositionShortCode";
import { fantasyLeagueService } from "@/services/fantasy/leagues/FantasyLeagueService";
import type { FantasyFootballPlayer } from "@/interfaces/user/fantasy/FantasyFootballPlayersResponse";
import type { PlayerFantasyScoreDetailResponse } from "@/interfaces/fantasy/score/PlayerFantasyScoreDetailResponse";

interface Props {
  modelValue: boolean;
  leagueUuid: string;
  roundUuid: string;
  /** The lineup player — drives the header + supplies the football_player uuid. */
  player: FantasyFootballPlayer | null;
}

const props = defineProps<Props>();
const emit = defineEmits<{ "update:modelValue": [value: boolean] }>();

const { t } = useI18n();
const positionShort = usePositionShortCode();

const isLoading = ref(false);
const error = ref<string | null>(null);
const detail = ref<PlayerFantasyScoreDetailResponse | null>(null);

// Header identity comes from the lineup player immediately (no wait); the big
// number falls back to the lineup's fantasy_points until the fetch lands —
// total_points is now the single source of truth (== the lineup/matchup total).
const playerName = computed(() => props.player?.football_player?.display_name ?? "");
const playerImage = computed(() => props.player?.football_player?.image_path || "/img/default-avatar.svg");
const positionDev = computed(() => props.player?.position?.developer_name ?? "");
const totalPoints = computed(() => detail.value?.total_points ?? props.player?.fantasy_points ?? 0);

const roundName = computed(() => detail.value?.round?.round?.name ?? "");
const isRoundCompleted = computed(() => detail.value?.round?.is_completed ?? false);

/** No fixtures, or fixtures that carry no stat lines at all. */
const isEmpty = computed(
  () => !!detail.value && !detail.value.fixtures.some((f) => f.stats.length > 0),
);

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

function pointsClass(points: number): string {
  if (points > 0) return "text-emerald-600 dark:text-emerald-400";
  if (points < 0) return "text-rose-600 dark:text-rose-400";
  return "text-gray-400 dark:text-gray-500";
}

async function load() {
  const playerUuid = props.player?.football_player?.uuid;
  if (!props.leagueUuid || !props.roundUuid || !playerUuid) return;

  isLoading.value = true;
  error.value = null;
  try {
    detail.value = await fantasyLeagueService.getPlayerFantasyScore(
      props.leagueUuid,
      props.roundUuid,
      playerUuid,
    );
  } catch (e) {
    error.value = e instanceof Error ? e.message : t("fantasy.playerScore.loadError");
    console.error("Error loading player fantasy score:", e);
  } finally {
    isLoading.value = false;
  }
}

function close() {
  emit("update:modelValue", false);
}

// Fetch on open; clear on close so a reopened drawer never flashes stale data.
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
  <BottomSheet :is-visible="modelValue" size="lg" @close="close">
    <!-- Header: player identity + the round's total points -->
    <template #header>
      <div v-if="player" class="flex items-center gap-3 w-full">
        <img
          :src="playerImage"
          :alt="playerName"
          class="w-11 h-11 rounded-full object-cover border border-gray-200 dark:border-gray-600 shrink-0"
        />
        <div class="flex-1 min-w-0">
          <p class="text-base font-bold text-gray-900 dark:text-white truncate">{{ playerName }}</p>
          <div class="flex items-center gap-1.5 mt-0.5">
            <span
              class="inline-flex items-center justify-center px-1.5 py-0.5 rounded text-2xs font-bold shrink-0"
              :class="positionBadgeClass(positionDev)"
            >
              {{ positionShort(positionDev) }}
            </span>
            <img
              v-if="player.team"
              :src="player.team.image_path"
              :alt="player.team.short_code"
              class="w-3.5 h-3.5 object-contain shrink-0"
            />
            <span v-if="player.team" class="text-2xs text-gray-400 dark:text-gray-500 truncate">
              {{ player.team.short_code }}
            </span>
            <NationalityBadge :country="player.football_player?.country" />
          </div>
        </div>
        <!-- Total points -->
        <div class="text-right shrink-0">
          <p class="text-2xl font-black tabular-nums leading-none text-amber-600 dark:text-amber-400">
            {{ fmt(totalPoints) }}
          </p>
          <p class="text-2xs text-gray-400 dark:text-gray-500 mt-0.5 uppercase tracking-wide">
            {{ $t('fantasy.playerScore.pts') }}
          </p>
        </div>
      </div>
    </template>

    <!-- ── Loading skeleton ── -->
    <div v-if="isLoading" class="space-y-4 animate-pulse">
      <div class="flex items-center justify-between">
        <div class="h-4 w-24 rounded-full bg-gray-200 dark:bg-gray-700" />
        <div class="h-5 w-16 rounded-full bg-gray-100 dark:bg-gray-700/60" />
      </div>
      <div
        v-for="n in 2"
        :key="n"
        class="rounded-2xl border border-gray-100 dark:border-gray-700/60 overflow-hidden"
      >
        <div class="flex items-center justify-between gap-2 px-4 py-3 bg-gray-50/70 dark:bg-gray-800/60">
          <div class="space-y-1.5">
            <div class="h-3 w-40 rounded-full bg-gray-200 dark:bg-gray-700" />
            <div class="h-2 w-24 rounded-full bg-gray-100 dark:bg-gray-700/60" />
          </div>
          <div class="h-6 w-12 rounded-lg bg-gray-200 dark:bg-gray-700" />
        </div>
        <div class="divide-y divide-gray-50 dark:divide-gray-700/40">
          <div v-for="r in 4" :key="r" class="flex items-center justify-between gap-3 px-4 py-2.5">
            <div class="h-3 rounded-full bg-gray-200 dark:bg-gray-700" :style="{ width: `${40 + (r * 13) % 30}%` }" />
            <div class="flex items-center gap-2 shrink-0">
              <div class="h-2.5 w-12 rounded-full bg-gray-100 dark:bg-gray-700/60" />
              <div class="h-4 w-8 rounded bg-gray-200 dark:bg-gray-700" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Error ── -->
    <div v-else-if="error" class="py-10 text-center">
      <v-icon name="hi-solid-exclamation-circle" class="w-8 h-8 text-red-400 mx-auto mb-3" />
      <p class="text-footnote text-red-500 dark:text-red-400 mb-4">{{ error }}</p>
      <button
        type="button"
        class="px-4 py-1.5 bg-red-500 text-white rounded-full text-footnote font-medium active:bg-red-600 transition-colors"
        @click="load"
      >
        {{ $t('fantasy.playerScore.retry') }}
      </button>
    </div>

    <!-- ── Detail ── -->
    <template v-else-if="detail">
      <!-- Round context -->
      <div class="flex items-center justify-between gap-2 mb-4">
        <span class="text-callout font-semibold text-gray-900 dark:text-white">
          {{ $t('fantasy.playerScore.roundLabel', { name: roundName }) }}
        </span>
        <span
          class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-2xs font-bold uppercase tracking-wide"
          :class="isRoundCompleted
            ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
            : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'"
        >
          <v-icon :name="isRoundCompleted ? 'hi-solid-check-circle' : 'hi-solid-clock'" class="w-3 h-3" />
          {{ isRoundCompleted ? $t('fantasy.playerScore.roundCompleted') : $t('fantasy.playerScore.roundOngoing') }}
        </span>
      </div>

      <!-- Empty state -->
      <div v-if="isEmpty" class="py-10 text-center">
        <div class="w-14 h-14 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-3">
          <v-icon name="hi-solid-chart-bar" class="w-7 h-7 text-gray-400 dark:text-gray-500" />
        </div>
        <h3 class="text-callout font-semibold text-gray-900 dark:text-white mb-1">
          {{ $t('fantasy.playerScore.noData') }}
        </h3>
        <p class="text-footnote text-gray-400 dark:text-gray-500 max-w-xs mx-auto">
          {{ $t('fantasy.playerScore.noDataBody') }}
        </p>
      </div>

      <!-- Fixtures: each a ledger card -->
      <div v-else class="space-y-4">
        <div
          v-for="(fx, i) in detail.fixtures"
          :key="fx.fixture?.uuid ?? i"
          class="rounded-2xl border border-gray-100 dark:border-gray-700/60 overflow-hidden"
        >
          <!-- Fixture header + subtotal -->
          <div class="flex items-center justify-between gap-2 px-4 py-3 bg-gray-50/70 dark:bg-gray-800/60 border-b border-gray-100 dark:border-gray-700/60">
            <div class="min-w-0">
              <p class="text-footnote font-semibold text-gray-900 dark:text-white truncate">
                {{ fx.fixture?.name ?? '—' }}
              </p>
              <p v-if="fx.fixture?.starting_at" class="text-2xs text-gray-400 dark:text-gray-500 mt-0.5">
                {{ fx.fixture.starting_at }}
              </p>
            </div>
            <span
              class="inline-flex items-center px-2 py-1 rounded-lg text-footnote font-extrabold tabular-nums shrink-0"
              :class="pointsClass(fx.total_points)"
            >
              {{ signed(fx.total_points) }}
            </span>
          </div>

          <!-- Stat ledger rows: value × points_per_unit = points -->
          <div class="divide-y divide-gray-50 dark:divide-gray-700/40">
            <div
              v-for="(stat, s) in fx.stats"
              :key="stat.type?.uuid ?? s"
              class="flex items-center justify-between gap-3 px-4 py-2.5"
            >
              <p class="text-footnote text-gray-700 dark:text-gray-300 truncate">
                {{ stat.type?.name }}
              </p>
              <div class="flex items-center gap-2 shrink-0">
                <!-- The equation — the signature: every point traces to a stat -->
                <span class="text-2xs tabular-nums text-gray-400 dark:text-gray-500">
                  {{ fmt(stat.value) }}
                  <span class="text-gray-300 dark:text-gray-600">×</span>
                  {{ fmt(stat.points_per_unit) }}
                </span>
                <span
                  class="min-w-[2.75rem] text-right text-footnote font-bold tabular-nums"
                  :class="pointsClass(stat.points)"
                >
                  {{ signed(stat.points) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </BottomSheet>
</template>
