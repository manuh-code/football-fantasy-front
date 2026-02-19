<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-4 md:py-8 pb-24 md:pb-8">
    <div class="container mx-auto px-4 max-w-7xl">
      <!-- Favorite Team Component -->
      <div class="animate-page-enter">
        <FavoriteTeamComponent />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import FavoriteTeamComponent from '@/components/user/favoriteTeam/FavoriteTeamComponent.vue'
</script>

<style scoped>
/* Page-specific styles if needed */
</style>
