<template>
  <BottomSheet
    :is-visible="isVisible"
    title="Select your league"
    subtitle="Choose a league to see relevant news and matches"
    icon="hi-solid-collection"
    icon-variant="emerald"
    size="lg"
    :dismissible="false"
    :persistent="true"
  >
    <!-- Loading -->
    <div v-if="loading" class="py-10">
      <div class="flex flex-col items-center gap-3">
        <div class="w-8 h-8 border-2 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
        <p class="text-sm text-gray-500 dark:text-gray-400">Loading leagues...</p>
      </div>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="py-10 text-center">
      <div class="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full mx-auto mb-3 flex items-center justify-center">
        <v-icon name="hi-solid-exclamation" class="w-6 h-6 text-red-500" />
      </div>
      <p class="text-sm text-red-600 dark:text-red-400">{{ error }}</p>
    </div>

    <!-- Leagues grid -->
    <div v-else class="grid grid-cols-3 gap-3">
      <label
        v-for="league in leagues"
        :key="league.uuid"
        class="cursor-pointer"
      >
        <input
          type="radio"
          :value="league"
          v-model="selectedLeague"
          class="sr-only"
        />
        <div
          :class="[
            'relative p-3 rounded-xl transition-all flex flex-col items-center text-center gap-2 active:scale-95',
            selectedLeague?.uuid === league.uuid
              ? 'bg-emerald-50 dark:bg-emerald-900/20 ring-2 ring-emerald-500 shadow-sm'
              : 'bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800',
          ]"
        >
          <!-- Check badge -->
          <div
            v-if="selectedLeague?.uuid === league.uuid"
            class="absolute -top-1.5 -right-1.5 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center shadow-sm"
          >
            <v-icon name="hi-solid-check" class="w-3 h-3 text-white" />
          </div>

          <img
            :src="league.image_path || '/img/default-avatar.svg'"
            class="w-12 h-12 rounded-full object-cover shadow-sm"
            :alt="league.name"
          />
          <span class="text-xs font-semibold text-gray-900 dark:text-white truncate w-full">
            {{ league.name }}
          </span>
        </div>
      </label>
    </div>

    <!-- Footer -->
    <template #footer>
      <button
        :disabled="!selectedLeague || isSaving"
        @click="save"
        class="w-full py-3 rounded-xl text-sm font-bold text-white bg-emerald-600 active:scale-[0.98] shadow-sm shadow-emerald-500/30 transition-all disabled:opacity-40 disabled:active:scale-100 flex items-center justify-center gap-2"
      >
        <div v-if="isSaving" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        <v-icon v-else name="hi-solid-check" class="w-4 h-4" />
        Save
      </button>
    </template>
  </BottomSheet>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useToast } from "@/composables/useToast";
import { useAuthStore } from "@/store/auth/useAuthStore";
import { useUserStore } from "@/store/user/useUserStore";
import { useFootballLeagueStore } from "@/store/football/league/useFootballLeagueStore";
import BottomSheet from "@/components/ui/BottomSheet.vue";
import catalogService from "@/services/catalog/CatalogService";
import type { FootballLeagueResponse } from "@/interfaces/football/league/FootballLeagueResponse";
import { UserFootballLeaguePayload } from "@/interfaces/user/footballLeague/UserFootballLeaguePayload";

const props = defineProps<{ isVisible?: boolean }>();
const emit = defineEmits(["close"]);

const isVisible = computed(() => !!props.isVisible);
const leagues = ref<FootballLeagueResponse[]>([]);
const loading = ref(false);
const error = ref("");
const selectedLeague = ref<FootballLeagueResponse | null>(null);
const isSaving = ref(false);

const store = useFootballLeagueStore();
const { success } = useToast();

onMounted(async () => {
  loading.value = true;
  try {
    leagues.value = await catalogService.getFootballLeagues();
  } catch (e: unknown) {
    console.error('Failed to load leagues:', e);
    error.value = "Could not load leagues.";
  } finally {
    loading.value = false;
  }
});

const save = async () => {
  if (!selectedLeague.value) return;
  isSaving.value = true;
  try {
    const authStore = useAuthStore();
    const userStore = useUserStore();
    if (await authStore.isAuthenticated()) {
      const payload: UserFootballLeaguePayload = {
        league_uuid: selectedLeague.value.uuid,
      };
      await userStore.storeFootballLeagues(payload);
    }
    store.setLeague(selectedLeague.value);
    success("League saved", `You selected ${selectedLeague.value.name}`);
    emit("close");
  } finally {
    isSaving.value = false;
  }
};
</script>
