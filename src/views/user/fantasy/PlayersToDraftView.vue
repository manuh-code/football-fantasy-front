
<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-4 md:py-8 pb-20 md:pb-8">
    <div class="container mx-auto px-4 max-w-7xl">
      <!-- Tab Menu - Desktop Only -->
      <div class="hidden md:block mb-6">
        <BottomMenuFantasyLeague 
          :active-tab="activeTab"
          @update:active-tab="handleTabChange"
        />
      </div>

      <!-- Players to Draft Content -->
      <PlayersToDraftComponent :fantasy-league-uuid="fantasyLeagueUuid" />
    </div>

    <!-- Bottom Menu - Mobile Only -->
    <div class="md:hidden">
      <BottomMenuFantasyLeague 
        :active-tab="activeTab"
        @update:active-tab="handleTabChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PlayersToDraftComponent from '@/components/user/fantasy/PlayersToDraftComponent.vue'
import { BottomMenuFantasyLeague } from '@/components/ui'

const route = useRoute()
const router = useRouter()

const fantasyLeagueUuid = computed(() => route.params.uuid as string)
const activeTab = ref('myteam') // Draft is part of team building

// Handle tab navigation
function handleTabChange(tab: string) {
  activeTab.value = tab
  
  // Navigate to fantasy league detail with the selected tab as query param
  router.push({ 
    name: 'fantasyLeagueDetail', 
    params: { uuid: fantasyLeagueUuid.value },
    query: { tab: tab }
  })
}
</script>
