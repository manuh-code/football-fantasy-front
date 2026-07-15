<template>
  <!-- Top header for Home — replaces the global HeaderMenu on this route.
       Mirrors HeaderMenu's actions (brand + login/avatar) and adds a stage switcher.
       Teleported to <body> so its `position: fixed` resolves against the viewport:
       the route lives inside App.vue's `.app-content`, which has a `transform`
       (swipe nav) and would otherwise become the containing block — pinning the
       header to the scrolling content instead of the screen. -->
  <Teleport to="body">
  <header
    class="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-b border-gray-100 dark:border-gray-800 safe-area-top"
  >
    <div class="max-w-7xl mx-auto flex items-center gap-2 px-4 h-12 sm:h-14">
      <!-- Brand -->
      <!-- <button
        @click="handleGoHome"
        class="flex items-center -ml-1 px-1.5 py-1 rounded-xl active:bg-gray-100 dark:active:bg-gray-800 transition-colors duration-150 focus:outline-none shrink-0"
        aria-label="Go to home"
        title="Go to Home"
      >
        <div class="w-8 h-8 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-[10px] flex items-center justify-center">
          <v-icon name="hi-solid-lightning-bolt" class="w-[18px] h-[18px] text-white" />
        </div>
      </button> -->

      <!-- Stage switcher chip (opens bottom-sheet). Sizes to its content (capped + truncated),
           never stretches — the spacer below pushes the auth controls to the right. -->
      <button
        v-if="hasLeague"
        @click="openDrawer"
        class="flex items-center gap-1.5 min-w-0 max-w-[55%] sm:max-w-[260px] h-9 pl-1.5 pr-2 rounded-full bg-gray-100 dark:bg-gray-800 active:bg-gray-200 dark:active:bg-gray-700 transition-colors focus:outline-none"
        :aria-label="$t('home.header.changeStage')"
        aria-haspopup="dialog"
      >
        <img
          :src="leagueImage || '/img/default-avatar.svg'"
          :alt="leagueName"
          class="w-6 h-6 rounded-md object-cover shrink-0"
        />
        <span class="text-footnote font-semibold text-gray-900 dark:text-white truncate min-w-0">
          {{ currentStageLabel || leagueName }}
        </span>
        <v-icon name="hi-solid-chevron-down" class="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 shrink-0" />
      </button>

      <!-- Spacer: keeps the chip hugging the brand and pushes auth to the far right -->
      <div class="flex-1" />

      <!-- Auth: login / profile -->
      <div class="flex items-center shrink-0">
        <button
          v-if="!isAuthenticatedRef"
          @click="handleLogin"
          class="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white rounded-full font-semibold text-footnote transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          :aria-label="$t('home.header.login')"
        >
          {{ $t('home.header.login') }}
        </button>

        <button
          v-else
          @click="handleViewProfile"
          class="relative w-8 h-8 rounded-full overflow-hidden ring-2 ring-gray-100 dark:ring-gray-700 hover:ring-emerald-500/50 dark:hover:ring-emerald-400/50 transition-all duration-150 focus:outline-none active:scale-95"
          :title="$t('home.header.profileTitle', { name: userName })"
          :aria-label="$t('home.header.profileAria')"
        >
          <img
            v-if="avatarUrl"
            :src="avatarUrl"
            :alt="userName"
            class="w-full h-full object-cover"
          />
          <div
            v-else
            class="w-full h-full flex items-center justify-center bg-emerald-500 text-white text-2xs font-bold"
          >
            {{ userInitials }}
          </div>
        </button>
      </div>
    </div>
  </header>
  </Teleport>

  <!-- Stage switcher bottom-sheet -->
  <Teleport to="body">
    <Transition name="hsm-fade">
      <div
        v-if="drawerOpen"
        class="fixed inset-0 z-[105] bg-black/60 backdrop-blur-sm"
        @click="closeDrawer"
      />
    </Transition>

    <Transition name="hsm-slide" @after-leave="dragOffsetY = 0">
      <div
        v-if="drawerOpen"
        class="fixed bottom-0 left-0 right-0 z-[110] md:left-4 md:right-4 md:bottom-4 md:max-w-md md:mx-auto pointer-events-none"
      >
        <div
          :style="{
            transform: `translateY(${dragOffsetY}px)`,
            transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)',
          }"
          class="flex flex-col bg-white dark:bg-gray-900 shadow-2xl rounded-t-3xl md:rounded-3xl max-h-[80dvh] overflow-hidden pointer-events-auto"
          role="dialog"
          aria-modal="true"
          :aria-label="$t('home.stage.ariaLabel')"
        >
          <!-- Draggable header -->
          <div
            @pointerdown="onDragStart"
            @pointermove="onDragMove"
            @pointerup="onDragEnd"
            @pointercancel="onDragEnd"
            class="relative shrink-0 border-b border-gray-100 dark:border-gray-800 cursor-grab active:cursor-grabbing touch-none select-none"
          >
            <div class="flex justify-center pt-2.5 pb-1.5">
              <div class="w-10 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600" />
            </div>
            <div class="flex items-center justify-between px-4 pb-3 pt-1">
              <h3 class="text-callout font-bold text-gray-900 dark:text-white">{{ $t('home.stage.title') }}</h3>
              <button
                @click.stop="closeDrawer"
                @pointerdown.stop
                class="w-8 h-8 -mr-1 flex items-center justify-center rounded-full text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                :aria-label="$t('common.actions.close')"
              >
                <v-icon name="hi-x" class="w-4 h-4" />
              </button>
            </div>
          </div>

          <!-- Picker -->
          <div
            class="flex-1 overflow-y-auto overscroll-contain pt-3"
            style="padding-bottom: calc(1rem + env(safe-area-inset-bottom))"
          >
            <StageSelector
              v-model:stage-uuid="selectedStageUuid"
              :stages="stages"
              :loading="loadingStages"
              @select="closeDrawer"
            />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from "vue";
import { useRouter } from "vue-router";
import { useFootballLeagueStore } from "@/store/football/league/useFootballLeagueStore";
import { useAuthStore } from "@/store/auth/useAuthStore";
import { useUserStore } from "@/store/user/useUserStore";
import { footballLeagueService } from "@/services/football/league/FootballLeagueService";
import { useToast } from "@/composables/useToast";
import { useI18n } from "vue-i18n";
import { getActivePinia, type Pinia, type Store } from "pinia";
import type { FootballStageResponse } from "@/interfaces/football/stage/FootballStageResponse";
import StageSelector from "@/components/football/leagues/StageSelector.vue";

// Two-way bindings so the parent (HomeComponent) always has the active context.
const selectedStageUuid = defineModel<string>("stageUuid", { default: "" });
const selectedSeasonUuid = defineModel<string>("seasonUuid", { default: "" });

const router = useRouter();
const store = useFootballLeagueStore();
const authStore = useAuthStore();
const userStore = useUserStore();
const { error: showError } = useToast();
const { t } = useI18n();

// ── League / stage state ──
const stages = ref<FootballStageResponse[]>([]);
const loadingStages = ref(false);

const hasLeague = computed(() => store.existLeague());
const leagueName = computed(() => store.getLeague?.name ?? t("home.league.fallbackName"));
const leagueImage = computed(() => store.getLeague?.image_path ?? "");

const currentStageLabel = computed(() => {
  const stage = stages.value.find((s) => s.uuid === selectedStageUuid.value);
  if (!stage) return "";
  return (stage.name_complete as string | null) || stage.name;
});

// Keep the season in sync with the selected stage.
watch(selectedStageUuid, (uuid) => {
  const stage = stages.value.find((s) => s.uuid === uuid);
  if (stage) selectedSeasonUuid.value = stage.season_uuid;
});

const is404Error = (e: unknown): boolean => {
  const err = e as Record<string, unknown>;
  return err?.status === 404 || (err?.response as Record<string, unknown>)?.status === 404;
};

/** Reset all Pinia stores, clear localStorage, and reload. With no league
 *  selected, the router guard redirects to the league selection page. */
const resetStoresAndShowLeagueModal = () => {
  const pinia = getActivePinia() as Pinia & { _s: Map<string, Store> };
  if (pinia) {
    pinia._s.forEach((s) => {
      try {
        s.$reset();
      } catch {
        const emptyState: Record<string, null> = {};
        Object.keys(s.$state).forEach((key) => { emptyState[key] = null; });
        s.$patch(emptyState);
      }
    });
  }
  const keys: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) keys.push(key);
  }
  keys.forEach((key) => localStorage.removeItem(key));

  showError(t("home.league.notFound.title"), t("home.league.notFound.message"));
  globalThis.location.reload();
};

/** Apply the loaded stages and auto-select the current one (or the first). */
const applyStages = (res: FootballStageResponse[]) => {
  stages.value = res;
  const currentStage = res.find((s) => s.is_current === true) || res[0];
  selectedStageUuid.value = currentStage.uuid;
  selectedSeasonUuid.value = currentStage.season_uuid;
  store.setCurrentStageUuid(currentStage.uuid);
};

/**
 * Fetch stages for the current league and auto-select the current one.
 * On 404: retries once. If still fails, resets all stores and shows league modal.
 */
const fetchStages = async () => {
  const leagueUuid = store.getFootballLeagueUuid();
  if (!leagueUuid) return;

  loadingStages.value = true;
  stages.value = [];
  selectedStageUuid.value = "";
  selectedSeasonUuid.value = "";

  try {
    const res = await footballLeagueService.getStage(leagueUuid);
    if (Array.isArray(res) && res.length > 0) {
      applyStages(res);
    }
  } catch (e) {
    if (is404Error(e)) {
      try {
        const res = await footballLeagueService.getStage(leagueUuid);
        if (Array.isArray(res) && res.length > 0) {
          applyStages(res);
        }
      } catch (_retryError: unknown) {
        console.error("Retry failed for getStage:", _retryError);
        resetStoresAndShowLeagueModal();
        return;
      }
    } else {
      console.error("Error loading stages:", e);
    }
  } finally {
    loadingStages.value = false;
  }
};

// Re-fetch stages when the league changes.
watch(() => store.getLeague, () => {
  fetchStages();
});

// Persist stage selection so other views (e.g. FavoriteTeam) can open the team drawer.
watch(selectedStageUuid, (uuid) => {
  if (uuid) store.setCurrentStageUuid(uuid);
});

// ── Bottom-sheet drawer ──
const drawerOpen = ref(false);
const openDrawer = () => { drawerOpen.value = true; };
const closeDrawer = () => { drawerOpen.value = false; };

watch(drawerOpen, (open) => {
  if (typeof document !== "undefined") {
    document.body.style.overflow = open ? "hidden" : "";
  }
  if (!open) {
    isDragging.value = false;
  }
});

// Drag-to-dismiss (same pattern as the other match-center drawers).
const dragOffsetY = ref(0);
const isDragging = ref(false);
const dragStartY = ref(0);
const dragStartTime = ref(0);

const onDragStart = (e: PointerEvent) => {
  if (e.pointerType === "mouse" && e.button !== 0) return;
  isDragging.value = true;
  dragStartY.value = e.clientY;
  dragStartTime.value = Date.now();
  dragOffsetY.value = 0;
  (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
};

const onDragMove = (e: PointerEvent) => {
  if (!isDragging.value) return;
  const delta = e.clientY - dragStartY.value;
  dragOffsetY.value = delta > 0 ? delta : delta * 0.15;
};

const onDragEnd = (e: PointerEvent) => {
  if (!isDragging.value) return;
  isDragging.value = false;
  try {
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
  } catch {
    // ignore
  }
  const elapsed = Date.now() - dragStartTime.value;
  const velocity = elapsed > 0 ? dragOffsetY.value / elapsed : 0;
  const shouldClose = dragOffsetY.value > 100 || velocity > 0.6;
  if (shouldClose) {
    // Let the sheet's own leave transition carry it the rest of the way from
    // wherever the drag released it. Snapping the offset back to 0 first would
    // fight the leave animation and turn the close into a stutter instead of
    // one continuous motion.
    closeDrawer();
  } else {
    dragOffsetY.value = 0;
  }
};

// ── Auth (mirrors HeaderMenu) ──
const isAuthenticatedRef = ref(false);

watch(() => authStore.token, async (newToken) => {
  isAuthenticatedRef.value = newToken ? await authStore.isAuthenticated() : false;
}, { immediate: true });

const avatarUrl = computed(() => userStore.getAvatarUrl);

const userInitials = computed(() => {
  const userData = userStore.getUserData;
  if (userData?.firstname && userData?.lastname) {
    return `${userData.firstname[0]}${userData.lastname[0]}`.toUpperCase();
  }
  return "U";
});

const userName = computed(() => {
  const userData = userStore.getUserData;
  if (userData?.firstname && userData?.lastname) {
    return `${userData.firstname} ${userData.lastname}`;
  }
  return t("user.settings.accountFallbackName");
});

const handleLogin = () => router.push({ name: "login" });

const handleViewProfile = () => {
  if (router.currentRoute.value.name === "userSettings") return;
  router.push({ name: "userSettings" });
};

// ── Escape to close drawer + lifecycle ──
const onKeydown = (e: KeyboardEvent) => {
  if (e.key === "Escape" && drawerOpen.value) closeDrawer();
};

onMounted(() => {
  window.addEventListener("keydown", onKeydown);
  if (hasLeague.value) fetchStages();
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", onKeydown);
  if (typeof document !== "undefined") document.body.style.overflow = "";
});
</script>

<style scoped>
.hsm-fade-enter-active,
.hsm-fade-leave-active {
  transition: opacity 0.2s ease;
}
.hsm-fade-enter-from,
.hsm-fade-leave-to {
  opacity: 0;
}

.hsm-slide-enter-active,
.hsm-slide-leave-active {
  transition: transform 0.35s cubic-bezier(0.32, 0.72, 0, 1);
}
.hsm-slide-enter-from,
.hsm-slide-leave-to {
  transform: translateY(100%);
}

.safe-area-top {
  padding-top: env(safe-area-inset-top, 0px);
}
</style>
