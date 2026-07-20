<template>
  <div
    class="pt-2 space-y-2.5 transition-[margin-left] duration-300"
    :style="{ marginLeft: `${drawerWidth}px` }"
  >
    <!-- Draft Completed -->
    <DraftCompleted v-if="isDraftCompleted" />

    <!-- Active draft -->
    <template v-else>
      <div ref="timerSentinelRef" class="h-0" />
      <div
        class="sticky top-[calc(3rem+env(safe-area-inset-top,0px))] sm:top-[calc(3.5rem+env(safe-area-inset-top,0px))] z-40 space-y-1.5"
      >
        <DraftTimer
          :turn="turnStarted"
          :compact="isTimerCompact"
          @expired="onTurnExpired"
        />

        <!-- Auto Pick toggle -->
        <div
          class="flex items-center justify-between bg-white dark:bg-gray-800/90 backdrop-blur-sm rounded-xl px-3 py-2 border border-gray-100 dark:border-gray-700/40 shadow-sm"
        >
          <div class="flex items-center gap-2">
            <v-icon name="ri-robot-line" class="w-4 h-4 text-amber-500 dark:text-amber-400" />
            <span class="text-xs font-semibold text-gray-700 dark:text-gray-300">{{ $t('fantasy.draft.room.autoPick') }}</span>
          </div>
          <button
            type="button"
            role="switch"
            :aria-checked="isAutoPick"
            :disabled="isTogglingAutoPick"
            :class="[
              'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800',
              isAutoPick ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-gray-600',
              isTogglingAutoPick ? 'opacity-50 cursor-not-allowed' : ''
            ]"
            @click="handleToggleAutoPick"
          >
            <span
              :class="[
                'pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                isAutoPick ? 'translate-x-4' : 'translate-x-0'
              ]"
            />
          </button>
        </div>
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
            <p class="text-base sm:text-xl font-bold leading-tight">{{ $t('fantasy.draft.room.yourTurn') }}</p>
            <p class="text-2xs sm:text-sm text-white/70">{{ $t('fantasy.draft.room.yourTurnSub') }}</p>
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
import { useI18n } from "vue-i18n";
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

const membersDraftRoom = ref<UserDataInterface[]>([]);
const turnStarted = ref<FantasyDraftTurnStarted | null>(null);
const searchPlayerRef = ref<InstanceType<typeof SearchPlayerFantasy> | null>(null);
const toast = useToast();
const { t } = useI18n();
const showDrawer = ref(false);
const drawerRefreshKey = ref(0);
const drawerWidth = ref(0);
const isAutoPick = ref(false);
const isTogglingAutoPick = ref(false);

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

const { draftRoomChannel, ably } = useAblyBroadcast();
const draftUuid = props.fantasyLeague.draft?.uuid || "";
const channel = draftRoomChannel(draftUuid);

// Payload mínimo de presencia: solo lo que DraftOrder realmente pinta.
// Mandar el userData completo (favoriteFootballTeam, football_league, etc.)
// arriesga superar el límite de tamaño de mensajes de presencia de Ably y que
// el enter sea rechazado en silencio. Los campos pesados van en null.
function presencePayload(): UserDataInterface {
  const u = userStore.getUserData;
  return {
    uuid: u?.uuid ?? null,
    firstname: u?.firstname ?? null,
    lastname: u?.lastname ?? null,
    avatar: u?.avatar ?? null,
    email: null,
    phone: null,
    favoriteFootballTeam: null,
    football_league: null,
  };
}

// Anuncia mi presencia con callback de error: si el enter falla ya no es
// fire-and-forget silencioso.
function enterPresence() {
  channel.presence.enter(presencePayload(), (err) => {
    if (err) {
      console.error("Error entering draft room presence:", err);
    }
  });
}

// Rehidrata presencia tras cada (re)conexión: sin esto la lista queda congelada
// después de un corte de red (p. ej. la app en segundo plano en móvil) y usuarios
// que siguen en la sala dejan de marcarse en línea. También re-sincroniza el turno,
// que pudo avanzar por Ably mientras estábamos desconectados.
function handleReconnect() {
  enterPresence();
  syncMembersFromPresence();
  getTurnInfo();
}

// Al volver a primer plano (típico en móvil, con la conexión posiblemente aún viva)
// el turno pudo avanzar sin que llegara el turn.started: re-sincronizamos la fuente
// de verdad del backend y el snapshot de presencia.
function handleVisibility() {
  if (document.hidden) return;
  getTurnInfo();
  syncMembersFromPresence();
}

let presenceSyncTimeout: ReturnType<typeof setTimeout> | null = null;

// La presencia de Ably es POR CONEXIÓN, no por usuario: un mismo uuid puede tener
// varias conexiones (varias pestañas o dispositivos con el mismo clientId). Por eso
// nunca mutamos la lista por evento —un 'leave' de una conexión no significa que el
// usuario se fue si le queda otra viva— sino que reconciliamos contra el snapshot
// autoritativo presence.get(). Debounce para colapsar ráfagas de enter/leave.
function scheduleMembersSync() {
  if (presenceSyncTimeout) clearTimeout(presenceSyncTimeout);
  presenceSyncTimeout = setTimeout(syncMembersFromPresence, 150);
}

async function subscribeToDraftRoom() {
  // Cualquier cambio de presencia (entrar/salir/actualizar/ya presente) dispara una
  // reconciliación contra presence.get(), única forma correcta con multi-conexión.
  await channel.presence.subscribe(
    ["enter", "leave", "update", "present"],
    scheduleMembersSync,
  );
}

function syncMembersFromPresence() {
  // Snapshot autoritativo: reconstruye la lista para que se caigan los que
  // salieron mientras estábamos desconectados y se agreguen los que faltaban.
  channel.presence.get((err, members) => {
    if (err) {
      console.error("Error obteniendo miembros en presencia:", err);
      return;
    }

    const next: UserDataInterface[] = [];
    const add = (data?: UserDataInterface) => {
      if (data?.uuid && !next.some((u) => u.uuid === data.uuid)) {
        next.push(data);
      }
    };

    members?.forEach((member: Types.PresenceMessage) =>
      add(member.data as UserDataInterface),
    );
    // Incluirme siempre: mi propio enter puede no venir aún en el snapshot.
    add(presencePayload());

    membersDraftRoom.value = next;
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

async function fetchAutoPickStatus() {
  try {
    isAutoPick.value = await fantasyLeagueService.getAutoPickStatus(props.fantasyLeague.uuid);
  } catch (error) {
    console.error('Error fetching auto-pick status:', error);
  }
}

async function handleToggleAutoPick() {
  if (isTogglingAutoPick.value) return;
  try {
    isTogglingAutoPick.value = true;
    const newValue = !isAutoPick.value;
    await fantasyLeagueService.toggleAutoPick(props.fantasyLeague.uuid, newValue);
    isAutoPick.value = newValue;
    toast.success(t('fantasy.draft.room.autoPick'), newValue ? t('fantasy.draft.room.autoPickOn') : t('fantasy.draft.room.autoPickOff'));
  } catch (error) {
    console.error('Error toggling auto-pick:', error);
  } finally {
    isTogglingAutoPick.value = false;
  }
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
  await fetchAutoPickStatus();
  await subscribeToDraftRoom();
  enterPresence();
  syncMembersFromPresence();

  // Re-sincroniza presencia y turno en cada (re)conexión para que sobrevivan
  // los cortes de red en lugar de quedar obsoletos.
  ably.connection.on("connected", handleReconnect);
  ably.connection.on("update", handleReconnect);
  document.addEventListener("visibilitychange", handleVisibility);

  channel.subscribe("turn.started", (message) => {
    const data = message.data as FantasyDraftTurnStarted;
    // No retroceder el turno ante un turn.started viejo o reenviado por Ably:
    // ignora eventos cuyo pick sea anterior al que ya mostramos.
    if ((data.pick ?? 0) < (turnStarted.value?.pick ?? -1)) return;
    turnStarted.value = data;
  });

  channel.subscribe("turn.skipped", () => {});

  channel.subscribe("player.selected", (message) => {
    const playerSelected = message.data as FantasyDraftPlayerSelected;
    const userName = `${playerSelected.user?.firstname ?? ''} ${playerSelected.user?.lastname ?? ''}`.trim();
    const playerName = playerSelected.player?.display_name ?? playerSelected.player?.common_name ?? '';
    toast.info(
      t('fantasy.draft.room.playerSelected', { name: userName }),
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
      turnStarted.value = { status: 'COMPLETED', pick: null, round: null, user: null, turn_started_at: null, duration_seconds: null, auto_pick: null };
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
  if (presenceSyncTimeout) {
    clearTimeout(presenceSyncTimeout);
    presenceSyncTimeout = null;
  }
  document.removeEventListener("visibilitychange", handleVisibility);
  ably.connection.off("connected", handleReconnect);
  ably.connection.off("update", handleReconnect);
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
