<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-4 md:py-8">
    <div class="container mx-auto px-4 max-w-7xl">
      <!-- Page Header -->
      <PageHeader
        back-text="Back"
        breadcrumb-to="/dashboard"
        breadcrumb-text="Dashboard"
        current-page-text="Profile"
      />

      <!-- Profile Component -->
      <ProfileComponent />
    </div>
  </div>
</template>

<script setup lang="ts">
import ProfileComponent from '@/components/user/ProfileComponent.vue'
import { PageHeader } from '@/components/ui'
</script>

<style scoped>
/* Additional view-specific styles if needed */
</style>
