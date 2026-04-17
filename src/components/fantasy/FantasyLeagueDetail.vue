<template>
  <div class="space-y-3">
    <!-- Loading State -->
    <div v-if="isLoading" class="flex items-center justify-center py-24">
      <div class="flex flex-col items-center gap-3">
        <v-icon
          name="pr-spinner"
          class="w-6 h-6 text-emerald-500 dark:text-emerald-400"
          animation="spin"
        />
        <p class="text-xs text-gray-400 dark:text-gray-500 font-medium">Loading league...</p>
      </div>
    </div>

    <!-- Error State -->
    <div
      v-else-if="errorMessage"
      class="bg-white dark:bg-gray-800/80 rounded-2xl border border-gray-100 dark:border-gray-700/50 py-16 text-center"
    >
      <div class="w-14 h-14 bg-red-50 dark:bg-red-900/20 rounded-2xl mx-auto mb-4 flex items-center justify-center">
        <v-icon
          name="hi-solid-exclamation"
          class="w-7 h-7 text-red-400"
        />
      </div>
      <p class="text-sm font-medium text-gray-900 dark:text-white mb-1">Something went wrong</p>
      <p class="text-xs text-gray-500 dark:text-gray-400 mb-5 max-w-xs mx-auto">
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
      <!-- ========================================= -->
      <!-- HERO HEADER — FotMob / Apple Sport style  -->
      <!-- ========================================= -->
      <div class="relative rounded-2xl overflow-hidden">
        <!-- Background image or gradient -->
        <div class="relative h-44 sm:h-52">
          <div
            v-if="league.image_path"
            class="absolute inset-0 bg-cover bg-center scale-[1.02]"
            :style="{ backgroundImage: `url(${league.image_path})` }"
          />
          <div
            v-else
            class="absolute inset-0 bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-500"
          />
          <!-- Layered gradient overlays for cinematic depth -->
          <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div class="absolute inset-0 bg-gradient-to-b from-black/25 to-transparent h-20" />

          <!-- Top floating badges -->
          <div class="absolute top-3 left-3 right-3 flex items-center justify-between">
            <span
              class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md bg-white/15 text-white border border-white/20"
            >
              <v-icon
                :name="league.is_private ? 'hi-solid-lock-closed' : 'hi-solid-globe-alt'"
                class="w-2.5 h-2.5"
              />
              {{ league.is_private ? 'Private' : 'Public' }}
            </span>
            <span
              v-if="league.isAdmin"
              class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/90 text-white backdrop-blur-md"
            >
              <v-icon name="hi-solid-star" class="w-2.5 h-2.5" /> Admin
            </span>
            <span
              v-else-if="league.isMember"
              class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/90 text-white backdrop-blur-md"
            >
              <v-icon name="hi-solid-check-circle" class="w-2.5 h-2.5" /> Member
            </span>
          </div>

          <!-- League name & avatar stack overlay -->
          <div class="absolute bottom-0 left-0 right-0 p-4">
            <h1 class="text-xl sm:text-2xl font-extrabold text-white leading-tight tracking-tight hero-text-shadow">
              {{ league.name }}
            </h1>
            <div v-if="league.participants && league.participants.length > 0" class="flex items-center gap-2 mt-2.5">
              <div class="flex -space-x-2">
                <img
                  v-for="(member, idx) in league.participants.slice(0, 5)"
                  :key="member.uuid!"
                  :src="member.avatar || '/img/default-avatar.svg'"
                  :alt="`${member.firstname}`"
                  class="w-6 h-6 rounded-full ring-2 ring-black/30 object-cover"
                  :style="{ zIndex: 5 - idx }"
                  @error="handleImageError"
                />
                <div
                  v-if="(league.members_count || 0) > 5"
                  class="w-6 h-6 rounded-full bg-white/20 backdrop-blur-sm ring-2 ring-black/30 flex items-center justify-center"
                >
                  <span class="text-[9px] font-bold text-white">+{{ (league.members_count || 0) - 5 }}</span>
                </div>
              </div>
              <span class="text-[11px] font-medium text-white/80">
                {{ league.members_count || 0 }} member{{ (league.members_count || 0) !== 1 ? 's' : '' }}
              </span>
            </div>
          </div>
        </div>

        <!-- Join action bar -->
        <div
          v-if="!league.isMember && !league.isAdmin"
          class="bg-white dark:bg-gray-800 px-4 py-3"
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

      <!-- ============================== -->
      <!-- STATS — Three metric cards     -->
      <!-- ============================== -->
      <div class="grid grid-cols-3 gap-2">
        <!-- Members -->
        <div class="bg-white dark:bg-gray-800/80 rounded-xl p-3 border border-gray-100 dark:border-gray-700/40">
          <div class="flex items-center gap-1.5 mb-2">
            <div class="w-5 h-5 rounded-md bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <v-icon name="hi-solid-user-group" class="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            </div>
            <span class="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Members</span>
          </div>
          <div class="flex items-baseline gap-0.5">
            <span class="text-xl font-extrabold text-gray-900 dark:text-white tabular-nums">{{ league.members_count || 0 }}</span>
            <span class="text-xs font-medium text-gray-400 dark:text-gray-500">/{{ league.participants_count }}</span>
          </div>
          <div class="mt-2 h-1 bg-gray-100 dark:bg-gray-700/50 rounded-full overflow-hidden">
            <div
              class="h-full bg-emerald-500 rounded-full transition-all duration-500"
              :style="{ width: `${Math.min(((league.members_count || 0) / (league.participants_count || 1)) * 100, 100)}%` }"
            />
          </div>
        </div>

        <!-- Status -->
        <div class="bg-white dark:bg-gray-800/80 rounded-xl p-3 border border-gray-100 dark:border-gray-700/40">
          <div class="flex items-center gap-1.5 mb-2">
            <div class="w-5 h-5 rounded-md bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <v-icon name="hi-solid-lightning-bolt" class="w-3 h-3 text-blue-600 dark:text-blue-400" />
            </div>
            <span class="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Status</span>
          </div>
          <div class="flex items-center gap-1.5">
            <span class="relative flex h-2 w-2">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span class="text-sm font-bold text-gray-900 dark:text-white">Active</span>
          </div>
        </div>

        <!-- Start Date -->
        <div class="bg-white dark:bg-gray-800/80 rounded-xl p-3 border border-gray-100 dark:border-gray-700/40">
          <div class="flex items-center gap-1.5 mb-2">
            <div class="w-5 h-5 rounded-md bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
              <v-icon name="hi-solid-calendar" class="w-3 h-3 text-orange-600 dark:text-orange-400" />
            </div>
            <span class="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Season</span>
          </div>
          <p class="text-[11px] font-semibold text-gray-900 dark:text-white tabular-nums leading-tight">
            {{ formatDate(league.started_at) }}
          </p>
        </div>
      </div>

      <!-- ============================== -->
      <!-- QUICK ACCESS — Action buttons  -->
      <!-- ============================== -->
      <div
        v-if="league.isMember || league.isAdmin"
        class="grid grid-cols-3 gap-2"
      >
        <button
          @click="navigateToTab('myteam')"
          class="flex flex-col items-center gap-1.5 py-3 px-2 bg-white dark:bg-gray-800/80 rounded-xl border border-gray-100 dark:border-gray-700/40 hover:border-emerald-200 dark:hover:border-emerald-800/40 active:scale-[0.97] transition-all"
        >
          <div class="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
            <v-icon name="hi-solid-user-group" class="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <span class="text-[11px] font-semibold text-gray-700 dark:text-gray-300">My Team</span>
        </button>

        <button
          @click="navigateToTab('statistics')"
          class="flex flex-col items-center gap-1.5 py-3 px-2 bg-white dark:bg-gray-800/80 rounded-xl border border-gray-100 dark:border-gray-700/40 hover:border-orange-200 dark:hover:border-orange-800/40 active:scale-[0.97] transition-all"
        >
          <div class="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
            <v-icon name="hi-solid-chart-bar" class="w-4 h-4 text-orange-600 dark:text-orange-400" />
          </div>
          <span class="text-[11px] font-semibold text-gray-700 dark:text-gray-300">Stats</span>
        </button>

        <button
          @click="navigateToTab('matchups')"
          class="flex flex-col items-center gap-1.5 py-3 px-2 bg-white dark:bg-gray-800/80 rounded-xl border border-gray-100 dark:border-gray-700/40 hover:border-red-200 dark:hover:border-red-800/40 active:scale-[0.97] transition-all"
        >
          <div class="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <v-icon name="gi-crossed-swords" class="w-4 h-4 text-red-600 dark:text-red-400" />
          </div>
          <span class="text-[11px] font-semibold text-gray-700 dark:text-gray-300">Matchups</span>
        </button>
      </div>

      <!-- ============================== -->
      <!-- ABOUT — Description card       -->
      <!-- ============================== -->
      <div
        v-if="league.description"
        class="bg-white dark:bg-gray-800/80 rounded-xl border border-gray-100 dark:border-gray-700/40 overflow-hidden"
      >
        <div class="flex">
          <div class="w-1 bg-emerald-500 shrink-0" />
          <div class="px-4 py-3">
            <h3 class="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5">About</h3>
            <p class="text-[13px] text-gray-600 dark:text-gray-400 leading-relaxed">
              {{ league.description }}
            </p>
          </div>
        </div>
      </div>

      <!-- ============================== -->
      <!-- PARTICIPANTS — Avatar grid      -->
      <!-- ============================== -->
      <div class="bg-white dark:bg-gray-800/80 rounded-xl border border-gray-100 dark:border-gray-700/40">
        <div class="px-4 py-3">
          <!-- Header with count badge -->
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-2">
              <v-icon name="hi-solid-users" class="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
              <h3 class="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Participants</h3>
            </div>
            <span class="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-full">
              {{ league.members_count || 0 }}/{{ league.participants_count }}
            </span>
          </div>

          <!-- Participant grid cards -->
          <div
            v-if="league.participants && league.participants.length > 0"
            class="grid grid-cols-3 sm:grid-cols-4 gap-2"
          >
            <TransitionGroup name="participant-join">
              <div
                v-for="(member, index) in league.participants"
                :key="member.uuid!"
                class="relative flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl bg-gray-50 dark:bg-gray-700/30 border border-gray-100 dark:border-gray-700/30 hover:border-emerald-200 dark:hover:border-emerald-800/40 transition-colors"
              >
                <!-- Position badge -->
                <span class="absolute top-1.5 left-1.5 text-[9px] font-bold text-gray-300 dark:text-gray-600 tabular-nums">
                  {{ index + 1 }}
                </span>
                <!-- Admin crown -->
                <span
                  v-if="index === 0"
                  class="absolute -top-1 right-1.5"
                >
                  <v-icon name="hi-solid-star" class="w-3.5 h-3.5 text-amber-400 drop-shadow-sm" />
                </span>
                <!-- Avatar -->
                <div class="relative">
                  <img
                    :src="member.avatar || '/img/default-avatar.svg'"
                    :alt="`${member.firstname} ${member.lastname}`"
                    class="w-12 h-12 rounded-full object-cover ring-2 ring-white dark:ring-gray-700 shadow-sm"
                    @error="handleImageError"
                  />
                  <!-- Online-style dot -->
                  <span class="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-gray-700" />
                </div>
                <!-- Name -->
                <p class="text-[11px] font-semibold text-gray-900 dark:text-white text-center truncate w-full leading-tight">
                  {{ member.firstname }}
                </p>
                <p class="text-[9px] text-gray-400 dark:text-gray-500 text-center truncate w-full -mt-0.5">
                  {{ member.lastname }}
                </p>
              </div>
            </TransitionGroup>

            <!-- Empty slot placeholders -->
            <div
              v-for="n in Math.max(0, (league.participants_count || 0) - (league.participants?.length || 0))"
              :key="`empty-${n}`"
              class="flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700/50"
            >
              <div class="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700/40 flex items-center justify-center">
                <v-icon name="hi-solid-user-add" class="w-5 h-5 text-gray-300 dark:text-gray-600" />
              </div>
              <p class="text-[10px] font-medium text-gray-300 dark:text-gray-600">Open</p>
            </div>
          </div>

          <!-- Empty state -->
          <div v-else class="py-8 text-center">
            <div class="w-12 h-12 bg-gray-100 dark:bg-gray-700/50 rounded-full mx-auto mb-3 flex items-center justify-center">
              <v-icon name="hi-solid-user-group" class="w-5 h-5 text-gray-300 dark:text-gray-600" />
            </div>
            <p class="text-xs font-medium text-gray-400 dark:text-gray-500">
              No participants yet
            </p>
          </div>
        </div>
      </div>

      <!-- ============================== -->
      <!-- DRAFT CARD — Prominent section  -->
      <!-- ============================== -->
      <div
        v-if="league.draft"
        class="bg-white dark:bg-gray-800/80 rounded-xl border border-gray-100 dark:border-gray-700/40 overflow-hidden"
      >
        <!-- Accent top bar -->
        <div class="h-1 bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500" />

        <div class="px-4 py-3">
          <!-- Header with status pill -->
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-2">
              <v-icon name="gi-soccer-ball" class="w-4 h-4 text-orange-500 dark:text-orange-400" />
              <h3 class="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Draft</h3>
            </div>
            <span
              :class="[
                'text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider',
                draftStatusValue === 'ACTIVE'
                  ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'
                  : draftStatusValue === 'COMPLETED'
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                    : 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400'
              ]"
            >
              {{ draftStatusValue || 'Pending' }}
            </span>
          </div>

          <!-- Draft details -->
          <div class="space-y-2.5">
            <div class="flex justify-between items-center">
              <span class="text-xs text-gray-400 dark:text-gray-500">Date</span>
              <span class="text-xs font-semibold text-gray-900 dark:text-white tabular-nums">
                {{ formatDate(league.draft.draft_day) }}
              </span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-xs text-gray-400 dark:text-gray-500">Pick Timer</span>
              <span class="text-xs font-semibold text-gray-900 dark:text-white tabular-nums">
                {{ league.draft.pick_timer }}s
              </span>
            </div>

            <!-- Action buttons -->
            <div class="pt-2 space-y-2">
              <!-- Activate Draft (admin only, when not active/completed) -->
              <ButtonComponent
                v-if="league.isAdmin && draftStatusValue !== 'ACTIVE' && draftStatusValue !== 'COMPLETED'"
                variant="outline"
                size="sm"
                :text="isActivatingDraft ? 'Activating...' : 'Activate Draft'"
                class="w-full"
                :disabled="isActivatingDraft"
                @click="handleActivateDraft"
              />
              <!-- Enter Draft Room -->
              <ButtonComponent
                v-if="draftStatusValue !== 'COMPLETED'"
                variant="primary"
                size="sm"
                text="Enter Draft Room"
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
import type { UserDataInterface } from "@/interfaces/user/userInterface";
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
const { fantasyLeagueChannel } = useAblyBroadcast();

// State
const league = ref<FantasyLeaguesResponse | null>(null);
const isLoading = ref(true);
const errorMessage = ref<string>("");
const showJoinModal = ref(false);
const showCreateTeamModal = ref(false);
const isJoining = ref(false);
const isActivatingDraft = ref(false);
const isDraftActivatedViaAbly = ref(false);


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

const navigateToTab = (tab: string) => {
  router.replace({
    name: "fantasyLeagueDetail",
    params: { uuid: props.uuid },
    query: { tab },
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

let leagueChannel: ReturnType<typeof fantasyLeagueChannel> | null = null;

function subscribeToLeagueChannel() {
  unsubscribeFromLeagueChannel();
  if (!props.uuid) return;
  leagueChannel = fantasyLeagueChannel(props.uuid);
  leagueChannel.subscribe("league.joined", (message) => {
    const user = message.data as UserDataInterface;
    if (!user?.uuid) return;
    // Update both local ref and shared store
    if (league.value) {
      const alreadyExists = league.value.participants?.some(
        (p) => p.uuid === user.uuid
      );
      if (!alreadyExists) {
        league.value = {
          ...league.value,
          participants: [...(league.value.participants ?? []), user],
          members_count: (league.value.members_count ?? 0) + 1,
        };
        leagueDetailStore.setCurrentLeague(league.value);
      }
    }
  });
}

function unsubscribeFromLeagueChannel() {
  if (leagueChannel) {
    leagueChannel.unsubscribe();
    leagueChannel.detach();
    leagueChannel = null;
  }
}

// Lifecycle
onMounted(() => {
  fetchLeague();
  subscribeToLeagueChannel();
});
onUnmounted(() => {
  unsubscribeFromLeagueChannel();
});

watch(
  () => props.uuid,
  () => {
    
    fetchLeague();
    isDraftActivatedViaAbly.value = false;
    subscribeToLeagueChannel();
  },
);
</script>

<style scoped>
.tabular-nums {
  font-variant-numeric: tabular-nums;
}

.hero-text-shadow {
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.4), 0 1px 2px rgba(0, 0, 0, 0.3);
}

/* Participant join animation — fade + slide up */
.participant-join-enter-active {
  transition: all 0.5s cubic-bezier(0.25, 1, 0.5, 1);
}
.participant-join-leave-active {
  transition: all 0.3s cubic-bezier(0.25, 1, 0.5, 1);
}
.participant-join-enter-from {
  opacity: 0;
  transform: translateY(12px) scale(0.96);
}
.participant-join-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.96);
}
.participant-join-move {
  transition: transform 0.4s cubic-bezier(0.25, 1, 0.5, 1);
}

/* Accessibility: Respect user's motion preferences */
@media (prefers-reduced-motion: reduce) {
  * {
    transition: none !important;
    animation: none !important;
  }
}
</style>
