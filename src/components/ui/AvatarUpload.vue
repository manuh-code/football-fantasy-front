<template>
  <div class="relative group">
    <!-- Avatar Display -->
    <div class="relative">
      <img
        :src="currentAvatar || '/img/default-avatar.svg'"
        :alt="altText"
        class="w-20 h-20 md:w-24 md:h-24 rounded-full border-4 border-white shadow-lg object-cover transition-all duration-200"
        :class="{ 'group-hover:brightness-75': !isUploading }"
        @error="handleImageError"
      />
      
      <!-- Status Indicator -->
      <div class="absolute -bottom-1 -right-1 md:-bottom-2 md:-right-2 w-5 h-5 md:w-6 md:h-6 rounded-full border-2 border-white"
        :class="statusIndicatorClass">
        <div v-if="isUploading" class="w-full h-full rounded-full bg-blue-500 flex items-center justify-center">
          <svg class="w-3 h-3 text-white animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      </div>

      <!-- Hover Overlay -->
      <div v-if="!isUploading" 
        class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 rounded-full transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
        <v-icon name="hi-camera" class="w-6 h-6 text-white" />
      </div>
    </div>

    <!-- File Input -->
    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      @change="handleFileSelect"
      class="absolute inset-0 w-full h-full opacity-0 cursor-pointer rounded-full"
      :disabled="isUploading"
    />

    <!-- Error Messages with smooth animation -->
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0 scale-90 md:translate-x-2 translate-y-2"
      enter-to-class="opacity-100 scale-100 md:translate-x-0 translate-y-0"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100 scale-100 md:translate-x-0 translate-y-0"
      leave-to-class="opacity-0 scale-90 md:translate-x-2 translate-y-2"
    >
      <div v-if="hasAvatarError" class="absolute top-full left-1/2 transform -translate-x-1/2 mt-4 md:top-0 md:left-full md:ml-4 md:transform-none md:mt-0 z-50">
        <div class="relative">
          <!-- Main error card -->
          <div class="bg-white dark:bg-gray-800 border border-red-200 dark:border-red-600 rounded-lg shadow-2xl backdrop-blur-md px-4 md:px-5 py-3 md:py-4 min-w-[260px] md:min-w-[280px] max-w-[calc(100vw-2rem)] md:max-w-sm">
            <!-- Header with close button -->
            <div class="flex items-start justify-between mb-2 md:mb-3">
              <div class="flex items-center space-x-2">
                <div class="w-7 h-7 md:w-8 md:h-8 bg-red-100 dark:bg-red-900/50 rounded-lg flex items-center justify-center">
                  <v-icon name="hi-solid-exclamation-triangle" class="w-3.5 h-3.5 md:w-4 md:h-4 text-red-500 dark:text-red-400" />
                </div>
                <h4 class="text-xs md:text-sm font-semibold text-gray-900 dark:text-white">Upload Error</h4>
              </div>
              <button 
                @click="clearAvatarError"
                class="w-5 h-5 md:w-6 md:h-6 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md flex items-center justify-center transition-all duration-200"
                aria-label="Close error message"
              >
                <v-icon name="hi-solid-x-mark" class="w-3.5 h-3.5 md:w-4 md:h-4" />
              </button>
            </div>

            <!-- Error message -->
            <div class="space-y-1">
              <p v-for="error in getAvatarErrors" :key="error" class="text-xs md:text-sm text-gray-700 dark:text-gray-300 leading-relaxed break-words">
                {{ error }}
              </p>
            </div>

            <!-- Progress bar for auto-dismiss -->
            <div class="mt-2 md:mt-3 bg-gray-200 dark:bg-gray-700 h-1 rounded-full overflow-hidden">
              <div class="h-full bg-red-400 dark:bg-red-500 rounded-full animate-[shrink_5s_linear_forwards] origin-left"></div>
            </div>
          </div>
          
          <!-- Arrow pointing up on mobile, left on desktop -->
          <div class="absolute -top-2 left-1/2 transform -translate-x-1/2 md:top-4 md:left-0 md:-translate-x-2 md:translate-y-0">
            <div class="w-4 h-4 bg-white dark:bg-gray-800 border-red-200 dark:border-red-600 transform rotate-45 border-l border-t md:border-l md:border-b md:border-t-0"></div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, defineProps, onUnmounted } from 'vue'
import { useUserStore } from '@/store/user/useUserStore'
import { useValidationStore } from '@/store/validation/useValidationStore'
import { useToast } from '@/composables/useToast'

interface ErrorResponse {
  response?: {
    data?: {
      message?: string
    }
  }
}

interface Props {
  currentAvatar?: string | null
  altText?: string
}

defineProps<Props>()

// Stores
const userStore = useUserStore()
const validationStore = useValidationStore()
const toast = useToast()

// State
const isUploading = ref(false)
const fileInput = ref<HTMLInputElement>()
const timeoutId = ref<ReturnType<typeof setTimeout> | null>(null)

// Computed
const hasAvatarError = computed(() => validationStore.hasFieldError('avatar'))
const getAvatarErrors = computed(() => validationStore.getFieldError('avatar'))

const statusIndicatorClass = computed(() => {
  if (isUploading.value) {
    return 'bg-blue-500'
  }
  if (hasAvatarError.value) {
    return 'bg-red-500'
  }
  return 'bg-emerald-400 dark:bg-emerald-500'
})

// Methods
const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.src = '/img/default-avatar.svg'
}

const validateFile = (file: File): string | null => {
  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    return 'Please select a valid image file (JPEG, PNG, GIF, or WebP)'
  }

  // Validate file size (max 5MB)
  const maxSize = 5 * 1024 * 1024
  if (file.size > maxSize) {
    return 'File size must be less than 5MB'
  }

  return null
}

const handleFileSelect = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  
  if (!file) return

  // Clear any previous errors
  validationStore.clearFieldError('avatar')

  // Validate file
  const validationError = validateFile(file)
  if (validationError) {
    validationStore.setFieldError('avatar', validationError)
    startErrorTimeout()
    return
  }

  try {
    isUploading.value = true
    await userStore.changeAvatar(file)
    toast.success('Avatar updated successfully!')
  } catch (error: unknown) {
    console.error('Error uploading avatar:', error)
    const errorMessage = (error as ErrorResponse).response?.data?.message || 'Failed to upload avatar. Please try again.'
    validationStore.setFieldError('avatar', errorMessage)
    startErrorTimeout()
  } finally {
    isUploading.value = false
    // Reset input value so the same file can be selected again
    input.value = ''
  }
}

const startErrorTimeout = () => {
  // Clear any existing timeout
  if (timeoutId.value) {
    clearTimeout(timeoutId.value)
  }
  
  timeoutId.value = setTimeout(() => {
    validationStore.clearFieldError('avatar')
    timeoutId.value = null
  }, 5000)
}

const clearAvatarError = () => {
  if (timeoutId.value) {
    clearTimeout(timeoutId.value)
    timeoutId.value = null
  }
  validationStore.clearFieldError('avatar')
}

onUnmounted(() => {
  if (timeoutId.value) {
    clearTimeout(timeoutId.value)
  }
})
</script>

<style scoped>
/* Additional styles for better UX */
.group:hover input[type="file"] {
  cursor: pointer;
}

input[type="file"]:disabled {
  cursor: not-allowed;
}

/* Custom animation for progress bar */
@keyframes shrink {
  from {
    width: 100%;
  }
  to {
    width: 0%;
  }
}
</style>
