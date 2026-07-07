<template>
  <!-- Home "Transfers" panel: resolves the active league and renders the list. -->
  <TransferComponent v-if="leagueUuid" :league-uuid="leagueUuid" />

  <!-- Defensive: the Home tabs only mount once a league is selected, but if the
       context is somehow missing we show a neutral empty state instead of nothing. -->
  <div
    v-else
    class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 py-12 text-center"
  >
    <v-icon name="hi-solid-switch-horizontal" class="w-10 h-10 text-gray-200 dark:text-gray-700 mx-auto mb-3" />
    <p class="text-footnote text-gray-400 dark:text-gray-500">{{ $t('football.transfers.noLeague') }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useFootballLeagueStore } from "@/store/football/league/useFootballLeagueStore";
import TransferComponent from "./TransferComponent.vue";

const store = useFootballLeagueStore();

// Transfers are keyed by league (not stage/season), so read the league directly.
const leagueUuid = computed(() => store.getFootballLeagueUuid() ?? "");
</script>
