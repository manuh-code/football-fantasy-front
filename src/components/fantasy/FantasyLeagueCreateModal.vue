<template>
  <BottomSheet
    :is-visible="isVisible"
    :title="$t('fantasy.leagueCreate.title')"
    :subtitle="$t('fantasy.leagueCreate.subtitle')"
    icon="bi-trophy-fill"
    icon-variant="emerald"
    size="auto"
    :dismissible="!isLoading"
    @close="close"
  >
    <div class="space-y-4">
      <!-- Name -->
      <FormInput
        id="fantasy-league-name"
        v-model="name"
        type="text"
        :label="$t('fantasy.leagueCreate.name.label')"
        icon="bi-trophy-fill"
        :placeholder="$t('fantasy.leagueCreate.name.placeholder')"
        :error="fieldError('name')"
        :disabled="isLoading"
      />

      <!-- League — pick which football league this fantasy league belongs to.
           The list lives in its own sheet so it never pushes the rest of the
           form off-screen. -->
      <div class="flex flex-col gap-1.5">
        <label class="text-sm font-semibold text-gray-700 dark:text-gray-300">{{ $t('fantasy.leagueCreate.league.label') }}</label>

        <button
          type="button"
          :disabled="isLoading"
          aria-haspopup="dialog"
          :aria-expanded="isLeaguePickerOpen"
          @click="isLeaguePickerOpen = true"
          class="flex items-center gap-3 min-h-[44px] bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3.5 text-left transition-colors active:bg-gray-100 dark:active:bg-gray-800 disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40"
        >
          <img
            v-if="selectedLeague"
            :src="selectedLeague.image_path || '/img/default-avatar.svg'"
            :alt="selectedLeague.name"
            class="w-9 h-9 object-contain shrink-0"
            @error="onLeagueLogoError"
          />
          <div v-else class="w-9 h-9 rounded-xl bg-gray-200 dark:bg-gray-700 flex items-center justify-center shrink-0">
            <v-icon name="hi-solid-globe-alt" class="w-4 h-4 text-gray-400" />
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-semibold text-gray-900 dark:text-white truncate">
              {{ selectedLeague?.name || $t('fantasy.leagueCreate.league.pick') }}
            </p>
            <p class="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{{ $t('fantasy.leagueCreate.league.change') }}</p>
          </div>
          <v-icon name="hi-solid-chevron-right" class="w-4 h-4 text-gray-400 dark:text-gray-500 shrink-0" />
        </button>
        <span v-if="fieldError('league_uuid')" class="text-xs text-red-600 dark:text-red-400">{{ fieldError('league_uuid') }}</span>
      </div>

      <!-- Participants — options resolved for the selected league -->
      <div class="flex flex-col gap-1.5">
        <label class="text-sm font-semibold text-gray-700 dark:text-gray-300">{{ $t('fantasy.leagueCreate.participants.label') }}</label>

        <!-- Loading -->
        <div v-if="loadingOptions" class="flex items-center gap-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3.5">
          <div class="w-9 h-9 rounded-xl bg-gray-200 dark:bg-gray-700 animate-pulse shrink-0" />
          <div class="flex-1 space-y-1.5">
            <div class="h-3 w-32 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
            <div class="h-2.5 w-24 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
          </div>
        </div>

        <!-- Fixed value: only one option available for this league -->
        <div v-else-if="isFixedParticipants" class="flex items-center gap-2 bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3.5">
          <v-icon name="hi-solid-user-group" class="w-4 h-4 text-emerald-500 shrink-0" />
          <span class="text-sm font-semibold text-gray-900 dark:text-white">{{ participantsCount }}</span>
          <span class="text-xs text-gray-500 dark:text-gray-400">{{ $t('fantasy.leagueCreate.participants.unit') }}</span>
          <span class="ml-auto text-2xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full">
            {{ $t('fantasy.leagueCreate.participants.fixed') }}
          </span>
        </div>

        <!-- Multiple options: segmented chips (at most min / mid / max) -->
        <div v-else-if="participantOptions.length > 0" class="flex gap-2">
          <button
            v-for="option in participantOptions"
            :key="option.value"
            type="button"
            :disabled="isLoading"
            @click="participantsCount = option.value"
            class="flex-1 flex flex-col items-center gap-0.5 py-2.5 rounded-xl border-[1.5px] transition-colors disabled:opacity-60"
            :class="participantsCount === option.value
              ? 'border-emerald-600 bg-emerald-50/60 dark:bg-emerald-900/10 text-emerald-700 dark:text-emerald-400'
              : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 active:bg-gray-100 dark:active:bg-gray-700/60'"
          >
            <span class="text-sm font-bold tabular-nums">{{ option.value }}</span>
            <span class="text-2xs font-medium">{{ option.tag }}</span>
          </button>
        </div>

        <!-- Failed to resolve options -->
        <div v-else class="flex items-center gap-2 bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3.5">
          <v-icon name="hi-solid-exclamation" class="w-4 h-4 text-amber-500 shrink-0" />
          <p class="text-xs text-amber-600 dark:text-amber-400">
            {{ $t('fantasy.leagueCreate.participants.noOptions') }}
          </p>
        </div>

        <span v-if="fieldError('participants_count')" class="text-xs text-red-600 dark:text-red-400">{{ fieldError('participants_count') }}</span>
      </div>

      <!-- Champion mode — table leader vs. a knockout bracket -->
      <div class="flex flex-col gap-1.5">
        <label class="text-sm font-semibold text-gray-700 dark:text-gray-300">{{ $t('fantasy.leagueCreate.champion.label') }}</label>

        <div class="grid grid-cols-2 gap-2">
          <button
            v-for="mode in championModes"
            :key="mode.value"
            type="button"
            :disabled="isLoading || mode.disabled"
            @click="championMode = mode.value"
            class="flex flex-col gap-1 p-3 rounded-xl border-[1.5px] text-left transition-colors disabled:opacity-50"
            :class="championMode === mode.value
              ? 'border-emerald-600 bg-emerald-50/60 dark:bg-emerald-900/10'
              : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 active:bg-gray-100 dark:active:bg-gray-700/60'"
          >
            <span class="flex items-center gap-1.5">
              <v-icon
                :name="mode.icon"
                class="w-3.5 h-3.5 shrink-0"
                :class="championMode === mode.value ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400 dark:text-gray-500'"
              />
              <span
                class="text-xs font-bold"
                :class="championMode === mode.value ? 'text-emerald-700 dark:text-emerald-400' : 'text-gray-700 dark:text-gray-200'"
              >{{ mode.title }}</span>
            </span>
            <span class="text-2xs leading-snug text-gray-500 dark:text-gray-400">{{ mode.description }}</span>
          </button>
        </div>

        <!-- Not enough matchdays left for a bracket at this participant count -->
        <p v-if="playoffOptions.length === 0 && participantsCount" class="text-2xs text-amber-600 dark:text-amber-400">
          {{ $t('fantasy.leagueCreate.champion.unavailable', { count: participantsCount }) }}
        </p>
      </div>

      <!-- Playoff spots — only meaningful once the bracket mode is picked -->
      <div v-if="championMode === 'playoffs' && playoffOptions.length > 0" class="flex flex-col gap-1.5">
        <label class="text-sm font-semibold text-gray-700 dark:text-gray-300">{{ $t('fantasy.leagueCreate.champion.qualified.label') }}</label>

        <div class="flex gap-2">
          <button
            v-for="option in playoffOptions"
            :key="`po-${option}`"
            type="button"
            :disabled="isLoading"
            @click="playoffTeams = option"
            class="flex-1 flex flex-col items-center gap-0.5 py-2.5 rounded-xl border-[1.5px] transition-colors disabled:opacity-60"
            :class="playoffTeams === option
              ? 'border-emerald-600 bg-emerald-50/60 dark:bg-emerald-900/10 text-emerald-700 dark:text-emerald-400'
              : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 active:bg-gray-100 dark:active:bg-gray-700/60'"
          >
            <span class="text-sm font-bold tabular-nums">{{ option }}</span>
            <span class="text-2xs font-medium">
              {{ option === defaultPlayoffTeams ? $t('fantasy.leagueCreate.champion.qualified.recommended') : $t('fantasy.leagueCreate.champion.qualified.unit') }}
            </span>
          </button>
        </div>

        <p class="text-2xs text-gray-400 dark:text-gray-500">
          {{ $t('fantasy.leagueCreate.champion.qualified.hint', { rounds: bracketMatchdays }) }}
        </p>
        <span v-if="fieldError('playoff_teams')" class="text-xs text-red-600 dark:text-red-400">{{ fieldError('playoff_teams') }}</span>
      </div>
    </div>

    <template #footer>
      <div class="flex gap-3">
        <button
          @click="close"
          :disabled="isLoading"
          class="flex-1 py-3 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 active:scale-[0.98] transition-all disabled:opacity-50"
        >
          {{ $t('common.actions.cancel') }}
        </button>
        <button
          @click="handleCreate"
          :disabled="isLoading || !canSubmit"
          class="flex-1 py-3 rounded-xl text-sm font-semibold text-white bg-emerald-600 active:scale-[0.98] shadow-sm shadow-emerald-500/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <div v-if="isLoading" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          <v-icon v-else name="hi-solid-plus-circle" class="w-4 h-4" />
          {{ $t('fantasy.leagueCreate.submit') }}
        </button>
      </div>
    </template>
  </BottomSheet>

  <!-- Cambio de liga, apilado sobre este formulario. -->
  <LeaguePickerSheet
    :is-visible="isLeaguePickerOpen"
    :selected-uuid="selectedLeague?.uuid"
    :premium-feature="PREMIUM_FEATURES.fantasyPremiumLeagues"
    @close="isLeaguePickerOpen = false"
    @select="chooseLeague"
  />
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import BottomSheet from "@/components/ui/BottomSheet.vue";
import LeaguePickerSheet from "@/components/football/leagues/LeaguePickerSheet.vue";
import { PREMIUM_FEATURES } from "@/interfaces/user/billing/EntitlementsResponse";
import { FormInput } from "@/components/ui";
import { fantasyLeagueService } from "@/services/fantasy/leagues/FantasyLeagueService";
import { useFootballLeagueStore } from "@/store/football/league/useFootballLeagueStore";
import { useValidationStore } from "@/store/validation/useValidationStore";
import type { FantasyLeagueCreatePayload } from "@/interfaces/fantasy/leagues/FantasyLeagueCreatePayload";
import type { FantasyLeaguesResponse } from "@/interfaces/fantasy/leagues/FantasyLeaguesResponse";
import type { FantasyPlayoffOption } from "@/interfaces/fantasy/leagues/FantasyParticipanCountResponse";
import type { FantasyChampionMode } from "@/interfaces/fantasy/playoffs/FantasyPlayoffBracketResponse";
import type { FootballLeagueResponse } from "@/interfaces/football/league/FootballLeagueResponse";

const props = withDefaults(defineProps<{ isVisible?: boolean }>(), {
  isVisible: false,
});

const emit = defineEmits<{
  close: [];
  created: [league: FantasyLeaguesResponse];
}>();

const { t } = useI18n();
const validationStore = useValidationStore();
const footballLeagueStore = useFootballLeagueStore();

// Form state
const name = ref("");
const isLoading = ref(false);

// League selection. Defaults to the app's current league, but the user can pick
// another one here without touching the global league selection — the fantasy
// league is simply created for whichever league is chosen. Changing it
// re-resolves the participant options.
const selectedLeague = ref<FootballLeagueResponse | null>(null);
const isLeaguePickerOpen = ref(false);

// Participant count options come from the API per league: min / mid / max,
// collapsed to a single fixed value when they all match.
const participantsCount = ref<number | null>(null);
const participantOptions = ref<{ value: number; tag: string }[]>([]);
const isFixedParticipants = ref(false);
const loadingOptions = ref(false);

// Champion mode. The bracket runs on the tournament's last matchdays, so which
// spot counts are possible depends on how many matchdays the regular season
// leaves free — that varies per league (Liga MX ~17, Premier ~38) and grows
// tighter with every extra participant. The API resolves it per participant
// count; an empty list means this league simply can't fit a bracket.
const championMode = ref<FantasyChampionMode>("standings");
const playoffTeams = ref<number | null>(null);
const playoffOptionsByParticipants = ref<FantasyPlayoffOption[]>([]);

const currentPlayoffOption = computed(() =>
  playoffOptionsByParticipants.value.find((option) => option.participants === participantsCount.value),
);
const playoffOptions = computed(() => currentPlayoffOption.value?.options ?? []);
const defaultPlayoffTeams = computed(() => currentPlayoffOption.value?.default ?? null);

// Two matchdays per tie (home and away), one tie per bracket round.
const bracketMatchdays = computed(() =>
  playoffTeams.value ? Math.log2(playoffTeams.value) * 2 : 0,
);

const championModes = computed<
  { value: FantasyChampionMode; title: string; description: string; icon: string; disabled: boolean }[]
>(() => [
  {
    value: "standings",
    title: t("fantasy.leagueCreate.champion.standings.title"),
    description: t("fantasy.leagueCreate.champion.standings.desc"),
    icon: "hi-solid-chart-bar",
    disabled: false,
  },
  {
    value: "playoffs",
    title: t("fantasy.leagueCreate.champion.playoffs.title"),
    description: t("fantasy.leagueCreate.champion.playoffs.desc"),
    icon: "gi-crossed-swords",
    disabled: playoffOptions.value.length === 0,
  },
]);

const onLeagueLogoError = (e: Event) => {
  (e.target as HTMLImageElement).src = "/img/default-avatar.svg";
};

// Commit a league choice coming back from the picker sheet: re-resolve the
// participant options, which are per league.
const chooseLeague = (league: FootballLeagueResponse) => {
  if (selectedLeague.value?.uuid === league.uuid) return;
  selectedLeague.value = league;
  loadParticipantOptions();
};

const fieldError = (field: string) => validationStore.getFieldError(field)[0] || "";

const canSubmit = computed(
  () =>
    name.value.trim().length > 0 &&
    participantsCount.value !== null &&
    !!selectedLeague.value &&
    (championMode.value !== "playoffs" || playoffTeams.value !== null)
);

// Resolve the participant count options for the selected league.
const loadParticipantOptions = async () => {
  const leagueUuid = selectedLeague.value?.uuid;
  if (!leagueUuid) return;

  loadingOptions.value = true;
  participantsCount.value = null;
  isFixedParticipants.value = false;
  participantOptions.value = [];
  playoffOptionsByParticipants.value = [];
  try {
    const response = await fantasyLeagueService.getParticipantOptions(leagueUuid);
    const data = response.data;

    playoffOptionsByParticipants.value = data.playoffs ?? [];

    const labelMap: Record<string, string> = {
      min: t("fantasy.leagueCreate.participants.min"),
      mid: t("fantasy.leagueCreate.participants.mid"),
      max: t("fantasy.leagueCreate.participants.max"),
    };

    // Deduplicate values while preserving descriptive labels.
    const seen = new Map<number, string>();
    for (const key of ["min", "mid", "max"] as const) {
      const value = data[key];
      if (!seen.has(value)) seen.set(value, labelMap[key]);
    }

    if (seen.size === 1) {
      // Only one unique value: auto-assign and show it as fixed.
      const [uniqueValue] = seen.keys();
      participantsCount.value = uniqueValue;
      isFixedParticipants.value = true;
    } else {
      participantOptions.value = Array.from(seen.entries()).map(([value, tag]) => ({ value, tag }));
    }
  } catch (e) {
    console.error("Error fetching participant options:", e);
  } finally {
    loadingOptions.value = false;
  }
};

// Reset the form and (re)resolve options whenever the sheet opens. The league
// defaults to the app's current one; the user can switch it via the picker.
watch(
  () => props.isVisible,
  (visible) => {
    if (visible) {
      name.value = "";
      isLeaguePickerOpen.value = false;
      championMode.value = "standings";
      playoffTeams.value = null;
      selectedLeague.value = footballLeagueStore.getLeague;
      validationStore.clearValidatorError();
      loadParticipantOptions();
    }
  }
);

// The spot options are tied to the participant count, so changing it re-picks the
// suggested bracket size — and drops back to the table mode when the new count
// leaves no room for a bracket at all.
watch(participantsCount, () => {
  playoffTeams.value = defaultPlayoffTeams.value;
  if (playoffOptions.value.length === 0) championMode.value = "standings";
});

// Entering the bracket mode without a size picked yet starts on the suggestion.
watch(championMode, (mode) => {
  if (mode === "playoffs" && playoffTeams.value === null) {
    playoffTeams.value = defaultPlayoffTeams.value;
  }
});

// Clear field errors as the user edits.
watch(name, () => fieldError("name") && validationStore.clearFieldError("name"));
watch(participantsCount, () => fieldError("participants_count") && validationStore.clearFieldError("participants_count"));
watch(playoffTeams, () => fieldError("playoff_teams") && validationStore.clearFieldError("playoff_teams"));

const close = () => {
  if (!isLoading.value) emit("close");
};

const handleCreate = async () => {
  if (!canSubmit.value || isLoading.value || !selectedLeague.value) return;

  isLoading.value = true;
  validationStore.clearValidatorError();

  try {
    const payload: FantasyLeagueCreatePayload = {
      name: name.value.trim(),
      league_uuid: selectedLeague.value.uuid,
      participants_count: participantsCount.value,
      champion_mode: championMode.value,
      // Sending a spot count in table mode would be meaningless; the API ignores
      // it there, but leaving it out keeps the payload honest.
      ...(championMode.value === "playoffs" ? { playoff_teams: playoffTeams.value } : {}),
    };
    const league = await fantasyLeagueService.storeFantasyLeague(payload);
    emit("created", league);
  } catch (e) {
    // 422 errors are surfaced via validationStore (inputs) + a toast, both handled
    // by the API interceptor in useApiFantasy.
    console.error("Error creating fantasy league:", e);
  } finally {
    isLoading.value = false;
  }
};
</script>
