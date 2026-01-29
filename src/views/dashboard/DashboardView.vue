<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-4 md:py-8">
    <div class="container mx-auto px-4 max-w-7xl">
      <!-- Page Header -->
      <PageHeader
        back-text="Back"
        breadcrumb-to="/"
        breadcrumb-text="Home"
        current-page-text="Dashboard"
      />

      <!-- Dashboard Component -->
      <DashboardComponent />
    </div>
  </div>
</template>

<script lang="ts" setup>
import DashboardComponent from '@/components/dashboard/DashboardComponent.vue';
import { PageHeader } from '@/components/ui'
</script>

<style scoped>

</style>
