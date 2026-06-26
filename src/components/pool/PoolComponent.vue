<template>
  <div class="space-y-4">
    <!-- Loading State -->
    <PoolListSkeleton v-if="isLoading" />

    <!-- Error State -->
    <div v-else-if="errorMessage" class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 p-6 text-center">
      <v-icon name="hi-solid-exclamation" class="w-8 h-8 text-red-400 mx-auto mb-3" />
      <p class="text-footnote text-red-500 dark:text-red-400 mb-4">{{ errorMessage }}</p>
      <button
        @click="loadPools"
        class="px-4 py-1.5 bg-red-500 text-white rounded-full text-footnote font-medium active:bg-red-600 transition-colors"
      >
        {{ $t('common.actions.retry') }}
      </button>
    </div>

    <!-- Pools List -->
    <template v-else-if="pools.length > 0">
      <!-- Section Header -->
      <div class="px-1">
        <h2 class="text-callout font-semibold text-gray-900 dark:text-white">{{ $t('pool.myPools') }}</h2>
        <p class="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{{ $t('pool.list.count', { count: pools.length }, pools.length) }}</p>
      </div>

      <!-- Pools Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        <div
          v-for="pool in pools"
          :key="pool.uuid"
          @click="goToPool(pool.uuid)"
          class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 overflow-hidden transition-all duration-200 cursor-pointer active:scale-[0.98] hover:shadow-md"
        >
          <div class="p-4">
            <!-- Header: icon + name + stage badge -->
            <div class="flex items-start gap-3">
              <div class="w-11 h-11 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center shrink-0">
                <v-icon name="hi-solid-document-text" class="w-5 h-5 text-white" />
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-start justify-between gap-2">
                  <h3 class="text-callout font-semibold text-gray-900 dark:text-white leading-tight truncate">
                    {{ pool.name }}
                  </h3>
                  <span
                    v-if="pool.stage"
                    :class="[
                      'inline-flex items-center px-2 py-0.5 rounded-full text-2xs font-semibold shrink-0',
                      stageBadge(pool.stage).classes,
                    ]"
                  >
                    {{ stageBadge(pool.stage).label }}
                  </span>
                </div>
                <p v-if="pool.description" class="text-footnote text-gray-500 dark:text-gray-400 leading-snug mt-0.5 line-clamp-2">
                  {{ pool.description }}
                </p>
              </div>
            </div>

            <!-- Footer: participants + stage name -->
            <div class="flex items-center gap-4 mt-3 pt-3 border-t border-gray-50 dark:border-gray-700/40">
              <div class="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500 shrink-0">
                <v-icon name="hi-solid-users" class="w-3.5 h-3.5" />
                <span>{{ $t('pool.list.upTo', { count: pool.max_participants }) }}</span>
              </div>
              <div v-if="pool.stage" class="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500 min-w-0">
                <v-icon name="hi-solid-calendar" class="w-3.5 h-3.5 shrink-0" />
                <span class="truncate">{{ pool.stage.name_complete || pool.stage.name }}</span>
              </div>
            </div>

            <!-- Access code — admin can copy and share it to invite participants -->
            <div v-if="pool.access_code" class="mt-3 pt-3 border-t border-gray-50 dark:border-gray-700/40">
              <p class="text-2xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-1.5">
                {{ $t('pool.group.accessCode') }}
              </p>
              <div class="flex items-center gap-2">
                <!-- Code chip (tap to copy just the code) -->
                <button
                  type="button"
                  @click.stop="copyAccessCode(pool)"
                  :title="copiedUuid === pool.uuid ? $t('pool.group.copiedTitle') : $t('pool.group.copyAccessCode')"
                  class="group flex-1 min-w-0 flex items-center gap-2 bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-xl px-3 py-2 transition-all active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                >
                  <span class="flex-1 text-left font-mono text-sm font-semibold tracking-wider text-gray-900 dark:text-white truncate">
                    {{ pool.access_code }}
                  </span>
                  <v-icon
                    :name="copiedUuid === pool.uuid ? 'hi-solid-check' : 'hi-solid-duplicate'"
                    :class="[
                      'w-4 h-4 shrink-0 transition-colors',
                      copiedUuid === pool.uuid
                        ? 'text-emerald-500'
                        : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300',
                    ]"
                  />
                </button>

                <!-- Share invite link (native share sheet / copy link fallback) -->
                <button
                  type="button"
                  @click.stop="sharePool(pool)"
                  :title="sharedUuid === pool.uuid ? $t('pool.group.linkCopiedTitle') : $t('pool.group.shareInvite')"
                  class="shrink-0 flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-3 py-2 transition-all active:scale-[0.98] shadow-sm shadow-emerald-500/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                >
                  <v-icon
                    :name="sharedUuid === pool.uuid ? 'hi-solid-check' : 'hi-solid-share'"
                    class="w-4 h-4"
                  />
                  <span class="text-2xs font-semibold">
                    {{ sharedUuid === pool.uuid ? $t('common.actions.copied') : $t('common.actions.share') }}
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
      <v-icon name="hi-solid-document-text" class="w-10 h-10 text-gray-200 dark:text-gray-700 mx-auto mb-3" />
      <h3 class="text-callout font-semibold text-gray-900 dark:text-white mb-1">{{ $t('pool.emptyTitle') }}</h3>
      <p class="text-footnote text-gray-400 dark:text-gray-500 max-w-xs mx-auto leading-relaxed">
        {{ $t('pool.emptyBody') }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import { useRouter } from "vue-router";
import { poolService } from "@/services/pool/poolService";
import { PoolResponse } from "@/interfaces/pool/PoolResponse";
import { FootballStageResponse } from "@/interfaces/football/stage/FootballStageResponse";
import { useToast } from "@/composables/useToast";
import { useI18n } from "vue-i18n";
import PoolListSkeleton from "@/components/pool/PoolListSkeleton.vue";

const router = useRouter();
const { t } = useI18n();
const { success, error } = useToast();

// Navigate to the pool group detail view.
const goToPool = (uuid: string) => {
  router.push({ name: "poolGroup", params: { uuid } });
};

// State
const isLoading = ref(false);
const errorMessage = ref<string>("");
const pools = ref<PoolResponse[]>([]);

// Tracks which pool's access code was just copied (to show the "Copied" feedback).
const copiedUuid = ref<string | null>(null);
let copyResetTimer: ReturnType<typeof setTimeout> | undefined;

// Tracks which pool's invite link was just copied (clipboard fallback feedback).
const sharedUuid = ref<string | null>(null);
let shareResetTimer: ReturnType<typeof setTimeout> | undefined;

// Build the public invite link for a pool. Opening it lands the recipient on the
// Pools page with the Join sheet pre-filled with this access code (see PoolView).
const buildInviteLink = (accessCode: string) =>
  `${window.location.origin}/pools?join=${encodeURIComponent(accessCode)}`;

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

// Resolve the badge shown for a pool's stage based on its lifecycle.
const stageBadge = (stage: FootballStageResponse) => {
  if (stage.is_current) {
    return {
      label: t("pool.group.badge.live"),
      classes: "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400",
    };
  }
  if (stage.finished) {
    return {
      label: t("pool.group.badge.finished"),
      classes: "bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500",
    };
  }
  return {
    label: "",
    classes: "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
  };
};

// Copy a pool's access code to the clipboard so the admin can share it.
const copyAccessCode = async (pool: PoolResponse) => {
  if (!pool.access_code) return;

  try {
    await copyToClipboard(pool.access_code);

    copiedUuid.value = pool.uuid;
    success(t("pool.group.toast.codeCopiedTitle"), t("pool.group.toast.shareBody"));

    clearTimeout(copyResetTimer);
    copyResetTimer = setTimeout(() => {
      if (copiedUuid.value === pool.uuid) copiedUuid.value = null;
    }, 2000);
  } catch (e) {
    console.error("Failed to copy access code:", e);
    error(t("pool.group.toast.copyFailedTitle"), t("pool.group.toast.copyCodeFailedBody"));
  }
};

// Share a pool's invite link. On supported devices (mobile/PWA) this opens the
// native share sheet (WhatsApp, Telegram, etc.); elsewhere it falls back to
// copying the link to the clipboard.
const sharePool = async (pool: PoolResponse) => {
  if (!pool.access_code) return;

  const url = buildInviteLink(pool.access_code);
  const shareData: ShareData = {
    title: t("pool.group.share.title", { name: pool.name }),
    text: t("pool.group.share.text", { name: pool.name, code: pool.access_code }),
    url,
  };

  // Prefer the native share sheet when available.
  if (navigator.share && (!navigator.canShare || navigator.canShare(shareData))) {
    try {
      await navigator.share(shareData);
    } catch (e) {
      // The user dismissing the share sheet rejects with AbortError — not an error.
      if ((e as DOMException)?.name !== "AbortError") {
        console.error("Failed to share pool:", e);
      }
    }
    return;
  }

  // Fallback: copy the invite link.
  try {
    await copyToClipboard(url);

    sharedUuid.value = pool.uuid;
    success(t("pool.group.toast.linkCopiedTitle"), t("pool.group.toast.shareBody"));

    clearTimeout(shareResetTimer);
    shareResetTimer = setTimeout(() => {
      if (sharedUuid.value === pool.uuid) sharedUuid.value = null;
    }, 2000);
  } catch (e) {
    console.error("Failed to copy invite link:", e);
    error(t("pool.group.toast.copyFailedTitle"), t("pool.group.toast.copyLinkFailedBody"));
  }
};

// Methods
const loadPools = async () => {
  isLoading.value = true;
  errorMessage.value = "";

  try {
    pools.value = await poolService.getMyPools();
  } catch (error) {
    console.error("Error loading pools:", error);
    errorMessage.value = t("pool.loadError");
  } finally {
    isLoading.value = false;
  }
};

// Lifecycle
onMounted(async () => {
  await loadPools();
});

onUnmounted(() => {
  clearTimeout(copyResetTimer);
  clearTimeout(shareResetTimer);
});

// Let the parent view refresh the list after creating/joining a pool.
defineExpose({ reload: loadPools });
</script>

<style scoped>
/* Clamp pool description to two lines (no Tailwind line-clamp plugin in this project). */
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
