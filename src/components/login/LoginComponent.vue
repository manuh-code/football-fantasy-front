<template>
    <div class="login-component">
        <div class="login-container">
            <!-- Header -->
            <div class="login-header">
                <h1 class="login-title">Sign In</h1>
                <p class="login-subtitle">Access your Football Fantasy account</p>
            </div>

            <!-- Form -->
            <form @submit.prevent="handleLogin" class="login-form">
                <!-- Email Field -->
                <FormInput
                    v-model="form.email"
                    label="Email"
                    type="email"
                    icon="bi-person-fill"
                    placeholder="your@email.com"
                    autocomplete="email"
                    :error="errors.email"
                />

                <!-- Password Field -->
                <FormInput
                    v-model="form.password"
                    label="Password"
                    type="password"
                    icon="bi-lock-fill"
                    placeholder="••••••••"
                    :error="errors.password"
                />

                <!-- Remember Me Checkbox -->
                <div class="remember-me">
                    <label class="remember-label">
                        <input 
                            type="checkbox" 
                            v-model="form.remember"
                            class="remember-checkbox"
                        />
                        <span class="remember-text">Remember me</span>
                    </label>
                </div>

                <!-- Login Button -->
                <ButtonComponent
                    type="submit"
                    variant="primary"
                    :disabled="!isFormValid"
                    :loading="isLoginLoading"
                    full-width
                >
                    {{ isLoginLoading ? 'Signing in...' : 'Sign In' }}
                </ButtonComponent>
            </form>

            <!-- Separator -->
            <span class="separator-text">
                <slot>Or continue with</slot>
            </span>

            <!-- Google Button -->
            <ButtonComponent
                variant="google"
                icon="bi-google"
                :loading="isGoogleLoading"
                full-width
                @click="handleGoogleLogin"
            >
                {{ isGoogleLoading ? 'Connecting...' : 'Continue with Google' }}
            </ButtonComponent>

            <!-- Additional Links -->
            <div class="login-footer">
                <a href="#" class="link">Forgot your password?</a>
                <p class="text-muted">
                    Don't have an account?
                    <a href="#" class="link">Sign up here</a>
                </p>
            </div>
        </div>
    </div>
</template>


<script lang="ts" setup>
import { ref, computed } from 'vue'
import { FormInput, ButtonComponent } from '@/components/ui'
import { loginService } from '@/services/login/LoginService'
import type { LoginPayload } from '@/services/login/LoginService'

// Define interfaces
interface LoginForm {
    email: string
    password: string
    device_name: string
    remember: boolean
}

interface FormErrors {
    email: string
    password: string
}

// Reactive states
const form = ref<LoginForm>({
    email: '',
    password: '',
    device_name: 'web',
    remember: false
})

const errors = ref<FormErrors>({
    email: '',
    password: ''
})

const isLoginLoading = ref(false)
const isGoogleLoading = ref(false)

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
    if (!form.value.email) {
        errors.value.email = 'Email is required'
        isValid = false
    } else if (!validateEmail(form.value.email)) {
        errors.value.email = 'Please enter a valid email'
        isValid = false
    }

    // Validate password
    if (!form.value.password) {
        errors.value.password = 'Password is required'
        isValid = false
    }

    return isValid
}

// Computed to check if form is valid
const isFormValid = computed(() => {
    return form.value.email && form.value.password && validateEmail(form.value.email)
})

// Handle form submission
const handleLogin = async () => {
    if (!validateForm()) return

    isLoginLoading.value = true

    try {
        // Prepare payload for the login service
        const payload: LoginPayload = {
            email: form.value.email,
            password: form.value.password,
            device_name: form.value.device_name,
            remember: form.value.remember
        }

        console.log('LoginComponent: Calling login service with:', { 
            email: payload.email, 
            device_name: payload.device_name,
            remember: payload.remember 
        })

        // Call the login service - useApi will handle toasts automatically
        const result = await loginService.login(payload)

        console.log('LoginComponent: Service result:', result)

        if (result.success) {
            console.log('LoginComponent: Login successful, token available')
            
            // Clear form after successful login
            form.value.email = ''
            form.value.password = ''
            
            // TODO: Redirect to dashboard or appropriate route
        }

    } catch (error) {
        console.error('LoginComponent: Unexpected error:', error)
        // useApi already handled the error toast
    } finally {
        isLoginLoading.value = false
    }
}

// Handle Google login
const handleGoogleLogin = async () => {
    isGoogleLoading.value = true

    try {
        // Google authentication logic would go here
        console.log('Logging in with Google')

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000))

        // TODO: Implement Google authentication logic

    } catch (error) {
        console.error('Google login error:', error)
    } finally {
        isGoogleLoading.value = false
    }
}
</script>


<style lang="scss" scoped>
.login-component {
    @apply min-h-screen flex items-center justify-center px-4 py-8;
}

.login-container {
    @apply w-full max-w-md;
    background: var(--color-bg);
    border-radius: 16px;
    padding: 2rem;
    box-shadow: var(--shadow-xl);
    border: 1px solid var(--color-border);
}

.login-header {
    @apply text-center mb-8;
}

.login-title {
    @apply text-2xl font-bold mb-2;
    color: var(--color-text);
}

.login-subtitle {
    @apply text-sm;
    color: var(--color-text-secondary);
}

.login-form {
    @apply space-y-6;
}

.remember-me {
    display: flex;
    align-items: center;
    margin: 1rem 0;
}

.remember-label {
    display: flex;
    align-items: center;
    cursor: pointer;
    font-size: 0.875rem;
    color: var(--color-text-secondary);
}

.remember-checkbox {
    width: 1rem;
    height: 1rem;
    margin-right: 0.5rem;
    accent-color: var(--color-primary);
}

.remember-text {
    user-select: none;
}

.login-footer {
    @apply mt-8 text-center space-y-3;
}

.link {
    @apply text-sm font-medium transition-colors duration-200;
    color: var(--color-primary);

    &:hover {
        color: var(--color-primary-hover);
    }
}

.text-muted {
    @apply text-sm;
    color: var(--color-text-secondary);
}

.separator {
    @apply relative my-6;
    display: flex;
    align-items: center;
    text-align: center;

    &::before {
        content: '';
        flex: 1;
        height: 1px;
        background: var(--color-border);
    }

    &::after {
        content: '';
        flex: 1;
        height: 1px;
        background: var(--color-border);
    }
}

.separator-text {
    @apply px-4 text-sm;
    background: var(--color-bg);
    color: var(--color-text-secondary);
    white-space: nowrap;
}

// Responsive adjustments
@media (max-width: 640px) {
    .login-container {
        margin: 1rem;
        padding: 1.5rem;
    }

    .login-title {
        @apply text-xl;
    }
}
</style>
