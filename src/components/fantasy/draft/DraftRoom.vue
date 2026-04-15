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

      <!-- My Turn indicator bar -->
      <Transition name="my-turn-bar">
        <div
          v-if="isMyTurn"
          class="relative overflow-hidden rounded-xl h-1.5"
        >
          <div class="absolute inset-0 my-turn-bar-shine bg-gradient-to-r from-emerald-400 via-green-300 to-emerald-400 dark:from-emerald-500 dark:via-green-400 dark:to-emerald-500" />
        </div>
      </Transition>

      <div
        class="transition-all duration-500 rounded-2xl"
        :class="{ 'my-turn-glow': isMyTurn }"
      >
        <SearchPlayerFantasy
          ref="searchPlayerRef"
          :fantasyLeagueUuid="fantasyLeague.uuid"
          mode="draft"
          :disabled="!isMyTurn"
        />
      </div>
    </template>

    <!-- My Turn Flash Notification -->
    <Transition name="my-turn-flash">
      <div
        v-if="showMyTurnFlash"
        class="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none"
      >
        <div
          class="bg-gradient-to-r from-green-500 to-emerald-500 dark:from-green-600 dark:to-emerald-600
                 text-white px-5 py-3 sm:px-8 sm:py-4 rounded-2xl shadow-2xl
                 flex items-center gap-3 backdrop-blur-sm"
        >
          <span class="text-2xl sm:text-3xl" aria-hidden="true">⚡</span>
          <div>
            <p class="text-base sm:text-xl font-bold leading-tight">It's your turn!</p>
            <p class="text-[11px] sm:text-sm text-white/70">Pick a player for your team</p>
          </div>
        </div>
      </div>
    </Transition>

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
import { onMounted, onUnmounted, ref, computed, watch } from "vue";

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

const showMyTurnFlash = ref(false);
let flashTimeout: ReturnType<typeof setTimeout> | null = null;

watch(isMyTurn, (newVal, oldVal) => {
  if (newVal && !oldVal) {
    showMyTurnFlash.value = true;
    if (flashTimeout) clearTimeout(flashTimeout);
    flashTimeout = setTimeout(() => {
      showMyTurnFlash.value = false;
    }, 3000);
  } else if (!newVal) {
    showMyTurnFlash.value = false;
    if (flashTimeout) {
      clearTimeout(flashTimeout);
      flashTimeout = null;
    }
  }
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
  if (flashTimeout) {
    clearTimeout(flashTimeout);
    flashTimeout = null;
  }
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

<style scoped>
/* Flash notification enter/leave transitions */
.my-turn-flash-enter-active {
  transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.my-turn-flash-leave-active {
  transition: all 0.8s ease-in;
}
.my-turn-flash-enter-from {
  opacity: 0;
  transform: scale(0.7);
}
.my-turn-flash-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(-20px);
}

/* Animated top bar */
.my-turn-bar-enter-active {
  transition: all 0.6s ease-out;
}
.my-turn-bar-leave-active {
  transition: all 0.4s ease-in;
}
.my-turn-bar-enter-from,
.my-turn-bar-leave-to {
  opacity: 0;
  transform: scaleX(0);
}

.my-turn-bar-shine {
  background-size: 200% 100%;
  animation: barShine 2s ease-in-out infinite;
}

@keyframes barShine {
  0% { background-position: 100% 0; }
  50% { background-position: 0% 0; }
  100% { background-position: 100% 0; }
}

/* Glowing border around search area */
.my-turn-glow {
  box-shadow:
    0 0 0 2px rgba(52, 211, 153, 0.5),
    0 0 12px rgba(52, 211, 153, 0.25),
    0 0 24px rgba(52, 211, 153, 0.1);
  animation: turnGlow 2.5s ease-in-out infinite;
}

@keyframes turnGlow {
  0%, 100% {
    box-shadow:
      0 0 0 2px rgba(52, 211, 153, 0.4),
      0 0 12px rgba(52, 211, 153, 0.2),
      0 0 24px rgba(52, 211, 153, 0.08);
  }
  50% {
    box-shadow:
      0 0 0 2px rgba(52, 211, 153, 0.7),
      0 0 20px rgba(52, 211, 153, 0.35),
      0 0 40px rgba(52, 211, 153, 0.15);
  }
}
</style>
