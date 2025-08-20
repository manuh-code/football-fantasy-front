<template>
    <div class="group bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl hover:border-emerald-300 dark:hover:border-emerald-600 transform hover:-translate-y-1 transition-all duration-300">
        
        <!-- League Header with Image/Gradient -->
        <div class="relative h-40 overflow-hidden">
            <div v-if="league.image_path" class="relative h-full">
                <img :src="league.image_path" 
                    :alt="league.name"
                    class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    @error="onImageError" />
                <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
            </div>
            <div v-else class="h-full bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 relative">
                <div class="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                <div class="absolute inset-0 flex items-center justify-center">
                    <v-icon name="bi-trophy-fill" class="w-12 h-12 text-white/80" />
                </div>
            </div>
            
            <!-- Status Badges -->
            <div class="absolute top-3 right-3 flex flex-col gap-2">
                <span v-if="league.isAdmin" 
                    class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg">
                    <v-icon name="hi-solid-star" class="w-3 h-3 mr-1" />
                    Admin
                </span>
                <span v-else-if="league.isMember" 
                    class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg">
                    <v-icon name="hi-solid-user" class="w-3 h-3 mr-1" />
                    Member
                </span>
            </div>
            
            <!-- Privacy Badge -->
            <div class="absolute top-3 left-3">
                <span v-if="league.is_private" 
                    class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-900/70 text-white border border-white/20 backdrop-blur-sm">
                    <v-icon name="hi-solid-lock-closed" class="w-3 h-3 mr-1" />
                    Private
                </span>
                <span v-else 
                    class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-600/80 text-white border border-white/20 backdrop-blur-sm">
                    <v-icon name="hi-solid-globe-alt" class="w-3 h-3 mr-1" />
                    Public
                </span>
            </div>
            
            <!-- League Name Overlay -->
            <div class="absolute bottom-4 left-4 right-4">
                <h3 class="text-xl font-bold text-white drop-shadow-lg mb-1 line-clamp-1">{{ league.name }}</h3>
                <div class="flex items-center text-white/90 text-sm">
                    <v-icon name="hi-solid-calendar" class="w-4 h-4 mr-1" />
                    <span>{{ formatDate(league.started_at) }}</span>
                </div>
            </div>
        </div>

        <!-- League Content -->
        <div class="p-6">
            <!-- Description -->
            <p class="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2 leading-relaxed">
                {{ league.description || 'No description provided for this league.' }}
            </p>

            <!-- Stats Grid -->
            <div class="grid grid-cols-2 gap-4 mb-6">
                <div class="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 rounded-lg p-3 text-center border border-emerald-200 dark:border-emerald-700/50">
                    <div class="flex items-center justify-center mb-1">
                        <v-icon name="hi-solid-users" class="w-4 h-4 text-emerald-600 dark:text-emerald-400 mr-1" />
                    </div>
                    <p class="text-2xl font-bold text-emerald-700 dark:text-emerald-300">{{ league.participants_count }}</p>
                    <p class="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Participants</p>
                </div>
                <div class="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-3 text-center border border-blue-200 dark:border-blue-700/50">
                    <div class="flex items-center justify-center mb-1">
                        <v-icon name="hi-solid-user-group" class="w-4 h-4 text-blue-600 dark:text-blue-400 mr-1" />
                    </div>
                    <p class="text-2xl font-bold text-blue-700 dark:text-blue-300">{{ league.members_count }}</p>
                    <p class="text-xs text-blue-600 dark:text-blue-400 font-medium">Members</p>
                </div>
            </div>

            <!-- Action Buttons -->
            <div class="space-y-4">
                <!-- Primary Action Row -->
                <div class="flex gap-3">
                    <!-- View Details Button (always shown) -->
                    <ButtonComponent
                        variant="secondary"
                        size="sm"
                        :full-width="true"
                        @click="$emit('viewDetails', league)"
                        class="transition-colors duration-300 flex-1"
                    >
                        <v-icon name="hi-solid-eye" class="w-4 h-4 mr-2" />
                        View Details
                    </ButtonComponent>

                    <!-- Join Button (conditional) -->
                    <ButtonComponent
                        v-if="showJoinButton && !league.isMember"
                        variant="primary"
                        size="sm"
                        :full-width="true"
                        @click="$emit('join', league)"
                        class="group-hover:bg-emerald-600 group-hover:border-emerald-600 transition-colors duration-300 flex-1"
                    >
                        <v-icon name="hi-solid-user" class="w-4 h-4 mr-2" />
                        {{ league.is_private ? 'Request' : 'Join' }}
                    </ButtonComponent>
                </div>

                <!-- Secondary Action Row -->
                <div v-if="league.isMember || league.isAdmin">
                    <!-- Already Member Button -->
                    <ButtonComponent
                        v-if="league.isMember && !league.isAdmin"
                        variant="outline"
                        size="sm"
                        :full-width="true"
                        disabled
                        class="cursor-not-allowed"
                    >
                        <v-icon name="hi-solid-check-circle" class="w-4 h-4 mr-2 text-green-500" />
                        Already Joined
                    </ButtonComponent>

                    <!-- Manage Button (for admins) -->
                    <ButtonComponent
                        v-if="league.isAdmin"
                        variant="primary"
                        size="sm"
                        :full-width="true"
                        @click="$emit('manage', league)"
                        class="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 border-yellow-500 hover:border-yellow-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                        <v-icon name="hi-solid-cog" class="w-4 h-4 mr-2" />
                        Manage League
                    </ButtonComponent>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { ButtonComponent } from '@/components/ui'
import type { FantasyLeaguesResponse } from '@/interfaces/fantasy/leagues/FantasyLeaguesResponse'

export default defineComponent({
    name: 'FantasyLeagueCard',
    components: {
        ButtonComponent
    },
    props: {
        league: {
            type: Object as PropType<FantasyLeaguesResponse>,
            required: true
        },
        showJoinButton: {
            type: Boolean,
            default: false
        },
        showViewButton: {
            type: Boolean,
            default: true
        },
        showManageButton: {
            type: Boolean,
            default: true
        }
    },
    emits: ['join', 'viewDetails', 'manage'],
    setup() {
        // Methods
        const formatDate = (dateString: string) => {
            const date = new Date(dateString)
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            })
        }

        const onImageError = (event: Event) => {
            const target = event.target as HTMLImageElement
            target.style.display = 'none'
        }

        return {
            formatDate,
            onImageError
        }
    }
})
</script>

<style scoped>
/* Line clamp utility for description */
.line-clamp-1 {
    display: -webkit-box;
    -webkit-line-clamp: 1;
    line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

/* Custom hover effects for league cards */
.group:hover .group-hover\:scale-110 {
    transform: scale(1.1);
}

/* Backdrop blur effect for badges */
.backdrop-blur-sm {
    backdrop-filter: blur(4px);
}

/* Accessibility: Respect user's motion preferences */
@media (prefers-reduced-motion: reduce) {
    .group:hover .group-hover\:scale-110,
    .transform,
    .transition-all,
    .transition-transform,
    .transition-colors {
        transition: none !important;
        transform: none !important;
    }
}
</style>
