<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-4 md:py-8 pb-28">
    <div class="container mx-auto px-4 max-w-3xl">
      <div class="animate-page-enter">
        <SurvivorMyPicksComponent v-if="activeTab === 'mypicks'" :survivor-uuid="survivorUuid" />
        <SurvivorDetailComponent v-else :survivor-uuid="survivorUuid" />
      </div>
    </div>

    <!-- Bottom navigation: Picks / Standings (standings not available yet) -->
    <BottomNavBar
      :items="items"
      :active-key="activeTab"
      :aria-label="$t('survivor.nav.aria')"
      @select="onSelect"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import SurvivorDetailComponent from "@/components/survivor/SurvivorDetailComponent.vue";
import SurvivorMyPicksComponent from "@/components/survivor/SurvivorMyPicksComponent.vue";
import BottomNavBar, { type BottomNavItem } from "@/components/ui/BottomNavBar.vue";

const { t } = useI18n();
const route = useRoute();
const router = useRouter();

const survivorUuid = computed(() => route.params.uuid as string);

// Set page title
document.title = t("survivor.detail.docTitle");

// "Picks" is the default (and, for now, only) available tab. "Standings" is
// disabled until the feature ships.
const activeTab = ref("picks");

// "My Survivor" is a neutral shortcut (no accent → never highlighted) that
// navigates back to the survivor list; the rest switch the active tab.
const items = computed<BottomNavItem[]>(() => [
  { key: "survivors", label: t("survivor.nav.survivors"), icon: "hi-solid-collection" },
  { key: "picks", label: t("survivor.nav.picks"), icon: "hi-solid-clipboard-list", accent: "red" },
  { key: "mypicks", label: t("survivor.nav.mypicks"), icon: "hi-solid-check-circle", accent: "red" },
  { key: "standings", label: t("survivor.nav.standings"), icon: "bi-trophy-fill", disabled: true },
]);

const onSelect = (key: string) => {
  if (key === "survivors") {
    router.push({ name: "survivor" });
    return;
  }
  // Standings is disabled, so only "picks" can be selected for now.
  activeTab.value = key;
};
</script>
