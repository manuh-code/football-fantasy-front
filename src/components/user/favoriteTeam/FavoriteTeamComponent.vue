<template>
    <div class="animate-page-enter w-full max-w-4xl mx-auto">
        <div
            class="bg-white dark:bg-gray-800 shadow-xl rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
            <!-- Header Section -->
            <div
                class="bg-gradient-to-r from-emerald-600 to-emerald-700 dark:from-emerald-700 dark:to-emerald-800 px-6 md:px-8 py-8 md:py-12 text-white">
                <div class="text-center">
                    <div class="w-16 h-16 bg-white/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                        <v-icon name="gi-soccer-ball" class="w-8 h-8 text-white" />
                    </div>
                    <h1 class="text-2xl md:text-3xl font-bold mb-2">
                        Favorite Football Team
                    </h1>
                    <p class="text-emerald-100 text-base md:text-lg">
                        Select your favorite football team to personalize your experience
                    </p>
                </div>
            </div>

            <!-- Form Section -->
            <div class="p-6 md:p-8">
                <!-- Current Favorite Team Section -->
                <div v-if="hasExistingFavoriteTeam" class="mb-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
                    <div class="flex items-center gap-3 mb-3">
                        <div class="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                            <v-icon name="hi-solid-star" class="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <h3 class="text-lg font-semibold text-emerald-900 dark:text-emerald-100">Current Favorite Team</h3>
                    </div>
                    <div class="flex items-center space-x-4">
                        <div class="w-12 h-12 bg-white dark:bg-gray-600 rounded-lg flex items-center justify-center overflow-hidden border-2 border-emerald-200 dark:border-emerald-700">
                            <img 
                                v-if="currentFavoriteTeam?.image_path" 
                                :src="currentFavoriteTeam.image_path" 
                                :alt="currentFavoriteTeam.name"
                                class="w-full h-full object-contain"
                                @error="onImageError"
                            />
                            <v-icon v-else name="gi-soccer-ball" class="w-6 h-6 text-emerald-400" />
                        </div>
                        <div>
                            <h4 class="text-lg font-bold text-emerald-900 dark:text-emerald-100">{{ currentFavoriteTeam?.name }}</h4>
                            <p class="text-emerald-700 dark:text-emerald-300 text-sm">{{ currentFavoriteTeam?.country?.name }}</p>
                            <p v-if="currentFavoriteTeam?.founded" class="text-xs text-emerald-600 dark:text-emerald-400">
                                Founded: {{ currentFavoriteTeam.founded }}
                            </p>
                        </div>
                    </div>
                </div>

                <form @submit.prevent="handleSubmit" class="space-y-6">
                    <!-- Team Selection -->
                    <div>
                        <SelectComponent v-model="selectedTeamId" :options="teamOptions" value-key="uuid"
                            label-key="name" 
                            :label="hasExistingFavoriteTeam ? 'Change Favorite Team' : 'Select Favorite Team'" 
                            :placeholder="hasExistingFavoriteTeam ? 'Choose a different team' : 'Select your favorite team'" 
                            required
                            :disabled="isLoading"
                            :error="hasFieldError('teamUuid') ? getFieldError('teamUuid').join(', ') : ''" />
                    </div>

                    <!-- Team Preview -->
                    <div v-if="selectedTeam" class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">Team Preview</h3>
                        <div class="flex items-center space-x-4">
                            <div
                                class="w-16 h-16 bg-white dark:bg-gray-600 rounded-lg flex items-center justify-center overflow-hidden border-2 border-gray-200 dark:border-gray-500">
                                <img v-if="selectedTeam.image_path" :src="selectedTeam.image_path"
                                    :alt="selectedTeam.name" class="w-full h-full object-contain"
                                    @error="onImageError" />
                                <v-icon v-else name="gi-soccer-ball" class="w-8 h-8 text-gray-400" />
                            </div>
                            <div>
                                <h4 class="text-xl font-bold text-gray-900 dark:text-white">{{ selectedTeam.name }}</h4>
                                <p class="text-gray-600 dark:text-gray-400">{{ selectedTeam.country?.name }}</p>
                                <p v-if="selectedTeam.founded" class="text-sm text-gray-500 dark:text-gray-400">
                                    Founded: {{ selectedTeam.founded }}
                                </p>
                            </div>
                        </div>
                    </div>

                    <!-- Action Buttons -->
                    <div class="flex flex-col sm:flex-row gap-4 pt-6">
                        <ButtonComponent type="submit" variant="primary" :loading="isLoading"
                            :disabled="isSubmitDisabled" class="w-full sm:w-auto">
                            <v-icon name="hi-solid-heart" class="w-4 h-4 mr-2" />
                            {{ hasExistingFavoriteTeam ? 'Update Favorite Team' : 'Save Favorite Team' }}
                        </ButtonComponent>

                        <ButtonComponent type="button" variant="secondary" @click="handleReset" :disabled="isLoading"
                            class="w-full sm:w-auto">
                            <v-icon name="hi-solid-refresh" class="w-4 h-4 mr-2" />
                            Reset Selection
                        </ButtonComponent>
                    </div>
                </form>

                <!-- Loading State -->
                <div v-if="isLoadingTeams" class="text-center py-8">
                    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
                    <p class="text-gray-600 dark:text-gray-400">Loading football teams...</p>
                </div>

                <!-- Error State -->
                <div v-if="errorMessage"
                    class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mt-6">
                    <div class="flex items-center">
                        <v-icon name="hi-solid-exclamation-triangle"
                            class="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
                        <p class="text-red-800 dark:text-red-200">{{ errorMessage }}</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { catalogService } from '@/services'
import { useValidationStore } from '@/store/validation/useValidationStore'
import { useToast } from '@/composables/useToast'
import { ButtonComponent, SelectComponent } from '@/components/ui'
import type { FootballTeamResponse } from '@/interfaces/football/team/FootballTeamResponse'
import { useUserStore } from '@/store'

// Stores and composables
const validationStore = useValidationStore()
const toast = useToast()
const userStore = useUserStore()

// State
const footballTeams = ref<FootballTeamResponse[]>([])
const selectedTeamId = ref<string | null>(null)
const isLoading = ref(false)
const isLoadingTeams = ref(false)
const errorMessage = ref<string>('')

// Computed properties
const currentFavoriteTeam = computed(() => userStore.getFavoriteTeam)

const teamOptions = computed(() => {
    return footballTeams.value.map(team => ({
        uuid: team.uuid,
        name: team.name,
        short_code: team.short_code,
        image_path: team.image_path,
        founded: team.founded
    }))
})

const selectedTeam = computed(() => {
    if (!selectedTeamId.value) return null
    return footballTeams.value.find(team => team.uuid === selectedTeamId.value) || null
})

const hasExistingFavoriteTeam = computed(() => !!currentFavoriteTeam.value)

const isSubmitDisabled = computed(() => {
    if (isLoading.value || !selectedTeamId.value) return true
    
    // Disable if no changes made (same team selected)
    if (currentFavoriteTeam.value && selectedTeamId.value === currentFavoriteTeam.value.uuid) {
        return true
    }
    
    return false
})

// Validation helpers
const hasFieldError = (fieldName: string) => validationStore.hasFieldError(fieldName)
const getFieldError = (fieldName: string) => validationStore.getFieldError(fieldName)

// Methods
const loadFootballTeams = async () => {
    isLoadingTeams.value = true
    errorMessage.value = ''

    try {
        footballTeams.value = await catalogService.getFootballTeams()
        
        // Pre-select current favorite team if exists
        if (currentFavoriteTeam.value && !selectedTeamId.value) {
            selectedTeamId.value = currentFavoriteTeam.value.uuid
        }
    } catch (error) {
        console.error('Error loading football teams:', error)
        errorMessage.value = 'Failed to load football teams. Please try again later.'
    } finally {
        isLoadingTeams.value = false
    }
}

const handleSubmit = async () => {
    if (!selectedTeamId.value) {
        validationStore.setFieldError('teamUuid', 'Please select a football team')
        return
    }

    // Check if the selected team is the same as current favorite
    if (currentFavoriteTeam.value && selectedTeamId.value === currentFavoriteTeam.value.uuid) {
        toast.info('No changes', 'This team is already your favorite!')
        return
    }

    isLoading.value = true
    validationStore.clearValidatorError()

    try {
        // Save the favorite team to the user's profile
        await userStore.updateFavoriteTeam({ teamUuid: selectedTeamId.value })

        const actionText = hasExistingFavoriteTeam.value ? 'updated' : 'set'
        toast.success('Team Saved!', `${selectedTeam.value?.name} has been ${actionText} as your favorite team!`)

    } finally {
        isLoading.value = false
    }
}

const handleReset = () => {
    // Reset to current favorite team if exists, otherwise clear selection
    selectedTeamId.value = currentFavoriteTeam.value?.uuid || null
    validationStore.clearValidatorError()
}

const onImageError = (event: Event) => {
    const target = event.target as HTMLImageElement
    target.style.display = 'none'
}

// Lifecycle
onMounted(async () => {
    // Ensure user data is loaded first
    if (!userStore.getUserData) {
        try {
            await userStore.setUserDataFromApi()
        } catch (error) {
            console.error('Error loading user data:', error)
        }
    }
    
    // Then load football teams
    await loadFootballTeams()
})
</script>

<style scoped>
/* Additional custom styles if needed */
.animate-spin {
    animation: spin 1s linear infinite;
}

@keyframes spin {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
}
</style>