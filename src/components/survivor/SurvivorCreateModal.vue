<template>
  <BottomSheet
    :is-visible="isVisible"
    :title="$t('survivor.create.title')"
    :subtitle="$t('survivor.create.subtitle')"
    icon="hi-solid-shield-check"
    icon-variant="red"
    size="lg"
    :dismissible="!isLoading"
    @close="close"
  >
    <div class="space-y-4">
      <!-- Nombre -->
      <FormInput
        id="survivor-name"
        v-model="name"
        type="text"
        :label="$t('survivor.create.nameLabel')"
        icon="hi-solid-document-text"
        :placeholder="$t('survivor.create.namePlaceholder')"
        :error="fieldError('name')"
        :disabled="isLoading"
      />

      <!-- Descripción -->
      <div class="flex flex-col gap-1.5">
        <label for="survivor-description" class="text-sm font-semibold text-gray-700 dark:text-gray-300">
          {{ $t('survivor.create.descLabel') }}
          <span class="font-normal text-gray-400 dark:text-gray-500">({{ $t('common.states.optional') }})</span>
        </label>
        <textarea
          id="survivor-description"
          v-model="description"
          rows="2"
          :placeholder="$t('survivor.create.descPlaceholder')"
          :disabled="isLoading"
          :class="[
            'w-full px-4 py-3 rounded-xl border-[1.5px] bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-base md:text-sm placeholder-gray-400 dark:placeholder-gray-500 resize-none transition-colors focus:outline-none focus:ring-2 disabled:opacity-60',
            descriptionError
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10'
              : 'border-gray-200 dark:border-gray-700 focus:border-rose-500 focus:ring-rose-500/10',
          ]"
        />
        <span v-if="descriptionError" class="text-xs text-red-600 dark:text-red-400">{{ descriptionError }}</span>
      </div>

      <!-- Liga: el survivor se juega sobre su temporada en curso. -->
      <div class="flex flex-col gap-1.5">
        <label class="text-sm font-semibold text-gray-700 dark:text-gray-300">{{ $t('survivor.create.league') }}</label>

        <button
          type="button"
          :disabled="isLoading"
          aria-haspopup="dialog"
          :aria-expanded="isLeaguePickerOpen"
          class="flex items-center gap-3 min-h-[44px] bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3.5 text-left transition-colors active:bg-gray-100 dark:active:bg-gray-800 disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/40"
          @click="isLeaguePickerOpen = true"
        >
          <img
            v-if="selectedLeague"
            :src="selectedLeague.image_path || '/img/default-avatar.svg'"
            :alt="selectedLeague.name"
            class="w-9 h-9 object-contain shrink-0"
            @error="onLeagueLogoError"
          />
          <div v-else class="w-9 h-9 rounded-xl bg-gray-200 dark:bg-gray-700 flex items-center justify-center shrink-0">
            <v-icon name="hi-solid-globe-alt" class="w-4 h-4 text-gray-400" />
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-semibold text-gray-900 dark:text-white truncate">
              {{ selectedLeague?.name || $t('survivor.create.leaguePick') }}
            </p>
            <p class="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{{ $t('survivor.create.leagueChange') }}</p>
          </div>
          <v-icon name="hi-solid-chevron-right" class="w-4 h-4 text-gray-400 dark:text-gray-500 shrink-0" />
        </button>

        <!-- Temporada resuelta de la liga elegida -->
        <div v-if="loadingStage" class="flex items-center gap-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3.5">
          <div class="w-9 h-9 rounded-xl bg-gray-200 dark:bg-gray-700 animate-pulse shrink-0" />
          <div class="flex-1 space-y-1.5">
            <div class="h-3 w-32 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
            <div class="h-2.5 w-24 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
          </div>
        </div>

        <div v-else-if="stage" class="flex items-center gap-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3.5">
          <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center shrink-0">
            <v-icon name="hi-solid-calendar" class="w-4 h-4 text-white" />
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-semibold text-gray-900 dark:text-white truncate">
              {{ stage.name_complete || stage.name }}
            </p>
            <p class="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{{ $t('survivor.create.stageInfo') }}</p>
          </div>
        </div>

        <!-- Sin temporada en curso no hay jornadas sobre las que jugar. -->
        <div v-else class="flex items-center gap-2 bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3.5">
          <v-icon name="hi-solid-exclamation" class="w-4 h-4 text-amber-500 shrink-0" />
          <p class="text-xs text-amber-600 dark:text-amber-400">{{ $t('survivor.create.stageResolveError') }}</p>
        </div>
      </div>

      <!-- Cupo -->
      <div class="flex flex-col gap-1.5">
        <label class="text-sm font-semibold text-gray-700 dark:text-gray-300">
          {{ $t('survivor.create.participantsLabel') }}
        </label>

        <div class="flex flex-wrap items-center gap-x-3 gap-y-2.5 bg-gray-50 dark:bg-gray-800/50 rounded-xl px-3 py-2.5">
          <div class="flex-1 min-w-[7rem]">
            <p class="text-sm font-semibold text-gray-900 dark:text-white">
              {{ $t('survivor.create.participantsValue', { count: maxParticipants }, maxParticipants) }}
            </p>
            <p class="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{{ $t('survivor.create.participantsHint') }}</p>
          </div>

          <StepperInput
            v-model="maxParticipants"
            :min="PARTICIPANTS_MIN"
            :max="PARTICIPANTS_MAX"
            :disabled="isLoading"
            :aria-label="$t('survivor.create.participantsLabel')"
            :decrease-label="$t('survivor.create.participantsDecreaseAria')"
            :increase-label="$t('survivor.create.participantsIncreaseAria')"
            class="ml-auto"
          />
        </div>

        <span v-if="participantsError" class="text-xs text-red-600 dark:text-red-400">{{ participantsError }}</span>
      </div>

      <!-- Reglas de juego: las mismas que luego se editan en su pestaña. -->
      <div class="flex flex-col gap-1.5">
        <label class="text-sm font-semibold text-gray-700 dark:text-gray-300">
          {{ $t('survivor.create.rulesLabel') }}
        </label>
        <p class="text-xs text-gray-400 dark:text-gray-500 -mt-1">{{ $t('survivor.create.rulesHint') }}</p>
        <SurvivorRuleFields v-model="rules" :lives-min="LIVES_MIN" :lives-max="LIVES_MAX" :editable="!isLoading" />
      </div>
    </div>

    <template #footer>
      <div class="flex gap-3">
        <button
          :disabled="isLoading"
          class="flex-1 py-3 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 active:scale-[0.98] transition-all disabled:opacity-50"
          @click="close"
        >
          {{ $t('common.actions.cancel') }}
        </button>
        <button
          :disabled="isLoading || !canSubmit"
          class="flex-1 py-3 rounded-xl text-sm font-semibold text-white bg-rose-600 active:scale-[0.98] shadow-sm shadow-rose-500/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          @click="handleCreate"
        >
          <div v-if="isLoading" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          <v-icon v-else name="hi-solid-plus-circle" class="w-4 h-4" />
          {{ $t('survivor.create.submit') }}
        </button>
      </div>
    </template>
  </BottomSheet>

  <!-- Cambio de liga, apilado sobre este formulario. -->
  <LeaguePickerSheet
    :is-visible="isLeaguePickerOpen"
    :selected-uuid="selectedLeague?.uuid"
    accent="red"
    @close="isLeaguePickerOpen = false"
    @select="chooseLeague"
  />
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import BottomSheet from "@/components/ui/BottomSheet.vue";
import StepperInput from "@/components/ui/StepperInput.vue";
import LeaguePickerSheet from "@/components/football/leagues/LeaguePickerSheet.vue";
import SurvivorRuleFields from "@/components/survivor/SurvivorRuleFields.vue";
import { FormInput } from "@/components/ui";
import { survivorService } from "@/services/survivor/SurvivorServive";
import { useFootballLeagueStore } from "@/store/football/league/useFootballLeagueStore";
import { useValidationStore } from "@/store/validation/useValidationStore";
import type { FootballLeagueResponse } from "@/interfaces/football/league/FootballLeagueResponse";
import type { FootballStageResponse } from "@/interfaces/football/stage/FootballStageResponse";
import type { SurvivorResponse } from "@/interfaces/survivor/SurvivorResponse";
import type { SurvivorRules } from "@/interfaces/survivor/SurvivorSettingsResponse";

const props = withDefaults(defineProps<{ isVisible?: boolean }>(), { isVisible: false });

const emit = defineEmits<{
  close: [];
  created: [survivor: SurvivorResponse];
}>();

const validationStore = useValidationStore();
const footballLeagueStore = useFootballLeagueStore();

/** Mismas cotas que valida el API (config `survivor.*`). */
const PARTICIPANTS_MIN = 2;
const PARTICIPANTS_MAX = 100;
const PARTICIPANTS_DEFAULT = 10;
const LIVES_MIN = 1;
const LIVES_MAX = 5;

const DEFAULT_RULES: SurvivorRules = {
  max_lives: 1,
  draw_counts_as: "survive",
  miss_penalty: true,
};

const name = ref("");
const description = ref("");
const maxParticipants = ref(PARTICIPANTS_DEFAULT);
const rules = ref<SurvivorRules>({ ...DEFAULT_RULES });
const isLoading = ref(false);

const stage = ref<FootballStageResponse | null>(null);
const loadingStage = ref(false);

const selectedLeague = ref<FootballLeagueResponse | null>(null);
const isLeaguePickerOpen = ref(false);

const onLeagueLogoError = (e: Event) => {
  (e.target as HTMLImageElement).src = "/img/default-avatar.svg";
};

const chooseLeague = (league: FootballLeagueResponse) => {
  if (selectedLeague.value?.uuid === league.uuid) return;
  selectedLeague.value = league;
  loadStage();
};

const fieldError = (field: string) => validationStore.getFieldError(field)[0] || "";
const descriptionError = computed(() => fieldError("description"));
const participantsError = computed(() => fieldError("max_participants"));

const canSubmit = computed(
  () => name.value.trim().length > 0 && !!selectedLeague.value && !!stage.value,
);

/** La temporada sobre la que se jugará; sin ella el API rechaza la creación. */
const loadStage = async () => {
  const leagueUuid = selectedLeague.value?.uuid;
  if (!leagueUuid) return;

  loadingStage.value = true;
  stage.value = null;
  try {
    // Silencioso: "esta liga no tiene temporada en curso" ya se explica en el
    // propio formulario, con el aviso ámbar bajo el selector.
    stage.value = await survivorService.getStageByLeagueUuid(leagueUuid);
  } catch (e) {
    console.error("Error loading survivor stage:", e);
  } finally {
    loadingStage.value = false;
  }
};

watch(
  () => props.isVisible,
  (visible) => {
    if (!visible) return;
    name.value = "";
    description.value = "";
    maxParticipants.value = PARTICIPANTS_DEFAULT;
    rules.value = { ...DEFAULT_RULES };
    isLeaguePickerOpen.value = false;
    selectedLeague.value = footballLeagueStore.getLeague;
    validationStore.clearValidatorError();
    loadStage();
  },
);

watch(name, () => fieldError("name") && validationStore.clearFieldError("name"));
watch(description, () => descriptionError.value && validationStore.clearFieldError("description"));
watch(maxParticipants, () => participantsError.value && validationStore.clearFieldError("max_participants"));

const close = () => {
  if (!isLoading.value) emit("close");
};

const handleCreate = async () => {
  if (!canSubmit.value || isLoading.value || !selectedLeague.value) return;

  isLoading.value = true;
  validationStore.clearValidatorError();

  try {
    const survivor = await survivorService.createSurvivor({
      name: name.value.trim(),
      description: description.value.trim() || null,
      league_uuid: selectedLeague.value.uuid,
      max_participants: maxParticipants.value,
      max_lives: rules.value.max_lives,
      draw_counts_as: rules.value.draw_counts_as,
      miss_penalty: rules.value.miss_penalty,
    });
    emit("created", survivor);
  } catch (e) {
    // El 422 llega a los campos vía validationStore y el toast lo pone el
    // interceptor de useApiFantasy.
    console.error("Error creating survivor:", e);
  } finally {
    isLoading.value = false;
  }
};
</script>
