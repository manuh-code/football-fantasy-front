<template>
  <BottomSheet
    :is-visible="isVisible"
    :title="$t('survivor.join.title')"
    :subtitle="$t('survivor.join.subtitle')"
    icon="hi-solid-key"
    icon-variant="red"
    size="auto"
    :dismissible="!isLoading"
    autofocus
    @close="close"
  >
    <form class="space-y-3" @submit.prevent="submit">
      <div class="flex flex-col gap-1.5">
        <label for="survivor-code" class="text-sm font-semibold text-gray-700 dark:text-gray-300">
          {{ $t('survivor.join.codeLabel') }}
        </label>

        <!-- Mayúsculas y espaciado ancho: el código se dicta y se teclea, así
             que se lee de un vistazo y no se confunde una letra con otra. -->
        <input
          id="survivor-code"
          ref="codeInput"
          :value="code"
          type="text"
          inputmode="text"
          autocapitalize="characters"
          autocomplete="off"
          spellcheck="false"
          maxlength="6"
          :placeholder="$t('survivor.join.codePlaceholder')"
          :disabled="isLoading"
          :aria-invalid="!!codeError"
          :aria-describedby="codeError ? 'survivor-code-error' : 'survivor-code-hint'"
          class="w-full h-14 px-4 rounded-xl bg-gray-50 dark:bg-gray-800 border-[1.5px] text-center text-xl font-bold tracking-[0.3em] uppercase text-gray-900 dark:text-white placeholder:tracking-normal placeholder:text-base placeholder:font-normal placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-colors focus:outline-none focus:ring-2 disabled:opacity-60"
          :class="
            codeError
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10'
              : 'border-gray-200 dark:border-gray-700 focus:border-rose-500 focus:ring-rose-500/10'
          "
          @input="onCodeInput"
        />

        <p v-if="codeError" id="survivor-code-error" class="text-xs text-red-600 dark:text-red-400">
          {{ codeError }}
        </p>
        <p v-else id="survivor-code-hint" class="text-xs text-gray-400 dark:text-gray-500 leading-relaxed">
          {{ $t('survivor.join.hint') }}
        </p>
      </div>
    </form>

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
          @click="submit"
        >
          <div v-if="isLoading" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          <v-icon v-else name="hi-solid-login" class="w-4 h-4" />
          {{ $t('survivor.join.submit') }}
        </button>
      </div>
    </template>
  </BottomSheet>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";
import BottomSheet from "@/components/ui/BottomSheet.vue";
import { survivorService } from "@/services/survivor/SurvivorServive";
import { useValidationStore } from "@/store/validation/useValidationStore";
import type { SurvivorResponse } from "@/interfaces/survivor/SurvivorResponse";

const props = withDefaults(
  defineProps<{
    isVisible?: boolean;
    /** Código que llega en el enlace compartido (`/survivor?join=ABC123`). */
    initialCode?: string;
  }>(),
  { isVisible: false, initialCode: "" },
);

const emit = defineEmits<{
  close: [];
  joined: [survivor: SurvivorResponse];
}>();

const validationStore = useValidationStore();

const code = ref("");
const isLoading = ref(false);
const codeInput = ref<HTMLInputElement | null>(null);

const codeError = computed(() => validationStore.getFieldError("access_code")[0] || "");
const canSubmit = computed(() => code.value.trim().length > 0);

/**
 * Se normaliza al escribir y no al enviar: el campo va en mayúsculas, y si el
 * valor pintado no coincidiera con el que se manda, un código rechazado se
 * vería distinto de lo que el usuario cree haber tecleado.
 */
const onCodeInput = (event: Event) => {
  const input = event.target as HTMLInputElement;
  const normalized = input.value.toUpperCase().replace(/\s+/g, "");
  code.value = normalized;
  // El input no está ligado con v-model, así que se reescribe a mano cuando la
  // normalización cambia lo tecleado (una minúscula, un espacio pegado).
  if (input.value !== normalized) input.value = normalized;
  if (codeError.value) validationStore.clearFieldError("access_code");
};

watch(
  () => props.isVisible,
  (visible) => {
    if (!visible) return;
    // Se normaliza igual que al teclear: el código del enlace puede venir en
    // minúsculas y el campo se pinta en mayúsculas.
    code.value = props.initialCode.trim().toUpperCase();
    validationStore.clearValidatorError();
    nextTick(() => codeInput.value?.focus());
  },
);

const close = () => {
  if (!isLoading.value) emit("close");
};

const submit = async () => {
  if (!canSubmit.value || isLoading.value) return;

  isLoading.value = true;
  validationStore.clearValidatorError();

  try {
    emit("joined", await survivorService.joinByAccessCode(code.value.trim()));
  } catch (e) {
    // "No existe", "ya estás dentro", "está lleno" y "ya arrancó" vienen del API
    // con su propio mensaje; el interceptor los enseña como toast.
    console.error("Error joining survivor:", e);
  } finally {
    isLoading.value = false;
  }
};
</script>
