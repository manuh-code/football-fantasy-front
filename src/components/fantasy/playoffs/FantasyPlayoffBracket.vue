<template>
  <div class="space-y-3">
    <!-- ============================== -->
    <!-- LOADING — skeleton bracket     -->
    <!-- ============================== -->
    <div
      v-if="isLoading"
      class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/40 overflow-hidden"
      role="status"
      :aria-label="$t('fantasy.playoffs.loading')"
    >
      <div class="h-1 bg-gray-200 dark:bg-gray-700 animate-pulse" />
      <div class="px-4 py-3.5 border-b border-gray-100 dark:border-gray-700/40">
        <div class="h-4 w-32 rounded-md bg-gray-200/80 dark:bg-gray-700 animate-pulse" />
      </div>
      <div class="p-4 flex gap-3">
        <div v-for="n in 3" :key="`sk-col-${n}`" class="flex-1 space-y-3">
          <div class="h-2.5 w-20 rounded bg-gray-200/70 dark:bg-gray-700 animate-pulse" />
          <div
            v-for="m in 4 - n"
            :key="`sk-card-${n}-${m}`"
            class="h-20 rounded-xl bg-gray-200/70 dark:bg-gray-700 animate-pulse"
          />
        </div>
      </div>
    </div>

    <!-- ============================== -->
    <!-- ERROR                          -->
    <!-- ============================== -->
    <div
      v-else-if="errorMessage"
      class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/40 py-16 text-center"
    >
      <div class="w-14 h-14 bg-red-50 dark:bg-red-900/20 rounded-2xl mx-auto mb-4 flex items-center justify-center">
        <v-icon name="hi-solid-exclamation" class="w-7 h-7 text-red-400" />
      </div>
      <p class="text-sm font-medium text-gray-900 dark:text-white mb-1">{{ $t('fantasy.playoffs.error') }}</p>
      <p class="text-xs text-gray-500 dark:text-gray-400 mb-5 max-w-xs mx-auto">{{ errorMessage }}</p>
      <ButtonComponent
        variant="outline"
        size="sm"
        :text="$t('common.actions.retry')"
        @click="fetchBracket"
      />
    </div>

    <!-- ============================== -->
    <!-- CONTENT                        -->
    <!-- ============================== -->
    <div
      v-else-if="bracket"
      class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/40 overflow-hidden"
    >
      <!-- Violet accent — this tab's signature, distinct from the amber table -->
      <div class="h-1 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-violet-400" />

      <!-- Header -->
      <div class="flex items-center justify-between px-4 py-3.5 border-b border-gray-100 dark:border-gray-700/40">
        <div class="flex items-center gap-2">
          <v-icon name="gi-crossed-swords" class="w-4 h-4 text-violet-500 dark:text-violet-400" />
          <h3 class="text-sm font-bold text-gray-900 dark:text-white tracking-tight">
            {{ $t('fantasy.playoffs.title') }}
          </h3>
        </div>
        <span
          v-if="isPlayoffLeague && bracket.playoff_teams"
          class="text-2xs font-semibold text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/20 px-2 py-0.5 rounded-full"
        >
          {{ $t('fantasy.playoffs.qualifiedCount', { count: bracket.playoff_teams }) }}
        </span>
      </div>

      <!-- League decided by table position: nothing to draw -->
      <div v-if="!isPlayoffLeague" class="py-14 text-center px-6">
        <div class="w-12 h-12 bg-gray-100 dark:bg-gray-700/50 rounded-2xl mx-auto mb-3 flex items-center justify-center">
          <v-icon name="hi-solid-chart-bar" class="w-5 h-5 text-gray-300 dark:text-gray-600" />
        </div>
        <p class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">{{ $t('fantasy.playoffs.disabledTitle') }}</p>
        <p class="text-xs text-gray-400 dark:text-gray-500 max-w-xs mx-auto leading-relaxed">
          {{ $t('fantasy.playoffs.disabledBody') }}
        </p>
      </div>

      <!-- Bracket configured but the regular season hasn't handed over the seeds -->
      <div v-else-if="!bracket.has_started" class="py-14 text-center px-6">
        <div class="w-12 h-12 bg-violet-50 dark:bg-violet-900/20 rounded-2xl mx-auto mb-3 flex items-center justify-center">
          <v-icon name="gi-crossed-swords" class="w-5 h-5 text-violet-300 dark:text-violet-500" />
        </div>
        <p class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">{{ $t('fantasy.playoffs.pendingTitle') }}</p>
        <p class="text-xs text-gray-400 dark:text-gray-500 max-w-xs mx-auto leading-relaxed">
          {{ $t('fantasy.playoffs.pendingBody', { count: bracket.playoff_teams }) }}
        </p>
      </div>

      <template v-else>
        <!-- Champion banner -->
        <div
          v-if="bracket.champion"
          class="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-amber-50 to-transparent dark:from-amber-900/20"
        >
          <div class="shrink-0 w-10 h-10 rounded-full bg-white dark:bg-gray-700/50 ring-2 ring-amber-300 dark:ring-amber-500/60 flex items-center justify-center overflow-hidden">
            <TeamCrest :team="bracket.champion" />
          </div>
          <div class="min-w-0">
            <p class="text-2xs font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">
              {{ $t('fantasy.playoffs.championTitle') }}
            </p>
            <p class="text-sm font-extrabold text-gray-900 dark:text-white truncate">{{ bracket.champion.team_name }}</p>
          </div>
          <v-icon name="bi-trophy-fill" class="ml-auto w-6 h-6 text-amber-500 shrink-0" />
        </div>

        <!-- Rounds — one column per knockout round, scrolled horizontally on
             mobile so a full 16-team bracket still fits without squeezing. -->
        <div class="overflow-x-auto">
          <div class="flex gap-3 p-4 min-w-min">
            <div
              v-for="round in bracket.rounds"
              :key="`round-${round.round}`"
              class="flex flex-col gap-3 w-[15rem] shrink-0"
            >
              <p class="text-2xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 px-0.5">
                {{ round.name }}
              </p>

              <!-- Series cards are vertically centred within the column so the
                   later (shorter) rounds line up with the pair that feeds them. -->
              <div class="flex-1 flex flex-col justify-around gap-3">
                <article
                  v-for="series in round.series"
                  :key="series.uuid"
                  class="rounded-xl border overflow-hidden transition-colors"
                  :class="series.status === 'completed'
                    ? 'border-gray-200 dark:border-gray-700/60 bg-gray-50/60 dark:bg-gray-800/40'
                    : 'border-violet-200 dark:border-violet-500/30 bg-violet-50/30 dark:bg-violet-900/10'"
                >
                  <div class="divide-y divide-gray-100 dark:divide-gray-700/50">
                    <div
                      v-for="side in ['home', 'away'] as const"
                      :key="`${series.uuid}-${side}`"
                      class="flex items-center gap-2 px-2.5 py-2"
                      :class="series[side]?.is_winner ? 'bg-emerald-50/70 dark:bg-emerald-900/15' : ''"
                    >
                      <template v-if="series[side]">
                        <span class="shrink-0 w-5 text-center text-2xs font-bold text-gray-400 dark:text-gray-500 tabular-nums">
                          {{ series[side]!.seed }}
                        </span>
                        <div class="shrink-0 w-7 h-7 rounded-full bg-white dark:bg-gray-700/50 border border-gray-100 dark:border-gray-600/60 flex items-center justify-center overflow-hidden">
                          <TeamCrest :team="series[side]!.team" />
                        </div>
                        <div class="min-w-0 flex-1">
                          <p
                            class="text-xs font-bold truncate leading-tight"
                            :class="isMe(series[side]!.user.uuid)
                              ? 'text-violet-600 dark:text-violet-400'
                              : 'text-gray-900 dark:text-white'"
                          >
                            {{ series[side]!.team.team_name }}
                          </p>
                          <p class="text-2xs text-gray-400 dark:text-gray-500 truncate -mt-0.5">
                            {{ series[side]!.user.name }}
                          </p>
                        </div>
                        <span
                          class="shrink-0 text-xs font-black tabular-nums"
                          :class="series[side]!.is_winner
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-gray-500 dark:text-gray-400'"
                        >
                          {{ formatPoints(series[side]!.aggregate) }}
                        </span>
                      </template>

                      <!-- Slot still waiting on the feeding tie -->
                      <template v-else>
                        <span class="shrink-0 w-5 text-center text-2xs font-bold text-gray-300 dark:text-gray-600">—</span>
                        <div class="shrink-0 w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-700/40 flex items-center justify-center">
                          <v-icon name="hi-solid-question-mark-circle" class="w-3.5 h-3.5 text-gray-300 dark:text-gray-600" />
                        </div>
                        <p class="min-w-0 flex-1 text-xs font-medium text-gray-400 dark:text-gray-500 truncate">
                          {{ $t('fantasy.playoffs.tbd') }}
                        </p>
                      </template>
                    </div>
                  </div>

                  <!-- Per-leg breakdown: the two matchdays that make the aggregate -->
                  <div
                    v-if="series.legs?.length"
                    class="flex items-center gap-2 px-2.5 py-1.5 bg-white/70 dark:bg-gray-800/60 border-t border-gray-100 dark:border-gray-700/50"
                  >
                    <span
                      v-for="leg in series.legs"
                      :key="`${series.uuid}-leg-${leg.leg}`"
                      class="text-2xs text-gray-400 dark:text-gray-500 tabular-nums"
                    >
                      <span class="font-semibold text-gray-500 dark:text-gray-400">{{ legLabel(leg.leg) }}</span>
                      {{ formatPoints(leg.home_score) }}–{{ formatPoints(leg.away_score) }}
                    </span>
                  </div>
                </article>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useI18n } from "vue-i18n";
import { ButtonComponent } from "@/components/ui";
import TeamCrest from "@/components/fantasy/playoffs/TeamCrest.vue";
import { fantasyLeagueService } from "@/services/fantasy/leagues/FantasyLeagueService";
import type { FantasyPlayoffBracketResponse } from "@/interfaces/fantasy/playoffs/FantasyPlayoffBracketResponse";
import { useUserStore } from "@/store";

interface Props {
  fantasyLeagueUuid: string;
}

const props = defineProps<Props>();

const { t } = useI18n();
const userStore = useUserStore();

const bracket = ref<FantasyPlayoffBracketResponse | null>(null);
const isLoading = ref(true);
const errorMessage = ref<string>("");

const isPlayoffLeague = computed(() => bracket.value?.champion_mode === "playoffs");

const isMe = (uuid: string | null): boolean =>
  !!uuid && uuid === userStore.getUserData?.uuid;

// Aggregates arrive as decimal strings from the API; trim the ".00" tail that
// fantasy scores almost always carry so the cards stay readable.
const formatPoints = (value: string): string => {
  const parsed = Number(value);
  if (Number.isNaN(parsed)) return value;
  return Number.isInteger(parsed) ? String(parsed) : parsed.toFixed(1);
};

const legLabel = (leg: number | null): string =>
  leg === 2 ? t("fantasy.playoffs.legSecond") : t("fantasy.playoffs.legFirst");

const fetchBracket = async () => {
  if (!props.fantasyLeagueUuid) return;
  isLoading.value = true;
  errorMessage.value = "";
  try {
    bracket.value = await fantasyLeagueService.getPlayoffBracket(props.fantasyLeagueUuid);
  } catch (error) {
    console.error("Error loading playoff bracket:", error);
    errorMessage.value = t("fantasy.playoffs.error");
  } finally {
    isLoading.value = false;
  }
};

onMounted(fetchBracket);
watch(() => props.fantasyLeagueUuid, fetchBracket);
</script>
