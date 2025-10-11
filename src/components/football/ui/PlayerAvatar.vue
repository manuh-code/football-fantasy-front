<template>
  <div 
    :class="[
      'player-avatar-container',
      containerClasses
    ]"
  >
    <img
      :src="playerImage"
      :alt="playerName"
      :class="[sizeClasses, shapeClasses]"
      class="object-cover player-avatar"
      @error="handleImageError"
      @load="handleImageLoad"
    />
    
    <!-- Loading skeleton -->
    <div 
      v-if="showLoadingState && !imageLoaded"
      :class="[sizeClasses, shapeClasses]"
      class="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse"
    />
    
    <!-- Optional status indicator -->
    <div 
      v-if="showStatus && status"
      :class="statusClasses"
      class="absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, withDefaults, defineProps } from 'vue'
import { FootballPlayerStatisticResponse } from '@/interfaces/football/player/FootballPlayerStatisticResponse'
import { FootballPlayerResponse } from '@/interfaces/football/player/FootballPlayerResponse'

interface Props {
  player?: FootballPlayerStatisticResponse | FootballPlayerResponse | null
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  variant?: 'square' | 'rounded' | 'circle'
  fallbackSrc?: string
  showLoadingState?: boolean
  showStatus?: boolean
  status?: 'online' | 'offline' | 'injured' | 'suspended' | null
}

const props = withDefaults(defineProps<Props>(), {
  player: null,
  size: 'md',
  variant: 'circle',
  fallbackSrc: '/img/default-avatar.svg',
  showLoadingState: false,
  showStatus: false,
  status: null
})

// State
const imageLoaded = ref(false)
const imageError = ref(false)

// Computed
const playerImage = computed((): string => {
  if (imageError.value) return props.fallbackSrc
  return props.player?.image_path || props.fallbackSrc
})

const playerName = computed((): string => {
  return props.player?.display_name || 
         props.player?.common_name || 
         props.player?.full_name || 
         'Player'
})

const sizeClasses = computed((): string => {
  const sizes = {
    xs: 'w-4 h-4',
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
    '2xl': 'w-20 h-20'
  }
  return sizes[props.size]
})

const shapeClasses = computed((): string => {
  const shapes = {
    square: '',
    rounded: 'rounded-lg',
    circle: 'rounded-full'
  }
  return shapes[props.variant]
})

const containerClasses = computed((): string => {
  return `relative inline-block ${sizeClasses.value}`
})

const statusClasses = computed((): string => {
  if (!props.status) return ''
  
  const statusColors = {
    online: 'bg-green-500',
    offline: 'bg-gray-400',
    injured: 'bg-red-500',
    suspended: 'bg-yellow-500'
  }
  
  return statusColors[props.status] || 'bg-gray-400'
})

// Methods
const handleImageError = () => {
  imageError.value = true
  imageLoaded.value = true
}

const handleImageLoad = () => {
  imageLoaded.value = true
  imageError.value = false
}
</script>

<style scoped>
.player-avatar {
  transition: all 0.2s ease-in-out;
  background: theme('colors.gray.100');
}

.dark .player-avatar {
  background: theme('colors.gray.700');
}

/* Loading state */
.player-avatar:not([src]) {
  opacity: 0.5;
}

/* Hover effect for interactive contexts */
.player-avatar:hover {
  opacity: 0.9;
  transform: scale(1.02);
}

/* Ensure avatars maintain aspect ratio */
.player-avatar {
  width: 100%;
  height: 100%;
}

/* Better border for circular avatars */
.player-avatar.rounded-full {
  border: 2px solid rgba(255, 255, 255, 0.1);
}

.dark .player-avatar.rounded-full {
  border: 2px solid rgba(0, 0, 0, 0.2);
}
</style>