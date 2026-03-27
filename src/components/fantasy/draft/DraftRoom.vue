<template>
  <div
    class="px-4 pt-2 space-y-2 transition-[margin-left] duration-300"
    :style="{ marginLeft: `${drawerWidth}px` }"
  >
    <!-- Draft Completed -->
    <DraftCompleted v-if="isDraftCompleted" />

    <!-- Active draft -->
    <template v-else>
      <div ref="timerSentinelRef" class="h-0" />
      <div
        class="sticky top-[calc(3rem+env(safe-area-inset-top,0px))] sm:top-[calc(3.5rem+env(safe-area-inset-top,0px))] z-40"
      >
        <DraftTimer
          :turn="turnStarted"
          :compact="isTimerCompact"
          @expired="onTurnExpired"
        />
      </div>

      <DraftOrder
        v-if="fantasyLeague"
        :fantasyLeague="fantasyLeague"
        :membersInDraftRoom="membersDraftRoom"
        :activeRound="turnStarted?.round ?? undefined"
        :currentTurnUserUuid="turnStarted?.user?.uuid ?? undefined"
      />

      <SearchPlayerFantasy
        ref="searchPlayerRef"
        :fantasyLeagueUuid="fantasyLeague.uuid"
        mode="draft"
        :disabled="!isMyTurn"
      />
    </template>

    <!-- Bottom spacer so content is not hidden behind MenuDraft -->
    <div class="h-16" />

    <DraftTeamDrawer
      v-model="showDrawer"
      :fantasyLeagueUuid="fantasyLeague.uuid"
      :refreshKey="drawerRefreshKey"
      @width-change="(w: number) => drawerWidth = w"
    />

    <MenuDraft
      ref="menuDraftRef"
      :leftOffset="drawerWidth"
      :fantasyLeagueUuid="fantasyLeague.uuid"
    />
  </div>
</template>

<script lang="ts" setup>
import DraftCompleted from "@/components/fantasy/draft/DraftCompleted.vue";
import DraftOrder from "@/components/fantasy/draft/DraftOrder.vue";
import DraftTeamDrawer from "@/components/fantasy/draft/DraftTeamDrawer.vue";
import DraftTimer from "@/components/fantasy/draft/DraftTimer.vue";
import MenuDraft from "@/components/fantasy/draft/MenuDraft.vue";
import SearchPlayerFantasy from "@/components/user/fantasy/SearchPlayerFantasy.vue";
import { useAblyBroadcast } from "@/composables/broadcast/useAblyBroadcast";
import { useToast } from "@/composables/useToast";
import { FantasyDraftTurnSkipped } from "@/interfaces/fantasy/draft/FantasyDraftTurnSkipped";
import { FantasyDraftTurnStarted } from "@/interfaces/fantasy/draft/FantasyDraftTurnStarted";
import { FantasyLeaguesResponse } from "@/interfaces/fantasy/leagues/FantasyLeaguesResponse";
import { UserDataInterface } from "@/interfaces/user/userInterface";
import { useUserStore } from "@/store";
import { Types } from "ably";
import { onMounted, onUnmounted, ref, computed } from "vue";

const timerSentinelRef = ref<HTMLElement | null>(null);
const isTimerCompact = ref(false);
let timerObserver: IntersectionObserver | null = null;
import { fantasyLeagueService } from "@/services/fantasy/leagues/FantasyLeagueService";
import { FantasyDraftPlayerSelected } from "@/interfaces/fantasy/draft/FantasyDraftPlayerSelected";
import type { FantasyDraftPlayerPicked } from "@/interfaces/fantasy/draft/FantasyDraftPlayerPicked";

const props = defineProps<{
  fantasyLeague: FantasyLeaguesResponse;
}>();

const userStore = useUserStore();
const userData = userStore.getUserData;

const membersDraftRoom = ref<UserDataInterface[]>([]);
const turnStarted = ref<FantasyDraftTurnStarted | null>(null);
const searchPlayerRef = ref<InstanceType<typeof SearchPlayerFantasy> | null>(null);
const toast = useToast();
const showDrawer = ref(false);
const drawerRefreshKey = ref(0);
const drawerWidth = ref(0);

const menuDraftRef = ref<InstanceType<typeof MenuDraft> | null>(null);

const isDraftCompleted = computed(
  () => turnStarted.value?.status === "COMPLETED",
);

const isMyTurn = computed(() => {
  if (!turnStarted.value?.user) return false;
  return userStore.getUserData?.uuid === turnStarted.value.user.uuid;
});

const { draftRoomChannel } = useAblyBroadcast();
const draftUuid = props.fantasyLeague.draft?.uuid || "";
const channel = draftRoomChannel(draftUuid);

async function subscribeToDraftRoom(channel: Types.RealtimeChannelCallbacks) {
  // 1. Suscribirse a los eventos de presencia de OTROS usuarios
  await channel.presence.subscribe(["enter", "update", "present"], (member) => {
    // Si el usuario entra o actualiza, lo agregamos/actualizamos en la lista
    const userData = member.data as UserDataInterface;
    const index = membersDraftRoom.value.findIndex(
      (u) => u.uuid === userData.uuid,
    );
    if (index >= 0) {
      membersDraftRoom.value[index] = userData; // Actualiza datos si ya existe
    } else {
      membersDraftRoom.value.push(userData); // Agrega nuevo usuario
    }
  });
}

async function leaveDraftRoom(channel: Types.RealtimeChannelCallbacks) {
  await channel.presence.subscribe("leave", (member) => {
    // Si alguien sale, lo removemos de la lista reactiva
    const userData = member.data as UserDataInterface;
    membersDraftRoom.value = membersDraftRoom.value.filter(
      (u) => u.uuid !== userData.uuid,
    );
  });
}

async function getMembersInDraftRoom(channel: Types.RealtimeChannelCallbacks) {
  // Obtner usuarios ya registrados en presencia al montar el componente
  await channel.presence.get((err, members) => {
    if (err) {
      console.error("Error obteniendo miembros en presencia:", err);
      return;
    }

    members?.forEach((member: Types.PresenceMessage) => {
      const userData = member.data as UserDataInterface;
      if (userData?.uuid) {
        const index = membersDraftRoom.value.findIndex(
          (u) => u.uuid === userData.uuid,
        );
        if (index < 0) {
          membersDraftRoom.value.push(userData);
        } else {
          membersDraftRoom.value[index] = userData; // Actualiza datos si ya existe
        }
      }
    });
  });
}

async function getTurnInfo() {
  fantasyLeagueService
    .getTurnInfo(props.fantasyLeague.uuid)
    .then((turnInfo) => {
      turnStarted.value = turnInfo;
    })
    .catch((error) => {
      console.error("Error fetching turn info:", error);
    });
}

onMounted(async () => {
  // Sentinel observer for compact timer mode
  if (timerSentinelRef.value) {
    timerObserver = new IntersectionObserver(
      ([entry]) => {
        isTimerCompact.value = !entry.isIntersecting;
      },
      { threshold: 0 },
    );
    timerObserver.observe(timerSentinelRef.value);
  }

  await getTurnInfo();
  await subscribeToDraftRoom(channel!);
  await leaveDraftRoom(channel!);
  await getMembersInDraftRoom(channel!);
  await channel.presence.enter({ ...userData });

  // Recover the last turn.started event from history (for late joiners)

  channel.subscribe("turn.started", (message) => {
    const data = message.data as FantasyDraftTurnStarted;
    turnStarted.value = data;
  });

  channel.subscribe("turn.skipped", (message) => {
    const skippedTurn = message.data as FantasyDraftTurnSkipped;
  });

  channel.subscribe("player.selected", (message) => {
    const playerSelected = message.data as FantasyDraftPlayerSelected;
    const userName = `${playerSelected.user?.firstname ?? ''} ${playerSelected.user?.lastname ?? ''}`.trim();
    const playerName = playerSelected.player?.display_name ?? playerSelected.player?.common_name ?? '';
    toast.info(
      `${userName} selected`,
      playerName,
      {
        image: playerSelected.player?.image_path,
        duration: 5000,
      },
    );
    searchPlayerRef.value?.removePlayerByUuid(playerSelected.player?.uuid);
    drawerRefreshKey.value++;
    const newPick: FantasyDraftPlayerPicked = {
      pick: playerSelected.pick,
      round: playerSelected.round,
      player: playerSelected.player,
      user: playerSelected.user,
    };
    menuDraftRef.value?.addPick(newPick);
  });

  channel.subscribe("draft.finished", () => {
    if (turnStarted.value) {
      turnStarted.value = { ...turnStarted.value, status: 'COMPLETED' };
    } else {
      turnStarted.value = { status: 'COMPLETED', pick: null, round: null, user: null, turn_started_at: null, duration_seconds: null };
    }
  });
});

function onTurnExpired() {
  // Timer expired — the backend handles turn advancement
}

onUnmounted(() => {
  if (timerObserver) {
    timerObserver.disconnect();
    timerObserver = null;
  }
  if (channel) {
    channel.unsubscribe("turn.started");
    channel.unsubscribe("turn.skipped");
    channel.presence.unsubscribe();
    channel.presence.leave();
  }
});
</script>
