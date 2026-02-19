<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-4 md:py-8 pb-24 md:pb-8">
    <div class="container mx-auto px-4 max-w-7xl">
      <!-- Page Header -->
      <PageHeader
        back-text="Back"
        breadcrumb-to="/profile"
        breadcrumb-text="Profile"
        current-page-text="Favorite Team"
      />

      <!-- Favorite Team Component -->
      <div class="animate-page-enter">
        <FavoriteTeamComponent />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import FavoriteTeamComponent from '@/components/user/favoriteTeam/FavoriteTeamComponent.vue'
import { PageHeader } from '@/components/ui'
</script>

<style scoped>
/* Page-specific styles if needed */
</style>
