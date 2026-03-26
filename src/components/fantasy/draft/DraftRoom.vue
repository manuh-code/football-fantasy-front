<template>
  <div
    class="px-4 pt-2 space-y-2 transition-[margin-left] duration-300"
    :style="{ marginLeft: `${drawerWidth}px` }"
  >
    <!-- Draft Completed -->
    <div
      v-if="isDraftCompleted"
      class="rounded-2xl overflow-hidden shadow-sm bg-gradient-to-br from-emerald-500 via-green-500 to-teal-500 dark:from-emerald-600 dark:via-green-600 dark:to-teal-600"
    >
      <div class="px-5 py-6 flex flex-col items-center text-center gap-3">
        <!-- Trophy icon -->
        <div
          class="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="w-9 h-9 text-yellow-200"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path
              d="M5 3h14c.55 0 1 .45 1 1v2c0 2.55-1.16 4.83-3 6.32V18h1c.55 0 1 .45 1 1v1c0 .55-.45 1-1 1H6c-.55 0-1-.45-1-1v-1c0-.55.45-1 1-1h1v-5.68C5.16 10.83 4 8.55 4 6V4c0-.55.45-1 1-1zm2 2v1c0 1.87.83 3.54 2.14 4.68L12 12.87l2.86-2.19A5.98 5.98 0 0017 6V5H7zm5 10.32L9 11.5V17h6v-5.5l-3 1.82z"
            />
          </svg>
        </div>

        <div>
          <p class="text-lg font-extrabold text-white leading-tight">
            Draft Completed!
          </p>
          <p class="text-sm text-white/70 mt-1">
            All picks have been made. Check your roster!
          </p>
        </div>

        <!-- Confetti dots decoration -->
        <div class="flex gap-1.5 mt-1">
          <span
            class="w-2 h-2 rounded-full bg-yellow-300/60 animate-bounce"
            style="animation-delay: 0ms; animation-duration: 1.4s"
          />
          <span
            class="w-2 h-2 rounded-full bg-white/50 animate-bounce"
            style="animation-delay: 200ms; animation-duration: 1.4s"
          />
          <span
            class="w-2 h-2 rounded-full bg-yellow-300/60 animate-bounce"
            style="animation-delay: 400ms; animation-duration: 1.4s"
          />
          <span
            class="w-2 h-2 rounded-full bg-white/50 animate-bounce"
            style="animation-delay: 600ms; animation-duration: 1.4s"
          />
          <span
            class="w-2 h-2 rounded-full bg-yellow-300/60 animate-bounce"
            style="animation-delay: 800ms; animation-duration: 1.4s"
          />
        </div>
      </div>
    </div>

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

      <!-- Draft Board toggle -->
      <button
        type="button"
        class="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-[13px] font-semibold transition-colors"
        :class="showDraftBoard
          ? 'bg-blue-500 text-white dark:bg-blue-600'
          : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700'"
        @click="toggleDraftBoard"
      >
        <v-icon name="hi-solid-clipboard-list" class="w-4 h-4" />
        {{ showDraftBoard ? 'Hide Draft Board' : 'Draft Board' }}
      </button>

      <!-- Draft Board panel -->
      <DraftPlayerPicked
        v-if="showDraftBoard"
        ref="draftPickedRef"
        :fantasyLeagueUuid="fantasyLeague.uuid"
      />

      <SearchPlayerFantasy
        ref="searchPlayerRef"
        :fantasyLeagueUuid="fantasyLeague.uuid"
        mode="draft"
        :disabled="!isMyTurn"
      />
    </template>

    <DraftTeamDrawer
      v-model="showDrawer"
      :fantasyLeagueUuid="fantasyLeague.uuid"
      :refreshKey="drawerRefreshKey"
      @width-change="(w: number) => drawerWidth = w"
    />
  </div>
</template>

<script lang="ts" setup>
import DraftOrder from "@/components/fantasy/draft/DraftOrder.vue";
import DraftPlayerPicked from "@/components/fantasy/draft/DraftPlayerPicked.vue";
import DraftTeamDrawer from "@/components/fantasy/draft/DraftTeamDrawer.vue";
import DraftTimer from "@/components/fantasy/draft/DraftTimer.vue";
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

const showDraftBoard = ref(false);
const draftPickedRef = ref<InstanceType<typeof DraftPlayerPicked> | null>(null);

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
    draftPickedRef.value?.refresh();
  });
});

function onTurnExpired() {
  // Timer expired — the backend handles turn advancement
}

function toggleDraftBoard() {
  showDraftBoard.value = !showDraftBoard.value;
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
