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
            Draft ready to start
          </h2>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            All
            {{ leagueDetailStore.currentLeague?.participants_count }} members
            have joined. You can activate the draft now.
          </p>
          <ButtonComponent
            variant="primary"
            size="sm"
            :text="isActivatingDraft ? 'Activating...' : 'Activate Draft'"
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
            Waiting for members
          </h2>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            {{ leagueDetailStore.currentLeague?.members_count || 0 }} of
            {{ leagueDetailStore.currentLeague?.participants_count }} members
            have joined. The draft can be activated once all members are
            present.
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
            Draft not available yet
          </h2>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            The league admin hasn't activated the draft yet. You'll be notified
            when it starts.
          </p>
        </div>
      </template>

      <!-- Draft active: show draft UI -->
      <!-- <PlayersToDraftComponent
        :fantasy-league-uuid="fantasyLeagueUuid"
        :draft-active="!leagueDetailStore.isDraftNotStarted"
      /> -->

      <DraftRoom
        v-if="
          !leagueDetailStore.isDraftNotStarted &&
          leagueDetailStore.currentLeague
        "
        :fantasyLeague="leagueDetailStore.currentLeague"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRoute } from "vue-router";
import { useFantasyLeagueDetailStore } from "@/store/fantasy/useFantasyLeagueDetailStore";
import { useToast } from "@/composables/useToast";
import { useAblyBroadcast } from "@/composables/broadcast/useAblyBroadcast";
import { fantasyLeagueService } from "@/services/fantasy/leagues/FantasyLeagueService";
import { ButtonComponent } from "@/components/ui";
import PlayersToDraftComponent from "@/components/user/fantasy/PlayersToDraftComponent.vue";
import DraftRoom from "@/components/fantasy/draft/DraftRoom.vue";
import type { UserDataInterface } from "@/interfaces/user/userInterface";

const route = useRoute();
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

onMounted(async () => {
  if (!leagueDetailStore.currentLeague) {
    isLoadingLeague.value = true;
    try {
      const league = await fantasyLeagueService.showFantasyLeague(
        fantasyLeagueUuid.value,
      );
      leagueDetailStore.setCurrentLeague(league);
    } catch (error) {
      console.error("Error loading league:", error);
    } finally {
      isLoadingLeague.value = false;
    }
  }

  // Create channels after league data is available
  channel = fantasyLeagueChannel(fantasyLeagueUuid.value);
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
        "Draft Activated",
        "The draft has been activated successfully.",
      );
      // Reload league from API so draft status updates and DraftRoom becomes visible
      try {
        const updatedLeague = await fantasyLeagueService.showFantasyLeague(
          fantasyLeagueUuid.value,
        );
        leagueDetailStore.setCurrentLeague(updatedLeague);
      } catch (error) {
        console.error("Error reloading league after draft activation:", error);
      }
    });
  }
});

onUnmounted(() => {
  channel?.unsubscribe("league.joined");
  channelDraft?.unsubscribe("draft.activated");
  channelDraft?.detach();
});

const handleActivateDraft = async () => {
  try {
    isActivatingDraft.value = true;
    await fantasyLeagueService.activateDraft(fantasyLeagueUuid.value);
    toast.success(
      "Draft Activated",
      "The draft has been activated successfully.",
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
