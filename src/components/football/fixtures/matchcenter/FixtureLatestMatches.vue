<script setup lang="ts">
import { computed } from "vue";
import type { FootballTeamResponse } from "@/interfaces/football/team/FootballTeamResponse";
import type { FootballFixtureResponse } from "@/interfaces/football/fixture/FootballFixtureResponse";
import TeamLogo from "@/components/football/ui/TeamLogo.vue";

interface Props {
  homeTeam?: FootballTeamResponse;
  awayTeam?: FootballTeamResponse;
}

const props = defineProps<Props>();

type Result = "W" | "D" | "L";

interface LatestEntry {
  uuid: string;
  homeSide: FootballTeamResponse | undefined;
  awaySide: FootballTeamResponse | undefined;
  homeGoals: number | null;
  awayGoals: number | null;
  result: Result | null;
  timestamp: number;
}

/** Resolve the participant inside a latest fixture that matches the given team. */
const findSelf = (
  fixture: FootballFixtureResponse,
  team: FootballTeamResponse,
): FootballTeamResponse | undefined =>
  fixture.participants?.find(
    (p) => p.uuid === team.uuid || (p.sm_id != null && p.sm_id === team.sm_id),
  );

const resultFromGoals = (self: number | null, opp: number | null): Result | null => {
  if (self === null || opp === null) return null;
  if (self > opp) return "W";
  if (self < opp) return "L";
  return "D";
};

/** Build the normalized list of recent matches for a team (most recent first). */
const buildEntries = (team: FootballTeamResponse | undefined): LatestEntry[] => {
  if (!team?.latest?.length) return [];
  return team.latest
    .map((fixture): LatestEntry => {
      const self = findSelf(fixture, team);
      const homeSide = fixture.participants?.find((p) => p.meta?.location === "home");
      const awaySide = fixture.participants?.find((p) => p.meta?.location === "away");
      const homeGoals = homeSide?.current_score?.score ?? null;
      const awayGoals = awaySide?.current_score?.score ?? null;
      const selfIsHome = self?.meta?.location === "home";
      return {
        uuid: fixture.uuid,
        homeSide,
        awaySide,
        homeGoals,
        awayGoals,
        result: selfIsHome
          ? resultFromGoals(homeGoals, awayGoals)
          : resultFromGoals(awayGoals, homeGoals),
        timestamp: fixture.starting_at_timestamp ?? 0,
      };
    })
    .sort((a, b) => b.timestamp - a.timestamp);
};

interface TeamForm {
  team: FootballTeamResponse;
  entries: LatestEntry[];
}

const teamForms = computed<TeamForm[]>(() => {
  const forms: TeamForm[] = [];
  if (props.homeTeam) forms.push({ team: props.homeTeam, entries: buildEntries(props.homeTeam) });
  if (props.awayTeam) forms.push({ team: props.awayTeam, entries: buildEntries(props.awayTeam) });
  return forms.filter((f) => f.entries.length > 0);
});

const hasData = computed(() => teamForms.value.length > 0);

/** Score text color reflecting the tracked team's result. */
const resultTextClass = (result: Result | null): string => {
  switch (result) {
    case "W":
      return "text-emerald-600 dark:text-emerald-400";
    case "L":
      return "text-red-500 dark:text-red-400";
    case "D":
      return "text-gray-500 dark:text-gray-400";
    default:
      return "text-gray-400 dark:text-gray-500";
  }
};
</script>

<template>
  <div class="px-4 pt-2 pb-5">
    <div v-if="hasData" class="space-y-4">
      <div
        v-for="form in teamForms"
        :key="form.team.uuid"
        class="rounded-2xl bg-gray-50 dark:bg-gray-800/50 p-3"
      >
        <!-- Team header -->
        <div class="flex items-center gap-2.5 mb-3">
          <TeamLogo :team="form.team" size="sm" />
          <p class="text-footnote font-semibold text-gray-900 dark:text-white truncate min-w-0">
            {{ form.team.name }}
          </p>
        </div>

        <!-- Recent matches: only logos + score (colored by result) -->
        <div class="flex flex-wrap gap-2">
          <div
            v-for="entry in form.entries"
            :key="entry.uuid"
            class="flex items-center gap-2 rounded-xl bg-white dark:bg-gray-900/40 px-2.5 py-1.5"
          >
            <TeamLogo :team="entry.homeSide" size="xs" />
            <span
              class="text-footnote font-bold tabular-nums"
              :class="resultTextClass(entry.result)"
            >
              {{ entry.homeGoals ?? "-" }}–{{ entry.awayGoals ?? "-" }}
            </span>
            <TeamLogo :team="entry.awaySide" size="xs" />
          </div>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else class="py-6 text-center">
      <p class="text-xs text-gray-400 dark:text-gray-500">No recent matches available.</p>
    </div>
  </div>
</template>

<style scoped>
.tabular-nums {
  font-variant-numeric: tabular-nums;
}
</style>
