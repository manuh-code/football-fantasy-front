<template>
    <dialog v-if="isVisible" :open="isVisible" class="fixed inset-0 z-50 overflow-y-auto backdrop:bg-gray-500 backdrop:bg-opacity-75" aria-labelledby="modal-title">
        <!-- Modal Content Container -->
        <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <!-- This element is to trick the browser into centering the modal contents. -->
            <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <!-- Modal panel -->
            <div class="relative inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
                
                <!-- Header -->
                <div class="sm:flex sm:items-start">
                    <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 sm:mx-0 sm:h-10 sm:w-10">
                        <v-icon v-if="league?.is_private" name="hi-solid-lock-closed" class="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                        <v-icon v-else name="hi-solid-user" class="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left flex-1">
                        <h3 class="text-lg leading-6 font-semibold text-gray-900 dark:text-white" id="modal-title">
                            {{ league?.is_private ? 'Request to Join Private League' : 'Join Fantasy League' }}
                        </h3>
                        <div class="mt-2">
                            <p class="text-sm text-gray-500 dark:text-gray-400">
                                {{ league?.is_private 
                                    ? 'Send a request to join this private fantasy league. The admin will review your request.' 
                                    : 'Are you sure you want to join this fantasy league?' 
                                }}
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

                <!-- Join Message for Private Leagues -->
                <div v-if="league?.is_private" class="mt-4">
                    <label for="join-message" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Message for Admin (Optional)
                    </label>
                    <textarea
                        id="join-message"
                        v-model="joinMessage"
                        :rows="3"
                        placeholder="Tell the admin why you'd like to join this league..."
                        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:text-white"
                    ></textarea>
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
                        <v-icon v-if="league?.is_private" name="hi-solid-paper-airplane" class="h-4 w-4 mr-2" />
                        <v-icon v-else name="hi-solid-user" class="h-4 w-4 mr-2" />
                        {{ league?.is_private ? 'Send Request' : 'Join League' }}
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
                            {{ league?.is_private ? 'Sending request...' : 'Joining league...' }}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </dialog>
</template>

<script lang="ts">
import { defineComponent, PropType, ref, watch } from 'vue'
import { ButtonComponent } from '@/components/ui'
import type { FantasyLeaguesResponse } from '@/interfaces/fantasy/leagues/FantasyLeaguesResponse'

export default defineComponent({
    name: 'JoinLeagueModal',
    components: {
        ButtonComponent
    },
    props: {
        isVisible: {
            type: Boolean,
            default: false
        },
        league: {
            type: Object as PropType<FantasyLeaguesResponse>,
            default: null
        },
        isLoading: {
            type: Boolean,
            default: false
        }
    },
    emits: ['close', 'join'],
    setup(props, { emit }) {
        const joinMessage = ref('')

        // Watch for modal visibility changes to reset form
        watch(() => props.isVisible, (newValue) => {
            if (!newValue) {
                joinMessage.value = ''
            }
        })

        const closeModal = () => {
            emit('close')
        }

        const handleJoin = () => {
            if (!props.league) return

            const joinData = {
                league: props.league,
                message: props.league.is_private ? joinMessage.value : undefined
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

        return {
            joinMessage,
            closeModal,
            handleJoin,
            formatDate
        }
    }
})
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

/* Modal animations */
.modal-enter-active,
.modal-leave-active {
    transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
    opacity: 0;
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
</style>
