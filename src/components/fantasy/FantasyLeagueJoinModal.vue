<template>
  <BottomSheet
    :is-visible="isVisible"
    :title="$t('fantasy.join.title')"
    :subtitle="$t('fantasy.join.subtitle')"
    icon="hi-solid-key"
    icon-variant="emerald"
    size="auto"
    :dismissible="!isLoading"
    @close="close"
  >
    <FormInput
      id="fantasy-league-access-code"
      v-model="accessCode"
      type="text"
      :label="$t('fantasy.share.accessCode')"
      icon="hi-solid-key"
      :placeholder="$t('fantasy.join.codePlaceholder')"
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
          {{ $t('fantasy.join.title') }}
        </button>
      </div>
    </template>
  </BottomSheet>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import BottomSheet from "@/components/ui/BottomSheet.vue";
import { FormInput } from "@/components/ui";
import { fantasyLeagueService } from "@/services/fantasy/leagues/FantasyLeagueService";
import { useValidationStore } from "@/store/validation/useValidationStore";
import type { FantasyLeaguesResponse } from "@/interfaces/fantasy/leagues/FantasyLeaguesResponse";

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
  joined: [league: FantasyLeaguesResponse];
}>();

const validationStore = useValidationStore();

const accessCode = ref("");
const isLoading = ref(false);

// The API field is still named "password"; 422 errors are stored under that key.
const accessCodeError = computed(() => validationStore.getFieldError("password")[0] || "");

// Reset the form whenever the sheet opens, pre-filling any code passed in
// (e.g. when the sheet is opened from a shared invite link).
watch(
  () => props.isVisible,
  (visible) => {
    if (visible) {
      accessCode.value = props.initialCode ?? "";
      validationStore.clearFieldError("password");
    }
  }
);

// Clear the field error as soon as the user edits the code.
watch(accessCode, () => {
  if (accessCodeError.value) validationStore.clearFieldError("password");
});

const close = () => {
  if (!isLoading.value) emit("close");
};

const handleJoin = async () => {
  const code = accessCode.value.trim();
  if (!code || isLoading.value) return;

  isLoading.value = true;
  validationStore.clearFieldError("password");

  try {
    const league = await fantasyLeagueService.joinFantasyLeague({ password: code });
    emit("joined", league);
  } catch (e) {
    // 422 errors are surfaced via validationStore (input) + a toast, both handled
    // by the API interceptor in useApiFantasy.
    console.error("Error joining fantasy league:", e);
  } finally {
    isLoading.value = false;
  }
};
</script>
