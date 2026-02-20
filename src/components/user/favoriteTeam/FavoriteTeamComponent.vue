<template>
    <div class="animate-page-enter grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <!-- Main Form -->
        <div class="lg:col-span-2">
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <!-- Card Header -->
                <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                            <v-icon name="gi-soccer-ball" class="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                            <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Favorite Football Team</h2>
                            <p class="text-sm text-gray-600 dark:text-gray-400">Select your favorite football team to personalize your experience</p>
                        </div>
                    </div>
                </div>

                <!-- Current Favorite Team Section -->
                <div v-if="hasExistingFavoriteTeam" class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <div class="flex items-center gap-3 mb-3">
                        <div class="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                            <v-icon name="hi-solid-star" class="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <h3 class="text-lg font-semibold text-emerald-900 dark:text-emerald-100">Current Favorite Team</h3>
                    </div>
                    <div class="flex items-center justify-between bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-4">
                        <div class="flex items-center space-x-4">
                            <div class="w-14 h-14 bg-white dark:bg-gray-600 rounded-lg flex items-center justify-center overflow-hidden border-2 border-emerald-200 dark:border-emerald-700 shadow-sm">
                                <img 
                                    v-if="currentFavoriteTeam?.image_path"
                                    :src="currentFavoriteTeam.image_path" 
                                    :alt="currentFavoriteTeam.name"
                                    class="w-full h-full object-contain"
                                    @error="onImageError"
                                />
                                <v-icon v-else name="gi-soccer-ball" class="w-7 h-7 text-emerald-400" />
                            </div>
                            <div>
                                <h4 class="text-lg font-bold text-emerald-900 dark:text-emerald-100">{{ currentFavoriteTeam?.name }}</h4>
                                <p class="text-emerald-700 dark:text-emerald-300 text-sm">{{ currentFavoriteTeam?.country?.name }}</p>
                                <p v-if="currentFavoriteTeam?.founded" class="text-xs text-emerald-600 dark:text-emerald-400">
                                    Founded: {{ currentFavoriteTeam.founded }}
                                </p>
                            </div>
                        </div>
                        <div class="text-right">
                            <div class="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                                <v-icon name="hi-solid-heart" class="w-4 h-4" />
                                <span class="text-sm font-medium">Favorite</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Form -->
                <form @submit.prevent="handleSubmit" class="p-6 space-y-5">
                    <!-- Team Selection -->
                    <div>
                        <SearchableSelectComponent 
                            v-model="selectedTeamId" 
                            :options="teamOptions" 
                            value-key="uuid"
                            label-key="name"
                            image-key="image_path"
                            :label="hasExistingFavoriteTeam ? 'Change Favorite Team *' : 'Select Favorite Team *'" 
                            :placeholder="hasExistingFavoriteTeam ? 'Choose a different team' : 'Select your favorite team'" 
                            :error="hasFieldError('teamUuid') ? getFieldError('teamUuid').join(', ') : ''"
                            search-placeholder="Search team..."
                            accent-color="emerald"
                            default-image="/img/default-team.svg"
                            :clearable="false"
                            required
                        />
                    </div>

                    <!-- Team Preview - Only show if different from current favorite -->
                    <div v-if="selectedTeam && (!currentFavoriteTeam || selectedTeamId !== currentFavoriteTeam.uuid)" 
                        class="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700 transition-all duration-300">
                        <div class="flex items-center gap-3 mb-3">
                            <div class="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                                <v-icon name="hi-solid-eye" class="w-4 h-4 text-white" />
                            </div>
                            <h3 class="text-lg font-semibold text-blue-900 dark:text-blue-100">New Team Preview</h3>
                        </div>
                        <div class="flex items-center justify-between bg-white/70 dark:bg-gray-800/70 rounded-lg p-4 backdrop-blur-sm">
                            <div class="flex items-center space-x-4">
                                <div class="w-14 h-14 bg-white dark:bg-gray-600 rounded-lg flex items-center justify-center overflow-hidden border-2 border-blue-200 dark:border-blue-700 shadow-sm">
                                    <img 
                                        v-if="selectedTeam.image_path"
                                        :src="selectedTeam.image_path" 
                                        :alt="selectedTeam.name"
                                        class="w-full h-full object-contain"
                                        @error="onImageError"
                                    />
                                    <v-icon v-else name="gi-soccer-ball" class="w-7 h-7 text-gray-400" />
                                </div>
                                <div>
                                    <h4 class="text-lg font-bold text-blue-900 dark:text-blue-100">{{ selectedTeam.name }}</h4>
                                    <p class="text-blue-700 dark:text-blue-300 text-sm">{{ selectedTeam.short_code }}</p>
                                    <p v-if="selectedTeam.founded" class="text-xs text-blue-600 dark:text-blue-400">
                                        Founded: {{ selectedTeam.founded }}
                                    </p>
                                </div>
                            </div>
                            <div class="text-right">
                                <div class="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                                    <v-icon name="hi-solid-arrow-right" class="w-4 h-4" />
                                    <span class="text-sm font-medium">New Choice</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Same Team Selected Message -->
                    <div v-else-if="selectedTeam && currentFavoriteTeam && selectedTeamId === currentFavoriteTeam.uuid" 
                        class="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 border border-amber-200 dark:border-amber-700">
                        <div class="flex items-center gap-3">
                            <div class="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
                                <v-icon name="hi-solid-information-circle" class="w-4 h-4 text-white" />
                            </div>
                            <div>
                                <p class="text-amber-800 dark:text-amber-200 font-medium">This is already your favorite team</p>
                                <p class="text-amber-700 dark:text-amber-300 text-sm">Select a different team to make changes</p>
                            </div>
                        </div>
                    </div>

                    <!-- Form Actions -->
                    <div class="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <ButtonComponent 
                            type="button" 
                            variant="cancel" 
                            size="md"
                            text="Reset"
                            :full-width="true"
                            :disabled="isLoading"
                            @click="handleReset" 
                        />
                        <ButtonComponent 
                            type="submit" 
                            variant="primary" 
                            size="md"
                            :text="isLoading ? (hasExistingFavoriteTeam ? 'Updating Team...' : 'Setting Team...') : (hasExistingFavoriteTeam ? 'Update Favorite Team' : 'Set Favorite Team')"
                            :loading="isLoading"
                            :disabled="isSubmitDisabled"
                            :full-width="true"
                            icon="gi-soccer-ball"
                        />
                    </div>
                </form>
            </div>
        </div>

        <!-- Team Info Sidebar -->
        <div class="lg:col-span-1">
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <!-- Info Header -->
                <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <div class="flex items-center gap-3">
                        <div class="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                            <v-icon name="hi-solid-information-circle" class="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h3 class="text-lg font-medium text-gray-900 dark:text-white">Why Choose a Team?</h3>
                    </div>
                </div>

                <!-- Info Content -->
                <div class="p-6 space-y-4">
                    <div class="flex items-start gap-3">
                        <div class="w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <v-icon name="hi-solid-check" class="w-3 h-3 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <p class="text-sm font-medium text-gray-900 dark:text-white">Personalized Experience</p>
                            <p class="text-xs text-gray-600 dark:text-gray-400 mt-1">Get news and updates about your favorite team</p>
                        </div>
                    </div>

                    <div class="flex items-start gap-3">
                        <div class="w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <v-icon name="hi-solid-check" class="w-3 h-3 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <p class="text-sm font-medium text-gray-900 dark:text-white">Better Recommendations</p>
                            <p class="text-xs text-gray-600 dark:text-gray-400 mt-1">Receive tailored fantasy football suggestions</p>
                        </div>
                    </div>

                    <div class="flex items-start gap-3">
                        <div class="w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <v-icon name="hi-solid-check" class="w-3 h-3 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <p class="text-sm font-medium text-gray-900 dark:text-white">Custom Dashboard</p>
                            <p class="text-xs text-gray-600 dark:text-gray-400 mt-1">See your team's performance and stats</p>
                        </div>
                    </div>

                    <div class="flex items-start gap-3">
                        <div class="w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <v-icon name="hi-solid-check" class="w-3 h-3 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <p class="text-sm font-medium text-gray-900 dark:text-white">Easy Changes</p>
                            <p class="text-xs text-gray-600 dark:text-gray-400 mt-1">You can always change your favorite team later</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoadingTeams" class="animate-page-enter">
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
            <p class="text-gray-600 dark:text-gray-400">Loading football teams...</p>
        </div>
    </div>

    <!-- Error State -->
    <div v-if="errorMessage" class="animate-page-enter">
        <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
            <div class="flex items-center">
                <v-icon name="hi-solid-exclamation"
                    class="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
                <p class="text-red-800 dark:text-red-200">{{ errorMessage }}</p>
            </div>
            <ButtonComponent
                variant="outline"
                size="md"
                text="Try Again"
                class="mt-4"
                @click="loadFootballTeams"
            />
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { catalogService } from '@/services'
import { useValidationStore } from '@/store/validation/useValidationStore'
import { useToast } from '@/composables/useToast'
import { ButtonComponent, SearchableSelectComponent } from '@/components/ui'
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
