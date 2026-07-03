<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-4 md:py-8 pb-28">
    <div class="container mx-auto px-4 max-w-7xl mb-24 md:mb-0">
      <div class="animate-page-enter">
        <SurvivorComponent />
      </div>
    </div>

    <!-- Bottom navigation: Home / Gaming / My Survivor -->
    <BottomNavBar
      :items="items"
      active-key="survivors"
      :aria-label="$t('survivor.nav.aria')"
      @select="onSelect"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import SurvivorComponent from "@/components/survivor/SurvivorComponent.vue";
import BottomNavBar, { type BottomNavItem } from "@/components/ui/BottomNavBar.vue";

const { t } = useI18n();
const router = useRouter();

// Set page title
document.title = t("survivor.docTitle");

const items = computed<BottomNavItem[]>(() => [
  { key: "home", label: t("home.nav.home"), icon: "hi-solid-home", accent: "emerald" },
  { key: "gaming", label: t("home.nav.gaming"), icon: "bi-trophy-fill", accent: "emerald" },
  { key: "survivors", label: t("survivor.nav.survivors"), icon: "hi-solid-shield-check", accent: "red" },
]);

const onSelect = (key: string) => {
  switch (key) {
    case "home":
      router.push({ name: "home" });
      break;
    case "gaming":
      router.push({ name: "gaming" });
      break;
    case "survivors":
      // Already on the survivor list.
      break;
  }
};
</script>
