<template>
  <div class="p-3 space-y-2">
    <!-- Target player being replaced (if any) -->
    <div v-if="targetPlayer" class="mb-3">
      <p class="text-2xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide px-1 mb-1.5">
        {{ $t('fantasy.lineup.currentPlayer') }}
      </p>
      <div class="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-700/40">
        <span
          class="inline-flex items-center justify-center w-7 h-7 rounded-lg text-2xs font-bold shrink-0"
          :class="positionColorClass(targetPlayer.position.developer_name)"
        >
          {{ positionShort(targetPlayer.position.developer_name) }}
        </span>
        <img
          :src="targetPlayer.football_player.image_path || '/img/default-avatar.svg'"
          :alt="targetPlayer.football_player.display_name"
          class="w-8 h-8 rounded-full object-cover border border-amber-200 dark:border-amber-700 shrink-0"
        />
        <div class="flex-1 min-w-0">
          <p class="text-footnote font-medium text-gray-900 dark:text-white truncate">
            {{ targetPlayer.football_player.display_name }}
          </p>
          <div class="flex flex-wrap items-center gap-1.5 mt-0.5">
            <span class="text-2xs text-amber-600 dark:text-amber-400">{{ roleLabel(targetPlayer) }}</span>
            <NextFixtureBadge :fixture="targetPlayer.next_fixture" />
          </div>
        </div>
        <span class="text-xs font-bold tabular-nums shrink-0" :class="pointsClass(targetPlayer.fantasy_points)">
          {{ targetPlayer.fantasy_points ?? 0 }} {{ $t('fantasy.lineup.pts') }}
        </span>
      </div>
    </div>

    <!-- Candidates -->
    <p class="text-2xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide px-1 mb-1.5">
      {{ candidates.length > 0 ? $t('fantasy.lineup.availablePlayers') : $t('fantasy.lineup.noAvailablePlayers') }}
    </p>

    <div v-if="candidates.length === 0" class="flex flex-col items-center justify-center py-10 text-center px-4">
      <v-icon name="hi-solid-users" class="w-8 h-8 text-gray-300 dark:text-gray-600 mb-2" />
      <p class="text-footnote text-gray-400 dark:text-gray-500">
        {{ $t('fantasy.lineup.noSwapCandidatesBody') }}
      </p>
    </div>

    <button
      v-for="player in candidates"
      :key="player.football_player.uuid"
      class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60 hover:bg-gray-50 dark:hover:bg-gray-700/50 active:scale-[0.98] transition-all text-left disabled:opacity-50 disabled:pointer-events-none"
      :disabled="isLoading"
      :aria-label="$t('fantasy.lineup.swapInAria', { name: player.football_player.display_name })"
      @click="$emit('select', player)"
    >
      <span
        class="inline-flex items-center justify-center w-7 h-7 rounded-lg text-2xs font-bold shrink-0"
        :class="positionColorClass(player.position.developer_name)"
      >
        {{ positionShort(player.position.developer_name) }}
      </span>
      <img
        :src="player.football_player.image_path || '/img/default-avatar.svg'"
        :alt="player.football_player.display_name"
        class="w-8 h-8 rounded-full object-cover border border-gray-200 dark:border-gray-600 shrink-0"
      />
      <div class="flex-1 min-w-0">
        <p class="text-footnote font-medium text-gray-900 dark:text-white truncate">
          {{ player.football_player.display_name }}
        </p>
        <div class="flex flex-wrap items-center gap-1.5 mt-0.5">
          <span class="text-2xs text-gray-500 dark:text-gray-400 truncate">
            {{ [player.team?.name, roleLabel(player)].filter(Boolean).join(' · ') }}
          </span>
          <NextFixtureBadge :fixture="player.next_fixture" />
        </div>
      </div>
      <div class="flex flex-col items-end gap-0.5 shrink-0">
        <span class="text-xs font-bold tabular-nums" :class="pointsClass(player.fantasy_points)">
          {{ player.fantasy_points ?? 0 }} {{ $t('fantasy.lineup.pts') }}
        </span>
        <v-icon
          v-if="swappingUuid === player.football_player.uuid"
          name="pr-spinner"
          class="w-3.5 h-3.5 text-gray-400"
          animation="spin"
        />
        <v-icon
          v-else
          name="hi-solid-switch-horizontal"
          class="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400"
        />
      </div>
    </button>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import type { FantasyFootballPlayer } from "@/interfaces/user/fantasy/FantasyFootballPlayersResponse";
import { usePositionShortCode } from "@/composables/usePositionShortCode";
import NextFixtureBadge from "@/components/fantasy/lineup/NextFixtureBadge.vue";
import { POSITION_BADGE, type LineupVariant } from "@/components/fantasy/lineup/lineupVariants";

interface Props {
  targetPlayer: FantasyFootballPlayer | null;
  candidates: FantasyFootballPlayer[];
  isLoading: boolean;
  /** UUID of the candidate whose swap is in flight — only that row spins. */
  swappingUuid?: string | null;
}

withDefaults(defineProps<Props>(), {
  swappingUuid: null,
});

defineEmits<{
  select: [player: FantasyFootballPlayer];
}>();

const { t } = useI18n();
const positionShort = usePositionShortCode();

// Reuse the lineup's shared position palette so the badges match the pitch view
// exactly (no second, drifting color map).
function positionColorClass(developerName: string): string {
  const variant = developerName?.toLowerCase() as LineupVariant;
  return POSITION_BADGE[variant] ?? POSITION_BADGE.bench;
}

/** Localized lineup role — Starter / Flex / Bench. */
function roleLabel(player: FantasyFootballPlayer): string {
  if (player.is_starter) return t("fantasy.lineup.roleStarter");
  if (player.is_flex) return t("fantasy.lineup.roleFlex");
  return t("fantasy.lineup.roleBench");
}

// A 0 in a not-yet-played round is noise — keep it neutral instead of amber
// (which reads as "solid"), so real scores stand out.
function pointsClass(points: number | null | undefined): string {
  return (Number(points) || 0) > 0
    ? "text-amber-600 dark:text-amber-400"
    : "text-gray-400 dark:text-gray-500";
}
</script>
