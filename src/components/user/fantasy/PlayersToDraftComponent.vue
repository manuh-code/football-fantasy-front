<template>
  <div
    v-show="draftActive"
    class="space-y-4 transition-[margin] duration-300 ease-[cubic-bezier(0.25,1,0.5,1)]"
    :style="{ marginLeft: !isMobile ? `${drawerWidth}px` : undefined }"
  >
    <DraftOrderCarousel
      v-if="league?.draft?.draft_order?.length"
      :draft-order="league.draft.draft_order"
      :current-turn="currentTurn"
      :is-draft-complete="isDraftComplete"
      :is-my-turn="isMyTurn"
      :pick-time="0"
      :online-user-uuids="onlineUserUuids"
      :participants="league.participants ?? []"
    />

    <SearchPlayerFantasy
      ref="searchPlayerRef"
      v-if="league"
      :fantasy-league-uuid="fantasyLeagueUuid"
      mode="draft"
      :disabled="!isMyTurn"
    />

    <DraftTeamDrawer
      v-model="showDrawer"
      :fantasy-league-uuid="fantasyLeagueUuid"
      :refresh-key="drawerRefreshKey"
      @width-change="(w: number) => drawerWidth = w"
    />
  </div>
</template>

<script setup lang="ts">
import { useAblyBroadcast } from "@/composables/broadcast/useAblyBroadcast";
import { useUserStore, useFantasyLeagueDetailStore } from "@/store";
import { useBreakpoints } from "@/composables/useMediaQuery";
import { onMounted, onUnmounted, ref, computed, watch } from "vue";
import { fantasyLeagueService } from "@/services/fantasy/leagues/FantasyLeagueService";
import DraftOrderCarousel from "@/components/fantasy/draft/DraftOrderCarousel.vue";
import DraftTeamDrawer from "@/components/fantasy/draft/DraftTeamDrawer.vue";
import SearchPlayerFantasy from "@/components/user/fantasy/SearchPlayerFantasy.vue";
import type { FantasyLeaguesResponse } from "@/interfaces/fantasy/leagues/FantasyLeaguesResponse";
import type { DraftTurn, TurnChangedPayload, PlayerPickedPayload } from "@/composables/useDraftChannel";

const props = defineProps<{
  fantasyLeagueUuid: string;
  draftActive?: boolean;
}>();

const { ably, draftFantasyLeagueChannel } = useAblyBroadcast();
const channel = draftFantasyLeagueChannel(props.fantasyLeagueUuid);
const userData = useUserStore().userData;
const leagueDetailStore = useFantasyLeagueDetailStore();
const { isMobile } = useBreakpoints();

const league = ref<FantasyLeaguesResponse | null>(null);
const onlineUserUuids = ref<string[]>([]);
const currentTurn = ref<DraftTurn | null>(null);
const searchPlayerRef = ref<InstanceType<typeof SearchPlayerFantasy> | null>(null);
const showDrawer = ref(true);
const drawerRefreshKey = ref(0);
const drawerWidth = ref(360);

const isDraftComplete = computed(
  () => league.value?.draft?.status?.value === "completed",
);
const isMyTurn = computed(
  () => currentTurn.value?.user_uuid === userData?.uuid,
);

/** Sync the online users list from current presence members */
function syncOnlineMembers() {
  channel.presence.get((err, members) => {
    if (err) {
      console.error("Error getting presence:", err);
      return;
    }
    if (members) {
      onlineUserUuids.value = members
        .map((m) => m.data?.uuid as string)
        .filter(Boolean);
    }
  });
}

// Lifecycle
onMounted(async () => {
  // Load league data (includes participants)
  league.value = await fantasyLeagueService.showFantasyLeague(
    props.fantasyLeagueUuid,
  );
  leagueDetailStore.setCurrentLeague(league.value);

  // Load current draft turn only if draft is already active
  if (props.draftActive && !isDraftComplete.value) {
    currentTurn.value = await fantasyLeagueService.getCurrentDraftTurn(
      props.fantasyLeagueUuid,
    );
  }

  // Someone enters
  channel.presence.subscribe("enter", (member) => {
    const uuid = member.data?.uuid as string;
    if (uuid && !onlineUserUuids.value.includes(uuid)) {
      onlineUserUuids.value = [...onlineUserUuids.value, uuid];
    }
  });

  // Someone leaves
  channel.presence.subscribe("leave", (member) => {
    const uuid = member.data?.uuid as string;
    if (uuid) {
      onlineUserUuids.value = onlineUserUuids.value.filter((id) => id !== uuid);
    }
  });

  channel.presence.subscribe("present", () => {
    syncOnlineMembers();
  });

  // Enter presence with user data
  channel.presence.enter({
    uuid: userData?.uuid,
    name: userData?.firstname,
    avatar: userData?.avatar,
  });

  channel.subscribe("draft.activated", async () => {
    // Reload league data with updated draft status
    league.value = await fantasyLeagueService.showFantasyLeague(
      props.fantasyLeagueUuid,
    );
    leagueDetailStore.setCurrentLeague(league.value);

    // Load the first draft turn
    if (!isDraftComplete.value) {
      currentTurn.value = await fantasyLeagueService.getCurrentDraftTurn(
        props.fantasyLeagueUuid,
      );
    }
  });

  channel.subscribe("turn.changed", (message) => {
    const payload = message.data as TurnChangedPayload;
    currentTurn.value = payload.next_turn;
    if (payload.is_draft_complete) {
      league.value = league.value ? { ...league.value, draft: league.value.draft ? { ...league.value.draft, status: { ...league.value.draft.status, value: 'completed' } } : league.value.draft } : null;
    }
  });

  channel.subscribe("player.picked", (message) => {
    const payload = message.data as PlayerPickedPayload;
    if (payload.player_uuid) {
      searchPlayerRef.value?.removePlayerByUuid(payload.player_uuid);
    }
    // Refresh the team drawer when the current user picked a player
    if (payload.picked_by_user_uuid === userData?.uuid) {
      drawerRefreshKey.value++;
    }
  });

  // Initial sync of who is already present
  syncOnlineMembers();
});

onUnmounted(() => {
  if (channel) {
    channel.presence.leave();
    channel.detach();
  }
});

// When draftActive changes to true, reload league data to get draft_order
watch(() => props.draftActive, async (isActive, wasActive) => {
  if (isActive && !wasActive) {
    league.value = await fantasyLeagueService.showFantasyLeague(
      props.fantasyLeagueUuid,
    );
    leagueDetailStore.setCurrentLeague(league.value);

    if (!isDraftComplete.value) {
      currentTurn.value = await fantasyLeagueService.getCurrentDraftTurn(
        props.fantasyLeagueUuid,
      );
    }
  }
});
</script>

<style scoped></style>
