<template>
    <div
        class="create-card relative w-full max-w-xl mx-auto bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700/60 p-6 sm:p-8"
    >
        <!-- Brand header -->
        <div class="flex flex-col items-center text-center mb-7">
            <div
                class="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-lg shadow-emerald-500/30 mb-4"
            >
                <v-icon name="bi-trophy-fill" class="w-7 h-7 text-white" />
            </div>
            <h1 class="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                Create Fantasy League
            </h1>
            <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Set up your private league in seconds
            </p>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleSubmit" class="space-y-4" novalidate>
            <!-- League Name -->
            <FormInput
                v-model="formData.name"
                label="League Name *"
                icon="bi-trophy-fill"
                placeholder="Enter your league name"
                :error="getFieldError('name')"
                :disabled="isLoading"
            />

            <!-- Password -->
            <div>
                <FormInput
                    v-model="formData.password"
                    type="password"
                    label="League Password *"
                    icon="bi-lock-fill"
                    placeholder="Enter a password"
                    :error="getFieldError('password')"
                    :disabled="isLoading"
                />
                <p class="mt-1.5 text-xs text-gray-400 dark:text-gray-500">
                    Required for others to join your league
                </p>
            </div>

            <!-- Participants -->
            <div>
                <!-- Fixed value: only one option available -->
                <div v-if="isFixedParticipants">
                    <p class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Number of Participants *
                    </p>
                    <div class="flex items-center gap-2 px-3.5 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl">
                        <v-icon name="hi-solid-user-group" class="w-4 h-4 text-emerald-500 shrink-0" />
                        <span class="text-sm font-semibold text-gray-900 dark:text-white">{{ formData.participants_count }}</span>
                        <span class="text-xs text-gray-500 dark:text-gray-400">participants</span>
                        <span class="ml-auto text-2xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full">
                            Fixed
                        </span>
                    </div>
                    <p class="mt-1.5 text-xs text-gray-400 dark:text-gray-500">
                        This league requires exactly {{ formData.participants_count }} participants
                    </p>
                </div>

                <!-- Drawer-style select: multiple options available -->
                <SearchableSelectComponent
                    v-else
                    v-model="formData.participants_count"
                    :options="participantOptions"
                    value-key="value"
                    label-key="label"
                    label="Number of Participants *"
                    placeholder="Select number of participants"
                    :error="getFieldError('participants_count')"
                    :disabled="isLoading || isLoadingOptions"
                    :loading="isLoadingOptions"
                    :required="true"
                    :clearable="false"
                    :searchable="false"
                    accent-color="emerald"
                    no-options-text="No options available"
                />
            </div>

            <!-- Actions -->
            <div class="flex flex-col sm:flex-row gap-3 pt-3">
                <ButtonComponent
                    type="submit"
                    :loading="isLoading"
                    :disabled="!isFormValid"
                    :always-full-width="true"
                    class="sm:flex-1"
                >
                    <v-icon name="hi-solid-plus" class="w-4 h-4 mr-1.5" />
                    Create League
                </ButtonComponent>
                <ButtonComponent
                    @click="handleCancel"
                    variant="outline"
                    :disabled="isLoading"
                    :always-full-width="true"
                    class="sm:flex-1"
                >
                    Cancel
                </ButtonComponent>
            </div>
        </form>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from '@/composables/useToast'
import { useValidationStore } from '@/store/validation/useValidationStore'
import { useFootballLeagueStore } from '@/store/football/league/useFootballLeagueStore'
import { ButtonComponent, FormInput, SearchableSelectComponent } from '@/components/ui'
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
const isFixedParticipants = ref(false)
const isLoadingOptions = ref(false)

// Simplified form data - only required fields. participants_count is kept as
// `number | null` (not optional) so it binds cleanly to the drawer select.
const formData = reactive<{
    name: string
    league_uuid: string
    password: string
    participants_count: number | null
}>({
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

        const labelMap: Record<string, string> = {
            min: 'Minimum',
            mid: 'Recommended',
            max: 'Maximum'
        }

        // Deduplicate values while preserving descriptive labels
        const seen = new Map<number, string>()
        for (const key of ['min', 'mid', 'max'] as const) {
            const value = data[key] as number
            if (!seen.has(value)) {
                seen.set(value, labelMap[key])
            }
        }

        if (seen.size === 1) {
            // Only one unique value: auto-assign and show fixed text
            const [uniqueValue] = seen.keys()
            formData.participants_count = uniqueValue
            isFixedParticipants.value = true
            participantOptions.value = []
        } else {
            // Multiple unique values: build select with descriptive labels
            isFixedParticipants.value = false
            participantOptions.value = Array.from(seen.entries()).map(([value, tag]) => ({
                value,
                label: `${tag} (${value} participants)`
            }))
        }
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
/* Subtle entrance: fade + lift (matches the login / register cards) */
.create-card {
    animation: create-enter 0.4s cubic-bezier(0.32, 0.72, 0, 1) both;
}

@keyframes create-enter {
    from {
        opacity: 0;
        transform: translateY(12px) scale(0.98);
    }
    to {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}

@media (prefers-reduced-motion: reduce) {
    .create-card {
        animation: none;
    }
}
</style>
