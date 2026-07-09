<template>
  <div class="max-w-md mx-auto">


    <!-- Required notice (only when there is no league selected yet) -->
    <div
      v-if="!hasLeague"
      class="mb-4 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-amber-50 dark:bg-amber-900/15"
    >
      <v-icon name="hi-solid-information-circle" class="w-[18px] h-[18px] text-amber-500 dark:text-amber-400 shrink-0" />
      <p class="text-footnote text-amber-700 dark:text-amber-300 leading-snug">
        {{ $t('football.leagueSelect.notice') }}
      </p>
    </div>

    <!-- Loading — skeleton rows keep the layout stable -->
    <div
      v-if="loading"
      class="rounded-2xl overflow-hidden bg-white dark:bg-gray-800/60 divide-y divide-gray-100 dark:divide-gray-700/50"
    >
      <div v-for="i in 5" :key="i" class="flex items-center gap-3.5 px-4 py-3">
        <div class="w-11 h-11 rounded-full bg-gray-100 dark:bg-gray-700 animate-pulse shrink-0" />
        <div class="h-3.5 rounded-full bg-gray-100 dark:bg-gray-700 animate-pulse" :style="{ width: `${40 + ((i * 17) % 45)}%` }" />
      </div>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="py-12 text-center">
      <div class="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full mx-auto mb-3 flex items-center justify-center">
        <v-icon name="hi-solid-exclamation" class="w-6 h-6 text-red-500" />
      </div>
      <p class="text-footnote text-red-600 dark:text-red-400 mb-4">{{ error }}</p>
      <ButtonComponent variant="outline" size="sm" :text="$t('common.actions.retry')" @click="loadLeagues" />
    </div>

    <!-- Section header + Leagues list -->
    <template v-else>
      <p class="px-1 mb-1.5 text-2xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
        {{ $t('football.leagueSelect.available') }}
      </p>

      <div class="rounded-2xl overflow-hidden bg-white dark:bg-gray-800/60 divide-y divide-gray-100 dark:divide-gray-700/50 pb-px">
        <button
          v-for="league in leagues"
          :key="league.uuid"
          type="button"
          :disabled="isSaving"
          @click="selectLeague(league)"
          :class="[
            'group w-full flex items-center gap-3.5 px-4 py-3 text-left transition-colors active:bg-gray-100/70 dark:active:bg-gray-700/40 focus:outline-none focus-visible:bg-gray-100/70 dark:focus-visible:bg-gray-700/40',
            isSaving && savingUuid !== league.uuid ? 'opacity-40' : '',
          ]"
        >
          <!-- Crest -->
          <div
            :class="[
              'w-11 h-11 rounded-full flex items-center justify-center overflow-hidden shrink-0 ring-1 transition-shadow',
              currentLeagueUuid === league.uuid
                ? 'ring-emerald-500/30'
                : 'ring-black/5 dark:ring-white/10',
            ]"
          >
            <img
              :src="league.image_path || '/img/default-avatar.svg'"
              class="w-full h-full object-cover"
              :alt="league.name"
            />
          </div>

          <!-- Name -->
          <span
            :class="[
              'flex-1 min-w-0 text-callout leading-tight truncate',
              currentLeagueUuid === league.uuid
                ? 'font-semibold text-gray-900 dark:text-white'
                : 'font-medium text-gray-800 dark:text-gray-100',
            ]"
          >
            {{ league.name }}
          </span>

          <!-- Trailing accessory: spinner while saving, check if current, chevron otherwise -->
          <div
            v-if="savingUuid === league.uuid"
            class="w-5 h-5 border-2 border-emerald-200 border-t-emerald-600 rounded-full animate-spin shrink-0"
          />
          <v-icon
            v-else-if="currentLeagueUuid === league.uuid"
            name="hi-solid-check"
            class="w-5 h-5 text-emerald-500 shrink-0"
          />
          <v-icon
            v-else
            name="hi-solid-chevron-right"
            class="w-4 h-4 text-gray-300 dark:text-gray-600 shrink-0"
          />
        </button>
      </div>
    </template>

    <div class="h-28" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
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
const { t } = useI18n();
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
    error.value = t("football.leagueSelect.loadError");
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
    success(
      t("football.leagueSelect.selectedTitle"),
      t("football.leagueSelect.selectedBody", { name: league.name })
    );
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
