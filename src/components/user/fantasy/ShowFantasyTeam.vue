<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { fantasyLeagueService } from '@/services/fantasy/leagues/FantasyLeagueService'
import type { FantasyTeamData } from '@/interfaces/fantasy/team/FantasyUserTeamResponse'

interface Props {
  leagueUuid: string
}

const props = defineProps<Props>()

const router = useRouter()

const team = ref<FantasyTeamData | null>(null)
const isLoading = ref(true)
const hasError = ref(false)

const fetchTeam = async () => {
  if (!props.leagueUuid) return

  isLoading.value = true
  hasError.value = false

  try {
    team.value = await fantasyLeagueService.getTeam(props.leagueUuid)
  } catch {
    hasError.value = true
  } finally {
    isLoading.value = false
  }
}

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  if (!img.dataset.fallbackUsed) {
    img.dataset.fallbackUsed = 'true'
    img.src = '/img/default-avatar.svg'
  }
}

onMounted(fetchTeam)
watch(() => props.leagueUuid, fetchTeam)

const goToTeam = () => {
  router.push({
    name: 'fantasyTeamCreate',
    params: { uuid: props.leagueUuid },
  })
}
</script>

<template>
  <!-- Loading -->
  <div
    v-if="isLoading"
    class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4"
  >
    <div class="flex items-center gap-3 animate-pulse">
      <div class="w-12 h-12 rounded-xl bg-gray-200 dark:bg-gray-700 shrink-0" />
      <div class="flex-1 space-y-2">
        <div class="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded-md" />
        <div class="h-3 w-20 bg-gray-100 dark:bg-gray-700/60 rounded-md" />
      </div>
    </div>
  </div>

  <!-- Error -->
  <div
    v-else-if="hasError"
    class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4"
  >
    <div class="flex items-center gap-3">
      <div class="w-12 h-12 rounded-xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center shrink-0">
        <v-icon name="hi-solid-exclamation" class="w-5 h-5 text-red-400" />
      </div>
      <div class="flex-1 min-w-0">
        <p class="text-sm font-medium text-gray-700 dark:text-gray-300">Could not load team</p>
        <button
          @click="fetchTeam"
          class="text-xs text-emerald-600 dark:text-emerald-400 hover:underline mt-0.5"
        >
          Try again
        </button>
      </div>
    </div>
  </div>

  <!-- Team Card -->
  <div
    v-else-if="team"
    class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
  >
    <div class="flex items-center gap-3.5 p-4">
      <!-- Team Logo -->
      <button class="relative shrink-0 group" @click="goToTeam" title="View team">
        <div class="absolute -inset-1 rounded-2xl bg-gradient-to-br from-emerald-400/30 to-teal-500/30 dark:from-emerald-500/20 dark:to-teal-500/20 blur-sm group-hover:from-emerald-400/50 group-hover:to-teal-500/50 transition-all duration-300" />
        <img
          v-if="team.image_path"
          :src="team.image_path"
          :alt="team.team_name"
          class="relative w-14 h-14 md:w-16 md:h-16 rounded-xl object-cover ring-2 ring-white dark:ring-gray-700 shadow-md transition-transform duration-200 group-hover:scale-105 group-active:scale-95"
          @error="handleImageError"
        />
        <div
          v-else
          class="relative w-14 h-14 md:w-16 md:h-16 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center ring-2 ring-white dark:ring-gray-700 shadow-md transition-transform duration-200 group-hover:scale-105 group-active:scale-95"
        >
          <v-icon name="hi-solid-user-group" class="w-7 h-7 text-white" />
        </div>
      </button>

      <!-- Team Info -->
      <div class="flex-1 min-w-0">
        <h3 class="text-sm md:text-base font-bold text-gray-900 dark:text-white truncate">
          {{ team.team_name }}
        </h3>
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Your Fantasy Team</p>
      </div>

      <!-- Status Badge -->
      <div class="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/30">
        <span class="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        <span class="text-[11px] font-medium text-emerald-700 dark:text-emerald-400">Active</span>
      </div>
    </div>
  </div>
</template>
