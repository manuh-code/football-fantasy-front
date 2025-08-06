
<template>
  <div class="home animate-fade-in">
    <div class="container mx-auto px-4 py-8">
      <div class="text-center mb-8">
        <h1 class="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-4">
          {{ appTitle }}
        </h1>
        <p class="text-xl text-gray-600 dark:text-gray-300 animate-slide-up">
          {{ appDescription }}
        </p>
        <p class="text-sm text-gray-500 mt-4">
          Last updated: {{ new Date().toLocaleTimeString() }}
        </p>
      </div>

      <!-- Navigation buttons -->
      <div class="flex justify-center gap-4 mb-8">
        <router-link
          to="/login"
          class="btn btn-primary"
        >
          Sign In
        </router-link>
        <router-link
          to="/about"
          class="btn btn-secondary"
        >
          About
        </router-link>
      </div>
    </div>
  </div>
</template>


<script lang="ts" setup>
import { ref } from 'vue'

const appTitle = ref('Football Fantasy')
const appDescription = ref('Your modern and responsive fantasy football application')
</script>


<style lang="scss" scoped>
.home {
  min-height: calc(100vh - 4rem); // Subtract nav height
}

// Custom animations
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(30px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 0.8s ease-out;
}

.animate-slide-up {
  animation: slide-up 0.8s ease-out 0.2s both;
}

// Button styles
.btn {
  @apply px-6 py-3 rounded-lg font-medium transition-all duration-200 text-center no-underline inline-block;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
  }
}

.btn-primary {
  background: var(--color-primary);
  color: white;
  
  &:hover {
    background: var(--color-primary-hover);
  }
}

.btn-secondary {
  @apply border;
  background: var(--color-bg);
  border-color: var(--color-border);
  color: var(--color-text);
  
  &:hover {
    background: var(--color-bg-hover);
    border-color: var(--color-border-hover);
  }
}
</style>
