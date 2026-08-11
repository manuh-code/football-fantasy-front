<template>
  <div class="space-y-4 pb-4">
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

    <!-- Loading -->
    <div v-if="isLoading" class="space-y-3">
      <div class="h-56 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60 animate-pulse" />
      <div class="h-20 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60 animate-pulse" />
    </div>

    <!-- Load error -->
    <div
      v-else-if="loadError"
      class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 p-8 flex flex-col items-center text-center"
    >
      <v-icon name="hi-solid-exclamation-circle" class="w-9 h-9 text-red-400 dark:text-red-500 mb-3" />
      <p class="text-footnote text-red-500 dark:text-red-400 mb-4">{{ loadError }}</p>
      <button
        type="button"
        class="px-4 py-2 text-xs font-semibold rounded-full bg-rose-500 text-white active:bg-rose-600 transition-colors"
        @click="load"
      >
        {{ $t('common.actions.retry') }}
      </button>
    </div>

    <template v-else-if="settings">
      <!-- Congelado. Sólo al admin: para el resto la pantalla ya es de lectura y
           el aviso sería ruido. En un survivor oficial tampoco aparece — nadie
           es admin ahí, así que nadie esperaba poder tocarlo. -->
      <div
        v-if="settings.is_admin && settings.locked_reason"
        class="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-2xl p-4 flex items-start gap-3"
      >
        <v-icon name="hi-solid-lock-closed" class="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
        <div class="min-w-0">
          <p class="text-footnote font-semibold text-amber-900 dark:text-amber-200">
            {{ $t('survivor.settings.locked.title') }}
          </p>
          <p class="text-2xs text-amber-700 dark:text-amber-300/90 leading-relaxed mt-0.5">
            {{ lockedMessage }}
          </p>
        </div>
      </div>

      <!-- Reglas de juego -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 p-4">
        <div class="flex items-center gap-2 mb-1">
          <v-icon name="hi-solid-adjustments" class="w-4 h-4 text-rose-500 shrink-0" />
          <h3 class="text-callout font-semibold text-gray-900 dark:text-white">
            {{ $t('survivor.settings.title') }}
          </h3>
          <span
            v-if="settings.is_custom"
            class="ml-auto inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-2xs font-semibold bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 shrink-0"
          >
            <v-icon name="hi-solid-adjustments" class="w-3 h-3" />
            {{ $t('survivor.settings.customBadge') }}
          </span>
        </div>

        <p class="text-2xs text-gray-400 dark:text-gray-500 leading-snug mb-3">
          {{ settingsHint }}
        </p>

        <SurvivorRuleFields
          v-model="draftRules"
          :lives-min="settings.lives_min"
          :lives-max="settings.lives_max"
          :editable="canEdit"
          :defaults="settings.default_rules"
        />

        <!-- Volver al set compartido -->
        <button
          v-if="settings.is_custom && canEdit"
          type="button"
          :disabled="isResetting || isSaving"
          class="mt-3 w-full flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl border border-dashed border-gray-200 dark:border-gray-700 text-footnote font-semibold text-gray-500 dark:text-gray-400 active:bg-gray-50 dark:active:bg-gray-800/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          @click="resetToDefault"
        >
          <v-icon v-if="isResetting" name="pr-spinner" class="w-4 h-4" animation="spin" />
          <v-icon v-else name="hi-solid-refresh" class="w-4 h-4" />
          {{ $t('survivor.settings.resetDefaults') }}
        </button>
      </div>

      <!-- Cupo: sólo tiene sentido en un survivor de usuario. El oficial no
           tiene tope, y ahí `max_participants` llega nulo. -->
      <div
        v-if="settings.is_admin && settings.max_participants !== null"
        class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 p-4"
      >
        <div class="flex items-center gap-2 mb-3">
          <v-icon name="hi-solid-users" class="w-4 h-4 text-rose-500 shrink-0" />
          <h3 class="text-callout font-semibold text-gray-900 dark:text-white">
            {{ $t('survivor.settings.capacityTitle') }}
          </h3>
        </div>

        <div class="flex flex-wrap items-center gap-x-3 gap-y-2.5 bg-gray-50 dark:bg-gray-900/40 rounded-xl px-3 py-2.5">
          <div class="flex-1 min-w-[7rem]">
            <p class="text-footnote font-medium text-gray-900 dark:text-white leading-tight">
              {{ $t('survivor.settings.capacityValue', { count: draftParticipants }, draftParticipants) }}
            </p>
            <p class="text-2xs text-gray-400 dark:text-gray-500 leading-snug">
              {{ $t('survivor.settings.capacityOccupied', { count: settings.participants_count }) }}
            </p>
          </div>

          <StepperInput
            v-if="canEdit"
            v-model="draftParticipants"
            :min="settings.participants_min"
            :max="settings.participants_max"
            :aria-label="$t('survivor.settings.capacityTitle')"
            :decrease-label="$t('survivor.settings.capacityDecreaseAria')"
            :increase-label="$t('survivor.settings.capacityIncreaseAria')"
            class="ml-auto"
          />
          <span
            v-else
            class="inline-flex items-center justify-center min-w-[2.75rem] px-2 py-1 rounded-lg text-footnote font-bold bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 shrink-0 ml-auto"
          >
            {{ draftParticipants }}
          </span>
        </div>

        <p v-if="canEdit" class="text-2xs text-gray-400 dark:text-gray-500 leading-relaxed mt-2">
          {{ $t('survivor.settings.capacityFloor', { min: settings.participants_min }) }}
        </p>
      </div>

      <!-- Sólo aparece cuando hay algo que guardar. El bottom-24 deja libre la
           barra de navegación flotante. -->
      <div
        v-if="changeCount > 0"
        class="save-bar sticky bottom-24 z-[95] flex items-center gap-3 rounded-2xl bg-rose-600 ring-1 ring-rose-700/40 px-4 py-3 shadow-xl shadow-rose-900/20"
      >
        <p class="flex-1 min-w-0 text-footnote font-medium text-white truncate">
          {{ $t('survivor.settings.pendingChanges', { count: changeCount }, changeCount) }}
        </p>
        <button
          type="button"
          :disabled="isSaving"
          class="px-3 h-9 rounded-full text-footnote font-semibold text-white/80 active:bg-white/15 transition-colors disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
          @click="discard"
        >
          {{ $t('survivor.settings.discard') }}
        </button>
        <button
          type="button"
          :disabled="isSaving"
          class="inline-flex items-center gap-1.5 px-4 h-9 rounded-full bg-rose-50 text-rose-800 text-footnote font-semibold active:bg-rose-200 transition-colors disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          @click="save"
        >
          <v-icon v-if="isSaving" name="pr-spinner" class="w-4 h-4" animation="spin" />
          {{ $t('survivor.settings.save') }}
        </button>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { survivorService } from "@/services/survivor/SurvivorServive";
import { useToast } from "@/composables/useToast";
import StepperInput from "@/components/ui/StepperInput.vue";
import SurvivorRuleFields from "@/components/survivor/SurvivorRuleFields.vue";
import type {
  SurvivorRules,
  SurvivorSettingsResponse,
} from "@/interfaces/survivor/SurvivorSettingsResponse";

const props = defineProps<{ survivorUuid: string }>();

const { t } = useI18n();
const toast = useToast();

const steps = computed(() => [
  t("survivor.rules.step1"),
  t("survivor.rules.step2"),
  t("survivor.rules.step3"),
  t("survivor.rules.step4"),
]);

const settings = ref<SurvivorSettingsResponse | null>(null);
const isLoading = ref(false);
const isSaving = ref(false);
const isResetting = ref(false);
const loadError = ref<string | null>(null);

/**
 * Valores en edición. Se trabaja sobre una copia y no sobre `settings` para que
 * "descartar" sea volver a lo que trajo el servidor, sin una segunda petición.
 */
const draftRules = ref<SurvivorRules>({
  max_lives: 1,
  draw_counts_as: "survive",
  miss_penalty: true,
});
const draftParticipants = ref(0);

const resetDraft = (data: SurvivorSettingsResponse) => {
  draftRules.value = { ...data.rules };
  draftParticipants.value = data.max_participants ?? 0;
};

/** Editar exige ser admin **y** que el survivor no haya arrancado; el API ya
 *  resolvió ambas en una sola bandera. */
const canEdit = computed(() => !!settings.value?.is_editable);

const settingsHint = computed(() => {
  if (canEdit.value) return t("survivor.settings.subtitle");
  // A un survivor oficial no le falta un admin: es que no tiene. Decir "sólo su
  // administrador puede cambiarlo" mandaría a buscar a alguien que no existe.
  if (settings.value?.is_official) return t("survivor.settings.officialHint");
  return t("survivor.settings.readOnlyHint");
});

const lockedMessage = computed(() => {
  const reason = settings.value?.locked_reason;
  return reason ? t(`survivor.settings.locked.${reason}`) : t("survivor.settings.locked.generic");
});

/** Cambios sin guardar: contra lo que trajo el servidor. */
const changeCount = computed(() => {
  const current = settings.value;
  if (!current || !canEdit.value) return 0;

  let count = (Object.keys(current.rules) as (keyof SurvivorRules)[]).filter(
    (key) => draftRules.value[key] !== current.rules[key],
  ).length;

  if (current.max_participants !== null && draftParticipants.value !== current.max_participants) {
    count++;
  }

  return count;
});

const applyResponse = (data: SurvivorSettingsResponse) => {
  settings.value = data;
  resetDraft(data);
};

const load = async () => {
  if (!props.survivorUuid) return;

  isLoading.value = true;
  loadError.value = null;
  try {
    applyResponse(await survivorService.getSettings(props.survivorUuid));
  } catch (e) {
    console.error("Error loading survivor settings:", e);
    loadError.value = t("survivor.settings.loadError");
  } finally {
    isLoading.value = false;
  }
};

const discard = () => {
  if (settings.value) resetDraft(settings.value);
};

const save = async () => {
  if (isSaving.value || !settings.value) return;

  isSaving.value = true;
  try {
    applyResponse(
      await survivorService.updateSettings(props.survivorUuid, {
        max_participants: draftParticipants.value,
        max_lives: draftRules.value.max_lives,
        draw_counts_as: draftRules.value.draw_counts_as,
        miss_penalty: draftRules.value.miss_penalty,
      }),
    );
    toast.success(t("survivor.settings.savedTitle"), t("survivor.settings.savedMsg"));
  } catch (e) {
    // El 409 (survivor ya arrancado) y el 422 los anuncia el interceptor de
    // useApiFantasy con su propio toast.
    console.error("Error saving survivor settings:", e);
  } finally {
    isSaving.value = false;
  }
};

const resetToDefault = async () => {
  if (isResetting.value) return;

  isResetting.value = true;
  try {
    applyResponse(await survivorService.resetSettings(props.survivorUuid));
    toast.success(t("survivor.settings.resetTitle"), t("survivor.settings.resetMsg"));
  } catch (e) {
    console.error("Error resetting survivor settings:", e);
  } finally {
    isResetting.value = false;
  }
};

watch(() => props.survivorUuid, load);

onMounted(load);
</script>

<style scoped>
/* Sin fill-mode: con `both`, una pestaña en segundo plano congela la animación
   en su primer fotograma y la barra se queda invisible. */
.save-bar {
  animation: save-bar-in 0.2s ease;
}

@keyframes save-bar-in {
  from {
    opacity: 0;
    transform: translateY(0.5rem);
  }
}

@media (prefers-reduced-motion: reduce) {
  .save-bar {
    animation: none;
  }
}
</style>
