<template>
  <div class="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 py-4 md:py-8 pb-24 md:pb-8">
    <div class="mx-auto px-4 max-w-5xl">
      <FantasyTeamUser :fantasy-league-uuid="uuid" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import FantasyTeamUser from '@/components/fantasy/team/FantasyTeamUser.vue'

const route = useRoute()
const uuid = route.params.uuid as string
</script>
