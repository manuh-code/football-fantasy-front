<script setup lang="ts">
import type { FootballSidelinedResponse } from "@/interfaces/football/fixture/FootballSidelinedResponse";

interface Props {
  sidelined: FootballSidelinedResponse[];
}

defineProps<Props>();
</script>

<template>
  <div class="px-4 pt-2 pb-5">
    <div class="space-y-2">
      <div
        v-for="s in sidelined"
        :key="s.id"
        class="flex items-center gap-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 p-2.5"
      >
        <img
          v-if="s.player?.image_path"
          :src="s.player.image_path"
          :alt="s.player.display_name"
          class="w-8 h-8 rounded-full object-cover bg-gray-100 dark:bg-gray-700 shrink-0"
        />
        <div
          v-else
          class="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center shrink-0"
        >
          <v-icon name="hi-solid-user" class="w-4 h-4 text-gray-400 dark:text-gray-500" />
        </div>
        <div class="min-w-0 flex-1">
          <p class="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate">
            {{ s.player?.display_name ?? "Player" }}
          </p>
          <p class="text-2xs text-red-500 dark:text-red-400 truncate">
            {{ s.type?.name ?? "Injured" }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
