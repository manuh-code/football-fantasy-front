<template>
  <BottomSheet
    :is-visible="isVisible"
    :title="canEdit ? $t('fantasy.editTeam.title') : $t('fantasy.editTeam.titleView')"
    :subtitle="canEdit ? $t('fantasy.editTeam.subtitle') : $t('fantasy.editTeam.subtitleView')"
    :icon="canEdit ? 'ri-team-line' : 'hi-solid-shield-check'"
    icon-variant="emerald"
    size="auto"
    :dismissible="!isSaving"
    @close="handleClose"
  >
    <!-- Hidden file input (the real <input> lives off-screen; the crest triggers it) -->
    <input
      ref="fileInputRef"
      type="file"
      accept="image/jpeg,image/png,image/webp"
      class="hidden"
      @change="onFileSelect"
    />

    <!-- ═══════════ Identity hero — the crest is the uploader ═══════════ -->
    <div class="flex flex-col items-center pb-5">
      <div class="relative">
        <!-- Crest -->
        <div
          class="group relative w-24 h-24 rounded-3xl overflow-hidden ring-4 ring-white dark:ring-gray-900 shadow-lg shadow-emerald-500/20 flex items-center justify-center transition-all duration-200"
          :class="[
            canEdit ? '' : '',
            isDragging ? 'ring-emerald-400 dark:ring-emerald-500' : '',
          ]"
          @dragover.prevent="canEdit && (isDragging = true)"
          @dragleave.prevent="isDragging = false"
          @drop.prevent="onDrop"
        >
          <img
            v-if="displayImage"
            :src="displayImage"
            alt=""
            class="w-full h-full object-cover"
            @error="onImageError"
          />
          <div
            v-else-if="team?.svg"
            v-html="team.svg"
            class="w-full h-full flex items-center justify-center [&>svg]:w-full [&>svg]:h-full"
          />
          <div
            v-else
            class="w-full h-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center"
          >
            <span class="text-2xl font-black text-white tracking-wider">{{ previewInitials }}</span>
          </div>

          <!-- Hover / drag overlay (desktop affordance) -->
          <div
            v-if="canEdit"
            class="absolute inset-0 flex items-center justify-center bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            :class="isDragging ? 'opacity-100' : ''"
          >
            <v-icon name="hi-camera" class="w-6 h-6 text-white" />
          </div>

          <!-- Full-cover trigger button (edit only) -->
          <button
            v-if="canEdit"
            type="button"
            class="absolute inset-0 rounded-3xl focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
            :aria-label="$t('fantasy.editTeam.changeLogoHint')"
            @click="openPicker"
          />
        </div>

        <!-- Camera badge (persistent hint, key on mobile where there is no hover) -->
        <div
          v-if="canEdit"
          class="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-emerald-500 border-2 border-white dark:border-gray-900 flex items-center justify-center shadow-md pointer-events-none"
        >
          <v-icon name="hi-camera" class="w-4 h-4 text-white" />
        </div>
      </div>

      <!-- Change / revert controls (edit only) -->
      <div v-if="canEdit" class="flex items-center gap-3 mt-3 h-5">
        <button
          type="button"
          class="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
          @click="openPicker"
        >
          {{ $t('fantasy.teamCreate.changeImage') }}
        </button>
        <template v-if="imageFile">
          <span class="w-px h-3 bg-gray-200 dark:bg-gray-700" />
          <button
            type="button"
            class="text-xs font-medium text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 flex items-center gap-1 transition-colors"
            @click="revertImage"
          >
            <v-icon name="hi-solid-refresh" class="w-3 h-3" />
            {{ $t('fantasy.editTeam.revertLogo') }}
          </button>
        </template>
      </div>

      <!-- Live name + meta -->
      <h3 class="mt-3 text-lg font-bold text-gray-900 dark:text-white text-center truncate max-w-full px-4">
        {{ (canEdit ? teamName : team?.team_name) || $t('fantasy.editTeam.previewNamePlaceholder') }}
      </h3>
      <div class="flex items-center gap-2 mt-1.5">
        <span
          class="inline-flex items-center px-2 py-0.5 rounded-full text-2xs font-bold tracking-wider uppercase bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400"
        >
          {{ previewInitials }}
        </span>
        <span v-if="memberSince" class="text-2xs text-gray-400 dark:text-gray-500">
          {{ $t('fantasy.editTeam.memberSince', { date: memberSince }) }}
        </span>
      </div>
    </div>

    <!-- ═══════════ Edit form (own team) ═══════════ -->
    <div v-if="canEdit" class="space-y-4">
      <!-- Team name -->
      <div>
        <label for="edit-team-name" class="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
          {{ $t('fantasy.teamCreate.teamName') }}
        </label>
        <div class="relative">
          <input
            id="edit-team-name"
            v-model="teamName"
            type="text"
            maxlength="30"
            :placeholder="$t('fantasy.teamCreate.teamNamePlaceholder')"
            class="w-full pl-3.5 pr-14 py-3 rounded-xl border text-sm bg-gray-50 dark:bg-gray-800/60 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 focus:bg-white dark:focus:bg-gray-800"
            :class="nameError ? 'border-red-300 dark:border-red-500/60' : 'border-gray-200 dark:border-gray-700'"
          />
          <span class="absolute right-3 top-1/2 -translate-y-1/2 text-2xs text-gray-400 tabular-nums">
            {{ teamName.length }}/30
          </span>
        </div>
        <p v-if="nameError" class="text-2xs text-red-500 mt-1 flex items-center gap-1">
          <v-icon name="hi-solid-exclamation-circle" class="w-3 h-3 shrink-0" />
          {{ nameError }}
        </p>
      </div>

      <!-- Initials -->
      <div>
        <label for="edit-team-initials" class="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
          {{ $t('fantasy.teamCreate.initialsLabel') }}
          <span class="font-normal text-gray-400">{{ $t('fantasy.teamCreate.initialsHint') }}</span>
        </label>
        <div class="flex gap-2">
          <input
            id="edit-team-initials"
            v-model="initials"
            type="text"
            maxlength="4"
            :placeholder="$t('fantasy.teamCreate.initialsPlaceholder')"
            class="flex-1 min-w-0 px-3.5 py-3 rounded-xl border text-sm bg-gray-50 dark:bg-gray-800/60 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 uppercase tracking-[0.3em] font-bold text-center transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 focus:bg-white dark:focus:bg-gray-800"
            :class="initialsError ? 'border-red-300 dark:border-red-500/60' : 'border-gray-200 dark:border-gray-700'"
            @input="onInitialsInput"
          />
          <button
            type="button"
            :title="$t('fantasy.teamCreate.autoGenerate')"
            :aria-label="$t('fantasy.teamCreate.autoGenerate')"
            class="px-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60 text-gray-500 dark:text-gray-400 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 dark:hover:bg-emerald-900/20 dark:hover:text-emerald-400 dark:hover:border-emerald-800 transition-all"
            @click="generateInitials"
          >
            <v-icon name="hi-solid-sparkles" class="w-4 h-4" />
          </button>
        </div>
        <p v-if="initialsError" class="text-2xs text-red-500 mt-1 flex items-center gap-1">
          <v-icon name="hi-solid-exclamation-circle" class="w-3 h-3 shrink-0" />
          {{ initialsError }}
        </p>
      </div>

      <p class="text-2xs text-gray-400 dark:text-gray-500 flex items-center gap-1.5">
        <v-icon name="hi-solid-photograph" class="w-3.5 h-3.5 shrink-0" />
        {{ $t('fantasy.teamCreate.logoOptional') }}
      </p>
    </div>

    <!-- ═══════════ Read-only view (opponent team) ═══════════ -->
    <div v-else>
      <div class="rounded-xl border border-gray-100 dark:border-gray-800 divide-y divide-gray-100 dark:divide-gray-800 overflow-hidden">
        <div class="flex items-center justify-between px-4 py-3">
          <span class="text-xs text-gray-500 dark:text-gray-400">{{ $t('fantasy.teamCreate.initialsLabel') }}</span>
          <span class="text-sm font-bold tracking-widest uppercase text-gray-800 dark:text-gray-200">{{ previewInitials }}</span>
        </div>
        <div v-if="memberSince" class="flex items-center justify-between px-4 py-3">
          <span class="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
            <v-icon name="hi-solid-calendar" class="w-3.5 h-3.5" />
            {{ $t('fantasy.editTeam.memberSinceLabel') }}
          </span>
          <span class="text-sm text-gray-700 dark:text-gray-300">{{ memberSince }}</span>
        </div>
      </div>
      <p class="text-2xs text-gray-400 dark:text-gray-500 mt-3 text-center">
        {{ $t('fantasy.editTeam.opponentNote') }}
      </p>
    </div>

    <!-- ═══════════ Footer ═══════════ -->
    <template #footer>
      <div v-if="canEdit" class="flex gap-3">
        <button
          :disabled="isSaving"
          class="flex-1 py-3 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 active:scale-[0.98] transition-all disabled:opacity-50"
          @click="handleClose"
        >
          {{ $t('common.actions.cancel') }}
        </button>
        <button
          :disabled="!isFormValid || !isDirty || isSaving"
          class="flex-1 py-3 rounded-xl text-sm font-semibold text-white bg-emerald-600 active:scale-[0.98] shadow-sm shadow-emerald-500/30 transition-all disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2"
          @click="handleSubmit"
        >
          <div v-if="isSaving" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          <v-icon v-else name="hi-solid-check" class="w-4 h-4" />
          {{ isSaving ? $t('common.actions.saving') : $t('fantasy.editTeam.saveChanges') }}
        </button>
      </div>
      <button
        v-else
        class="w-full py-3 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 active:scale-[0.98] transition-all"
        @click="handleClose"
      >
        {{ $t('common.actions.close') }}
      </button>
    </template>
  </BottomSheet>
</template>

<script setup lang="ts">
import { ref, computed, watch, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'
import BottomSheet from '@/components/ui/BottomSheet.vue'
import { useToast } from '@/composables/useToast'
import { fantasyLeagueService } from '@/services/fantasy/leagues/FantasyLeagueService'
import type { FantasyTeamData } from '@/interfaces/fantasy/team/FantasyUserTeamResponse'
import type { FantasyUserTeamPayload } from '@/interfaces/fantasy/team/FantasyUserTeamPayload'

interface Props {
  /** Controls drawer visibility (BottomSheet `is-visible`). */
  isVisible: boolean
  /** League the team belongs to — required by the store endpoint. */
  leagueUuid: string
  /** Team to show; when it is the user's own team, editing is enabled. */
  team: FantasyTeamData | null
  /** Whether the current user owns this team (enables the edit form). */
  canEdit?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  canEdit: false,
})

const emit = defineEmits<{
  close: []
  updated: [team: FantasyTeamData]
}>()

const { t, locale } = useI18n()
const toast = useToast()

// ─── Image constraints (mirrors team creation) ──────────────
const MAX_IMAGE_SIZE = 2 * 1024 * 1024 // 2MB
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])

// ─── Form state ─────────────────────────────────────────────
const teamName = ref('')
const initials = ref('')
const imageFile = ref<File | null>(null)
const imagePreview = ref<string | null>(null) // object URL for a newly picked file
const isSaving = ref(false)
const isDragging = ref(false)
const hasEditedInitials = ref(false)
const imageErrored = ref(false)
const fileInputRef = ref<HTMLInputElement | null>(null)

// Snapshot of the loaded team, used to detect unsaved changes.
const initialName = ref('')
const initialInitials = ref('')

// FantasyTeamData carries no `initials` field, so we derive them from the name.
const autoInitials = (name: string): string =>
  name
    .trim()
    .split(/\s+/)
    .map((w) => w[0]?.toUpperCase() || '')
    .join('')
    .slice(0, 4)

function resetFromTeam() {
  revokePreview()
  imageFile.value = null
  imagePreview.value = null
  isDragging.value = false
  hasEditedInitials.value = false
  imageErrored.value = false
  teamName.value = props.team?.team_name ?? ''
  initials.value = autoInitials(props.team?.team_name ?? '')
  initialName.value = teamName.value
  initialInitials.value = initials.value
  if (fileInputRef.value) fileInputRef.value.value = ''
}

// Rehydrate the form each time the drawer opens or the selected team changes.
watch(
  () => props.isVisible,
  (visible) => {
    if (visible) resetFromTeam()
  },
)
watch(
  () => props.team?.uuid,
  () => {
    if (props.isVisible) resetFromTeam()
  },
)

// Keep initials in sync with the name until the user edits them by hand.
watch(teamName, () => {
  if (!hasEditedInitials.value) initials.value = autoInitials(teamName.value)
})

function onInitialsInput() {
  hasEditedInitials.value = true
}

function generateInitials() {
  initials.value = autoInitials(teamName.value)
  hasEditedInitials.value = false
}

// ─── Image handling ─────────────────────────────────────────
function openPicker() {
  fileInputRef.value?.click()
}

function onFileSelect(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) processFile(file)
}

function onDrop(event: DragEvent) {
  isDragging.value = false
  if (!props.canEdit) return
  const file = event.dataTransfer?.files?.[0]
  if (file) processFile(file)
}

function processFile(file: File) {
  if (!ALLOWED_TYPES.has(file.type)) {
    toast.error(
      t('fantasy.teamCreate.invalidFormatTitle'),
      t('fantasy.teamCreate.invalidFormatMessage'),
    )
    return
  }
  if (file.size > MAX_IMAGE_SIZE) {
    toast.error(
      t('fantasy.teamCreate.fileTooLargeTitle'),
      t('fantasy.teamCreate.fileTooLargeMessage'),
    )
    return
  }
  revokePreview()
  imageErrored.value = false
  imageFile.value = file
  imagePreview.value = URL.createObjectURL(file)
  if (fileInputRef.value) fileInputRef.value.value = ''
}

// Revert only discards a freshly picked file (the store endpoint has no
// "delete image" semantic, so the previously saved crest stays untouched).
function revertImage() {
  revokePreview()
  imageFile.value = null
  imagePreview.value = null
}

function revokePreview() {
  if (imagePreview.value) URL.revokeObjectURL(imagePreview.value)
}

function onImageError() {
  // Only fall back for the saved crest; a bad local preview is unexpected.
  if (!imagePreview.value) imageErrored.value = true
}

// ─── Derived display values ─────────────────────────────────
const displayImage = computed(() => {
  if (imagePreview.value) return imagePreview.value
  if (props.team?.image_path && !imageErrored.value) return props.team.image_path
  return null
})

const previewInitials = computed(
  () => (initials.value || autoInitials(props.team?.team_name ?? '') || '?').toUpperCase(),
)

const memberSince = computed(() => {
  const raw = props.team?.created_at
  if (!raw) return ''
  const d = new Date(raw)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString(locale.value, { year: 'numeric', month: 'short' })
})

// ─── Validation ─────────────────────────────────────────────
const nameError = computed(() => {
  const v = teamName.value.trim()
  if (!v) return ''
  if (v.length < 3) return t('common.validation.minLength', { min: 3 })
  if (v.length > 30) return t('common.validation.maxLength', { max: 30 })
  return ''
})

const initialsError = computed(() => {
  const v = initials.value.trim()
  if (v.length > 4) return t('common.validation.maxLength', { max: 4 })
  return ''
})

const isFormValid = computed(
  () =>
    teamName.value.trim().length >= 3 &&
    teamName.value.trim().length <= 30 &&
    initials.value.trim().length >= 1 &&
    initials.value.trim().length <= 4 &&
    !nameError.value &&
    !initialsError.value,
)

const isDirty = computed(
  () =>
    teamName.value.trim() !== initialName.value.trim() ||
    initials.value.trim().toUpperCase() !== initialInitials.value.trim().toUpperCase() ||
    imageFile.value !== null,
)

// ─── Actions ────────────────────────────────────────────────
function handleClose() {
  if (isSaving.value) return
  emit('close')
}

async function handleSubmit() {
  if (!props.canEdit || !isFormValid.value || !isDirty.value || isSaving.value) return

  isSaving.value = true
  try {
    const payload: FantasyUserTeamPayload = {
      fantasy_league_uuid: props.leagueUuid,
      team_name: teamName.value.trim(),
      initials: initials.value.trim().toUpperCase(),
      image: imageFile.value,
    }
    const response = await fantasyLeagueService.addTeam(payload)
    toast.success(
      t('fantasy.editTeam.savedTitle'),
      t('fantasy.editTeam.savedMessage', { name: teamName.value.trim() }),
    )
    emit('updated', response.data)
    emit('close')
  } catch (error: unknown) {
    // Field (422) + toast errors are surfaced by the API interceptor.
    console.error('Error updating fantasy team:', error)
  } finally {
    isSaving.value = false
  }
}

onBeforeUnmount(revokePreview)
</script>
