<template>
    <div class="relative" ref="dropdownRef">
        <!-- Avatar Button with enhanced design -->
        <button @click="toggleDropdown" @keydown="handleDropdownKeydown"
            class="group flex items-center gap-2 p-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl hover:border-blue-300 dark:hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/10 transform hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
            aria-label="User menu" :aria-expanded="isDropdownOpen">
            
            <!-- Avatar with status ring -->
            <div class="relative">
                <img v-if="avatarUrl" :src="avatarUrl" :alt="userInitials"
                    class="w-8 h-8 sm:w-9 sm:h-9 rounded-xl object-cover ring-2 ring-white dark:ring-gray-800 transition-all duration-300 group-hover:ring-blue-400" />
                <div v-else
                    class="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center text-xs sm:text-sm font-semibold ring-2 ring-white dark:ring-gray-800 transition-all duration-300 group-hover:ring-blue-400">
                    {{ userInitials }}
                </div>
                <!-- Online status indicator -->
                <div class="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-white dark:border-gray-800 rounded-full"></div>
            </div>
            
            <!-- Chevron with smooth animation -->
            <v-icon name="hi-solid-chevron-down"
                class="w-4 h-4 text-gray-400 dark:text-gray-500 transition-all duration-300 group-hover:text-blue-500"
                :class="{ 'rotate-180 text-blue-500': isDropdownOpen }" />
        </button>

        <!-- Enhanced Dropdown Menu -->
        <Transition name="dropdown">
            <div v-if="isDropdownOpen"
                class="absolute right-0 top-full mt-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl shadow-gray-900/10 dark:shadow-black/25 min-w-56 sm:min-w-64 overflow-hidden z-60 backdrop-blur-sm"
                role="menu">
                
                <!-- User info header -->
                <div class="px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 border-b border-gray-200 dark:border-gray-600">
                    <div class="flex items-center gap-3">
                        <img v-if="avatarUrl" :src="avatarUrl" :alt="userInitials"
                            class="w-10 h-10 rounded-lg object-cover" />
                        <div v-else
                            class="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center text-sm font-semibold">
                            {{ userInitials }}
                        </div>
                        <div class="flex-1">
                            <p class="text-sm font-semibold text-gray-900 dark:text-white">{{ userName }}</p>
                            <p class="text-xs text-gray-500 dark:text-gray-400">{{ userEmail }}</p>
                        </div>
                    </div>
                </div>

                <!-- Menu items -->
                <div class="py-2">
                    <!-- View Profile -->
                    <button @click="handleViewProfile"
                        class="w-full flex items-center gap-3 px-4 py-3 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 focus:outline-none focus:bg-blue-50 dark:focus:bg-gray-700 group"
                        role="menuitem">
                        <div class="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors duration-200">
                            <v-icon name="hi-solid-user" class="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div class="flex-1">
                            <p class="font-medium">View Profile</p>
                            <p class="text-xs text-gray-500 dark:text-gray-400">Manage your account</p>
                        </div>
                    </button>

                    <!-- Change Password -->
                    <button @click="handleChangePassword"
                        class="w-full flex items-center gap-3 px-4 py-3 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-amber-50 dark:hover:bg-gray-700 hover:text-amber-600 dark:hover:text-amber-400 transition-all duration-200 focus:outline-none focus:bg-amber-50 dark:focus:bg-gray-700 group"
                        role="menuitem">
                        <div class="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center group-hover:bg-amber-200 dark:group-hover:bg-amber-900/50 transition-colors duration-200">
                            <v-icon name="hi-solid-key" class="w-4 h-4 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div class="flex-1">
                            <p class="font-medium">Change Password</p>
                            <p class="text-xs text-gray-500 dark:text-gray-400">Update your password</p>
                        </div>
                    </button>

                    <!-- Divider -->
                    <hr class="border-gray-200 dark:border-gray-600 my-2" />

                    <!-- Logout -->
                    <button @click="handleLogout"
                        class="w-full flex items-center gap-3 px-4 py-3 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-red-300 transition-all duration-200 focus:outline-none focus:bg-red-50 dark:focus:bg-red-900/20 group"
                        role="menuitem">
                        <div class="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center group-hover:bg-red-200 dark:group-hover:bg-red-900/50 transition-colors duration-200">
                            <v-icon name="hi-solid-logout" class="w-4 h-4 text-red-600 dark:text-red-400" />
                        </div>
                        <div class="flex-1">
                            <p class="font-medium">Sign Out</p>
                            <p class="text-xs text-gray-500 dark:text-gray-400">Log out of your account</p>
                        </div>
                    </button>
                </div>
            </div>
        </Transition>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, defineProps, defineEmits } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth/useAuthStore'

// Props
interface Props {
    avatarUrl?: string | null
    userInitials?: string
    userName?: string
    userEmail?: string
}

defineProps<Props>()

// Emits
const emit = defineEmits<{
    logout: []
    viewProfile: []
    changePassword: []
}>()

// Router and stores
const router = useRouter()
const authStore = useAuthStore()

// Dropdown state
const isDropdownOpen = ref(false)
const dropdownRef = ref<HTMLElement>()

// Methods
function toggleDropdown() {
    isDropdownOpen.value = !isDropdownOpen.value
}

function closeDropdown() {
    isDropdownOpen.value = false
}

function handleViewProfile() {
    emit('viewProfile')
    router.push({ name: 'profile' })
    closeDropdown()
}

function handleChangePassword() {
    emit('changePassword')
    // Could navigate to change password page or open modal
    closeDropdown()
}

async function handleLogout() {
    emit('logout')
    await authStore.logout()
    closeDropdown()
    router.push('/')
}

// Keyboard support
function handleDropdownKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
        closeDropdown()
    }
}

// Click outside to close dropdown
function handleClickOutside(event: MouseEvent) {
    if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
        closeDropdown()
    }
}

onMounted(() => {
    document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
})
</script>

<style lang="scss" scoped>
// Enhanced dropdown transition animations
.dropdown-enter-active {
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.dropdown-leave-active {
    transition: all 0.2s ease-in-out;
}

.dropdown-enter-from {
    opacity: 0;
    transform: translateY(-0.75rem) scale(0.9);
}

.dropdown-leave-to {
    opacity: 0;
    transform: translateY(-0.25rem) scale(0.95);
}

.dropdown-enter-to,
.dropdown-leave-from {
    opacity: 1;
    transform: translateY(0) scale(1);
}

// Smooth hover effects for menu items
.group:hover .ring-2 {
    --tw-ring-opacity: 1;
    --tw-ring-color: rgb(59 130 246 / var(--tw-ring-opacity));
}

// Custom gradient animations
@keyframes shimmer {
    0% {
        background-position: -200px 0;
    }
    100% {
        background-position: calc(200px + 100%) 0;
    }
}

.shimmer {
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
    background-size: 200px 100%;
    animation: shimmer 2s infinite;
}

// Accessibility: Respect user's motion preferences
@media (prefers-reduced-motion: reduce) {
    .dropdown-enter-active,
    .dropdown-leave-active {
        transition: opacity 0.1s;
    }
    
    .dropdown-enter-from,
    .dropdown-leave-to {
        transform: none;
    }
    
    // Disable all transforms and transitions for users who prefer reduced motion
    * {
        transition: none !important;
        transform: none !important;
        animation: none !important;
    }
}
</style>
