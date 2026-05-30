<script setup lang="ts">
import { ref, watch, defineAsyncComponent } from "vue";

interface Props {
  stageUuid: string;
}

const props = defineProps<Props>();

type Tab = "regular" | "playoffs";
const activeTab = ref<Tab>("regular");

// Lazy-load both fixture views so the inactive one doesn't cost anything until selected
const FixturesByStageAndCurrentRound = defineAsyncComponent(
  () => import("./FixturesByStageAndCurrentRound.vue"),
);
const KnockoutFixtures = defineAsyncComponent(
  () => import("./KnockoutFixtures.vue"),
);

// Reset to the Regular tab whenever the parent stage changes so the user
// always lands on the most relevant view for a new league context.
watch(
  () => props.stageUuid,
  () => {
    activeTab.value = "regular";
  },
);
</script>

<template>
  <div class="w-full space-y-3">
    <!-- Segmented control (iOS-style linear menu) -->
    <div
      class="flex items-center gap-1 p-1 rounded-full bg-gray-100 dark:bg-gray-800 shadow-inner"
      role="tablist"
      aria-label="Fixtures view"
    >
      <button
        type="button"
        role="tab"
        :aria-selected="activeTab === 'regular'"
        @click="activeTab = 'regular'"
        class="flex-1 flex items-center justify-center gap-1.5 h-8 px-3 rounded-full text-[12px] font-semibold tracking-wide transition-all duration-200"
        :class="activeTab === 'regular'
          ? 'bg-white dark:bg-gray-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
          : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'"
      >
        <v-icon name="md-sportssoccer" class="w-3.5 h-3.5 shrink-0" />
        <span>Regular Season</span>
      </button>

      <button
        type="button"
        role="tab"
        :aria-selected="activeTab === 'playoffs'"
        @click="activeTab = 'playoffs'"
        class="flex-1 flex items-center justify-center gap-1.5 h-8 px-3 rounded-full text-[12px] font-semibold tracking-wide transition-all duration-200"
        :class="activeTab === 'playoffs'
          ? 'bg-white dark:bg-gray-700 text-amber-600 dark:text-amber-400 shadow-sm'
          : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'"
      >
        <v-icon name="bi-trophy-fill" class="w-3.5 h-3.5 shrink-0" />
        <span>Playoffs</span>
      </button>
    </div>

    <!-- Active panel -->
    <FixturesByStageAndCurrentRound
      v-if="activeTab === 'regular'"
      :stage-uuid="stageUuid"
    />
    <KnockoutFixtures
      v-else
      :stage-uuid="stageUuid"
    />
  </div>
</template>
