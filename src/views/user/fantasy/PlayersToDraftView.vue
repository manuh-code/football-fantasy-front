<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-4 md:py-8 pb-8">
    <div class="container mx-auto px-4 max-w-7xl">
      <!-- Loading -->
      <div
        v-if="isLoadingLeague"
        class="flex items-center justify-center py-20"
      >
        <v-icon
          name="pr-spinner"
          class="w-5 h-5 text-gray-300 dark:text-gray-600"
          animation="spin"
        />
      </div>

      <template v-else-if="leagueDetailStore.isDraftNotStarted">
        <!-- Admin: Draft ready to activate -->
        <div
          v-if="leagueDetailStore.canActivateDraft"
          class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 px-5 py-6 text-center space-y-3"
        >
          <v-icon
            name="hi-solid-lightning-bolt"
            class="w-10 h-10 text-orange-500 mx-auto"
          />
          <h2 class="text-lg font-bold text-gray-900 dark:text-white">
            {{ $t('fantasy.draft.activation.readyTitle') }}
          </h2>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            {{ $t('fantasy.draft.activation.readyBody', { count: leagueDetailStore.currentLeague?.participants_count }) }}
          </p>
          <ButtonComponent
            variant="primary"
            size="sm"
            :text="isActivatingDraft ? $t('fantasy.draft.activation.activating') : $t('fantasy.draft.activation.activate')"
            :disabled="isActivatingDraft"
            @click="handleActivateDraft"
          />
        </div>

        <!-- Admin: Waiting for members -->
        <div
          v-else-if="leagueDetailStore.isAdmin"
          class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 px-5 py-6 text-center space-y-3"
        >
          <v-icon
            name="hi-solid-user-group"
            class="w-10 h-10 text-blue-500 mx-auto"
          />
          <h2 class="text-lg font-bold text-gray-900 dark:text-white">
            {{ $t('fantasy.draft.activation.waitingTitle') }}
          </h2>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            {{ $t('fantasy.draft.activation.waitingBody', {
              joined: leagueDetailStore.currentLeague?.members_count || 0,
              total: leagueDetailStore.currentLeague?.participants_count
            }) }}
          </p>
          <div
            class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 max-w-xs mx-auto"
          >
            <div
              class="bg-blue-500 h-2 rounded-full transition-all duration-300"
              :style="{ width: membersProgress + '%' }"
            />
          </div>
        </div>

        <!-- Non-admin: Draft not available -->
        <div
          v-else
          class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 px-5 py-6 text-center space-y-3"
        >
          <v-icon
            name="hi-solid-clock"
            class="w-10 h-10 text-gray-400 dark:text-gray-500 mx-auto"
          />
          <h2 class="text-lg font-bold text-gray-900 dark:text-white">
            {{ $t('fantasy.draft.activation.notAvailableTitle') }}
          </h2>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            {{ $t('fantasy.draft.activation.notAvailableBody') }}
          </p>
        </div>
      </template>

      <!-- Draft active: show draft UI -->
      <!-- :key fuerza una instancia nueva por liga: si no, Vue reutiliza el
           componente al navegar entre drafts y la sala se queda pegada al draft
           anterior (canal Ably, presencia y turno incluidos). -->
      <DraftRoom
        v-if="
          !leagueDetailStore.isDraftNotStarted &&
          leagueDetailStore.currentLeague
        "
        :key="fantasyLeagueUuid"
        :fantasyLeague="leagueDetailStore.currentLeague"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRoute, onBeforeRouteUpdate } from "vue-router";
import { useI18n } from "vue-i18n";
import { useFantasyLeagueDetailStore } from "@/store/fantasy/useFantasyLeagueDetailStore";
import { useToast } from "@/composables/useToast";
import { useAblyBroadcast } from "@/composables/broadcast/useAblyBroadcast";
import { fantasyLeagueService } from "@/services/fantasy/leagues/FantasyLeagueService";
import { ButtonComponent } from "@/components/ui";
import DraftRoom from "@/components/fantasy/draft/DraftRoom.vue";
import type { UserDataInterface } from "@/interfaces/user/userInterface";

const route = useRoute();
const { t } = useI18n();
const toast = useToast();
const leagueDetailStore = useFantasyLeagueDetailStore();
const { fantasyLeagueChannel, draftRoomChannel } = useAblyBroadcast();

const fantasyLeagueUuid = computed(() => route.params.uuid as string);
const isActivatingDraft = ref(false);
const isLoadingLeague = ref(false);

const membersProgress = computed(() => {
  const league = leagueDetailStore.currentLeague;
  if (!league?.participants_count) return 0;
  return Math.round(
    ((league.members_count || 0) / league.participants_count) * 100,
  );
});

let channel: ReturnType<typeof fantasyLeagueChannel> | null = null;
let channelDraft: ReturnType<typeof draftRoomChannel> | null = null;

// Libera los canales de la liga/draft actualmente enlazados. Necesario tanto al
// desmontar la vista como al navegar in-app de una liga a otra: Vue Router
// reutiliza esta misma instancia de componente cuando solo cambia el :uuid de
// la ruta (mismo componente de destino), así que sin esto la suscripción se
// queda pegada a la liga anterior.
function teardownChannels() {
  channel?.unsubscribe("league.joined");
  channelDraft?.unsubscribe("draft.activated");
  channelDraft?.detach();
  channel = null;
  channelDraft = null;
}

async function setupForLeague(uuid: string) {
  isLoadingLeague.value = true;
  try {
    const league = await fantasyLeagueService.showFantasyLeague(uuid);
    leagueDetailStore.setCurrentLeague(league);
  } catch (error) {
    console.error("Error loading league:", error);
  } finally {
    isLoadingLeague.value = false;
  }

  channel = fantasyLeagueChannel(uuid);
  channel.subscribe("league.joined", (message) => {
    const user = message.data as UserDataInterface;
    if (!user?.uuid) return;
    leagueDetailStore.addParticipant(user);
  });

  const draftUuid = leagueDetailStore.currentLeague?.draft?.uuid || "";
  if (draftUuid) {
    channelDraft = draftRoomChannel(draftUuid);
    channelDraft.subscribe("draft.activated", async () => {
      toast.success(
        t("fantasy.draft.activation.activatedTitle"),
        t("fantasy.draft.activation.activatedMessage"),
      );
      // Reload league from API so draft status updates and DraftRoom becomes visible
      try {
        const updatedLeague = await fantasyLeagueService.showFantasyLeague(uuid);
        leagueDetailStore.setCurrentLeague(updatedLeague);
      } catch (error) {
        console.error("Error reloading league after draft activation:", error);
      }
    });
  }
}

onMounted(() => setupForLeague(fantasyLeagueUuid.value));

// Vue Router reutiliza esta instancia al navegar entre /fantasy/league/A/draft
// y /fantasy/league/B/draft (misma ruta/componente, distinto :uuid) — onMounted
// NO se vuelve a disparar. Sin este guard, la sala se queda mostrando el draft
// de la liga anterior (canal, presencia y turno incluidos) aunque la URL ya
// apunte a la nueva liga.
onBeforeRouteUpdate(async (to) => {
  const newUuid = to.params.uuid as string;
  if (!newUuid || newUuid === fantasyLeagueUuid.value) return;

  teardownChannels();
  // Vaciar el store antes de re-fetch: el :key en <DraftRoom> ya fuerza un
  // remount, pero esto también apaga momentáneamente el v-if para que ningún
  // dato de la liga anterior se pinte mientras carga la nueva.
  leagueDetailStore.clearCurrentLeague();
  await setupForLeague(newUuid);
});

onUnmounted(teardownChannels);

const handleActivateDraft = async () => {
  try {
    isActivatingDraft.value = true;
    await fantasyLeagueService.activateDraft(fantasyLeagueUuid.value);
    toast.success(
      t("fantasy.draft.activation.activatedTitle"),
      t("fantasy.draft.activation.activatedMessage"),
    );
    const updatedLeague = await fantasyLeagueService.showFantasyLeague(
      fantasyLeagueUuid.value,
    );
    leagueDetailStore.setCurrentLeague(updatedLeague);
  } catch (error) {
    console.error("Error activating draft:", error);
  } finally {
    isActivatingDraft.value = false;
  }
};
</script>
