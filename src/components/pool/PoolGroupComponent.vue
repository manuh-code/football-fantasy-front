<template>
  <div class="space-y-4">
    <!-- Loading State -->
    <PoolGroupSkeleton v-if="isLoading" />

    <!-- Error State -->
    <div
      v-else-if="errorMessage"
      class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 p-6 text-center"
    >
      <v-icon
        name="hi-solid-exclamation"
        class="w-8 h-8 text-red-400 mx-auto mb-3"
      />
      <p class="text-footnote text-red-500 dark:text-red-400 mb-4">
        {{ errorMessage }}
      </p>
      <button
        @click="loadPool"
        class="px-4 py-1.5 bg-red-500 text-white rounded-full text-footnote font-medium active:bg-red-600 transition-colors"
      >
        {{ $t("common.actions.retry") }}
      </button>
    </div>

    <!-- Pool Group -->
    <template v-else-if="pool">
      <!-- Header card (always visible) -->
      <div
        class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 p-5"
      >
        <div class="flex items-start gap-3">
          <div
            class="w-14 h-14 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center shrink-0"
          >
            <v-icon name="hi-solid-document-text" class="w-7 h-7 text-white" />
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-start justify-between gap-2">
              <h1
                class="text-xl font-bold text-gray-900 dark:text-white leading-tight"
              >
                {{ pool.name }}
              </h1>
              <span
                v-if="stageBadgeInfo"
                :class="[
                  'inline-flex items-center px-2 py-0.5 rounded-full text-2xs font-semibold shrink-0',
                  stageBadgeInfo.classes,
                ]"
              >
                {{ stageBadgeInfo.label }}
              </span>
            </div>
            <p
              v-if="pool.description"
              class="text-footnote text-gray-500 dark:text-gray-400 leading-snug mt-1"
            >
              {{ pool.description }}
            </p>
          </div>
        </div>
      </div>

      <!-- Info tab -->
      <template v-if="activeTab === 'info'">
        <!-- Details -->
        <div
          class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 divide-y divide-gray-50 dark:divide-gray-700/40"
        >
          <div
            v-if="pool.stage"
            class="flex items-center justify-between gap-3 px-4 py-3.5"
          >
            <span
              class="flex items-center gap-2 text-footnote text-gray-500 dark:text-gray-400"
            >
              <v-icon name="hi-solid-calendar" class="w-4 h-4 shrink-0" />
              {{ $t("pool.group.stage") }}
            </span>
            <span
              class="text-footnote font-medium text-gray-900 dark:text-white text-right truncate"
            >
              {{ pool.stage.name_complete || pool.stage.name }}
            </span>
          </div>
          <div
            v-if="pool.stage"
            class="flex items-center justify-between gap-3 px-4 py-3.5"
          >
            <span
              class="flex items-center gap-2 text-footnote text-gray-500 dark:text-gray-400"
            >
              <v-icon name="hi-solid-clock" class="w-4 h-4 shrink-0" />
              {{ $t("pool.group.dates") }}
            </span>
            <span
              class="text-footnote font-medium text-gray-900 dark:text-white text-right"
            >
              {{ formatDate(pool.stage.starting_at) }} –
              {{ formatDate(pool.stage.ending_at) }}
            </span>
          </div>
          <div class="flex items-center justify-between gap-3 px-4 py-3.5">
            <span
              class="flex items-center gap-2 text-footnote text-gray-500 dark:text-gray-400"
            >
              <v-icon name="hi-solid-users" class="w-4 h-4 shrink-0" />
              {{ $t("pool.group.participants") }}
            </span>
            <span
              class="text-footnote font-medium text-gray-900 dark:text-white text-right"
            >
              {{ memberCount }} / {{ pool.max_participants }}
            </span>
          </div>
        </div>

        <!-- Access code (admin can copy and share it) -->
        <div
          v-if="pool.access_code"
          class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 p-4"
        >
          <p
            class="text-2xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-1.5"
          >
            {{ $t("pool.group.accessCode") }}
          </p>
          <div class="flex items-center gap-2">
            <!-- Code chip (tap to copy just the code) -->
            <button
              type="button"
              @click="copyAccessCode"
              :title="
                copied
                  ? $t('pool.group.copiedTitle')
                  : $t('pool.group.copyAccessCode')
              "
              class="group flex-1 min-w-0 flex items-center gap-2 bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-xl px-3 py-2 transition-all active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
            >
              <span
                class="flex-1 text-left font-mono text-sm font-semibold tracking-wider text-gray-900 dark:text-white truncate"
              >
                {{ pool.access_code }}
              </span>
              <v-icon
                :name="copied ? 'hi-solid-check' : 'hi-solid-duplicate'"
                :class="[
                  'w-4 h-4 shrink-0 transition-colors',
                  copied
                    ? 'text-emerald-500'
                    : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300',
                ]"
              />
            </button>

            <!-- Share invite link (native share sheet / copy link fallback) -->
            <button
              type="button"
              @click="sharePool"
              :title="
                shared
                  ? $t('pool.group.linkCopiedTitle')
                  : $t('pool.group.shareInvite')
              "
              class="shrink-0 flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-3 py-2 transition-all active:scale-[0.98] shadow-sm shadow-emerald-500/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            >
              <v-icon
                :name="shared ? 'hi-solid-check' : 'hi-solid-share'"
                class="w-4 h-4"
              />
              <span class="text-2xs font-semibold">{{
                shared
                  ? $t("common.actions.copied")
                  : $t("common.actions.share")
              }}</span>
            </button>
          </div>
        </div>

        <!-- General standings shortcut — quick glance at the podium; tapping
             it (or its header) jumps straight to the full Standings tab. -->
        <PoolStandingsPreview
          :pool-group-uuid="pool.uuid"
          @view-full="emit('select-tab', 'standings')"
        />

        <!-- Members -->
        <div
          class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 p-4"
        >
          <h2
            class="text-callout font-semibold text-gray-900 dark:text-white mb-3"
          >
            {{ $t("pool.group.members") }}
          </h2>

          <div v-if="members.length > 0" class="space-y-1">
            <button
              v-for="(member, index) in members"
              :key="member.uuid || index"
              type="button"
              @click="openMemberPredictions(member)"
              :disabled="!pool?.stage"
              class="w-full flex items-center gap-3 py-2 -mx-1 px-1 rounded-xl text-left active:bg-gray-50 dark:active:bg-gray-700/30 transition-colors disabled:active:bg-transparent"
            >
              <img
                v-if="member.avatar"
                :src="member.avatar"
                :alt="memberName(member)"
                class="w-9 h-9 rounded-full object-cover shrink-0 ring-1 ring-gray-100 dark:ring-gray-700"
              />
              <div
                v-else
                class="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shrink-0"
              >
                <span class="text-xs font-semibold text-white">{{
                  memberInitials(member)
                }}</span>
              </div>
              <div class="flex-1 min-w-0">
                <p
                  class="text-footnote font-medium text-gray-900 dark:text-white truncate"
                >
                  {{ memberName(member) }}
                </p>
                <p
                  v-if="member.email"
                  class="text-xs text-gray-400 dark:text-gray-500 truncate"
                >
                  {{ member.email }}
                </p>
              </div>
              <v-icon
                v-if="pool?.stage"
                name="hi-solid-chevron-right"
                class="w-4 h-4 text-gray-300 dark:text-gray-600 shrink-0"
              />
            </button>
          </div>

          <p v-else class="text-footnote text-gray-400 dark:text-gray-500 py-2">
            {{ $t("pool.group.noMembers") }}
          </p>
        </div>
      </template>

      <!-- Predictions tab -->
      <PoolPredictionComponent
        v-else-if="activeTab === 'predictions' && pool.stage"
        :stage-uuid="pool.stage.uuid"
        :pool-group-uuid="pool.uuid"
      />
      <div
        v-else-if="activeTab === 'predictions'"
        class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 py-12 text-center"
      >
        <v-icon
          name="hi-solid-clipboard-list"
          class="w-10 h-10 text-gray-200 dark:text-gray-700 mx-auto mb-3"
        />
        <h3
          class="text-callout font-semibold text-gray-900 dark:text-white mb-1"
        >
          {{ $t("pool.group.predictionsUnavailable") }}
        </h3>
        <p
          class="text-footnote text-gray-400 dark:text-gray-500 max-w-xs mx-auto leading-relaxed"
        >
          {{ $t("pool.group.noStageAssigned") }}
        </p>
      </div>

      <!-- Standings tab -->
      <PoolStandingComponent
        v-else-if="activeTab === 'standings'"
        :pool-group-uuid="pool.uuid"
        :stage-uuid="pool.stage?.uuid"
      />
    </template>

    <!-- Member predictions drawer (opened by tapping a member above) -->
    <PoolMemberPredictionsSheet
      v-if="pool"
      :is-open="memberPredictionsOpen"
      :pool-group-uuid="pool.uuid"
      :stage-uuid="pool.stage?.uuid"
      :member="selectedMember"
      @close="memberPredictionsOpen = false"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { poolService } from "@/services/pool/poolService";
import { useToast } from "@/composables/useToast";
import { useI18n } from "vue-i18n";
import PoolGroupSkeleton from "@/components/pool/PoolGroupSkeleton.vue";
import PoolPredictionComponent from "@/components/pool/PoolPredictionComponent.vue";
import PoolStandingComponent from "@/components/pool/PoolStandingComponent.vue";
import PoolStandingsPreview from "@/components/pool/PoolStandingsPreview.vue";
import PoolMemberPredictionsSheet from "@/components/pool/PoolMemberPredictionsSheet.vue";
import type { PoolResponse } from "@/interfaces/pool/PoolResponse";
import type { UserDataInterface } from "@/interfaces/user/userInterface";

const props = withDefaults(
  defineProps<{ poolUuid: string; activeTab?: string }>(),
  { activeTab: "info" },
);

const emit = defineEmits<{ "select-tab": [key: string] }>();

const { success, error } = useToast();
const { t, locale } = useI18n();

// State
const isLoading = ref(false);
const errorMessage = ref("");
const pool = ref<PoolResponse | null>(null);

// Access code copy feedback
const copied = ref(false);
let copyResetTimer: ReturnType<typeof setTimeout> | undefined;

// Invite-link share feedback (clipboard fallback when the native share sheet
// isn't available).
const shared = ref(false);
let shareResetTimer: ReturnType<typeof setTimeout> | undefined;

// Build the public invite link. Opening it lands the recipient on the Pools page
// with the Join sheet pre-filled with this access code (handled in PoolView).
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

const members = computed<UserDataInterface[]>(
  () => pool.value?.memberships || [],
);
const memberCount = computed(() => members.value.length);

// Member predictions drawer — lets you drill into any membership's picks
// per round. Requires a stage (predictions are stage-scoped).
const memberPredictionsOpen = ref(false);
const selectedMember = ref<UserDataInterface | null>(null);

const openMemberPredictions = (member: UserDataInterface) => {
  if (!pool.value?.stage) return;
  selectedMember.value = member;
  memberPredictionsOpen.value = true;
};

// Badge shown for the pool's stage based on its lifecycle. Upcoming stages show
// no badge (the "Upcoming" label was intentionally removed).
const stageBadgeInfo = computed(() => {
  const stage = pool.value?.stage;
  if (!stage) return null;
  if (stage.is_current) {
    return {
      label: t("pool.group.badge.live"),
      classes:
        "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400",
    };
  }
  if (stage.finished) {
    return {
      label: t("pool.group.badge.finished"),
      classes: "bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500",
    };
  }
  return null;
});

const memberName = (member: UserDataInterface) => {
  const full = [member.firstname, member.lastname]
    .filter(Boolean)
    .join(" ")
    .trim();
  return full || member.email || t("pool.group.unknownMember");
};

const memberInitials = (member: UserDataInterface) => {
  const first = member.firstname?.[0] || "";
  const last = member.lastname?.[0] || "";
  const initials = (first + last).toUpperCase();
  return initials || member.email?.[0]?.toUpperCase() || "?";
};

const formatDate = (date?: string | null) => {
  if (!date) return "—";
  const parsed = new Date(date);
  if (isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString(locale.value, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const copyAccessCode = async () => {
  const code = pool.value?.access_code;
  if (!code) return;

  try {
    await copyToClipboard(code);

    copied.value = true;
    success(
      t("pool.group.toast.codeCopiedTitle"),
      t("pool.group.toast.shareBody"),
    );
    clearTimeout(copyResetTimer);
    copyResetTimer = setTimeout(() => (copied.value = false), 2000);
  } catch (e) {
    console.error("Failed to copy access code:", e);
    error(
      t("pool.group.toast.copyFailedTitle"),
      t("pool.group.toast.copyCodeFailedBody"),
    );
  }
};

// Share the invite link. On supported devices opens the native share sheet
// (WhatsApp, Telegram, etc.); otherwise falls back to copying the link.
const sharePool = async () => {
  const code = pool.value?.access_code;
  if (!code) return;

  const url = buildInviteLink(code);
  const shareData: ShareData = {
    title: t("pool.group.share.title", { name: pool.value?.name }),
    text: t("pool.group.share.text", { name: pool.value?.name, code }),
    url,
  };

  if (
    navigator.share &&
    (!navigator.canShare || navigator.canShare(shareData))
  ) {
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

    shared.value = true;
    success(
      t("pool.group.toast.linkCopiedTitle"),
      t("pool.group.toast.shareBody"),
    );
    clearTimeout(shareResetTimer);
    shareResetTimer = setTimeout(() => (shared.value = false), 2000);
  } catch (e) {
    console.error("Failed to copy invite link:", e);
    error(
      t("pool.group.toast.copyFailedTitle"),
      t("pool.group.toast.copyLinkFailedBody"),
    );
  }
};

const loadPool = async () => {
  if (!props.poolUuid) return;

  isLoading.value = true;
  errorMessage.value = "";

  try {
    pool.value = await poolService.getPoolByUuid(props.poolUuid);
  } catch (e) {
    console.error("Error loading pool group:", e);
    errorMessage.value = t("pool.group.loadError");
  } finally {
    isLoading.value = false;
  }
};

watch(() => props.poolUuid, loadPool);

onMounted(loadPool);

onUnmounted(() => {
  clearTimeout(copyResetTimer);
  clearTimeout(shareResetTimer);
});
</script>
