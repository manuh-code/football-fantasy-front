<template>
  <div class="space-y-4">
    <!-- Header: title + compact W/D/L record -->
    <div class="px-1 flex items-end justify-between gap-3">
      <div class="min-w-0">
        <h2 class="text-callout font-semibold text-gray-900 dark:text-white leading-tight">
          {{ $t('survivor.mypicks.title') }}
        </h2>
        <p class="text-xs text-gray-400 dark:text-gray-500 mt-0.5 truncate">
          {{ $t('survivor.mypicks.subtitle') }}
        </p>
      </div>

      <!-- Record summary chips (only once we have picks) -->
      <div v-if="!isLoading && !error && picks.length > 0" class="flex items-center gap-1.5 shrink-0">
        <span
          v-for="stat in record"
          :key="stat.key"
          class="inline-flex items-center gap-1 h-6 px-2 rounded-full text-2xs font-bold tabular-nums"
          :class="stat.classes"
          :title="stat.title"
        >
          <v-icon :name="stat.icon" class="w-3 h-3" />
          {{ stat.count }}
        </span>
      </div>
    </div>

    <!-- Loading -->
    <div
      v-if="isLoading"
      class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 p-4 space-y-5 animate-pulse"
    >
      <div v-for="n in 4" :key="`sk-${n}`" class="flex items-center gap-3">
        <div class="w-3.5 h-3.5 rounded-full bg-gray-200 dark:bg-gray-700 shrink-0" />
        <div class="flex-1 space-y-2">
          <div class="h-2.5 w-24 rounded-full bg-gray-200 dark:bg-gray-700" />
          <div class="h-3 w-32 rounded-full bg-gray-200 dark:bg-gray-700" />
        </div>
        <div class="h-5 w-14 rounded-full bg-gray-200 dark:bg-gray-700 shrink-0" />
      </div>
    </div>

    <!-- Error -->
    <div
      v-else-if="error"
      class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 p-6 text-center"
    >
      <v-icon name="hi-solid-exclamation" class="w-8 h-8 text-red-400 mx-auto mb-3" />
      <p class="text-footnote text-red-500 dark:text-red-400 mb-4">{{ error }}</p>
      <button
        @click="load"
        class="px-4 py-1.5 bg-red-500 text-white rounded-full text-footnote font-medium active:bg-red-600 transition-colors"
      >
        {{ $t('common.actions.retry') }}
      </button>
    </div>

    <!-- Empty -->
    <div
      v-else-if="picks.length === 0"
      class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 py-12 text-center"
    >
      <v-icon name="hi-solid-clipboard-list" class="w-10 h-10 text-gray-200 dark:text-gray-700 mx-auto mb-3" />
      <h3 class="text-callout font-semibold text-gray-900 dark:text-white mb-1">
        {{ $t('survivor.mypicks.emptyTitle') }}
      </h3>
      <p class="text-footnote text-gray-400 dark:text-gray-500 max-w-xs mx-auto leading-relaxed">
        {{ $t('survivor.mypicks.emptyBody') }}
      </p>
    </div>

    <!-- Board: timeline of rounds -->
    <div
      v-else
      class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 p-4 sm:p-5"
    >
      <ol class="space-y-0">
        <li
          v-for="(item, index) in picks"
          :key="item.uuid"
          class="flex gap-3"
        >
          <!-- Rail: outcome node + connector -->
          <div class="relative flex flex-col items-center pt-1.5">
            <span
              class="w-3.5 h-3.5 rounded-full ring-4 ring-white dark:ring-gray-800 shrink-0 z-10 transition-transform"
              :class="[outcome(item.pick).dot, item.is_current ? 'scale-110 shadow-sm' : '']"
            />
            <span
              v-if="index < picks.length - 1"
              class="w-0.5 flex-1 my-1 rounded-full bg-gray-100 dark:bg-gray-700"
            />
          </div>

          <!-- Content -->
          <div class="flex-1 min-w-0 pb-5 last:pb-0">
            <!-- Round eyebrow + outcome chip -->
            <div class="flex items-center justify-between gap-2 mb-1.5">
              <div class="flex items-center gap-2 min-w-0">
                <span class="text-2xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 truncate">
                  {{ item.name }}
                </span>
                <span
                  v-if="item.is_current"
                  class="inline-flex items-center px-1.5 py-0.5 rounded-full text-2xs font-semibold bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 shrink-0"
                >
                  {{ $t('survivor.mypicks.current') }}
                </span>
              </div>
              <span
                class="inline-flex items-center gap-1 h-6 px-2 rounded-full text-2xs font-semibold shrink-0"
                :class="outcome(item.pick).chip"
              >
                <v-icon :name="outcome(item.pick).icon" class="w-3 h-3" />
                {{ outcome(item.pick).label }}
              </span>
            </div>

            <!-- Picked team -->
            <div class="flex items-center gap-2.5">
              <template v-if="item.pick?.team">
                <img
                  :src="item.pick.team.image_path || '/img/default-avatar.svg'"
                  :alt="item.pick.team.name"
                  class="w-9 h-9 object-contain shrink-0"
                  @error="onLogoError"
                />
                <span class="text-callout font-semibold text-gray-900 dark:text-white truncate">
                  {{ item.pick.team.name }}
                </span>
              </template>
              <template v-else>
                <span class="w-9 h-9 grid place-items-center rounded-full bg-gray-100 dark:bg-gray-700 shrink-0">
                  <v-icon name="hi-solid-minus" class="w-4 h-4 text-gray-300 dark:text-gray-600" />
                </span>
                <span class="text-footnote font-medium text-gray-400 dark:text-gray-500">
                  {{ $t('survivor.mypicks.noPick') }}
                </span>
              </template>

              <span class="ml-auto text-2xs text-gray-400 dark:text-gray-500 tabular-nums shrink-0">
                {{ formatDate(item.starting_at) }}
              </span>
            </div>
          </div>
        </li>
      </ol>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { survivorService } from "@/services/survivor/SurvivorServive";
import type {
  SurvivorUserPick,
  SurvivorUserPickResponse,
} from "@/interfaces/survivor/SurvivorUserPickResponse";

const props = defineProps<{ survivorUuid: string }>();

const { t, locale } = useI18n();

const picks = ref<SurvivorUserPickResponse[]>([]);
const isLoading = ref(false);
const error = ref("");

// Resolve the outcome styling for a pick. Mirrors SurvivorDetailComponent's
// pick badge so the two screens speak the same visual language.
type Outcome = { label: string; chip: string; dot: string; icon: string };
const outcome = (pick: SurvivorUserPick | null): Outcome => {
  if (pick?.is_win)
    return {
      label: t("survivor.detail.result.win"),
      chip: "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400",
      dot: "bg-emerald-500",
      icon: "hi-solid-check",
    };
  if (pick?.is_loss)
    return {
      label: t("survivor.detail.result.loss"),
      chip: "bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400",
      dot: "bg-red-500",
      icon: "hi-solid-x",
    };
  if (pick?.is_draw)
    return {
      label: t("survivor.detail.result.draw"),
      chip: "bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400",
      dot: "bg-amber-500",
      icon: "hi-solid-minus",
    };
  // No pick yet, or the round hasn't been resolved.
  return {
    label: t("survivor.detail.result.pending"),
    chip: "bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500",
    dot: "bg-gray-300 dark:bg-gray-600",
    icon: "hi-solid-clock",
  };
};

// Won / drawn / lost tallies for the header record chips.
const record = computed(() => {
  const wins = picks.value.filter((p) => p.pick?.is_win).length;
  const draws = picks.value.filter((p) => p.pick?.is_draw).length;
  const losses = picks.value.filter((p) => p.pick?.is_loss).length;
  return [
    {
      key: "wins",
      count: wins,
      icon: "hi-solid-check",
      title: t("survivor.mypicks.record.wins"),
      classes: "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400",
    },
    {
      key: "draws",
      count: draws,
      icon: "hi-solid-minus",
      title: t("survivor.mypicks.record.draws"),
      classes: "bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400",
    },
    {
      key: "losses",
      count: losses,
      icon: "hi-solid-x",
      title: t("survivor.mypicks.record.losses"),
      classes: "bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400",
    },
  ];
});

const formatDate = (value?: string): string => {
  if (!value) return "";
  const date = new Date(value.includes("T") ? value : value.replace(" ", "T"));
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(locale.value, { month: "short", day: "numeric" });
};

const onLogoError = (e: Event) => {
  (e.target as HTMLImageElement).src = "/img/default-avatar.svg";
};

const load = async () => {
  if (!props.survivorUuid) return;
  isLoading.value = true;
  error.value = "";
  try {
    picks.value = await survivorService.getMyPicksBySurvivorUuid(props.survivorUuid);
  } catch (e) {
    console.error("Error loading survivor picks:", e);
    error.value = t("survivor.mypicks.loadError");
  } finally {
    isLoading.value = false;
  }
};

onMounted(load);
</script>

<style scoped>
@media (prefers-reduced-motion: reduce) {
  * {
    transition: none !important;
    transform: none !important;
    animation: none !important;
  }
}
</style>
