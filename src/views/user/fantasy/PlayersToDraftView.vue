
<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-4 md:py-8 pb-8">
    <div class="container mx-auto px-4 max-w-7xl">
      <!-- Players to Draft Content -->
      <PlayersToDraftComponent :fantasy-league-uuid="fantasyLeagueUuid" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import PlayersToDraftComponent from '@/components/user/fantasy/PlayersToDraftComponent.vue'

const route = useRoute()

const fantasyLeagueUuid = computed(() => route.params.uuid as string)
</script>
