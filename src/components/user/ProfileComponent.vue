<template>
    <div class="animate-page-enter grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <!-- Main Profile Form -->
        <div class="lg:col-span-2">
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <!-- Card Header -->
                <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                            <v-icon name="hi-solid-user" class="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                            <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Profile Information</h2>
                            <p class="text-sm text-gray-600 dark:text-gray-400">Update your personal information and avatar</p>
                        </div>
                    </div>
                </div>

                <!-- Avatar Section -->
                <div v-if="userData" class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <div class="flex items-center gap-4">
                        <AvatarUpload 
                            :current-avatar="userData.avatar" 
                            :alt-text="`${userData.firstname} ${userData.lastname}`"
                            class="flex-shrink-0"
                        />
                        <div>
                            <h3 class="text-lg font-medium text-gray-900 dark:text-white">
                                {{ userData.firstname }} {{ userData.lastname }}
                            </h3>
                            <p class="text-sm text-gray-600 dark:text-gray-400">Football Fantasy Player</p>
                        </div>
                    </div>
                </div>

                <!-- Form -->
                <form @submit.prevent="handleUpdateProfile" class="p-6 space-y-5">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <!-- First Name -->
                        <div>
                            <FormInput 
                                v-if="isEditing"
                                id="firstName" 
                                v-model="editForm.firstName" 
                                label="First Name *"
                                type="text"
                                icon="hi-solid-identification"
                                placeholder="Enter your first name"
                                :error="hasFieldError('firstName') ? getFieldError('firstName').join(', ') : ''"
                                required
                            />
                            <div v-else>
                                <label for="firstName-display" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">First Name</label>
                                <div id="firstName-display" class="px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white">
                                    {{ userData?.firstname || '-' }}
                                </div>
                            </div>
                        </div>

                        <!-- Last Name -->
                        <div>
                            <FormInput 
                                v-if="isEditing"
                                id="lastName" 
                                v-model="editForm.lastName" 
                                label="Last Name *"
                                type="text"
                                icon="hi-solid-identification"
                                placeholder="Enter your last name"
                                :error="hasFieldError('lastName') ? getFieldError('lastName').join(', ') : ''"
                                required
                            />
                            <div v-else>
                                <label for="lastName-display" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Last Name</label>
                                <div id="lastName-display" class="px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white">
                                    {{ userData?.lastname || '-' }}
                                </div>
                            </div>
                        </div>

                        <!-- Email -->
                        <div>
                            <FormInput 
                                v-if="isEditing"
                                id="email" 
                                v-model="editForm.email" 
                                label="Email Address *"
                                type="email"
                                icon="hi-solid-mail"
                                placeholder="Enter your email"
                                autocomplete="email"
                                :error="hasFieldError('email') ? getFieldError('email').join(', ') : ''"
                                required
                            />
                            <div v-else>
                                <label for="email-display" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
                                <div id="email-display" class="px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white break-all">
                                    {{ userData?.email || '-' }}
                                </div>
                            </div>
                        </div>

                        <!-- Phone -->
                        <div>
                            <FormInput 
                                v-if="isEditing"
                                id="phone" 
                                v-model="editForm.phone" 
                                label="Phone Number"
                                type="tel"
                                icon="hi-solid-phone"
                                placeholder="Enter your phone number"
                                :error="hasFieldError('phone') ? getFieldError('phone').join(', ') : ''"
                            />
                            <div v-else>
                                <label for="phone-display" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone Number</label>
                                <div id="phone-display" class="px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white">
                                    {{ userData?.phone || 'Not provided' }}
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Form Actions -->
                    <div class="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <ButtonComponent
                            v-if="isEditing"
                            variant="cancel"
                            size="md"
                            text="Cancel"
                            :full-width="true"
                            @click="resetForm"
                        />
                        <ButtonComponent
                            v-if="isEditing"
                            type="submit"
                            variant="primary"
                            size="md"
                            :text="isLoading ? 'Updating Profile...' : 'Update Profile'"
                            :loading="isLoading"
                            :disabled="isLoading"
                            :full-width="true"
                            icon="hi-solid-check"
                        />
                        <ButtonComponent
                            v-else
                            variant="primary"
                            size="md"
                            text="Edit Profile"
                            :full-width="true"
                            icon="hi-solid-pencil"
                            @click="toggleEditMode"
                        />
                    </div>
                </form>
            </div>
        </div>

        <!-- Profile Stats Sidebar -->
        <div class="lg:col-span-1">
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <!-- Stats Header -->
                <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <div class="flex items-center gap-3">
                        <div class="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                            <v-icon name="hi-solid-chart-bar" class="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h3 class="text-lg font-medium text-gray-900 dark:text-white">Quick Stats</h3>
                    </div>
                </div>

                <!-- Stats Content -->
                <div class="p-6 space-y-4">
                    <div class="flex items-start gap-3">
                        <div class="w-6 h-6 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <v-icon name="bi-trophy-fill" class="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                            <p class="text-sm font-medium text-gray-900 dark:text-white">Fantasy Leagues</p>
                            <p class="text-xs text-gray-600 dark:text-gray-400 mt-1">Manage your league participation</p>
                        </div>
                    </div>

                    <div class="flex items-start gap-3">
                        <div class="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <v-icon name="hi-solid-user-group" class="w-3 h-3 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <p class="text-sm font-medium text-gray-900 dark:text-white">Team Preferences</p>
                            <p class="text-xs text-gray-600 dark:text-gray-400 mt-1">Set your favorite football team</p>
                        </div>
                    </div>

                    <div class="flex items-start gap-3">
                        <div class="w-6 h-6 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <v-icon name="hi-solid-cog" class="w-3 h-3 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                            <p class="text-sm font-medium text-gray-900 dark:text-white">Account Settings</p>
                            <p class="text-xs text-gray-600 dark:text-gray-400 mt-1">Update password and preferences</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- No User Data State -->
    <div v-if="!userData" class="animate-page-enter">
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
            <div class="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-4 flex items-center justify-center">
                <v-icon name="hi-solid-user" class="w-8 h-8 text-gray-400 dark:text-gray-500" />
            </div>
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Profile Data Available</h2>
            <p class="text-gray-600 dark:text-gray-400 mb-6">
                Please log in to view your profile information or try refreshing the page.
            </p>
            <router-link to="/login" class="inline-flex items-center px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors duration-200">
                Go to Login
            </router-link>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, reactive } from 'vue'
import { useUserStore } from '@/store/user/useUserStore'
import { useValidationStore } from '@/store/validation/useValidationStore'
import { useToast } from '@/composables/useToast'
import { AvatarUpload, ButtonComponent, FormInput } from '@/components/ui'
import type { UserDataInterface } from '@/interfaces/user/userInterface'
import type { UserPayload } from '@/interfaces/user/userPayload'

// Stores
const userStore = useUserStore()
const validationStore = useValidationStore()
const toast = useToast()

// State
const isEditing = ref(false)
const isLoading = ref(false)

// Form data
const editForm = reactive<UserPayload>({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
})

// Computed properties
const userData = computed<UserDataInterface | null>(() => userStore.getUserData)

// Validation helpers
const hasFieldError = (fieldName: string) => validationStore.hasFieldError(fieldName)
const getFieldError = (fieldName: string) => validationStore.getFieldError(fieldName)

// Methods
const toggleEditMode = () => {
    if (!isEditing.value) {
        // Entering edit mode - populate form
        if (userData.value) {
            editForm.firstName = userData.value.firstname
            editForm.lastName = userData.value.lastname
            editForm.email = userData.value.email
            editForm.phone = userData.value.phone || ''
        }
    }
    validationStore.clearValidatorError();
    isEditing.value = !isEditing.value
}

const resetForm = () => {
    if (userData.value) {
        editForm.firstName = userData.value.firstname
        editForm.lastName = userData.value.lastname
        editForm.email = userData.value.email
        editForm.phone = userData.value.phone || ''
    }
    validationStore.clearValidatorError()
}

const handleUpdateProfile = async () => {
    isLoading.value = true
    validationStore.clearValidatorError()

    try {
        await userStore.updateProfile(editForm)
        toast.success('Profile Updated', 'Your profile has been updated successfully!')
        isEditing.value = false
    } finally {
        isLoading.value = false
    }
}

// Lifecycle
onMounted(async () => {
    // Try to fetch user data from API if not available in store
    if (!userData.value) {
        try {
            await userStore.setUserDataFromApi()
        } catch (error) {
            // Failed to fetch user data
        }
    }
})
</script>

<style scoped>
/* Additional custom styles if needed */
.break-all {
    word-break: break-all;
}
</style>
