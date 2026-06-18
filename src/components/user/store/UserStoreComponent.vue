<template>
  <div class="register-page">
    <!-- Decorative emerald glow backdrop -->
    <div class="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div class="absolute -top-24 -right-20 w-72 h-72 rounded-full bg-emerald-400/20 blur-3xl" />
      <div class="absolute -bottom-28 -left-20 w-72 h-72 rounded-full bg-emerald-500/10 blur-3xl" />
    </div>

    <div
      class="register-card relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 p-6 sm:p-8"
    >
      <!-- Brand -->
      <div class="flex flex-col items-center text-center mb-7">
        <div
          class="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-lg shadow-emerald-500/30 mb-4"
        >
          <v-icon name="md-sportssoccer" class="w-7 h-7 text-white" />
        </div>
        <h1 class="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white">
          Create account
        </h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Join Football Fantasy and start playing
        </p>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleRegister" class="space-y-4" novalidate>
        <!-- Name fields -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormInput
            v-model="payload.firstName"
            label="First Name"
            type="text"
            icon="bi-person-fill"
            placeholder="Your first name"
            autocomplete="given-name"
            :error="errors.firstName"
            :disabled="isLoading"
          />
          <FormInput
            v-model="payload.lastName"
            label="Last Name"
            type="text"
            icon="bi-person-fill"
            placeholder="Your last name"
            autocomplete="family-name"
            :error="errors.lastName"
            :disabled="isLoading"
          />
        </div>

        <!-- Email -->
        <FormInput
          v-model="payload.email"
          label="Email"
          type="email"
          icon="bi-envelope-fill"
          placeholder="your@email.com"
          autocomplete="email"
          :error="errors.email"
          :disabled="isLoading"
        />

        <!-- Password + strength meter -->
        <div>
          <FormInput
            v-model="payload.password"
            label="Password"
            type="password"
            icon="bi-lock-fill"
            placeholder="••••••••"
            autocomplete="new-password"
            :error="errors.password"
            :disabled="isLoading"
          />
          <div
            v-if="payload.password && !errors.password"
            class="flex items-center gap-3 mt-2"
          >
            <div class="flex-1 h-1 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
              <div
                class="h-full rounded-full transition-all duration-300"
                :class="strengthBarClass"
                :style="{ width: passwordStrengthWidth }"
              />
            </div>
            <span
              class="text-[11px] font-semibold w-12 text-right"
              :class="strengthTextClass"
            >
              {{ passwordStrengthText }}
            </span>
          </div>
        </div>

        <!-- Confirm password -->
        <FormInput
          v-model="payload.password_confirmation"
          label="Confirm Password"
          type="password"
          icon="bi-lock-fill"
          placeholder="••••••••"
          autocomplete="new-password"
          :error="errors.password_confirmation"
          :disabled="isLoading"
        />

        <!-- Terms -->
        <div>
          <label class="flex items-start gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              v-model="acceptTerms"
              class="w-4 h-4 mt-0.5 rounded accent-emerald-600 shrink-0"
            />
            <span class="text-[13px] leading-snug text-gray-600 dark:text-gray-300">
              I accept the
              <a href="#" class="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline">terms and conditions</a>
              and the
              <a href="#" class="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline">privacy policy</a>
            </span>
          </label>
          <p v-if="errors.terms" class="mt-1.5 text-[12px] text-red-500 dark:text-red-400">
            {{ errors.terms }}
          </p>
        </div>

        <!-- Submit -->
        <ButtonComponent
          type="submit"
          variant="primary"
          size="md"
          :disabled="!isFormValid"
          :loading="isLoading"
          :always-full-width="true"
          :text="isLoading ? 'Creating account...' : 'Create Account'"
        />
      </form>

      <!-- Footer -->
      <p class="mt-7 text-center text-sm text-gray-500 dark:text-gray-400">
        Already have an account?
        <router-link
          to="/login"
          class="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
        >
          Sign in
        </router-link>
      </p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, Ref } from 'vue';
import { useRouter } from 'vue-router';
import { FormInput, ButtonComponent } from '@/components/ui';
import { UserStorePayload } from '@/interfaces/user/store/userStorePayload';
import { getUserService } from '@/services/user/UserService';
import { useToast } from '@/composables/useToast';
import { AxiosError } from 'axios';

interface FormErrors {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    password_confirmation: string;
    terms: string;
}

interface ValidationErrors {
    [key: string]: string[];
}

// Router
const router = useRouter();

// Toast
const toast = useToast();

// Loading state
const isLoading: Ref<boolean> = ref(false);

// Terms acceptance
const acceptTerms: Ref<boolean> = ref(false);

// Form payload
const payload = ref<UserStorePayload>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    password_confirmation: ''
});

// Form errors
const errors = ref<FormErrors>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    password_confirmation: '',
    terms: ''
});

// Email validation
const validateEmail = (email: string): boolean => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
};

// Minimal password validation — only enforce a short minimum length so it stays
// friendly for all users. The strength meter below is just an optional hint.
const validatePassword = (password: string): { valid: boolean; message: string } => {
    if (password.length < 6) {
        return { valid: false, message: 'Password must be at least 6 characters' };
    }
    return { valid: true, message: '' };
};

// Calculate password strength
const passwordStrength = computed(() => {
    const pwd = payload.value.password;
    let strength = 0;

    if (pwd.length >= 8) strength++;
    if (pwd.length >= 12) strength++;
    if (/[A-Z]/.test(pwd)) strength++;
    if (/[a-z]/.test(pwd)) strength++;
    if (/\d/.test(pwd)) strength++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) strength++;

    return strength;
});

const passwordStrengthWidth = computed(() => {
    const percentage = (passwordStrength.value / 6) * 100;
    return `${percentage}%`;
});

const strengthBarClass = computed(() => {
    if (passwordStrength.value <= 2) return 'bg-red-500';
    if (passwordStrength.value <= 4) return 'bg-amber-500';
    return 'bg-emerald-500';
});

const strengthTextClass = computed(() => {
    if (passwordStrength.value <= 2) return 'text-red-500 dark:text-red-400';
    if (passwordStrength.value <= 4) return 'text-amber-500 dark:text-amber-400';
    return 'text-emerald-600 dark:text-emerald-400';
});

const passwordStrengthText = computed(() => {
    if (passwordStrength.value <= 2) return 'Weak';
    if (passwordStrength.value <= 4) return 'Medium';
    return 'Strong';
});

// Validate form
const validateForm = (): boolean => {
    errors.value = {
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        password_confirmation: '',
        terms: ''
    };
    let isValid = true;

    // Validate first name
    if (!payload.value.firstName.trim()) {
        errors.value.firstName = 'First name is required';
        isValid = false;
    } else if (payload.value.firstName.trim().length < 2) {
        errors.value.firstName = 'First name must be at least 2 characters';
        isValid = false;
    }

    // Validate last name
    if (!payload.value.lastName.trim()) {
        errors.value.lastName = 'Last name is required';
        isValid = false;
    } else if (payload.value.lastName.trim().length < 2) {
        errors.value.lastName = 'Last name must be at least 2 characters';
        isValid = false;
    }

    // Validate email
    if (!payload.value.email.trim()) {
        errors.value.email = 'Email is required';
        isValid = false;
    } else if (!validateEmail(payload.value.email)) {
        errors.value.email = 'Please enter a valid email';
        isValid = false;
    }

    // Validate password
    if (payload.value.password) {
        const passwordValidation = validatePassword(payload.value.password);
        if (!passwordValidation.valid) {
            errors.value.password = passwordValidation.message;
            isValid = false;
        }
    } else {
        errors.value.password = 'Password is required';
        isValid = false;
    }

    // Validate password confirmation
    if (!payload.value.password_confirmation) {
        errors.value.password_confirmation = 'Please confirm your password';
        isValid = false;
    } else if (payload.value.password !== payload.value.password_confirmation) {
        errors.value.password_confirmation = 'Passwords do not match';
        isValid = false;
    }

    // Validate terms
    if (!acceptTerms.value) {
        errors.value.terms = 'You must accept the terms and conditions';
        isValid = false;
    }

    return isValid;
};

// Computed para verificar si el formulario es válido (para habilitar botón)
const isFormValid = computed(() => {
    return (
        payload.value.firstName.trim().length >= 2 &&
        payload.value.lastName.trim().length >= 2 &&
        validateEmail(payload.value.email) &&
        validatePassword(payload.value.password).valid &&
        payload.value.password === payload.value.password_confirmation &&
        acceptTerms.value
    );
});

// Handle server errors (422)
const handleServerErrors = (serverErrors: ValidationErrors) => {
    // Map server errors to form fields
    const fieldMapping: { [key: string]: keyof FormErrors } = {
        firstName: 'firstName',
        first_name: 'firstName',
        lastName: 'lastName',
        last_name: 'lastName',
        email: 'email',
        password: 'password',
        password_confirmation: 'password_confirmation'
    };

    Object.keys(serverErrors).forEach((key) => {
        const mappedField = fieldMapping[key];
        if (mappedField && serverErrors[key].length > 0) {
            errors.value[mappedField] = serverErrors[key][0];
        }
    });
};

// Handle registration
const handleRegister = async () => {
    if (!validateForm()) return;

    isLoading.value = true;

    try {
        await getUserService().userStore(payload.value);

        // Show success message
        toast.success(
            'Account created!',
            'Your account has been created successfully. You can now sign in.'
        );

        // Clear form
        payload.value = {
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            password_confirmation: ''
        };
        acceptTerms.value = false;

        // Redirect to login
        await router.push('/login');

    } catch (error) {
        if (error instanceof AxiosError && error.response) {
            const { status, data } = error.response;

            if (status === 422 && data.errors) {
                // Handle server validation errors for inline display
                handleServerErrors(data.errors);
            }
        }
    } finally {
        isLoading.value = false;
    }
};
</script>

<style scoped>
.register-page {
    position: relative;
    min-height: 100vh;
    min-height: 100dvh; /* Dynamic viewport height - respects mobile keyboard */
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1.5rem 1rem;
}

/* Subtle entrance: fade + lift */
.register-card {
    animation: register-enter 0.4s cubic-bezier(0.32, 0.72, 0, 1) both;
}

@keyframes register-enter {
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
    .register-card {
        animation: none;
    }
}
</style>
