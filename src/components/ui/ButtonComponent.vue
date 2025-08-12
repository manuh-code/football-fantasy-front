<template>
    <button
        :type="type"
        :class="buttonClasses"
        :disabled="disabled || loading"
        @click="handleClick"
    >
        <v-icon v-if="loading" name="pr-spinner" class="w-4 h-4" animation="spin"/>
        <v-icon v-else-if="icon" :name="icon" class="w-4 h-4" />
        <span v-if="text">{{ text }}</span>
        <slot />
    </button>
</template>

<script lang="ts" setup>
import { computed, withDefaults, defineProps, defineEmits } from 'vue'

interface Props {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'cancel' | 'google'
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
    const baseClasses = 'inline-flex items-center justify-center gap-2 font-medium rounded-lg focus:outline-none focus:ring-2 transition-colors duration-200'
    
    // Size classes
    let sizeClasses = ''
    switch (props.size) {
        case 'sm':
            sizeClasses = 'px-3 py-2 text-sm'
            break
        case 'lg':
            sizeClasses = 'px-6 py-4 text-lg'
            break
        default:
            sizeClasses = 'px-4 py-2 text-sm sm:px-6 sm:py-2'
    }
    
    // Variant classes
    let variantClasses = ''
    switch (props.variant) {
        case 'primary':
            variantClasses = 'bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white focus:ring-emerald-500'
            break
        case 'secondary':
            variantClasses = 'bg-gray-600 hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 text-white focus:ring-gray-500'
            break
        case 'google':
            variantClasses = 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:ring-gray-500 shadow-sm hover:shadow-md transition-shadow'
            break
        case 'outline':
            variantClasses = 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:ring-gray-500'
            break
        case 'ghost':
            variantClasses = 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:ring-gray-500'
            break
        case 'cancel':
            variantClasses = 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:ring-gray-500'
            break
        default:
            variantClasses = 'bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white focus:ring-emerald-500'
    }
    
    // Full width
    const widthClasses = props.fullWidth ? 'w-full sm:w-auto' : 'w-auto'
    
    // Disabled classes
    const disabledClasses = props.disabled || props.loading ? 'disabled:cursor-not-allowed disabled:opacity-50' : ''
    
    return `${baseClasses} ${sizeClasses} ${variantClasses} ${widthClasses} ${disabledClasses}`
})

// Methods
const handleClick = (event: MouseEvent) => {
    if (!props.disabled && !props.loading) {
        emit('click', event)
    }
}
</script>

<style scoped>
/* Component uses Tailwind CSS classes directly */
</style>
