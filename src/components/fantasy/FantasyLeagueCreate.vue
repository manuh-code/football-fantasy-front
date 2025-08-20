<template>
    <div class="animate-page-enter grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <!-- Main Form -->
        <div class="lg:col-span-2">
            <form @submit.prevent="handleSubmit" class="space-y-8">
            <!-- League Information Section -->
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <!-- Section Header -->
                <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                            <v-icon name="hi-solid-information-circle" class="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                            <h2 class="text-xl font-semibold text-gray-900 dark:text-white">League Information</h2>
                            <p class="text-sm text-gray-600 dark:text-gray-400">Basic details about your fantasy league</p>
                        </div>
                    </div>
                </div>

                <!-- Form Fields -->
                <div class="p-6 space-y-6">
                    <!-- League Name -->
                    <div>
                        <FormInput
                            v-model="formData.name"
                            label="League Name *"
                            placeholder="Enter your league name"
                            :error="getFieldError('name')"
                            :disabled="isLoading"
                            
                        />
                    </div>

                    <!-- Football League Selection -->
                    <div>
                        <SelectComponent
                            v-model="formData.league_uuid"
                            :options="footballLeagueOptions"
                            value-key="uuid"
                            label-key="name"
                            label="Football League *"
                            placeholder="Select a football league"
                            :error="getFieldError('league_uuid')"
                            :disabled="isLoading || isLoadingLeagues"
                            
                        />
                        <p v-if="isLoadingLeagues" class="mt-2 text-sm text-gray-500 dark:text-gray-400">
                            <v-icon name="pr-spinner" class="w-4 h-4 inline mr-1" animation="spin" />
                            Loading football leagues...
                        </p>
                    </div>

                    <!-- Description -->
                    <div>
                        <label for="description" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Description
                        </label>
                        <textarea
                            id="description"
                            v-model="formData.description"
                            rows="3"
                            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:text-white"
                            placeholder="Describe your league (optional)"
                            :disabled="isLoading"
                            maxlength="500"
                        />
                        <div class="mt-1 flex justify-between text-xs text-gray-500 dark:text-gray-400">
                            <span v-if="getFieldError('description')" class="text-red-600 dark:text-red-400">
                                {{ getFieldError('description') }}
                            </span>
                            <span class="ml-auto">{{ formData.description?.length || 0 }}/500</span>
                        </div>
                    </div>

                    <!-- Participants Count -->
                    <div>
                        <label for="participants-count" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Number of Participants *
                        </label>
                        <input
                            id="participants-count"
                            v-model.number="formData.participants_count"
                            type="number"
                            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:text-white"
                            placeholder="8"
                            min="2"
                            max="20"
                            :disabled="isLoading"
                            
                        />
                        <div class="mt-1">
                            <span v-if="getFieldError('participants_count')" class="text-xs text-red-600 dark:text-red-400">
                                {{ getFieldError('participants_count') }}
                            </span>
                            <p class="text-xs text-gray-500 dark:text-gray-400">
                                Between 2 and 20 participants
                            </p>
                        </div>
                    </div>

                    <!-- Start Date -->
                    <div>
                        <DateTimePicker
                            v-model="formData.started_at"
                            label="League Start Date *"
                            placeholder="Select when the league starts"
                            :error="getFieldError('started_at')"
                            :disabled="isLoading"
                            :min="minDateTime"
                            help-text="When the league officially begins and scoring starts"
                            
                        />
                    </div>
                </div>
            </div>

            <!-- Privacy Settings Section -->
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <!-- Section Header -->
                <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                            <v-icon name="hi-solid-lock-closed" class="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Privacy Settings</h2>
                            <p class="text-sm text-gray-600 dark:text-gray-400">Control who can join your league</p>
                        </div>
                    </div>
                </div>

                <!-- Form Fields -->
                <div class="p-6 space-y-6">
                    <!-- Privacy Toggle -->
                    <div class="flex items-center justify-between">
                        <div class="flex-1">
                            <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Private League
                            </span>
                            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {{ formData.is_private ? 'Only people with the password can join' : 'Anyone can find and join this league' }}
                            </p>
                        </div>
                        <button
                            type="button"
                            @click="togglePrivacy"
                            :class="[
                                'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2',
                                formData.is_private ? 'bg-emerald-600' : 'bg-gray-200 dark:bg-gray-600'
                            ]"
                            :disabled="isLoading"
                        >
                            <span
                                :class="[
                                    'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                                    formData.is_private ? 'translate-x-5' : 'translate-x-0'
                                ]"
                            />
                        </button>
                    </div>

                    <!-- Password Field (only if private) -->
                    <div v-if="formData.is_private" class="transition-all duration-300">
                        <FormInput
                            v-model="formData.password"
                            type="password"
                            label="League Password *"
                            placeholder="Enter a secure password"
                            :error="getFieldError('password')"
                            :disabled="isLoading"
                            
                        />
                        <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            Share this password with people you want to invite
                        </p>
                    </div>
                </div>
            </div>

            <!-- Draft Settings Section -->
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <!-- Section Header -->
                <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                            <v-icon name="hi-solid-calendar" class="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                            <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Draft Settings</h2>
                            <p class="text-sm text-gray-600 dark:text-gray-400">Configure how players will be drafted</p>
                        </div>
                    </div>
                </div>

                <!-- Form Fields -->
                <div class="p-6 space-y-6">
                    <!-- Draft Date -->
                    <div>
                        <DateTimePicker
                            v-model="formData.draft.draft_day"
                            label="Draft Date *"
                            placeholder="Select when the draft happens"
                            :error="getFieldError('draft.draft_day')"
                            :disabled="isLoading"
                            :min="minDateTime"
                            help-text="When players will be drafted for the league"
                            
                        />
                    </div>

                    <!-- Pick Timer -->
                    <div>
                        <label for="pick-timer" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Pick Timer (seconds) *
                        </label>
                        <input
                            id="pick-timer"
                            v-model.number="formData.draft.pick_timer"
                            type="number"
                            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:text-white"
                            placeholder="120"
                            min="30"
                            :disabled="isLoading"
                            
                            
                        />
                        <div class="mt-1">
                            <span v-if="getFieldError('draft.pick_timer')" class="text-xs text-red-600 dark:text-red-400">
                                {{ getFieldError('draft.pick_timer') }}
                            </span>
                            <p class="text-xs text-gray-500 dark:text-gray-400">
                                Time limit for each draft pick (minimum 30 seconds)
                            </p>
                        </div>
                    </div>

                    <!-- Snake Order Toggle -->
                    <div class="flex items-center justify-between">
                        <div class="flex-1">
                            <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Snake Draft Order
                            </span>
                            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {{ formData.draft.snake_order ? 'Draft order reverses each round (recommended)' : 'Same draft order every round' }}
                            </p>
                        </div>
                        <button
                            type="button"
                            @click="toggleSnakeOrder"
                            :class="[
                                'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2',
                                formData.draft.snake_order ? 'bg-emerald-600' : 'bg-gray-200 dark:bg-gray-600'
                            ]"
                            :disabled="isLoading"
                        >
                            <span
                                :class="[
                                    'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                                    formData.draft.snake_order ? 'translate-x-5' : 'translate-x-0'
                                ]"
                            />
                        </button>
                    </div>

                    <!-- Form Actions -->
                    <div class="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <ButtonComponent
                            type="button"
                            variant="cancel"
                            size="md"
                            text="Cancel"
                            :full-width="true"
                            :disabled="isLoading"
                            @click="handleCancel"
                        />
                        <ButtonComponent
                            type="submit"
                            variant="primary"
                            size="md"
                            :text="isLoading ? 'Creating League...' : 'Create League'"
                            :loading="isLoading"
                            :full-width="true"
                            icon="hi-solid-plus"
                            @click="handleSubmit"
                        />
                    </div>
                </div>
            </div>

            <!-- Spacer for better layout -->
            <div class="h-4"></div>
        </form>
        </div>

        <!-- League Creation Sidebar -->
        <div class="lg:col-span-1">
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <!-- Sidebar Header -->
                <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <div class="flex items-center gap-3">
                        <div class="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                            <v-icon name="hi-solid-light-bulb" class="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h3 class="text-lg font-medium text-gray-900 dark:text-white">League Tips</h3>
                    </div>
                </div>

                <!-- Sidebar Content -->
                <div class="p-6 space-y-4">
                    <div class="flex items-start gap-3">
                        <div class="w-6 h-6 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <v-icon name="bi-trophy-fill" class="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                            <p class="text-sm font-medium text-gray-900 dark:text-white">Choose Your League</p>
                            <p class="text-xs text-gray-600 dark:text-gray-400 mt-1">Select a football league that all participants can follow easily</p>
                        </div>
                    </div>

                    <div class="flex items-start gap-3">
                        <div class="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <v-icon name="hi-solid-user-group" class="w-3 h-3 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <p class="text-sm font-medium text-gray-900 dark:text-white">Perfect Size</p>
                            <p class="text-xs text-gray-600 dark:text-gray-400 mt-1">8-12 participants is ideal for competitive and engaging leagues</p>
                        </div>
                    </div>

                    <div class="flex items-start gap-3">
                        <div class="w-6 h-6 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <v-icon name="hi-solid-calendar" class="w-3 h-3 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                            <p class="text-sm font-medium text-gray-900 dark:text-white">Draft Timing</p>
                            <p class="text-xs text-gray-600 dark:text-gray-400 mt-1">Schedule your draft 1-2 weeks before the league starts</p>
                        </div>
                    </div>

                    <div class="flex items-start gap-3">
                        <div class="w-6 h-6 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <v-icon name="hi-solid-lock-closed" class="w-3 h-3 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div>
                            <p class="text-sm font-medium text-gray-900 dark:text-white">Privacy Settings</p>
                            <p class="text-xs text-gray-600 dark:text-gray-400 mt-1">Private leagues with passwords are perfect for friends and colleagues</p>
                        </div>
                    </div>

                    <div class="flex items-start gap-3">
                        <div class="w-6 h-6 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <v-icon name="hi-solid-clock" class="w-3 h-3 text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                            <p class="text-sm font-medium text-gray-900 dark:text-white">Pick Timer</p>
                            <p class="text-xs text-gray-600 dark:text-gray-400 mt-1">2-3 minutes per pick keeps the draft moving at a good pace</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Quick Stats -->
            <div class="mt-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <div class="flex items-center gap-3">
                        <div class="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                            <v-icon name="hi-solid-chart-bar" class="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <h3 class="text-lg font-medium text-gray-900 dark:text-white">Form Progress</h3>
                    </div>
                </div>

                <div class="p-6">
                    <div class="space-y-3">
                        <div class="flex items-center justify-between">
                            <span class="text-sm text-gray-600 dark:text-gray-400">League Information</span>
                            <span class="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                                {{ formData.name && formData.league_uuid ? 'Complete' : 'Pending' }}
                            </span>
                        </div>
                        <div class="flex items-center justify-between">
                            <span class="text-sm text-gray-600 dark:text-gray-400">Privacy Settings</span>
                            <span class="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                                {{ !formData.is_private || formData.password ? 'Complete' : 'Pending' }}
                            </span>
                        </div>
                        <div class="flex items-center justify-between">
                            <span class="text-sm text-gray-600 dark:text-gray-400">Draft Settings</span>
                            <span class="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                                {{ formData.draft.draft_day ? 'Complete' : 'Pending' }}
                            </span>
                        </div>
                    </div>
                    
                    <div class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div class="flex items-center justify-between">
                            <span class="text-sm font-medium text-gray-900 dark:text-white">Overall Progress</span>
                            <span class="text-sm font-medium" :class="isFormValid ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-400'">
                                {{ isFormValid ? '100%' : '0%' }}
                            </span>
                        </div>
                        <div class="mt-2 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div 
                                class="bg-emerald-600 h-2 rounded-full transition-all duration-300"
                                :style="{ width: isFormValid ? '100%' : '0%' }"
                            ></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from '@/composables/useToast'
import { useValidationStore } from '@/store/validation/useValidationStore'
import { ButtonComponent, FormInput, SelectComponent, DateTimePicker } from '@/components/ui'
import { catalogService } from '@/services/catalog/CatalogService'
import { fantasyLeagueService } from '@/services/fantasy/leagues/FantasyLeagueService'
import type { FantasyLeagueCreatePayload } from '@/interfaces/fantasy/leagues/FantasyLeagueCreatePayload'
import type { FootballLeagueResponse } from '@/interfaces/football/league/FootballLeagueResponse'

// Composables
const router = useRouter()
const toast = useToast()
const validationStore = useValidationStore()

// State
const isLoading = ref(false)
const isLoadingLeagues = ref(false)
const footballLeagues = ref<FootballLeagueResponse[]>([])

// Form data
const formData = reactive<FantasyLeagueCreatePayload>({
    name: '',
    status_uuid: null,
    league_uuid: '',
    participants_count: 8,
    description: '',
    is_private: true,
    password: '',
    started_at: '',
    draft: {
        draft_day: '',
        pick_timer: 120,
        snake_order: true
    }
})

// Computed properties
const footballLeagueOptions = computed(() => {
    return footballLeagues.value.map(league => ({
        uuid: league.uuid,
        name: league.name,
        image_path: league.image_path
    }))
})

const minDateTime = computed(() => {
    const now = new Date()
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
    return now.toISOString().slice(0, 16)
})

const isFormValid = computed(() => {
    return formData.name.trim() &&
           formData.league_uuid &&
           formData.participants_count >= 2 &&
           formData.participants_count <= 20 &&
           formData.started_at &&
           formData.draft.draft_day &&
           formData.draft.pick_timer >= 30 &&
           (!formData.is_private || formData.password.trim())
})

// Validation helpers
const getFieldError = (fieldName: string) => {
    const errors = validationStore.getFieldError(fieldName)
    return Array.isArray(errors) ? errors.join(', ') : errors || ''
}

// Methods
const loadFootballLeagues = async () => {
    isLoadingLeagues.value = true
    try {
        footballLeagues.value = await catalogService.getFootballLeagues()
    } catch (error) {
        console.error('Error loading football leagues:', error)
        toast.error('Error', 'Failed to load football leagues. Please try again.')
    } finally {
        isLoadingLeagues.value = false
    }
}

const togglePrivacy = () => {
    formData.is_private = !formData.is_private
    if (!formData.is_private) {
        formData.password = ''
        validationStore.clearFieldError('password')
    }
}

const toggleSnakeOrder = () => {
    formData.draft.snake_order = !formData.draft.snake_order
}

const handleSubmit = async () => {
    validationStore.clearValidatorError()
    isLoading.value = true

    try {
        // Validate dates
        const startDate = new Date(formData.started_at)
        const draftDate = new Date(formData.draft.draft_day)
        const now = new Date()

        if (startDate <= now) {
            validationStore.setFieldError('started_at', 'Start date must be in the future')
            return
        }

        if (draftDate <= now) {
            validationStore.setFieldError('draft.draft_day', 'Draft date must be in the future')
            return
        }

        if (draftDate >= startDate) {
            validationStore.setFieldError('draft.draft_day', 'Draft must happen before the league starts')
            return
        }

        // Create the payload
        const payload: FantasyLeagueCreatePayload = {
            ...formData,
            description: formData.description || undefined,
            password: formData.is_private ? formData.password : '',
            started_at: new Date(formData.started_at).toISOString(),
            draft: {
                ...formData.draft,
                draft_day: new Date(formData.draft.draft_day).toISOString()
            }
        }

        const response = await fantasyLeagueService.storeFantasyLeague(payload)
        
        toast.success('Success!', `League "${response.name}" has been created successfully!`)
        
        // Redirect to the league details or user leagues page
        router.push({ name: 'userFantasyLeague' })
    
    } catch (error) {
        console.error('Error creating fantasy league:', error)
        // Los errores 422 ya son manejados por el interceptor en useApiFantasy
        // y almacenados en el validationStore, por lo que no necesitamos hacer nada más aquí
    } finally {
        isLoading.value = false
    }
}

const handleCancel = () => {
    router.push({ name: 'userFantasyLeague' })
}

// Lifecycle
onMounted(async () => {
    await loadFootballLeagues()
    
    // Set default dates (draft tomorrow, league starts in a week)
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(20, 0, 0, 0) // 8 PM tomorrow
    
    const nextWeek = new Date()
    nextWeek.setDate(nextWeek.getDate() + 7)
    nextWeek.setHours(12, 0, 0, 0) // Noon next week
    
    formData.draft.draft_day = tomorrow.toISOString().slice(0, 16)
    formData.started_at = nextWeek.toISOString().slice(0, 16)
})
</script>

<style scoped>
/* Custom styles for better UX */
.animate-page-enter {
    animation: fadeInUp 0.6s ease-out;
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
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
