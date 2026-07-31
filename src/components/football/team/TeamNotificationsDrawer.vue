<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import BottomSheet from "@/components/ui/BottomSheet.vue";
import type { FootballTeamResponse } from "@/interfaces/football/team/FootballTeamResponse";
import type { TeamNotificationEventResponse } from "@/interfaces/user/notification/TeamNotificationEventResponse";
import { teamNotificationService } from "@/services/user/notification/TeamNotificationService";
import { useToast } from "@/composables/useToast";
import TeamLogo from "@/components/football/ui/TeamLogo.vue";

interface Props {
  isOpen: boolean;
  team: FootballTeamResponse | null;
}

const props = defineProps<Props>();
const emit = defineEmits<{ close: [] }>();

const { t } = useI18n();
const toast = useToast();

// ── State ──
const events = ref<TeamNotificationEventResponse[]>([]);
const isLoading = ref(false);
const loadError = ref<string | null>(null);
// The event currently being persisted (drives its inline spinner). A single
// in-flight save at a time keeps the `enabled_events` payload consistent.
const savingEvent = ref<string | null>(null);

const teamName = computed(() => props.team?.name ?? "");

const enabledCount = computed(() => events.value.filter((e) => e.enabled).length);

const loadEvents = async (teamUuid: string) => {
  isLoading.value = true;
  loadError.value = null;
  events.value = [];
  try {
    events.value = await teamNotificationService.getEventByTeamUuid(teamUuid);
  } catch (err) {
    console.error("Error loading team notification events:", err);
    loadError.value = t("football.team.notifications.loadError");
  } finally {
    isLoading.value = false;
  }
};

const retry = () => {
  if (props.team?.uuid) loadEvents(props.team.uuid);
};

// Fetch fresh each time the sheet opens (or the team changes while open) so the
// switches always reflect the server, then reset on close.
watch(
  () => [props.isOpen, props.team?.uuid] as const,
  ([open, uuid]) => {
    if (open && uuid) loadEvents(uuid);
    if (!open) {
      events.value = [];
      loadError.value = null;
      savingEvent.value = null;
    }
  },
);

// ── Toggle one event ──
// Optimistic: flip locally, then PUT the full enabled set. Revert on failure.
const toggle = async (event: TeamNotificationEventResponse) => {
  const teamUuid = props.team?.uuid;
  if (!teamUuid || savingEvent.value) return;

  event.enabled = !event.enabled;
  savingEvent.value = event.event;
  const enabledEvents = events.value.filter((e) => e.enabled).map((e) => e.event);

  try {
    await teamNotificationService.updateEventsByTeamUuid(teamUuid, enabledEvents);
  } catch (err) {
    console.error("Error updating team notification events:", err);
    event.enabled = !event.enabled; // revert
    toast.error(t("football.team.notifications.saveError"));
  } finally {
    savingEvent.value = null;
  }
};

// ── Event → football artifact (the drawer's signature) ──
// Instead of generic bells, each row shows the real thing the event is about:
// a ball for goals, a tilted referee card for bookings, etc. Unknown codes fall
// back to a bell so new backend events still render cleanly.
type EventTint = "emerald" | "red" | "amber" | "blue" | "slate" | "violet";

interface EventVisual {
  kind: "icon" | "card";
  icon?: string;
  card?: "yellow" | "red" | "yellowred";
  tint: EventTint;
}

const EVENT_VISUALS: Record<string, EventVisual> = {
  GOAL: { kind: "icon", icon: "gi-soccer-ball", tint: "emerald" },
  OWNGOAL: { kind: "icon", icon: "gi-soccer-ball", tint: "red" },
  PENALTY: { kind: "icon", icon: "gi-soccer-ball", tint: "amber" },
  MISSEDPENALTY: { kind: "icon", icon: "gi-soccer-ball", tint: "slate" },
  YELLOWCARD: { kind: "card", card: "yellow", tint: "amber" },
  REDCARD: { kind: "card", card: "red", tint: "red" },
  YELLOWREDCARD: { kind: "card", card: "yellowred", tint: "red" },
  SUBSTITUTION: { kind: "icon", icon: "hi-solid-switch-horizontal", tint: "blue" },
  LINEUP: { kind: "icon", icon: "hi-solid-clipboard-list", tint: "violet" },
  KICKOFF: { kind: "icon", icon: "hi-solid-clock", tint: "emerald" },
  MATCHSTARTED: { kind: "icon", icon: "hi-solid-clock", tint: "emerald" },
  FULLTIME: { kind: "icon", icon: "hi-solid-check-circle", tint: "slate" },
  MATCHENDED: { kind: "icon", icon: "hi-solid-check-circle", tint: "slate" },
  VAR: { kind: "icon", icon: "hi-solid-eye", tint: "violet" },
};

const FALLBACK_VISUAL: EventVisual = { kind: "icon", icon: "hi-solid-bell", tint: "emerald" };

const visualFor = (event: string): EventVisual =>
  EVENT_VISUALS[event.toUpperCase().replace(/[^A-Z]/g, "")] ?? FALLBACK_VISUAL;

const TINT_TILE: Record<EventTint, string> = {
  emerald: "bg-emerald-50 dark:bg-emerald-900/25 text-emerald-600 dark:text-emerald-400",
  red: "bg-red-50 dark:bg-red-900/25 text-red-500 dark:text-red-400",
  amber: "bg-amber-50 dark:bg-amber-900/25 text-amber-500 dark:text-amber-400",
  blue: "bg-blue-50 dark:bg-blue-900/25 text-blue-500 dark:text-blue-400",
  slate: "bg-gray-100 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400",
  violet: "bg-violet-50 dark:bg-violet-900/25 text-violet-500 dark:text-violet-400",
};
</script>

<template>
  <!-- Elevated (z-150) so it can open on top of the team-profile sheet (z-130). -->
  <BottomSheet
    :is-visible="isOpen"
    size="lg"
    role="dialog"
    :z-index="150"
    :aria-label="$t('football.team.notifications.aria')"
    @close="emit('close')"
  >
    <!-- Custom header: team logo + title + summary -->
    <template #header>
      <div class="flex items-center justify-between gap-3">
        <div class="flex items-center gap-3 min-w-0">
          <TeamLogo v-if="team" :team="team" size="lg" variant="square" />
          <div class="min-w-0">
            <h2 class="text-base font-bold text-gray-900 dark:text-white truncate">
              {{ $t('football.team.notifications.title') }}
            </h2>
            <p class="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
              <template v-if="!isLoading && !loadError && events.length">
                {{ $t('football.team.notifications.summary', { count: enabledCount, total: events.length }) }}
              </template>
              <template v-else>
                {{ teamName }}
              </template>
            </p>
          </div>
        </div>
        <button
          @click="emit('close')"
          class="w-8 h-8 shrink-0 flex items-center justify-center rounded-full text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-90 transition-all"
          :aria-label="$t('common.actions.close')"
        >
          <v-icon name="hi-solid-x" class="w-4 h-4" />
        </button>
      </div>
    </template>

    <!-- Body -->
    <!-- Loading -->
    <div v-if="isLoading" class="space-y-2">
      <div
        v-for="n in 5"
        :key="n"
        class="flex items-center gap-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 p-3"
      >
        <div class="w-9 h-9 rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse shrink-0" />
        <div class="h-3 flex-1 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
        <div class="w-12 h-7 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse shrink-0" />
      </div>
    </div>

    <!-- Error -->
    <div
      v-else-if="loadError"
      class="min-h-[40vh] flex flex-col items-center justify-center text-center"
    >
      <v-icon name="hi-solid-exclamation-circle" class="w-9 h-9 text-red-400 dark:text-red-500 mb-3" />
      <p class="text-footnote text-red-500 dark:text-red-400 mb-3">{{ loadError }}</p>
      <button
        @click="retry"
        class="px-4 py-2 text-xs font-semibold rounded-full bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"
      >
        {{ $t('common.actions.retry') }}
      </button>
    </div>

    <!-- Empty -->
    <div
      v-else-if="!events.length"
      class="min-h-[40vh] flex flex-col items-center justify-center text-center"
    >
      <v-icon name="hi-solid-bell" class="w-9 h-9 text-gray-200 dark:text-gray-700 mb-2" />
      <p class="text-footnote text-gray-400 dark:text-gray-500">
        {{ $t('football.team.notifications.empty') }}
      </p>
    </div>

    <!-- Events -->
    <template v-else>
      <p class="text-2xs text-gray-400 dark:text-gray-500 px-1 mb-2.5">
        {{ $t('football.team.notifications.hint', { name: teamName }) }}
      </p>
      <div class="space-y-1.5">
        <div
          v-for="ev in events"
          :key="ev.event"
          class="flex items-center gap-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 p-3"
        >
          <!-- Artifact tile -->
          <div
            class="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
            :class="TINT_TILE[visualFor(ev.event).tint]"
          >
            <template v-if="visualFor(ev.event).kind === 'card'">
              <!-- Yellow/red card as its literal object -->
              <span class="relative inline-flex" style="transform: rotate(9deg)">
                <span
                  v-if="visualFor(ev.event).card === 'yellowred'"
                  class="absolute -left-1 top-0 w-3 h-4 rounded-[3px] bg-amber-400 shadow-sm"
                />
                <span
                  class="relative w-3 h-4 rounded-[3px] shadow-sm"
                  :class="visualFor(ev.event).card === 'yellow' ? 'bg-amber-400' : 'bg-red-500'"
                />
              </span>
            </template>
            <v-icon v-else :name="visualFor(ev.event).icon" class="w-5 h-5" />
          </div>

          <p class="flex-1 min-w-0 text-footnote font-semibold text-gray-800 dark:text-gray-200 truncate">
            {{ ev.name }}
          </p>

          <!-- Toggle -->
          <button
            @click="toggle(ev)"
            :disabled="!!savingEvent"
            class="relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 shrink-0"
            :class="[
              ev.enabled ? 'bg-emerald-600' : 'bg-gray-300 dark:bg-gray-600',
              savingEvent && savingEvent !== ev.event ? 'opacity-40' : '',
            ]"
            :aria-pressed="ev.enabled"
            :aria-label="$t('football.team.notifications.toggleAria', { name: ev.name })"
          >
            <span
              class="inline-flex items-center justify-center h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200"
              :class="ev.enabled ? 'translate-x-6' : 'translate-x-1'"
            >
              <v-icon
                v-if="savingEvent === ev.event"
                name="pr-spinner"
                class="w-3 h-3 text-emerald-600 animate-spin"
              />
            </span>
          </button>
        </div>
      </div>
    </template>
  </BottomSheet>
</template>
