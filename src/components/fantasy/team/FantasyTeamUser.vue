<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from '@/composables/useToast'
import { fantasyLeagueService } from '@/services/fantasy/leagues/FantasyLeagueService'
import type { FantasyUserTeamPayload } from '@/interfaces/fantasy/team/FantasyUserTeamPayload'

// Props
interface Props {
  fantasyLeagueUuid: string
}

const props = defineProps<Props>()

// Composables
const router = useRouter()
const toast = useToast()

// ─── Form State ─────────────────────────────────────────────
const teamName = ref('')
const initials = ref('')
const imageFile = ref<File | null>(null)
const imagePreview = ref<string | null>(null)
const isSaving = ref(false)
const hasEditedInitials = ref(false)
const isDragging = ref(false)
const fileInputRef = ref<HTMLInputElement | null>(null)
const isExistingTeam = ref(false)
const isLoadingTeam = ref(false)

// ─── Image Upload ───────────────────────────────────────────
const MAX_IMAGE_SIZE = 2 * 1024 * 1024 // 2MB
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) processFile(file)
}

const handleDrop = (event: DragEvent) => {
  isDragging.value = false
  const file = event.dataTransfer?.files?.[0]
  if (file) processFile(file)
}

const processFile = (file: File) => {
  if (!ALLOWED_TYPES.has(file.type)) {
    toast.error('Invalid format', 'Only JPG, PNG and WebP images are allowed.')
    return
  }
  if (file.size > MAX_IMAGE_SIZE) {
    toast.error('File too large', 'Maximum image size is 2MB.')
    return
  }

  imageFile.value = file

  // Generate preview URL
  if (imagePreview.value) URL.revokeObjectURL(imagePreview.value)
  imagePreview.value = URL.createObjectURL(file)
}

const removeImage = () => {
  if (imagePreview.value) URL.revokeObjectURL(imagePreview.value)
  imageFile.value = null
  imagePreview.value = null
  if (fileInputRef.value) fileInputRef.value.value = ''
}

const openFilePicker = () => {
  fileInputRef.value?.click()
}

// ─── Validations ────────────────────────────────────────────
const teamNameError = computed(() => {
  if (!teamName.value.trim()) return ''
  if (teamName.value.trim().length < 3) return 'Minimum 3 characters'
  if (teamName.value.trim().length > 30) return 'Maximum 30 characters'
  return ''
})

const initialsError = computed(() => {
  if (!initials.value.trim()) return ''
  if (initials.value.trim().length > 4) return 'Maximum 4 characters'
  return ''
})

const isFormValid = computed(() => {
  return (
    teamName.value.trim().length >= 3 &&
    teamName.value.trim().length <= 30 &&
    initials.value.trim().length >= 1 &&
    initials.value.trim().length <= 4 &&
    !teamNameError.value &&
    !initialsError.value
  )
})

// ─── Auto-generate initials ─────────────────────────────────
const autoInitials = (name: string): string => {
  return name
    .trim()
    .split(/\s+/)
    .map((w) => w[0]?.toUpperCase() || '')
    .join('')
    .slice(0, 4)
}

watch(teamName, () => {
  if (!hasEditedInitials.value) {
    initials.value = autoInitials(teamName.value)
  }
})

const onInitialsInput = () => {
  hasEditedInitials.value = true
}

const generateInitials = () => {
  initials.value = autoInitials(teamName.value)
  hasEditedInitials.value = false
}

/** Display initials for preview */
const previewInitials = computed(() => {
  return initials.value || autoInitials(teamName.value) || '?'
})

// ─── Submit ─────────────────────────────────────────────────
const handleSubmit = async () => {
  if (isExistingTeam.value) {
    // If team already exists, go to league detail
    router.push({ name: 'fantasyLeagueDetail', params: { uuid: props.fantasyLeagueUuid } })
    return
  }

  if (!isFormValid.value || isSaving.value) return

  isSaving.value = true

  try {
    const payload: FantasyUserTeamPayload = {
      fantasy_league_uuid: props.fantasyLeagueUuid,
      team_name: teamName.value.trim(),
      initials: initials.value.trim().toUpperCase(),
      image: imageFile.value,
    }

    await fantasyLeagueService.addTeam(payload)
    toast.success('Team Created!', `"${teamName.value}" is ready to compete.`)

    router.push({
      name: 'fantasyLeagueDetail',
      params: { uuid: props.fantasyLeagueUuid },
    })
  } catch (error: unknown) {
    console.error('Error creating team:', error)
  } finally {
    isSaving.value = false
  }
}

onMounted(async () => {
  isLoadingTeam.value = true
  try {
    const team = await fantasyLeagueService.getTeamSilent(props.fantasyLeagueUuid)
    if (team) {
      isExistingTeam.value = true
      teamName.value = team.team_name || ''
      initials.value = autoInitials(team.team_name || '')
      if (team.image_path) {
        imagePreview.value = team.image_path
      } else if (team.svg) {
        // use svg string as preview if available
        imagePreview.value = `data:image/svg+xml;utf8,${encodeURIComponent(team.svg)}`
      }
    }
  } catch (e) {
    // silent: no team or fetch error (404 expected when no team)
  } finally {
    isLoadingTeam.value = false
  }
})

const goBack = () => {
  router.push({
    name: 'fantasyLeagueDetail',
    params: { uuid: props.fantasyLeagueUuid },
  })
}
</script>

<template>
  <div class="animate-page-enter">
    
    <!-- Main layout -->
    <div class="flex flex-col lg:flex-row gap-6">

      <!-- ═══ Preview Card (sticky on desktop) ═══ -->
      <div class="lg:w-[320px] lg:shrink-0">
        <div class="lg:sticky lg:top-24">
          <div class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <!-- Gradient header -->
            <div class="h-20 relative overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-600">
              <div class="absolute inset-0 bg-black/5" />
              <p class="absolute top-3 left-4 text-[10px] font-semibold uppercase tracking-widest text-white/70">Preview</p>
            </div>

            <!-- Team Identity Preview -->
            <div class="flex flex-col items-center -mt-10 pb-6 px-6">
              <!-- Team Image -->
              <div class="w-20 h-20 rounded-2xl shadow-lg shadow-emerald-500/25 mb-4 ring-4 ring-white dark:ring-gray-800 preview-float overflow-hidden">
                <img
                  v-if="imagePreview"
                  :src="imagePreview"
                  alt="Team logo"
                  class="w-full h-full object-cover"
                />
                <div
                  v-else
                  class="w-full h-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center"
                >
                  <span class="text-2xl font-extrabold text-white tracking-wider">
                    {{ previewInitials.toUpperCase() }}
                  </span>
                </div>
              </div>

              <h3 class="text-lg font-bold text-gray-900 dark:text-white truncate max-w-full text-center">
                {{ teamName || 'Your Team Name' }}
              </h3>
              <span class="inline-flex items-center px-2.5 py-0.5 mt-1.5 rounded-full text-[11px] font-semibold tracking-wider uppercase bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                {{ previewInitials.toUpperCase() }}
              </span>
            </div>
          </div>

          <!-- Tip card (desktop only) -->
          <div class="hidden lg:flex items-start gap-3 mt-4 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20">
            <v-icon name="hi-solid-light-bulb" class="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p class="text-xs font-medium text-amber-800 dark:text-amber-300">Tip</p>
              <p class="text-xs text-amber-700 dark:text-amber-400 mt-0.5 leading-relaxed">
                Upload your team's logo for a personalized look. You can change it anytime from your team settings.
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- ═══ Form Panel ═══ -->
      <div class="flex-1 min-w-0">
        <div class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div class="p-5 md:p-6">
            <div class="mb-5">
              <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Team Identity</h2>
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Choose a name and initials for your team</p>
            </div>

            <div v-if="isExistingTeam" class="mb-4 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/20 flex items-center justify-between">
              <div class="text-sm text-emerald-800 dark:text-emerald-200">You already have a team in this league.</div>
              <button @click="() => router.push({ name: 'fantasyLeagueDetail', params: { uuid: props.fantasyLeagueUuid } })" type="button" class="px-3 py-1.5 rounded-md bg-emerald-500 text-white text-sm">View Team</button>
            </div>

            <div class="space-y-5">
              <!-- Team Name -->
              <div>
                <label for="team-name" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Team Name</label>
                <div class="relative">
                  <input
                    id="team-name"
                    v-model="teamName"
                    type="text"
                    maxlength="30"
                    placeholder="e.g. Thunder FC"
                    class="w-full pl-4 pr-16 py-3.5 rounded-xl border text-sm bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 focus:bg-white dark:focus:bg-gray-700"
                    :class="teamNameError
                      ? 'border-red-300 dark:border-red-500'
                      : 'border-gray-200 dark:border-gray-600'"
                  />
                  <span class="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 tabular-nums">
                    {{ teamName.length }}/30
                  </span>
                </div>
                <p v-if="teamNameError" class="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                  <v-icon name="hi-solid-exclamation-circle" class="w-3.5 h-3.5" />
                  {{ teamNameError }}
                </p>
              </div>

              <!-- Initials -->
              <div>
                <label for="team-initials" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Team Initials
                  <span class="text-xs text-gray-400 font-normal ml-1">(1-4 chars)</span>
                </label>
                <div class="flex gap-2">
                  <div class="relative flex-1">
                    <input
                      id="team-initials"
                      v-model="initials"
                      @input="onInitialsInput"
                      type="text"
                      maxlength="4"
                      placeholder="e.g. TFC"
                      class="w-full px-4 py-3.5 rounded-xl border text-sm bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 uppercase tracking-[0.25em] font-bold text-center transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 focus:bg-white dark:focus:bg-gray-700"
                      :class="initialsError
                        ? 'border-red-300 dark:border-red-500'
                        : 'border-gray-200 dark:border-gray-600'"
                    />
                  </div>
                  <button
                    @click="generateInitials"
                    type="button"
                    title="Auto-generate from team name"
                    class="px-4 py-3.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 dark:hover:bg-emerald-900/20 dark:hover:text-emerald-400 dark:hover:border-emerald-800 transition-all"
                  >
                    <v-icon name="hi-solid-sparkles" class="w-5 h-5" />
                  </button>
                </div>
                <p v-if="initialsError" class="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                  <v-icon name="hi-solid-exclamation-circle" class="w-3.5 h-3.5" />
                  {{ initialsError }}
                </p>
              </div>
            </div>

            <!-- Team Image Upload -->
            <div class="mt-6">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5" for="team-logo">Team Logo</label>
              <input
                id="team-logo"
                ref="fileInputRef"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                class="hidden"
                @change="handleFileSelect"
              />

              <!-- Upload area / Preview -->
              <div
                v-if="!imagePreview"
                @click="openFilePicker"
                @dragover.prevent="isDragging = true"
                @dragleave.prevent="isDragging = false"
                @drop.prevent="handleDrop"
                class="relative cursor-pointer rounded-xl border-2 border-dashed p-6 text-center transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700/30"
                :class="isDragging
                  ? 'border-emerald-400 bg-emerald-50/50 dark:bg-emerald-900/10'
                  : 'border-gray-200 dark:border-gray-600'"
              >
                <div class="flex flex-col items-center gap-2">
                  <div class="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                    <v-icon name="hi-solid-photograph" class="w-6 h-6 text-gray-400 dark:text-gray-500" />
                  </div>
                  <p class="text-sm font-medium text-gray-600 dark:text-gray-300">
                    <span class="text-emerald-600 dark:text-emerald-400">Click to upload</span>
                    or drag & drop
                  </p>
                  <p class="text-xs text-gray-400 dark:text-gray-500">JPG, PNG or WebP (max. 2MB)</p>
                </div>
              </div>

              <!-- Image selected preview -->
              <div
                v-else
                class="relative rounded-xl border border-gray-200 dark:border-gray-600 p-3 flex items-center gap-4"
              >
                <img
                  :src="imagePreview"
                  alt="Team logo preview"
                  class="w-16 h-16 rounded-lg object-cover border border-gray-100 dark:border-gray-700"
                />
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                    {{ imageFile?.name }}
                  </p>
                  <p class="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                    {{ imageFile ? (imageFile.size / 1024).toFixed(1) + ' KB' : '' }}
                  </p>
                </div>
                <div class="flex items-center gap-1.5">
                  <button
                    @click="openFilePicker"
                    type="button"
                    class="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    title="Change image"
                  >
                    <v-icon name="hi-solid-pencil" class="w-4 h-4" />
                  </button>
                  <button
                    @click="removeImage"
                    type="button"
                    class="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 transition-colors"
                    title="Remove image"
                  >
                    <v-icon name="hi-solid-trash" class="w-4 h-4" />
                  </button>
                </div>
              </div>

              <p class="text-xs text-gray-400 dark:text-gray-500 mt-1.5">Optional. If not provided, a default image will be assigned.</p>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex items-center justify-between gap-3 p-5 md:p-6 border-t border-gray-100 dark:border-gray-700/50">
            <button
              @click="goBack"
              class="px-5 py-3 rounded-xl border border-gray-200 dark:border-gray-600 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              @click="handleSubmit"
              :disabled="((!isExistingTeam && !isFormValid) || isSaving)"
              class="px-8 py-3 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-2"
              :class="isFormValid && !isSaving
                ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/25 active:scale-[0.98]'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'"
            >
              <span v-if="isSaving" class="flex items-center gap-2">
                <span class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creating...
              </span>
              <span v-else-if="isExistingTeam" class="flex items-center gap-2">
                <v-icon name="hi-solid-eye" class="w-4 h-4" />
                View Team
              </span>
              <span v-else class="flex items-center gap-2">
                <v-icon name="hi-solid-check" class="w-4 h-4" />
                Create Team
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-page-enter {
  animation: fadeInUp 0.5s ease-out;
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.preview-float {
  animation: float 4s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}

@media (prefers-reduced-motion: reduce) {
  .animate-page-enter,
  .animate-spin,
  .preview-float {
    animation: none !important;
  }
}
</style>
