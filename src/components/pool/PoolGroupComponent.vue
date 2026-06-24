<template>
  <div class="space-y-4">
    <!-- Loading State -->
    <PoolGroupSkeleton v-if="isLoading" />

    <!-- Error State -->
    <div
      v-else-if="errorMessage"
      class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 p-6 text-center"
    >
      <v-icon name="hi-solid-exclamation" class="w-8 h-8 text-red-400 mx-auto mb-3" />
      <p class="text-footnote text-red-500 dark:text-red-400 mb-4">{{ errorMessage }}</p>
      <button
        @click="loadPool"
        class="px-4 py-1.5 bg-red-500 text-white rounded-full text-footnote font-medium active:bg-red-600 transition-colors"
      >
        Try Again
      </button>
    </div>

    <!-- Pool Group -->
    <template v-else-if="pool">
      <!-- Header card (always visible) -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 p-5">
        <div class="flex items-start gap-3">
          <div class="w-14 h-14 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center shrink-0">
            <v-icon name="hi-solid-document-text" class="w-7 h-7 text-white" />
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-start justify-between gap-2">
              <h1 class="text-xl font-bold text-gray-900 dark:text-white leading-tight">
                {{ pool.name }}
              </h1>
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
            <p v-if="pool.description" class="text-footnote text-gray-500 dark:text-gray-400 leading-snug mt-1">
              {{ pool.description }}
            </p>
          </div>
        </div>
      </div>

      <!-- Info tab -->
      <template v-if="activeTab === 'info'">
        <!-- Details -->
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 divide-y divide-gray-50 dark:divide-gray-700/40">
          <div v-if="pool.stage" class="flex items-center justify-between gap-3 px-4 py-3.5">
            <span class="flex items-center gap-2 text-footnote text-gray-500 dark:text-gray-400">
              <v-icon name="hi-solid-calendar" class="w-4 h-4 shrink-0" />
              Stage
            </span>
            <span class="text-footnote font-medium text-gray-900 dark:text-white text-right truncate">
              {{ pool.stage.name_complete || pool.stage.name }}
            </span>
          </div>
          <div v-if="pool.stage" class="flex items-center justify-between gap-3 px-4 py-3.5">
            <span class="flex items-center gap-2 text-footnote text-gray-500 dark:text-gray-400">
              <v-icon name="hi-solid-clock" class="w-4 h-4 shrink-0" />
              Dates
            </span>
            <span class="text-footnote font-medium text-gray-900 dark:text-white text-right">
              {{ formatDate(pool.stage.starting_at) }} – {{ formatDate(pool.stage.ending_at) }}
            </span>
          </div>
          <div class="flex items-center justify-between gap-3 px-4 py-3.5">
            <span class="flex items-center gap-2 text-footnote text-gray-500 dark:text-gray-400">
              <v-icon name="hi-solid-users" class="w-4 h-4 shrink-0" />
              Participants
            </span>
            <span class="text-footnote font-medium text-gray-900 dark:text-white text-right">
              {{ memberCount }} / {{ pool.max_participants }}
            </span>
          </div>
        </div>

        <!-- Access code (admin can copy and share it) -->
        <div v-if="pool.access_code" class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 p-4">
          <p class="text-2xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-1.5">
            Access code
          </p>
          <button
            type="button"
            @click="copyAccessCode"
            :title="copied ? 'Copied!' : 'Copy access code'"
            class="group w-full flex items-center gap-2 bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-xl px-3 py-2 transition-all active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
          >
            <span class="flex-1 text-left font-mono text-sm font-semibold tracking-wider text-gray-900 dark:text-white truncate">
              {{ pool.access_code }}
            </span>
            <v-icon
              :name="copied ? 'hi-solid-check' : 'hi-solid-duplicate'"
              :class="[
                'w-4 h-4 shrink-0 transition-colors',
                copied ? 'text-emerald-500' : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300',
              ]"
            />
            <span
              :class="[
                'text-2xs font-semibold shrink-0 transition-colors',
                copied ? 'text-emerald-500' : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300',
              ]"
            >
              {{ copied ? 'Copied' : 'Copy' }}
            </span>
          </button>
        </div>

        <!-- Members -->
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 p-4">
          <h2 class="text-callout font-semibold text-gray-900 dark:text-white mb-3">Members</h2>

          <div v-if="members.length > 0" class="space-y-1">
            <div
              v-for="(member, index) in members"
              :key="member.uuid || index"
              class="flex items-center gap-3 py-2"
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
                <span class="text-xs font-semibold text-white">{{ memberInitials(member) }}</span>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-footnote font-medium text-gray-900 dark:text-white truncate">
                  {{ memberName(member) }}
                </p>
                <p v-if="member.email" class="text-xs text-gray-400 dark:text-gray-500 truncate">
                  {{ member.email }}
                </p>
              </div>
            </div>
          </div>

          <p v-else class="text-footnote text-gray-400 dark:text-gray-500 py-2">
            No members yet.
          </p>
        </div>
      </template>

      <!-- Predictions tab -->
      <PoolPredictionComponent
        v-else-if="activeTab === 'predictions' && pool.stage"
        :stage-uuid="pool.stage.uuid"
        :pool-group-uuid="pool.uuid"
      />
      <UnderConstruction
        v-else-if="activeTab === 'predictions'"
        icon="hi-solid-clipboard-list"
        title="Predictions"
        message="Predictions will be available once a stage is assigned to this pool."
      />

      <!-- Standings tab -->
      <PoolStandingComponent
        v-else-if="activeTab === 'standings'"
        :pool-group-uuid="pool.uuid"
        :stage-uuid="pool.stage?.uuid"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { poolService } from "@/services/pool/poolService";
import { useToast } from "@/composables/useToast";
import PoolGroupSkeleton from "@/components/pool/PoolGroupSkeleton.vue";
import PoolPredictionComponent from "@/components/pool/PoolPredictionComponent.vue";
import PoolStandingComponent from "@/components/pool/PoolStandingComponent.vue";
import UnderConstruction from "@/components/pool/UnderConstruction.vue";
import type { PoolResponse } from "@/interfaces/pool/PoolResponse";
import type { FootballStageResponse } from "@/interfaces/football/stage/FootballStageResponse";
import type { UserDataInterface } from "@/interfaces/user/userInterface";

const props = withDefaults(
  defineProps<{ poolUuid: string; activeTab?: string }>(),
  { activeTab: "info" }
);

const { success, error } = useToast();

// State
const isLoading = ref(false);
const errorMessage = ref("");
const pool = ref<PoolResponse | null>(null);

// Access code copy feedback
const copied = ref(false);
let copyResetTimer: ReturnType<typeof setTimeout> | undefined;

const members = computed<UserDataInterface[]>(() => pool.value?.memberships || []);
const memberCount = computed(() => members.value.length);

// Resolve the badge shown for a pool's stage based on its lifecycle.
const stageBadge = (stage: FootballStageResponse) => {
  if (stage.is_current) {
    return { label: "Live", classes: "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400" };
  }
  if (stage.finished) {
    return { label: "Finished", classes: "bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500" };
  }
  return { label: "Upcoming", classes: "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" };
};

const memberName = (member: UserDataInterface) => {
  const full = [member.firstname, member.lastname].filter(Boolean).join(" ").trim();
  return full || member.email || "Unknown member";
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
  return parsed.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
};

const copyAccessCode = async () => {
  const code = pool.value?.access_code;
  if (!code) return;

  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(code);
    } else {
      const textarea = document.createElement("textarea");
      textarea.value = code;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      textarea.remove();
    }

    copied.value = true;
    success("Access code copied", "Share it so others can join your pool.");
    clearTimeout(copyResetTimer);
    copyResetTimer = setTimeout(() => (copied.value = false), 2000);
  } catch (e) {
    console.error("Failed to copy access code:", e);
    error("Couldn't copy", "Please copy the access code manually.");
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
    errorMessage.value = "Failed to load this pool. Please try again later.";
  } finally {
    isLoading.value = false;
  }
};

watch(() => props.poolUuid, loadPool);

onMounted(loadPool);

onUnmounted(() => clearTimeout(copyResetTimer));
</script>
