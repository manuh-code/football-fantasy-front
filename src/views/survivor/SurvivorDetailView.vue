<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-4 md:py-8 pb-28">
    <div class="container mx-auto px-4 max-w-3xl">
      <!-- Secondary tabs: Survivors / My Picks / Standings (not available yet) -->
      <TopTabsBar
        :items="items"
        :active-key="activeTab"
        :aria-label="$t('survivor.nav.aria')"
        @select="onSelect"
      />

      <div class="animate-page-enter">
        <SurvivorMyPicksComponent v-if="activeTab === 'mypicks'" :survivor-uuid="survivorUuid" />
        <SurvivorDetailComponent v-else :survivor-uuid="survivorUuid" />
      </div>
    </div>

    <!-- Fixed bottom navigation; Play stays selected here and returns to the
         Gaming screen — see HomeMenu. -->
    <HomeMenu />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import SurvivorDetailComponent from "@/components/survivor/SurvivorDetailComponent.vue";
import SurvivorMyPicksComponent from "@/components/survivor/SurvivorMyPicksComponent.vue";
import HomeMenu from "@/components/home/HomeMenu.vue";
import TopTabsBar from "@/components/ui/TopTabsBar.vue";
import type { BottomNavItem } from "@/components/ui/BottomNavBar.vue";

const { t } = useI18n();
const route = useRoute();
const router = useRouter();

const survivorUuid = computed(() => route.params.uuid as string);

// Set page title
document.title = t("survivor.detail.docTitle");

// "My Picks" is the default tab: entering a survivor lands straight on the
// user's pick timeline. "Standings" is disabled until the feature ships.
const activeTab = ref("mypicks");

// "My Survivor" is a neutral shortcut (no accent → never highlighted) back to
// the survivors list; the rest switch the active tab.
const items = computed<BottomNavItem[]>(() => [
  { key: "survivors", label: t("survivor.nav.survivors"), icon: "hi-solid-collection" },
  { key: "mypicks", label: t("survivor.nav.mypicks"), icon: "hi-solid-check-circle", accent: "red" },
  { key: "standings", label: t("survivor.nav.standings"), icon: "bi-trophy-fill", disabled: true },
]);

const onSelect = (key: string) => {
  if (key === "survivors") {
    router.push({ name: "survivor" });
    return;
  }
  // Standings is disabled, so only "mypicks" can be selected for now.
  activeTab.value = key;
};
</script>
