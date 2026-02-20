<template>
    <BottomSheet
        :is-visible="isVisible"
        title="Join Private League"
        subtitle="Enter the password to join this league"
        icon="hi-solid-lock-closed"
        icon-variant="emerald"
        size="auto"
        :dismissible="!isLoading"
        @close="closeModal"
    >
        <!-- League Info Card -->
        <div v-if="league" class="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3.5 mb-4">
            <div class="flex items-center gap-3">
                <div class="flex-shrink-0">
                    <div v-if="league.image_path" class="h-12 w-12 rounded-xl overflow-hidden">
                        <img :src="league.image_path" :alt="league.name" class="h-full w-full object-cover" />
                    </div>
                    <div v-else class="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                        <v-icon name="bi-trophy-fill" class="h-6 w-6 text-white" />
                    </div>
                </div>
                <div class="flex-1 min-w-0">
                    <h4 class="text-sm font-bold text-gray-900 dark:text-white truncate">{{ league.name }}</h4>
                    <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">
                        {{ league.description || 'No description provided.' }}
                    </p>
                    <div class="flex items-center gap-3 mt-1.5 text-xs text-gray-400 dark:text-gray-500">
                        <span class="flex items-center gap-1">
                            <v-icon name="hi-solid-users" class="h-3 w-3" />
                            {{ league.participants_count }}
                        </span>
                        <span class="flex items-center gap-1">
                            <v-icon name="hi-solid-calendar" class="h-3 w-3" />
                            {{ formatDate(league.started_at) }}
                        </span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Password Input -->
        <div v-if="league?.is_private">
            <label for="league-password" class="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">
                Password
            </label>
            <div class="relative">
                <v-icon name="hi-solid-lock-closed" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                    id="league-password"
                    v-model="leaguePassword"
                    type="password"
                    placeholder="Enter league password..."
                    required
                    :class="[
                        'w-full pl-10 pr-4 py-3 rounded-xl text-sm border-0 transition-all',
                        'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white',
                        'placeholder-gray-400 dark:placeholder-gray-500',
                        'focus:ring-2 focus:bg-white dark:focus:bg-gray-700',
                        passwordError
                            ? 'ring-2 ring-red-500/50 bg-red-50 dark:bg-red-900/10'
                            : 'focus:ring-emerald-500/50'
                    ]"
                />
            </div>
            <!-- Error -->
            <div v-if="passwordError" class="flex items-center gap-1.5 mt-2">
                <v-icon name="hi-solid-exclamation-circle" class="h-3.5 w-3.5 text-red-500 flex-shrink-0" />
                <p class="text-xs text-red-600 dark:text-red-400">{{ passwordError }}</p>
            </div>
        </div>

        <!-- Footer Actions -->
        <template #footer>
            <div class="flex gap-3">
                <button
                    @click="closeModal"
                    :disabled="isLoading"
                    class="flex-1 py-3 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 active:scale-[0.98] transition-all disabled:opacity-50"
                >
                    Cancel
                </button>
                <button
                    @click="handleJoin"
                    :disabled="isLoading"
                    class="flex-1 py-3 rounded-xl text-sm font-semibold text-white bg-emerald-600 active:scale-[0.98] shadow-sm shadow-emerald-500/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    <div v-if="isLoading" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <v-icon v-else name="hi-solid-user" class="w-4 h-4" />
                    Join League
                </button>
            </div>
        </template>
    </BottomSheet>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import BottomSheet from '@/components/ui/BottomSheet.vue'
import type { FantasyLeaguesResponse } from '@/interfaces/fantasy/leagues/FantasyLeaguesResponse'

interface Props {
    isVisible?: boolean
    league?: FantasyLeaguesResponse | null
    isLoading?: boolean
    passwordError?: string
}

const props = withDefaults(defineProps<Props>(), {
    isVisible: false,
    league: null,
    isLoading: false,
    passwordError: ''
})

const emit = defineEmits<{
    close: []
    join: [joinData: { league: FantasyLeaguesResponse; password?: string }]
}>()

const leaguePassword = ref('')

watch(() => props.isVisible, (newValue) => {
    if (!newValue) {
        leaguePassword.value = ''
    }
})

watch(() => props.passwordError, (newError) => {
    if (newError) {
        setTimeout(() => {
            const input = document.getElementById('league-password')
            input?.focus()
        }, 100)
    }
})

const closeModal = () => {
    if (!props.isLoading) {
        emit('close')
    }
}

const handleJoin = () => {
    if (!props.league) return
    emit('join', {
        league: props.league,
        password: props.league.is_private ? leaguePassword.value : undefined
    })
}

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    })
}
</script>

<style scoped>
.line-clamp-1 {
    display: -webkit-box;
    -webkit-line-clamp: 1;
    line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
}
</style>
