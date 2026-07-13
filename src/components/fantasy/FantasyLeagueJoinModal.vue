<template>
  <BottomSheet
    :is-visible="isVisible"
    :title="$t('fantasy.userLeagues.joinLeague')"
    :subtitle="$t('fantasy.join.discoverSub')"
    icon="hi-solid-user-add"
    icon-variant="emerald"
    size="auto"
    :dismissible="!isLoading"
    @close="close"
  >
    <div class="space-y-4">
      <!-- Search -->
      <FormInput
        id="fantasy-join-search"
        v-model="searchQuery"
        type="search"
        icon="hi-solid-search"
        :placeholder="$t('fantasy.join.searchPlaceholder')"
        :disabled="isLoading"
      />

      <!-- Available leagues (the user is not a member of) -->
      <div class="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden max-h-64 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700/60">
        <!-- Loading -->
        <div v-if="loadingList" class="p-3 space-y-2.5">
          <div v-for="n in 3" :key="`fl-sk-${n}`" class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-gray-200 dark:bg-gray-700 animate-pulse shrink-0" />
            <div class="flex-1 space-y-1.5">
              <div class="h-3 w-32 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
              <div class="h-2.5 w-20 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
            </div>
          </div>
        </div>

        <!-- Empty -->
        <p v-else-if="leagues.length === 0" class="px-4 py-6 text-center text-xs text-gray-400 dark:text-gray-500">
          {{ $t('fantasy.join.noLeaguesFound') }}
        </p>

        <!-- Options -->
        <template v-else>
          <button
            v-for="league in leagues"
            :key="league.uuid"
            type="button"
            :disabled="isLoading"
            @click="selectLeague(league)"
            class="w-full flex items-center gap-3 px-3.5 py-2.5 text-left transition-colors active:bg-gray-100/70 dark:active:bg-gray-700/40 disabled:opacity-60"
            :class="league.uuid === selectedLeague?.uuid ? 'bg-emerald-50/60 dark:bg-emerald-900/10' : ''"
          >
            <div class="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shrink-0">
              <v-icon name="bi-trophy-fill" class="w-4 h-4 text-white" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-semibold text-gray-900 dark:text-white truncate">{{ league.name }}</p>
              <div class="flex items-center gap-2.5 mt-0.5 text-xs text-gray-400 dark:text-gray-500">
                <span class="flex items-center gap-1">
                  <v-icon :name="league.is_private ? 'hi-solid-lock-closed' : 'hi-solid-globe-alt'" class="w-3 h-3" />
                  {{ league.is_private ? $t('fantasy.leagueCard.private') : $t('fantasy.leagueCard.public') }}
                </span>
                <span class="flex items-center gap-1">
                  <v-icon name="hi-solid-users" class="w-3 h-3" />
                  {{ league.participants_count }}
                </span>
              </div>
            </div>
            <v-icon
              v-if="league.uuid === selectedLeague?.uuid"
              name="hi-solid-check"
              class="w-4 h-4 text-emerald-500 shrink-0"
            />
          </button>
        </template>
      </div>

      <!-- Password — only private leagues require one -->
      <FormInput
        v-if="selectedLeague?.is_private"
        id="fantasy-join-password"
        v-model="password"
        type="password"
        :label="$t('fantasy.joinModal.password.label')"
        icon="hi-solid-lock-closed"
        :placeholder="$t('fantasy.joinModal.password.placeholder')"
        autocomplete="current-password"
        :error="passwordError"
        :disabled="isLoading"
        @keyup.enter="handleJoin"
      />
    </div>

    <template #footer>
      <div class="flex gap-3">
        <button
          @click="close"
          :disabled="isLoading"
          class="flex-1 py-3 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 active:scale-[0.98] transition-all disabled:opacity-50"
        >
          {{ $t('common.actions.cancel') }}
        </button>
        <button
          @click="handleJoin"
          :disabled="isLoading || !canJoin"
          class="flex-1 py-3 rounded-xl text-sm font-semibold text-white bg-emerald-600 active:scale-[0.98] shadow-sm shadow-emerald-500/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <div v-if="isLoading" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          <v-icon v-else name="hi-solid-user-add" class="w-4 h-4" />
          {{ selectedLeague?.is_private ? $t('fantasy.leagueCard.requestToJoin') : $t('fantasy.joinModal.joinLeague') }}
        </button>
      </div>
    </template>
  </BottomSheet>
</template>

<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from "vue";
import BottomSheet from "@/components/ui/BottomSheet.vue";
import { FormInput } from "@/components/ui";
import catalogService from "@/services/catalog/CatalogService";
import { fantasyLeagueService } from "@/services/fantasy/leagues/FantasyLeagueService";
import { useValidationStore } from "@/store/validation/useValidationStore";
import type { FantasyLeaguesResponse } from "@/interfaces/fantasy/leagues/FantasyLeaguesResponse";
import type { FantasyLeagueJoined } from "@/interfaces/fantasy/leagues/FantasyLeagueJoined";

const props = withDefaults(defineProps<{ isVisible?: boolean }>(), {
  isVisible: false,
});

const emit = defineEmits<{
  close: [];
  joined: [league: FantasyLeaguesResponse];
}>();

const validationStore = useValidationStore();

const searchQuery = ref("");
const leagues = ref<FantasyLeaguesResponse[]>([]);
const loadingList = ref(false);
const selectedLeague = ref<FantasyLeaguesResponse | null>(null);
const password = ref("");
const isLoading = ref(false);

// 422 validation errors for "password" are stored by the API interceptor.
const passwordError = computed(() => validationStore.getFieldError("password")[0] || "");

const canJoin = computed(
  () =>
    !!selectedLeague.value &&
    (!selectedLeague.value.is_private || password.value.trim().length > 0)
);

// Fetch the leagues the user can join, filtered by the current search text.
const loadLeagues = async () => {
  loadingList.value = true;
  try {
    leagues.value = await catalogService.getFantasyLeaguesAll({
      filters: {
        search: searchQuery.value.trim() || null,
        skipJoinedUser: true,
      },
    });
    // The previously selected league may have been filtered out by the search.
    if (selectedLeague.value && !leagues.value.some((l) => l.uuid === selectedLeague.value?.uuid)) {
      selectedLeague.value = null;
    }
  } catch (e) {
    console.error("Error loading fantasy leagues:", e);
    leagues.value = [];
  } finally {
    loadingList.value = false;
  }
};

// Debounced live search while the sheet is open.
let searchTimer: ReturnType<typeof setTimeout> | undefined;
watch(searchQuery, () => {
  if (!props.isVisible) return;
  clearTimeout(searchTimer);
  searchTimer = setTimeout(loadLeagues, 400);
});
onUnmounted(() => clearTimeout(searchTimer));

const selectLeague = (league: FantasyLeaguesResponse) => {
  selectedLeague.value = league;
  password.value = "";
  validationStore.clearFieldError("password");
};

// Reset the form and load the available leagues whenever the sheet opens.
watch(
  () => props.isVisible,
  (visible) => {
    if (visible) {
      searchQuery.value = "";
      password.value = "";
      selectedLeague.value = null;
      validationStore.clearFieldError("password");
      loadLeagues();
    }
  }
);

// Clear the field error as soon as the user edits the password.
watch(password, () => {
  if (passwordError.value) validationStore.clearFieldError("password");
});

const close = () => {
  if (!isLoading.value) emit("close");
};

const handleJoin = async () => {
  if (!canJoin.value || isLoading.value || !selectedLeague.value) return;

  const league = selectedLeague.value;
  isLoading.value = true;
  validationStore.clearFieldError("password");

  try {
    const payload: FantasyLeagueJoined = {
      password: league.is_private ? password.value.trim() : null,
    };
    await fantasyLeagueService.joinFantasyLeague(payload, league.uuid);
    emit("joined", league);
  } catch (e) {
    // 422 errors are surfaced via validationStore (input) + a toast, both handled
    // by the API interceptor in useApiFantasy.
    console.error("Error joining fantasy league:", e);
  } finally {
    isLoading.value = false;
  }
};
</script>
