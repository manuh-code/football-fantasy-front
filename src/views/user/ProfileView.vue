<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-4 md:py-8">
    <div class="container mx-auto px-4 max-w-7xl">
      <!-- Page Header -->
      <div class="mb-6 md:mb-8">
        <nav class="text-sm text-gray-600 dark:text-gray-400 mb-4">
          <router-link 
            to="/dashboard" 
            class="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
          >
            Dashboard
          </router-link>
          <span class="mx-2">/</span>
          <span class="text-gray-900 dark:text-white font-medium">Profile</span>
        </nav>
        
        <h1 class="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">User Profile</h1>
        <p class="text-gray-600 dark:text-gray-400 text-base md:text-lg">
          Manage and view your Football Fantasy account information
        </p>
      </div>

      <!-- Profile Component -->
      <ProfileComponent />
    </div>
  </div>
</template>

<script setup lang="ts">
import ProfileComponent from '@/components/user/ProfileComponent.vue'
</script>

<style scoped>
/* Additional view-specific styles if needed */
</style>
