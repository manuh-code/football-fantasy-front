<template>
    <div class="form-group">
        <label v-if="label" :for="inputId" class="form-label">{{ label }}</label>
        <div class="input-container">
            <v-icon v-if="icon" :name="icon" class="input-icon" />
            <input
                :id="inputId"
                :type="inputType"
                :value="modelValue"
                @input="updateValue"
                :class="inputClasses"
                :placeholder="placeholder"
                :autocomplete="autocomplete"
                :disabled="disabled"
                :readonly="readonly"
            />
            <button
                v-if="showToggle"
                type="button"
                @click="toggleVisibility"
                class="password-toggle-btn"
                :aria-label="showPassword ? 'Hide password' : 'Show password'"
            >
                <v-icon
                    :name="showPassword ? 'bi-eye-slash-fill' : 'bi-eye-fill'"
                    class="password-toggle-icon"
                />
            </button>
        </div>
        <span v-if="error" class="form-error">{{ error }}</span>
    </div>
</template>

<script lang="ts" setup>
import { ref, computed, withDefaults, defineProps, defineEmits } from 'vue'

interface Props {
    modelValue: string
    label?: string
    icon?: string
    type?: 'text' | 'email' | 'password' | 'tel' | 'url' | 'search'
    placeholder?: string
    autocomplete?: string
    error?: string
    disabled?: boolean
    readonly?: boolean
    id?: string
}

const props = withDefaults(defineProps<Props>(), {
    type: 'text',
    placeholder: '',
    autocomplete: 'off',
    disabled: false,
    readonly: false
})

const emit = defineEmits<{
    'update:modelValue': [value: string]
}>()

// Internal state for password visibility
const showPassword = ref(false)

// Computed properties
const inputId = computed(() => props.id || `input-${Math.random().toString(36).substr(2, 9)}`)

const inputType = computed(() => {
    if (props.type === 'password') {
        return showPassword.value ? 'text' : 'password'
    }
    return props.type
})

const showToggle = computed(() => props.type === 'password')

const inputClasses = computed(() => {
    const baseClasses = ['form-input']
    
    if (props.error) {
        baseClasses.push('form-input--error')
    }
    
    if (props.icon && showToggle.value) {
        baseClasses.push('form-input--with-icons')
    } else if (props.icon || showToggle.value) {
        baseClasses.push('form-input--with-icon')
    }
    
    return baseClasses
})

// Methods
const updateValue = (event: Event) => {
    const target = event.target as HTMLInputElement
    emit('update:modelValue', target.value)
}

const toggleVisibility = () => {
    showPassword.value = !showPassword.value
}
</script>

<style scoped>
.form-group {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
}

.form-label {
    font-size: 0.875rem;
    font-weight: 600;
    display: block;
    color: var(--color-text);
    margin-bottom: 0.125rem;
}

.input-container {
    position: relative;
    display: flex;
    align-items: center;
}

.input-icon {
    position: absolute;
    left: 0.875rem;
    z-index: 1;
    width: 1.25rem;
    height: 1.25rem;
    color: var(--color-text-secondary);
}

.form-input {
    width: 100%;
    /* 16px prevents iOS auto-zoom on focus */
    font-size: 1rem;
    padding: 0.875rem 1rem;
    border-radius: 0.75rem;
    border: 1.5px solid;
    transition: all 0.2s ease;
    background: var(--color-bg-secondary);
    border-color: var(--color-border);
    color: var(--color-text);
    -webkit-appearance: none;
    appearance: none;
}

.form-input:focus {
    outline: none;
    border-color: #059669;
    box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.1);
}

.form-input::placeholder {
    color: var(--color-text-muted);
    font-size: 0.875rem;
}

.form-input--error {
    border-color: #dc2626;
}

.form-input--error:focus {
    border-color: #dc2626;
    box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
}

.form-input--with-icon {
    padding-left: 2.75rem;
}

.form-input--with-icons {
    padding-left: 2.75rem;
    padding-right: 3.25rem;
}

.form-input:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    background: var(--color-bg-muted);
}

.form-input:read-only {
    background: var(--color-bg-muted);
}

.password-toggle-btn {
    position: absolute;
    right: 0.75rem;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 0.375rem;
    transition: all 0.15s ease-in-out;
    /* Larger touch target for mobile */
    min-width: 2.5rem;
    min-height: 2.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
}

.password-toggle-btn:hover {
    background: var(--color-bg-hover);
}

.password-toggle-btn:focus {
    outline: none;
    background: var(--color-bg-hover);
}

.password-toggle-icon {
    width: 1.25rem;
    height: 1.25rem;
    color: var(--color-text-secondary);
}

.password-toggle-icon:hover {
    color: var(--color-text);
}

.form-error {
    font-size: 0.75rem;
    color: #dc2626;
    margin-top: 0.125rem;
}

/* Desktop refinements */
@media (min-width: 768px) {
    .form-input {
        font-size: 0.875rem;
        padding: 0.75rem 1rem;
    }

    .form-input::placeholder {
        font-size: 0.875rem;
    }

    .input-icon {
        width: 1rem;
        height: 1rem;
        left: 0.75rem;
    }

    .form-input--with-icon {
        padding-left: 2.5rem;
    }

    .form-input--with-icons {
        padding-left: 2.5rem;
        padding-right: 3rem;
    }

    .password-toggle-icon {
        width: 1rem;
        height: 1rem;
    }
}
</style>
