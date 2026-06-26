<template>
  <div class="login-page">
    <!-- Decorative emerald glow backdrop -->
    <div class="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div class="absolute -top-24 -right-20 w-72 h-72 rounded-full bg-emerald-400/20 blur-3xl" />
      <div class="absolute -bottom-28 -left-20 w-72 h-72 rounded-full bg-emerald-500/10 blur-3xl" />
    </div>

    <div
      class="login-card relative w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 p-6 sm:p-8"
    >
      <!-- Brand -->
      <div class="flex flex-col items-center text-center mb-7">
        <div
          class="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-lg shadow-emerald-500/30 mb-4"
        >
          <v-icon name="md-sportssoccer" class="w-7 h-7 text-white" />
        </div>
        <h1 class="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white">
          {{ $t('auth.login.welcome') }}
        </h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {{ $t('auth.login.subtitle') }}
        </p>
      </div>

      <!-- Social login — the primary, fastest way in -->
      <div class="space-y-3">
        <ButtonComponent
          variant="google"
          size="md"
          icon="bi-google"
          :loading="isGoogleLoading"
          :disabled="isLoginLoading"
          :always-full-width="true"
          :text="isGoogleLoading ? $t('auth.login.googleConnecting') : $t('auth.login.continueGoogle')"
          @click="handleGoogleLogin"
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

      <!-- Email/password — secondary, revealed on demand to keep social first -->
      <button
        v-if="!showEmailForm"
        type="button"
        @click="showEmailForm = true"
        class="w-full flex items-center justify-center gap-2 h-11 rounded-lg border border-gray-200 dark:border-gray-700 text-footnote font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 active:scale-[0.99] transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
      >
        <v-icon name="hi-solid-mail" class="w-4 h-4" />
        {{ $t('auth.login.continueEmail') }}
      </button>

      <Transition name="reveal">
        <form v-if="showEmailForm" @submit.prevent="handleLogin" class="space-y-4" novalidate>
          <!-- Email -->
          <FormInput
            v-model="payload.email"
            :label="$t('auth.login.email.label')"
            type="email"
            icon="bi-person-fill"
            :placeholder="$t('auth.login.email.placeholder')"
            autocomplete="email"
            :error="errors.email"
            :disabled="isLoginLoading"
          />

          <!-- Password + helper row -->
          <div class="space-y-2">
            <FormInput
              v-model="payload.password"
              :label="$t('auth.login.password.label')"
              type="password"
              icon="bi-lock-fill"
              :placeholder="$t('auth.login.password.placeholder')"
              autocomplete="current-password"
              :error="errors.password"
              :disabled="isLoginLoading"
            />

            <div class="flex items-center justify-between">
              <label class="inline-flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  v-model="payload.remember"
                  class="w-4 h-4 rounded accent-emerald-600"
                />
                <span class="text-footnote text-gray-600 dark:text-gray-300">{{ $t('auth.login.rememberMe') }}</span>
              </label>
              <a
                href="#"
                class="text-footnote font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                {{ $t('auth.login.forgotPassword') }}
              </a>
            </div>
          </div>

          <!-- Submit -->
          <ButtonComponent
            type="submit"
            variant="primary"
            size="md"
            :disabled="!isFormValid"
            :loading="isLoginLoading"
            :always-full-width="true"
            :text="isLoginLoading ? $t('auth.login.signingIn') : $t('auth.login.signIn')"
          />
        </form>
      </Transition>

      <!-- Footer -->
      <p class="mt-7 text-center text-sm text-gray-500 dark:text-gray-400">
        {{ $t('auth.login.noAccount') }}
        <router-link
          to="/register"
          class="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
        >
          {{ $t('auth.login.signUp') }}
        </router-link>
      </p>

      <!-- Privacy notice -->
      <p class="mt-3 text-center text-2xs text-gray-400 dark:text-gray-500">
        {{ $t('auth.login.privacyPrefix') }}
        <router-link
          to="/privacy"
          class="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
        >
          {{ $t('auth.login.privacyLink') }}
        </router-link>
      </p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, Ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { FormInput, ButtonComponent } from '@/components/ui'
import { useAuthStore } from '@/store/auth/useAuthStore';
import { LoginPayload } from '@/interfaces/login/LoginPayload';

interface FormErrors {
    email: string
    password: string
}

// Router
const router = useRouter()
const route = useRoute()
const { t } = useI18n()

// Auth store
const authStore = useAuthStore()

const isLoginLoading: Ref<boolean> = ref(false);
const isGoogleLoading: Ref<boolean> = ref(false);

// Social login is the primary path; the email/password form stays collapsed
// until the user explicitly chooses "Continue with email".
const showEmailForm = ref(false);

// Reactive states
const payload = ref<LoginPayload>({
    email: '',
    password: '',
    device_name: 'web',
    remember: false
})

const errors = ref<FormErrors>({
    email: '',
    password: ''
})

// Method to validate email
const validateEmail = (email: string): boolean => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return regex.test(email)
}

// Validate form
const validateForm = (): boolean => {
    errors.value = { email: '', password: '' }
    let isValid = true

    // Validate email
    if (!payload.value.email) {
        errors.value.email = t('auth.login.validation.emailRequired')
        isValid = false
    } else if (!validateEmail(payload.value.email)) {
        errors.value.email = t('auth.login.validation.emailInvalid')
        isValid = false
    }

    // Validate password
    if (!payload.value.password) {
        errors.value.password = t('auth.login.validation.passwordRequired')
        isValid = false
    }

    return isValid
}

// Computed to check if form is valid
const isFormValid = computed(() => {
    return payload.value.email && payload.value.password && validateEmail(payload.value.email)
})

// Handle form submission
const handleLogin = async () => {
    if (!validateForm()) return;
    isLoginLoading.value = true;

    try {
        const result = await authStore.login(payload.value);
        if (result.token) {
            payload.value.email = '';
            payload.value.password = '';

            // Redirect to gaming hub or to the page user was trying to access
            const redirectTo = route.query.redirect as string || '/gaming'
            await router.push(redirectTo)
        }
    } catch (error) {
        // The API interceptor already surfaces a toast with the failure reason;
        // swallow here so the rejection doesn't bubble up as unhandled.
        console.error('Login error:', error)
    } finally {
        isLoginLoading.value = false
    }
}

// Handle Google login
const handleGoogleLogin = async () => {
    isGoogleLoading.value = true

    try {
        const url = await authStore.fetchGoogleLoginUrl();
        // Preserve the post-login redirect across the Google OAuth round-trip: the
        // ?redirect= query param is gone once we navigate to Google's domain, so we
        // stash it and the callback restores it (see GoogleCallback.vue).
        const redirect = route.query.redirect as string | undefined;
        if (redirect) sessionStorage.setItem('post_auth_redirect', redirect);
        window.location.href = url;
    } catch (error) {
        console.error('Google login error:', error)
    } finally {
        isGoogleLoading.value = false
    }
}
</script>

<style scoped>
.login-page {
    position: relative;
    min-height: 100vh;
    min-height: 100dvh; /* Dynamic viewport height - respects mobile keyboard */
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
}

/* Subtle entrance: fade + lift */
.login-card {
    animation: login-enter 0.4s cubic-bezier(0.32, 0.72, 0, 1) both;
}

@keyframes login-enter {
    from {
        opacity: 0;
        transform: translateY(12px) scale(0.98);
    }
    to {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}

/* Reveal the email form smoothly when "Continue with email" is tapped. */
.reveal-enter-active {
    transition: opacity 0.25s ease, transform 0.25s ease;
}
.reveal-enter-from {
    opacity: 0;
    transform: translateY(-6px);
}
.reveal-leave-active {
    transition: opacity 0.15s ease;
}
.reveal-leave-to {
    opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
    .login-card {
        animation: none;
    }
    .reveal-enter-active,
    .reveal-leave-active {
        transition: none;
    }
}
</style>
