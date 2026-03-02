<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-950 py-4 md:py-8 pb-24 md:pb-8">
    <div class="container mx-auto px-4 max-w-7xl">
      <MyFantasyTeamComponent />
    </div>
  </div>
</template>

<script setup lang="ts">
import MyFantasyTeamComponent from '@/components/user/fantasy/MyFantasyTeamComponent.vue'

// Set page title
document.title = 'My Fantasy Team - Football Fantasy'
</script>
