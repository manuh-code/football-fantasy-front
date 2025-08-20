<template>
    <!-- Modal Backdrop -->
    <Transition name="modal-backdrop">
        <div v-if="isVisible" 
            class="fixed inset-0 z-50 overflow-y-auto bg-gray-500 bg-opacity-75 backdrop-blur-sm transition-all duration-300"
            @click="closeModal"
        >
            <!-- Modal Content Container -->
            <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <!-- This element is to trick the browser into centering the modal contents. -->
                <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                <!-- Modal panel with animation -->
                <Transition name="modal-content" appear>
                    <dialog v-if="isVisible" 
                        :open="isVisible"
                        class="relative inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6 border-0"
                        aria-labelledby="modal-title"
                        @click.stop
                    >
                
                <!-- Header -->
                <div class="sm:flex sm:items-start">
                    <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 sm:mx-0 sm:h-10 sm:w-10">
                        <v-icon v-if="league?.is_private" name="hi-solid-lock-closed" class="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                        <v-icon v-else name="hi-solid-user" class="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left flex-1">
                        <h3 class="text-lg leading-6 font-semibold text-gray-900 dark:text-white" id="modal-title">
                            Join Private League
                        </h3>
                        <div class="mt-2">
                            <p class="text-sm text-gray-500 dark:text-gray-400">
                                This is a private league. Please enter the league password to join.
                            </p>
                        </div>
                    </div>
                    <!-- Close button -->
                    <button 
                        @click="closeModal"
                        class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        aria-label="Close modal"
                    >
                        <v-icon name="hi-solid-x" class="h-5 w-5" />
                    </button>
                </div>

                <!-- League Info -->
                <div v-if="league" class="mt-6 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                    <div class="flex items-start space-x-4">
                        <div class="flex-shrink-0">
                            <div v-if="league.image_path" class="h-16 w-16 rounded-lg overflow-hidden">
                                <img :src="league.image_path" :alt="league.name" class="h-full w-full object-cover" />
                            </div>
                            <div v-else class="h-16 w-16 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                                <v-icon name="bi-trophy-fill" class="h-8 w-8 text-white" />
                            </div>
                        </div>
                        <div class="flex-1 min-w-0">
                            <h4 class="text-lg font-semibold text-gray-900 dark:text-white truncate">{{ league.name }}</h4>
                            <p class="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                                {{ league.description || 'No description provided.' }}
                            </p>
                            <div class="flex items-center mt-3 space-x-4 text-sm text-gray-500 dark:text-gray-400">
                                <span class="flex items-center">
                                    <v-icon name="hi-solid-users" class="h-4 w-4 mr-1" />
                                    {{ league.participants_count }} participants
                                </span>
                                <span class="flex items-center">
                                    <v-icon name="hi-solid-calendar" class="h-4 w-4 mr-1" />
                                    Started {{ formatDate(league.started_at) }}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Password for Private Leagues -->
                <div v-if="league?.is_private" class="mt-4">
                    <label for="league-password" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        League Password <span class="text-red-500">*</span>
                    </label>
                    <input
                        id="league-password"
                        v-model="leaguePassword"
                        type="password"
                        placeholder="Enter the league password..."
                        required
                        :class="[
                            'w-full px-3 py-2 border rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:text-white',
                            passwordError 
                                ? 'border-red-300 dark:border-red-600 focus:ring-red-500 focus:border-red-500' 
                                : 'border-gray-300 dark:border-gray-600'
                        ]"
                    />
                    <!-- Password Error Message -->
                    <div v-if="passwordError" class="mt-2 flex items-start space-x-2">
                        <v-icon name="hi-solid-exclamation-circle" class="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                        <p class="text-sm text-red-600 dark:text-red-400">
                            {{ passwordError }}
                        </p>
                    </div>
                </div>

                <!-- Actions -->
                <div class="mt-8 sm:flex sm:flex-row-reverse space-y-3 sm:space-y-0 sm:space-x-3 sm:space-x-reverse">
                    <ButtonComponent
                        variant="primary"
                        size="md"
                        :loading="isLoading"
                        :disabled="isLoading"
                        @click="handleJoin"
                        class="w-full sm:w-auto"
                    >
                        <v-icon name="hi-solid-user" class="h-4 w-4 mr-2" />
                        Join League
                    </ButtonComponent>
                    
                    <ButtonComponent
                        variant="outline"
                        size="md"
                        :disabled="isLoading"
                        @click="closeModal"
                        class="w-full sm:w-auto"
                    >
                        Cancel
                    </ButtonComponent>
                </div>

                <!-- Loading overlay -->
                <div v-if="isLoading" class="absolute inset-0 bg-white/80 dark:bg-gray-800/80 flex items-center justify-center rounded-lg">
                    <div class="flex flex-col items-center space-y-2">
                        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                        <p class="text-sm text-gray-600 dark:text-gray-400">
                            Joining league...
                        </p>
                    </div>
                </div>
                    </dialog>
                </Transition>
            </div>
        </div>
    </Transition>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, defineProps, defineEmits, withDefaults } from 'vue'
import { ButtonComponent } from '@/components/ui'
import type { FantasyLeaguesResponse } from '@/interfaces/fantasy/leagues/FantasyLeaguesResponse'

// Props interface
interface Props {
    isVisible?: boolean
    league?: FantasyLeaguesResponse | null
    isLoading?: boolean
    passwordError?: string
}

// Props with defaults
const props = withDefaults(defineProps<Props>(), {
    isVisible: false,
    league: null,
    isLoading: false,
    passwordError: ''
})

// Emits
const emit = defineEmits<{
    close: []
    join: [joinData: { league: FantasyLeaguesResponse; password?: string }]
}>()

// Reactive state
const leaguePassword = ref('')

// Watch for modal visibility changes to reset form
watch(() => props.isVisible, (newValue) => {
    if (!newValue) {
        leaguePassword.value = ''
    }
})

// Watch for password error changes to focus the input when there's an error
watch(() => props.passwordError, (newError) => {
    if (newError) {
        // Focus the password input when there's an error
        setTimeout(() => {
            const passwordInput = document.getElementById('league-password')
            if (passwordInput) {
                passwordInput.focus()
            }
        }, 100)
    }
})

// Handle keyboard events
const handleKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && props.isVisible && !props.isLoading) {
        closeModal()
    }
}

// Add/remove event listeners
onMounted(() => {
    document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
    document.removeEventListener('keydown', handleKeydown)
})

// Methods
const closeModal = () => {
    if (!props.isLoading) {
        emit('close')
    }
}

const handleJoin = () => {
    if (!props.league) return

    const joinData = {
        league: props.league,
        password: props.league.is_private ? leaguePassword.value : undefined
    }

    emit('join', joinData)
}

const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    })
}
</script>

<style scoped>
/* Line clamp utility */
.line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

/* Modal backdrop animations */
.modal-backdrop-enter-active,
.modal-backdrop-leave-active {
    transition: all 0.3s ease;
}

.modal-backdrop-enter-from,
.modal-backdrop-leave-to {
    opacity: 0;
    backdrop-filter: blur(0px);
}

.modal-backdrop-enter-to,
.modal-backdrop-leave-from {
    opacity: 1;
    backdrop-filter: blur(4px);
}

/* Modal content animations */
.modal-content-enter-active {
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.modal-content-leave-active {
    transition: all 0.2s ease-in;
}

.modal-content-enter-from {
    opacity: 0;
    transform: scale(0.9) translateY(-20px);
}

.modal-content-leave-to {
    opacity: 0;
    transform: scale(0.95) translateY(10px);
}

.modal-content-enter-to,
.modal-content-leave-from {
    opacity: 1;
    transform: scale(1) translateY(0);
}

/* Accessibility: Focus styles */
button:focus,
.focus\:ring-2:focus {
    outline: 2px solid #10b981;
    outline-offset: 2px;
}

/* Ensure modal is above other content */
.z-50 {
    z-index: 50;
}

/* Responsive modal sizing */
@media (max-width: 640px) {
    .sm\:max-w-lg {
        max-width: calc(100vw - 2rem);
    }
}

/* Reduce motion for accessibility */
@media (prefers-reduced-motion: reduce) {
    .modal-backdrop-enter-active,
    .modal-backdrop-leave-active,
    .modal-content-enter-active,
    .modal-content-leave-active {
        transition: none !important;
    }
    
    .modal-content-enter-from,
    .modal-content-leave-to {
        transform: none !important;
    }
}
</style>
