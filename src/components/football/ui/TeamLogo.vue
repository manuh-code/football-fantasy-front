<template>
  <div 
    :class="[
      'team-logo-container',
      containerClasses
    ]"
  >
    <img
      :src="teamImage"
      :alt="teamName"
      :class="[sizeClasses, shapeClasses]"
      class="object-contain team-logo"
      @error="handleImageError"
      @load="handleImageLoad"
    />
    
    <!-- Loading skeleton -->
    <div 
      v-if="showLoadingState && !imageLoaded"
      :class="[sizeClasses, shapeClasses]"
      class="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, withDefaults, defineProps } from 'vue'
import { FootballTeamResponse } from '@/interfaces/football/team/FootballTeamResponse'

interface Props {
  team?: FootballTeamResponse | null
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'square' | 'rounded' | 'circle'
  fallbackSrc?: string
  showLoadingState?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  team: null,
  size: 'md',
  variant: 'square',
  fallbackSrc: '/img/default-avatar.svg',
  showLoadingState: false
})

// State
const imageLoaded = ref(false)
const imageError = ref(false)

// Computed
const teamImage = computed((): string => {
  if (imageError.value) return props.fallbackSrc
  return props.team?.image_path || props.fallbackSrc
})

const teamName = computed((): string => {
  return props.team?.name || props.team?.short_code || 'Team'
})

const sizeClasses = computed((): string => {
  const sizes = {
    xs: 'w-4 h-4',
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  }
  return sizes[props.size]
})

const shapeClasses = computed((): string => {
  const shapes = {
    square: '',
    rounded: 'rounded-md',
    circle: 'rounded-full'
  }
  return shapes[props.variant]
})

const containerClasses = computed((): string => {
  return `relative inline-block ${sizeClasses.value}`
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
.team-logo {
  transition: opacity 0.2s ease-in-out;
  background: transparent;
}

/* Loading state */
.team-logo:not([src]) {
  opacity: 0.5;
}

/* Hover effect for interactive contexts */
.team-logo:hover {
  opacity: 0.8;
}

/* Ensure logos maintain aspect ratio */
.team-logo {
  max-width: 100%;
  max-height: 100%;
}
</style>