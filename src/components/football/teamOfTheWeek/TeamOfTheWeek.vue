<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { catalogService } from "@/services/catalog/CatalogService";
import { footballPlayerService } from "@/services/football/player/FootballPlayerService";
import type { FootballRoundResponse } from "@/interfaces/football/round/FootballRoundResponse";
import type { TeamOfTheWeekByRoundResponse } from "@/interfaces/football/teamOfTheWeek/TeamOfTheWeekByRoundResponse";
import SearchableSelectComponent from "@/components/ui/SearchableSelectComponent.vue";
import TeamLogo from "@/components/football/ui/TeamLogo.vue";
import TeamOfTheWeekSkeleton from "@/components/football/teamOfTheWeek/TeamOfTheWeekSkeleton.vue";

interface Props {
  stageUuid: string;
  seasonUuid?: string;
}

const props = defineProps<Props>();

// ── Rounds (selector) ──
const rounds = ref<FootballRoundResponse[]>([]);
const isLoadingRounds = ref(false);
const roundsError = ref<string | null>(null);
const selectedRoundUuid = ref<string | null>(null);
const roundsCache = new Map<string, FootballRoundResponse[]>();

// ── Team of the week ──
const totw = ref<TeamOfTheWeekByRoundResponse[]>([]);
const isLoadingTotw = ref(false);
const totwError = ref<string | null>(null);

const loadRounds = async (stageUuid: string) => {
  if (roundsCache.has(stageUuid)) {
    rounds.value = roundsCache.get(stageUuid)!;
    pickDefaultRound();
    return;
  }
  isLoadingRounds.value = true;
  roundsError.value = null;
  rounds.value = [];
  try {
    const result = await catalogService.getRoundsByStage(stageUuid);
    rounds.value = result;
    roundsCache.set(stageUuid, result);
    pickDefaultRound();
  } catch (err) {
    console.error("Error loading rounds:", err);
    roundsError.value = "Couldn't load rounds.";
  } finally {
    isLoadingRounds.value = false;
  }
};

const pickDefaultRound = () => {
  if (rounds.value.length === 0) {
    selectedRoundUuid.value = null;
    return;
  }
  // Prefer the latest finished round (the TOTW only exists once a round is played);
  // otherwise fall back to the current one, then the first.
  const finished = [...rounds.value].reverse().find((r) => r.finished);
  const current = rounds.value.find((r) => r.is_current);
  selectedRoundUuid.value = (finished ?? current ?? rounds.value[0]).uuid;
};

const retryRounds = () => {
  if (props.stageUuid) {
    roundsCache.delete(props.stageUuid);
    loadRounds(props.stageUuid);
  }
};

const loadTotw = async (roundUuid: string) => {
  isLoadingTotw.value = true;
  totwError.value = null;
  totw.value = [];
  try {
    const result =
      await footballPlayerService.getTeamOfTheWeekByRound(roundUuid);
    totw.value = result.data;
  } catch (err) {
    console.error("Error loading team of the week:", err);
    totwError.value = "Couldn't load the team of the week.";
  } finally {
    isLoadingTotw.value = false;
  }
};

const retryTotw = () => {
  if (selectedRoundUuid.value) loadTotw(selectedRoundUuid.value);
};

// ── Formation string + line grouping ──
// The TOTW carries a single `formation` (e.g. "4-3-3") plus a `formation_position`
// (1 = GK, then numbered up the pitch). We slice the players into lines using the
// formation counts so the pitch mirrors FixtureLineups.
const formation = computed(
  () => totw.value.find((p) => p.formation)?.formation ?? "",
);

interface PitchPlayer {
  key: string;
  entry: TeamOfTheWeekByRoundResponse;
}

const lines = computed<PitchPlayer[][]>(() => {
  if (totw.value.length === 0) return [];

  const sorted = [...totw.value].sort(
    (a, b) => a.formation_position - b.formation_position,
  );

  const toPitch = (entry: TeamOfTheWeekByRoundResponse): PitchPlayer => ({
    key: `${entry.player?.uuid ?? entry.formation_position}`,
    entry,
  });

  // Counts per line: GK (1) + the formation segments ("4-3-3" → 4,3,3).
  const counts = formation.value
    ? [
        1,
        ...formation.value
          .split("-")
          .map((n) => Number(n))
          .filter((n) => n > 0),
      ]
    : [];

  const totalFromFormation = counts.reduce((a, b) => a + b, 0);
  if (counts.length === 0 || totalFromFormation !== sorted.length) {
    // No usable formation (or it doesn't match the squad size): one flat line.
    return [sorted.map(toPitch)];
  }

  const out: PitchPlayer[][] = [];
  let idx = 0;
  for (const count of counts) {
    out.push(sorted.slice(idx, idx + count).map(toPitch));
    idx += count;
  }
  return out;
});

// GK sits at the bottom of the pitch → render forwards (last line) first.
const linesReversed = computed(() => [...lines.value].reverse());

const playerName = (entry: TeamOfTheWeekByRoundResponse): string =>
  entry.player?.common_name || entry.player?.display_name || "—";

const hasTotw = computed(() => totw.value.length > 0);

// ── Reactions ──
watch(selectedRoundUuid, (uuid) => {
  if (uuid) loadTotw(uuid);
  else totw.value = [];
});

watch(
  () => props.stageUuid,
  (stageUuid) => {
    selectedRoundUuid.value = null;
    totw.value = [];
    totwError.value = null;
    if (stageUuid) loadRounds(stageUuid);
  },
);

onMounted(() => {
  if (props.stageUuid) loadRounds(props.stageUuid);
});
</script>

<template>
  <div
    class="w-full bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 overflow-hidden"
  >
    <!-- ── Round selector ── -->
    <div class="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
      <div v-if="isLoadingRounds" class="flex items-center justify-center py-2">
        <v-icon
          name="pr-spinner"
          class="w-4 h-4 text-gray-300 dark:text-gray-600"
          animation="spin"
        />
      </div>

      <div
        v-else-if="roundsError"
        class="flex items-center justify-between gap-2 py-1"
      >
        <p class="text-xs text-red-500 dark:text-red-400">{{ roundsError }}</p>
        <button
          @click="retryRounds"
          class="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
        >
         {{ $t('common.actions.retry') }}
        </button>
      </div>

      <SearchableSelectComponent
        v-else-if="rounds.length > 0"
        v-model="selectedRoundUuid"
        variant="minimal"
        :options="rounds"
        value-key="uuid"
        label-key="name"
        :placeholder="$t('football.totw.selectRound')"
        :search-placeholder="$t('football.totw.searchRound')"
        :clearable="false"
        accent-color="emerald"
        :no-options-text="$t('football.totw.noRounds')"
      >
        <template #selected="{ option }">
          <span
            class="text-footnote font-semibold text-gray-900 dark:text-white truncate flex-1"
          >
            {{ $t('football.totw.round', { name: option.name }) }}
          </span>
          <span
            v-if="option.is_current"
            class="text-2xs font-bold tracking-wider text-emerald-600 dark:text-emerald-400 uppercase shrink-0"
          >
            Current
          </span>
        </template>
        <template #option="{ option }">
          <div class="flex-1 min-w-0 flex items-center gap-2">
            <span class="text-footnote font-medium truncate">
              {{ $t("football.totw.round", { name: option.name }) }}</span
            >
            <span
              v-if="option.is_current"
              class="text-2xs font-bold tracking-wider text-emerald-600 dark:text-emerald-400 uppercase shrink-0"
            >
              {{ $t("football.totw.currentRound") }}
            </span>
            <span
              v-else-if="option.finished"
              class="text-2xs text-gray-400 dark:text-gray-500 uppercase tracking-wider shrink-0"
            >
              Done
            </span>
          </div>
        </template>
      </SearchableSelectComponent>

      <div
        v-else
        class="text-center py-2 text-xs text-gray-400 dark:text-gray-500"
      >
        No rounds available
      </div>
    </div>

    <!-- ── Content ── -->
    <div class="px-4 pt-3 pb-6">
      <!-- Loading -->
      <TeamOfTheWeekSkeleton v-if="isLoadingTotw" />

      <!-- Error -->
      <div
        v-else-if="totwError"
        class="py-12 flex flex-col items-center text-center"
      >
        <v-icon
          name="hi-solid-exclamation-circle"
          class="w-9 h-9 text-red-200 dark:text-red-900/60 mb-2"
        />
        <p class="text-footnote text-gray-500 dark:text-gray-400 mb-3">
          {{ totwError }}
        </p>
        <button
          @click="retryTotw"
          class="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
        >
          {{ $t('common.actions.retry') }}
        </button>
      </div>

      <!-- Empty -->
      <div
        v-else-if="!hasTotw"
        class="py-12 flex flex-col items-center text-center"
      >
        <v-icon
          name="bi-star"
          class="w-9 h-9 text-gray-200 dark:text-gray-700 mb-2"
        />
        <p class="text-footnote text-gray-400 dark:text-gray-500">
          {{ $t("football.totw.empty") }}
        </p>
      </div>

      <!-- Pitch -->
      <template v-else>
        <!-- Header -->
        <div class="flex items-center justify-between mb-2 px-1">
          <div class="flex items-center gap-1.5">
            <v-icon name="bi-star-fill" class="w-3.5 h-3.5 text-amber-400" />
            <span class="text-xs font-semibold text-gray-900 dark:text-white">
              Team of the Week
            </span>
          </div>
          <span
            v-if="formation"
            class="text-2xs font-bold text-emerald-600 dark:text-emerald-400 tabular-nums"
          >
            {{ formation }}
          </span>
        </div>

        <!-- Field -->
        <div
          class="relative rounded-2xl overflow-hidden bg-gradient-to-b from-emerald-500 to-emerald-700 dark:from-emerald-800 dark:to-emerald-950 min-h-[520px] sm:min-h-[560px]"
        >
          <!-- Markings -->
          <div class="pointer-events-none absolute inset-0" aria-hidden="true">
            <div
              class="absolute inset-2 sm:inset-3 border border-white/20 rounded-lg"
            />
            <div
              class="absolute left-2 right-2 sm:left-3 sm:right-3 top-1/2 h-px bg-white/20"
            />
            <div
              class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full border border-white/20"
            />
            <div
              class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-white/30"
            />
            <div
              class="absolute left-1/2 -translate-x-1/2 top-2 sm:top-3 w-36 h-14 border border-white/20 border-t-0 rounded-b-lg"
            />
            <div
              class="absolute left-1/2 -translate-x-1/2 bottom-2 sm:bottom-3 w-36 h-14 border border-white/20 border-b-0 rounded-t-lg"
            />
          </div>

          <!-- Players (forwards on top, GK at the bottom) -->
          <div
            class="relative flex flex-col h-full min-h-[520px] sm:min-h-[560px] py-3"
          >
            <div
              v-for="(line, li) in linesReversed"
              :key="`line-${li}`"
              class="flex-1 flex items-center justify-evenly px-2"
            >
              <div
                v-for="p in line"
                :key="p.key"
                class="flex flex-col items-center gap-1 w-[18%] max-w-[72px]"
              >
                <div class="relative">
                  <img
                    v-if="p.entry.player?.image_path"
                    :src="p.entry.player.image_path"
                    :alt="playerName(p.entry)"
                    class="w-9 h-9 rounded-full object-cover bg-white/90 ring-2 ring-emerald-300 shadow"
                  />
                  <div
                    v-else
                    class="w-9 h-9 rounded-full bg-white/90 ring-2 ring-emerald-300 shadow flex items-center justify-center"
                  >
                    <v-icon
                      name="hi-solid-user"
                      class="w-4 h-4 text-gray-400"
                    />
                  </div>

                  <!-- Team crest -->
                  <TeamLogo
                    v-if="p.entry.team"
                    :team="p.entry.team"
                    size="xs"
                    class="absolute -top-1 -left-1 ring-1 ring-white rounded-full bg-white/90"
                  />

                  <!-- Rating -->
                  <span
                    v-if="p.entry.rating != null"
                    class="absolute -bottom-1 -right-1 min-w-[18px] h-[15px] px-0.5 rounded-full bg-amber-400 text-gray-900 text-2xs font-bold flex items-center justify-center tabular-nums ring-1 ring-white"
                  >
                    {{ p.entry.rating.toFixed(1) }}
                  </span>
                </div>
                <span
                  class="text-2xs font-medium text-white leading-tight truncate max-w-full drop-shadow"
                >
                  {{ playerName(p.entry) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.tabular-nums {
  font-variant-numeric: tabular-nums;
}
</style>
