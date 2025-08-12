<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-4 md:py-8">
    <div class="container mx-auto px-4 max-w-7xl">
      <!-- Page Header -->
      <PageHeader
        title="My Fantasy Leagues"
        description="View and manage your fantasy football leagues and track your performance"
        back-text="Back to Dashboard"
        breadcrumb-to="/dashboard"
        breadcrumb-text="Dashboard"
        current-page-text="Fantasy Leagues"
      />

      <!-- User Fantasy League Component -->
      <div class="animate-page-enter">
        <UserFantasyLeagueComponent />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import UserFantasyLeagueComponent from '@/components/user/fantasy/UserFantasyLeagueComponent.vue'
import { PageHeader } from '@/components/ui'

// Set page title
document.title = 'My Fantasy Leagues - Football Fantasy'
</script>

<style scoped>
/* Additional view-specific styles if needed */
</style>