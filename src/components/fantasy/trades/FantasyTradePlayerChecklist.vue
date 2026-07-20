<script setup lang="ts">
import { usePositionShortCode } from '@/composables/usePositionShortCode'
import type { FantasyPlayerDraftResponse } from '@/interfaces/fantasy/draft/FantasyPlayerDraftResponse'

interface Props {
  players: FantasyPlayerDraftResponse[]
  modelValue: string[]
  loading: boolean
  emptyText: string
}

const props = defineProps<Props>()
const emit = defineEmits<{ 'update:modelValue': [value: string[]] }>()

const positionShort = usePositionShortCode()

function isSelected(playerUuid: string): boolean {
  return props.modelValue.includes(playerUuid)
}

function toggle(playerUuid: string) {
  emit(
    'update:modelValue',
    isSelected(playerUuid)
      ? props.modelValue.filter((uuid) => uuid !== playerUuid)
      : [...props.modelValue, playerUuid],
  )
}

function positionColorClass(developerName: string): string {
  const map: Record<string, string> = {
    GOALKEEPER: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
    DEFENDER: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
    MIDFIELDER: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
    ATTACKER: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
  }
  return map[developerName] ?? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
}
</script>

<template>
  <div>
    <!-- Loading -->
    <div v-if="loading" class="space-y-1.5">
      <div v-for="n in 4" :key="n" class="flex items-center gap-2.5 px-2.5 py-2 animate-pulse">
        <div class="w-5 h-5 rounded-md bg-gray-200 dark:bg-gray-700 shrink-0" />
        <div class="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 shrink-0" />
        <div class="flex-1 min-w-0 space-y-1.5">
          <div class="h-3 rounded-full bg-gray-200 dark:bg-gray-700" :style="{ width: `${55 + (n * 9) % 30}%` }" />
          <div class="h-2 w-10 rounded-full bg-gray-100 dark:bg-gray-700/60" />
        </div>
        <div class="w-6 h-4 rounded bg-gray-100 dark:bg-gray-700/60 shrink-0" />
      </div>
    </div>

    <!-- Empty -->
    <p v-else-if="players.length === 0" class="text-footnote text-gray-400 dark:text-gray-500 text-center py-4">
      {{ emptyText }}
    </p>

    <!-- List -->
    <div v-else class="max-h-56 overflow-y-auto space-y-1 -mx-1 px-1">
      <label
        v-for="p in players"
        :key="p.player.uuid"
        class="flex items-center gap-2.5 px-2.5 py-2 rounded-xl cursor-pointer transition-colors"
        :class="isSelected(p.player.uuid) ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800/60'"
      >
        <input
          type="checkbox"
          class="sr-only"
          :checked="isSelected(p.player.uuid)"
          @change="toggle(p.player.uuid)"
        />
        <span
          class="w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors"
          :class="isSelected(p.player.uuid) ? 'bg-blue-500 border-blue-500' : 'border-gray-300 dark:border-gray-600'"
        >
          <v-icon v-if="isSelected(p.player.uuid)" name="hi-solid-check" class="w-3.5 h-3.5 text-white" />
        </span>
        <img
          :src="p.player.image_path || '/img/default-avatar.svg'"
          :alt="p.player.display_name"
          class="w-8 h-8 rounded-full object-cover border border-gray-200 dark:border-gray-600 shrink-0"
        />
        <div class="flex-1 min-w-0">
          <p class="text-footnote font-medium text-gray-900 dark:text-white truncate">{{ p.player.display_name }}</p>
          <p class="text-2xs text-gray-400 dark:text-gray-500 truncate">{{ p.team.short_code }}</p>
        </div>
        <span
          class="inline-flex items-center justify-center px-1.5 py-0.5 rounded text-2xs font-bold shrink-0"
          :class="positionColorClass(p.position.developer_name)"
        >
          {{ positionShort(p.position.developer_name) }}
        </span>
      </label>
    </div>
  </div>
</template>
