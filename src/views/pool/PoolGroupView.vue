<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-4 md:py-8 pb-28">
    <div class="container mx-auto px-4 max-w-3xl">
      <!-- Secondary tabs: My Pools / Info / Predictions / Standings -->
      <TopTabsBar
        :items="items"
        :active-key="activeTab"
        :aria-label="$t('pool.group.nav')"
        @select="onSelect"
      />

      <!-- Pool Group / Rules Component -->
      <div class="animate-page-enter">
        <PoolRulesComponent v-if="activeTab === 'rules'" />
        <PoolGroupComponent v-else :pool-uuid="poolUuid" :active-tab="activeTab" />
      </div>
    </div>

    <!-- Fixed bottom navigation; Play stays selected here and returns to the
         Gaming screen — see HomeMenu. -->
    <HomeMenu />

    <!-- Visita guiada de la quiniela: solo la primera vez (o tras "Ver de nuevo"). -->
    <OnboardingTour :is-visible="showOnboarding" :steps="POOL_STEPS" @finish="finishOnboarding" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import HomeMenu from "@/components/home/HomeMenu.vue";
import TopTabsBar from "@/components/ui/TopTabsBar.vue";
import type { BottomNavItem } from "@/components/ui/BottomNavBar.vue";
import PoolGroupComponent from "@/components/pool/PoolGroupComponent.vue";
import PoolRulesComponent from "@/components/pool/PoolRulesComponent.vue";
import OnboardingTour from "@/components/onboarding/OnboardingTour.vue";
import { POOL_STEPS } from "@/components/onboarding/onboardingSteps";
import { useOnboardingStore } from "@/store/onboarding";
import { useAuthStore } from "@/store/auth/useAuthStore";

const { t } = useI18n();

const onboarding = useOnboardingStore();
const authStore = useAuthStore();
const showOnboarding = ref(false);

const finishOnboarding = () => {
  onboarding.markPoolSeen();
  showOnboarding.value = false;
};

// Mostrar la guía la primera vez que se abre el detalle de una quiniela
// (solo para usuarios autenticados).
onMounted(async () => {
  if (!onboarding.poolSeen && (await authStore.isAuthenticated())) {
    setTimeout(() => {
      if (!onboarding.poolSeen) showOnboarding.value = true;
    }, 700);
  }
});

// Set page title
document.title = t("pool.group.docTitle");

const route = useRoute();
const router = useRouter();

const poolUuid = computed(() => route.params.uuid as string);
const activeTab = ref("info");

// "myPools" is a neutral shortcut (no accent → never highlighted) back to the
// pools list; the rest switch the active tab.
const items = computed<BottomNavItem[]>(() => [
  { key: "myPools", label: t("pool.group.tabs.myPools"), icon: "hi-solid-collection" },
  { key: "info", label: t("pool.group.tabs.info"), icon: "hi-solid-information-circle", accent: "emerald" },
  { key: "predictions", label: t("pool.group.tabs.predictions"), icon: "hi-solid-clipboard-list", accent: "blue" },
  { key: "standings", label: t("pool.group.tabs.standings"), icon: "bi-trophy-fill", accent: "amber" },
  { key: "rules", label: t("pool.group.tabs.rules"), icon: "hi-solid-bookmark", accent: "purple" },
]);

const onSelect = (key: string) => {
  if (key === "myPools") {
    router.push({ name: "pools" });
    return;
  }
  activeTab.value = key;
};
</script>
