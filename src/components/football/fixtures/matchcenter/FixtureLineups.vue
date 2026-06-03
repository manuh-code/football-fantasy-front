<script setup lang="ts">
import { computed } from "vue";
import type { FootballLineupResponse } from "@/interfaces/football/fixture/FootballLineupResponse";
import type { FootballFixtureFormationResponse } from "@/interfaces/football/fixture/FootballFixtureFormationResponse";
import type { FootballTeamResponse } from "@/interfaces/football/team/FootballTeamResponse";
import TeamLogo from "@/components/football/ui/TeamLogo.vue";

interface Props {
  lineups: FootballLineupResponse[] | null;
  formations: FootballFixtureFormationResponse[] | null;
  homeTeam?: FootballTeamResponse;
  awayTeam?: FootballTeamResponse;
}

const props = defineProps<Props>();

type Side = "home" | "away";

// ── Team matching ──
const belongsTo = (lineup: FootballLineupResponse, team: FootballTeamResponse | undefined): boolean => {
  if (!team || !lineup.team) return false;
  return (
    lineup.team.uuid === team.uuid ||
    (lineup.team.sm_id != null && lineup.team.sm_id === team.sm_id)
  );
};

const lineupsFor = (team: FootballTeamResponse | undefined): FootballLineupResponse[] =>
  (props.lineups ?? []).filter((l) => belongsTo(l, team));

const isStarter = (l: FootballLineupResponse): boolean =>
  l.formation_field != null && l.formation_position != null;

// ── Formation string ──
const formationFor = (team: FootballTeamResponse | undefined): string => {
  if (!team) return "";
  const f = (props.formations ?? []).find(
    (x) =>
      x.participant?.uuid === team.uuid ||
      (x.participant?.sm_id != null && x.participant.sm_id === team.sm_id),
  );
  return f?.formation ?? "";
};

const homeFormation = computed(() => formationFor(props.homeTeam));
const awayFormation = computed(() => formationFor(props.awayTeam));

// ── Player display helpers ──
const shortName = (l: FootballLineupResponse): string => {
  const raw = l.player?.display_name || l.player_name || l.player?.common_name || "";
  if (!raw) return "—";
  const parts = raw.trim().split(/\s+/);
  return parts[parts.length - 1];
};

// ── Starters grouped into formation lines ──
interface PitchPlayer {
  key: string;
  lineup: FootballLineupResponse;
  pos: number;
}

const linesFor = (team: FootballTeamResponse | undefined): PitchPlayer[][] => {
  const starters = lineupsFor(team).filter(isStarter);
  const byLine = new Map<number, PitchPlayer[]>();
  for (const l of starters) {
    // formation_field is "line:position" (e.g. "2:4")
    const [lineStr, posStr] = (l.formation_field ?? "").split(":");
    const line = Number(lineStr) || 1;
    const pos = Number(posStr) || l.formation_position || 0;
    if (!byLine.has(line)) byLine.set(line, []);
    byLine.get(line)!.push({
      key: `${l.player?.uuid ?? l.player_name ?? ""}-${l.formation_position}`,
      lineup: l,
      pos,
    });
  }
  // Sort lines ascending (1 = GK) and players within a line by position
  const lines = Array.from(byLine.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([, players]) => players.sort((a, b) => a.pos - b.pos));
  return lines;
};

const homeLines = computed(() => linesFor(props.homeTeam));
const awayLines = computed(() => linesFor(props.awayTeam));

// Home half renders forwards near the centre and GK at the bottom → reverse line order.
const homeLinesReversed = computed(() => [...homeLines.value].reverse());

// ── Bench (non-starters) ──
const benchFor = (team: FootballTeamResponse | undefined): FootballLineupResponse[] =>
  lineupsFor(team).filter((l) => !isStarter(l));

const homeBench = computed(() => benchFor(props.homeTeam));
const awayBench = computed(() => benchFor(props.awayTeam));

const benchSides = computed(() => {
  const out: { side: Side; team: FootballTeamResponse | undefined; players: FootballLineupResponse[] }[] = [];
  if (homeBench.value.length) out.push({ side: "home", team: props.homeTeam, players: homeBench.value });
  if (awayBench.value.length) out.push({ side: "away", team: props.awayTeam, players: awayBench.value });
  return out;
});

// ── State flags ──
const hasAnyLineup = computed(() => (props.lineups?.length ?? 0) > 0);
const hasPitch = computed(() => homeLines.value.length > 0 || awayLines.value.length > 0);

// Fallback: when there are no positioned starters, show every player grouped by team.
const fallbackSides = computed(() => {
  const out: { side: Side; team: FootballTeamResponse | undefined; players: FootballLineupResponse[] }[] = [];
  const h = lineupsFor(props.homeTeam);
  const a = lineupsFor(props.awayTeam);
  if (h.length) out.push({ side: "home", team: props.homeTeam, players: h });
  if (a.length) out.push({ side: "away", team: props.awayTeam, players: a });
  return out;
});
</script>

<template>
  <div class="px-4 pt-3 pb-6">
    <!-- Empty -->
    <div
      v-if="!hasAnyLineup"
      class="py-12 flex flex-col items-center text-center"
    >
      <v-icon name="hi-solid-users" class="w-9 h-9 text-gray-200 dark:text-gray-700 mb-2" />
      <p class="text-[13px] text-gray-400 dark:text-gray-500">Lineups not available yet</p>
    </div>

    <template v-else>
      <!-- ── Pitch ── -->
      <template v-if="hasPitch">
        <!-- Formation header -->
        <div class="flex items-center justify-between mb-2 px-1">
          <div class="flex items-center gap-2 min-w-0">
            <TeamLogo :team="homeTeam" size="xs" />
            <span class="text-[12px] font-semibold text-gray-900 dark:text-white truncate">
              {{ homeTeam?.short_code || homeTeam?.name }}
            </span>
            <span v-if="homeFormation" class="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
              {{ homeFormation }}
            </span>
          </div>
          <div class="flex items-center gap-2 min-w-0 justify-end">
            <span v-if="awayFormation" class="text-[11px] font-bold text-sky-600 dark:text-sky-400 tabular-nums">
              {{ awayFormation }}
            </span>
            <span class="text-[12px] font-semibold text-gray-900 dark:text-white truncate">
              {{ awayTeam?.short_code || awayTeam?.name }}
            </span>
            <TeamLogo :team="awayTeam" size="xs" />
          </div>
        </div>

        <!-- Field -->
        <div
          class="relative rounded-2xl overflow-hidden bg-gradient-to-b from-emerald-500 to-emerald-700 dark:from-emerald-800 dark:to-emerald-950 min-h-[520px] sm:min-h-[560px]"
        >
          <!-- Markings -->
          <div class="pointer-events-none absolute inset-0" aria-hidden="true">
            <div class="absolute inset-2 sm:inset-3 border border-white/20 rounded-lg" />
            <!-- Halfway line -->
            <div class="absolute left-2 right-2 sm:left-3 sm:right-3 top-1/2 h-px bg-white/20" />
            <!-- Centre circle -->
            <div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full border border-white/20" />
            <div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-white/30" />
            <!-- Penalty boxes -->
            <div class="absolute left-1/2 -translate-x-1/2 top-2 sm:top-3 w-36 h-14 border border-white/20 border-t-0 rounded-b-lg" />
            <div class="absolute left-1/2 -translate-x-1/2 bottom-2 sm:bottom-3 w-36 h-14 border border-white/20 border-b-0 rounded-t-lg" />
          </div>

          <!-- Players -->
          <div class="relative flex flex-col h-full min-h-[520px] sm:min-h-[560px] py-3">
            <!-- Away half (top) -->
            <div class="flex-1 flex flex-col justify-evenly">
              <div
                v-for="(line, li) in awayLines"
                :key="`a-${li}`"
                class="flex items-start justify-evenly px-2"
              >
                <div
                  v-for="p in line"
                  :key="p.key"
                  class="flex flex-col items-center gap-1 w-[18%] max-w-[72px]"
                >
                  <div class="relative">
                    <img
                      v-if="p.lineup.player?.image_path"
                      :src="p.lineup.player.image_path"
                      :alt="shortName(p.lineup)"
                      class="w-9 h-9 rounded-full object-cover bg-white/90 ring-2 ring-sky-400 shadow"
                    />
                    <div
                      v-else
                      class="w-9 h-9 rounded-full bg-white/90 ring-2 ring-sky-400 shadow flex items-center justify-center text-[12px] font-bold text-gray-800"
                    >
                      {{ p.lineup.jersey_number ?? "" }}
                    </div>
                    <span
                      v-if="p.lineup.player?.image_path && p.lineup.jersey_number != null"
                      class="absolute -bottom-1 -right-1 min-w-[15px] h-[15px] px-0.5 rounded-full bg-sky-500 text-white text-[9px] font-bold flex items-center justify-center tabular-nums ring-1 ring-white"
                    >
                      {{ p.lineup.jersey_number }}
                    </span>
                  </div>
                  <span class="text-[10px] font-medium text-white leading-tight truncate max-w-full drop-shadow">
                    {{p.lineup.player?.common_name}}
                  </span>
                </div>
              </div>
            </div>
            

            <!-- Home half (bottom, GK at the very bottom) -->
            <div class="flex-1 flex flex-col justify-evenly">
              <div
                v-for="(line, li) in homeLinesReversed"
                :key="`h-${li}`"
                class="flex items-start justify-evenly px-2"
              >
                <div
                  v-for="p in line"
                  :key="p.key"
                  class="flex flex-col items-center gap-1 w-[18%] max-w-[72px]"
                >
                  <div class="relative">
                    <img
                      v-if="p.lineup.player?.image_path"
                      :src="p.lineup.player.image_path"
                      :alt="shortName(p.lineup)"
                      class="w-9 h-9 rounded-full object-cover bg-white/90 ring-2 ring-emerald-300 shadow"
                    />
                    <div
                      v-else
                      class="w-9 h-9 rounded-full bg-white/90 ring-2 ring-emerald-300 shadow flex items-center justify-center text-[12px] font-bold text-gray-800"
                    >
                      {{ p.lineup.jersey_number ?? "" }}
                    </div>
                    <span
                      v-if="p.lineup.player?.image_path && p.lineup.jersey_number != null"
                      class="absolute -bottom-1 -right-1 min-w-[15px] h-[15px] px-0.5 rounded-full bg-emerald-500 text-white text-[9px] font-bold flex items-center justify-center tabular-nums ring-1 ring-white"
                    >
                      {{ p.lineup.jersey_number }}
                    </span>
                  </div>
                  <span class="text-[10px] font-medium text-white leading-tight truncate max-w-full drop-shadow">
                    {{ p.lineup.player?.common_name }}
                  </span>
                </div>
              </div>
            </div>
            
          </div>

        </div>
      </template>

      <!-- ── Bench ── -->
      <div v-if="benchSides.length" class="mt-4 space-y-3">
        <div
          v-for="b in benchSides"
          :key="`bench-${b.side}`"
          class="rounded-xl bg-gray-50 dark:bg-gray-800/50 overflow-hidden"
        >
          <div class="flex items-center gap-2 px-3 py-2 border-b border-gray-100 dark:border-gray-700/40">
            <TeamLogo :team="b.team" size="xs" />
            <span class="text-[12px] font-semibold text-gray-700 dark:text-gray-200 truncate">
              {{ b.team?.name }}
            </span>
            <span class="text-[11px] text-gray-400 dark:text-gray-500">Substitutes</span>
          </div>
          <div class="divide-y divide-gray-100 dark:divide-gray-700/30">
            <div
              v-for="(p, i) in b.players"
              :key="`${b.side}-sub-${p.player?.uuid ?? p.player_name ?? i}`"
              class="flex items-center gap-3 px-3 py-2"
            >
              <span class="w-5 text-[11px] font-bold text-gray-400 dark:text-gray-500 tabular-nums text-center shrink-0">
                {{ p.jersey_number ?? "-" }}
              </span>
              <img
                v-if="p.player?.image_path"
                :src="p.player.image_path"
                :alt="p.player_name ?? 'Player'"
                class="w-7 h-7 rounded-full object-cover bg-gray-100 dark:bg-gray-700 shrink-0"
              />
              <div
                v-else
                class="w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center shrink-0"
              >
                <v-icon name="hi-solid-user" class="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
              </div>
              <span class="text-[12px] font-medium text-gray-800 dark:text-gray-200 truncate flex-1 min-w-0">
                {{ p.player?.display_name ?? p.player_name ?? "Player" }}
              </span>
              <span
                v-if="p.position?.name || p.detailed_position?.name"
                class="text-[10px] text-gray-400 dark:text-gray-500 shrink-0"
              >
                {{ p.detailed_position?.name ?? p.position?.name }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Fallback list when there are no positioned starters at all -->
      <div v-if="!hasPitch && fallbackSides.length" class="space-y-3">
        <div
          v-for="b in fallbackSides"
          :key="`fb-${b.side}`"
          class="rounded-xl bg-gray-50 dark:bg-gray-800/50 overflow-hidden"
        >
          <div class="flex items-center gap-2 px-3 py-2 border-b border-gray-100 dark:border-gray-700/40">
            <TeamLogo :team="b.team" size="xs" />
            <span class="text-[12px] font-semibold text-gray-700 dark:text-gray-200 truncate">
              {{ b.team?.name }}
            </span>
          </div>
          <div class="divide-y divide-gray-100 dark:divide-gray-700/30">
            <div
              v-for="(p, i) in b.players"
              :key="`${b.side}-fb-${p.player?.uuid ?? p.player_name ?? i}`"
              class="flex items-center gap-3 px-3 py-2"
            >
              <span class="w-5 text-[11px] font-bold text-gray-400 dark:text-gray-500 tabular-nums text-center shrink-0">
                {{ p.jersey_number ?? "-" }}
              </span>
              <span class="text-[12px] font-medium text-gray-800 dark:text-gray-200 truncate flex-1 min-w-0">
                {{ p.player?.display_name ?? p.player_name ?? "Player" }}
              </span>
              <span
                v-if="p.position?.name"
                class="text-[10px] text-gray-400 dark:text-gray-500 shrink-0"
              >
                {{ p.position.name }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.tabular-nums {
  font-variant-numeric: tabular-nums;
}
</style>
