<template>
   <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-4 md:py-8">
        <div class="container mx-auto px-4 max-w-7xl">
            <!-- Page Header Component -->
            <PageHeader
                title="Join Fantasy League"
                description="Find and join exciting fantasy football leagues to compete with other players around the world."
                back-text="Back to My Leagues"
                breadcrumb-to="/user-fantasy-leagues"
                breadcrumb-text="Fantasy Leagues"
                current-page-text="Join League"
            />

            <!-- Join Fantasy League Component -->
            <JoinFantasyLeagueComponent />
        </div>
    </div>
</template>

<script setup lang="ts">
import PageHeader from '@/components/ui/PageHeader.vue'
import JoinFantasyLeagueComponent from '@/components/user/fantasy/leagues/JoinFantasyLeagueComponent.vue'
</script>
