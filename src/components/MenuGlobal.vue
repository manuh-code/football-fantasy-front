<script lang="ts" setup>
import { useThemeStore } from '@/store/theme'
import { computed } from 'vue'


const themeStore = useThemeStore();

// Computed properties for theme icon
const themeIcon = computed(() => {
  return themeStore.currentTheme === 'dark' ? 'hi-solid-sun' : 'hi-solid-moon'
})

const themeTooltip = computed(() => {
  return themeStore.currentTheme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'
})

function handleThemeToggle() {
  themeStore.toggleTheme()
}

// Keyboard support
function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    handleThemeToggle()
  }
}
</script>

<template>
  <nav class="global-menu">
    <div class="menu-container">
      <!-- Theme Toggle Button -->
      <button
        @click="handleThemeToggle"
        @keydown="handleKeydown"
        :title="themeTooltip"
        class="theme-toggle-btn"
        aria-label="Cambiar tema"
        tabindex="0"
      >
        <v-icon 
          :name="themeIcon" 
          class="theme-icon"
        />
      </button>
    </div>
  </nav>
</template>

<style lang="scss" scoped>
.global-menu {
  position: fixed;
  top: 0;
  right: 0;
  z-index: 50;
  
  .menu-container {
    padding: 1rem;
  }
  
  .theme-toggle-btn {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 3rem;
    height: 3rem;
    border-radius: 9999px;
    background-color: white;
    border: 1px solid #e5e7eb;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    transition: all 0.3s ease-in-out;
    cursor: pointer;
    
    &:focus {
      outline: none;
      box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
    }
    
    &:hover {
      background-color: #f9fafb;
      border-color: #d1d5db;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      transform: scale(1.1);
    }
    
    &:active {
      background-color: #f3f4f6;
      transform: scale(0.95);
    }
    
    // Small screens
    @media (min-width: 640px) {
      width: 2.5rem;
      height: 2.5rem;
    }
  }
  
  .theme-icon {
    width: 1.5rem;
    height: 1.5rem;
    color: #374151;
    transition: all 0.3s ease-in-out;
    
    .theme-toggle-btn:hover & {
      color: #2563eb;
      transform: rotate(180deg);
    }
  }
}

// Dark mode styles
:global(.dark) {
  .global-menu {
    .theme-toggle-btn {
      background-color: #1f2937;
      border-color: #374151;
      
      &:hover {
        background-color: #374151;
        border-color: #4b5563;
      }
      
      &:active {
        background-color: #4b5563;
      }
      
      &:focus {
        box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
      }
    }
    
    .theme-icon {
      color: #d1d5db;
      
      .theme-toggle-btn:hover & {
        color: #60a5fa;
      }
    }
  }
}

// Ensure the menu doesn't interfere with content
.global-menu {
  pointer-events: none;
  
  .menu-container {
    pointer-events: auto;
  }
}

// Mobile responsiveness
@media (max-width: 640px) {
  .global-menu {
    .menu-container {
      padding: 0.75rem;
    }
    
    .theme-toggle-btn {
      width: 2.75rem;
      height: 2.75rem;
    }
    
    .theme-icon {
      width: 1.25rem;
      height: 1.25rem;
    }
  }
}

// Animation keyframes for smooth transitions
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.global-menu {
  animation: fadeIn 0.3s ease-out;
}

// Accessibility improvements
@media (prefers-reduced-motion: reduce) {
  .theme-toggle-btn,
  .theme-icon {
    transition: none;
  }
  
  .theme-toggle-btn:hover .theme-icon {
    transform: none;
  }
  
  .global-menu {
    animation: none;
  }
}

// Global transition for theme changes
:global(*) {
  transition: background-color 0.3s ease-in-out, border-color 0.3s ease-in-out, color 0.3s ease-in-out;
}
</style>
