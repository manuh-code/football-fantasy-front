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

<style lang="scss" scoped>
.form-group {
    @apply space-y-2;
}

.form-label {
    @apply text-sm font-medium block;
    color: var(--color-text);
}

.input-container {
    position: relative;
    display: flex;
    align-items: center;
}

.input-icon {
    position: absolute;
    left: 0.75rem;
    z-index: 1;
    @apply w-4 h-4;
    color: var(--color-text-secondary);
}

.form-input {
    @apply w-full px-4 py-3 rounded-lg border transition-all duration-200;
    background: var(--color-bg-secondary);
    border-color: var(--color-border);
    color: var(--color-text);

    &:focus {
        outline: none;
        border-color: var(--color-primary);
        box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.1);
    }

    &::placeholder {
        color: var(--color-text-muted);
    }

    &--error {
        border-color: var(--color-danger);

        &:focus {
            border-color: var(--color-danger);
            box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
        }
    }

    &--with-icon {
        padding-left: 2.5rem;
    }

    &--with-icons {
        padding-left: 2.5rem;
        padding-right: 3rem;
    }

    &:disabled {
        @apply opacity-60 cursor-not-allowed;
        background: var(--color-bg-muted);
    }

    &:read-only {
        background: var(--color-bg-muted);
    }
}

.password-toggle-btn {
    position: absolute;
    right: 0.75rem;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0.25rem;
    border-radius: 0.25rem;
    transition: all 0.15s ease-in-out;

    &:hover {
        background: var(--color-bg-hover);
    }

    &:focus {
        outline: none;
        background: var(--color-bg-hover);
    }
}

.password-toggle-icon {
    @apply w-4 h-4;
    color: var(--color-text-secondary);

    &:hover {
        color: var(--color-text);
    }
}

.form-error {
    @apply text-xs;
    color: var(--color-danger);
}
</style>
