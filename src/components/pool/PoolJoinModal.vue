<template>
  <BottomSheet
    :is-visible="isVisible"
    :title="$t('pool.join.title')"
    :subtitle="$t('pool.join.subtitle')"
    icon="hi-solid-key"
    icon-variant="emerald"
    size="auto"
    :dismissible="!isLoading"
    @close="close"
  >
    <FormInput
      id="pool-access-code"
      v-model="accessCode"
      type="text"
      :label="$t('pool.group.accessCode')"
      icon="hi-solid-key"
      :placeholder="$t('pool.join.codePlaceholder')"
      :error="accessCodeError"
      :disabled="isLoading"
      @keyup.enter="handleJoin"
    />

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
          @click="handleJoin"
          :disabled="isLoading || !accessCode.trim()"
          class="flex-1 py-3 rounded-xl text-sm font-semibold text-white bg-emerald-600 active:scale-[0.98] shadow-sm shadow-emerald-500/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <div v-if="isLoading" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          <v-icon v-else name="hi-solid-user-add" class="w-4 h-4" />
          {{ $t('pool.join.title') }}
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
import { useValidationStore } from "@/store/validation/useValidationStore";
import type { PoolResponse } from "@/interfaces/pool/PoolResponse";

const props = withDefaults(
  defineProps<{
    isVisible?: boolean;
    /** Pre-fill the access code (e.g. when opened from an invite link). */
    initialCode?: string;
  }>(),
  {
    isVisible: false,
    initialCode: "",
  }
);

const emit = defineEmits<{
  close: [];
  joined: [pool: PoolResponse];
}>();

const validationStore = useValidationStore();

const accessCode = ref("");
const isLoading = ref(false);

// 422 validation errors for "access_code" are stored by the API interceptor.
const accessCodeError = computed(() => validationStore.getFieldError("access_code")[0] || "");

// Reset the form whenever the sheet opens, pre-filling any code passed in
// (e.g. when the sheet is opened from a shared invite link).
watch(
  () => props.isVisible,
  (visible) => {
    if (visible) {
      accessCode.value = props.initialCode ?? "";
      validationStore.clearFieldError("access_code");
    }
  }
);

// Clear the field error as soon as the user edits the code.
watch(accessCode, () => {
  if (accessCodeError.value) validationStore.clearFieldError("access_code");
});

const close = () => {
  if (!isLoading.value) emit("close");
};

const handleJoin = async () => {
  const code = accessCode.value.trim();
  if (!code || isLoading.value) return;

  isLoading.value = true;
  validationStore.clearFieldError("access_code");

  try {
    const pool = await poolService.joinPool({ access_code: code });
    emit("joined", pool);
  } catch (e) {
    // 422 errors are surfaced via validationStore (input) + a toast, both handled
    // by the API interceptor in useApiFantasy.
    console.error("Error joining pool:", e);
  } finally {
    isLoading.value = false;
  }
};
</script>
