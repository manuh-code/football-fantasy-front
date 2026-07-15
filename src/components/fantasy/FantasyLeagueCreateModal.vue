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

      <!-- League — pick which football league this fantasy league belongs to -->
      <div class="flex flex-col gap-1.5">
        <label class="text-sm font-semibold text-gray-700 dark:text-gray-300">{{ $t('fantasy.leagueCreate.league.label') }}</label>

        <!-- Current selection — tap to expand the picker -->
        <button
          type="button"
          :disabled="isLoading"
          @click="showLeaguePicker = !showLeaguePicker"
          class="flex items-center gap-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3.5 text-left transition-colors active:bg-gray-100 dark:active:bg-gray-800 disabled:opacity-60"
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
          <v-icon
            :name="showLeaguePicker ? 'hi-solid-chevron-up' : 'hi-solid-chevron-down'"
            class="w-4 h-4 text-gray-400 dark:text-gray-500 shrink-0"
          />
        </button>
        <span v-if="fieldError('league_uuid')" class="text-xs text-red-600 dark:text-red-400">{{ fieldError('league_uuid') }}</span>

        <!-- Inline league picker -->
        <div
          v-if="showLeaguePicker"
          class="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden max-h-56 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700/60"
        >
          <!-- Loading -->
          <div v-if="loadingLeagues" class="p-3 space-y-2.5">
            <div v-for="n in 3" :key="`lg-sk-${n}`" class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse shrink-0" />
              <div class="h-3 w-28 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
            </div>
          </div>

          <!-- Empty -->
          <p v-else-if="leagues.length === 0" class="px-4 py-3 text-xs text-gray-400 dark:text-gray-500">
            {{ $t('fantasy.leagueCreate.league.empty') }}
          </p>

          <!-- Options -->
          <template v-else>
            <button
              v-for="option in leagues"
              :key="option.uuid"
              type="button"
              @click="chooseLeague(option)"
              class="w-full flex items-center gap-3 px-3.5 py-2.5 text-left transition-colors active:bg-gray-100/70 dark:active:bg-gray-700/40"
              :class="option.uuid === selectedLeague?.uuid ? 'bg-emerald-50/60 dark:bg-emerald-900/10' : ''"
            >
              <img
                :src="option.image_path || '/img/default-avatar.svg'"
                :alt="option.name"
                class="w-8 h-8 object-contain shrink-0"
                @error="onLeagueLogoError"
              />
              <span class="flex-1 min-w-0 text-sm font-medium text-gray-800 dark:text-gray-100 truncate">{{ option.name }}</span>
              <v-icon
                v-if="option.uuid === selectedLeague?.uuid"
                name="hi-solid-check"
                class="w-4 h-4 text-emerald-500 shrink-0"
              />
            </button>
          </template>
        </div>
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
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import BottomSheet from "@/components/ui/BottomSheet.vue";
import { FormInput } from "@/components/ui";
import { fantasyLeagueService } from "@/services/fantasy/leagues/FantasyLeagueService";
import catalogService from "@/services/catalog/CatalogService";
import { useFootballLeagueStore } from "@/store/football/league/useFootballLeagueStore";
import { useValidationStore } from "@/store/validation/useValidationStore";
import type { FantasyLeagueCreatePayload } from "@/interfaces/fantasy/leagues/FantasyLeagueCreatePayload";
import type { FantasyLeaguesResponse } from "@/interfaces/fantasy/leagues/FantasyLeaguesResponse";
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
const leagues = ref<FootballLeagueResponse[]>([]);
const loadingLeagues = ref(false);
const showLeaguePicker = ref(false);

// Participant count options come from the API per league: min / mid / max,
// collapsed to a single fixed value when they all match.
const participantsCount = ref<number | null>(null);
const participantOptions = ref<{ value: number; tag: string }[]>([]);
const isFixedParticipants = ref(false);
const loadingOptions = ref(false);

const onLeagueLogoError = (e: Event) => {
  (e.target as HTMLImageElement).src = "/img/default-avatar.svg";
};

// Lazily load the available leagues the first time the picker is needed.
const loadLeagues = async () => {
  if (leagues.value.length > 0) return;
  loadingLeagues.value = true;
  try {
    leagues.value = await catalogService.getFootballLeagues();
  } catch (e) {
    console.error("Error loading leagues:", e);
  } finally {
    loadingLeagues.value = false;
  }
};

// Commit a league choice: collapse the picker and re-resolve participant options.
const chooseLeague = (league: FootballLeagueResponse) => {
  showLeaguePicker.value = false;
  if (selectedLeague.value?.uuid === league.uuid) return;
  selectedLeague.value = league;
  loadParticipantOptions();
};

const fieldError = (field: string) => validationStore.getFieldError(field)[0] || "";

const canSubmit = computed(
  () =>
    name.value.trim().length > 0 &&
    participantsCount.value !== null &&
    !!selectedLeague.value
);

// Resolve the participant count options for the selected league.
const loadParticipantOptions = async () => {
  const leagueUuid = selectedLeague.value?.uuid;
  if (!leagueUuid) return;

  loadingOptions.value = true;
  participantsCount.value = null;
  isFixedParticipants.value = false;
  participantOptions.value = [];
  try {
    const response = await fantasyLeagueService.getParticipantOptions(leagueUuid);
    const data = response.data;

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
      showLeaguePicker.value = false;
      selectedLeague.value = footballLeagueStore.getLeague;
      validationStore.clearValidatorError();
      loadLeagues();
      loadParticipantOptions();
    }
  }
);

// Clear field errors as the user edits.
watch(name, () => fieldError("name") && validationStore.clearFieldError("name"));
watch(participantsCount, () => fieldError("participants_count") && validationStore.clearFieldError("participants_count"));

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
