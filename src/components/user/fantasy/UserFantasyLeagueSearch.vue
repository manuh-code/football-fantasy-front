<template>
  <div class="space-y-4">
    <!-- Search -->
    <div class="relative">
      <v-icon name="hi-solid-search" class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
      <input
        v-model="searchQuery"
        type="search"
        :placeholder="$t('fantasy.discover.searchPlaceholder')"
        class="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 rounded-xl text-base md:text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 border border-gray-200 dark:border-gray-700/60 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-shadow"
      />
    </div>

    <!-- Loading State -->
    <FantasyLeagueListSkeleton v-if="isLoading" :count="4" />

    <!-- Error State -->
    <div v-else-if="errorMessage" class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 p-6 text-center">
      <v-icon name="hi-solid-exclamation" class="w-8 h-8 text-red-400 mx-auto mb-3" />
      <p class="text-footnote text-red-500 dark:text-red-400 mb-4">{{ errorMessage }}</p>
      <button
        @click="loadLeagues"
        class="px-4 py-1.5 bg-red-500 text-white rounded-full text-footnote font-medium active:bg-red-600 transition-colors"
      >
        {{ $t('common.actions.retry') }}
      </button>
    </div>

    <!-- Results -->
    <template v-else-if="leagues.length > 0">
      <p class="px-1 text-xs text-gray-400 dark:text-gray-500">
        {{ leagues.length === 1 ? $t('fantasy.discover.resultCountOne', { count: leagues.length }) : $t('fantasy.discover.resultCountOther', { count: leagues.length }) }}
      </p>

      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        <div
          v-for="league in leagues"
          :key="league.uuid"
          class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 overflow-hidden"
        >
          <div class="p-4">
            <!-- Header: icon + name -->
            <div class="flex items-start gap-3">
              <div class="w-11 h-11 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shrink-0">
                <v-icon name="bi-trophy-fill" class="w-5 h-5 text-white" />
              </div>
              <div class="flex-1 min-w-0">
                <h3 class="text-callout font-semibold text-gray-900 dark:text-white leading-tight truncate">
                  {{ league.name }}
                </h3>
                <p v-if="league.description" class="text-footnote text-gray-500 dark:text-gray-400 leading-snug mt-0.5 line-clamp-2">
                  {{ league.description }}
                </p>
              </div>
            </div>

            <!-- Footer: privacy + members -->
            <div class="flex items-center gap-4 mt-3 pt-3 border-t border-gray-50 dark:border-gray-700/40">
              <div class="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500 shrink-0">
                <v-icon :name="league.is_private ? 'hi-solid-lock-closed' : 'hi-solid-globe-alt'" class="w-3.5 h-3.5" />
                <span>{{ league.is_private ? $t('fantasy.leagueCard.private') : $t('fantasy.leagueCard.public') }}</span>
              </div>
              <div class="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500 shrink-0">
                <v-icon name="hi-solid-users" class="w-3.5 h-3.5" />
                <span class="tabular-nums">{{ league.members_count ?? 0 }}/{{ league.participants_count }}</span>
              </div>
            </div>

            <!-- Join -->
            <button
              type="button"
              @click="$emit('join')"
              class="mt-3 w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 active:scale-[0.98] shadow-sm shadow-blue-500/30 transition-all"
            >
              <v-icon name="hi-solid-user-add" class="w-3.5 h-3.5" />
              {{ $t('fantasy.discover.join') }}
            </button>
          </div>
        </div>
      </div>
    </template>

    <!-- Empty State -->
    <div v-else class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 py-12 text-center">
      <v-icon name="hi-solid-search" class="w-10 h-10 text-gray-200 dark:text-gray-700 mx-auto mb-3" />
      <h3 class="text-callout font-semibold text-gray-900 dark:text-white mb-1">{{ $t('fantasy.discover.emptyTitle') }}</h3>
      <p class="text-footnote text-gray-400 dark:text-gray-500 max-w-xs mx-auto leading-relaxed">
        {{ $t('fantasy.discover.emptyBody') }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import catalogService from "@/services/catalog/CatalogService";
import FantasyLeagueListSkeleton from "@/components/fantasy/FantasyLeagueListSkeleton.vue";
import type { FantasyLeaguesResponse } from "@/interfaces/fantasy/leagues/FantasyLeaguesResponse";

defineEmits<{
  /** A result's "Join" button was tapped — the parent opens the access-code sheet. */
  join: [];
}>();

const { t } = useI18n();

// State
const searchQuery = ref("");
const leagues = ref<FantasyLeaguesResponse[]>([]);
const isLoading = ref(false);
const errorMessage = ref<string>("");

// Fetch leagues the user can discover and join, filtered by the current search text.
const loadLeagues = async () => {
  isLoading.value = true;
  errorMessage.value = "";

  try {
    leagues.value = await catalogService.getFantasyLeaguesAll({
      filters: {
        search: searchQuery.value.trim() || null,
        skipJoinedUser: true,
      },
    });
  } catch (e) {
    console.error("Error searching fantasy leagues:", e);
    errorMessage.value = t("fantasy.discover.loadError");
    leagues.value = [];
  } finally {
    isLoading.value = false;
  }
};

// Debounced live search.
let searchTimer: ReturnType<typeof setTimeout> | undefined;
watch(searchQuery, () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(loadLeagues, 400);
});
onUnmounted(() => clearTimeout(searchTimer));

// Lifecycle
onMounted(loadLeagues);

// Let the parent refresh results after a join (so the joined league drops out).
defineExpose({ reload: loadLeagues });
</script>

<style scoped>
/* Clamp league description to two lines (no Tailwind line-clamp plugin in this project). */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Accessibility: Respect user's motion preferences */
@media (prefers-reduced-motion: reduce) {
  * {
    transition: none !important;
  }
}
</style>
