<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-4 md:py-8">
    <div class="container mx-auto px-4 max-w-7xl">
      <!-- Page Header -->
      <PageHeader
        title="Create Fantasy League"
        description="Set up a new fantasy football league and invite your friends to compete."
        back-text="Back to Leagues"
        breadcrumb-to="/user-fantasy-leagues"
        breadcrumb-text="My Leagues"
        current-page-text="Create League"
      />

      <!-- Fantasy League Create Component -->
      <FantasyLeagueCreate />
    </div>
  </div>
</template>

<script setup lang="ts">
import FantasyLeagueCreate from '@/components/fantasy/FantasyLeagueCreate.vue'
import { PageHeader } from '@/components/ui'
</script>
