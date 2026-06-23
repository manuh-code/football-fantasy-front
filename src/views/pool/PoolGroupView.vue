<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-4 md:py-8 pb-28">
    <div class="container mx-auto px-4 max-w-3xl">
      <!-- Pool Group Component -->
      <div class="animate-page-enter">
        <PoolGroupComponent :pool-uuid="poolUuid" :active-tab="activeTab" />
      </div>
    </div>

    <!-- Bottom navigation: My Pools / Info / Predictions / Standings -->
    <BottomNavBar
      :items="items"
      :active-key="activeTab"
      aria-label="Pool group navigation"
      @select="onSelect"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import BottomNavBar, { type BottomNavItem } from "@/components/ui/BottomNavBar.vue";
import PoolGroupComponent from "@/components/pool/PoolGroupComponent.vue";

// Set page title
document.title = "Pool Group - Football Fantasy";

const route = useRoute();
const router = useRouter();

const poolUuid = computed(() => route.params.uuid as string);
const activeTab = ref("info");

// "My Pools" is a neutral shortcut (no accent → never highlighted) that navigates
// back to the pools list; the rest switch the active tab.
const items: BottomNavItem[] = [
  { key: "myPools", label: "My Pools", icon: "hi-solid-collection" },
  { key: "info", label: "Info", icon: "hi-solid-information-circle", accent: "emerald" },
  { key: "predictions", label: "Predictions", icon: "hi-solid-clipboard-list", accent: "blue" },
  { key: "standings", label: "Standings", icon: "bi-trophy-fill", accent: "amber" },
];

const onSelect = (key: string) => {
  if (key === "myPools") {
    router.push({ name: "pools" });
    return;
  }
  activeTab.value = key;
};
</script>
