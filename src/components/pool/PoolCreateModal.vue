<template>
  <BottomSheet
    :is-visible="isVisible"
    :title="$t('pool.create.title')"
    :subtitle="$t('pool.create.subtitle')"
    icon="hi-solid-sparkles"
    icon-variant="emerald"
    size="auto"
    :dismissible="!isLoading"
    @close="close"
  >
    <div class="space-y-4">
      <!-- Name -->
      <FormInput
        id="pool-name"
        v-model="name"
        type="text"
        :label="$t('pool.create.nameLabel')"
        icon="hi-solid-document-text"
        :placeholder="$t('pool.create.namePlaceholder')"
        :error="fieldError('name')"
        :disabled="isLoading"
      />

      <!-- Description -->
      <div class="flex flex-col gap-1.5">
        <label for="pool-description" class="text-sm font-semibold text-gray-700 dark:text-gray-300">
          {{ $t('pool.create.descLabel') }} <span class="font-normal text-gray-400 dark:text-gray-500">({{ $t('common.states.optional') }})</span>
        </label>
        <textarea
          id="pool-description"
          v-model="description"
          rows="3"
          :placeholder="$t('pool.create.descPlaceholder')"
          :disabled="isLoading"
          :class="[
            'w-full px-4 py-3 rounded-xl border-[1.5px] bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-base md:text-sm placeholder-gray-400 dark:placeholder-gray-500 resize-none transition-colors focus:outline-none focus:ring-2 disabled:opacity-60',
            descriptionError
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10'
              : 'border-gray-200 dark:border-gray-700 focus:border-emerald-600 focus:ring-emerald-500/10',
          ]"
        />
        <span v-if="descriptionError" class="text-xs text-red-600 dark:text-red-400">{{ descriptionError }}</span>
      </div>

      <!-- League — the currently selected league (read-only) -->
      <div v-if="league" class="flex flex-col gap-1.5">
        <label class="text-sm font-semibold text-gray-700 dark:text-gray-300">{{ $t('pool.create.league') }}</label>
        <div class="flex items-center gap-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3.5">
          <img
            :src="league.image_path || '/img/default-avatar.svg'"
            :alt="league.name"
            class="w-9 h-9 object-contain shrink-0"
            @error="onLeagueLogoError"
          />
          <div class="flex-1 min-w-0">
            <p class="text-sm font-semibold text-gray-900 dark:text-white truncate">{{ league.name }}</p>
            <p class="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{{ $t('pool.create.leagueInfo') }}</p>
          </div>
        </div>
      </div>

      <!-- Stage — auto-resolved for the current league (read-only) -->
      <div class="flex flex-col gap-1.5">
        <label class="text-sm font-semibold text-gray-700 dark:text-gray-300">{{ $t('pool.create.stage') }}</label>

        <!-- Loading -->
        <div v-if="loadingStage" class="flex items-center gap-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3.5">
          <div class="w-9 h-9 rounded-xl bg-gray-200 dark:bg-gray-700 animate-pulse shrink-0" />
          <div class="flex-1 space-y-1.5">
            <div class="h-3 w-32 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
            <div class="h-2.5 w-24 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
          </div>
        </div>

        <!-- Resolved stage -->
        <div v-else-if="stage" class="flex items-center gap-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3.5">
          <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shrink-0">
            <v-icon name="hi-solid-calendar" class="w-4.5 h-4.5 text-white" />
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-semibold text-gray-900 dark:text-white truncate">
              {{ stage.name_complete || stage.name }}
            </p>
            <p class="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
              {{ $t('pool.create.stageInfo') }}
            </p>
          </div>
          <span
            v-if="stage.is_current"
            class="inline-flex items-center px-2 py-0.5 rounded-full text-2xs font-semibold bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 shrink-0"
          >
            {{ $t('pool.create.current') }} 
          </span>
        </div>

        <!-- Failed to resolve -->
        <div v-else class="flex items-center gap-2 bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3.5">
          <v-icon name="hi-solid-exclamation" class="w-4 h-4 text-amber-500 shrink-0" />
          <p class="text-xs text-amber-600 dark:text-amber-400">
            {{ $t('pool.create.stageResolveError') }}
          </p>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex gap-3">
        <button
          @click="close"
          :disabled="isLoading"
          class="flex-1 py-3 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 active:scale-[0.98] transition-all disabled:opacity-50"
        >
          {{ $t('common.actions.cancel') }}
        </button>
        <button
          @click="handleCreate"
          :disabled="isLoading || !canSubmit"
          class="flex-1 py-3 rounded-xl text-sm font-semibold text-white bg-emerald-600 active:scale-[0.98] shadow-sm shadow-emerald-500/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <div v-if="isLoading" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          <v-icon v-else name="hi-solid-plus-circle" class="w-4 h-4" />
          {{ $t('pool.create.title') }}
        </button>
      </div>
    </template>
  </BottomSheet>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import BottomSheet from "@/components/ui/BottomSheet.vue";
import { FormInput } from "@/components/ui";
import { poolService } from "@/services/pool/poolService";
import { useFootballLeagueStore } from "@/store/football/league/useFootballLeagueStore";
import { useValidationStore } from "@/store/validation/useValidationStore";
import type { PoolResponse } from "@/interfaces/pool/PoolResponse";
import type { FootballStageResponse } from "@/interfaces/football/stage/FootballStageResponse";

const props = withDefaults(defineProps<{ isVisible?: boolean }>(), {
  isVisible: false,
});

const emit = defineEmits<{
  close: [];
  created: [pool: PoolResponse];
}>();

const validationStore = useValidationStore();
const footballLeagueStore = useFootballLeagueStore();

// Form state
const name = ref("");
const description = ref("");
const isLoading = ref(false);

// The pool's stage is resolved automatically from the current league (single stage).
const stage = ref<FootballStageResponse | null>(null);
const loadingStage = ref(false);

// The currently selected league, shown alongside the resolved stage.
const league = computed(() => footballLeagueStore.getLeague);

const onLeagueLogoError = (e: Event) => {
  (e.target as HTMLImageElement).src = "/img/default-avatar.svg";
};

const fieldError = (field: string) => validationStore.getFieldError(field)[0] || "";
const descriptionError = computed(() => fieldError("description"));

const canSubmit = computed(() => name.value.trim().length > 0 && !!stage.value);

// Resolve the single stage the pool will be tied to for the current league.
const loadStage = async () => {
  const leagueUuid = footballLeagueStore.getFootballLeagueUuid();
  if (!leagueUuid) return;

  loadingStage.value = true;
  stage.value = null;
  try {
    stage.value = await poolService.getStagePoolByLeagueUuid(leagueUuid);
  } catch (e) {
    console.error("Error loading pool stage:", e);
  } finally {
    loadingStage.value = false;
  }
};

// Reset the form and (re)resolve the stage whenever the sheet opens.
watch(
  () => props.isVisible,
  (visible) => {
    if (visible) {
      name.value = "";
      description.value = "";
      validationStore.clearValidatorError();
      loadStage();
    }
  }
);

// Clear field errors as the user edits.
watch(name, () => fieldError("name") && validationStore.clearFieldError("name"));
watch(description, () => descriptionError.value && validationStore.clearFieldError("description"));

const close = () => {
  if (!isLoading.value) emit("close");
};

const handleCreate = async () => {
  if (!canSubmit.value || isLoading.value || !stage.value) return;

  isLoading.value = true;
  validationStore.clearValidatorError();

  try {
    const pool = await poolService.createPool({
      stage_uuid: stage.value.uuid,
      name: name.value.trim(),
      description: description.value.trim() || null,
    });
    emit("created", pool);
  } catch (e) {
    // 422 errors are surfaced via validationStore (inputs) + a toast, both handled
    // by the API interceptor in useApiFantasy.
    console.error("Error creating pool:", e);
  } finally {
    isLoading.value = false;
  }
};
</script>
