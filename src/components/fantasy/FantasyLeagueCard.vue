<template>
  <div
    @click="clickable ? handleCardClick() : undefined"
    :class="[
      'bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 overflow-hidden transition-all duration-200',
      clickable ? 'cursor-pointer active:scale-[0.98]' : '',
    ]"
  >
    <!-- League Header -->
    <div class="relative h-32 overflow-hidden">
      <!-- Image header -->
      <div v-if="league.image_path" class="relative h-full">
        <img
          :src="league.image_path"
          :alt="league.name"
          class="w-full h-full object-cover"
          @error="onImageError"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
      </div>
      <!-- Fallback gradient -->
      <div v-else class="h-full bg-gradient-to-br from-emerald-500 to-teal-600 relative">
        <div class="absolute inset-0 flex items-center justify-center">
          <v-icon name="bi-trophy-fill" class="w-10 h-10 text-white/30" />
        </div>
        <div class="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
      </div>

      <!-- Top Badges Row -->
      <div class="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between">
        <!-- Privacy -->
        <span
          :class="[
            'inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold backdrop-blur-md',
            league.is_private
              ? 'bg-black/40 text-white/90'
              : 'bg-white/20 text-white/90',
          ]"
        >
          <v-icon
            :name="league.is_private ? 'hi-solid-lock-closed' : 'hi-solid-globe-alt'"
            class="w-2.5 h-2.5"
          />
          {{ league.is_private ? 'Private' : 'Public' }}
        </span>

        <!-- Role -->
        <span
          v-if="league.isAdmin || league.isMember"
          :class="[
            'inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold backdrop-blur-md',
            league.isAdmin
              ? 'bg-amber-500/80 text-white'
              : 'bg-white/20 text-white/90',
          ]"
        >
          <v-icon
            :name="league.isAdmin ? 'hi-solid-star' : 'hi-solid-check-circle'"
            class="w-2.5 h-2.5"
          />
          {{ league.isAdmin ? 'Admin' : 'Member' }}
        </span>
      </div>

      <!-- League Name Overlay -->
      <div class="absolute bottom-2.5 left-3 right-3">
        <h3 class="text-[15px] font-bold text-white drop-shadow-sm line-clamp-1">
          {{ league.name }}
        </h3>
      </div>
    </div>

    <!-- Card Body -->
    <div class="px-3.5 py-3">
      <!-- Description -->
      <p
        v-if="league.description"
        class="text-[12px] text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed mb-3"
      >
        {{ league.description }}
      </p>

      <!-- Stats Row -->
      <div class="flex items-center gap-4 mb-3">
        <!-- Date -->
        <div class="flex items-center gap-1.5 min-w-0">
          <v-icon name="hi-solid-calendar" class="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 shrink-0" />
          <span class="text-[11px] text-gray-500 dark:text-gray-400 truncate">
            {{ formatDate(league.started_at) }}
          </span>
        </div>

        <div class="h-3 w-px bg-gray-200 dark:bg-gray-700" />

        <!-- Participants -->
        <div class="flex items-center gap-1.5">
          <v-icon name="hi-solid-users" class="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 shrink-0" />
          <span class="text-[12px] font-semibold text-gray-900 dark:text-white tabular-nums">
            {{ league.participants_count }}
          </span>
          <span class="text-[11px] text-gray-400 dark:text-gray-500">part.</span>
        </div>

        <div class="h-3 w-px bg-gray-200 dark:bg-gray-700" />

        <!-- Members -->
        <div class="flex items-center gap-1.5">
          <v-icon name="hi-solid-user-group" class="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 shrink-0" />
          <span class="text-[12px] font-semibold text-gray-900 dark:text-white tabular-nums">
            {{ league.members_count }}
          </span>
          <span class="text-[11px] text-gray-400 dark:text-gray-500">memb.</span>
        </div>
      </div>

      <!-- Join Button -->
      <ButtonComponent
        v-if="showJoinButton && !league.isMember"
        variant="primary"
        size="sm"
        :full-width="true"
        @click.stop="$emit('join', league)"
        class="!rounded-xl !text-[13px] !font-semibold"
      >
        <v-icon name="hi-solid-user-add" class="w-3.5 h-3.5 mr-1.5" />
        {{ league.is_private ? 'Request to Join' : 'Join League' }}
      </ButtonComponent>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ButtonComponent } from '@/components/ui'
import type { FantasyLeaguesResponse } from '@/interfaces/fantasy/leagues/FantasyLeaguesResponse'

interface Props {
  league: FantasyLeaguesResponse
  showJoinButton?: boolean
  showViewButton?: boolean
  showManageButton?: boolean
  clickable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showJoinButton: false,
  showViewButton: true,
  showManageButton: true,
  clickable: true,
})

const emit = defineEmits<{
  join: [league: FantasyLeaguesResponse]
  viewDetails: [league: FantasyLeaguesResponse]
}>()

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function onImageError(event: Event) {
  const target = event.target as HTMLImageElement
  target.style.display = 'none'
}

function handleCardClick() {
  emit('viewDetails', props.league)
}
</script>

<style scoped>
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.backdrop-blur-md {
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

@media (prefers-reduced-motion: reduce) {
  .transition-all {
    transition: none !important;
  }
}
</style>
