<template>
  <div class="space-y-4">
    <!-- Header -->
    <div class="flex items-center gap-3">
      <div class="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/25 shrink-0">
        <v-icon name="hi-solid-collection" class="w-5 h-5 text-white" />
      </div>
      <div>
        <h1 class="text-lg font-extrabold text-gray-900 dark:text-white leading-tight">
          Select your league
        </h1>
        <p class="text-[12px] text-gray-500 dark:text-gray-400 leading-tight">
          Tap a league to see relevant news and matches
        </p>
      </div>
    </div>

    <!-- Required notice (only when there is no league selected yet) -->
    <div
      v-if="!hasLeague"
      class="flex items-start gap-2.5 px-3.5 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200/60 dark:border-amber-800/40"
    >
      <v-icon name="hi-solid-information-circle" class="w-4 h-4 text-amber-500 dark:text-amber-400 shrink-0 mt-0.5" />
      <p class="text-[12px] text-amber-700 dark:text-amber-300 leading-relaxed">
        You must select a league to continue. You can change it anytime from here.
      </p>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="py-12">
      <div class="flex flex-col items-center gap-3">
        <div class="w-8 h-8 border-2 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
        <p class="text-sm text-gray-500 dark:text-gray-400">Loading leagues...</p>
      </div>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="py-12 text-center">
      <div class="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full mx-auto mb-3 flex items-center justify-center">
        <v-icon name="hi-solid-exclamation" class="w-6 h-6 text-red-500" />
      </div>
      <p class="text-sm text-red-600 dark:text-red-400 mb-4">{{ error }}</p>
      <ButtonComponent variant="outline" size="sm" text="Retry" @click="loadLeagues" />
    </div>

    <!-- Leagues grid — tapping a card switches the league immediately -->
    <div v-else class="grid grid-cols-3 sm:grid-cols-4 gap-3 pb-24">
      <button
        v-for="league in leagues"
        :key="league.uuid"
        type="button"
        :disabled="isSaving"
        @click="selectLeague(league)"
        :class="[
          'relative p-3 rounded-2xl border transition-all flex flex-col items-center text-center gap-2 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 disabled:active:scale-100',
          currentLeagueUuid === league.uuid
            ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-300 dark:border-emerald-700/50 ring-2 ring-emerald-500 shadow-sm'
            : 'bg-white dark:bg-gray-800/60 border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-200 dark:hover:border-gray-600',
          isSaving && savingUuid !== league.uuid ? 'opacity-50' : '',
        ]"
      >
        <!-- Current badge -->
        <span
          v-if="currentLeagueUuid === league.uuid"
          class="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-full bg-emerald-500/90 text-white text-[8px] font-bold uppercase tracking-wider leading-none"
        >
          Current
        </span>

        <!-- Saving overlay on the tapped card -->
        <div
          v-if="savingUuid === league.uuid"
          class="absolute inset-0 rounded-2xl bg-white/70 dark:bg-gray-900/70 flex items-center justify-center z-10"
        >
          <div class="w-6 h-6 border-2 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
        </div>

        <img
          :src="league.image_path || '/img/default-avatar.svg'"
          class="w-14 h-14 rounded-full object-cover shadow-sm"
          :alt="league.name"
        />
        <span class="text-xs font-semibold text-gray-900 dark:text-white truncate w-full">
          {{ league.name }}
        </span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useToast } from "@/composables/useToast";
import { useAuthStore } from "@/store/auth/useAuthStore";
import { useUserStore } from "@/store/user/useUserStore";
import { useFootballLeagueStore } from "@/store/football/league/useFootballLeagueStore";
import { ButtonComponent } from "@/components/ui";
import catalogService from "@/services/catalog/CatalogService";
import type { FootballLeagueResponse } from "@/interfaces/football/league/FootballLeagueResponse";
import { UserFootballLeaguePayload } from "@/interfaces/user/footballLeague/UserFootballLeaguePayload";

const route = useRoute();
const router = useRouter();
const store = useFootballLeagueStore();
const { success } = useToast();

const leagues = ref<FootballLeagueResponse[]>([]);
const loading = ref(false);
const error = ref("");
const savingUuid = ref<string | null>(null);

const hasLeague = computed(() => store.existLeague());
const currentLeagueUuid = computed(() => store.getFootballLeagueUuid());
const isSaving = computed(() => savingUuid.value !== null);

async function loadLeagues() {
  loading.value = true;
  error.value = "";
  try {
    leagues.value = await catalogService.getFootballLeagues();
  } catch (e: unknown) {
    console.error("Failed to load leagues:", e);
    error.value = "Couldn't load leagues.";
  } finally {
    loading.value = false;
  }
}

onMounted(loadLeagues);

/** Tapping a card commits the selection immediately (no confirm button). */
async function selectLeague(league: FootballLeagueResponse) {
  if (isSaving.value) return;

  // Re-tapping the current league just leaves the gate without a redundant call.
  if (league.uuid === currentLeagueUuid.value) {
    leaveGate();
    return;
  }

  savingUuid.value = league.uuid;
  try {
    const authStore = useAuthStore();
    const userStore = useUserStore();
    if (await authStore.isAuthenticated()) {
      const payload: UserFootballLeaguePayload = { league_uuid: league.uuid };
      await userStore.storeFootballLeagues(payload);
    }
    store.setLeague(league);
    success("League selected", `You're now following ${league.name}`);
    leaveGate();
  } catch (e: unknown) {
    console.error("Failed to set league:", e);
    savingUuid.value = null;
  }
}

/** Now that a league exists, go to the requested page or home. */
function leaveGate() {
  const redirect = route.query.redirect as string | undefined;
  router.replace(redirect || { name: "home" });
}
</script>
