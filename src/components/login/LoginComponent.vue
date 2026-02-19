<template>
    <div class="login-component">
        <div class="animate-page-enter login-container">
            <!-- Header -->
            <div class="login-header">
                <h1 class="login-title">Sign In</h1>
                <p class="login-subtitle">Access your Football Fantasy account</p>
            </div>

            <!-- Form -->
            <form @submit.prevent="handleLogin" class="login-form">
                <!-- Email Field -->
                <div>
                    <FormInput v-model="payload.email" label="Email" type="email" icon="bi-person-fill"
                        placeholder="your@email.com" autocomplete="email" :error="errors.email" />
                </div>

                <!-- Password Field -->
                <div>
                    <FormInput v-model="payload.password" label="Password" type="password" icon="bi-lock-fill"
                        placeholder="••••••••" :error="errors.password" />
                </div>

                <!-- Remember Me Checkbox -->
                <div class="remember-me">
                    <label class="remember-label">
                        <input type="checkbox" v-model="payload.remember" class="remember-checkbox" />
                        <span class="remember-text">Remember me</span>
                    </label>
                </div>

                <!-- Login Button -->
                <div>
                    <ButtonComponent 
                        type="submit" 
                        variant="primary" 
                        size="md"
                        :disabled="!isFormValid" 
                        :loading="isLoginLoading"
                        :always-full-width="true"
                        :text="isLoginLoading ? 'Signing in...' : 'Sign In'"
                    />
                </div>
            </form>

            <!-- Separator -->
            <div class="separator">
                <span class="separator-text">Or continue with</span>
            </div>

            <!-- Google Button -->
            <div>
                <ButtonComponent 
                    variant="google" 
                    size="md"
                    icon="bi-google" 
                    :loading="isGoogleLoading" 
                    :always-full-width="true"
                    :text="isGoogleLoading ? 'Connecting...' : 'Continue with Google'"
                    @click="handleGoogleLogin"
                />
            </div>

            <!-- Additional Links -->
            <div class="animate-fade-in animate-delay-450 login-footer">
                <a href="#" class="link">Forgot your password?</a>
                <p class="text-muted">
                    Don't have an account?
                    <router-link to="/register" class="link">Sign up here</router-link>
                </p>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, computed, Ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
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

// Auth store
const authStore = useAuthStore()

const isLoginLoading: Ref<boolean> = ref(false);
const isGoogleLoading: Ref<boolean> = ref(false);

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
        errors.value.email = 'Email is required'
        isValid = false
    } else if (!validateEmail(payload.value.email)) {
        errors.value.email = 'Please enter a valid email'
        isValid = false
    }

    // Validate password
    if (!payload.value.password) {
        errors.value.password = 'Password is required'
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
    } finally {
        isLoginLoading.value = false
    }
}

// Handle Google login
const handleGoogleLogin = async () => {
    isGoogleLoading.value = true

    try {
        const url = await authStore.fetchGoogleLoginUrl();
        window.location.href = url;
        

    } catch (error) {
        console.error('Google login error:', error)
    } finally {
        isGoogleLoading.value = false
    }
}
</script>


<style scoped>
.login-component {
    min-height: 100vh;
    min-height: 100dvh; /* Dynamic viewport height - respects mobile keyboard */
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
}

.login-container {
    width: 100%;
    max-width: 28rem;
    background: var(--color-bg);
    border-radius: 1rem;
    padding: 1.75rem 1.5rem;
    box-shadow: var(--shadow-xl);
    border: 1px solid var(--color-border);
}

.login-header {
    text-align: center;
    margin-bottom: 2rem;
}

.login-title {
    font-size: 1.75rem;
    font-weight: 800;
    margin-bottom: 0.5rem;
    color: var(--color-text);
    letter-spacing: -0.025em;
}

.login-subtitle {
    font-size: 0.9375rem;
    color: var(--color-text-secondary);
}

.login-form {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
}

.remember-me {
    display: flex;
    align-items: center;
    margin: 0.25rem 0;
}

.remember-label {
    display: flex;
    align-items: center;
    cursor: pointer;
    font-size: 0.9375rem;
    color: var(--color-text-secondary);
    -webkit-tap-highlight-color: transparent;
}

.remember-checkbox {
    width: 1.25rem;
    height: 1.25rem;
    margin-right: 0.625rem;
    accent-color: var(--color-primary);
    border-radius: 0.25rem;
}

.remember-text {
    user-select: none;
}

.login-footer {
    margin-top: 1.75rem;
    text-align: center;
    display: flex;
    flex-direction: column;
    gap: 0.875rem;
}

.link {
    font-size: 0.9375rem;
    font-weight: 500;
    transition: color 0.2s ease;
    color: var(--color-primary);
    text-decoration: none;
    -webkit-tap-highlight-color: transparent;
}

.link:hover {
    color: var(--color-primary-hover);
}

.text-muted {
    font-size: 0.9375rem;
    color: var(--color-text-secondary);
    margin: 0;
}

.separator {
    position: relative;
    margin: 1.5rem 0;
    display: flex;
    align-items: center;
    text-align: center;
}

.separator::before,
.separator::after {
    content: '';
    flex: 1;
    height: 1px;
    background: var(--color-border);
}

.separator-text {
    padding: 0 1rem;
    font-size: 0.8125rem;
    background: var(--color-bg);
    color: var(--color-text-secondary);
    white-space: nowrap;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-weight: 500;
}

/* Desktop refinements */
@media (min-width: 768px) {
    .login-container {
        padding: 2.5rem;
        border-radius: 1.25rem;
    }

    .login-title {
        font-size: 1.5rem;
    }

    .login-subtitle {
        font-size: 0.875rem;
    }

    .link,
    .text-muted,
    .remember-label {
        font-size: 0.875rem;
    }

    .remember-checkbox {
        width: 1rem;
        height: 1rem;
    }
}
</style>
