<template>
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        <!-- Main Form -->
        <div class="lg:col-span-2">
            <form @submit.prevent="handleSubmit" class="space-y-4">
                <!-- League Information Section -->
                <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60">
                    <!-- Section Header -->
                    <div class="px-4 py-3">
                        <div class="flex items-center gap-2">
                            <v-icon name="bi-trophy-fill" class="w-[18px] h-[18px] text-emerald-500 dark:text-emerald-400 shrink-0" />
                            <h2 class="text-[15px] font-semibold text-gray-900 dark:text-white">Create Fantasy League</h2>
                            <span class="text-[11px] text-gray-400 dark:text-gray-500">Quick setup</span>
                        </div>
                    </div>

                    <!-- Form Fields -->
                    <div class="px-4 pb-4 space-y-4">
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

                        <!-- Password Field -->
                        <div>
                            <FormInput
                                v-model="formData.password"
                                type="password"
                                label="League Password *"
                                placeholder="Enter a secure password"
                                :error="getFieldError('password')"
                                :disabled="isLoading"
                            />
                            <p class="mt-1 text-[11px] text-gray-400 dark:text-gray-500">
                                Required for others to join your league
                            </p>
                        </div>

                        <!-- Participants Count -->
                        <div>
                            <SelectComponent
                                v-model="formData.participants_count"
                                :options="participantOptions"
                                value-key="value"
                                label-key="label"
                                label="Number of Participants *"
                                placeholder="Select number of participants"
                                :error="getFieldError('participants_count')"
                                :disabled="isLoading || isLoadingOptions"
                                :required="true"
                            />
                        </div>

                        <!-- Form Actions -->
                        <div class="flex flex-col sm:flex-row gap-3 pt-3 border-t border-gray-100 dark:border-gray-700/60">
                            <ButtonComponent
                                type="submit"
                                :loading="isLoading"
                                :disabled="!isFormValid"
                                class="flex-1 sm:flex-none"
                            >
                                <v-icon name="hi-solid-plus" class="w-4 h-4 mr-1.5" />
                                Create League
                            </ButtonComponent>
                            <ButtonComponent
                                @click="handleCancel"
                                variant="outline"
                                :disabled="isLoading"
                                class="flex-1 sm:flex-none"
                            >
                                Cancel
                            </ButtonComponent>
                        </div>
                    </div>
                </div>
            </form>
        </div>

        <!-- Sidebar -->
        <div class="lg:col-span-1 space-y-4">
            <!-- Quick Setup Info -->
            <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60">
                <div class="px-4 py-3">
                    <div class="flex items-center gap-2 mb-3">
                        <v-icon name="hi-solid-information-circle" class="w-[16px] h-[16px] text-blue-400 shrink-0" />
                        <h3 class="text-[13px] font-semibold text-gray-900 dark:text-white">Quick Setup</h3>
                    </div>
                    <div class="space-y-3">
                        <div class="flex items-start gap-2.5">
                            <span class="w-5 h-5 rounded-full bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center shrink-0 mt-0.5">
                                <v-icon name="hi-solid-check" class="w-2.5 h-2.5 text-emerald-500" />
                            </span>
                            <div>
                                <p class="text-[12px] font-medium text-gray-900 dark:text-white">Simplified Creation</p>
                                <p class="text-[11px] text-gray-400 dark:text-gray-500">Only 3 fields to start quickly</p>
                            </div>
                        </div>
                        <div class="flex items-start gap-2.5">
                            <span class="w-5 h-5 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center shrink-0 mt-0.5">
                                <v-icon name="hi-solid-lock-closed" class="w-2.5 h-2.5 text-blue-500" />
                            </span>
                            <div>
                                <p class="text-[12px] font-medium text-gray-900 dark:text-white">Private by Default</p>
                                <p class="text-[11px] text-gray-400 dark:text-gray-500">Password required to join</p>
                            </div>
                        </div>
                        <div class="flex items-start gap-2.5">
                            <span class="w-5 h-5 rounded-full bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center shrink-0 mt-0.5">
                                <v-icon name="hi-solid-cog" class="w-2.5 h-2.5 text-purple-500" />
                            </span>
                            <div>
                                <p class="text-[12px] font-medium text-gray-900 dark:text-white">Auto Configuration</p>
                                <p class="text-[11px] text-gray-400 dark:text-gray-500">Standard settings applied automatically</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Form Progress -->
            <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60">
                <div class="px-4 py-3">
                    <div class="flex items-center gap-2 mb-3">
                        <v-icon name="hi-solid-chart-bar" class="w-[16px] h-[16px] text-emerald-500 shrink-0" />
                        <h3 class="text-[13px] font-semibold text-gray-900 dark:text-white">Progress</h3>
                        <span class="ml-auto text-[11px] font-semibold tabular-nums" :class="isFormValid ? 'text-emerald-500' : 'text-gray-400'">
                            {{ Math.round((completedFields / 3) * 100) }}%
                        </span>
                    </div>
                    <!-- Progress bar -->
                    <div class="bg-gray-100 dark:bg-gray-700 rounded-full h-1.5 mb-3">
                        <div 
                            class="bg-emerald-500 h-1.5 rounded-full transition-all duration-300"
                            :style="{ width: `${Math.round((completedFields / 3) * 100)}%` }"
                        ></div>
                    </div>
                    <div class="space-y-2">
                        <div class="flex items-center justify-between">
                            <span class="text-[12px] text-gray-500 dark:text-gray-400">League Name</span>
                            <v-icon v-if="formData.name.trim()" name="hi-solid-check-circle" class="w-3.5 h-3.5 text-emerald-500" />
                            <span v-else class="w-3.5 h-3.5 rounded-full border-2 border-gray-200 dark:border-gray-600 inline-block"></span>
                        </div>
                        <div class="flex items-center justify-between">
                            <span class="text-[12px] text-gray-500 dark:text-gray-400">Password</span>
                            <v-icon v-if="formData.password.trim()" name="hi-solid-check-circle" class="w-3.5 h-3.5 text-emerald-500" />
                            <span v-else class="w-3.5 h-3.5 rounded-full border-2 border-gray-200 dark:border-gray-600 inline-block"></span>
                        </div>
                        <div class="flex items-center justify-between">
                            <span class="text-[12px] text-gray-500 dark:text-gray-400">Participants</span>
                            <v-icon v-if="formData.participants_count !== null" name="hi-solid-check-circle" class="w-3.5 h-3.5 text-emerald-500" />
                            <span v-else class="w-3.5 h-3.5 rounded-full border-2 border-gray-200 dark:border-gray-600 inline-block"></span>
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
import { useFootballLeagueStore } from '@/store/football/league/useFootballLeagueStore'
import { ButtonComponent, FormInput, SelectComponent } from '@/components/ui'
import { fantasyLeagueService } from '@/services/fantasy/leagues/FantasyLeagueService'
import type { FantasyLeagueCreatePayload } from '@/interfaces/fantasy/leagues/FantasyLeagueCreatePayload'

// Composables
const router = useRouter()
const toast = useToast()
const validationStore = useValidationStore()
const footballLeagueStore = useFootballLeagueStore()

// State
const isLoading = ref(false)
const participantOptions = ref<{ value: number; label: string }[]>([])
const isLoadingOptions = ref(false)

// Simplified form data - only required fields
const formData = reactive<FantasyLeagueCreatePayload>({
    name: '',
    league_uuid: '',
    password: '',
    participants_count: null
})

const isFormValid = computed(() => {
    return formData.name.trim() &&
           formData.password.trim() &&
           formData.participants_count !== null
})

const completedFields = computed(() => {
    let count = 0
    if (formData.name.trim()) count++
    if (formData.password.trim()) count++
    if (formData.participants_count !== null) count++
    return count
})

// Validation helpers
const getFieldError = (fieldName: string) => {
    const errors = validationStore.getFieldError(fieldName)
    return Array.isArray(errors) ? errors.join(', ') : errors || ''
}

const handleSubmit = async () => {
    validationStore.clearValidatorError()
    isLoading.value = true

    try {
        // Create the payload with only the required fields
        const payload: FantasyLeagueCreatePayload = {
            name: formData.name.trim(),
            league_uuid: formData.league_uuid,
            password: formData.password.trim(),
            participants_count: formData.participants_count
        }

        const response = await fantasyLeagueService.storeFantasyLeague(payload)
        
        toast.success('Success!', `League "${response.name}" has been created successfully!`)
        
        // Redirect to the league details or user leagues page
        router.push({ name: 'userFantasyLeague' })
    
    } catch (error) {
        console.error('Error creating fantasy league:', error)
        // 422 errors are already handled by the interceptor in useApiFantasy
        // and stored in the validationStore, so we don't need to do anything else here
    } finally {
        isLoading.value = false
    }
}

const handleCancel = () => {
    router.push({ name: 'userFantasyLeague' })
}

// Fetch participant options from the API
const fetchParticipantOptions = async (leagueUuid: string) => {
    isLoadingOptions.value = true
    try {
        const response = await fantasyLeagueService.getParticipantOptions(leagueUuid)
        const data = response.data
        participantOptions.value = [
            { value: data.min, label: `${data.min} participants` },
            { value: data.mid, label: `${data.mid} participants` },
            { value: data.max, label: `${data.max} participants` }
        ]
    } catch (error) {
        console.error('Error fetching participant options:', error)
    } finally {
        isLoadingOptions.value = false
    }
}

// Lifecycle
onMounted(async () => {
    // Set the league_uuid from the store
    const leagueUuid = footballLeagueStore.getFootballLeagueUuid()
    if (leagueUuid) {
        formData.league_uuid = leagueUuid
        await fetchParticipantOptions(leagueUuid)
    }
})
</script>

<style scoped>
.tabular-nums {
    font-variant-numeric: tabular-nums;
}
</style>