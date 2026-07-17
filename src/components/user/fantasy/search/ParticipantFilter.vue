<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { BottomSheet } from '@/components/ui'
import type { UserDataInterface } from '@/interfaces/user/userInterface'

interface Props {
  participants: UserDataInterface[]
  selectedUser: string
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
})

const emit = defineEmits<{
  'update:selectedUser': [value: string]
}>()

const { t } = useI18n()

const DEFAULT_AVATAR = '/img/default-avatar.svg'

const isOpen = ref(false)

/** The participant object backing the current selection (null when 'ALL'). */
const selectedParticipant = computed(() =>
  props.selectedUser === 'ALL'
    ? null
    : props.participants.find((p) => p.uuid === props.selectedUser) ?? null,
)

/** Compose a readable name — UserDataInterface has no display_name. */
function displayName(p: UserDataInterface): string {
  const full = [p.firstname, p.lastname].filter(Boolean).join(' ').trim()
  return full || p.email || t('fantasy.search.participantFallbackName')
}

function onImageError(e: Event) {
  ;(e.target as HTMLImageElement).src = DEFAULT_AVATAR
}

function select(value: string) {
  emit('update:selectedUser', value)
  isOpen.value = false
}
</script>

<template>
  <div class="px-1">
    <!-- Trigger — styled like the other select-style filters -->
    <button
      type="button"
      @click="isOpen = true"
      :disabled="disabled"
      class="w-full flex items-center justify-between gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-base md:text-footnote text-gray-700 dark:text-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 dark:focus:border-blue-500 active:bg-gray-50 dark:active:bg-gray-700/50 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <span class="flex items-center gap-2.5 min-w-0">
        <template v-if="selectedParticipant">
          <img
            :src="selectedParticipant.avatar || DEFAULT_AVATAR"
            :alt="displayName(selectedParticipant)"
            class="w-6 h-6 rounded-full object-cover border border-gray-200 dark:border-gray-600 shrink-0"
            @error="onImageError"
          />
          <span class="truncate font-medium">{{ displayName(selectedParticipant) }}</span>
        </template>
        <template v-else>
          <v-icon
            name="hi-solid-user-group"
            class="w-5 h-5 text-gray-400 dark:text-gray-500 shrink-0"
          />
          <span class="truncate">{{ $t('fantasy.search.participantsAll') }}</span>
        </template>
      </span>
      <v-icon
        name="hi-solid-chevron-down"
        class="w-4 h-4 text-gray-400 dark:text-gray-500 shrink-0"
      />
    </button>

    <!-- Drawer with the participant list -->
    <BottomSheet
      :is-visible="isOpen"
      :title="$t('fantasy.search.participantsTitle')"
      icon="hi-solid-user-group"
      icon-variant="blue"
      size="lg"
      @close="isOpen = false"
    >
      <div class="space-y-1">
        <!-- All participants -->
        <button
          type="button"
          @click="select('ALL')"
          class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors active:scale-[0.99]"
          :class="
            selectedUser === 'ALL'
              ? 'bg-blue-50 dark:bg-blue-900/20'
              : 'hover:bg-gray-50 dark:hover:bg-gray-800/60'
          "
        >
          <span
            class="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center shrink-0"
          >
            <v-icon
              name="hi-solid-users"
              class="w-5 h-5 text-gray-500 dark:text-gray-400"
            />
          </span>
          <span
            class="flex-1 min-w-0 text-footnote font-medium"
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

        <!-- Empty state -->
        <div
          v-if="participants.length === 0"
          class="px-3 py-8 text-center text-footnote text-gray-500 dark:text-gray-400"
        >
          {{ $t('fantasy.search.participantsEmpty') }}
        </div>

        <!-- Participant rows -->
        <button
          v-for="(participant, idx) in participants"
          :key="participant.uuid ?? idx"
          type="button"
          @click="select(participant.uuid ?? 'ALL')"
          class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors active:scale-[0.99]"
          :class="
            selectedUser === participant.uuid
              ? 'bg-blue-50 dark:bg-blue-900/20'
              : 'hover:bg-gray-50 dark:hover:bg-gray-800/60'
          "
        >
          <img
            :src="participant.avatar || DEFAULT_AVATAR"
            :alt="displayName(participant)"
            class="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-gray-600 shrink-0"
            @error="onImageError"
          />
          <span
            class="flex-1 min-w-0 text-footnote font-medium truncate"
            :class="
              selectedUser === participant.uuid
                ? 'text-blue-700 dark:text-blue-300'
                : 'text-gray-900 dark:text-white'
            "
          >
            {{ displayName(participant) }}
          </span>
          <v-icon
            v-if="selectedUser === participant.uuid"
            name="hi-solid-check"
            class="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0"
          />
        </button>
      </div>
    </BottomSheet>
  </div>
</template>
