<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { fantasyPushPreferenceService } from '@/services/user/notification/FantasyPushPreferenceService'
import type { FantasyPushPreferenceResponse } from '@/interfaces/user/notification/FantasyPushPreferenceResponse'
import { useToast } from '@/composables/useToast'

// The three fantasy notifications that go to whoever OWNS a player. The labels and
// descriptions come already translated from the API, so this component only knows
// how to draw a list of switches: a new type on the backend shows up here untouched.
const { t } = useI18n()
const toast = useToast()

const preferences = ref<FantasyPushPreferenceResponse[]>([])
const isLoading = ref(true)
const loadError = ref<string | null>(null)
// Types being persisted right now (each drives its own spinner). Several can be in
// flight at once: the PUT is partial, so two switches never overwrite each other.
const saving = ref<Set<string>>(new Set())

const load = async () => {
  isLoading.value = true
  loadError.value = null
  try {
    preferences.value = await fantasyPushPreferenceService.getPreferences()
  } catch (err) {
    console.error('Error loading fantasy push preferences:', err)
    loadError.value = t('user.settings.fantasyPush.loadError')
  } finally {
    isLoading.value = false
  }
}

onMounted(load)

// Optimistic: flip locally, send only that type, revert on failure.
const toggle = async (preference: FantasyPushPreferenceResponse) => {
  if (saving.value.has(preference.type)) return

  preference.enabled = !preference.enabled
  saving.value = new Set(saving.value).add(preference.type)

  try {
    await fantasyPushPreferenceService.setPreference(preference.type, preference.enabled)
  } catch (err) {
    console.error('Error updating fantasy push preference:', err)
    preference.enabled = !preference.enabled
    toast.error(t('user.settings.fantasyPush.saveError'))
  } finally {
    const next = new Set(saving.value)
    next.delete(preference.type)
    saving.value = next
  }
}

// Each type gets the thing it is about instead of a generic bell. Unknown types fall
// back to a bell so a new backend type still renders cleanly.
const VISUALS: Record<string, { icon: string; tile: string }> = {
  player_events: {
    icon: 'gi-soccer-ball',
    tile: 'bg-emerald-50 dark:bg-emerald-900/25 text-emerald-600 dark:text-emerald-400',
  },
  sidelined: {
    icon: 'hi-solid-shield-exclamation',
    tile: 'bg-red-50 dark:bg-red-900/25 text-red-500 dark:text-red-400',
  },
  lineup_reminder: {
    icon: 'hi-solid-clock',
    tile: 'bg-violet-50 dark:bg-violet-900/25 text-violet-500 dark:text-violet-400',
  },
}
const FALLBACK = {
  icon: 'hi-solid-bell',
  tile: 'bg-gray-100 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400',
}
const visualFor = (type: string) => VISUALS[type] ?? FALLBACK
</script>

<template>
  <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden mb-6">
    <div class="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
      <h3 class="text-base font-semibold text-gray-900 dark:text-white">{{ $t('user.settings.fantasyPush.title') }}</h3>
      <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{{ $t('user.settings.fantasyPush.subtitle') }}</p>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="divide-y divide-gray-100 dark:divide-gray-700">
      <div v-for="n in 3" :key="n" class="flex items-center gap-4 px-5 py-4">
        <div class="w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse shrink-0" />
        <div class="flex-1 space-y-2">
          <div class="h-3 w-2/3 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
          <div class="h-2.5 w-full rounded bg-gray-100 dark:bg-gray-700/60 animate-pulse" />
        </div>
        <div class="w-12 h-7 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse shrink-0" />
      </div>
    </div>

    <!-- Error -->
    <div v-else-if="loadError" class="px-5 py-6 flex flex-col items-center text-center">
      <p class="text-xs text-red-500 dark:text-red-400 mb-3">{{ loadError }}</p>
      <button
        @click="load"
        class="px-4 py-2 text-xs font-semibold rounded-full bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"
      >
        {{ $t('common.actions.retry') }}
      </button>
    </div>

    <!-- Switches -->
    <div v-else class="divide-y divide-gray-100 dark:divide-gray-700">
      <div v-for="preference in preferences" :key="preference.type" class="flex items-center gap-4 px-5 py-4">
        <div
          class="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
          :class="visualFor(preference.type).tile"
        >
          <v-icon :name="visualFor(preference.type).icon" class="w-5 h-5" />
        </div>

        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-gray-900 dark:text-white">{{ preference.name }}</p>
          <p class="text-xs text-gray-500 dark:text-gray-400">{{ preference.description }}</p>
        </div>

        <button
          @click="toggle(preference)"
          :disabled="saving.has(preference.type)"
          class="relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 shrink-0"
          :class="preference.enabled ? 'bg-emerald-600' : 'bg-gray-300 dark:bg-gray-600'"
          role="switch"
          :aria-checked="preference.enabled"
          :aria-label="$t('user.settings.fantasyPush.toggleAria', { name: preference.name })"
        >
          <span
            class="inline-flex items-center justify-center h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200"
            :class="preference.enabled ? 'translate-x-6' : 'translate-x-1'"
          >
            <v-icon
              v-if="saving.has(preference.type)"
              name="pr-spinner"
              class="w-3 h-3 text-emerald-600 animate-spin"
            />
          </span>
        </button>
      </div>
    </div>
  </div>
</template>
