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
          {{ $t('auth.register.title') }}
        </h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {{ $t('auth.register.subtitle') }}
        </p>
      </div>

      <!-- Social signup — the primary, fastest way to join -->
      <div class="space-y-3">
        <ButtonComponent
          variant="google"
          size="md"
          icon="bi-google"
          :loading="isGoogleLoading"
          :disabled="isLoading"
          :always-full-width="true"
          :text="isGoogleLoading ? $t('auth.login.googleConnecting') : $t('auth.login.continueGoogle')"
          @click="handleGoogleSignup"
        />
        <!-- Add Facebook, Apple, etc. here once the backend supports them. -->
      </div>

      <!-- Separator -->
      <div class="flex items-center gap-3 my-5">
        <div class="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
        <span class="text-2xs font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500 whitespace-nowrap">
          {{ $t('auth.login.or') }}
        </span>
        <div class="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
      </div>

      <!-- Email signup — secondary, revealed on demand to keep social first -->
      <button
        v-if="!showEmailForm"
        type="button"
        @click="showEmailForm = true"
        class="w-full flex items-center justify-center gap-2 h-11 rounded-lg border border-gray-200 dark:border-gray-700 text-footnote font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 active:scale-[0.99] transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
      >
        <v-icon name="hi-solid-mail" class="w-4 h-4" />
        {{ $t('auth.register.signupEmail') }}
      </button>

      <!-- Form -->
      <form v-if="showEmailForm" @submit.prevent="handleRegister" class="space-y-4 reveal-form" novalidate>
        <!-- Name fields -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormInput
            v-model="payload.firstName"
            :label="$t('auth.register.firstName')"
            type="text"
            icon="bi-person-fill"
            :placeholder="$t('auth.register.firstNamePlaceholder')"
            autocomplete="given-name"
            :error="errors.firstName"
            :disabled="isLoading"
          />
          <FormInput
            v-model="payload.lastName"
            :label="$t('auth.register.lastName')"
            type="text"
            icon="bi-person-fill"
            :placeholder="$t('auth.register.lastNamePlaceholder')"
            autocomplete="family-name"
            :error="errors.lastName"
            :disabled="isLoading"
          />
        </div>

        <!-- Email -->
        <FormInput
          v-model="payload.email"
          :label="$t('auth.register.email')"
          type="email"
          icon="bi-envelope-fill"
          :placeholder="$t('auth.register.emailPlaceholder')"
          autocomplete="email"
          :error="errors.email"
          :disabled="isLoading"
        />

        <!-- Password + strength meter -->
        <div>
          <FormInput
            v-model="payload.password"
            :label="$t('auth.register.password')"
            type="password"
            icon="bi-lock-fill"
            :placeholder="$t('auth.register.passwordPlaceholder')"
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
              class="text-2xs font-semibold w-12 text-right"
              :class="strengthTextClass"
            >
              {{ passwordStrengthText }}
            </span>
          </div>
        </div>

        <!-- Confirm password -->
        <FormInput
          v-model="payload.password_confirmation"
          :label="$t('auth.register.confirmPassword')"
          type="password"
          icon="bi-lock-fill"
          :placeholder="$t('auth.register.passwordPlaceholder')"
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
            <span class="text-footnote leading-snug text-gray-600 dark:text-gray-300">
              {{ $t('auth.register.agreePrefix') }}
              <a href="#" class="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline">{{ $t('auth.register.termsLink') }}</a>
              {{ $t('auth.register.agreeAnd') }}
              <a href="#" @click.prevent="showPrivacyModal = true" class="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline">{{ $t('auth.register.privacyPolicyLink') }}</a>
            </span>
          </label>
          <p v-if="errors.terms" class="mt-1.5 text-xs text-red-500 dark:text-red-400">
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
          :text="isLoading ? $t('auth.register.creating') : $t('auth.register.createAccount')"
        />
      </form>

      <!-- Footer -->
      <p class="mt-7 text-center text-sm text-gray-500 dark:text-gray-400">
        {{ $t('auth.register.haveAccount') }}
        <router-link
          to="/login"
          class="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
        >
          {{ $t('auth.register.signIn') }}
        </router-link>
      </p>

      <!-- Privacy notice -->
      <p class="mt-3 text-center text-2xs text-gray-400 dark:text-gray-500">
        {{ $t('auth.register.privacyPrefix') }}
        <router-link
          to="/privacy"
          class="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
        >
          {{ $t('auth.login.privacyLink') }}
        </router-link>
      </p>
    </div>
  </div>

  <!-- Privacy policy modal -->
  <Teleport to="body">
    <Transition name="privacy-modal">
      <div
        v-if="showPrivacyModal"
        class="fixed inset-0 z-50 flex flex-col bg-gray-50 dark:bg-gray-900 overflow-y-auto"
        role="dialog"
        aria-modal="true"
      >
        <!-- Close bar -->
        <div class="sticky top-0 z-10 flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
          <span class="text-sm font-semibold text-gray-900 dark:text-white">
            {{ $t('auth.register.privacyPolicyLink') }}
          </span>
          <button
            type="button"
            @click="showPrivacyModal = false"
            class="w-8 h-8 flex items-center justify-center rounded-full text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            :aria-label="$t('common.actions.close')"
          >
            <v-icon name="hi-solid-x" class="w-4 h-4" />
          </button>
        </div>

        <PrivacyView :is-modal="true" />
      </div>
    </Transition>
  </Teleport>
</template>

<script lang="ts" setup>
import { ref, computed, Ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { FormInput, ButtonComponent } from '@/components/ui';
import PrivacyView from '@/views/legal/PrivacyView.vue';
import { UserStorePayload } from '@/interfaces/user/store/userStorePayload';
import { getUserService } from '@/services/user/UserService';
import { useAuthStore } from '@/store/auth/useAuthStore';
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
const route = useRoute();
const { t } = useI18n();

// Toast
const toast = useToast();

// Loading state
const isLoading: Ref<boolean> = ref(false);

// Auth store (for social signup)
const authStore = useAuthStore();
const isGoogleLoading: Ref<boolean> = ref(false);

// Social signup is the primary path; the email form stays collapsed until the
// user explicitly chooses "Sign up with email".
const showEmailForm = ref(false);

const showPrivacyModal = ref(false);

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
        return { valid: false, message: t('auth.register.validation.passwordMin') };
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
    if (passwordStrength.value <= 2) return t('auth.register.strengthWeak');
    if (passwordStrength.value <= 4) return t('auth.register.strengthMedium');
    return t('auth.register.strengthStrong');
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
        errors.value.firstName = t('auth.register.validation.firstNameRequired');
        isValid = false;
    } else if (payload.value.firstName.trim().length < 2) {
        errors.value.firstName = t('auth.register.validation.firstNameMin');
        isValid = false;
    }

    // Validate last name
    if (!payload.value.lastName.trim()) {
        errors.value.lastName = t('auth.register.validation.lastNameRequired');
        isValid = false;
    } else if (payload.value.lastName.trim().length < 2) {
        errors.value.lastName = t('auth.register.validation.lastNameMin');
        isValid = false;
    }

    // Validate email
    if (!payload.value.email.trim()) {
        errors.value.email = t('auth.register.validation.emailRequired');
        isValid = false;
    } else if (!validateEmail(payload.value.email)) {
        errors.value.email = t('auth.register.validation.emailInvalid');
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
        errors.value.password = t('auth.register.validation.passwordRequired');
        isValid = false;
    }

    // Validate password confirmation
    if (!payload.value.password_confirmation) {
        errors.value.password_confirmation = t('auth.register.validation.confirmRequired');
        isValid = false;
    } else if (payload.value.password !== payload.value.password_confirmation) {
        errors.value.password_confirmation = t('auth.register.validation.passwordsMismatch');
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

// Continue with Google — social login also creates the account on first sign-in.
const handleGoogleSignup = async () => {
    isGoogleLoading.value = true;
    try {
        const url = await authStore.fetchGoogleLoginUrl();
        // Preserve any post-auth redirect across the Google OAuth round-trip
        // (restored in GoogleCallback.vue).
        const redirect = route.query.redirect as string | undefined;
        if (redirect) sessionStorage.setItem('post_auth_redirect', redirect);
        window.location.href = url;
    } catch (error) {
        console.error('Google signup error:', error);
    } finally {
        isGoogleLoading.value = false;
    }
};

// Handle registration
const handleRegister = async () => {
    if (!validateForm()) return;

    isLoading.value = true;

    // Keep the credentials before we clear the form so we can sign the user in
    // automatically once the account is created.
    const email = payload.value.email;
    const password = payload.value.password;

    try {
        await getUserService().userStore(payload.value);

        // Show success message
        toast.success(
            t('auth.register.success.title'),
            t('auth.register.success.message')
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

        // Sign the user in automatically with the credentials they just used,
        // then send them to the gaming hub (or the page they were headed to).
        // If the auto-login fails (e.g. a network hiccup), the account still
        // exists, so fall back to the login screen instead of leaving the user
        // stranded on the register form.
        try {
            await authStore.login({ email, password, device_name: 'web', remember: true });
            const redirectTo = (route.query.redirect as string) || '/gaming';
            await router.push(redirectTo);
        } catch (loginError) {
            console.error('Auto-login after registration failed:', loginError);
            await router.push({ path: '/login', query: route.query });
        }

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

/* Reveal the email form smoothly when "Sign up with email" is tapped. */
.reveal-form {
    animation: reveal-form 0.25s ease both;
}

@keyframes reveal-form {
    from {
        opacity: 0;
        transform: translateY(-6px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* Privacy policy modal slide-up */
.privacy-modal-enter-active {
    transition: opacity 0.2s ease, transform 0.25s cubic-bezier(0.32, 0.72, 0, 1);
}
.privacy-modal-leave-active {
    transition: opacity 0.15s ease, transform 0.2s ease;
}
.privacy-modal-enter-from,
.privacy-modal-leave-to {
    opacity: 0;
    transform: translateY(16px);
}

@media (prefers-reduced-motion: reduce) {
    .register-card,
    .reveal-form {
        animation: none;
    }
    .privacy-modal-enter-active,
    .privacy-modal-leave-active {
        transition: none;
    }
}
</style>
