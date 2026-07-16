<template>
  <div class="space-y-4">
    <!-- Game rules (collapsible: objective + how to play) -->
    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 overflow-hidden">
      <button
        type="button"
        @click="rulesOpen = !rulesOpen"
        :aria-expanded="rulesOpen"
        class="w-full flex items-center justify-between gap-3 p-4 text-left"
      >
        <div class="flex items-center gap-2 min-w-0">
          <v-icon name="hi-solid-information-circle" class="w-4 h-4 text-emerald-500 shrink-0" />
          <h2 class="text-callout font-semibold text-gray-900 dark:text-white">{{ $t('pool.group.rules.title') }}</h2>
        </div>
        <v-icon
          name="hi-solid-chevron-down"
          class="w-4 h-4 text-gray-400 dark:text-gray-500 transition-transform duration-300 shrink-0"
          :class="rulesOpen ? 'rotate-180' : ''"
        />
      </button>

      <div
        class="overflow-hidden transition-[max-height,opacity] duration-300 ease-out"
        :style="{ maxHeight: rulesOpen ? '2000px' : '0px', opacity: rulesOpen ? 1 : 0 }"
        :aria-hidden="!rulesOpen"
      >
        <div class="px-4 pb-4 space-y-4" :inert="!rulesOpen">
          <div>
            <h3 class="text-2xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-1">
              {{ $t('pool.group.rules.goalLabel') }}
            </h3>
            <p class="text-footnote text-gray-600 dark:text-gray-300 leading-relaxed">
              {{ $t('pool.group.rules.goalText') }}
            </p>
          </div>

          <div>
            <h3 class="text-2xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-2">
              {{ $t('pool.group.rules.howLabel') }}
            </h3>
            <ol class="space-y-2.5">
              <li v-for="(step, index) in howToPlaySteps" :key="index" class="flex items-start gap-2.5">
                <span class="w-5 h-5 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-2xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {{ index + 1 }}
                </span>
                <span class="text-footnote text-gray-600 dark:text-gray-300 leading-snug">{{ step }}</span>
              </li>
            </ol>
          </div>

          <p class="text-2xs text-gray-400 dark:text-gray-500 leading-relaxed bg-gray-50 dark:bg-gray-900/40 rounded-xl px-3 py-2.5">
            {{ $t('pool.group.rules.notAdditiveNote') }}
          </p>

          <p class="text-2xs text-gray-400 dark:text-gray-500 leading-relaxed">
            {{ $t('pool.group.rules.standingsNote') }}
          </p>
        </div>
      </div>
    </div>

    <!-- Scoring rules -->
    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 p-4">
      <div class="flex items-center gap-2 mb-3">
        <v-icon name="hi-solid-clipboard-list" class="w-4 h-4 text-emerald-500 shrink-0" />
        <h2 class="text-callout font-semibold text-gray-900 dark:text-white">{{ $t('pool.group.scoringRules') }}</h2>
      </div>

      <div class="space-y-2">
        <div
          v-for="rule in scoringRules"
          :key="rule.label"
          class="flex items-center gap-3 bg-gray-50 dark:bg-gray-900/40 rounded-xl px-3 py-2.5"
        >
          <div class="w-8 h-8 rounded-lg bg-white dark:bg-gray-800 flex items-center justify-center shrink-0 ring-1 ring-gray-100 dark:ring-gray-700">
            <v-icon :name="rule.icon" class="w-4 h-4 text-emerald-500" />
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-footnote font-medium text-gray-900 dark:text-white leading-tight">{{ rule.label }}</p>
            <p class="text-2xs text-gray-400 dark:text-gray-500 leading-snug">{{ rule.hint }}</p>
          </div>
          <span class="inline-flex items-center justify-center min-w-[2.75rem] px-2 py-1 rounded-lg text-footnote font-bold bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 shrink-0">
            +{{ rule.points }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

// "Game rules" card (objective + how to play) — collapsible, open by default.
const rulesOpen = ref(true);
const howToPlaySteps = computed(() => [
  t("pool.group.rules.step1"),
  t("pool.group.rules.step2"),
  t("pool.group.rules.step3"),
  t("pool.group.rules.step4"),
]);

// Scoring rules shown to participants so they know how points are awarded.
const scoringRules = computed(() => [
  { label: t("pool.group.scoring.exactScoreLabel"), hint: t("pool.group.scoring.exactScoreHint"), points: 3, icon: "hi-solid-hashtag" },
  { label: t("pool.group.scoring.correctWinnerLabel"), hint: t("pool.group.scoring.correctWinnerHint"), points: 1, icon: "bi-trophy-fill" },
  { label: t("pool.group.scoring.correctDrawLabel"), hint: t("pool.group.scoring.correctDrawHint"), points: 1, icon: "hi-solid-switch-horizontal" },
]);
</script>
