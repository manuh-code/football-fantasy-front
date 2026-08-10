<template>
  <BottomSheet
    :is-visible="isVisible"
    :title="$t('fantasy.draftSettings.title')"
    :subtitle="$t('fantasy.draftSettings.subtitle')"
    icon="hi-solid-cog"
    icon-variant="emerald"
    size="auto"
    role="dialog"
    :dismissible="!isLoading"
    @close="close"
  >
    <div class="space-y-4">
      <!-- Tipo de draft -->
      <div class="flex flex-col gap-1.5">
        <label class="text-sm font-semibold text-gray-700 dark:text-gray-300">{{ $t('fantasy.draftSettings.type.label') }}</label>

        <div class="grid grid-cols-2 gap-2">
          <button
            v-for="type in draftTypes"
            :key="type.value"
            type="button"
            :disabled="isLoading"
            @click="draftType = type.value"
            class="flex flex-col gap-1 p-3 rounded-xl border-[1.5px] text-left transition-colors disabled:opacity-50"
            :class="draftType === type.value
              ? 'border-emerald-600 bg-emerald-50/60 dark:bg-emerald-900/10'
              : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 active:bg-gray-100 dark:active:bg-gray-700/60'"
          >
            <span class="flex items-center gap-1.5">
              <v-icon
                :name="type.icon"
                class="w-3.5 h-3.5 shrink-0"
                :class="draftType === type.value ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400 dark:text-gray-500'"
              />
              <span
                class="text-xs font-bold"
                :class="draftType === type.value ? 'text-emerald-700 dark:text-emerald-400' : 'text-gray-700 dark:text-gray-200'"
              >{{ type.title }}</span>
            </span>
            <span class="text-2xs leading-snug text-gray-500 dark:text-gray-400">{{ type.description }}</span>
          </button>
        </div>
        <span v-if="fieldError('draft_type')" class="text-xs text-red-600 dark:text-red-400">{{ fieldError('draft_type') }}</span>
      </div>

      <!-- Fecha y hora -->
      <DateTimePicker
        id="draft-day"
        v-model="draftDay"
        :label="$t('fantasy.draftSettings.day.label')"
        :placeholder="$t('fantasy.draftSettings.day.placeholder')"
        :help-text="draftType === 'auto'
          ? $t('fantasy.draftSettings.day.autoHint')
          : $t('fantasy.draftSettings.day.snakeHint')"
        :error="fieldError('draft_day')"
        :min="minDraftDay"
        :disabled="isLoading"
      />

      <!-- Tiempo por turno — sólo el draft en vivo tiene reloj -->
      <div v-if="draftType === 'snake'" class="flex flex-col gap-1.5">
        <label class="text-sm font-semibold text-gray-700 dark:text-gray-300">{{ $t('fantasy.draftSettings.timer.label') }}</label>

        <div class="flex gap-2">
          <button
            v-for="option in timerOptions"
            :key="`timer-${option.value}`"
            type="button"
            :disabled="isLoading"
            @click="pickTimer = option.value"
            class="flex-1 flex flex-col items-center gap-0.5 py-2.5 rounded-xl border-[1.5px] transition-colors disabled:opacity-60"
            :class="pickTimer === option.value
              ? 'border-emerald-600 bg-emerald-50/60 dark:bg-emerald-900/10 text-emerald-700 dark:text-emerald-400'
              : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 active:bg-gray-100 dark:active:bg-gray-700/60'"
          >
            <span class="text-sm font-bold tabular-nums">{{ option.label }}</span>
            <span class="text-2xs font-medium">{{ option.tag }}</span>
          </button>
        </div>
        <span v-if="fieldError('pick_timer')" class="text-xs text-red-600 dark:text-red-400">{{ fieldError('pick_timer') }}</span>
      </div>

      <!-- Qué implica el auto draft: se corre solo y exige la liga llena -->
      <div
        v-else
        class="flex items-start gap-2.5 bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3.5"
      >
        <v-icon name="hi-solid-information-circle" class="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
        <div class="flex flex-col gap-1">
          <p class="text-xs font-semibold text-amber-700 dark:text-amber-400">
            {{ $t('fantasy.draftSettings.auto.requirementTitle') }}
          </p>
          <p class="text-2xs leading-relaxed text-amber-600 dark:text-amber-400/90">
            {{ $t('fantasy.draftSettings.auto.requirementBody', { joined: membersCount, total: participantsCount }) }}
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
          @click="handleSave"
          :disabled="isLoading || !canSubmit"
          class="flex-1 py-3 rounded-xl text-sm font-semibold text-white bg-emerald-600 active:scale-[0.98] shadow-sm shadow-emerald-500/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <div v-if="isLoading" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          <v-icon v-else name="hi-solid-check-circle" class="w-4 h-4" />
          {{ $t('fantasy.draftSettings.submit') }}
        </button>
      </div>
    </template>
  </BottomSheet>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import BottomSheet from "@/components/ui/BottomSheet.vue";
import DateTimePicker from "@/components/ui/DateTimePicker.vue";
import { useToast } from "@/composables/useToast";
import { fantasyLeagueService } from "@/services/fantasy/leagues/FantasyLeagueService";
import { useValidationStore } from "@/store/validation/useValidationStore";
import type { FantasyDraftType } from "@/interfaces/fantasy/leagues/FantasyLeagueDraftPayload";
import type { FantasyLeaguesResponse } from "@/interfaces/fantasy/leagues/FantasyLeaguesResponse";

const props = withDefaults(
  defineProps<{
    isVisible?: boolean;
    league: FantasyLeaguesResponse | null;
  }>(),
  { isVisible: false },
);

const emit = defineEmits<{
  close: [];
  saved: [];
}>();

const { t } = useI18n();
const toast = useToast();
const validationStore = useValidationStore();

const DEFAULT_PICK_TIMER = 300;

const draftType = ref<FantasyDraftType>("snake");
const draftDay = ref("");
const pickTimer = ref<number>(DEFAULT_PICK_TIMER);
const isLoading = ref(false);

const membersCount = computed(() => props.league?.participants?.length ?? 0);
const participantsCount = computed(() => props.league?.participants_count ?? 0);

const draftTypes = computed<
  { value: FantasyDraftType; title: string; description: string; icon: string }[]
>(() => [
  {
    value: "snake",
    title: t("fantasy.draftSettings.type.snake.title"),
    description: t("fantasy.draftSettings.type.snake.desc"),
    icon: "hi-solid-users",
  },
  {
    value: "auto",
    title: t("fantasy.draftSettings.type.auto.title"),
    description: t("fantasy.draftSettings.type.auto.desc"),
    icon: "hi-solid-lightning-bolt",
  },
]);

const timerOptions = computed(() => [
  { value: 60, label: "1", tag: t("fantasy.draftSettings.timer.minutes") },
  { value: 180, label: "3", tag: t("fantasy.draftSettings.timer.minutes") },
  { value: 300, label: "5", tag: t("fantasy.draftSettings.timer.minutes") },
]);

// El auto draft se dispara por fecha, así que una fecha pasada arrancaría el
// draft en el siguiente minuto: el picker no la deja elegir y la API la rechaza.
const minDraftDay = computed(() => new Date().toISOString());

const canSubmit = computed(() => draftDay.value !== "");

const fieldError = (field: string) => validationStore.getFieldError(field)[0] || "";

// Cada apertura parte del estado guardado, no de lo que se tecleó y se descartó
// la vez anterior.
watch(
  () => props.isVisible,
  (visible) => {
    if (!visible) return;

    validationStore.clearValidatorError();

    const draft = props.league?.draft;
    draftType.value = draft?.draft_type ?? "snake";
    pickTimer.value = draft?.pick_timer ?? DEFAULT_PICK_TIMER;
    // Una fecha ya pasada no se puede reutilizar como valor inicial: el picker
    // la tiene por debajo del mínimo y la API la rechazaría en el auto draft.
    draftDay.value = draft?.draft_day && new Date(draft.draft_day) > new Date()
      ? new Date(draft.draft_day).toISOString()
      : "";
  },
  { immediate: true },
);

watch(draftType, () => validationStore.clearValidatorError());

const close = () => {
  if (!isLoading.value) emit("close");
};

const handleSave = async () => {
  if (!canSubmit.value || isLoading.value || !props.league) return;

  isLoading.value = true;
  validationStore.clearValidatorError();

  try {
    await fantasyLeagueService.storeDraftSettings(props.league.uuid, {
      draft_type: draftType.value,
      draft_day: draftDay.value,
      // El auto draft no tiene reloj de turno; se manda igual para no perder el
      // valor si el admin vuelve al draft en vivo.
      pick_timer: pickTimer.value,
    });

    toast.success(t("fantasy.draftSettings.saved"));
    emit("saved");
    emit("close");
  } catch (error) {
    // Los 422 los pinta el interceptor de useApiFantasy en validationStore.
    console.error("Error saving draft settings:", error);
  } finally {
    isLoading.value = false;
  }
};
</script>
