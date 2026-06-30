<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-4 md:py-8 pb-24 md:pb-8">
    <div class="container mx-auto px-4 max-w-7xl">
      <HomeComponent />
    </div>
  </div>
  <HomeMenu />

  <!-- Visita guiada: se muestra solo la primera vez (o tras "Ver de nuevo"). -->
  <OnboardingTour :is-visible="showOnboarding" :steps="HOME_STEPS" @finish="finishOnboarding" />
</template>

<script lang="ts" setup>
import { onMounted, ref } from "vue";
import HomeComponent from "@/components/HomeComponent.vue";
import HomeMenu from "@/components/home/HomeMenu.vue";
import OnboardingTour from "@/components/onboarding/OnboardingTour.vue";
import { HOME_STEPS } from "@/components/onboarding/onboardingSteps";
import { useOnboardingStore } from "@/store/onboarding";

const onboarding = useOnboardingStore();
const showOnboarding = ref(false);

const finishOnboarding = () => {
  onboarding.markHomeSeen();
  showOnboarding.value = false;
};

// Mostrar la guía tras un pequeño retardo para no chocar con el splash y la
// animación de entrada de la página.
onMounted(() => {
  if (!onboarding.homeSeen) {
    setTimeout(() => {
      if (!onboarding.homeSeen) showOnboarding.value = true;
    }, 700);
  }
});
</script>
