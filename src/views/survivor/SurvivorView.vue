<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-4 md:py-8 pb-28">
    <div class="container mx-auto px-4 max-w-7xl mb-24 md:mb-0">
      <!-- Secondary section tabs: global destinations live in the fixed nav -->
      <TopTabsBar :items="tabItems" active-key="survivors" :aria-label="$t('survivor.nav.aria')" />

      <div class="animate-page-enter">
        <SurvivorComponent />
      </div>
    </div>

    <!-- Fixed bottom navigation (Home / Leagues / Play / Following); Play
         stays selected here and returns to the Gaming screen — see HomeMenu. -->
    <HomeMenu />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import SurvivorComponent from "@/components/survivor/SurvivorComponent.vue";
import HomeMenu from "@/components/home/HomeMenu.vue";
import TopTabsBar from "@/components/ui/TopTabsBar.vue";
import type { BottomNavItem } from "@/components/ui/BottomNavBar.vue";

const { t } = useI18n();

// Set page title
document.title = t("survivor.docTitle");

// Section tab shown at the top; the list has no other options of its own.
const tabItems = computed<BottomNavItem[]>(() => [
  { key: "survivors", label: t("survivor.nav.survivors"), icon: "hi-solid-shield-check", accent: "red" },
]);
</script>
