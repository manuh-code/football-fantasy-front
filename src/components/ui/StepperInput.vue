<template>
  <div
    class="flex items-center h-11 rounded-xl bg-white dark:bg-gray-800 ring-1 ring-gray-200 dark:ring-gray-700 overflow-hidden shrink-0"
  >
    <button
      type="button"
      :disabled="disabled || modelValue <= min"
      :aria-label="decreaseLabel"
      class="w-11 h-11 grid place-items-center text-gray-500 dark:text-gray-400 active:bg-gray-100 dark:active:bg-gray-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-inset"
      :class="focusRingClass"
      @click="nudge(-1)"
    >
      <v-icon name="hi-solid-minus" class="w-4 h-4" />
    </button>

    <input
      :id="inputId"
      :value="modelValue"
      :disabled="disabled"
      type="text"
      inputmode="numeric"
      :aria-label="ariaLabel"
      class="w-12 h-11 bg-transparent text-center text-callout font-bold tabular-nums border-0 p-0 focus:outline-none focus:ring-0 disabled:cursor-not-allowed"
      :class="valueClass"
      @input="onInput"
      @blur="onBlur"
    />

    <button
      type="button"
      :disabled="disabled || modelValue >= max"
      :aria-label="increaseLabel"
      class="w-11 h-11 grid place-items-center text-gray-500 dark:text-gray-400 active:bg-gray-100 dark:active:bg-gray-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-inset"
      :class="focusRingClass"
      @click="nudge(1)"
    >
      <v-icon name="hi-solid-plus" class="w-4 h-4" />
    </button>
  </div>
</template>

<script setup lang="ts">
/**
 * Contador con menos/más y campo escribible.
 *
 * Los botones miden 44px porque son el objetivo táctil real, e `inputmode`
 * numérico saca el teclado de números en el móvil sin bloquear el teclado
 * físico en escritorio.
 */
const props = withDefaults(
  defineProps<{
    modelValue: number;
    min: number;
    max: number;
    disabled?: boolean;
    inputId?: string;
    ariaLabel?: string;
    decreaseLabel?: string;
    increaseLabel?: string;
    /** Color del número. El acento cambia según la pantalla que lo use. */
    valueClass?: string;
    focusRingClass?: string;
  }>(),
  {
    disabled: false,
    inputId: undefined,
    ariaLabel: undefined,
    decreaseLabel: undefined,
    increaseLabel: undefined,
    valueClass: "text-gray-900 dark:text-white",
    focusRingClass: "focus-visible:ring-rose-500",
  },
);

const emit = defineEmits<{ "update:modelValue": [value: number] }>();

const clamp = (value: number): number => Math.min(props.max, Math.max(props.min, value));

const nudge = (delta: number): void => {
  emit("update:modelValue", clamp(props.modelValue + delta));
};

const onInput = (event: Event): void => {
  const raw = (event.target as HTMLInputElement).value.trim();
  const parsed = Number(raw);
  // Un campo a medio borrar todavía no es un número; se ignora hasta que lo sea.
  if (raw === "" || Number.isNaN(parsed)) return;
  emit("update:modelValue", clamp(Math.trunc(parsed)));
};

const onBlur = (event: Event): void => {
  // Se reescribe el DOM a mano: si quedó "abc" el valor ligado no cambió y Vue
  // no volvería a pintar el input, dejando basura sobre el número real.
  (event.target as HTMLInputElement).value = String(props.modelValue);
};
</script>
