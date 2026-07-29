<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { BottomSheet } from '@/components/ui'
import AvailabilityFilter from '@/components/user/fantasy/search/AvailabilityFilter.vue'
import type { FootballTeamResponse } from '@/interfaces/football/team/FootballTeamResponse'
import type { UserDataInterface } from '@/interfaces/user/userInterface'

interface Props {
  isVisible: boolean
  teams: FootballTeamResponse[]
  participants: UserDataInterface[]
  selectedAvailability: string
  selectedTeam: string
  selectedUser: string
  /** Availability is meaningless while drafting (only free players can be picked). */
  showAvailability?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showAvailability: true,
})

const emit = defineEmits<{
  close: []
  'update:selectedAvailability': [value: string]
  'update:selectedTeam': [value: string]
  'update:selectedUser': [value: string]
  /** Reset every filter this sheet owns back to its default. */
  clear: []
}>()

const { t } = useI18n()

const DEFAULT_TEAM = '/img/default-team.svg'
const DEFAULT_AVATAR = '/img/default-avatar.svg'

// ── Team list (inline, searchable — no nested sheet) ──
const teamQuery = ref('')
const filteredTeams = computed(() => {
  const q = teamQuery.value.trim().toLowerCase()
  if (!q) return props.teams
  return props.teams.filter((team) => {
    const name = (team.name ?? '').toLowerCase()
    const code = (team.short_code ?? '').toLowerCase()
    return name.includes(q) || code.includes(q)
  })
})

/** Compose a readable name — UserDataInterface has no display_name. */
function participantName(p: UserDataInterface): string {
  const full = [p.firstname, p.lastname].filter(Boolean).join(' ').trim()
  return full || p.email || t('fantasy.search.participantFallbackName')
}

function onTeamImageError(e: Event) {
  ;(e.target as HTMLImageElement).src = DEFAULT_TEAM
}
function onAvatarError(e: Event) {
  ;(e.target as HTMLImageElement).src = DEFAULT_AVATAR
}

// Filters apply immediately (the list reloads behind the sheet); the footer just
// closes. Count drives the "Limpiar" affordance so it only shows when it does
// something.
const activeCount = computed(() => {
  let n = 0
  if (props.showAvailability && props.selectedAvailability !== 'available') n++
  if (props.selectedTeam !== 'ALL') n++
  if (props.selectedUser !== 'ALL') n++
  return n
})
</script>

<template>
  <BottomSheet
    :is-visible="isVisible"
    :title="$t('fantasy.search.filtersTitle')"
    :subtitle="$t('fantasy.search.filtersSubtitle')"
    icon="hi-solid-adjustments"
    icon-variant="blue"
    size="lg"
    @close="emit('close')"
  >
    <div class="space-y-5 pb-1">
      <!-- Availability -->
      <section v-if="showAvailability" class="space-y-2">
        <h4 class="px-1 text-2xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
          {{ $t('fantasy.search.sectionAvailability') }}
        </h4>
        <AvailabilityFilter
          :selected-availability="selectedAvailability"
          @update:selected-availability="emit('update:selectedAvailability', $event)"
        />
      </section>

      <!-- Team -->
      <section class="space-y-2">
        <h4 class="px-1 text-2xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
          {{ $t('fantasy.search.sectionTeam') }}
        </h4>

        <!-- Search box, only when the list is long enough to warrant it -->
        <div v-if="teams.length > 8" class="relative px-1">
          <v-icon
            name="hi-solid-search"
            class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 pointer-events-none"
          />
          <input
            v-model="teamQuery"
            type="text"
            :placeholder="$t('fantasy.search.searchTeam')"
            class="w-full h-10 pl-9 pr-3 text-base md:text-sm text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800 border border-transparent rounded-xl placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          />
        </div>

        <div class="max-h-52 overflow-y-auto overscroll-contain px-1 space-y-0.5">
          <!-- All teams -->
          <button
            type="button"
            @click="emit('update:selectedTeam', 'ALL')"
            class="w-full flex items-center gap-3 px-2.5 py-2.5 rounded-xl text-left transition-colors active:scale-[0.99]"
            :class="
              selectedTeam === 'ALL'
                ? 'bg-blue-50 dark:bg-blue-900/20'
                : 'hover:bg-gray-50 dark:hover:bg-gray-800/60'
            "
          >
            <span class="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center shrink-0">
              <v-icon name="hi-solid-view-grid" class="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </span>
            <span
              class="flex-1 min-w-0 text-footnote font-medium truncate"
              :class="
                selectedTeam === 'ALL'
                  ? 'text-blue-700 dark:text-blue-300'
                  : 'text-gray-900 dark:text-white'
              "
            >
              {{ $t('fantasy.search.allTeams') }}
            </span>
            <v-icon
              v-if="selectedTeam === 'ALL'"
              name="hi-solid-check"
              class="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0"
            />
          </button>

          <!-- Team rows -->
          <button
            v-for="team in filteredTeams"
            :key="team.uuid"
            type="button"
            @click="emit('update:selectedTeam', team.uuid)"
            class="w-full flex items-center gap-3 px-2.5 py-2.5 rounded-xl text-left transition-colors active:scale-[0.99]"
            :class="
              selectedTeam === team.uuid
                ? 'bg-blue-50 dark:bg-blue-900/20'
                : 'hover:bg-gray-50 dark:hover:bg-gray-800/60'
            "
          >
            <img
              :src="team.image_path || DEFAULT_TEAM"
              :alt="team.name"
              class="w-8 h-8 object-contain shrink-0"
              @error="onTeamImageError"
            />
            <span
              class="flex-1 min-w-0 text-footnote font-medium truncate"
              :class="
                selectedTeam === team.uuid
                  ? 'text-blue-700 dark:text-blue-300'
                  : 'text-gray-900 dark:text-white'
              "
            >
              {{ team.name }}
            </span>
            <span class="text-2xs font-medium text-gray-400 dark:text-gray-500 shrink-0">
              {{ team.short_code }}
            </span>
            <v-icon
              v-if="selectedTeam === team.uuid"
              name="hi-solid-check"
              class="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0"
            />
          </button>

          <!-- No team matches the search -->
          <div
            v-if="filteredTeams.length === 0"
            class="px-3 py-6 text-center text-footnote text-gray-400 dark:text-gray-500"
          >
            {{ $t('fantasy.search.noTeamsFound') }}
          </div>
        </div>
      </section>

      <!-- Participant -->
      <section class="space-y-2">
        <h4 class="px-1 text-2xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
          {{ $t('fantasy.search.sectionParticipant') }}
        </h4>

        <div class="max-h-52 overflow-y-auto overscroll-contain px-1 space-y-0.5">
          <!-- All participants -->
          <button
            type="button"
            @click="emit('update:selectedUser', 'ALL')"
            class="w-full flex items-center gap-3 px-2.5 py-2.5 rounded-xl text-left transition-colors active:scale-[0.99]"
            :class="
              selectedUser === 'ALL'
                ? 'bg-blue-50 dark:bg-blue-900/20'
                : 'hover:bg-gray-50 dark:hover:bg-gray-800/60'
            "
          >
            <span class="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center shrink-0">
              <v-icon name="hi-solid-users" class="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </span>
            <span
              class="flex-1 min-w-0 text-footnote font-medium truncate"
              :class="
                selectedUser === 'ALL'
                  ? 'text-blue-700 dark:text-blue-300'
                  : 'text-gray-900 dark:text-white'
              "
            >
              {{ $t('fantasy.search.participantsAll') }}
            </span>
            <v-icon
              v-if="selectedUser === 'ALL'"
              name="hi-solid-check"
              class="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0"
            />
          </button>

          <!-- Empty -->
          <div
            v-if="participants.length === 0"
            class="px-3 py-6 text-center text-footnote text-gray-400 dark:text-gray-500"
          >
            {{ $t('fantasy.search.participantsEmpty') }}
          </div>

          <!-- Participant rows -->
          <button
            v-for="(participant, idx) in participants"
            :key="participant.uuid ?? idx"
            type="button"
            @click="emit('update:selectedUser', participant.uuid ?? 'ALL')"
            class="w-full flex items-center gap-3 px-2.5 py-2.5 rounded-xl text-left transition-colors active:scale-[0.99]"
            :class="
              selectedUser === participant.uuid
                ? 'bg-blue-50 dark:bg-blue-900/20'
                : 'hover:bg-gray-50 dark:hover:bg-gray-800/60'
            "
          >
            <img
              :src="participant.avatar || DEFAULT_AVATAR"
              :alt="participantName(participant)"
              class="w-8 h-8 rounded-full object-cover border border-gray-200 dark:border-gray-600 shrink-0"
              @error="onAvatarError"
            />
            <span
              class="flex-1 min-w-0 text-footnote font-medium truncate"
              :class="
                selectedUser === participant.uuid
                  ? 'text-blue-700 dark:text-blue-300'
                  : 'text-gray-900 dark:text-white'
              "
            >
              {{ participantName(participant) }}
            </span>
            <v-icon
              v-if="selectedUser === participant.uuid"
              name="hi-solid-check"
              class="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0"
            />
          </button>
        </div>
      </section>
    </div>

    <!-- Footer: clear (only when it does something) + close -->
    <template #footer>
      <div class="flex items-center gap-3">
        <button
          v-if="activeCount > 0"
          type="button"
          @click="emit('clear')"
          class="h-11 px-4 rounded-xl text-footnote font-semibold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 active:scale-[0.98] transition-transform"
        >
          {{ $t('fantasy.search.clearFilters') }}
        </button>
        <button
          type="button"
          @click="emit('close')"
          class="flex-1 h-11 rounded-xl text-footnote font-semibold text-white bg-blue-500 dark:bg-blue-600 active:scale-[0.98] transition-transform"
        >
          {{ $t('fantasy.search.applyFilters') }}
        </button>
      </div>
    </template>
  </BottomSheet>
</template>
