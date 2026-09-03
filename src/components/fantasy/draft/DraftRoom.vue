<template>
  <div
    class="pt-2 space-y-2.5 transition-[margin-left] duration-300"
    :style="{ marginLeft: `${drawerWidth}px` }"
  >
    <!-- Draft Completed: felicitación + boleta del draft -->
    <template v-if="isDraftCompleted">
      <DraftCompleted />
      <DraftResultsCard v-if="draftResults" :results="draftResults" class="mt-2.5" />
      <div
        v-else-if="resultsError"
        class="mt-2.5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/60 px-4 py-5 text-center text-2xs text-gray-500 dark:text-gray-400"
      >
        {{ $t('fantasy.draft.results.loadError') }}
      </div>
    </template>

    <!-- Active draft -->
    <template v-else>
      <div ref="timerSentinelRef" class="h-0" />
      <div
        class="draft-sticky sticky top-[calc(3rem+env(safe-area-inset-top,0px))] sm:top-[calc(3.5rem+env(safe-area-inset-top,0px))] z-40 space-y-1.5"
      >
        <DraftTimerCard
          :contender="contenderOnTheClock"
          :pick="turnStarted?.pick ?? null"
          :round="turnStarted?.round ?? null"
          :total-rounds="totalRounds"
          :is-my-turn="isMyTurn"
          :duration-seconds="turnStarted?.duration_seconds ?? null"
          :ends-at="turnEndsAt"
          :absent="turnStarted?.absent ?? false"
          :compact="isTimerCompact"
          @expired="onTurnExpired"
        />

        <!-- Auto Pick toggle — opaque (no backdrop-blur): a blurred layer over
             the scrolling content behind a sticky bar ghosts/flickers on scroll. -->
        <div
          class="flex items-center justify-between bg-white dark:bg-gray-800 rounded-xl px-3 py-2 border border-gray-100 dark:border-gray-700/40 shadow-sm"
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

      <DraftBoardStrip
        v-if="contenders.length"
        :contenders="contenders"
        :picks="boardPicks"
        :rounds="totalRounds"
        :total-picks="totalPicks"
        :current-pick="turnStarted?.pick ?? null"
        :online-count="membersDraftRoom.length"
        show-live-dot
        @show-roster="showRoster = true"
      />

      <DraftRoomRosterSheet
        v-model="showRoster"
        :contenders="contenders"
        :on-the-clock-key="turnStarted?.user?.uuid ?? null"
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
      :leftOffset="drawerWidth"
      :fantasyLeagueUuid="fantasyLeague.uuid"
      :isMyTurn="isMyTurn"
      :contenders="contenders"
      :picks="boardPicks"
    />
  </div>
</template>

<script lang="ts" setup>
import DraftCompleted from "@/components/fantasy/draft/DraftCompleted.vue";
import DraftBoardStrip from "@/components/fantasy/draft/shared/DraftBoardStrip.vue";
import DraftRoomRosterSheet from "@/components/fantasy/draft/DraftRoomRosterSheet.vue";
import DraftResultsCard from "@/components/fantasy/draft/shared/DraftResultsCard.vue";
import DraftTeamDrawer from "@/components/fantasy/draft/DraftTeamDrawer.vue";
import DraftTimerCard from "@/components/fantasy/draft/shared/DraftTimerCard.vue";
import MenuDraft from "@/components/fantasy/draft/MenuDraft.vue";
import SearchPlayerFantasy from "@/components/user/fantasy/SearchPlayerFantasy.vue";
import { useAblyBroadcast } from "@/composables/broadcast/useAblyBroadcast";
import { useToast } from "@/composables/useToast";
import { useI18n } from "vue-i18n";
import { FantasyDraftTurnStarted } from "@/interfaces/fantasy/draft/FantasyDraftTurnStarted";
import type { DraftResults } from "@/interfaces/fantasy/draft/DraftResults";
import {
  initialsFrom,
  normalizePositionCode,
} from "@/components/fantasy/draft/shared/draftShared";
import type {
  DraftBoardPick,
  DraftContender,
} from "@/components/fantasy/draft/shared/draftShared";
import { FantasyLeaguesResponse } from "@/interfaces/fantasy/leagues/FantasyLeaguesResponse";
import { UserDataInterface } from "@/interfaces/user/userInterface";
import { useUserStore } from "@/store";
import { useDraftWishlistStore } from "@/store/fantasy/useDraftWishlistStore";
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
const draftWishlistStore = useDraftWishlistStore();

const membersDraftRoom = ref<UserDataInterface[]>([]);
/**
 * Si ya llegó una primera foto de presencia. Distinto de "la lista está
 * vacía": una sala realmente vacía también empieza vacía, y sin esta bandera
 * el primer snapshot se leería como "acaban de entrar todos".
 */
const hasPresenceSnapshot = ref(false);
const showRoster = ref(false);
const turnStarted = ref<FantasyDraftTurnStarted | null>(null);
const searchPlayerRef = ref<InstanceType<typeof SearchPlayerFantasy> | null>(null);
const toast = useToast();
const { t } = useI18n();
const showDrawer = ref(false);
const drawerRefreshKey = ref(0);
const drawerWidth = ref(0);
const isAutoPick = ref(false);
const isTogglingAutoPick = ref(false);

const isDraftCompleted = computed(
  () => turnStarted.value?.status === "COMPLETED",
);

// If we land on an already-finished draft (e.g. reload), the wishlist is stale.
watch(isDraftCompleted, (completed) => {
  if (completed) draftWishlistStore.clear(props.fantasyLeague.uuid);
});

const isMyTurn = computed(() => {
  if (!turnStarted.value?.user) return false;
  return userStore.getUserData?.uuid === turnStarted.value.user.uuid;
});

// ── Adaptación a los componentes compartidos de la sala ───────────────────
// El board y el card del turno se comparten con el mock draft, así que hablan
// de "participantes" y "picks" en abstracto: aquí se traducen los usuarios de
// la liga y los picks del draft a esas formas.

const picks = ref<FantasyDraftPlayerPicked[]>([]);
const draftResults = ref<DraftResults | null>(null);
const resultsError = ref(false);

const onlineUuids = computed(
  () => new Set(membersDraftRoom.value.map((member) => member.uuid).filter(Boolean)),
);

/**
 * Participantes en el orden del draft. Se derivan de los picks de la primera
 * ronda (que es el orden real), y mientras no haya ninguno se cae a la lista de
 * la liga para que el board no aparezca vacío al arrancar.
 */
const contenders = computed<DraftContender[]>(() => {
  const firstRound = picks.value
    .filter((pick) => pick.round === 1 && pick.user)
    .sort((a, b) => a.pick - b.pick)
    .map((pick) => pick.user as UserDataInterface);

  const source = firstRound.length ? firstRound : (props.fantasyLeague.participants ?? []);

  return source.map((user) => ({
    key: user.uuid ?? "",
    name: [user.firstname, user.lastname].filter(Boolean).join(" ").trim() || t("fantasy.draft.order.userFallback"),
    initials: initialsFrom(user.firstname, user.lastname),
    avatar: user.avatar ?? null,
    isMe: user.uuid === userStore.getUserData?.uuid,
    isOnline: !!user.uuid && onlineUuids.value.has(user.uuid),
  }));
});

const boardPicks = computed<DraftBoardPick[]>(() =>
  picks.value
    // El endpoint devuelve también los huecos del orden (picks todavía sin
    // jugador); para el board esos son casillas libres, no fichajes.
    .filter((pick) => pick.player)
    .map((pick) => ({
      pick: pick.pick,
      round: pick.round,
      pickInRound: contenders.value.length
        ? ((pick.pick - 1) % contenders.value.length) + 1
        : pick.pick,
      contenderKey: pick.user?.uuid ?? "",
      player: pick.player,
      positionCode: normalizePositionCode(pick.player?.position?.developer_name),
      autoPicked: false,
    })),
);

/**
 * Rondas del draft = plazas totales de la formación (se ficha una por ronda).
 * Si aún no hay picks para deducirlo, la formación de la liga es la fuente.
 */
const totalRounds = computed(() => {
  const roundsFromPicks = picks.value.length
    ? Math.max(...picks.value.map((pick) => pick.round))
    : 0;

  const formation = props.fantasyLeague.formation;
  const slots = formation
    ? (formation.goalkeeper?.starter ?? 0) +
      (formation.defender?.starter ?? 0) +
      (formation.midfielder?.starter ?? 0) +
      (formation.attacker?.starter ?? 0) +
      (formation.flex ?? 0) +
      (formation.bench ?? 0)
    : 0;

  return Math.max(roundsFromPicks, slots, 1);
});

const totalPicks = computed(() => totalRounds.value * Math.max(1, contenders.value.length));

const contenderOnTheClock = computed(
  () => contenders.value.find((c) => c.key === turnStarted.value?.user?.uuid) ?? null,
);

/**
 * Momento en que expira el turno actual. En el draft real la referencia es del
 * servidor (`turn_started_at`, epoch en segundos con decimales): hay rivales
 * humanos esperando, así que el reloj no se puede reiniciar en el cliente.
 */
const turnEndsAt = computed(() => {
  const startedAt = turnStarted.value?.turn_started_at;
  const duration = turnStarted.value?.duration_seconds;
  if (!startedAt || !duration) return null;
  return Number(startedAt) * 1000 + Number(duration) * 1000;
});

async function loadPicks() {
  try {
    picks.value = await fantasyLeagueService.getDraftPlayerPicked(props.fantasyLeague.uuid);
  } catch (error) {
    console.error("Error loading draft picks:", error);
  }
}

/** La boleta solo tiene sentido con el draft terminado. */
async function loadResults() {
  resultsError.value = false;
  try {
    draftResults.value = await fantasyLeagueService.getDraftResults(props.fantasyLeague.uuid);
  } catch (error) {
    console.error("Error loading draft results:", error);
    resultsError.value = true;
  }
}

watch(isDraftCompleted, (completed) => {
  if (completed && !draftResults.value) loadResults();
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

// Payload mínimo de presencia: solo lo que el board de la sala realmente pinta.
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
  // El board pudo avanzar mientras estábamos desconectados.
  loadPicks();
}

// Al volver a primer plano (típico en móvil, con la conexión posiblemente aún viva)
// el turno pudo avanzar sin que llegara el turn.started: re-sincronizamos la fuente
// de verdad del backend y el snapshot de presencia.
function handleVisibility() {
  if (document.hidden) return;
  getTurnInfo();
  syncMembersFromPresence();
  loadPicks();
}

let presenceSyncTimeout: ReturnType<typeof setTimeout> | null = null;
/**
 * Repregunta periódica de la presencia.
 *
 * Era lo único de la sala sin red debajo: se leía una vez al montar y después
 * solo cuando llegaba un evento de presencia. Si esa primera lectura corre
 * antes de que el canal termine de sincronizar, o si el evento no llega, la
 * lista de conectados se queda congelada para siempre — y lo que se ve es
 * "estoy yo solo" en una sala llena. El realtime es best-effort por diseño;
 * el snapshot es el que manda.
 */
let presenceHeartbeat: ReturnType<typeof setInterval> | null = null;
const PRESENCE_HEARTBEAT_MS = 20_000;

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

    // Las dos cifras que hacen falta para saber si la presencia funciona:
    // cuántas conexiones ve Ably y en cuántas personas se quedan tras
    // deduplicar por uuid. Si son distintas, alguien tiene la sala abierta dos
    // veces (y esa segunda conexión es la que impide que su reloj baje).
    console.debug(
      `[draft] presencia: ${members?.length ?? 0} conexión(es) -> ${next.length} persona(s)`,
      next.map((u) => u.uuid),
    );

    announcePresenceChange(membersDraftRoom.value, next);
    membersDraftRoom.value = next;
    hasPresenceSnapshot.value = true;
  });
}

/**
 * "Fulano salió de la sala".
 *
 * Dos reglas que parecen detalles y no lo son:
 *
 * - **La primera foto no anuncia nada.** Es la que llega al entrar en la sala;
 *   tratarla como un cambio anunciaría la entrada de los seis que ya estaban
 *   dentro, de golpe, a quien acaba de abrir la pantalla. De ahí
 *   `hasPresenceSnapshot`, que no es lo mismo que "la lista está vacía": una
 *   sala realmente vacía también empieza vacía.
 * - **Uno no se anuncia a sí mismo.** Ni la propia salida (que ya sabes) ni la
 *   propia entrada, que llegaría en el peor momento: justo al abrir la sala.
 *
 * **No dice nada del reloj**, aunque la salida de quien tiene el turno lo
 * acorte: ese número lo decide el servidor y llega en el `turn.started` que
 * viene detrás, con la duración ya calculada. Lo cuenta `announceAbsenceChange`
 * con el dato bueno.
 */
function announcePresenceChange(
  previous: UserDataInterface[],
  next: UserDataInterface[],
) {
  if (!hasPresenceSnapshot.value) return;

  const me = userStore.getUserData?.uuid;
  const before = new Set(previous.map((u) => u.uuid));
  const after = new Set(next.map((u) => u.uuid));
  const mine = (u: UserDataInterface) => !!u.uuid && u.uuid !== me;

  const left = previous.filter((u) => mine(u) && !after.has(u.uuid));
  const joined = next.filter((u) => mine(u) && !before.has(u.uuid));

  const nameOf = (u: UserDataInterface) =>
    `${u.firstname ?? ""} ${u.lastname ?? ""}`.trim() ||
    t("fantasy.draft.order.userFallback");

  // Las salidas primero: es lo único que tiene consecuencia sobre el draft. Si
  // en la misma foto entra alguien y sale alguien, lo que hay que contar es la
  // salida; la lista de la sala enseña el resto.
  if (left.length === 1) {
    toast.info(t("fantasy.draft.presence.userLeft", { name: nameOf(left[0]) }));
  } else if (left.length > 1) {
    toast.info(t("fantasy.draft.presence.usersLeft", { count: left.length }));
  } else if (joined.length === 1) {
    toast.info(t("fantasy.draft.presence.userJoined", { name: nameOf(joined[0]) }));
  } else if (joined.length > 1) {
    toast.info(t("fantasy.draft.presence.usersJoined", { count: joined.length }));
  }
}

/**
 * Quien tiene el turno se fue —o volvió— con su turno ya empezado.
 *
 * Se anuncia aparte de `announcePresenceChange` porque es lo único que explica
 * por qué el reloj que estás mirando acaba de encogerse a la mitad. Los
 * segundos salen del propio `turn.started`, que es quien manda: el cliente no
 * conoce `absent_pick_timer`.
 *
 * Solo dentro del MISMO turno. Con el pick cambiado no es que alguien se haya
 * ido, es que le toca a otro, y eso ya se cuenta solo.
 */
function announceAbsenceChange(
  previous: FantasyDraftTurnStarted | null,
  incoming: FantasyDraftTurnStarted,
) {
  if (!previous?.pick || previous.pick !== incoming.pick) return;
  if (!!previous.absent === !!incoming.absent) return;

  const name =
    `${incoming.user?.firstname ?? ""} ${incoming.user?.lastname ?? ""}`.trim() ||
    t("fantasy.draft.order.userFallback");

  if (incoming.absent && incoming.duration_seconds) {
    toast.info(
      t("fantasy.draft.presence.onTheClockLeft", {
        name,
        seconds: incoming.duration_seconds,
      }),
    );
  } else if (incoming.absent) {
    toast.info(t("fantasy.draft.presence.userLeft", { name }));
  } else {
    toast.info(t("fantasy.draft.presence.onTheClockReturned", { name }));
  }
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
  await loadPicks();
  await fetchAutoPickStatus();
  await subscribeToDraftRoom();
  enterPresence();
  syncMembersFromPresence();
  presenceHeartbeat = setInterval(syncMembersFromPresence, PRESENCE_HEARTBEAT_MS);

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
    announceAbsenceChange(turnStarted.value, data);
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
    // A picked player is no longer draftable — drop it from the wishlist too.
    if (playerSelected.player?.uuid) {
      draftWishlistStore.remove(props.fantasyLeague.uuid, playerSelected.player.uuid);
    }
    drawerRefreshKey.value++;
    const newPick: FantasyDraftPlayerPicked = {
      pick: playerSelected.pick,
      round: playerSelected.round,
      player: playerSelected.player,
      user: playerSelected.user,
    };
    // El board de la sala y el del panel comparten esta lista, así que el pick
    // que llega por Ably actualiza los dos de una vez.
    //
    // Es un upsert, no un push: el endpoint de picks pre-crea una fila por cada
    // turno del orden con `player` en null, así que el hueco de este pick YA
    // está en la lista. Descartarlo por "duplicado" dejaba el board congelado
    // en 0 fichajes hasta recargar la página.
    const index = picks.value.findIndex((p) => p.pick === newPick.pick);
    if (index === -1) {
      picks.value.push(newPick);
    } else {
      picks.value[index] = newPick;
    }
  });

  channel.subscribe("draft.finished", () => {
    // The pre-draft wishlist only lives for the duration of the draft.
    draftWishlistStore.clear(props.fantasyLeague.uuid);
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
  if (presenceHeartbeat) {
    clearInterval(presenceHeartbeat);
    presenceHeartbeat = null;
  }
  document.removeEventListener("visibilitychange", handleVisibility);
  ably.connection.off("connected", handleReconnect);
  ably.connection.off("update", handleReconnect);
  if (channel) {
    // El canal es de una instancia Ably singleton, así que sobrevive al
    // componente: hay que dar de baja TODOS los eventos suscritos o al volver a
    // entrar a la sala se acumulan handlers de instancias muertas (toasts
    // duplicados por pick y picks escritos en un ref que ya nadie pinta).
    channel.unsubscribe("turn.started");
    channel.unsubscribe("turn.skipped");
    channel.unsubscribe("player.selected");
    channel.unsubscribe("draft.finished");
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

/* Keep the sticky draft header on its own compositor layer so it composites as
   one stable texture over the scrolling content below. Without this, the
   browser re-syncs the sticky bar's paint with the scroll offset frame by
   frame, which makes the countdown and the content behind it flicker/ghost.
   Applied to the sticky element itself (not an ancestor), so stickiness is
   preserved. */
.draft-sticky {
  will-change: transform;
  transform: translateZ(0);
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
}
</style>
