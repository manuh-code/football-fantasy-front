<template>
  <div class="space-y-4">
    <!-- Loading State -->
    <div v-if="isLoading" class="flex items-center justify-center py-20">
      <v-icon
        name="pr-spinner"
        class="w-5 h-5 text-gray-300 dark:text-gray-600"
        animation="spin"
      />
    </div>

    <!-- Error State -->
    <div
      v-else-if="errorMessage"
      class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 py-16 text-center"
    >
      <v-icon
        name="hi-solid-exclamation"
        class="w-8 h-8 text-red-400 mx-auto mb-3"
      />
      <p class="text-[13px] text-red-500 dark:text-red-400 mb-4">
        {{ errorMessage }}
      </p>
      <ButtonComponent
        variant="outline"
        size="sm"
        text="Try Again"
        @click="fetchLeague"
      />
    </div>

    <!-- League Content -->
    <template v-else-if="league">
      <!-- League Header Card — compact Apple Sports style -->
      <div
        class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 overflow-hidden"
      >
        <!-- Hero with gradient -->
        <div class="relative h-28 sm:h-32">
          <div
            v-if="league.image_path"
            class="absolute inset-0 bg-cover bg-center"
            :style="{ backgroundImage: `url(${league.image_path})` }"
          ></div>
          <div
            v-else
            class="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-600"
          ></div>
          <div
            class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"
          ></div>

          <!-- League Name Overlay -->
          <div class="absolute bottom-0 left-0 right-0 px-4 pb-3">
            <h1
              class="text-[18px] sm:text-[20px] font-bold text-white leading-tight drop-shadow-lg"
            >
              {{ league.name }}
            </h1>
            <div class="flex items-center gap-2 mt-1.5">
              <span
                v-if="league.is_private"
                class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/20 backdrop-blur-sm text-white border border-white/20"
              >
                <v-icon name="hi-solid-lock-closed" class="w-2.5 h-2.5" />
                Private
              </span>
              <span
                v-else
                class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/20 backdrop-blur-sm text-white border border-white/20"
              >
                <v-icon name="hi-solid-globe-alt" class="w-2.5 h-2.5" /> Public
              </span>
              <span
                v-if="league.isAdmin"
                class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-yellow-500/80 backdrop-blur-sm text-white"
              >
                <v-icon name="hi-solid-star" class="w-2.5 h-2.5" /> Admin
              </span>
              <span
                v-else-if="league.isMember"
                class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/80 backdrop-blur-sm text-white"
              >
                <v-icon name="hi-solid-user" class="w-2.5 h-2.5" /> Member
              </span>
            </div>
          </div>
        </div>

        <!-- Quick action row -->
        <div
          v-if="!league.isMember && !league.isAdmin"
          class="px-4 py-3 border-t border-gray-100 dark:border-gray-700/60"
        >
          <ButtonComponent
            variant="primary"
            size="sm"
            :text="league.is_private ? 'Request to Join' : 'Join League'"
            class="w-full"
            @click="handleJoinLeague"
          />
        </div>
      </div>

      <!-- Stats Row — compact horizontal -->
      <div
        class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 px-4 py-3"
      >
        <div
          class="grid grid-cols-3 divide-x divide-gray-100 dark:divide-gray-700/60"
        >
          <div class="text-center px-2">
            <p
              class="text-[18px] font-bold text-gray-900 dark:text-white tabular-nums"
            >
              {{ league.members_count || 0
              }}<span class="text-[13px] font-normal text-gray-400"
                >/{{ league.participants_count }}</span
              >
            </p>
            <p
              class="text-[10px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide mt-0.5"
            >
              Members
            </p>
          </div>
          <div class="text-center px-2">
            <p class="text-[18px] font-bold text-gray-900 dark:text-white">
              <span class="inline-flex items-center gap-1">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Active
              </span>
            </p>
            <p
              class="text-[10px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide mt-0.5"
            >
              Status
            </p>
          </div>
          <div class="text-center px-2">
            <p
              class="text-[13px] font-semibold text-gray-900 dark:text-white tabular-nums"
            >
              {{ formatDate(league.started_at) }}
            </p>
            <p
              class="text-[10px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide mt-0.5"
            >
              Start Date
            </p>
          </div>
        </div>
      </div>

      <!-- Description Card -->
      <div
        v-if="league.description"
        class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60"
      >
        <div class="px-4 py-3">
          <div class="flex items-center gap-2 mb-2">
            <v-icon
              name="hi-solid-information-circle"
              class="w-[16px] h-[16px] text-blue-400 shrink-0"
            />
            <h3 class="text-[13px] font-semibold text-gray-900 dark:text-white">
              About
            </h3>
          </div>
          <p
            class="text-[13px] text-gray-600 dark:text-gray-400 leading-relaxed"
          >
            {{ league.description }}
          </p>
        </div>
      </div>

      <!-- Participants Card -->
      <div
        class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60"
      >
        <div class="px-4 py-3">
          <div class="flex items-center gap-2 mb-3">
            <v-icon
              name="hi-solid-user-group"
              class="w-[16px] h-[16px] text-emerald-500 dark:text-emerald-400 shrink-0"
            />
            <h3 class="text-[13px] font-semibold text-gray-900 dark:text-white">
              Participants
            </h3>
            <span class="text-[11px] text-gray-400 dark:text-gray-500"
              >{{ league.members_count || 0 }} of
              {{ league.participants_count }}</span
            >
          </div>
          <div
            v-if="league.participants && league.participants.length > 0"
            class="space-y-1.5"
          >
            <div
              v-for="member in league.participants"
              :key="member.uuid"
              class="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
            >
              <img
                :src="member.avatar || '/img/default-avatar.svg'"
                :alt="`${member.firstname} ${member.lastname}`"
                class="w-8 h-8 rounded-full object-cover ring-1 ring-gray-100 dark:ring-gray-700"
                @error="handleImageError"
              />
              <div class="flex-1 min-w-0">
                <p
                  class="text-[13px] font-medium text-gray-900 dark:text-white truncate"
                >
                  {{ member.firstname }} {{ member.lastname }}
                </p>
              </div>
            </div>
          </div>
          <div v-else class="py-6 text-center">
            <v-icon
              name="hi-solid-user-group"
              class="w-6 h-6 text-gray-200 dark:text-gray-700 mx-auto mb-2"
            />
            <p class="text-[13px] text-gray-400 dark:text-gray-500">
              No participants yet
            </p>
          </div>
        </div>
      </div>

      <!-- Draft Card -->
      <div
        v-if="league.draft"
        class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60"
      >
        <div class="px-4 py-3">
          <div class="flex items-center gap-2 mb-3">
            <v-icon
              name="hi-solid-calendar"
              class="w-[16px] h-[16px] text-orange-500 dark:text-orange-400 shrink-0"
            />
            <h3 class="text-[13px] font-semibold text-gray-900 dark:text-white">
              Draft
            </h3>
          </div>
          <div class="space-y-2.5">
            <div class="flex justify-between items-center">
              <span class="text-[12px] text-gray-400 dark:text-gray-500"
                >Date</span
              >
              <span
                class="text-[12px] font-medium text-gray-900 dark:text-white tabular-nums"
                >{{ formatDate(league.draft.draft_day) }}</span
              >
            </div>
            <div class="flex justify-between items-center">
              <span class="text-[12px] text-gray-400 dark:text-gray-500"
                >Pick Timer</span
              >
              <span
                class="text-[12px] font-medium text-gray-900 dark:text-white tabular-nums"
                >{{ league.draft.pick_time }}s</span
              >
            </div>
            <div class="flex justify-between items-center">
              <span class="text-[12px] text-gray-400 dark:text-gray-500"
                >Status</span
              >
              <span
                class="text-[12px] font-medium text-gray-900 dark:text-white"
                >{{ league.draft.status?.name || "Not Started" }}</span
              >
            </div>

            <!-- Activate Draft -->
            <div
              v-if="
                league.isAdmin &&
                draftStatusValue === 'NOT_STARTED' &&
                league.members_count === league.participants_count
              "
              class="pt-2"
            >
              <ButtonComponent
                variant="primary"
                size="sm"
                :text="isActivatingDraft ? 'Activating...' : 'Activate Draft'"
                :disabled="isActivatingDraft"
                class="w-full"
                @click="handleActivateDraft"
              />
            </div>

            <!-- Enter Draft -->
            <div v-if="draftStatusValue === 'ACTIVE'" class="pt-2">
              <ButtonComponent
                variant="primary"
                size="sm"
                text="Enter Draft"
                class="w-full"
                @click="goToDraft"
              />
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Join League Modal -->
    <JoinLeagueModal
      :is-visible="showJoinModal"
      :league="league"
      :is-loading="isJoining"
      :password-error="passwordError"
      @close="closeJoinModal"
      @join="joinLeague"
    />

    <!-- Create Team Invitation Modal -->
    <CreateTeamModal
      :is-visible="showCreateTeamModal"
      @close="showCreateTeamModal = false"
      @create="goToCreateTeam"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { useToast } from "@/composables/useToast";
import { useValidationStore } from "@/store/validation/useValidationStore";
import { useFantasyLeagueDetailStore } from "@/store/fantasy/useFantasyLeagueDetailStore";
import { ButtonComponent } from "@/components/ui";
import JoinLeagueModal from "@/components/fantasy/JoinLeagueModal.vue";
import CreateTeamModal from "@/components/fantasy/team/CreateTeamModal.vue";
import { fantasyLeagueService } from "@/services/fantasy/leagues/FantasyLeagueService";
import type { FantasyLeaguesResponse } from "@/interfaces/fantasy/leagues/FantasyLeaguesResponse";
import { useAblyBroadcast } from "@/composables/broadcast/useAblyBroadcast";

// Props
interface Props {
  uuid: string;
}

const props = defineProps<Props>();

// Composables
const router = useRouter();
const toast = useToast();
const validationStore = useValidationStore();
const leagueDetailStore = useFantasyLeagueDetailStore();
const { draftFantasyLeagueChannel } = useAblyBroadcast();

// State
const league = ref<FantasyLeaguesResponse | null>(null);
const isLoading = ref(true);
const errorMessage = ref<string>("");
const showJoinModal = ref(false);
const showCreateTeamModal = ref(false);
const isJoining = ref(false);
const isActivatingDraft = ref(false);
const isDraftActivatedViaAbly = ref(false);

let ablyChannel: ReturnType<typeof draftFantasyLeagueChannel> | null = null;

// Show create team modal based on API response
watch(
  () => league.value?.show_create_team,
  (value) => {
    showCreateTeamModal.value = value === true;
  },
);

// Get password error from validation store
const passwordError = computed(() => {
  const passwordErrors = validationStore.getFieldError("password");
  return passwordErrors.length > 0 ? passwordErrors[0] : "";
});

const draftStatusValue = computed(() => {
  if (isDraftActivatedViaAbly.value) return "ACTIVE";
  return (league.value?.draft?.status?.value || "").toUpperCase();
});

// Methods
const fetchLeague = async () => {
  if (!props.uuid) {
    errorMessage.value = "League UUID is required";
    isLoading.value = false;
    return;
  }

  isLoading.value = true;
  errorMessage.value = "";

  try {
    league.value = await fantasyLeagueService.showFantasyLeague(props.uuid);
    leagueDetailStore.setCurrentLeague(league.value);
  } catch (error) {
    console.error("Error loading league details:", error);
    errorMessage.value =
      "Failed to load league details. Please try again later.";
  } finally {
    isLoading.value = false;
  }
};

const goToDraft = () => {
  router.push({
    name: "playersToDraft",
    params: { uuid: props.uuid },
  });
};

const goToCreateTeam = () => {
  showCreateTeamModal.value = false;
  router.push({
    name: "fantasyTeamCreate",
    params: { uuid: props.uuid },
  });
};

const formatDate = (dateString: string) => {
  if (!dateString) return "N/A";
  try {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateString));
  } catch {
    return dateString;
  }
};

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  // Evitar ciclo infinito: solo cambiar si no se ha intentado ya con la imagen por defecto
  if (!img.dataset.fallbackUsed) {
    img.dataset.fallbackUsed = "true";
    img.src = "/img/default-avatar.svg";
  }
};

const manageLeague = () => {
  toast.info("Coming Soon", "League management page is under development!");
};

const handleActivateDraft = async () => {
  if (!league.value) return;
  try {
    isActivatingDraft.value = true;
    await fantasyLeagueService.activateDraft(league.value.uuid);
    toast.success(
      "Draft Activated",
      "The draft has been activated successfully.",
    );
    await fetchLeague();
  } catch (error) {
    console.error("Error activating draft:", error);
  } finally {
    isActivatingDraft.value = false;
  }
};

const handleJoinLeague = () => {
  if (!league.value) return;

  // Clear any previous password errors
  validationStore.clearFieldError("password");

  // If league is public, join directly without modal
  if (!league.value.is_private) {
    joinLeague({ league: league.value });
  } else {
    // If league is private, show modal to request password
    showJoinModal.value = true;
  }
};

const joinLeague = async (joinData: {
  league: FantasyLeaguesResponse;
  password?: string;
}) => {
  try {
    isJoining.value = true;
    validationStore.clearFieldError("password");
    const { league: leagueToJoin, password } = joinData;

    // Prepare payload for the API
    const payload = {
      fantasy_league_uuid: leagueToJoin.uuid,
      password: leagueToJoin.is_private ? password || null : null,
    };

    // Call the API to join the league
    await fantasyLeagueService.joinFantasyLeague(payload, leagueToJoin.uuid);

    toast.success(
      "Success",
      `Successfully ${leagueToJoin.is_private ? "requested to join" : "joined"} "${leagueToJoin.name}"`,
    );
    showJoinModal.value = false;

    // Refresh the league data to update member status
    await fetchLeague();
  } catch (error) {
    console.error("Error joining league:", error);

    // The interceptor in useApiFantasy already handles 422 errors and stores them in the validation store
    // For non-422 errors, close the modal and let the interceptor show the toast
    if (
      error &&
      typeof error === "object" &&
      "status" in error &&
      error.status !== 422
    ) {
      showJoinModal.value = false;
    }
    // If it's a 422 error, the modal stays open and shows the validation error from the store
  } finally {
    isJoining.value = false;
  }
};

const closeJoinModal = () => {
  showJoinModal.value = false;
  validationStore.clearFieldError("password");
};

function subscribeToAblyDraftChannel() {
  if (!props.uuid) return;

  ablyChannel = draftFantasyLeagueChannel(props.uuid);

  ablyChannel.subscribe("draft.activated", (msg: { data: unknown }) => {
    const payload = msg.data as { league_uuid: string; initial_turn: any };

    console.log("🔔 Draft activated via Ably:", payload);

    // Marcar que el draft fue activado
    isDraftActivatedViaAbly.value = true;

    // Mostrar toast de notificación
    toast.success(
      "¡Draft Activado!",
      `El draft de "${league.value?.name}" ha comenzado. ¡Entra ahora!`,
    );
  });
}

function unsubscribeFromAblyDraftChannel() {
  if (ablyChannel) {
    ablyChannel.unsubscribe("draft.activated");
    ablyChannel = null;
  }
}

// Lifecycle
onMounted(() => {
  fetchLeague();
  subscribeToAblyDraftChannel();
});
onUnmounted(() => {
  unsubscribeFromAblyDraftChannel();
});

watch(
  () => props.uuid,
  () => {
    unsubscribeFromAblyDraftChannel();
    fetchLeague();
    isDraftActivatedViaAbly.value = false;
    subscribeToAblyDraftChannel();
  },
);
</script>

<style scoped>
.tabular-nums {
  font-variant-numeric: tabular-nums;
}

/* Accessibility: Respect user's motion preferences */
@media (prefers-reduced-motion: reduce) {
  * {
    transition: none !important;
    animation: none !important;
  }
}
</style>
