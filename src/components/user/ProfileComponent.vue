<template>
    <div class="animate-page-enter w-full max-w-4xl mx-auto">
        <div v-if="userData"
            class="bg-white dark:bg-gray-800 shadow-xl rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
            <!-- Header Section -->
            <div
                class="bg-gradient-to-r from-emerald-600 to-emerald-700 dark:from-emerald-700 dark:to-emerald-800 px-6 md:px-8 py-8 md:py-12 text-white">
                <div class="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
                    <!-- Avatar -->
                    <AvatarUpload 
                        :current-avatar="userData.avatar" 
                        :alt-text="`${userData.firstname} ${userData.lastname}`"
                    />

                    <!-- User Name -->
                    <div class="text-center sm:text-left flex-1">
                        <h1 class="text-2xl md:text-3xl font-bold">
                            {{ userData.firstname }} {{ userData.lastname }}
                        </h1>
                        <p class="text-emerald-100 text-base md:text-lg mt-1">Football Fantasy Player</p>
                    </div>

                    <!-- Edit Toggle Button -->
                    <div class="flex flex-col space-y-2">
                        <button @click="toggleEditMode"
                            class="inline-flex items-center px-4 py-2 bg-white/20 hover:bg-white/30 text-white font-medium rounded-lg transition-all duration-200 backdrop-blur-sm">
                            <v-icon :name="isEditing ? 'md-cancel' : 'io-pencil-sharp'" class="w-4 h-4 mr-2" />
                            {{ isEditing ? 'Cancel' : 'Edit Profile' }}
                        </button>
                    </div>
                </div>
            </div>

            <!-- Profile Information -->
            <div class="p-6 md:p-8">
                <h2
                    class="text-xl md:text-2xl font-semibold text-gray-900 dark:text-white mb-6 border-b border-gray-200 dark:border-gray-700 pb-2">
                    Profile Information
                </h2>

                <form @submit.prevent="handleUpdateProfile" class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <!-- First Name -->
                    <div class="space-y-1">
                        <label for="firstName" class="block text-sm font-medium text-gray-600 dark:text-gray-400">First
                            Name</label>
                        <input v-if="isEditing" id="firstName" v-model="editForm.firstName" type="text"
                            class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                            :class="{ 'border-red-500 focus:ring-red-500 focus:border-red-500': hasFieldError('firstName') }"
                            placeholder="Enter your first name" />
                        <div v-else
                            class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                            <p class="text-lg text-gray-900 dark:text-white font-medium">{{ userData.firstname }}</p>
                        </div>
                        <!-- Error messages -->
                        <div v-if="hasFieldError('firstName')" class="text-red-600 dark:text-red-400 text-sm">
                            <p v-for="error in getFieldError('firstName')" :key="error" class="mt-1">{{ error }}</p>
                        </div>
                    </div>

                    <!-- Last Name -->
                    <div class="space-y-1">
                        <label for="lastName" class="block text-sm font-medium text-gray-600 dark:text-gray-400">Last
                            Name</label>
                        <input v-if="isEditing" id="lastName" v-model="editForm.lastName" type="text"
                            class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                            :class="{ 'border-red-500 focus:ring-red-500 focus:border-red-500': hasFieldError('lastName') }"
                            placeholder="Enter your last name" />
                        <div v-else
                            class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                            <p class="text-lg text-gray-900 dark:text-white font-medium">{{ userData.lastname }}</p>
                        </div>
                        <!-- Error messages -->
                        <div v-if="hasFieldError('lastName')" class="text-red-600 dark:text-red-400 text-sm">
                            <p v-for="error in getFieldError('lastName')" :key="error" class="mt-1">{{ error }}</p>
                        </div>
                    </div>

                    <!-- Email -->
                    <div class="space-y-1">
                        <label for="email" class="block text-sm font-medium text-gray-600 dark:text-gray-400">Email
                            Address</label>
                        <input v-if="isEditing" id="email" v-model="editForm.email" type="email"
                            class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                            :class="{ 'border-red-500 focus:ring-red-500 focus:border-red-500': hasFieldError('email') }"
                            placeholder="Enter your email" />
                        <div v-else
                            class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                            <p class="text-lg text-gray-900 dark:text-white font-medium break-all">{{ userData.email }}
                            </p>
                        </div>
                        <!-- Error messages -->
                        <div v-if="hasFieldError('email')" class="text-red-600 dark:text-red-400 text-sm">
                            <p v-for="error in getFieldError('email')" :key="error" class="mt-1">{{ error }}</p>
                        </div>
                    </div>

                    <!-- Phone -->
                    <div class="space-y-1">
                        <label for="phone" class="block text-sm font-medium text-gray-600 dark:text-gray-400">Phone
                            Number</label>
                        <input v-if="isEditing" id="phone" v-model="editForm.phone" type="tel"
                            class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                            :class="{ 'border-red-500 focus:ring-red-500 focus:border-red-500': hasFieldError('phone') }"
                            placeholder="Enter your phone number" />
                        <div v-else
                            class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                            <p class="text-lg text-gray-900 dark:text-white font-medium">{{ userData.phone || 'Not provided' }}</p>
                        </div>
                        <!-- Error messages -->
                        <div v-if="hasFieldError('phone')" class="text-red-600 dark:text-red-400 text-sm">
                            <p v-for="error in getFieldError('phone')" :key="error" class="mt-1">{{ error }}</p>
                        </div>
                    </div>


                    <!-- Save Button (only visible when editing) -->
                    <div v-if="isEditing" class="md:col-span-2 flex justify-end space-x-3 pt-4">
                        <button type="button" @click="resetForm"
                            class="px-6 py-2 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-700 dark:text-white font-medium rounded-lg transition-colors duration-200">
                            Reset
                        </button>
                        <button type="submit" :disabled="isLoading"
                            class="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white font-medium rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
                            {{ isLoading ? 'Updating...' : 'Update Profile' }}
                        </button>
                    </div>
                </form>
            </div>
        </div>

        <!-- No User Data State -->
        <div v-else
            class="bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-8 md:p-12 text-center border border-gray-200 dark:border-gray-700">
            <div
                class="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-4 flex items-center justify-center">
                <svg class="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
            </div>
            <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-2">No Profile Data Available</h2>
            <p class="text-gray-600 dark:text-gray-400 mb-6">
                Please log in to view your profile information or try refreshing the page.
            </p>
            <router-link to="/login"
                class="inline-flex items-center px-6 py-3 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white font-medium rounded-lg transition-colors duration-200">
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
import { AvatarUpload } from '@/components/ui'
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
            console.warn('Failed to fetch user data:', error)
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
