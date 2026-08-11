<template>
  <div class="space-y-2">
    <!-- Vidas -->
    <div class="flex flex-wrap items-center gap-x-3 gap-y-2.5 bg-gray-50 dark:bg-gray-900/40 rounded-xl px-3 py-2.5">
      <div class="w-8 h-8 rounded-lg bg-white dark:bg-gray-800 flex items-center justify-center shrink-0 ring-1 ring-gray-100 dark:ring-gray-700">
        <v-icon name="hi-solid-heart" class="w-4 h-4 text-rose-500" />
      </div>

      <div class="flex-1 min-w-[7rem]">
        <div class="flex items-center gap-1.5">
          <label :for="livesId" class="text-footnote font-medium text-gray-900 dark:text-white leading-tight">
            {{ $t('survivor.settings.fields.lives.label') }}
          </label>
          <span
            v-if="changed('max_lives')"
            class="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0"
            :title="$t('survivor.settings.changedFromDefault', { value: defaults!.max_lives })"
          />
        </div>
        <p class="text-2xs text-gray-400 dark:text-gray-500 leading-snug">
          {{ $t('survivor.settings.fields.lives.hint', { count: modelValue.max_lives }, modelValue.max_lives) }}
        </p>
      </div>

      <StepperInput
        v-if="editable"
        :model-value="modelValue.max_lives"
        :min="livesMin"
        :max="livesMax"
        :input-id="livesId"
        :aria-label="$t('survivor.settings.fields.lives.label')"
        :decrease-label="$t('survivor.settings.fields.lives.decreaseAria')"
        :increase-label="$t('survivor.settings.fields.lives.increaseAria')"
        value-class="text-rose-600 dark:text-rose-400"
        class="ml-auto"
        @update:model-value="update('max_lives', $event)"
      />
      <span
        v-else
        class="inline-flex items-center justify-center min-w-[2.75rem] px-2 py-1 rounded-lg text-footnote font-bold bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 shrink-0 ml-auto"
      >
        {{ modelValue.max_lives }}
      </span>
    </div>

    <!-- Empate: dos opciones excluyentes, así que van como grupo de radios y no
         como interruptor — "empate: sí/no" no querría decir nada. -->
    <div class="bg-gray-50 dark:bg-gray-900/40 rounded-xl px-3 py-2.5">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 rounded-lg bg-white dark:bg-gray-800 flex items-center justify-center shrink-0 ring-1 ring-gray-100 dark:ring-gray-700">
          <v-icon name="hi-solid-switch-horizontal" class="w-4 h-4 text-rose-500" />
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-1.5">
            <p class="text-footnote font-medium text-gray-900 dark:text-white leading-tight">
              {{ $t('survivor.settings.fields.draw.label') }}
            </p>
            <span
              v-if="changed('draw_counts_as')"
              class="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0"
              :title="$t('survivor.settings.fields.draw.defaultHint')"
            />
          </div>
          <p class="text-2xs text-gray-400 dark:text-gray-500 leading-snug">
            {{ $t(`survivor.settings.fields.draw.options.${modelValue.draw_counts_as}.hint`) }}
          </p>
        </div>
      </div>

      <div
        v-if="editable"
        role="radiogroup"
        :aria-label="$t('survivor.settings.fields.draw.label')"
        class="mt-2.5 grid grid-cols-2 gap-1 p-1 rounded-xl bg-white dark:bg-gray-800 ring-1 ring-gray-200 dark:ring-gray-700"
      >
        <button
          v-for="option in DRAW_OPTIONS"
          :key="option"
          type="button"
          role="radio"
          :aria-checked="modelValue.draw_counts_as === option"
          class="min-h-[40px] px-3 rounded-lg text-footnote font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
          :class="
            modelValue.draw_counts_as === option
              ? 'bg-rose-500 text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-300 active:bg-gray-100 dark:active:bg-gray-700'
          "
          @click="update('draw_counts_as', option)"
        >
          {{ $t(`survivor.settings.fields.draw.options.${option}.label`) }}
        </button>
      </div>
      <p
        v-else
        class="mt-2 text-footnote font-semibold text-rose-600 dark:text-rose-400"
      >
        {{ $t(`survivor.settings.fields.draw.options.${modelValue.draw_counts_as}.label`) }}
      </p>
    </div>

    <!-- Castigo por no elegir -->
    <div class="flex flex-wrap items-center gap-x-3 gap-y-2.5 bg-gray-50 dark:bg-gray-900/40 rounded-xl px-3 py-2.5">
      <div class="w-8 h-8 rounded-lg bg-white dark:bg-gray-800 flex items-center justify-center shrink-0 ring-1 ring-gray-100 dark:ring-gray-700">
        <v-icon name="hi-solid-lock-closed" class="w-4 h-4 text-rose-500" />
      </div>

      <div class="flex-1 min-w-[7rem]">
        <div class="flex items-center gap-1.5">
          <p class="text-footnote font-medium text-gray-900 dark:text-white leading-tight">
            {{ $t('survivor.settings.fields.miss.label') }}
          </p>
          <span
            v-if="changed('miss_penalty')"
            class="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0"
            :title="$t('survivor.settings.fields.miss.defaultHint')"
          />
        </div>
        <p class="text-2xs text-gray-400 dark:text-gray-500 leading-snug">
          {{ modelValue.miss_penalty
            ? $t('survivor.settings.fields.miss.onHint')
            : $t('survivor.settings.fields.miss.offHint') }}
        </p>
      </div>

      <button
        v-if="editable"
        type="button"
        role="switch"
        :aria-checked="modelValue.miss_penalty"
        :aria-label="$t('survivor.settings.fields.miss.label')"
        class="relative inline-flex h-6 w-11 shrink-0 ml-auto cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900"
        :class="modelValue.miss_penalty ? 'bg-rose-500' : 'bg-gray-300 dark:bg-gray-600'"
        @click="update('miss_penalty', !modelValue.miss_penalty)"
      >
        <span
          class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
          :class="modelValue.miss_penalty ? 'translate-x-5' : 'translate-x-0'"
        />
      </button>
      <span
        v-else
        class="inline-flex items-center justify-center px-2.5 py-1 rounded-lg text-footnote font-bold shrink-0 ml-auto"
        :class="
          modelValue.miss_penalty
            ? 'bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400'
            : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
        "
      >
        {{ modelValue.miss_penalty ? $t('common.states.on') : $t('common.states.off') }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useId } from "vue";
import StepperInput from "@/components/ui/StepperInput.vue";
import type {
  SurvivorDrawRule,
  SurvivorRules,
} from "@/interfaces/survivor/SurvivorSettingsResponse";

/**
 * Las tres reglas de juego de un survivor, en un solo sitio.
 *
 * Lo comparten el formulario de creación y la pestaña de reglas para que ambos
 * digan exactamente lo mismo: si cambia el texto de una regla, cambia en los
 * dos a la vez.
 */
const props = withDefaults(
  defineProps<{
    modelValue: SurvivorRules;
    livesMin?: number;
    livesMax?: number;
    /** En false se pinta el valor como texto, sin controles. */
    editable?: boolean;
    /** Reglas de fábrica: marcan con un punto ámbar lo que está personalizado. */
    defaults?: SurvivorRules | null;
  }>(),
  {
    livesMin: 1,
    livesMax: 5,
    editable: true,
    defaults: null,
  },
);

const emit = defineEmits<{ "update:modelValue": [value: SurvivorRules] }>();

const DRAW_OPTIONS: SurvivorDrawRule[] = ["survive", "loss"];

// El id se necesita para atar la etiqueta al campo del contador.
const livesId = useId();

const changed = (key: keyof SurvivorRules): boolean =>
  !!props.defaults && props.modelValue[key] !== props.defaults[key];

const update = <K extends keyof SurvivorRules>(key: K, value: SurvivorRules[K]): void => {
  emit("update:modelValue", { ...props.modelValue, [key]: value });
};
</script>
