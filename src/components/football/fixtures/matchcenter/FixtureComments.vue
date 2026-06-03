<script setup lang="ts">
import { computed } from "vue";
import type { FootballFixtureCommentResponse } from "@/interfaces/football/fixture/FootballFixtureCommentResponse";

interface Props {
  comments: FootballFixtureCommentResponse[] | null;
}

const props = defineProps<Props>();

// Latest commentary first (FotMob-style). `order` is a monotonic API counter.
const ordered = computed(() =>
  [...(props.comments ?? [])].sort((a, b) => b.order - a.order)
);

const hasComments = computed(() => ordered.value.length > 0);

const minuteLabel = (c: FootballFixtureCommentResponse): string => {
  if (c.minute == null) return "";
  return c.extra_minute ? `${c.minute}+${c.extra_minute}'` : `${c.minute}'`;
};
</script>

<template>
  <div class="px-4 pt-3 pb-6">
    <!-- Empty -->
    <div
      v-if="!hasComments"
      class="py-12 flex flex-col items-center text-center"
    >
      <v-icon name="bi-chat-left-dots-fill" class="w-8 h-8 text-gray-200 dark:text-gray-700 mb-2" />
      <p class="text-[13px] text-gray-400 dark:text-gray-500">No commentary available yet</p>
    </div>

    <ol v-else class="space-y-2.5">
      <li
        v-for="c in ordered"
        :key="c.order"
        class="flex gap-3 rounded-xl px-3 py-2.5 transition-colors"
        :class="c.is_goal
          ? 'bg-emerald-50 dark:bg-emerald-900/20 ring-1 ring-emerald-200 dark:ring-emerald-800/40'
          : c.is_important
            ? 'bg-amber-50 dark:bg-amber-900/15 ring-1 ring-amber-200/70 dark:ring-amber-800/30'
            : 'bg-gray-50 dark:bg-gray-800/40'"
      >
        <!-- Minute + marker -->
        <div class="shrink-0 w-9 flex flex-col items-center gap-1 pt-0.5">
          <span
            class="text-[11px] font-bold tabular-nums leading-none"
            :class="c.is_goal
              ? 'text-emerald-600 dark:text-emerald-400'
              : c.is_important
                ? 'text-amber-600 dark:text-amber-400'
                : 'text-gray-500 dark:text-gray-400'"
          >
            {{ minuteLabel(c) }}
          </span>
          <v-icon
            v-if="c.is_goal"
            name="md-sportssoccer"
            class="w-4 h-4 text-emerald-500 dark:text-emerald-400"
          />
          <v-icon
            v-else-if="c.is_important"
            name="hi-solid-star"
            class="w-3.5 h-3.5 text-amber-500 dark:text-amber-400"
          />
        </div>

        <!-- Comment text -->
        <p
          class="flex-1 min-w-0 text-[13px] leading-relaxed break-words"
          :class="c.is_goal
            ? 'font-semibold text-gray-900 dark:text-white'
            : 'text-gray-700 dark:text-gray-300'"
        >
          {{ c.comment }}
        </p>
      </li>
    </ol>
  </div>
</template>

<style scoped>
.tabular-nums {
  font-variant-numeric: tabular-nums;
}
</style>
