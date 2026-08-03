<template>
  <section
    class="rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60 overflow-hidden"
    :aria-busy="isLoading || isSearching"
  >
    <!-- Search -->
    <div class="p-4 pb-3 border-b border-gray-50 dark:border-gray-700/40">
      <label for="follow-team-search" class="sr-only">
        {{ $t('user.favoriteTeam.discover.searchLabel') }}
      </label>
      <div class="relative">
        <v-icon
          name="hi-solid-search"
          class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 pointer-events-none"
        />
        <input
          id="follow-team-search"
          v-model="query"
          type="text"
          autocomplete="off"
          :placeholder="$t('user.favoriteTeam.discover.searchPlaceholder')"
          class="w-full h-11 pl-9 pr-9 text-base md:text-footnote text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-700 rounded-xl placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 dark:focus:border-emerald-500 transition-colors"
        />
        <button
          v-if="query"
          type="button"
          @click="clearSearch"
          class="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 transition-colors"
          :aria-label="$t('user.favoriteTeam.discover.clearSearch')"
        >
          <v-icon name="hi-solid-x-circle" class="w-4 h-4" />
        </button>
      </div>
    </div>

    <div class="p-4">
      <!-- Section heading — the label changes with what we can honestly claim -->
      <div class="flex items-baseline justify-between gap-3 mb-3">
        <h2 class="text-callout font-semibold text-gray-900 dark:text-white">
          {{ headingTitle }}
        </h2>
        <span
          v-if="!isLoading && !loadError && teams.length"
          class="text-2xs text-gray-400 dark:text-gray-500 shrink-0"
        >
          {{ $t('user.favoriteTeam.discover.hint') }}
        </span>
      </div>

      <!-- Loading -->
      <div v-if="isLoading" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        <div
          v-for="i in 8"
          :key="`disc-sk-${i}`"
          class="rounded-2xl border border-gray-100 dark:border-gray-700/60 p-4 flex flex-col items-center gap-3"
        >
          <div class="w-16 h-16 rounded-xl bg-gray-100 dark:bg-gray-700 animate-pulse" />
          <div class="h-3 w-20 rounded-full bg-gray-100 dark:bg-gray-700 animate-pulse" />
          <div class="h-2.5 w-12 rounded-full bg-gray-100 dark:bg-gray-700 animate-pulse" />
        </div>
      </div>

      <!-- Error -->
      <div v-else-if="loadError" class="py-8 flex flex-col items-center text-center">
        <v-icon name="hi-solid-exclamation-circle" class="w-8 h-8 text-red-400 dark:text-red-500 mb-3" />
        <p class="text-footnote text-red-500 dark:text-red-400 mb-4">{{ loadError }}</p>
        <button
          type="button"
          @click="retry"
          class="px-4 py-2 text-xs font-semibold rounded-full bg-emerald-500 text-white hover:bg-emerald-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-800 transition-colors"
        >
          {{ $t('common.actions.retry') }}
        </button>
      </div>

      <!-- No search matches -->
      <div v-else-if="isSearchMode && !teams.length" class="py-8 flex flex-col items-center text-center">
        <v-icon name="hi-solid-search" class="w-8 h-8 text-gray-300 dark:text-gray-600 mb-3" />
        <p class="text-footnote font-medium text-gray-900 dark:text-white">
          {{ $t('user.favoriteTeam.discover.noResults', { search: activeQuery }) }}
        </p>
        <p class="text-2xs text-gray-500 dark:text-gray-400 mt-1">
          {{ $t('user.favoriteTeam.discover.noResultsHint') }}
        </p>
      </div>

      <!-- Crest wall -->
      <TransitionGroup
        v-else
        tag="div"
        :name="transitionName"
        class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3"
        :class="{ 'opacity-60': isSearching }"
      >
        <button
          v-for="(team, index) in teams"
          :key="team.uuid"
          type="button"
          :disabled="team.is_following || pendingUuids.has(team.uuid)"
          @click="follow(team)"
          class="crest-card group relative rounded-2xl border p-4 flex flex-col items-center text-center transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-800"
          :class="team.is_following
            ? 'border-amber-200 dark:border-amber-500/30 bg-amber-50/60 dark:bg-amber-900/10 cursor-default'
            : 'border-gray-100 dark:border-gray-700/60 hover:border-emerald-300 dark:hover:border-emerald-500/50 hover:shadow-md active:scale-[0.97]'"
          :aria-label="team.is_following
            ? $t('user.favoriteTeam.discover.alreadyFollowing')
            : $t('user.favoriteTeam.discover.followAria', { name: team.name })"
        >
          <!-- Rank: only where the position is a real popularity ranking -->
          <span
            v-if="isRanked(team)"
            class="absolute top-1.5 left-1.5 w-5 h-5 rounded-full bg-gray-100 dark:bg-gray-700 text-2xs font-bold tabular-nums text-gray-500 dark:text-gray-300 flex items-center justify-center"
            aria-hidden="true"
          >
            {{ index + 1 }}
          </span>

          <!-- Follow state -->
          <span
            class="absolute top-1.5 right-1.5 w-6 h-6 rounded-full flex items-center justify-center transition-colors"
            :class="team.is_following
              ? 'text-amber-500'
              : 'bg-gray-50 dark:bg-gray-700/60 text-gray-400 dark:text-gray-500 group-hover:bg-emerald-500 group-hover:text-white group-focus-visible:bg-emerald-500 group-focus-visible:text-white'"
            aria-hidden="true"
          >
            <v-icon v-if="pendingUuids.has(team.uuid)" name="pr-spinner" class="w-3.5 h-3.5 animate-spin" />
            <v-icon v-else-if="team.is_following" name="hi-solid-star" class="w-4 h-4" />
            <v-icon v-else name="hi-solid-plus" class="w-3.5 h-3.5" />
          </span>

          <div class="w-16 h-16 flex items-center justify-center mb-3 mt-1">
            <TeamLogo :team="team" size="xl" variant="square" :show-loading-state="true" />
          </div>

          <p class="text-footnote font-semibold text-gray-900 dark:text-white leading-tight line-clamp-2 w-full">
            {{ team.name }}
          </p>

          <!-- Followers when there are any; country otherwise -->
          <span
            v-if="team.followers_count > 0"
            class="mt-1 inline-flex items-center gap-1 text-2xs text-gray-500 dark:text-gray-400"
          >
            <v-icon name="hi-solid-users" class="w-3 h-3 shrink-0" />
            <span class="tabular-nums">{{ team.followers_count }}</span>
          </span>
          <span
            v-else-if="team.country"
            class="mt-1 flex items-center justify-center gap-1 min-w-0 w-full"
          >
            <img
              v-if="team.country.image_path"
              :src="team.country.image_path"
              :alt="''"
              class="w-3.5 h-3.5 rounded-full object-cover shrink-0"
            />
            <span class="text-2xs text-gray-400 dark:text-gray-500 truncate">
              {{ team.country.name }}
            </span>
          </span>

          <!-- The stamp: the moment a crest joins your collection -->
          <span
            v-if="stampedUuids.has(team.uuid)"
            class="crest-stamp absolute inset-0 rounded-2xl bg-emerald-500/95 flex items-center justify-center"
            aria-hidden="true"
          >
            <v-icon name="hi-solid-check" class="w-8 h-8 text-white" />
          </span>
        </button>
      </TransitionGroup>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import TeamLogo from "@/components/football/ui/TeamLogo.vue";
import { useToast } from "@/composables/useToast";
import { useUserStore } from "@/store/user/useUserStore";
import { getUserService } from "@/services/user/UserService";
import type {
  FollowableTeamResponse,
  FollowableTeamsSource,
} from "@/interfaces/football/team/FollowableTeamResponse";

const SEARCH_DEBOUNCE_MS = 400;
const MIN_SEARCH_LENGTH = 2;
/** Cuánto se queda el sello antes de que la tarjeta salga de la parrilla. */
const STAMP_MS = 420;

const { t } = useI18n();
const toast = useToast();
const userStore = useUserStore();

const teams = ref<FollowableTeamResponse[]>([]);
const source = ref<FollowableTeamsSource>("random");
const isLoading = ref(false);
const isSearching = ref(false);
const loadError = ref<string | null>(null);

const query = ref("");
const activeQuery = ref("");
const pendingUuids = ref<Set<string>>(new Set());
const stampedUuids = ref<Set<string>>(new Set());

// Sacar una sola tarjeta de la parrilla se ve mejor animado, pero cuando la
// lista se reemplaza entera (buscar, recargar) esa misma salida deja las
// tarjetas viejas encimadas sobre las nuevas. Se apaga para los reemplazos.
const transitionName = ref("crest");

const replaceTeams = async (next: FollowableTeamResponse[]) => {
  transitionName.value = "crest-swap";
  teams.value = next;
  await nextTick();
  transitionName.value = "crest";
};

let debounceTimer: ReturnType<typeof setTimeout> | null = null;
const stampTimers = new Set<ReturnType<typeof setTimeout>>();
// Las respuestas de búsqueda pueden llegar desordenadas; sólo la del último
// término tecleado tiene derecho a pintar la parrilla.
let requestToken = 0;

const isSearchMode = computed(() => activeQuery.value.length >= MIN_SEARCH_LENGTH);

const headingTitle = computed(() => {
  if (isSearchMode.value) return t("user.favoriteTeam.discover.resultsTitle");
  return source.value === "random"
    ? t("user.favoriteTeam.discover.titleRandom")
    : t("user.favoriteTeam.discover.title");
});

/**
 * Un número de posición sólo se muestra donde de verdad significa "puesto en el
 * ranking": nada de numerar el relleno aleatorio ni los resultados de búsqueda.
 *
 * El backend ordena por seguidores y agota primero a los que tienen al menos
 * uno, así que "tiene seguidores" equivale a "viene del ranking" y el índice es
 * su posición real.
 */
const isRanked = (team: FollowableTeamResponse): boolean =>
  !isSearchMode.value && team.followers_count > 0;

const loadSuggestions = async () => {
  const token = ++requestToken;
  isLoading.value = true;
  loadError.value = null;
  try {
    const result = await getUserService().getTopFollowedTeams();
    if (token !== requestToken) return;
    source.value = result.source;
    await replaceTeams(result.teams);
  } catch (err) {
    if (token !== requestToken) return;
    console.error("Error loading team suggestions:", err);
    loadError.value = t("user.favoriteTeam.discover.loadError");
  } finally {
    if (token === requestToken) isLoading.value = false;
  }
};

const runSearch = async (term: string) => {
  const token = ++requestToken;
  isSearching.value = true;
  loadError.value = null;
  try {
    const result = await getUserService().searchFollowableTeams(term);
    if (token !== requestToken) return;
    source.value = result.source;
    activeQuery.value = term;
    await replaceTeams(result.teams);
  } catch (err) {
    if (token !== requestToken) return;
    console.error("Error searching teams:", err);
    loadError.value = t("user.favoriteTeam.discover.searchError");
  } finally {
    if (token === requestToken) isSearching.value = false;
  }
};

watch(query, (value) => {
  if (debounceTimer) clearTimeout(debounceTimer);
  const term = value.trim();

  if (term.length < MIN_SEARCH_LENGTH) {
    // Volver a las sugerencias en cuanto el campo deja de ser una búsqueda.
    if (activeQuery.value) {
      activeQuery.value = "";
      loadSuggestions();
    }
    return;
  }

  debounceTimer = setTimeout(() => runSearch(term), SEARCH_DEBOUNCE_MS);
});

const clearSearch = () => {
  query.value = "";
};

const retry = () => {
  if (isSearchMode.value) {
    runSearch(activeQuery.value);
    return;
  }
  loadSuggestions();
};

const follow = async (team: FollowableTeamResponse) => {
  if (team.is_following || pendingUuids.value.has(team.uuid)) return;

  pendingUuids.value = new Set(pendingUuids.value).add(team.uuid);
  try {
    await userStore.updateFavoriteTeam({ teamUuid: team.uuid });
    toast.success(
      t("user.favoriteTeam.discover.followedTitle"),
      t("user.favoriteTeam.discover.followedMsg", { name: team.name }),
    );

    stampedUuids.value = new Set(stampedUuids.value).add(team.uuid);
    const timer = setTimeout(() => {
      stampTimers.delete(timer);
      teams.value = teams.value.filter((candidate) => candidate.uuid !== team.uuid);
      const nextStamped = new Set(stampedUuids.value);
      nextStamped.delete(team.uuid);
      stampedUuids.value = nextStamped;
    }, STAMP_MS);
    stampTimers.add(timer);
  } catch (err) {
    console.error("Error following team:", err);
    toast.error(t("user.favoriteTeam.discover.error"));
  } finally {
    const next = new Set(pendingUuids.value);
    next.delete(team.uuid);
    pendingUuids.value = next;
  }
};

onBeforeUnmount(() => {
  if (debounceTimer) clearTimeout(debounceTimer);
  stampTimers.forEach((timer) => clearTimeout(timer));
  stampTimers.clear();
});

loadSuggestions();
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* The stamp: an emerald disc that snaps over the crest you just collected. */
.crest-stamp {
  animation: stamp-in 220ms cubic-bezier(0.22, 1.2, 0.36, 1);
}
@keyframes stamp-in {
  from {
    opacity: 0;
    transform: scale(0.7);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Cards settle into place when one leaves the wall. */
.crest-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
  position: absolute;
}
.crest-leave-to {
  opacity: 0;
  transform: scale(0.9);
}
.crest-move {
  transition: transform 0.25s ease;
}

@media (prefers-reduced-motion: reduce) {
  .crest-stamp {
    animation: none;
  }
  .crest-leave-active,
  .crest-move {
    transition: none;
  }
}
</style>
