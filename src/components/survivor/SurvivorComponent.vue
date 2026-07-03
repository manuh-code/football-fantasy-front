<template>
  <div class="space-y-4">
    <!-- Loading State -->
    <SurvivorListSkeleton v-if="isLoading" />

    <!-- Error State -->
    <div v-else-if="errorMessage" class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 p-6 text-center">
      <v-icon name="hi-solid-exclamation" class="w-8 h-8 text-red-400 mx-auto mb-3" />
      <p class="text-footnote text-red-500 dark:text-red-400 mb-4">{{ errorMessage }}</p>
      <button
        @click="loadSurvivors"
        class="px-4 py-1.5 bg-red-500 text-white rounded-full text-footnote font-medium active:bg-red-600 transition-colors"
      >
        {{ $t('common.actions.retry') }}
      </button>
    </div>

    <!-- Survivors List -->
    <template v-else-if="survivors.length > 0">
      <!-- Section Header -->
      <div class="px-1">
        <h2 class="text-callout font-semibold text-gray-900 dark:text-white">{{ $t('survivor.list.title') }}</h2>
        <p class="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
          {{ $t('survivor.list.countOther', { count: survivors.length }, survivors.length) }}
        </p>
      </div>

      <!-- Survivors Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        <div
          v-for="survivor in survivors"
          :key="survivor.uuid"
          @click="goToSurvivor(survivor.uuid)"
          class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 overflow-hidden transition-all duration-200 cursor-pointer active:scale-[0.98] hover:shadow-md"
        >
          <div class="p-4">
            <!-- Header: icon + name + status badge -->
            <div class="flex items-start gap-3">
              <div class="w-11 h-11 bg-gradient-to-br from-rose-500 to-red-600 rounded-2xl flex items-center justify-center shrink-0">
                <v-icon name="hi-solid-shield-check" class="w-5 h-5 text-white" />
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-start justify-between gap-2">
                  <h3 class="text-callout font-semibold text-gray-900 dark:text-white leading-tight truncate">
                    {{ survivor.name }}
                  </h3>
                  <span
                    v-if="statusBadge(survivor.status)"
                    :class="[
                      'inline-flex items-center px-2 py-0.5 rounded-full text-2xs font-semibold shrink-0',
                      statusBadge(survivor.status)!.classes,
                    ]"
                  >
                    {{ statusBadge(survivor.status)!.label }}
                  </span>
                </div>
                <p v-if="survivor.description" class="text-footnote text-gray-500 dark:text-gray-400 leading-snug mt-0.5 line-clamp-2">
                  {{ survivor.description }}
                </p>
              </div>
            </div>

            <!-- Footer: lives -->
            <div class="flex items-center gap-4 mt-3 pt-3 border-t border-gray-50 dark:border-gray-700/40">
              <div class="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500 shrink-0">
                <v-icon name="hi-solid-heart" class="w-3.5 h-3.5 text-rose-400" />
                <span>{{ $t('survivor.list.livesCount', { count: survivor.max_lives }) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Empty State -->
    <div v-else class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 py-12 text-center">
      <v-icon name="hi-solid-shield-check" class="w-10 h-10 text-gray-200 dark:text-gray-700 mx-auto mb-3" />
      <h3 class="text-callout font-semibold text-gray-900 dark:text-white mb-1">{{ $t('survivor.emptyTitle') }}</h3>
      <p class="text-footnote text-gray-400 dark:text-gray-500 max-w-xs mx-auto leading-relaxed">
        {{ $t('survivor.emptyBody') }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { survivorService } from "@/services/survivor/SurvivorServive";
import type { SurvivorResponse } from "@/interfaces/survivor/SurvivorResponse";
import SurvivorListSkeleton from "@/components/survivor/SurvivorListSkeleton.vue";

const router = useRouter();
const { t } = useI18n();

// State
const isLoading = ref(false);
const errorMessage = ref<string>("");
const survivors = ref<SurvivorResponse[]>([]);

// Navigate to a survivor's detail view.
const goToSurvivor = (uuid: string) => {
  router.push({ name: "survivorDetail", params: { uuid } });
};

// Resolve the badge shown for a survivor based on its status. Returns null for
// unknown statuses so we simply omit the badge instead of showing raw text.
const statusBadge = (status: string): { label: string; classes: string } | null => {
  switch ((status || "").toLowerCase()) {
    case "active":
    case "in_progress":
      return {
        label: t("survivor.status.active"),
        classes: "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400",
      };
    case "eliminated":
      return {
        label: t("survivor.status.eliminated"),
        classes: "bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400",
      };
    case "finished":
      return {
        label: t("survivor.status.finished"),
        classes: "bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500",
      };
    case "pending":
      return {
        label: t("survivor.status.pending"),
        classes: "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
      };
    default:
      return null;
  }
};

// Methods
const loadSurvivors = async () => {
  isLoading.value = true;
  errorMessage.value = "";

  try {
    survivors.value = await survivorService.getMySurvivors();
  } catch (error) {
    console.error("Error loading survivors:", error);
    errorMessage.value = t("survivor.loadError");
  } finally {
    isLoading.value = false;
  }
};

// Lifecycle
onMounted(loadSurvivors);

// Let the parent view refresh the list if needed.
defineExpose({ reload: loadSurvivors });
</script>

<style scoped>
/* Clamp survivor description to two lines (no Tailwind line-clamp plugin in this project). */
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
