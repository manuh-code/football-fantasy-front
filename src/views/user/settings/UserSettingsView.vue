<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-4 md:py-8 pb-24 md:pb-8">
    <div class="container mx-auto px-4 max-w-lg">
      <div class="animate-page-enter">
        <UserSettingsComponent />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import UserSettingsComponent from '@/components/user/settings/UserSettingsComponent.vue'

document.title = 'Settings - Football Fantasy'
</script>
