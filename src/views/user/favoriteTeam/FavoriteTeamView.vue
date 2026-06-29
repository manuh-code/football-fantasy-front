<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-4 md:py-8 pb-28">
    <div class="container mx-auto px-4 max-w-3xl">
      <!-- Favorite Team Component -->
      <div class="animate-page-enter">
        <FavoriteTeamComponent />
      </div>
    </div>
  </div>
  <HomeMenu />
</template>

<script setup lang="ts">
import FavoriteTeamComponent from '@/components/user/favoriteTeam/FavoriteTeamComponent.vue'
import HomeMenu from '@/components/home/HomeMenu.vue'
</script>

<style scoped>
/* Page-specific styles if needed */
</style>
