<script setup lang="ts">
import SearchableSelectComponent from "@/components/ui/SearchableSelectComponent.vue";
import type { FootballRoundResponse } from "@/interfaces/football/round/FootballRoundResponse";
import type { FootballStageResponse } from "@/interfaces/football/stage/FootballStageResponse";

type Mode = "regular" | "playoffs";

defineProps<{
  rounds: FootballRoundResponse[];
  isLoadingRounds: boolean;
  roundsError: string | null;
  knockoutStages: FootballStageResponse[];
  isLoadingStages: boolean;
  stagesError: string | null;
}>();

const emit = defineEmits<{
  "retry-rounds": [];
  "retry-stages": [];
}>();

// Two-way bindings with the parent
const mode = defineModel<Mode>("mode", { default: "regular" });
const roundUuid = defineModel<string | null>("roundUuid", { default: null });
const knockoutUuid = defineModel<string | null>("knockoutUuid", { default: null });
</script>

<template>
  <div>
    <!-- Mode toggle (Regular Season / Playoffs) -->
    <div class="px-4 pt-3 pb-2.5">
      <div
        class="flex items-center gap-1 p-0.5 rounded-full bg-gray-100 dark:bg-gray-800"
        role="tablist"
        aria-label="Fixtures mode"
      >
        <button
          type="button"
          role="tab"
          :aria-selected="mode === 'regular'"
          @click="mode = 'regular'"
          class="flex-1 flex items-center justify-center gap-1.5 h-8 px-2 rounded-full text-[12px] font-semibold tracking-wide transition-all duration-200"
          :class="mode === 'regular'
            ? 'bg-white dark:bg-gray-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'"
        >
          <v-icon name="md-sportssoccer" class="w-3.5 h-3.5 shrink-0" />
          <span>Regular Season</span>
        </button>
        <button
          type="button"
          role="tab"
          :aria-selected="mode === 'playoffs'"
          @click="mode = 'playoffs'"
          class="flex-1 flex items-center justify-center gap-1.5 h-8 px-2 rounded-full text-[12px] font-semibold tracking-wide transition-all duration-200"
          :class="mode === 'playoffs'
            ? 'bg-white dark:bg-gray-700 text-amber-600 dark:text-amber-400 shadow-sm'
            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'"
        >
          <v-icon name="bi-trophy-fill" class="w-3.5 h-3.5 shrink-0" />
          <span>Playoffs</span>
        </button>
      </div>
    </div>

    <!-- Selector -->
    <div class="px-4 pb-3 border-b border-gray-100 dark:border-gray-700/60">
      <!-- ── Regular Season: round selector ── -->
      <template v-if="mode === 'regular'">
        <div v-if="isLoadingRounds" class="flex items-center justify-center py-3">
          <v-icon name="pr-spinner" class="w-4 h-4 text-gray-300 dark:text-gray-600" animation="spin" />
        </div>

        <div
          v-else-if="roundsError"
          class="flex items-center justify-between gap-2 py-2"
        >
          <p class="text-[12px] text-red-500 dark:text-red-400">{{ roundsError }}</p>
          <button
            @click="emit('retry-rounds')"
            class="text-[12px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            Retry
          </button>
        </div>

        <SearchableSelectComponent
          v-else-if="rounds.length > 0"
          v-model="roundUuid"
          :options="rounds"
          value-key="uuid"
          label-key="name"
          placeholder="Select a round"
          search-placeholder="Search round..."
          :clearable="false"
          accent-color="emerald"
          no-options-text="No rounds available"
        >
          <template #selected="{ option }">
            <span class="text-sm font-medium text-gray-900 dark:text-white truncate flex-1">
              Round {{ option.name }}
            </span>
            <span
              v-if="option.is_current"
              class="text-[9px] font-bold tracking-wider text-emerald-600 dark:text-emerald-400 uppercase shrink-0"
            >
              Current
            </span>
          </template>
          <template #option="{ option }">
            <div class="flex-1 min-w-0 flex items-center gap-2">
              <span class="text-sm font-medium truncate">Round {{ option.name }}</span>
              <span
                v-if="option.is_current"
                class="text-[9px] font-bold tracking-wider text-emerald-600 dark:text-emerald-400 uppercase shrink-0"
              >
                Current
              </span>
              <span
                v-else-if="option.finished"
                class="text-[9px] text-gray-400 dark:text-gray-500 uppercase tracking-wider shrink-0"
              >
                Done
              </span>
            </div>
          </template>
        </SearchableSelectComponent>

        <div v-else class="text-center py-3 text-[12px] text-gray-400 dark:text-gray-500">
          No rounds available
        </div>
      </template>

      <!-- ── Playoffs: knockout stage selector ── -->
      <template v-else>
        <div
          v-if="stagesError"
          class="flex items-center justify-between gap-2 py-2"
        >
          <p class="text-[12px] text-red-500 dark:text-red-400">{{ stagesError }}</p>
          <button
            @click="emit('retry-stages')"
            class="text-[12px] font-semibold text-amber-600 dark:text-amber-400 hover:underline"
          >
            Retry
          </button>
        </div>

        <SearchableSelectComponent
          v-else
          v-model="knockoutUuid"
          :options="knockoutStages"
          value-key="uuid"
          label-key="name"
          placeholder="Select playoff stage"
          search-placeholder="Search stage..."
          :disabled="isLoadingStages || knockoutStages.length === 0"
          :loading="isLoadingStages"
          accent-color="amber"
          :searchable="knockoutStages.length > 5"
          :clearable="false"
        >
          <template #selected="{ option }">
            <span class="text-sm font-medium text-gray-900 dark:text-white truncate flex-1">
              {{ (option.name_complete as string | null) || option.name }}
            </span>
            <span
              v-if="option.is_current"
              class="text-[9px] font-bold tracking-wider text-amber-600 dark:text-amber-400 uppercase shrink-0 ml-2"
            >
              Current
            </span>
          </template>
          <template #option="{ option }">
            <div class="flex-1 min-w-0 flex items-center gap-2">
              <span class="text-sm font-medium truncate">
                {{ (option.name_complete as string | null) || option.name }}
              </span>
              <span
                v-if="option.is_current"
                class="text-[9px] font-bold tracking-wider text-amber-600 dark:text-amber-400 uppercase shrink-0"
              >
                Current
              </span>
              <span
                v-else-if="option.finished"
                class="text-[9px] text-gray-400 dark:text-gray-500 uppercase tracking-wider shrink-0"
              >
                Done
              </span>
            </div>
          </template>
        </SearchableSelectComponent>
      </template>
    </div>
  </div>
</template>
