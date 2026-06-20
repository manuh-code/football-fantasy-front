<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import type { FantasyLeagueMatchupResponse } from '@/interfaces/fantasy/matchups/FantasyLeagueMatchupResponse'

interface Props {
  matchups: FantasyLeagueMatchupResponse[]
}

const props = defineProps<Props>()
const emit = defineEmits<{ select: [matchup: FantasyLeagueMatchupResponse] }>()

const scrollContainer = ref<HTMLElement | null>(null)
const activeIndex = ref(0)

function onScroll() {
  if (!scrollContainer.value || !scrollContainer.value.children.length) return
  const container = scrollContainer.value
  const cardWidth = (container.children[0] as HTMLElement).offsetWidth
  activeIndex.value = Math.round(container.scrollLeft / cardWidth)
}

watch(activeIndex, (index) => {
  if (props.matchups[index]) emit('select', props.matchups[index])
})

onMounted(() => {
  scrollContainer.value?.addEventListener('scroll', onScroll, { passive: true })
})

onUnmounted(() => {
  scrollContainer.value?.removeEventListener('scroll', onScroll)
})
</script>

<template>
  <div class="w-full">
    <!-- Carousel track -->
    <div
      ref="scrollContainer"
      class="carousel-track flex overflow-x-auto snap-x snap-mandatory gap-3 px-4 pb-1"
      style="-webkit-overflow-scrolling: touch; scroll-behavior: smooth;"
    >
      <div
        v-for="(matchup, index) in props.matchups"
        :key="matchup.uuid"
        class="snap-center shrink-0 w-[calc(100%-2.5rem)] bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/60 overflow-hidden"
        :class="{ 'opacity-40 scale-95': index !== activeIndex }"
        style="transition: opacity 0.2s ease, transform 0.2s ease;"
      >
        <!-- Status line -->
        <div
          class="h-0.5 w-full"
          :class="{
            'bg-emerald-400': matchup.status === 'completed',
            'bg-amber-400': matchup.status === 'pending',
            'bg-gray-200 dark:bg-gray-700': matchup.status === 'cancelled',
          }"
        />

        <div class="px-4 py-4 flex items-center gap-3">

          <!-- Home team -->
          <div class="flex items-center gap-2.5 flex-1 min-w-0">
            <div
              class="w-10 h-10 rounded-full overflow-hidden border bg-gray-50 dark:bg-gray-700 flex items-center justify-center shrink-0"
              :class="matchup.status === 'completed' && matchup.winner === matchup.home.team.uuid
                ? 'border-emerald-400 dark:border-emerald-500'
                : 'border-gray-200 dark:border-gray-600'"
            >
              <img v-if="matchup.home.team.image_path" :src="matchup.home.team.image_path" :alt="matchup.home.team.team_name" class="w-full h-full object-cover" />
              <span v-else class="text-2xs font-bold text-gray-400">{{ matchup.home.team.team_name.substring(0, 2).toUpperCase() }}</span>
            </div>
            <div class="min-w-0">
              <p class="text-footnote font-semibold text-gray-800 dark:text-gray-200 truncate leading-tight">
                {{ matchup.home.team.team_name }}
              </p>
              <p class="text-2xs text-gray-400 dark:text-gray-500 leading-tight">
                {{ matchup.status === 'completed' && matchup.winner === matchup.home.team.uuid ? 'Winner' : matchup.is_draw && matchup.status === 'completed' ? 'Draw' : 'Home' }}
              </p>
            </div>
          </div>

          <!-- Score -->
          <div class="flex items-center gap-1.5 shrink-0 px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-700/50">
            <span class="text-lg font-extrabold tabular-nums leading-none text-gray-900 dark:text-white">{{ matchup.home.score }}</span>
            <span class="text-xs text-gray-300 dark:text-gray-600">–</span>
            <span class="text-lg font-extrabold tabular-nums leading-none text-gray-900 dark:text-white">{{ matchup.away.score }}</span>
          </div>

          <!-- Away team -->
          <div class="flex items-center gap-2.5 flex-1 min-w-0 justify-end">
            <div class="min-w-0 text-right">
              <p class="text-footnote font-semibold text-gray-800 dark:text-gray-200 truncate leading-tight">
                {{ matchup.away.team.team_name }}
              </p>
              <p class="text-2xs text-gray-400 dark:text-gray-500 leading-tight">
                {{ matchup.status === 'completed' && matchup.winner === matchup.away.team.uuid ? 'Winner' : matchup.is_draw && matchup.status === 'completed' ? 'Draw' : 'Away' }}
              </p>
            </div>
            <div
              class="w-10 h-10 rounded-full overflow-hidden border bg-gray-50 dark:bg-gray-700 flex items-center justify-center shrink-0"
              :class="matchup.status === 'completed' && matchup.winner === matchup.away.team.uuid
                ? 'border-emerald-400 dark:border-emerald-500'
                : 'border-gray-200 dark:border-gray-600'"
            >
              <img v-if="matchup.away.team.image_path" :src="matchup.away.team.image_path" :alt="matchup.away.team.team_name" class="w-full h-full object-cover" />
              <span v-else class="text-2xs font-bold text-gray-400">{{ matchup.away.team.team_name.substring(0, 2).toUpperCase() }}</span>
            </div>
          </div>

        </div>
      </div>
    </div>


  </div>
</template>

<style scoped>
.carousel-track {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.carousel-track::-webkit-scrollbar {
  display: none;
}
</style>
