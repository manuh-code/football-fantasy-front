<template>
    <button
        :type="type"
        :class="buttonClasses"
        :disabled="disabled || loading"
        @click="handleClick"
    >
        <v-icon v-if="icon && !loading" :name="icon" class="btn-icon" />
        <span v-if="loading" class="loading-spinner"></span>
        <slot>{{ text }}</slot>
    </button>
</template>

<script lang="ts" setup>
import { computed, withDefaults, defineProps, defineEmits } from 'vue'

interface Props {
    variant?: 'primary' | 'secondary' | 'google' | 'outline' | 'ghost'
    size?: 'sm' | 'md' | 'lg'
    type?: 'button' | 'submit' | 'reset'
    disabled?: boolean
    loading?: boolean
    fullWidth?: boolean
    icon?: string
    text?: string
}

const props = withDefaults(defineProps<Props>(), {
    variant: 'primary',
    size: 'md',
    type: 'button',
    disabled: false,
    loading: false,
    fullWidth: false
})

const emit = defineEmits<{
    click: [event: MouseEvent]
}>()

// Computed properties
const buttonClasses = computed(() => {
    const classes = ['btn']
    
    // Variant classes
    classes.push(`btn--${props.variant}`)
    
    // Size classes
    classes.push(`btn--${props.size}`)
    
    // Full width
    if (props.fullWidth) {
        classes.push('btn--full')
    }
    
    return classes
})

// Methods
const handleClick = (event: MouseEvent) => {
    if (!props.disabled && !props.loading) {
        emit('click', event)
    }
}
</script>

<style lang="scss" scoped>
.btn {
    @apply px-4 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2;
    border: none;
    cursor: pointer;

    &:disabled {
        @apply opacity-60 cursor-not-allowed;
    }

    // Variants
    &--primary {
        background: var(--color-primary);
        color: white;

        &:hover:not(:disabled) {
            background: var(--color-primary-hover);
            transform: translateY(-1px);
            box-shadow: var(--shadow-md);
        }
    }

    &--secondary {
        background: var(--color-secondary);
        color: white;

        &:hover:not(:disabled) {
            background: var(--color-secondary-hover);
            transform: translateY(-1px);
            box-shadow: var(--shadow-md);
        }
    }

    &--google {
        @apply border;
        background: var(--color-bg);
        border-color: var(--color-border);
        color: var(--color-text);

        &:hover:not(:disabled) {
            background: var(--color-bg-hover);
            border-color: var(--color-border-hover);
            transform: translateY(-1px);
            box-shadow: var(--shadow-md);
        }
    }

    &--outline {
        @apply border;
        background: transparent;
        border-color: var(--color-primary);
        color: var(--color-primary);

        &:hover:not(:disabled) {
            background: var(--color-primary);
            color: white;
        }
    }

    &--ghost {
        background: transparent;
        color: var(--color-text);

        &:hover:not(:disabled) {
            background: var(--color-bg-hover);
        }
    }

    // Sizes
    &--sm {
        @apply px-3 py-2 text-sm;
    }

    &--md {
        @apply px-4 py-3;
    }

    &--lg {
        @apply px-6 py-4 text-lg;
    }

    // Full width
    &--full {
        @apply w-full;
    }
}

.btn-icon {
    @apply w-5 h-5;
}

.loading-spinner {
    @apply w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin;
}
</style>
