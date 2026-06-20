<template>
  <div class="p-3 space-y-2">
    <!-- Target player being replaced (if any) -->
    <div v-if="targetPlayer" class="mb-3">
      <p class="text-2xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide px-1 mb-1.5">
        Current player
      </p>
      <div class="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-700/40">
        <span
          class="inline-flex items-center justify-center w-7 h-7 rounded-lg text-2xs font-bold shrink-0"
          :class="positionColorClass(targetPlayer.position.developer_name)"
        >
          {{ positionShortCode(targetPlayer.position.developer_name) }}
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
          <p class="text-2xs text-amber-600 dark:text-amber-400">
            {{ targetPlayer.is_starter ? 'Starter' : targetPlayer.is_flex ? 'Flex' : 'Bench' }}
          </p>
        </div>
        <span class="text-xs font-bold text-amber-600 dark:text-amber-400 tabular-nums shrink-0">
          {{ targetPlayer.fantasy_points ?? 0 }} pts
        </span>
      </div>
    </div>

    <!-- Candidates -->
    <p class="text-2xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide px-1 mb-1.5">
      {{ candidates.length > 0 ? 'Available players' : 'No available players' }}
    </p>

    <div v-if="candidates.length === 0" class="flex flex-col items-center justify-center py-10 text-center px-4">
      <v-icon name="hi-solid-users" class="w-8 h-8 text-gray-300 dark:text-gray-600 mb-2" />
      <p class="text-footnote text-gray-400 dark:text-gray-500">
        No players available for this position to swap with.
      </p>
    </div>

    <button
      v-for="player in candidates"
      :key="player.football_player.uuid"
      class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60 hover:bg-gray-50 dark:hover:bg-gray-700/50 active:scale-[0.98] transition-all text-left disabled:opacity-50 disabled:pointer-events-none"
      :disabled="isLoading"
      @click="$emit('select', player)"
    >
      <span
        class="inline-flex items-center justify-center w-7 h-7 rounded-lg text-2xs font-bold shrink-0"
        :class="positionColorClass(player.position.developer_name)"
      >
        {{ positionShortCode(player.position.developer_name) }}
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
        <p class="text-2xs text-gray-500 dark:text-gray-400">
          {{ player.team?.name ?? '' }} · {{ player.is_starter ? 'Starter' : player.is_flex ? 'Flex' : 'Bench' }}
        </p>
      </div>
      <div class="flex flex-col items-end gap-0.5 shrink-0">
        <span class="text-xs font-bold text-amber-600 dark:text-amber-400 tabular-nums">
          {{ player.fantasy_points ?? 0 }} pts
        </span>
        <v-icon
          v-if="isLoading"
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
import type { FantasyFootballPlayer } from "@/interfaces/user/fantasy/FantasyFootballPlayersResponse";

interface Props {
  targetPlayer: FantasyFootballPlayer | null;
  candidates: FantasyFootballPlayer[];
  isLoading: boolean;
}

defineProps<Props>();

defineEmits<{
  select: [player: FantasyFootballPlayer];
}>();

function positionShortCode(developerName: string): string {
  const map: Record<string, string> = {
    GOALKEEPER: "GK",
    DEFENDER: "DEF",
    MIDFIELDER: "MID",
    ATTACKER: "FW",
    FLEX: "FX",
    BENCH: "BN",
  };
  return map[developerName] ?? developerName.substring(0, 3);
}

function positionColorClass(developerName: string): string {
  const map: Record<string, string> = {
    GOALKEEPER: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
    DEFENDER: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
    MIDFIELDER: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400",
    ATTACKER: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400",
    FLEX: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400",
    BENCH: "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400",
  };
  return map[developerName] ?? "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400";
}
</script>
