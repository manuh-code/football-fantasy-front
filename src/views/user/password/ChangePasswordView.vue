<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-4 md:py-8">
    <div class="container mx-auto px-4 max-w-7xl">
      <!-- Page Header -->
      <PageHeader
        back-text="Back"
        breadcrumb-to="/profile"
        breadcrumb-text="Profile"
        current-page-text="Change Password"
      />

      <!-- Change Password Component -->
      <div class="animate-page-enter">
        <ChangePasswordComponent />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import ChangePasswordComponent from '@/components/password/ChangePasswordComponent.vue'
import { PageHeader } from '@/components/ui'

// Set page title
document.title = 'Change Password - Football Fantasy'
</script>

<style scoped>
/* Additional custom styles if needed */
</style>
