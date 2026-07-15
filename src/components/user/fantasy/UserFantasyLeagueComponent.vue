<template>
  <div class="space-y-4">
    <!-- Loading State -->
    <FantasyLeagueListSkeleton v-if="isLoading" />

    <!-- Error State -->
    <div v-else-if="errorMessage" class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 p-6 text-center">
      <v-icon name="hi-solid-exclamation" class="w-8 h-8 text-red-400 mx-auto mb-3" />
      <p class="text-footnote text-red-500 dark:text-red-400 mb-4">{{ errorMessage }}</p>
      <button
        @click="loadFantasyLeagues"
        class="px-4 py-1.5 bg-red-500 text-white rounded-full text-footnote font-medium active:bg-red-600 transition-colors"
      >
        {{ $t('common.actions.retry') }}
      </button>
    </div>

    <!-- Fantasy Leagues List -->
    <template v-else-if="fantasyLeagues && fantasyLeagues.length > 0">
      <!-- Section Header -->
      <div class="px-1">
        <h2 class="text-callout font-semibold text-gray-900 dark:text-white">{{ $t('fantasy.userLeagues.title') }}</h2>
        <p class="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{{ fantasyLeagues.length === 1 ? $t('fantasy.userLeagues.countOne', { count: fantasyLeagues.length }) : $t('fantasy.userLeagues.countOther', { count: fantasyLeagues.length }) }}</p>
      </div>

      <!-- Leagues Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        <div
          v-for="league in fantasyLeagues"
          :key="league.uuid"
          @click="viewLeague(league)"
          class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 overflow-hidden transition-all duration-200 cursor-pointer active:scale-[0.98] hover:shadow-md"
        >
          <div class="p-4">
            <!-- Header: icon + name + role badge -->
            <div class="flex items-start gap-3">
              <div class="w-11 h-11 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shrink-0">
                <v-icon name="bi-trophy-fill" class="w-5 h-5 text-white" />
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-start justify-between gap-2">
                  <h3 class="text-callout font-semibold text-gray-900 dark:text-white leading-tight truncate">
                    {{ league.name }}
                  </h3>
                  <span
                    v-if="league.isAdmin || league.isMember"
                    :class="[
                      'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-2xs font-semibold shrink-0',
                      league.isAdmin
                        ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
                        : 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
                    ]"
                  >
                    <v-icon :name="league.isAdmin ? 'hi-solid-star' : 'hi-solid-check-circle'" class="w-2.5 h-2.5" />
                    {{ league.isAdmin ? $t('fantasy.leagueCard.admin') : $t('fantasy.leagueCard.member') }}
                  </span>
                </div>
                <p v-if="league.description" class="text-footnote text-gray-500 dark:text-gray-400 leading-snug mt-0.5 line-clamp-2">
                  {{ league.description }}
                </p>
              </div>
            </div>

            <!-- Footer: privacy + start date + members/participants -->
            <div class="flex items-center gap-4 mt-3 pt-3 border-t border-gray-50 dark:border-gray-700/40">
              <div class="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500 shrink-0">
                <v-icon :name="league.is_private ? 'hi-solid-lock-closed' : 'hi-solid-globe-alt'" class="w-3.5 h-3.5" />
                <span>{{ league.is_private ? $t('fantasy.leagueCard.private') : $t('fantasy.leagueCard.public') }}</span>
              </div>
              <div class="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500 min-w-0">
                <v-icon name="hi-solid-calendar" class="w-3.5 h-3.5 shrink-0" />
                <span class="truncate">{{ formatDate(league.started_at) }}</span>
              </div>
              <div class="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500 shrink-0">
                <v-icon name="hi-solid-users" class="w-3.5 h-3.5" />
                <span class="tabular-nums">{{ league.members_count ?? 0 }}/{{ league.participants_count }}</span>
              </div>
            </div>

            <!-- Access code — admin can copy and share it to invite participants -->
            <div v-if="league.isAdmin && league.password" class="mt-3 pt-3 border-t border-gray-50 dark:border-gray-700/40">
              <p class="text-2xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-1.5">
                {{ $t('fantasy.share.accessCode') }}
              </p>
              <div class="flex items-center gap-2">
                <!-- Code chip (tap to copy just the code) -->
                <button
                  type="button"
                  @click.stop="copyAccessCode(league)"
                  :title="copiedUuid === league.uuid ? $t('fantasy.share.copiedTitle') : $t('fantasy.share.copyAccessCode')"
                  class="group flex-1 min-w-0 flex items-center gap-2 bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-xl px-3 py-2 transition-all active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                >
                  <span class="flex-1 text-left font-mono text-sm font-semibold tracking-wider text-gray-900 dark:text-white truncate">
                    {{ league.password }}
                  </span>
                  <v-icon
                    :name="copiedUuid === league.uuid ? 'hi-solid-check' : 'hi-solid-duplicate'"
                    :class="[
                      'w-4 h-4 shrink-0 transition-colors',
                      copiedUuid === league.uuid
                        ? 'text-emerald-500'
                        : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300',
                    ]"
                  />
                </button>

                <!-- Share invite link (native share sheet / copy link fallback) -->
                <button
                  type="button"
                  @click.stop="shareLeague(league)"
                  :title="sharedUuid === league.uuid ? $t('fantasy.share.linkCopiedTitle') : $t('fantasy.share.shareInvite')"
                  class="shrink-0 flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-3 py-2 transition-all active:scale-[0.98] shadow-sm shadow-emerald-500/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                >
                  <v-icon
                    :name="sharedUuid === league.uuid ? 'hi-solid-check' : 'hi-solid-share'"
                    class="w-4 h-4"
                  />
                  <span class="text-2xs font-semibold">
                    {{ sharedUuid === league.uuid ? $t('common.actions.copied') : $t('common.actions.share') }}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Empty State -->
    <div v-else class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 py-12 text-center">
      <v-icon name="bi-trophy-fill" class="w-10 h-10 text-gray-200 dark:text-gray-700 mx-auto mb-3" />
      <h3 class="text-callout font-semibold text-gray-900 dark:text-white mb-1">{{ $t('fantasy.userLeagues.emptyTitle') }}</h3>
      <p class="text-footnote text-gray-400 dark:text-gray-500 max-w-xs mx-auto leading-relaxed">
        {{ $t('fantasy.userLeagues.emptyBody') }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useUserStore } from "@/store/user/useUserStore";
import { useToast } from "@/composables/useToast";
import FantasyLeagueListSkeleton from "@/components/fantasy/FantasyLeagueListSkeleton.vue";
import type { FantasyLeaguesResponse } from "@/interfaces/fantasy/leagues/FantasyLeaguesResponse";

// Stores and composables
const userStore = useUserStore();
const router = useRouter();
const { t, locale } = useI18n();
const { success, error } = useToast();

// State
const isLoading = ref(false);
const errorMessage = ref<string>("");

// Tracks which league's access code was just copied (to show the "Copied" feedback).
const copiedUuid = ref<string | null>(null);
let copyResetTimer: ReturnType<typeof setTimeout> | undefined;

// Tracks which league's invite link was just copied (clipboard fallback feedback).
const sharedUuid = ref<string | null>(null);
let shareResetTimer: ReturnType<typeof setTimeout> | undefined;

// Computed properties
const fantasyLeagues = computed(() => userStore.getUserFantasyLeagues);

// Methods
const loadFantasyLeagues = async () => {
  isLoading.value = true;
  errorMessage.value = "";

  try {
    await userStore.getUserFantasyLeaguesFromApi();
  } catch (error) {
    console.error("Error loading fantasy leagues:", error);
    errorMessage.value = t("fantasy.userLeagues.loadError");
  } finally {
    isLoading.value = false;
  }
};

const formatDate = (dateString: string): string =>
  new Date(dateString).toLocaleDateString(locale.value, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

const viewLeague = (league: FantasyLeaguesResponse) => {
  router.push({ name: "fantasyLeagueDetail", params: { uuid: league.uuid } });
};

// Build the public invite link for a league. Opening it lands the recipient on the
// My Leagues page with the Join sheet pre-filled with this access code (see UserFantasyLeagueView).
const buildInviteLink = (accessCode: string) =>
  `${window.location.origin}/my/fantasy/leagues?join=${encodeURIComponent(accessCode)}`;

// Copy arbitrary text, falling back to a hidden textarea on non-secure contexts
// or older browsers that lack the async clipboard API.
const copyToClipboard = async (text: string) => {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  textarea.remove();
};

// Copy a league's access code to the clipboard so the admin can share it.
const copyAccessCode = async (league: FantasyLeaguesResponse) => {
  if (!league.password) return;

  try {
    await copyToClipboard(league.password);

    copiedUuid.value = league.uuid;
    success(t("fantasy.share.toast.codeCopiedTitle"), t("fantasy.share.toast.shareBody"));

    clearTimeout(copyResetTimer);
    copyResetTimer = setTimeout(() => {
      if (copiedUuid.value === league.uuid) copiedUuid.value = null;
    }, 2000);
  } catch (e) {
    console.error("Failed to copy access code:", e);
    error(t("fantasy.share.toast.copyFailedTitle"), t("fantasy.share.toast.copyCodeFailedBody"));
  }
};

// Share a league's invite link. On supported devices (mobile/PWA) this opens the
// native share sheet (WhatsApp, Telegram, etc.); elsewhere it falls back to
// copying the link to the clipboard.
const shareLeague = async (league: FantasyLeaguesResponse) => {
  if (!league.password) return;

  const url = buildInviteLink(league.password);
  const shareData: ShareData = {
    title: t("fantasy.share.shareText.title", { name: league.name }),
    text: t("fantasy.share.shareText.text", { name: league.name, code: league.password }),
    url,
  };

  // Prefer the native share sheet when available.
  if (navigator.share && (!navigator.canShare || navigator.canShare(shareData))) {
    try {
      await navigator.share(shareData);
    } catch (e) {
      // The user dismissing the share sheet rejects with AbortError — not an error.
      if ((e as DOMException)?.name !== "AbortError") {
        console.error("Failed to share league:", e);
      }
    }
    return;
  }

  // Fallback: copy the invite link.
  try {
    await copyToClipboard(url);

    sharedUuid.value = league.uuid;
    success(t("fantasy.share.toast.linkCopiedTitle"), t("fantasy.share.toast.shareBody"));

    clearTimeout(shareResetTimer);
    shareResetTimer = setTimeout(() => {
      if (sharedUuid.value === league.uuid) sharedUuid.value = null;
    }, 2000);
  } catch (e) {
    console.error("Failed to copy invite link:", e);
    error(t("fantasy.share.toast.copyFailedTitle"), t("fantasy.share.toast.copyLinkFailedBody"));
  }
};

// Lifecycle
onMounted(async () => {
  // Always refresh leagues to reflect recent joins or changes
  await loadFantasyLeagues();
});

onUnmounted(() => {
  clearTimeout(copyResetTimer);
  clearTimeout(shareResetTimer);
});

// Let the parent view refresh the list after creating/joining a league.
defineExpose({ reload: loadFantasyLeagues });
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
    transform: none !important;
    animation: none !important;
  }
}
</style>
