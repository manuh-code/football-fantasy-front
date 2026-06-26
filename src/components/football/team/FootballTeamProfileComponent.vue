<script setup lang="ts">
import { computed, ref, watch, onBeforeUnmount, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { footballTeamService } from "@/services/football/team/FootballTeamService";
import type {
  FootballTeamProfileResponse,
  TeamPlayerProfile,
  BestPlayersGroup,
} from "@/interfaces/football/team/FootballTeamProfileResponse";
import type { FootballFixtureResponse } from "@/interfaces/football/fixture/FootballFixtureResponse";
import type { FootballTeamResponse } from "@/interfaces/football/team/FootballTeamResponse";
import TeamLogo from "@/components/football/ui/TeamLogo.vue";
import FootballTeamProfileSkeleton from "./FootballTeamProfileSkeleton.vue";

interface Props {
  isOpen: boolean;
  teamUuid: string | null;
  stageUuid: string | null;
  /** Raise the stacking order so the drawer can sit above another open drawer (e.g. the Match Center). */
  elevated?: boolean;
}

const props = withDefaults(defineProps<Props>(), { elevated: false });
const emit = defineEmits<{ close: [] }>();

const { t } = useI18n();

// ── Tabs (each one maps to a property of FootballTeamProfileResponse) ──
type ProfileTab = "team" | "players" | "best_players" | "latest" | "sidelined" | "venue";

const tabs = computed<{ key: ProfileTab; label: string; icon: string }[]>(() => [
  { key: "team", label: t("football.team.tabs.team"), icon: "hi-solid-information-circle" },
  { key: "players", label: t("football.team.tabs.players"), icon: "hi-solid-users" },
  { key: "best_players", label: t("football.team.tabs.bestPlayers"), icon: "hi-solid-star" },
  { key: "latest", label: t("football.team.tabs.latest"), icon: "md-history" },
  { key: "sidelined", label: t("football.team.tabs.sidelined"), icon: "hi-solid-user" },
  { key: "venue", label: t("football.team.tabs.venue"), icon: "hi-solid-location-marker" },
]);

const activeTab = ref<ProfileTab>("team");

// ── State ──
const profile = ref<FootballTeamProfileResponse | null>(null);
const isLoading = ref(false);
const loadError = ref<string | null>(null);

const loadProfile = async (teamUuid: string, stageUuid: string) => {
  isLoading.value = true;
  loadError.value = null;
  profile.value = null;
  activeTab.value = "team";
  try {
    profile.value = await footballTeamService.getTeamProfileByStage(teamUuid, stageUuid);
  } catch (err) {
    console.error("Error loading team profile:", err);
    loadError.value = t("football.team.loadError");
  } finally {
    isLoading.value = false;
  }
};

const retry = () => {
  if (props.teamUuid && props.stageUuid) loadProfile(props.teamUuid, props.stageUuid);
};

watch(
  () => [props.isOpen, props.teamUuid, props.stageUuid] as const,
  ([open, teamUuid, stageUuid]) => {
    if (open && teamUuid && stageUuid) loadProfile(teamUuid, stageUuid);
    if (!open) {
      profile.value = null;
      loadError.value = null;
    }
  },
);

// ── Players grouped by position (GK → DEF → MID → ATT) ──
const POSITION_ORDER: Record<string, number> = {
  goalkeeper: 0,
  defender: 1,
  midfielder: 2,
  attacker: 3,
};

const playerGroups = computed<{ label: string; players: TeamPlayerProfile[] }[]>(() => {
  const list = profile.value?.players ?? [];
  const buckets = new Map<string, { label: string; players: TeamPlayerProfile[] }>();
  for (const p of list) {
    const label = p.position?.name ?? t("football.team.otherPosition");
    const key = p.position?.code ?? "other";
    if (!buckets.has(key)) buckets.set(key, { label, players: [] });
    buckets.get(key)!.players.push(p);
  }
  return Array.from(buckets.entries())
    .sort(([a], [b]) => (POSITION_ORDER[a] ?? 99) - (POSITION_ORDER[b] ?? 99))
    .map(([, group]) => ({
      ...group,
      players: group.players.sort((a, b) => a.jersey_number - b.jersey_number),
    }));
});

// ── Best players: title + colored accent per leaderboard ──
const bestPlayerTitle = (group: BestPlayersGroup): string =>
  group.statistics[0]?.type?.name ?? group.type ?? t("football.team.topFallback");

// ── Latest fixtures helpers ──
const getParticipant = (
  fixture: FootballFixtureResponse,
  location: "home" | "away",
): FootballTeamResponse | undefined =>
  fixture.participants?.find((p) => p.meta?.location === location);

const teamName = (team: FootballTeamResponse | undefined): string =>
  team?.name ?? t("football.team.tbd");

const score = (team: FootballTeamResponse | undefined): number | null =>
  team?.current_score?.score ?? null;

const hasScores = (fixture: FootballFixtureResponse): boolean =>
  score(getParticipant(fixture, "home")) !== null &&
  score(getParticipant(fixture, "away")) !== null;

const resultClass = (fixture: FootballFixtureResponse, location: "home" | "away"): string => {
  const team = getParticipant(fixture, location);
  if (!team || team.meta?.winner === null || team.meta?.winner === undefined) {
    return "text-gray-700 dark:text-gray-200";
  }
  const home = getParticipant(fixture, "home");
  const away = getParticipant(fixture, "away");
  // Draw → both winners are explicitly false and scores are equal
  if (
    home?.meta?.winner === false &&
    away?.meta?.winner === false &&
    score(home) === score(away)
  ) {
    return "text-yellow-600 dark:text-yellow-400 font-medium";
  }
  return team.meta?.winner
    ? "text-emerald-600 dark:text-emerald-400 font-semibold"
    : "text-red-500 dark:text-red-400";
};

// ── Section emptiness (drive empty states per tab) ──
const isEmptyTab = computed<boolean>(() => {
  const p = profile.value;
  if (!p) return true;
  switch (activeTab.value) {
    case "players":
      return p.players.length === 0;
    case "best_players":
      return p.best_players.length === 0;
    case "latest":
      return p.latest.length === 0;
    case "sidelined":
      return p.sidelined.length === 0;
    case "venue":
      return !p.venue;
    default:
      return false;
  }
});

// ── Keyboard / body lock ──
const onKeydown = (e: KeyboardEvent) => {
  if (e.key === "Escape" && props.isOpen) emit("close");
};

onMounted(() => {
  window.addEventListener("keydown", onKeydown);
});
onBeforeUnmount(() => {
  window.removeEventListener("keydown", onKeydown);
});

watch(
  () => props.isOpen,
  (open) => {
    if (typeof document !== "undefined") {
      document.body.style.overflow = open ? "hidden" : "";
    }
    if (!open) {
      dragOffsetY.value = 0;
      isDragging.value = false;
    }
  },
);

// ── Drag-to-dismiss ──
const dragOffsetY = ref(0);
const isDragging = ref(false);
const dragStartY = ref(0);
const dragStartTime = ref(0);

const onDragStart = (e: PointerEvent) => {
  if (e.pointerType === "mouse" && e.button !== 0) return;
  isDragging.value = true;
  dragStartY.value = e.clientY;
  dragStartTime.value = Date.now();
  dragOffsetY.value = 0;
  (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
};

const onDragMove = (e: PointerEvent) => {
  if (!isDragging.value) return;
  const delta = e.clientY - dragStartY.value;
  dragOffsetY.value = delta > 0 ? delta : delta * 0.15;
};

const onDragEnd = (e: PointerEvent) => {
  if (!isDragging.value) return;
  isDragging.value = false;
  try {
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
  } catch {
    // ignore
  }
  const elapsed = Date.now() - dragStartTime.value;
  const velocity = elapsed > 0 ? dragOffsetY.value / elapsed : 0;
  const shouldClose = dragOffsetY.value > 100 || velocity > 0.6;
  dragOffsetY.value = 0;
  if (shouldClose) emit("close");
};
</script>

<template>
  <Teleport to="body">
    <!-- Backdrop -->
    <Transition name="tp-fade">
      <div
        v-if="isOpen"
        class="fixed inset-0 bg-black/60 backdrop-blur-sm"
        :class="elevated ? 'z-[125]' : 'z-[105]'"
        @click="emit('close')"
      />
    </Transition>

    <!-- Sheet wrapper -->
    <Transition name="tp-slide">
      <div
        v-if="isOpen"
        class="fixed bottom-0 left-0 right-0 md:left-4 md:right-4 md:bottom-4 md:max-w-2xl md:mx-auto pointer-events-none"
        :class="elevated ? 'z-[130]' : 'z-[110]'"
      >
        <div
          :style="{
            transform: `translateY(${dragOffsetY}px)`,
            transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)',
          }"
          class="flex flex-col bg-white dark:bg-gray-900 shadow-2xl rounded-t-3xl md:rounded-3xl max-h-[92dvh] md:max-h-[88dvh] overflow-hidden pointer-events-auto"
          role="dialog"
          aria-modal="true"
          :aria-label="$t('football.team.profileAria')"
        >
          <!-- Draggable header -->
          <div
            @pointerdown="onDragStart"
            @pointermove="onDragMove"
            @pointerup="onDragEnd"
            @pointercancel="onDragEnd"
            class="relative shrink-0 cursor-grab active:cursor-grabbing touch-none select-none border-b border-gray-100 dark:border-gray-800"
          >
            <!-- Drag handle indicator -->
            <div class="flex justify-center pt-2.5 pb-1.5">
              <div class="w-10 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600" />
            </div>

            <!-- Team header + close -->
            <div class="flex items-center justify-between gap-3 px-4 pb-3 pt-1">
              <div class="flex items-center gap-3 min-w-0">
                <TeamLogo
                  v-if="profile?.team"
                  :team="profile.team"
                  size="lg"
                  variant="square"
                />
                <div
                  v-else
                  class="w-12 h-12 rounded-md bg-gray-100 dark:bg-gray-800 animate-pulse shrink-0"
                />
                <div class="min-w-0">
                  <h2 class="text-callout font-bold text-gray-900 dark:text-white truncate">
                    {{ profile?.team?.name ?? $t('football.team.profileFallback') }}
                  </h2>
                  <div
                    v-if="profile?.team?.country"
                    class="flex items-center gap-1.5 mt-0.5"
                  >
                    <img
                      v-if="profile.team.country.image_path"
                      :src="profile.team.country.image_path"
                      :alt="profile.team.country.name ?? ''"
                      class="w-3.5 h-3.5 rounded-full object-cover shrink-0"
                    />
                    <span class="text-2xs text-gray-400 dark:text-gray-500 truncate">
                      {{ profile.team.country.name }}
                      <template v-if="profile.team.founded"> · {{ $t('football.team.establishedShort', { year: profile.team.founded }) }}</template>
                    </span>
                  </div>
                </div>
              </div>
              <button
                @click.stop="emit('close')"
                @pointerdown.stop
                class="w-8 h-8 -mr-1 flex items-center justify-center rounded-full text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors shrink-0"
                :aria-label="$t('common.actions.close')"
              >
                <v-icon name="hi-x" class="w-4 h-4" />
              </button>
            </div>
          </div>

          <!-- Linear tab menu -->
          <div
            v-if="!isLoading && !loadError"
            class="shrink-0 px-4 pt-2.5 pb-2.5 border-b border-gray-100 dark:border-gray-800"
          >
            <div
              class="tab-track flex items-center gap-1 p-0.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-x-auto"
              role="tablist"
              :aria-label="$t('football.team.sectionsAria')"
            >
              <button
                v-for="tab in tabs"
                :key="tab.key"
                type="button"
                role="tab"
                :aria-selected="activeTab === tab.key"
                @click="activeTab = tab.key"
                class="shrink-0 flex items-center justify-center gap-1.5 h-8 px-3.5 rounded-full text-xs font-semibold tracking-wide whitespace-nowrap transition-all duration-200"
                :class="
                  activeTab === tab.key
                    ? 'bg-white dark:bg-gray-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                "
              >
                <v-icon :name="tab.icon" class="w-3.5 h-3.5 shrink-0" />
                <span>{{ tab.label }}</span>
              </button>
            </div>
          </div>

          <!-- Scrollable body -->
          <div
            class="flex-1 overflow-y-auto overscroll-contain"
            style="padding-bottom: calc(2rem + env(safe-area-inset-bottom))"
          >
            <!-- Loading skeleton -->
            <FootballTeamProfileSkeleton v-if="isLoading" />

            <!-- Error -->
            <div
              v-else-if="loadError"
              class="px-4 py-16 flex flex-col items-center text-center"
            >
              <v-icon
                name="hi-solid-exclamation-circle"
                class="w-9 h-9 text-red-400 dark:text-red-500 mb-3"
              />
              <p class="text-footnote text-red-500 dark:text-red-400 mb-3">{{ loadError }}</p>
              <button
                @click="retry"
                class="px-4 py-2 text-xs font-semibold rounded-full bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"
              >
                {{ $t('common.actions.retry') }}
              </button>
            </div>

            <!-- Loaded -->
            <template v-else-if="profile">
              <!-- Empty state for the active tab -->
              <div
                v-if="isEmptyTab"
                class="px-4 py-16 flex flex-col items-center text-center"
              >
                <v-icon
                  name="hi-solid-inbox"
                  class="w-9 h-9 text-gray-200 dark:text-gray-700 mb-2"
                />
                <p class="text-footnote text-gray-400 dark:text-gray-500">
                  {{ $t('football.team.emptyTab') }}
                </p>
              </div>

              <Transition v-else name="tp-tab" mode="out-in">
                <!-- ── Team ── -->
                <div key="team" v-if="activeTab === 'team'" class="px-4 py-4 space-y-4">
                  <div class="flex flex-col items-center text-center pt-2">
                    <TeamLogo :team="profile.team" size="xl" variant="square" />
                    <h3 class="mt-3 text-xl font-bold text-gray-900 dark:text-white">
                      {{ profile.team?.name }}
                    </h3>
                    <span
                      v-if="profile.team?.short_code"
                      class="mt-1 text-2xs font-semibold tracking-widest text-gray-400 dark:text-gray-500 uppercase"
                    >
                      {{ profile.team.short_code }}
                    </span>
                  </div>

                  <div class="grid grid-cols-2 gap-2.5">
                    <div class="rounded-xl bg-gray-50 dark:bg-gray-800/50 p-3">
                      <p class="text-2xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">{{ $t('football.team.country') }}</p>
                      <div class="flex items-center gap-1.5 mt-1">
                        <img
                          v-if="profile.team?.country?.image_path"
                          :src="profile.team.country.image_path"
                          :alt="profile.team.country.name ?? ''"
                          class="w-4 h-4 rounded-full object-cover shrink-0"
                        />
                        <p class="text-footnote font-semibold text-gray-800 dark:text-gray-200 truncate">
                          {{ profile.team?.country?.name ?? "—" }}
                        </p>
                      </div>
                    </div>
                    <div class="rounded-xl bg-gray-50 dark:bg-gray-800/50 p-3">
                      <p class="text-2xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">{{ $t('football.team.founded') }}</p>
                      <p class="text-footnote font-semibold text-gray-800 dark:text-gray-200 mt-1">
                        {{ profile.team?.founded ?? "—" }}
                      </p>
                    </div>
                    <div class="rounded-xl bg-gray-50 dark:bg-gray-800/50 p-3">
                      <p class="text-2xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">{{ $t('football.team.squad') }}</p>
                      <p class="text-footnote font-semibold text-gray-800 dark:text-gray-200 mt-1">
                        {{ $t('football.team.squadCount', { count: profile.players.length }) }}
                      </p>
                    </div>
                    <div class="rounded-xl bg-gray-50 dark:bg-gray-800/50 p-3">
                      <p class="text-2xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">{{ $t('football.team.stadium') }}</p>
                      <p class="text-footnote font-semibold text-gray-800 dark:text-gray-200 mt-1 truncate">
                        {{ profile.venue?.name ?? "—" }}
                      </p>
                    </div>
                  </div>
                </div>

                <!-- ── Players ── -->
                <div key="players" v-else-if="activeTab === 'players'" class="px-4 py-3">
                  <div
                    v-for="group in playerGroups"
                    :key="group.label"
                    class="mb-4 last:mb-0"
                  >
                    <p class="text-2xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1.5 px-1">
                      {{ group.label }}
                    </p>
                    <div class="space-y-1.5">
                      <div
                        v-for="tp in group.players"
                        :key="tp.player.uuid"
                        class="flex items-center gap-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 p-2.5"
                      >
                        <span class="w-6 text-center text-xs font-bold text-gray-400 dark:text-gray-500 tabular-nums shrink-0">
                          {{ tp.jersey_number || "—" }}
                        </span>
                        <img
                          v-if="tp.player.image_path"
                          :src="tp.player.image_path"
                          :alt="tp.player.display_name"
                          class="w-9 h-9 rounded-full object-cover bg-gray-100 dark:bg-gray-700 shrink-0"
                        />
                        <div
                          v-else
                          class="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center shrink-0"
                        >
                          <v-icon name="hi-solid-user" class="w-4 h-4 text-gray-400 dark:text-gray-500" />
                        </div>
                        <div class="min-w-0 flex-1">
                          <div class="flex items-center gap-1.5 min-w-0">
                            <p class="text-footnote font-semibold text-gray-800 dark:text-gray-200 truncate">
                              {{ tp.player.display_name }}
                            </p>
                            <span
                              v-if="tp.captain"
                              class="shrink-0 inline-flex items-center justify-center w-4 h-4 rounded-full bg-amber-100 dark:bg-amber-900/40 text-2xs font-bold text-amber-600 dark:text-amber-400"
                              :title="$t('football.team.captain')"
                            >
                              C
                            </span>
                          </div>
                          <p class="text-2xs text-gray-400 dark:text-gray-500 truncate">
                            {{ tp.detailed_position?.name ?? tp.position?.name ?? "—" }}
                          </p>
                        </div>
                        <span
                          v-if="tp.player.age"
                          class="shrink-0 text-2xs text-gray-400 dark:text-gray-500 tabular-nums"
                        >
                          {{ tp.player.age }}y
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- ── Best Players ── -->
                <div key="best_players" v-else-if="activeTab === 'best_players'" class="px-4 py-3 space-y-4">
                  <div
                    v-for="(group, gIdx) in profile.best_players"
                    :key="group.type + '-' + gIdx"
                  >
                    <div class="flex items-center justify-between mb-1.5 px-1">
                      <p class="text-xs font-bold text-gray-800 dark:text-gray-200">
                        {{ bestPlayerTitle(group) }}
                      </p>
                      <span class="text-2xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                        {{ group.stat_group }}
                      </span>
                    </div>
                    <div class="space-y-1.5">
                      <div
                        v-for="(stat, sIdx) in group.statistics.slice(0, 5)"
                        :key="stat.player.uuid + '-' + sIdx"
                        class="flex items-center gap-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 p-2.5"
                      >
                        <span class="w-5 text-center text-xs font-bold text-gray-400 dark:text-gray-500 tabular-nums shrink-0">
                          {{ sIdx + 1 }}
                        </span>
                        <img
                          v-if="stat.player.image_path"
                          :src="stat.player.image_path"
                          :alt="stat.player.display_name"
                          class="w-8 h-8 rounded-full object-cover bg-gray-100 dark:bg-gray-700 shrink-0"
                        />
                        <div
                          v-else
                          class="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center shrink-0"
                        >
                          <v-icon name="hi-solid-user" class="w-4 h-4 text-gray-400 dark:text-gray-500" />
                        </div>
                        <p class="flex-1 min-w-0 text-footnote font-semibold text-gray-800 dark:text-gray-200 truncate">
                          {{ stat.player.display_name }}
                        </p>
                        <span class="shrink-0 inline-flex items-center justify-center min-w-[36px] px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-900/30 text-xs font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">
                          {{ stat.value }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- ── Latest ── -->
                <div key="latest" v-else-if="activeTab === 'latest'" class="divide-y divide-gray-100 dark:divide-gray-700/50">
                  <div
                    v-for="(fixture, fIdx) in profile.latest"
                    :key="fixture.uuid || fIdx"
                    class="px-4 py-3"
                  >
                    <div class="text-center mb-2">
                      <span class="text-2xs font-medium text-gray-400 dark:text-gray-500 tracking-wide">
                        {{ fixture.starting_at }}
                      </span>
                    </div>
                    <div class="flex items-center gap-2">
                      <!-- Home -->
                      <div class="flex items-center gap-2 flex-1 min-w-0">
                        <TeamLogo :team="getParticipant(fixture, 'home')" size="md" />
                        <span
                          :class="resultClass(fixture, 'home')"
                          class="text-footnote font-medium truncate"
                        >
                          {{ teamName(getParticipant(fixture, "home")) }}
                        </span>
                      </div>

                      <!-- Score -->
                      <div class="flex flex-col items-center shrink-0 min-w-[56px]">
                        <div class="tabular-nums text-xl font-bold text-gray-900 dark:text-white">
                          <template v-if="hasScores(fixture)">
                            {{ score(getParticipant(fixture, "home")) }}<span class="text-gray-300 dark:text-gray-600 mx-0.5">-</span>{{ score(getParticipant(fixture, "away")) }}
                          </template>
                          <span v-else class="text-2xs font-semibold text-gray-300 dark:text-gray-600 uppercase tracking-wider">vs</span>
                        </div>
                      </div>

                      <!-- Away -->
                      <div class="flex items-center gap-2 flex-1 min-w-0 justify-end">
                        <span
                          :class="resultClass(fixture, 'away')"
                          class="text-footnote font-medium truncate text-right"
                        >
                          {{ teamName(getParticipant(fixture, "away")) }}
                        </span>
                        <TeamLogo :team="getParticipant(fixture, 'away')" size="md" />
                      </div>
                    </div>
                  </div>
                </div>

                <!-- ── Sidelined ── -->
                <div key="sidelined" v-else-if="activeTab === 'sidelined'" class="px-4 py-3">
                  <div class="space-y-2">
                    <div
                      v-for="(s, sIdx) in profile.sidelined"
                      :key="s.player.uuid + '-' + sIdx"
                      class="flex items-center gap-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 p-2.5"
                    >
                      <img
                        v-if="s.player.image_path"
                        :src="s.player.image_path"
                        :alt="s.player.display_name"
                        class="w-9 h-9 rounded-full object-cover bg-gray-100 dark:bg-gray-700 shrink-0"
                      />
                      <div
                        v-else
                        class="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center shrink-0"
                      >
                        <v-icon name="hi-solid-user" class="w-4 h-4 text-gray-400 dark:text-gray-500" />
                      </div>
                      <div class="min-w-0 flex-1">
                        <p class="text-footnote font-semibold text-gray-800 dark:text-gray-200 truncate">
                          {{ s.player.display_name }}
                        </p>
                        <p class="text-2xs text-red-500 dark:text-red-400 truncate">
                          {{ s.type?.name ?? s.category ?? $t('football.team.sidelinedFallback') }}
                        </p>
                      </div>
                      <span
                        v-if="s.games_missed"
                        class="shrink-0 text-2xs text-gray-400 dark:text-gray-500 tabular-nums text-right"
                        :title="$t('football.team.gamesMissedTitle', { count: s.games_missed })"
                      >
                        {{ s.games_missed }} <span class="text-2xs uppercase">{{ $t('football.team.missed') }}</span>
                      </span>
                    </div>
                  </div>
                </div>

                <!-- ── Venue ── -->
                <div key="venue" v-else class="px-4 py-4">
                  <div class="rounded-2xl overflow-hidden bg-gray-50 dark:bg-gray-800/50">
                    <img
                      v-if="profile.venue?.image_path"
                      :src="profile.venue.image_path"
                      :alt="profile.venue?.name ?? ''"
                      class="w-full h-40 object-cover bg-gray-100 dark:bg-gray-700"
                    />
                    <div class="p-4">
                      <h3 class="text-callout font-bold text-gray-900 dark:text-white">
                        {{ profile.venue?.name ?? "—" }}
                      </h3>
                      <p
                        v-if="profile.venue?.city_name"
                        class="text-xs text-gray-400 dark:text-gray-500 mt-0.5"
                      >
                        {{ profile.venue.city_name }}<template v-if="profile.venue?.country?.name">, {{ profile.venue.country.name }}</template>
                      </p>

                      <div class="grid grid-cols-2 gap-2.5 mt-4">
                        <div class="rounded-xl bg-white dark:bg-gray-800 p-3">
                          <p class="text-2xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">{{ $t('football.team.capacity') }}</p>
                          <p class="text-footnote font-semibold text-gray-800 dark:text-gray-200 mt-1 tabular-nums">
                            {{ profile.venue?.capacity ? profile.venue.capacity.toLocaleString() : "—" }}
                          </p>
                        </div>
                        <div class="rounded-xl bg-white dark:bg-gray-800 p-3">
                          <p class="text-2xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">{{ $t('football.team.surface') }}</p>
                          <p class="text-footnote font-semibold text-gray-800 dark:text-gray-200 mt-1 capitalize">
                            {{ profile.venue?.surface ?? "—" }}
                          </p>
                        </div>
                        <div
                          v-if="profile.venue?.address"
                          class="col-span-2 rounded-xl bg-white dark:bg-gray-800 p-3"
                        >
                          <p class="text-2xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">{{ $t('football.team.address') }}</p>
                          <p class="text-xs text-gray-700 dark:text-gray-300 mt-1">
                            {{ profile.venue.address }}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Transition>
            </template>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.tp-fade-enter-active,
.tp-fade-leave-active {
  transition: opacity 0.2s ease;
}
.tp-fade-enter-from,
.tp-fade-leave-to {
  opacity: 0;
}

.tp-slide-enter-active,
.tp-slide-leave-active {
  transition: transform 0.35s cubic-bezier(0.32, 0.72, 0, 1);
}
.tp-slide-enter-from,
.tp-slide-leave-to {
  transform: translateY(100%);
}

.tp-tab-enter-active,
.tp-tab-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}
.tp-tab-enter-from {
  opacity: 0;
  transform: translateY(6px);
}
.tp-tab-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

.tab-track {
  scrollbar-width: none;
  -ms-overflow-style: none;
  scroll-padding: 0 0.5rem;
}
.tab-track::-webkit-scrollbar {
  display: none;
}

.tabular-nums {
  font-variant-numeric: tabular-nums;
}
</style>
