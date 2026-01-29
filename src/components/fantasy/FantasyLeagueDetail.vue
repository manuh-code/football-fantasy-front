<template>
  <div class="animate-page-enter space-y-6">
    <!-- Loading State -->
    <div v-if="isLoading" class="text-center py-16">
      <div class="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-600 mx-auto mb-4"></div>
      <p class="text-gray-600 dark:text-gray-400 text-lg">Loading league details...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="errorMessage" class="text-center py-16">
      <div class="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full mx-auto mb-6 flex items-center justify-center">
        <v-icon name="hi-solid-exclamation" class="w-10 h-10 text-red-600 dark:text-red-400" />
      </div>
      <h3 class="text-xl font-semibold text-red-800 dark:text-red-200 mb-3">Error Loading League</h3>
      <p class="text-red-700 dark:text-red-300 mb-8">{{ errorMessage }}</p>
      <ButtonComponent
        variant="outline"
        size="md"
        text="Try Again"
        @click="fetchLeague"
      />
    </div>

    <!-- League Content -->
    <template v-else-if="league">
      <!-- League Header -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <!-- Hero Section -->
        <div class="relative h-32 md:h-40">
          <!-- Background Image or Gradient -->
          <div v-if="league.image_path" 
            class="absolute inset-0 bg-cover bg-center bg-no-repeat"
            :style="{ backgroundImage: `url(${league.image_path})` }">
          </div>
          <div v-else 
            class="absolute inset-0 bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600">
          </div>
          
          <!-- Dark overlay -->
          <div class="absolute inset-0 bg-black/40"></div>
          
          <!-- League Info Overlay -->
          <div class="absolute inset-0 flex items-end">
            <div class="p-6 text-white w-full">
              <div class="flex flex-col md:flex-row md:items-end md:justify-between">
                <div class="flex-1">
                  <h1 class="text-2xl md:text-3xl font-bold mb-2 drop-shadow-lg">{{ league.name }}</h1>
                  <div class="flex flex-wrap gap-2">
                    <span v-if="league.is_private" class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white/20 backdrop-blur-sm border border-white/30">
                      <v-icon name="hi-solid-lock-closed" class="w-3 h-3 mr-1" />
                      Private
                    </span>
                    <span v-else class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white/20 backdrop-blur-sm border border-white/30">
                      <v-icon name="hi-solid-globe-alt" class="w-3 h-3 mr-1" />
                      Public
                    </span>
                    <span v-if="league.isAdmin" class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-500/80 backdrop-blur-sm border border-yellow-400/50">
                      <v-icon name="hi-solid-star" class="w-3 h-3 mr-1" />
                      Admin
                    </span>
                    <span v-else-if="league.isMember" class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-500/80 backdrop-blur-sm border border-blue-400/50">
                      <v-icon name="hi-solid-user" class="w-3 h-3 mr-1" />
                      Member
                    </span>
                  </div>
                </div>
                
                <!-- Action Buttons -->
                <div class="flex gap-2 mt-4 md:mt-0">
                  <!-- Join/Request Button for non-members -->
                  <ButtonComponent
                    v-if="!league.isMember && !league.isAdmin"
                    variant="primary"
                    size="sm"
                    :text="league.is_private ? 'Request to Join' : 'Join League'"
                    :icon="league.is_private ? 'hi-solid-lock-closed' : 'hi-solid-user'"
                    @click="handleJoinLeague"
                  />
                  
                  <!-- Admin Management Button -->
                  <ButtonComponent
                    v-if="league.isAdmin"
                    variant="primary"
                    size="sm"
                    text="Manage League"
                    icon="hi-solid-cog"
                    @click="manageLeague"
                  />
                  
                 
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- League Information Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Main Information -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Description -->
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <v-icon name="hi-solid-information-circle" class="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 class="text-xl font-semibold text-gray-900 dark:text-white">League Description</h2>
              </div>
            </div>
            <div class="p-6">
              <p v-if="league.description" class="text-gray-700 dark:text-gray-300 leading-relaxed">
                {{ league.description }}
              </p>
              <p v-else class="text-gray-500 dark:text-gray-400 italic">
                No description available for this league.
              </p>
            </div>
          </div>

          <!-- Participants -->
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                  <v-icon name="hi-solid-user-group" class="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div class="flex-1">
                  <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Participants</h2>
                  <p class="text-sm text-gray-600 dark:text-gray-400">
                    {{ league.members_count || 0 }} of {{ league.participants_count }} members
                  </p>
                </div>
              </div>
            </div>
            <div class="p-6">
              <div v-if="league.participants && league.participants.length > 0" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div v-for="member in league.participants" :key="member.uuid" 
                  class="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <img 
                    :src="member.avatar || '/img/default-avatar.svg'" 
                    :alt="`${member.firstname} ${member.lastname}`"
                    class="w-10 h-10 rounded-full border border-gray-200 dark:border-gray-600 object-cover"
                    @error="handleImageError"
                  />
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {{ member.firstname }} {{ member.lastname }}
                    </p>
                    <p class="text-xs text-gray-500 dark:text-gray-400">
                      League Member
                    </p>
                  </div>
                </div>
              </div>
              <div v-else class="text-center py-8">
                <div class="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <v-icon name="hi-solid-user-group" class="w-8 h-8 text-gray-400" />
                </div>
                <p class="text-gray-500 dark:text-gray-400">No participants yet</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar Information -->
        <div class="space-y-6">
          <!-- League Stats -->
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                  <v-icon name="hi-solid-chart-bar" class="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">League Info</h3>
              </div>
            </div>
            <div class="p-6 space-y-4">
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600 dark:text-gray-400">Start Date</span>
                <span class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ formatDate(league.started_at) }}
                </span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600 dark:text-gray-400">Members</span>
                <span class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ league.members_count || 0 }}/{{ league.participants_count }}
                </span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600 dark:text-gray-400">Status</span>
                <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
                  <div class="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1"></div>
                  Active
                </span>
              </div>
            </div>
          </div>

          <!-- Draft Information -->
          <div v-if="league.draft" class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                  <v-icon name="hi-solid-calendar" class="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Draft Settings</h3>
              </div>
            </div>
            <div class="p-6 space-y-4">
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600 dark:text-gray-400">Draft Date</span>
                <span class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ formatDate(league.draft.draft_day) }}
                </span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600 dark:text-gray-400">Pick Timer</span>
                <span class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ league.draft.pick_time }}s
                </span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600 dark:text-gray-400">Draft Status</span>
                <span class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ league.draft.status?.name || 'Not Started' }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Join League Modal -->
    <JoinLeagueModal
      :is-visible="showJoinModal"
      :league="league"
      :is-loading="isJoining"
      :password-error="passwordError"
      @close="closeJoinModal"
      @join="joinLeague"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, defineProps, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from '@/composables/useToast'
import { useValidationStore } from '@/store/validation/useValidationStore'
import { ButtonComponent } from '@/components/ui'
import JoinLeagueModal from '@/components/fantasy/JoinLeagueModal.vue'
import { fantasyLeagueService } from '@/services/fantasy/leagues/FantasyLeagueService'
import type { FantasyLeaguesResponse } from '@/interfaces/fantasy/leagues/FantasyLeaguesResponse'

// Props
interface Props {
  uuid: string
}

const props = defineProps<Props>()

// Composables
const router = useRouter()
const toast = useToast()
const validationStore = useValidationStore()

// State
const league = ref<FantasyLeaguesResponse | null>(null)
const isLoading = ref(true)
const errorMessage = ref<string>('')
const showJoinModal = ref(false)
const isJoining = ref(false)

// Get password error from validation store
const passwordError = computed(() => {
  const passwordErrors = validationStore.getFieldError('password')
  return passwordErrors.length > 0 ? passwordErrors[0] : ''
})

// Methods
const fetchLeague = async () => {
  if (!props.uuid) {
    errorMessage.value = 'League UUID is required'
    isLoading.value = false
    return
  }

  isLoading.value = true
  errorMessage.value = ''

  try {
    league.value = await fantasyLeagueService.showFantasyLeague(props.uuid)
  } catch (error) {
    console.error('Error loading league details:', error)
    errorMessage.value = 'Failed to load league details. Please try again later.'
    toast.error('Error', 'Failed to load league details.')
  } finally {
    isLoading.value = false
  }
}

const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A'
  try {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString))
  } catch {
    return dateString
  }
}

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  // Evitar ciclo infinito: solo cambiar si no se ha intentado ya con la imagen por defecto
  if (!img.dataset.fallbackUsed) {
    img.dataset.fallbackUsed = 'true'
    img.src = '/img/default-avatar.svg'
  }
}

const manageLeague = () => {
  toast.info('Coming Soon', 'League management page is under development!')
}

const handleJoinLeague = () => {
  if (!league.value) return
  
  // Clear any previous password errors
  validationStore.clearFieldError('password')
  
  // If league is public, join directly without modal
  if (!league.value.is_private) {
    joinLeague({ league: league.value })
  } else {
    // If league is private, show modal to request password
    showJoinModal.value = true
  }
}

const joinLeague = async (joinData: { league: FantasyLeaguesResponse; password?: string }) => {
  try {
    isJoining.value = true
    validationStore.clearFieldError('password')
    const { league: leagueToJoin, password } = joinData

    // Prepare payload for the API
    const payload = {
      fantasy_league_uuid: leagueToJoin.uuid,
      password: leagueToJoin.is_private ? (password || null) : null
    }

    // Call the API to join the league
    await fantasyLeagueService.joinFantasyLeague(payload, leagueToJoin.uuid)

    toast.success('Success', `Successfully ${leagueToJoin.is_private ? 'requested to join' : 'joined'} "${leagueToJoin.name}"`)
    showJoinModal.value = false
    
    // Refresh the league data to update member status
    await fetchLeague()
    
  } catch (error) {
    console.error('Error joining league:', error)
    
    // The interceptor in useApiFantasy already handles 422 errors and stores them in the validation store
    // For non-422 errors, close the modal and let the interceptor show the toast
    if (error && typeof error === 'object' && 'status' in error && error.status !== 422) {
      showJoinModal.value = false
    }
    // If it's a 422 error, the modal stays open and shows the validation error from the store
  } finally {
    isJoining.value = false
  }
}

const closeJoinModal = () => {
  showJoinModal.value = false
  validationStore.clearFieldError('password')
}

// Lifecycle
onMounted(fetchLeague)
watch(() => props.uuid, fetchLeague)
</script>

<style scoped>
/* Loading spinner animation */
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Page enter animation */
.animate-page-enter {
  animation: fadeInUp 0.6s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Accessibility: Respect user's motion preferences */
@media (prefers-reduced-motion: reduce) {
  .animate-spin,
  .animate-page-enter,
  .transition-colors {
    transition: none !important;
    transform: none !important;
    animation: none !important;
  }
}
</style>
