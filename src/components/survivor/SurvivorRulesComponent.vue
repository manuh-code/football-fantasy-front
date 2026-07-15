<template>
  <div class="space-y-4">
    <!-- Section header -->
    <div class="px-1">
      <h2 class="text-callout font-semibold text-gray-900 dark:text-white leading-tight">
        {{ $t('survivor.rules.title') }}
      </h2>
      <p class="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
        {{ $t('survivor.rules.subtitle') }}
      </p>
    </div>

    <!-- Goal -->
    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 p-4">
      <div class="flex items-center gap-2 mb-2">
        <v-icon name="hi-solid-shield-check" class="w-4 h-4 text-rose-500 shrink-0" />
        <h3 class="text-callout font-semibold text-gray-900 dark:text-white">{{ $t('survivor.rules.goalLabel') }}</h3>
      </div>
      <p class="text-footnote text-gray-600 dark:text-gray-300 leading-relaxed">
        {{ $t('survivor.rules.goalText') }}
      </p>
    </div>

    <!-- How to play -->
    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 p-4">
      <div class="flex items-center gap-2 mb-3">
        <v-icon name="hi-solid-clipboard-list" class="w-4 h-4 text-rose-500 shrink-0" />
        <h3 class="text-callout font-semibold text-gray-900 dark:text-white">{{ $t('survivor.rules.howLabel') }}</h3>
      </div>
      <ol class="space-y-2.5">
        <li v-for="(step, index) in steps" :key="index" class="flex items-start gap-2.5">
          <span class="w-5 h-5 rounded-full bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 text-2xs font-bold flex items-center justify-center shrink-0 mt-0.5">
            {{ index + 1 }}
          </span>
          <span class="text-footnote text-gray-600 dark:text-gray-300 leading-snug">{{ step }}</span>
        </li>
      </ol>
    </div>

    <!-- Lives -->
    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 p-4">
      <div class="flex items-center gap-2 mb-3">
        <v-icon name="hi-solid-heart" class="w-4 h-4 text-rose-500 shrink-0" />
        <h3 class="text-callout font-semibold text-gray-900 dark:text-white">{{ $t('survivor.rules.livesLabel') }}</h3>
      </div>

      <div class="space-y-2">
        <div
          v-for="rule in livesRules"
          :key="rule.label"
          class="flex items-center gap-3 bg-gray-50 dark:bg-gray-900/40 rounded-xl px-3 py-2.5"
        >
          <div class="w-8 h-8 rounded-lg bg-white dark:bg-gray-800 flex items-center justify-center shrink-0 ring-1 ring-gray-100 dark:ring-gray-700">
            <v-icon :name="rule.icon" class="w-4 h-4" :class="rule.iconClass" />
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-footnote font-medium text-gray-900 dark:text-white leading-tight">{{ rule.label }}</p>
            <p class="text-2xs text-gray-400 dark:text-gray-500 leading-snug">{{ rule.hint }}</p>
          </div>
          <span
            class="inline-flex items-center justify-center min-w-[2.75rem] px-2 py-1 rounded-lg text-footnote font-bold shrink-0"
            :class="rule.badgeClasses"
          >
            {{ rule.badge }}
          </span>
        </div>
      </div>

      <p class="text-2xs text-gray-400 dark:text-gray-500 leading-relaxed mt-3">
        {{ $t('survivor.rules.livesNote') }}
      </p>
    </div>

    <!-- End of game -->
    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 p-4">
      <div class="flex items-center gap-2 mb-2">
        <v-icon name="bi-trophy-fill" class="w-4 h-4 text-rose-500 shrink-0" />
        <h3 class="text-callout font-semibold text-gray-900 dark:text-white">{{ $t('survivor.rules.endLabel') }}</h3>
      </div>
      <p class="text-footnote text-gray-600 dark:text-gray-300 leading-relaxed">
        {{ $t('survivor.rules.endText') }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const steps = computed(() => [
  t("survivor.rules.step1"),
  t("survivor.rules.step2"),
  t("survivor.rules.step3"),
  t("survivor.rules.step4"),
]);

const livesRules = computed(() => [
  {
    label: t("survivor.rules.lives.lossLabel"),
    hint: t("survivor.rules.lives.lossHint"),
    icon: "hi-solid-x-circle",
    iconClass: "text-red-500",
    badge: "-1",
    badgeClasses: "bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400",
  },
  {
    label: t("survivor.rules.lives.noPickLabel"),
    hint: t("survivor.rules.lives.noPickHint"),
    icon: "hi-solid-lock-closed",
    iconClass: "text-red-500",
    badge: "-1",
    badgeClasses: "bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400",
  },
  {
    label: t("survivor.rules.lives.drawLabel"),
    hint: t("survivor.rules.lives.drawHint"),
    icon: "hi-solid-check-circle",
    iconClass: "text-emerald-500",
    badge: "✓",
    badgeClasses: "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400",
  },
]);
</script>
