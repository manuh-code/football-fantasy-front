<template>
  <div class="space-y-4 pb-4">
    <!-- Intro -->
    <div class="bg-gradient-to-r from-violet-50 to-indigo-50 dark:from-violet-900/20 dark:to-indigo-900/10 border border-violet-100 dark:border-violet-800/40 rounded-2xl p-4">
      <div class="flex items-start gap-3">
        <div class="w-9 h-9 rounded-xl bg-white dark:bg-gray-800 flex items-center justify-center shrink-0 ring-1 ring-violet-100 dark:ring-violet-800/60">
          <v-icon name="hi-solid-adjustments" class="w-4 h-4 text-violet-500" />
        </div>
        <div class="min-w-0">
          <h2 class="text-callout font-semibold text-gray-900 dark:text-white">
            {{ $t('fantasy.scoringEditor.title') }}
          </h2>
          <p class="text-footnote text-gray-500 dark:text-gray-400 mt-0.5">
            {{ $t('fantasy.scoringEditor.subtitle') }}
          </p>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="space-y-3">
      <div class="h-24 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60 animate-pulse" />
      <div v-for="i in 3" :key="`sk-${i}`" class="h-16 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60 animate-pulse" />
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
        class="px-4 py-2 text-xs font-semibold rounded-full bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"
      >
        {{ $t('common.actions.retry') }}
      </button>
    </div>

    <template v-else-if="editor">
      <!-- Bajo candado por suscripción. Se enseña el editor entero en solo
           lectura y no una pantalla vacía: ver cuánto paga cada jugada es lo
           que hace querer ajustarlo. -->
      <button
        v-if="editor.requires_premium"
        type="button"
        class="w-full bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-2xl p-4 flex items-start gap-3 text-left active:scale-[0.99] transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
        @click="requirePremium(PREMIUM_FEATURES.fantasyScoringRules)"
      >
        <v-icon name="hi-solid-lock-closed" class="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
        <div class="min-w-0 flex-1">
          <p class="flex items-center gap-1.5 text-footnote font-semibold text-amber-900 dark:text-amber-200">
            {{ $t('fantasy.scoringEditor.title') }}
            <PremiumBadge />
          </p>
          <p class="text-2xs text-amber-700 dark:text-amber-300/90 leading-relaxed mt-0.5">
            {{ $t('premium.features.fantasy.scoring_rules') }}
          </p>
        </div>
        <v-icon name="hi-solid-chevron-right" class="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
      </button>

      <!-- Locked: the rules are frozen, so everything below is read-only -->
      <div
        v-else-if="!editor.is_editable"
        class="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-2xl p-4 flex items-start gap-3"
      >
        <v-icon name="hi-solid-lock-closed" class="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
        <div class="min-w-0">
          <p class="text-footnote font-semibold text-amber-900 dark:text-amber-200">
            {{ $t('fantasy.scoringEditor.locked.title') }}
          </p>
          <p class="text-2xs text-amber-700 dark:text-amber-300/90 leading-relaxed mt-0.5">
            {{ lockedMessage }}
          </p>
        </div>
      </div>

      <!-- Presets -->
      <section class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 p-4">
        <div class="flex items-center justify-between gap-3 mb-3">
          <h3 class="text-2xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
            {{ $t('fantasy.scoringEditor.presetsLabel') }}
          </h3>
          <span v-if="selectedPreset" class="text-2xs font-medium text-violet-600 dark:text-violet-400 truncate">
            {{ presetName(selectedPreset) }}
          </span>
        </div>

        <!-- Horizontal strip on phones, grid once there's room for it -->
        <div class="-mx-4 px-4 overflow-x-auto sm:overflow-visible sm:mx-0 sm:px-0">
          <div class="flex gap-2.5 sm:grid sm:grid-cols-2 lg:grid-cols-4">
            <button
              v-for="preset in editor.presets"
              :key="preset.code"
              type="button"
              :disabled="!canEdit"
              @click="applyPreset(preset)"
              class="w-56 sm:w-auto shrink-0 text-left rounded-xl border p-3 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 disabled:opacity-50 disabled:cursor-not-allowed"
              :class="selectedPreset === preset.code
                ? 'border-violet-400 dark:border-violet-500 bg-violet-50 dark:bg-violet-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-violet-300 dark:hover:border-violet-600'"
            >
              <div class="flex items-center gap-2">
                <span class="text-footnote font-semibold text-gray-900 dark:text-white truncate">
                  {{ preset.name }}
                </span>
                <v-icon
                  v-if="selectedPreset === preset.code"
                  name="hi-solid-check-circle"
                  class="w-4 h-4 text-violet-500 shrink-0 ml-auto"
                />
              </div>
              <p class="text-2xs text-gray-500 dark:text-gray-400 leading-snug mt-1">
                {{ preset.description }}
              </p>
            </button>
          </div>
        </div>

        <p class="text-2xs text-gray-400 dark:text-gray-500 mt-3">
          {{ $t('fantasy.scoringEditor.presetsHint') }}
        </p>
      </section>

      <!-- Per-position rules -->
      <section
        v-for="group in groups"
        :key="group.key"
        class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 overflow-hidden"
      >
        <button
          type="button"
          @click="toggleGroup(group.key)"
          :aria-expanded="isGroupOpen(group.key)"
          class="w-full flex items-center justify-between gap-3 p-4 text-left"
        >
          <div class="flex items-center gap-3 min-w-0">
            <div class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" :class="group.meta.badgeBg">
              <v-icon :name="group.meta.icon" class="w-4 h-4" :class="group.meta.badgeText" />
            </div>
            <div class="min-w-0">
              <h3 class="text-callout font-semibold text-gray-900 dark:text-white truncate">
                {{ group.label }}
              </h3>
              <p class="text-2xs text-gray-400 dark:text-gray-500">
                {{ $t('fantasy.rules.rulesCount', { count: group.rules.length }, group.rules.length) }}
              </p>
            </div>
          </div>
          <div class="flex items-center gap-2 shrink-0">
            <span
              v-if="groupChangeCount(group) > 0"
              class="inline-flex items-center justify-center min-w-[1.5rem] h-6 px-1.5 rounded-full text-2xs font-bold bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300"
            >
              {{ groupChangeCount(group) }}
            </span>
            <v-icon
              name="hi-solid-chevron-down"
              class="w-4 h-4 text-gray-400 dark:text-gray-500 transition-transform duration-300"
              :class="isGroupOpen(group.key) ? 'rotate-180' : ''"
            />
          </div>
        </button>

        <div
          class="overflow-hidden transition-[max-height,opacity] duration-300 ease-out"
          :style="{ maxHeight: isGroupOpen(group.key) ? '6000px' : '0px', opacity: isGroupOpen(group.key) ? 1 : 0 }"
          :aria-hidden="!isGroupOpen(group.key)"
        >
          <div class="px-4 pb-4 space-y-2" :inert="!isGroupOpen(group.key)">
            <!-- Cada fila envuelve cuando no cabe: en un teléfono el nombre se
                 queda arriba y los controles bajan a su propia línea. -->
            <div
              v-for="rule in group.rules"
              :key="rule.uuid"
              class="flex flex-wrap items-center gap-x-3 gap-y-2.5 rounded-xl px-3 py-2.5 transition-colors"
              :class="rule.is_enabled
                ? 'bg-gray-50 dark:bg-gray-900/40'
                : 'bg-gray-50/60 dark:bg-gray-900/20'"
            >
              <div
                class="w-8 h-8 rounded-lg bg-white dark:bg-gray-800 flex items-center justify-center shrink-0 ring-1 ring-gray-100 dark:ring-gray-700"
                :class="rule.is_enabled ? '' : 'opacity-40'"
              >
                <v-icon
                  :name="statIcon(rule.type?.developer_name)"
                  class="w-4 h-4"
                  :class="pointsTone(rule)"
                />
              </div>

              <div class="flex-1 min-w-[7rem]">
                <div class="flex items-center gap-1.5">
                  <p
                    class="text-footnote font-medium leading-tight truncate"
                    :class="rule.is_enabled ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500 line-through'"
                  >
                    {{ statLabel(rule.type?.developer_name, rule.type?.name) }}
                  </p>
                  <span
                    v-if="isChanged(rule)"
                    class="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0"
                    :title="$t('fantasy.scoringEditor.changedFromDefault', { value: rule.default_points })"
                  />
                </div>
                <p
                  v-if="conditionText(rule.condition)"
                  class="text-2xs text-sky-600 dark:text-sky-400 leading-snug flex items-center gap-1 mt-0.5"
                >
                  <v-icon name="hi-solid-adjustments" class="w-3 h-3 shrink-0" />
                  <span class="truncate">{{ conditionText(rule.condition) }}</span>
                </p>
              </div>

              <div class="flex items-center gap-2 shrink-0 ml-auto">
                <!-- Stepper -->
                <div
                  class="flex items-center h-11 rounded-xl bg-white dark:bg-gray-800 ring-1 ring-gray-200 dark:ring-gray-700 overflow-hidden"
                  :class="rule.is_enabled ? '' : 'opacity-40'"
                >
                  <button
                    type="button"
                    :disabled="!canEditRule(rule) || rule.points <= POINTS_MIN"
                    @click="nudge(rule, -1)"
                    class="w-10 h-11 grid place-items-center text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-violet-500"
                    :aria-label="$t('fantasy.scoringEditor.decreaseAria', { name: statLabel(rule.type?.developer_name, rule.type?.name) })"
                  >
                    <v-icon name="hi-solid-minus" class="w-4 h-4" />
                  </button>
                  <input
                    :value="rule.points"
                    @input="onPointsInput(rule, $event)"
                    @blur="onPointsBlur(rule, $event)"
                    :disabled="!canEditRule(rule)"
                    type="text"
                    inputmode="numeric"
                    class="w-12 h-11 bg-transparent text-center text-callout font-bold tabular-nums border-0 p-0 focus:outline-none focus:ring-0 disabled:cursor-not-allowed"
                    :class="pointsTone(rule)"
                    :aria-label="$t('fantasy.scoringEditor.pointsAria', { name: statLabel(rule.type?.developer_name, rule.type?.name) })"
                  />
                  <button
                    type="button"
                    :disabled="!canEditRule(rule) || rule.points >= POINTS_MAX"
                    @click="nudge(rule, 1)"
                    class="w-10 h-11 grid place-items-center text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-violet-500"
                    :aria-label="$t('fantasy.scoringEditor.increaseAria', { name: statLabel(rule.type?.developer_name, rule.type?.name) })"
                  >
                    <v-icon name="hi-solid-plus" class="w-4 h-4" />
                  </button>
                </div>

                <!-- On/off -->
                <button
                  type="button"
                  role="switch"
                  :aria-checked="rule.is_enabled"
                  :disabled="!canEdit"
                  @click="toggleRule(rule)"
                  class="w-11 h-11 grid place-items-center rounded-xl disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
                  :aria-label="$t('fantasy.scoringEditor.toggleAria', { name: statLabel(rule.type?.developer_name, rule.type?.name) })"
                  :title="rule.is_enabled ? $t('fantasy.scoringEditor.disableHint') : $t('fantasy.scoringEditor.enableHint')"
                >
                  <span
                    class="relative w-9 h-5 rounded-full transition-colors duration-200"
                    :class="rule.is_enabled ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-600'"
                  >
                    <span
                      class="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200"
                      :class="rule.is_enabled ? 'translate-x-4' : ''"
                    />
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Back to the shared default set -->
      <button
        v-if="editor.is_custom && canEdit"
        type="button"
        :disabled="isResetting || isSaving"
        @click="resetToDefault"
        class="w-full flex items-center justify-center gap-1.5 px-4 py-3 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 text-footnote font-semibold text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <v-icon v-if="isResetting" name="pr-spinner" class="w-4 h-4" animation="spin" />
        <v-icon v-else name="hi-solid-refresh" class="w-4 h-4" />
        {{ $t('fantasy.scoringEditor.resetDefaults') }}
      </button>

      <!-- Sólo aparece cuando hay algo que guardar: mientras no cambies nada no
           hay barra tapando la última fila. El bottom-24 no lleva variante de
           escritorio porque la barra de navegación flota también ahí.

           La entrada es una animación CSS y no un <Transition>: al guardar, la
           barra se va en el mismo tick en que llega la respuesta, y una salida
           animada dejaba el elemento colgado en opacity 0 pero todavía en el DOM,
           tapando las filas de abajo.

           Va en esmeralda y no en un gris oscuro porque main.scss reasigna las
           utilidades bg-gray-* a los tokens del tema: bg-gray-900 es el fondo de
           la página, no una superficie de contraste. -->
      <div
        v-if="changeCount > 0"
        class="save-bar sticky bottom-24 z-[95] flex items-center gap-3 rounded-2xl bg-emerald-600 ring-1 ring-emerald-700/40 px-4 py-3 shadow-xl shadow-emerald-900/20"
      >
        <p class="flex-1 min-w-0 text-footnote font-medium text-white truncate">
          {{ $t('fantasy.scoringEditor.pendingChanges', { count: changeCount }, changeCount) }}
        </p>
        <button
          type="button"
          :disabled="isSaving"
          @click="discard"
          class="px-3 h-9 rounded-full text-footnote font-semibold text-white/80 hover:text-white hover:bg-white/15 transition-colors disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
        >
          {{ $t('fantasy.scoringEditor.discard') }}
        </button>
        <button
          type="button"
          :disabled="isSaving"
          @click="save"
          class="inline-flex items-center gap-1.5 px-4 h-9 rounded-full bg-emerald-50 text-emerald-800 text-footnote font-semibold hover:bg-emerald-100 active:bg-emerald-200 transition-colors disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <v-icon v-if="isSaving" name="pr-spinner" class="w-4 h-4" animation="spin" />
          {{ $t('fantasy.scoringEditor.save') }}
        </button>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { fantasyLeagueService } from "@/services/fantasy/leagues/FantasyLeagueService";
import { useToast } from "@/composables/useToast";
import PremiumBadge from "@/components/premium/PremiumBadge.vue";
import { usePremium } from "@/composables/usePremium";
import { PREMIUM_FEATURES } from "@/interfaces/user/billing/EntitlementsResponse";
import { useScoringRuleMeta, type PositionMeta } from "@/composables/fantasy/useScoringRuleMeta";
import type {
  ScoringEditorResponse,
  ScoringEditorRuleResponse,
  ScoringPresetResponse,
} from "@/interfaces/fantasy/score/ScoringEditorResponse";
import type { ScoreRuleItem } from "@/interfaces/fantasy/score/ScoreRulePayload";

const props = defineProps<{ leagueUuid: string }>();

const { t } = useI18n();
const toast = useToast();
const { positionMeta, positionLabel, statIcon, statLabel, conditionText } = useScoringRuleMeta();

/** Mismos límites que valida el API (config fantasy.scoring_rules.points). */
const POINTS_MIN = -200;
const POINTS_MAX = 200;

const editor = ref<ScoringEditorResponse | null>(null);
const isLoading = ref(false);
const isSaving = ref(false);
const isResetting = ref(false);
const loadError = ref<string | null>(null);

/**
 * Valores en edición, indexados por uuid de regla.
 *
 * Se trabaja sobre una copia y no sobre `editor` para que "descartar" sea
 * volver a leer lo que trajo el servidor, sin una segunda petición.
 */
interface DraftRule {
  uuid: string;
  points: number;
  is_enabled: boolean;
}

const draft = ref<Record<string, DraftRule>>({});

const resetDraft = (data: ScoringEditorResponse) => {
  const next: Record<string, DraftRule> = {};
  for (const group of data.positions) {
    for (const rule of group.rules) {
      next[rule.uuid] = { uuid: rule.uuid, points: rule.points, is_enabled: rule.is_enabled };
    }
  }
  draft.value = next;
};

/** Regla tal como se pinta: catálogo del servidor + valor en edición. */
interface EditableRule extends ScoringEditorRuleResponse {
  positionUuid: string;
}

interface RuleGroup {
  key: string;
  label: string;
  /** `developer_name` de la posición; es la llave de los overrides del preset. */
  positionCode: string;
  meta: PositionMeta;
  rules: EditableRule[];
}

const groups = computed<RuleGroup[]>(() => {
  if (!editor.value) return [];

  return editor.value.positions.flatMap((group) => {
    const position = group.position;
    if (!position) return [];

    return [{
      key: position.uuid,
      label: positionLabel(position.developer_name, position.name),
      positionCode: position.code,
      meta: positionMeta(position.developer_name),
      rules: group.rules.map((rule) => ({
        ...rule,
        positionUuid: position.uuid,
        points: draft.value[rule.uuid]?.points ?? rule.points,
        is_enabled: draft.value[rule.uuid]?.is_enabled ?? rule.is_enabled,
      })),
    }];
  });
});

/**
 * Una regla cuenta como cambiada cuando se aleja del set por defecto, no de lo
 * último guardado: el punto amarillo responde "¿esto ya no es de fábrica?", que
 * es lo que el admin quiere saber al recorrer la lista.
 */
const isChanged = (rule: EditableRule): boolean =>
  rule.points !== rule.default_points || !rule.is_enabled;

const groupChangeCount = (group: RuleGroup): number => group.rules.filter(isChanged).length;

/** Cambios sin guardar: contra lo que trajo el servidor, no contra el default. */
const changeCount = computed(() => {
  if (!editor.value) return 0;
  let count = 0;
  for (const group of editor.value.positions) {
    for (const rule of group.rules) {
      const edited = draft.value[rule.uuid];
      if (!edited) continue;
      if (edited.points !== rule.points || edited.is_enabled !== rule.is_enabled) count++;
    }
  }
  return count;
});

/**
 * Editable de verdad: sin el draft empezado **y** con la suscripción. Los dos
 * motivos se enseñan por separado arriba, pero para bloquear controles da igual
 * cuál sea.
 */
const { requirePremium } = usePremium();

const canEdit = computed(() => !!editor.value?.is_editable && !editor.value.requires_premium);

const canEditRule = (rule: EditableRule): boolean => canEdit.value && rule.is_enabled;

const pointsTone = (rule: EditableRule): string => {
  if (!rule.is_enabled) return "text-gray-400 dark:text-gray-500";
  if (rule.points > 0) return "text-emerald-600 dark:text-emerald-400";
  if (rule.points < 0) return "text-red-600 dark:text-red-400";
  return "text-gray-500 dark:text-gray-400";
};

const clamp = (value: number): number => Math.min(POINTS_MAX, Math.max(POINTS_MIN, value));

/**
 * Se escribe leyendo el borrador y no la fila ya pintada: varios toques seguidos
 * caen en el mismo tick, y `groups` todavía no se recalculó, así que el segundo
 * toque partiría del valor viejo y se perdería un incremento.
 */
const current = (rule: EditableRule): DraftRule =>
  draft.value[rule.uuid] ?? { uuid: rule.uuid, points: rule.points, is_enabled: rule.is_enabled };

const setPoints = (rule: EditableRule, points: number) => {
  draft.value[rule.uuid] = { ...current(rule), points: clamp(points) };
};

const nudge = (rule: EditableRule, delta: number) => setPoints(rule, current(rule).points + delta);

const onPointsInput = (rule: EditableRule, event: Event) => {
  const raw = (event.target as HTMLInputElement).value.trim();
  // "-" a medio teclear todavía no es un número; se ignora hasta que lo sea.
  const parsed = Number(raw);
  if (raw === "" || Number.isNaN(parsed)) return;
  setPoints(rule, Math.trunc(parsed));
};

const onPointsBlur = (rule: EditableRule, event: Event) => {
  // Se reescribe el DOM a mano: si el usuario dejó "-" o "abc", el valor ligado
  // no cambió y Vue no volvería a pintar el input, dejando basura sobre el
  // número real.
  (event.target as HTMLInputElement).value = String(rule.points);
};

const toggleRule = (rule: EditableRule) => {
  const value = current(rule);
  draft.value[rule.uuid] = { ...value, is_enabled: !value.is_enabled };
};

// ── Presets ──

/**
 * Puntos y encendido que un preset le da a una regla: el override si existe, y
 * si no el valor de fábrica que viaja con la propia regla.
 */
const resolvePreset = (
  preset: ScoringPresetResponse,
  positionCode: string,
  rule: EditableRule,
): [number, boolean] => {
  const developerName = rule.type?.developer_name ?? "";
  const points = preset.overrides?.[positionCode]?.[developerName] ?? rule.default_points;
  const enabled = preset.only === null || preset.only.includes(developerName);
  return [points, enabled];
};

// El preset marcado sale de comparar los valores en pantalla, no de recordar el
// último botón pulsado: así un ajuste manual apaga la selección solo.
const selectedPreset = computed<string | null>(() => {
  if (!editor.value) return null;

  return editor.value.presets.find((preset) =>
    groups.value.every((group) =>
      group.rules.every((rule) => {
        const [points, enabled] = resolvePreset(preset, group.positionCode, rule);
        return rule.points === points && rule.is_enabled === enabled;
      }),
    ),
  )?.code ?? null;
});

const applyPreset = (preset: ScoringPresetResponse) => {
  if (!canEdit.value) return;

  const next = { ...draft.value };
  for (const group of groups.value) {
    for (const rule of group.rules) {
      const [points, enabled] = resolvePreset(preset, group.positionCode, rule);
      next[rule.uuid] = { uuid: rule.uuid, points, is_enabled: enabled };
    }
  }
  draft.value = next;
};

const presetName = (code: string): string =>
  editor.value?.presets.find((preset) => preset.code === code)?.name ?? code;

// ── Accordion ──
const openGroups = ref<Set<string>>(new Set());

const isGroupOpen = (key: string): boolean => openGroups.value.has(key);

const toggleGroup = (key: string) => {
  const next = new Set(openGroups.value);
  if (!next.delete(key)) next.add(key);
  openGroups.value = next;
};

watch(
  groups,
  (value) => {
    if (value.length && openGroups.value.size === 0) {
      openGroups.value = new Set([value[0].key]);
    }
  },
  { immediate: true },
);

// ── Locked state ──
const lockedMessage = computed(() => {
  const reason = editor.value?.locked_reason;
  return reason
    ? t(`fantasy.scoringEditor.locked.${reason}`)
    : t("fantasy.scoringEditor.locked.generic");
});

// ── Data ──
const applyResponse = (data: ScoringEditorResponse) => {
  editor.value = data;
  resetDraft(data);
};

const load = async () => {
  isLoading.value = true;
  loadError.value = null;
  try {
    applyResponse(await fantasyLeagueService.getScoringEditor(props.leagueUuid));
  } catch (err) {
    console.error("Error loading scoring rules:", err);
    loadError.value = t("fantasy.scoringEditor.loadError");
  } finally {
    isLoading.value = false;
  }
};

const discard = () => {
  if (editor.value) resetDraft(editor.value);
};

const buildPayload = (): ScoreRuleItem[] => {
  const items: ScoreRuleItem[] = [];
  for (const group of groups.value) {
    for (const rule of group.rules) {
      if (!rule.type) continue;
      items.push({
        type_uuid: rule.type.uuid,
        position_uuid: rule.positionUuid,
        points: rule.points,
        is_enabled: rule.is_enabled,
      });
    }
  }
  return items;
};

const save = async () => {
  if (isSaving.value) return;
  isSaving.value = true;
  try {
    applyResponse(await fantasyLeagueService.updateScoreRules({ score_rules: buildPayload() }, props.leagueUuid));
    toast.success(t("fantasy.scoringEditor.savedTitle"), t("fantasy.scoringEditor.savedMsg"));
  } catch (err) {
    console.error("Error saving scoring rules:", err);
  } finally {
    isSaving.value = false;
  }
};

const resetToDefault = async () => {
  if (isResetting.value) return;
  isResetting.value = true;
  try {
    applyResponse(await fantasyLeagueService.resetScoreRules(props.leagueUuid));
    toast.success(t("fantasy.scoringEditor.resetTitle"), t("fantasy.scoringEditor.resetMsg"));
  } catch (err) {
    console.error("Error resetting scoring rules:", err);
  } finally {
    isResetting.value = false;
  }
};

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
