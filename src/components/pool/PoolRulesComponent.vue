<template>
  <div class="space-y-4 pb-4">
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

    <!-- Loading -->
    <div v-if="isLoading" class="space-y-3">
      <div class="h-40 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60 animate-pulse" />
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
        @click="load"
        class="px-4 py-2 text-xs font-semibold rounded-full bg-emerald-500 text-white active:bg-emerald-600 transition-colors"
      >
        {{ $t('common.actions.retry') }}
      </button>
    </div>

    <template v-else-if="settings">
      <!-- Frozen: the first match already kicked off, so nothing below can move.
           Only the admin sees it — for everyone else the screen is read-only
           anyway and the notice would be noise. -->
      <div
        v-if="settings.is_admin && settings.locked_reason"
        class="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-2xl p-4 flex items-start gap-3"
      >
        <v-icon name="hi-solid-lock-closed" class="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
        <div class="min-w-0">
          <p class="text-footnote font-semibold text-amber-900 dark:text-amber-200">
            {{ $t('pool.settings.locked.title') }}
          </p>
          <p class="text-2xs text-amber-700 dark:text-amber-300/90 leading-relaxed mt-0.5">
            {{ lockedMessage }}
          </p>
        </div>
      </div>

      <!-- Scoring rules -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 p-4">
        <div class="flex items-center gap-2 mb-1">
          <v-icon name="hi-solid-clipboard-list" class="w-4 h-4 text-emerald-500 shrink-0" />
          <h2 class="text-callout font-semibold text-gray-900 dark:text-white">{{ $t('pool.group.scoringRules') }}</h2>
          <span
            v-if="settings.is_custom"
            class="ml-auto inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-2xs font-semibold bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 shrink-0"
          >
            <v-icon name="hi-solid-adjustments" class="w-3 h-3" />
            {{ $t('pool.settings.customBadge') }}
          </span>
        </div>
        <!-- Al admin con la quiniela ya arrancada no se le repite nada: el
             banner de arriba ya dijo por qué no puede tocarlo, y "sólo su
             administrador puede cambiarlo" le mentiría — lo es. -->
        <p
          v-if="canEdit || !settings.is_admin"
          class="text-2xs text-gray-400 dark:text-gray-500 leading-snug mb-3"
        >
          {{ canEdit ? $t('pool.settings.subtitle') : $t('pool.settings.readOnlyHint') }}
        </p>

        <div class="space-y-2">
          <!-- La fila envuelve cuando no cabe: en un teléfono el nombre se queda
               arriba y el control baja a su propia línea. -->
          <div
            v-for="rule in rules"
            :key="rule.code"
            class="flex flex-wrap items-center gap-x-3 gap-y-2.5 bg-gray-50 dark:bg-gray-900/40 rounded-xl px-3 py-2.5"
          >
            <div class="w-8 h-8 rounded-lg bg-white dark:bg-gray-800 flex items-center justify-center shrink-0 ring-1 ring-gray-100 dark:ring-gray-700">
              <v-icon :name="ruleIcon(rule.code)" class="w-4 h-4 text-emerald-500" />
            </div>

            <div class="flex-1 min-w-[7rem]">
              <div class="flex items-center gap-1.5">
                <p class="text-footnote font-medium text-gray-900 dark:text-white leading-tight">
                  {{ $t(`pool.group.scoring.codes.${rule.code}.label`) }}
                </p>
                <span
                  v-if="rule.points !== rule.default_points"
                  class="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0"
                  :title="$t('pool.settings.changedFromDefault', { value: rule.default_points })"
                />
              </div>
              <p class="text-2xs text-gray-400 dark:text-gray-500 leading-snug">
                {{ $t(`pool.group.scoring.codes.${rule.code}.hint`) }}
              </p>
            </div>

            <!-- Stepper for the admin before kickoff; a plain badge for everyone else -->
            <div
              v-if="canEdit"
              class="flex items-center h-11 rounded-xl bg-white dark:bg-gray-800 ring-1 ring-gray-200 dark:ring-gray-700 overflow-hidden shrink-0 ml-auto"
            >
              <button
                type="button"
                :disabled="rule.points <= settings.points_min"
                @click="nudgeRule(rule.code, -1)"
                :aria-label="$t('pool.settings.decreaseAria', { name: $t(`pool.group.scoring.codes.${rule.code}.label`) })"
                class="w-11 h-11 grid place-items-center text-gray-500 dark:text-gray-400 active:bg-gray-100 dark:active:bg-gray-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-500"
              >
                <v-icon name="hi-solid-minus" class="w-4 h-4" />
              </button>
              <input
                :value="rule.points"
                @input="onRuleInput(rule.code, $event)"
                @blur="onRuleBlur(rule.code, $event)"
                type="text"
                inputmode="numeric"
                :aria-label="$t('pool.settings.pointsAria', { name: $t(`pool.group.scoring.codes.${rule.code}.label`) })"
                class="w-12 h-11 bg-transparent text-center text-callout font-bold tabular-nums text-emerald-600 dark:text-emerald-400 border-0 p-0 focus:outline-none focus:ring-0"
              />
              <button
                type="button"
                :disabled="rule.points >= settings.points_max"
                @click="nudgeRule(rule.code, 1)"
                :aria-label="$t('pool.settings.increaseAria', { name: $t(`pool.group.scoring.codes.${rule.code}.label`) })"
                class="w-11 h-11 grid place-items-center text-gray-500 dark:text-gray-400 active:bg-gray-100 dark:active:bg-gray-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-500"
              >
                <v-icon name="hi-solid-plus" class="w-4 h-4" />
              </button>
            </div>

            <span
              v-else
              class="inline-flex items-center justify-center min-w-[2.75rem] px-2 py-1 rounded-lg text-footnote font-bold bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 shrink-0 ml-auto"
            >
              +{{ rule.points }}
            </span>
          </div>
        </div>

        <!-- Back to the shared default set -->
        <button
          v-if="settings.is_custom && canEdit"
          type="button"
          :disabled="isResetting || isSaving"
          @click="resetToDefault"
          class="mt-3 w-full flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl border border-dashed border-gray-200 dark:border-gray-700 text-footnote font-semibold text-gray-500 dark:text-gray-400 active:bg-gray-50 dark:active:bg-gray-800/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <v-icon v-if="isResetting" name="pr-spinner" class="w-4 h-4" animation="spin" />
          <v-icon v-else name="hi-solid-refresh" class="w-4 h-4" />
          {{ $t('pool.settings.resetDefaults') }}
        </button>
      </div>

      <!-- Capacity — an admin setting, so it only shows up for them. Everyone
           else already sees the count on the Info tab. -->
      <div
        v-if="settings.is_admin"
        class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 p-4"
      >
        <div class="flex items-center gap-2 mb-3">
          <v-icon name="hi-solid-users" class="w-4 h-4 text-emerald-500 shrink-0" />
          <h2 class="text-callout font-semibold text-gray-900 dark:text-white">{{ $t('pool.settings.capacityTitle') }}</h2>
        </div>

        <div class="flex flex-wrap items-center gap-x-3 gap-y-2.5 bg-gray-50 dark:bg-gray-900/40 rounded-xl px-3 py-2.5">
          <div class="flex-1 min-w-[7rem]">
            <p class="text-footnote font-medium text-gray-900 dark:text-white leading-tight">
              {{ $t('pool.settings.capacityValue', { count: participants }, participants) }}
            </p>
            <p class="text-2xs text-gray-400 dark:text-gray-500 leading-snug">
              {{ $t('pool.settings.capacityOccupied', { count: settings.participants_count }) }}
            </p>
          </div>

          <div
            v-if="canEdit"
            class="flex items-center h-11 rounded-xl bg-white dark:bg-gray-800 ring-1 ring-gray-200 dark:ring-gray-700 overflow-hidden shrink-0 ml-auto"
          >
            <button
              type="button"
              :disabled="participants <= settings.participants_min"
              @click="nudgeParticipants(-1)"
              :aria-label="$t('pool.settings.capacityDecreaseAria')"
              class="w-11 h-11 grid place-items-center text-gray-500 dark:text-gray-400 active:bg-gray-100 dark:active:bg-gray-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-500"
            >
              <v-icon name="hi-solid-minus" class="w-4 h-4" />
            </button>
            <input
              :value="participants"
              @input="onParticipantsInput"
              @blur="onParticipantsBlur"
              type="text"
              inputmode="numeric"
              :aria-label="$t('pool.settings.capacityTitle')"
              class="w-12 h-11 bg-transparent text-center text-callout font-bold tabular-nums text-gray-900 dark:text-white border-0 p-0 focus:outline-none focus:ring-0"
            />
            <button
              type="button"
              :disabled="participants >= settings.participants_max"
              @click="nudgeParticipants(1)"
              :aria-label="$t('pool.settings.capacityIncreaseAria')"
              class="w-11 h-11 grid place-items-center text-gray-500 dark:text-gray-400 active:bg-gray-100 dark:active:bg-gray-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-500"
            >
              <v-icon name="hi-solid-plus" class="w-4 h-4" />
            </button>
          </div>

          <span
            v-else
            class="inline-flex items-center justify-center min-w-[2.75rem] px-2 py-1 rounded-lg text-footnote font-bold bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 shrink-0 ml-auto"
          >
            {{ participants }}
          </span>
        </div>

        <p v-if="canEdit" class="text-2xs text-gray-400 dark:text-gray-500 leading-relaxed mt-2">
          {{ $t('pool.settings.capacityFloor', { min: settings.participants_min }) }}
        </p>
      </div>

      <!-- Sólo aparece cuando hay algo que guardar: mientras no cambies nada no
           hay barra tapando la última fila. El bottom-24 deja libre la barra de
           navegación flotante, que también está en escritorio. -->
      <div
        v-if="changeCount > 0"
        class="save-bar sticky bottom-24 z-[95] flex items-center gap-3 rounded-2xl bg-emerald-600 ring-1 ring-emerald-700/40 px-4 py-3 shadow-xl shadow-emerald-900/20"
      >
        <p class="flex-1 min-w-0 text-footnote font-medium text-white truncate">
          {{ $t('pool.settings.pendingChanges', { count: changeCount }, changeCount) }}
        </p>
        <button
          type="button"
          :disabled="isSaving"
          @click="discard"
          class="px-3 h-9 rounded-full text-footnote font-semibold text-white/80 active:bg-white/15 transition-colors disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
        >
          {{ $t('pool.settings.discard') }}
        </button>
        <button
          type="button"
          :disabled="isSaving"
          @click="save"
          class="inline-flex items-center gap-1.5 px-4 h-9 rounded-full bg-emerald-50 text-emerald-800 text-footnote font-semibold active:bg-emerald-200 transition-colors disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <v-icon v-if="isSaving" name="pr-spinner" class="w-4 h-4" animation="spin" />
          {{ $t('pool.settings.save') }}
        </button>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { poolService } from "@/services/pool/poolService";
import { useToast } from "@/composables/useToast";
import type {
  PoolScoringCode,
  PoolSettingsResponse,
} from "@/interfaces/pool/PoolSettingsResponse";

const props = defineProps<{ poolUuid: string }>();

const { t } = useI18n();
const toast = useToast();

// "Game rules" card (objective + how to play) — collapsible, open by default.
const rulesOpen = ref(true);
const howToPlaySteps = computed(() => [
  t("pool.group.rules.step1"),
  t("pool.group.rules.step2"),
  t("pool.group.rules.step3"),
  t("pool.group.rules.step4"),
]);

const settings = ref<PoolSettingsResponse | null>(null);
const isLoading = ref(false);
const isSaving = ref(false);
const isResetting = ref(false);
const loadError = ref<string | null>(null);

/**
 * Valores en edición. Se trabaja sobre una copia y no sobre `settings` para que
 * "descartar" sea volver a lo que trajo el servidor, sin una segunda petición.
 */
const draftPoints = ref<Record<string, number>>({});
const draftParticipants = ref(0);

const resetDraft = (data: PoolSettingsResponse) => {
  const next: Record<string, number> = {};
  for (const rule of data.rules) next[rule.code] = rule.points;
  draftPoints.value = next;
  draftParticipants.value = data.max_participants;
};

/** Editar exige ser admin **y** que la quiniela no haya arrancado; el API ya
 *  resolvió ambas en una sola bandera. */
const canEdit = computed(() => !!settings.value?.is_editable);

/** Reglas tal como se pintan: catálogo del servidor + valor en edición. */
const rules = computed(() =>
  (settings.value?.rules ?? []).map((rule) => ({
    ...rule,
    points: draftPoints.value[rule.code] ?? rule.points,
  })),
);

const participants = computed(
  () => draftParticipants.value || settings.value?.max_participants || 0,
);

/** Cambios sin guardar: contra lo que trajo el servidor. */
const changeCount = computed(() => {
  if (!settings.value) return 0;

  let count = settings.value.rules.filter(
    (rule) => (draftPoints.value[rule.code] ?? rule.points) !== rule.points,
  ).length;

  if (draftParticipants.value !== settings.value.max_participants) count++;

  return count;
});

const ruleIcon = (code: PoolScoringCode): string =>
  ({
    exact_score: "hi-solid-hashtag",
    home_win: "hi-solid-home",
    away_win: "hi-solid-location-marker",
    draw: "hi-solid-switch-horizontal",
  })[code] ?? "bi-trophy-fill";

const lockedMessage = computed(() => {
  const reason = settings.value?.locked_reason;
  return reason
    ? t(`pool.settings.locked.${reason}`)
    : t("pool.settings.locked.generic");
});

// ── Edición ──
const clampPoints = (value: number): number =>
  Math.min(settings.value?.points_max ?? 50, Math.max(settings.value?.points_min ?? 0, value));

/**
 * Se escribe leyendo el borrador y no la fila ya pintada: varios toques seguidos
 * caen en el mismo tick, `rules` todavía no se recalculó, y el segundo toque
 * partiría del valor viejo perdiendo un incremento.
 */
const setPoints = (code: PoolScoringCode, points: number) => {
  draftPoints.value = { ...draftPoints.value, [code]: clampPoints(points) };
};

const nudgeRule = (code: PoolScoringCode, delta: number) =>
  setPoints(code, (draftPoints.value[code] ?? 0) + delta);

const onRuleInput = (code: PoolScoringCode, event: Event) => {
  const raw = (event.target as HTMLInputElement).value.trim();
  const parsed = Number(raw);
  // Un campo a medio borrar todavía no es un número; se ignora hasta que lo sea.
  if (raw === "" || Number.isNaN(parsed)) return;
  setPoints(code, Math.trunc(parsed));
};

const onRuleBlur = (code: PoolScoringCode, event: Event) => {
  // Se reescribe el DOM a mano: si quedó "abc" el valor ligado no cambió y Vue
  // no volvería a pintar el input, dejando basura sobre el número real.
  (event.target as HTMLInputElement).value = String(draftPoints.value[code] ?? 0);
};

const clampParticipants = (value: number): number =>
  Math.min(
    settings.value?.participants_max ?? 100,
    Math.max(settings.value?.participants_min ?? 2, value),
  );

const nudgeParticipants = (delta: number) => {
  draftParticipants.value = clampParticipants(draftParticipants.value + delta);
};

const onParticipantsInput = (event: Event) => {
  const raw = (event.target as HTMLInputElement).value.trim();
  const parsed = Number(raw);
  if (raw === "" || Number.isNaN(parsed)) return;
  draftParticipants.value = clampParticipants(Math.trunc(parsed));
};

const onParticipantsBlur = (event: Event) => {
  (event.target as HTMLInputElement).value = String(draftParticipants.value);
};

// ── Datos ──
const applyResponse = (data: PoolSettingsResponse) => {
  settings.value = data;
  resetDraft(data);
};

const load = async () => {
  if (!props.poolUuid) return;

  isLoading.value = true;
  loadError.value = null;
  try {
    applyResponse(await poolService.getPoolSettings(props.poolUuid));
  } catch (e) {
    console.error("Error loading pool settings:", e);
    loadError.value = t("pool.settings.loadError");
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
    const scoring = Object.fromEntries(
      settings.value.rules.map((rule) => [rule.code, draftPoints.value[rule.code] ?? rule.points]),
    ) as Record<PoolScoringCode, number>;

    applyResponse(
      await poolService.updatePoolSettings(props.poolUuid, {
        max_participants: draftParticipants.value,
        scoring,
      }),
    );
    toast.success(t("pool.settings.savedTitle"), t("pool.settings.savedMsg"));
  } catch (e) {
    // El 409 (quiniela ya arrancada) y el 422 los anuncia el interceptor de
    // useApiFantasy con su propio toast.
    console.error("Error saving pool settings:", e);
  } finally {
    isSaving.value = false;
  }
};

const resetToDefault = async () => {
  if (isResetting.value) return;

  isResetting.value = true;
  try {
    applyResponse(await poolService.resetPoolSettings(props.poolUuid));
    toast.success(t("pool.settings.resetTitle"), t("pool.settings.resetMsg"));
  } catch (e) {
    console.error("Error resetting pool settings:", e);
  } finally {
    isResetting.value = false;
  }
};

watch(() => props.poolUuid, load);

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
