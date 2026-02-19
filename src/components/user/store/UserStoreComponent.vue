<template>
    <div class="register-component">
        <div class="animate-page-enter register-container">
            <!-- Header -->
            <div class="register-header">
                <h1 class="register-title">Create Account</h1>
                <p class="register-subtitle">Join Football Fantasy and start playing</p>
            </div>

            <!-- Form -->
            <form @submit.prevent="handleRegister" class="register-form">
                <!-- Name Fields Row -->
                <div class="form-row">
                    <!-- First Name -->
                    <div class="form-col">
                        <FormInput 
                            v-model="payload.firstName" 
                            label="First Name" 
                            type="text" 
                            icon="bi-person-fill"
                            placeholder="Your first name" 
                            autocomplete="given-name" 
                            :error="errors.firstName" 
                        />
                    </div>

                    <!-- Last Name -->
                    <div class="form-col">
                        <FormInput 
                            v-model="payload.lastName" 
                            label="Last Name" 
                            type="text" 
                            icon="bi-person-fill"
                            placeholder="Your last name" 
                            autocomplete="family-name" 
                            :error="errors.lastName" 
                        />
                    </div>
                </div>

                <!-- Email Field -->
                <div>
                    <FormInput 
                        v-model="payload.email" 
                        label="Email" 
                        type="email" 
                        icon="bi-envelope-fill"
                        placeholder="your@email.com" 
                        autocomplete="email" 
                        :error="errors.email" 
                    />
                </div>

                <!-- Password Field -->
                <div>
                    <FormInput 
                        v-model="payload.password" 
                        label="Password" 
                        type="password" 
                        icon="bi-lock-fill"
                        placeholder="••••••••" 
                        autocomplete="new-password" 
                        :error="errors.password" 
                    />
                    <div v-if="payload.password && !errors.password" class="password-strength">
                        <div class="strength-bar">
                            <div 
                                class="strength-fill" 
                                :class="passwordStrengthClass"
                                :style="{ width: passwordStrengthWidth }"
                            ></div>
                        </div>
                        <span class="strength-text" :class="passwordStrengthClass">
                            {{ passwordStrengthText }}
                        </span>
                    </div>
                </div>

                <!-- Confirm Password Field -->
                <div>
                    <FormInput 
                        v-model="payload.password_confirmation" 
                        label="Confirm Password" 
                        type="password" 
                        icon="bi-lock-fill"
                        placeholder="••••••••" 
                        autocomplete="new-password" 
                        :error="errors.password_confirmation" 
                    />
                </div>

                <!-- Terms and Conditions -->
                <div class="terms-checkbox">
                    <label class="terms-label">
                        <input type="checkbox" v-model="acceptTerms" class="terms-input" />
                        <span class="terms-text">
                            I accept the <a href="#" class="link">terms and conditions</a> 
                            and the <a href="#" class="link">privacy policy</a>
                        </span>
                    </label>
                    <span v-if="errors.terms" class="form-error">{{ errors.terms }}</span>
                </div>

                <!-- Register Button -->
                <div>
                    <ButtonComponent 
                        type="submit" 
                        variant="primary" 
                        size="md"
                        :disabled="!isFormValid" 
                        :loading="isLoading"
                        :always-full-width="true"
                        :text="isLoading ? 'Creating account...' : 'Create Account'"
                    />
                </div>
            </form>

            <!-- Footer -->
            <div class="animate-fade-in animate-delay-450 register-footer">
                <p class="text-muted">
                    Already have an account?
                    <router-link to="/login" class="link">Sign in here</router-link>
                </p>
            </div>
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

// Strong password validation
const validatePassword = (password: string): { valid: boolean; message: string } => {
    if (password.length < 8) {
        return { valid: false, message: 'Password must be at least 8 characters' };
    }
    if (!/[A-Z]/.test(password)) {
        return { valid: false, message: 'Password must contain at least one uppercase letter' };
    }
    if (!/[a-z]/.test(password)) {
        return { valid: false, message: 'Password must contain at least one lowercase letter' };
    }
    if (!/\d/.test(password)) {
        return { valid: false, message: 'Password must contain at least one number' };
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

const passwordStrengthClass = computed(() => {
    if (passwordStrength.value <= 2) return 'strength-weak';
    if (passwordStrength.value <= 4) return 'strength-medium';
    return 'strength-strong';
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
                // Handle server validation errors
                handleServerErrors(data.errors);
                toast.error(
                    'Validation error',
                    data.message || 'Please check the form fields.'
                );
            } else {
                // Generic server error
                toast.error(
                    'Registration error',
                    'An unexpected error occurred. Please try again.'
                );
            }
        } else {
            // Network or other error
            toast.error(
                'Connection error',
                'Could not connect to the server. Check your internet connection.'
            );
        }
    } finally {
        isLoading.value = false;
    }
};
</script>

<style scoped>
.register-component {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem 1rem;
}

.register-container {
    width: 100%;
    max-width: 32rem;
    background: var(--color-bg);
    border-radius: 16px;
    padding: 2rem;
    box-shadow: var(--shadow-xl);
    border: 1px solid var(--color-border);
}

.register-header {
    text-align: center;
    margin-bottom: 2rem;
}

.register-title {
    font-size: 1.5rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
    color: var(--color-text);
}

.register-subtitle {
    font-size: 0.875rem;
    color: var(--color-text-secondary);
}

.register-form {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
}

.form-row {
    display: flex;
    gap: 1rem;
}

.form-col {
    flex: 1;
    min-width: 0;
}

/* Password Strength Indicator */
.password-strength {
    margin-top: 0.5rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.strength-bar {
    flex: 1;
    height: 4px;
    background: var(--color-border);
    border-radius: 2px;
    overflow: hidden;
}

.strength-fill {
    height: 100%;
    border-radius: 2px;
    transition: width 0.3s ease, background-color 0.3s ease;
}

.strength-fill.strength-weak {
    background-color: #ef4444;
}

.strength-fill.strength-medium {
    background-color: #f59e0b;
}

.strength-fill.strength-strong {
    background-color: #22c55e;
}

.strength-text {
    font-size: 0.75rem;
    font-weight: 500;
    min-width: 3rem;
}

.strength-text.strength-weak {
    color: #ef4444;
}

.strength-text.strength-medium {
    color: #f59e0b;
}

.strength-text.strength-strong {
    color: #22c55e;
}

/* Terms Checkbox */
.terms-checkbox {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.terms-label {
    display: flex;
    align-items: flex-start;
    cursor: pointer;
    font-size: 0.875rem;
    color: var(--color-text-secondary);
    gap: 0.5rem;
}

.terms-input {
    width: 1rem;
    height: 1rem;
    margin-top: 0.125rem;
    accent-color: var(--color-primary);
    flex-shrink: 0;
}

.terms-text {
    user-select: none;
    line-height: 1.4;
}

.form-error {
    font-size: 0.75rem;
    color: #ef4444;
    margin-top: 0.25rem;
}

.register-footer {
    margin-top: 2rem;
    text-align: center;
}

.link {
    font-size: 0.875rem;
    font-weight: 500;
    transition: color 0.2s ease;
    color: var(--color-primary);
    text-decoration: none;
}

.link:hover {
    color: var(--color-primary-hover);
}

.text-muted {
    font-size: 0.875rem;
    color: var(--color-text-secondary);
    margin: 0;
}

/* Responsive */
@media (max-width: 640px) {
    .register-component {
        padding: 1rem;
    }

    .register-container {
        margin: 1rem;
        padding: 1.5rem;
    }

    .register-title {
        font-size: 1.25rem;
    }

    .form-row {
        flex-direction: column;
        gap: 1.25rem;
    }
}
</style>
