<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-4 md:py-8 pb-20 md:pb-8">
    <div class="container mx-auto px-4 max-w-7xl">
      <!-- Page Header -->
      <PageHeader
        back-text="Back"
        breadcrumb-to="/dashboard"
        breadcrumb-text="Dashboard"
        current-page-text="My Fantasy Team"
      />

      <!-- My Fantasy Team Component -->
      <div class="animate-page-enter">
        <MyFantasyTeamComponent />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { PageHeader } from '@/components/ui'
import MyFantasyTeamComponent from '@/components/user/fantasy/MyFantasyTeamComponent.vue'

// Set page title
document.title = 'My Fantasy Team - Football Fantasy'
</script>

<style scoped>
/* Animación de entrada */
@keyframes page-enter {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-page-enter {
  animation: page-enter 0.3s ease-out;
}
</style>
