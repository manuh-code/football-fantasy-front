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
      :aria-label="$t('pool.group.nav')"
      @select="onSelect"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import BottomNavBar, { type BottomNavItem } from "@/components/ui/BottomNavBar.vue";
import PoolGroupComponent from "@/components/pool/PoolGroupComponent.vue";

const { t } = useI18n();

// Set page title
document.title = t("pool.group.docTitle");

const route = useRoute();
const router = useRouter();

const poolUuid = computed(() => route.params.uuid as string);
const activeTab = ref("info");

// "My Pools" is a neutral shortcut (no accent → never highlighted) that navigates
// back to the pools list; the rest switch the active tab.
const items = computed<BottomNavItem[]>(() => [
  { key: "myPools", label: t("pool.group.tabs.myPools"), icon: "hi-solid-collection" },
  { key: "info", label: t("pool.group.tabs.info"), icon: "hi-solid-information-circle", accent: "emerald" },
  { key: "predictions", label: t("pool.group.tabs.predictions"), icon: "hi-solid-clipboard-list", accent: "blue" },
  { key: "standings", label: t("pool.group.tabs.standings"), icon: "bi-trophy-fill", accent: "amber" },
]);

const onSelect = (key: string) => {
  if (key === "myPools") {
    router.push({ name: "pools" });
    return;
  }
  activeTab.value = key;
};
</script>
