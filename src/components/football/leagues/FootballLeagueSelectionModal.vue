<template>
  <Transition name="modal-backdrop">
    <div
      v-if="isVisible"
      class="fixed inset-0 z-50 overflow-y-auto bg-gray-500 bg-opacity-75 backdrop-blur-sm transition-all duration-300"
    >
      <div
        class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0"
      >
        <span
          class="hidden sm:inline-block sm:align-middle sm:h-screen"
          aria-hidden="true"
          >&#8203;</span
        >

        <Transition name="modal-content" appear>
          <dialog
            v-if="isVisible"
            :open="isVisible"
            class="relative inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full sm:p-6"
            @click.stop
          >
            <div class="sm:flex sm:items-start">
              <div
                class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 sm:mx-0 sm:h-10 sm:w-10"
              >
                <v-icon
                  name="hi-solid-collection"
                  class="h-6 w-6 text-emerald-600 dark:text-emerald-400"
                />
              </div>
              <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left flex-1">
                <h3
                  class="text-lg leading-6 font-semibold text-gray-900 dark:text-white"
                  id="modal-title"
                >
                  Select your football leagues
                </h3>
                <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Choose at least one league to start seeing relevant news and
                  matches.
                </p>
              </div>
              <!-- Close button removed to force selection -->
            </div>

            <div class="mt-6">
              <div
                v-if="loading"
                class="text-center py-8 text-gray-400 dark:text-gray-500"
              >
                Loading leagues...
              </div>
              <div v-else-if="error" class="text-center py-6 text-red-500">
                {{ error }}
              </div>
              <div v-else>
                <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
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
                        'p-4 rounded-lg transition flex flex-col items-center justify-center text-center space-y-2',
                        selectedLeague?.uuid === league.uuid
                          ? 'ring-2 ring-emerald-400 bg-emerald-50 dark:bg-emerald-900/10'
                          : 'bg-transparent',
                      ]"
                    >
                      <img
                        :src="league.image_path || '/img/default-avatar.svg'"
                        class="w-14 h-14 rounded-full object-cover shadow-sm"
                        :alt="league.name"
                      />
                      <div
                        class="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[8rem]"
                      >
                        {{ league.name }}
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <div class="mt-6 sm:flex sm:flex-row-reverse">
              <ButtonComponent
                variant="primary"
                size="md"
                :disabled="!selectedLeague || isSaving"
                :loading="isSaving"
                @click="save"
                >Save</ButtonComponent
              >
            </div>
          </dialog>
        </Transition>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, onMounted, defineEmits, defineProps } from "vue";
import { useToast } from "@/composables/useToast";
import { ButtonComponent } from "@/components/ui";
import catalogService from "@/services/catalog/CatalogService";
import { useFootballLeagueStore } from "@/store/football/league/useFootballLeagueStore";
import type { FootballLeagueResponse } from "@/interfaces/football/league/FootballLeagueResponse";

const props = defineProps<{ isVisible?: boolean }>();
const emit = defineEmits(["close"]);

import { computed } from "vue";
import { useAuthStore } from "@/store/auth/useAuthStore";
import { useUserStore } from "@/store/user/useUserStore";
import { UserFootballLeaguePayload } from "@/interfaces/user/footballLeague/UserFootballLeaguePayload";
const isVisible = computed(() => !!props.isVisible);
const leagues = ref<FootballLeagueResponse[]>([]);
const loading = ref(false);
const error = ref("");
const selectedLeague = ref<FootballLeagueResponse | null>(null);
const isSaving = ref(false);

const store = useFootballLeagueStore();

onMounted(async () => {
  console.log("FootballLeagueSelectionModal mounted");
  loading.value = true;
  try {
    leagues.value = await catalogService.getFootballLeagues();
  } catch (e) {
    error.value = "Could not load leagues.";
  } finally {
    loading.value = false;
  }
});

const { success } = useToast();

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
    // toast confirmation
    success("League saved", `You selected ${selectedLeague.value.name}`);
    emit("close");
  } finally {
    isSaving.value = false;
  }
};
</script>

<style scoped>
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}

/* Backdrop animation */
.modal-backdrop-enter-active,
.modal-backdrop-leave-active {
  transition: all 0.3s ease;
}
.modal-backdrop-enter-from,
.modal-backdrop-leave-to {
  opacity: 0;
  backdrop-filter: blur(0px);
}
.modal-backdrop-enter-to,
.modal-backdrop-leave-from {
  opacity: 1;
  backdrop-filter: blur(4px);
}

/* Content animation */
.modal-content-enter-active {
  transition: all 0.32s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.modal-content-leave-active {
  transition: all 0.18s ease-in;
}
.modal-content-enter-from {
  opacity: 0;
  transform: scale(0.96) translateY(-10px);
}
.modal-content-leave-to {
  opacity: 0;
  transform: scale(0.98) translateY(8px);
}
.modal-content-enter-to,
.modal-content-leave-from {
  opacity: 1;
  transform: scale(1) translateY(0);
}

/* Accessibility: reduce motion */
@media (prefers-reduced-motion: reduce) {
  .modal-backdrop-enter-active,
  .modal-backdrop-leave-active,
  .modal-content-enter-active,
  .modal-content-leave-active {
    transition: none !important;
  }
}
</style>
