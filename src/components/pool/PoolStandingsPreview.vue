<template>
  <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 overflow-hidden">
    <!-- Header — doubles as the shortcut into the full Standings tab -->
    <button
      type="button"
      class="w-full flex items-center justify-between gap-2 px-4 py-3.5 border-b border-gray-50 dark:border-gray-700/40 active:bg-gray-50 dark:active:bg-gray-700/30 transition-colors"
      @click="emit('view-full')"
    >
      <span class="flex items-center gap-2 text-callout font-semibold text-gray-900 dark:text-white">
        <span class="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
          <v-icon name="bi-trophy-fill" class="w-3.5 h-3.5 text-amber-500" />
        </span>
        {{ $t('pool.group.generalStandings') }}
      </span>
      <span class="flex items-center gap-0.5 text-2xs font-semibold text-amber-600 dark:text-amber-400 shrink-0">
        {{ $t('pool.group.viewFullStandings') }}
        <v-icon name="hi-solid-chevron-right" class="w-3 h-3" />
      </span>
    </button>

    <!-- Loading skeleton — three podium placeholders -->
    <div v-if="loading" class="flex items-end justify-center gap-5 px-4 pt-5 pb-4">
      <div v-for="n in 3" :key="n" class="flex flex-col items-center gap-1.5" :class="n === 2 ? '-mt-3' : ''">
        <div class="rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" :class="n === 2 ? 'w-16 h-16' : 'w-12 h-12'" />
        <div class="h-2.5 w-12 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
        <div class="h-2 w-8 rounded-full bg-gray-100 dark:bg-gray-700/60 animate-pulse" />
      </div>
    </div>

    <!-- Empty — quiet placeholder, the shortcut above still works -->
    <div v-else-if="podium.length === 0" class="px-4 py-6 text-center">
      <p class="text-footnote text-gray-400 dark:text-gray-500">{{ $t('pool.group.noStandingsYet') }}</p>
    </div>

    <!-- Podium: 2nd · 1st (elevated) · 3rd -->
    <div v-else class="flex items-end justify-center gap-5 sm:gap-8 px-4 pt-5 pb-4">
      <div
        v-for="slot in podium"
        :key="slot.entry.user.uuid || slot.entry.rank"
        class="flex flex-col items-center gap-1.5 w-20"
        :class="slot.isCenter ? '-mt-3' : ''"
      >
        <div class="relative">
          <v-icon
            v-if="slot.isCenter"
            name="hi-solid-star"
            class="absolute -top-4 left-1/2 -translate-x-1/2 w-4 h-4 text-amber-400"
          />
          <img
            v-if="slot.entry.user.avatar"
            :src="slot.entry.user.avatar"
            :alt="memberName(slot.entry.user)"
            class="rounded-full object-cover ring-2"
            :class="[slot.isCenter ? 'w-16 h-16 ring-amber-400' : 'w-12 h-12 ring-gray-100 dark:ring-gray-700']"
          />
          <div
            v-else
            class="rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center ring-2"
            :class="[slot.isCenter ? 'w-16 h-16 ring-amber-400' : 'w-12 h-12 ring-gray-100 dark:ring-gray-700']"
          >
            <span class="font-semibold text-white" :class="slot.isCenter ? 'text-sm' : 'text-xs'">
              {{ memberInitials(slot.entry.user) }}
            </span>
          </div>
          <span
            class="absolute -bottom-1 -right-1 flex items-center justify-center w-5 h-5 rounded-full text-2xs font-bold ring-2 ring-white dark:ring-gray-800"
            :class="rankBadgeClasses(slot.entry.rank)"
          >
            {{ slot.entry.rank }}
          </span>
        </div>
        <p class="text-2xs font-semibold text-gray-900 dark:text-white text-center truncate w-full">
          {{ memberName(slot.entry.user) }}
        </p>
        <p class="text-2xs font-bold text-amber-600 dark:text-amber-400 tabular-nums">
          {{ slot.entry.points }} <span class="font-normal text-gray-400 dark:text-gray-500">{{ $t('pool.standing.pts') }}</span>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { poolService } from "@/services/pool/poolService";
import type { PoolStandingResponse } from "@/interfaces/pool/PoolStandingResponse";
import type { UserDataInterface } from "@/interfaces/user/userInterface";

const props = defineProps<{ poolGroupUuid: string }>();
const emit = defineEmits<{ "view-full": [] }>();

const { t } = useI18n();

const loading = ref(false);
const standings = ref<PoolStandingResponse[]>([]);

interface RankedEntry extends PoolStandingResponse {
  rank: number;
}

// Top 3 by points, sharing rank on ties (same competition-ranking rule as
// the full Standings tab — see PoolStandingComponent.rankedStandings).
const top3 = computed<RankedEntry[]>(() => {
  const sorted = [...standings.value].sort((a, b) => b.points - a.points).slice(0, 3);
  let lastPoints: number | null = null;
  let lastRank = 0;
  return sorted.map((entry, i) => {
    const rank = lastPoints !== null && entry.points === lastPoints ? lastRank : i + 1;
    lastPoints = entry.points;
    lastRank = rank;
    return { ...entry, rank };
  });
});

// Podium slot order — 2nd (left) · 1st (center, elevated) · 3rd (right) —
// built from array position (not the numeric rank) so tied scores still
// render as a normal three-column podium.
const podium = computed(() => {
  const [first, second, third] = top3.value;
  return [
    second && { entry: second, isCenter: false },
    first && { entry: first, isCenter: true },
    third && { entry: third, isCenter: false },
  ].filter((slot): slot is { entry: RankedEntry; isCenter: boolean } => !!slot);
});

const memberName = (member: UserDataInterface): string => {
  const full = [member.firstname, member.lastname].filter(Boolean).join(" ").trim();
  return full || member.email || t("pool.standing.unknownPlayer");
};

const memberInitials = (member: UserDataInterface): string => {
  const first = member.firstname?.[0] || "";
  const last = member.lastname?.[0] || "";
  const initials = (first + last).toUpperCase();
  return initials || member.email?.[0]?.toUpperCase() || "?";
};

const rankBadgeClasses = (rank: number): string => {
  if (rank === 1) return "bg-amber-400 text-white";
  if (rank === 2) return "bg-gray-300 dark:bg-gray-500 text-white";
  if (rank === 3) return "bg-orange-400 text-white";
  return "bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300";
};

// Fails quietly — this is a glance/shortcut widget, not the primary standings
// view, so on error it just shows nothing rather than duplicating the full
// tab's retry UI.
const loadStandings = async () => {
  if (!props.poolGroupUuid) return;
  loading.value = true;
  try {
    standings.value = await poolService.getPoolStandingOverall(props.poolGroupUuid);
  } catch (e) {
    console.error("Error loading standings preview:", e);
    standings.value = [];
  } finally {
    loading.value = false;
  }
};

watch(() => props.poolGroupUuid, loadStandings);
onMounted(loadStandings);
</script>
