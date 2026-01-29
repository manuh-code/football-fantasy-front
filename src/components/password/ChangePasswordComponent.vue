<template>
  <div class="animate-page-enter grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
    <!-- Main Form -->
    <div class="lg:col-span-2">
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <!-- Card Header -->
        <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
              <v-icon name="hi-solid-key" class="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Change Password</h2>
              <p class="text-sm text-gray-600 dark:text-gray-400">Update your account password</p>
            </div>
          </div>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleSubmit" class="p-6 space-y-5">
          <!-- Current Password -->
          <div>
            <FormInput
              id="old_password"
              v-model="formData.old_password"
              label="Current Password *"
              type="password"
              icon="bi-lock-fill"
              placeholder="Enter your current password"
              autocomplete="current-password"
              :error="hasFieldError('old_password') ? getFieldErrors('old_password').join(', ') : ''"
              required
            />
          </div>

          <!-- New Password -->
          <div>
            <FormInput
              id="new_password"
              v-model="formData.new_password"
              label="New Password *"
              type="password"
              icon="bi-key-fill"
              placeholder="Enter your new password"
              autocomplete="new-password"
              :error="hasFieldError('new_password') ? getFieldErrors('new_password').join(', ') : ''"
              required
            />
          </div>

          <!-- Confirm New Password -->
          <div>
            <FormInput
              id="new_password_confirmation"
              v-model="formData.new_password_confirmation"
              label="Confirm New Password *"
              type="password"
              icon="bi-shield-check"
              placeholder="Confirm your new password"
              autocomplete="new-password"
              :error="hasFieldError('new_password_confirmation') ? getFieldErrors('new_password_confirmation').join(', ') : ''"
              required
            />
          </div>

          <!-- Form Actions -->
          <div class="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            <ButtonComponent
              variant="cancel"
              size="md"
              text="Cancel"
              :full-width="true"
              @click="handleCancel"
            />
            <ButtonComponent
              type="submit"
              variant="primary"
              size="md"
              :text="isLoading ? 'Updating Password...' : 'Update Password'"
              :loading="isLoading"
              :disabled="isLoading"
              :full-width="true"
              icon="hi-solid-key"
            />
          </div>
        </form>
      </div>
    </div>

    <!-- Security Tips Sidebar -->
    <div class="lg:col-span-1">
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <!-- Tips Header -->
        <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <v-icon name="hi-solid-shield-check" class="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 class="text-lg font-medium text-gray-900 dark:text-white">Security Tips</h3>
          </div>
        </div>

        <!-- Tips Content -->
        <div class="p-6 space-y-4">
          <div class="flex items-start gap-3">
            <div class="w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <v-icon name="hi-solid-check" class="w-3 h-3 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p class="text-sm font-medium text-gray-900 dark:text-white">Use Strong Passwords</p>
              <p class="text-xs text-gray-600 dark:text-gray-400 mt-1">Include uppercase, lowercase, numbers, and symbols</p>
            </div>
          </div>

          <div class="flex items-start gap-3">
            <div class="w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <v-icon name="hi-solid-check" class="w-3 h-3 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p class="text-sm font-medium text-gray-900 dark:text-white">Minimum 8 Characters</p>
              <p class="text-xs text-gray-600 dark:text-gray-400 mt-1">Longer passwords are more secure</p>
            </div>
          </div>

          <div class="flex items-start gap-3">
            <div class="w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <v-icon name="hi-solid-check" class="w-3 h-3 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p class="text-sm font-medium text-gray-900 dark:text-white">Avoid Common Words</p>
              <p class="text-xs text-gray-600 dark:text-gray-400 mt-1">Don't use dictionary words or personal info</p>
            </div>
          </div>

          <div class="flex items-start gap-3">
            <div class="w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <v-icon name="hi-solid-check" class="w-3 h-3 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p class="text-sm font-medium text-gray-900 dark:text-white">Unique Password</p>
              <p class="text-xs text-gray-600 dark:text-gray-400 mt-1">Don't reuse passwords from other accounts</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/user/useUserStore'
import { useValidationStore } from '@/store/validation/useValidationStore'
import { useToast } from '@/composables/useToast'
import { ButtonComponent, FormInput } from '@/components/ui'
import { ChangePasswordPayload } from '@/interfaces/user/password/ChangePasswordPayload'



// Stores and composables
const router = useRouter()
const userStore = useUserStore()
const validationStore = useValidationStore()
const toast = useToast()

// Form data
const formData = ref<ChangePasswordPayload>({
  old_password: '',
  new_password: '',
  new_password_confirmation: ''
})

// UI state
const isLoading = ref(false)

// Computed properties for validation
const hasFieldError = computed(() => (field: string) => {
  return validationStore.hasFieldError(field)
})

const getFieldErrors = computed(() => (field: string) => {
  return validationStore.getFieldError(field)
})

onMounted(() => {
    // Clear any previous validation errors    
    validationStore.clearValidatorError()
})


// Methods
const handleSubmit = async () => {
  try {
    isLoading.value = true
    
    // Clear previous validation errors
    validationStore.clearValidatorError()
    
    // Attempt to change password
    await userStore.changePassword(formData.value)
    
    // Success
    toast.success('Password Changed', 'Your password has been updated successfully!')
    
    // Reset form
    formData.value = {
      old_password: '',
      new_password: '',
      new_password_confirmation: ''
    }
    
    // Navigate back to profile or dashboard
    router.push({ name: 'profile' })
    
  } finally {
    isLoading.value = false
  }
}

const handleCancel = () => {
  // Clear form and navigate back
  formData.value = {
    old_password: '',
    new_password: '',
    new_password_confirmation: ''
  }
  validationStore.clearValidatorError()
  router.back()
}
</script>

<style scoped>
/* Additional custom styles if needed */
</style>
