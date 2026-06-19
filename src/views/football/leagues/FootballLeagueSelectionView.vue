<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-4 md:py-8 pb-24 md:pb-8">
    <div class="container mx-auto px-4 max-w-7xl">
      <div class="animate-page-enter">
        <FootballLeagueSelection />
      </div>
    </div>
  </div>
  <HomeMenu />
</template>

<script setup lang="ts">
import FootballLeagueSelection from "@/components/football/leagues/FootballLeagueSelection.vue";
import HomeMenu from "@/components/home/HomeMenu.vue";
</script>
