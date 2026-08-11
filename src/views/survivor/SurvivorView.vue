<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-4 md:py-8 pb-28">
    <div class="container mx-auto px-4 max-w-7xl mb-24 md:mb-0">
      <!-- Secondary section tabs: global destinations live in the fixed nav -->
      <TabsBar :items="tabItems" active-key="survivors" :aria-label="$t('survivor.nav.aria')" />

      <div class="animate-page-enter">
        <SurvivorComponent ref="survivorComponentRef" />
      </div>
    </div>

    <!-- Floating Action Button - Teleported to body to avoid transform context issues -->
    <Teleport to="body">
      <div class="fixed right-6 z-[110] fab-position">
        <button
          class="group relative w-16 h-16 bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-700 hover:to-red-800 text-white rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-rose-500/50 hover:scale-110 active:scale-95"
          :class="{ 'rotate-45': isFabMenuOpen, 'rotate-0': !isFabMenuOpen }"
          :title="isFabMenuOpen ? $t('survivor.fab.close') : $t('survivor.fab.quickActions')"
          @click="toggleFabMenu"
        >
          <v-icon name="hi-solid-plus" class="w-8 h-8" />
        </button>

        <!-- FAB Menu -->
        <transition name="fab-menu">
          <div v-if="isFabMenuOpen" class="absolute bottom-20 right-0 flex flex-col gap-3 min-w-max z-[111]">
            <button
              class="flex items-center gap-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white px-5 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-200 dark:border-gray-700 group"
              @click="openCreate"
            >
              <span class="text-sm font-semibold flex items-center gap-1.5">
                {{ $t('survivor.create.title') }}
                <PremiumBadge v-if="!canCreateSurvivor" />
              </span>
              <div class="w-10 h-10 bg-gradient-to-br from-rose-500 to-red-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-md">
                <v-icon name="hi-solid-plus-circle" class="w-5 h-5 text-white" />
              </div>
            </button>

            <button
              class="flex items-center gap-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white px-5 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-200 dark:border-gray-700 group"
              @click="openJoin"
            >
              <span class="text-sm font-semibold">{{ $t('survivor.join.title') }}</span>
              <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-md">
                <v-icon name="hi-solid-key" class="w-5 h-5 text-white" />
              </div>
            </button>
          </div>
        </transition>
      </div>
    </Teleport>

    <!-- Create / Join modals -->
    <SurvivorCreateModal :is-visible="isCreateOpen" @close="isCreateOpen = false" @created="onCreated" />
    <SurvivorJoinModal
      :is-visible="isJoinOpen"
      :initial-code="joinInitialCode"
      @close="isJoinOpen = false"
      @joined="onJoined"
    />

    <!-- Fixed bottom navigation (Home / Leagues / Play / Following); Play
         stays selected here and returns to the Gaming screen — see HomeMenu. -->
    <HomeMenu />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useToast } from "@/composables/useToast";
import SurvivorComponent from "@/components/survivor/SurvivorComponent.vue";
import SurvivorCreateModal from "@/components/survivor/SurvivorCreateModal.vue";
import SurvivorJoinModal from "@/components/survivor/SurvivorJoinModal.vue";
import HomeMenu from "@/components/home/HomeMenu.vue";
import TabsBar from "@/components/ui/TabsBar.vue";
import PremiumBadge from "@/components/premium/PremiumBadge.vue";
import { usePremium } from "@/composables/usePremium";
import { PREMIUM_FEATURES } from "@/interfaces/user/billing/EntitlementsResponse";
import type { BottomNavItem } from "@/components/ui/BottomNavBar.vue";
import type { SurvivorResponse } from "@/interfaces/survivor/SurvivorResponse";

const { t } = useI18n();
const { success } = useToast();
const route = useRoute();
const router = useRouter();

// Set page title
document.title = t("survivor.docTitle");

// Refs
const survivorComponentRef = ref<InstanceType<typeof SurvivorComponent> | null>(null);

// State
const isFabMenuOpen = ref(false);
const isCreateOpen = ref(false);
const isJoinOpen = ref(false);

// Access code pre-filled into the Join sheet when arriving from an invite link.
const joinInitialCode = ref("");

// Section tab shown at the top; the list has no other options of its own.
const tabItems = computed<BottomNavItem[]>(() => [
  { key: "survivors", label: t("survivor.nav.survivors"), icon: "hi-solid-shield-check", accent: "red" },
]);

// FAB
const toggleFabMenu = () => {
  isFabMenuOpen.value = !isFabMenuOpen.value;
};

const { requirePremium, can } = usePremium();

// El survivor propio es de pago en cualquier liga, así que el candado va en la
// acción y no en el selector de liga: da igual cuál elija.
const canCreateSurvivor = computed(() => can(PREMIUM_FEATURES.survivorCustomPools));

const openCreate = () => {
  isFabMenuOpen.value = false;

  // Sin premium no se abre el formulario: se abre la hoja que lo vende. Dejarle
  // configurar reglas y cupo para fallar al enviar sería la peor versión.
  if (!requirePremium(PREMIUM_FEATURES.survivorCustomPools)) {
    return;
  }

  isCreateOpen.value = true;
};

const openJoin = () => {
  isFabMenuOpen.value = false;
  joinInitialCode.value = ""; // FAB flow starts from an empty form.
  isJoinOpen.value = true;
};

// Modal callbacks
const onCreated = (survivor: SurvivorResponse) => {
  isCreateOpen.value = false;
  success(t("survivor.create.createdTitle"), t("survivor.create.createdBody", { name: survivor.name }));
  survivorComponentRef.value?.reloadShowingMine();
};

const onJoined = (survivor: SurvivorResponse) => {
  isJoinOpen.value = false;
  success(t("survivor.join.joinedTitle"), t("survivor.join.joinedBody", { name: survivor.name }));
  survivorComponentRef.value?.reloadShowingMine();
};

// Arriving from a shared invite link (/survivor?join=CODE): open the Join sheet
// pre-filled with the code, then strip the query so a refresh doesn't reopen it.
// `?join=` sin valor abre la hoja vacía — es el atajo "unirse con código".
onMounted(() => {
  const code = route.query.join;
  if (typeof code === "string") {
    joinInitialCode.value = code.trim();
    isJoinOpen.value = true;
    router.replace({ query: { ...route.query, join: undefined } });
  }
});

// Cleanup: close FAB menu when leaving the view
onUnmounted(() => {
  isFabMenuOpen.value = false;
});
</script>

<style>
/* FAB styles - unscoped because Teleport renders outside component root */

/* FAB Menu Transitions */
.fab-menu-enter-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.fab-menu-leave-active {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.fab-menu-enter-from {
  opacity: 0;
  transform: translateY(10px) scale(0.9);
}

.fab-menu-leave-to {
  opacity: 0;
  transform: translateY(5px) scale(0.95);
}

/* Rotate animation for main FAB */
.fab-position .rotate-45 {
  transform: rotate(45deg);
}

.fab-position .rotate-0 {
  transform: rotate(0deg);
}

/* Accessibility: Respect user's motion preferences */
@media (prefers-reduced-motion: reduce) {
  .fab-position .transition-all,
  .fab-position .transition-transform {
    transition: none !important;
    animation: none !important;
  }

  .fab-menu-enter-active,
  .fab-menu-leave-active {
    transition: none !important;
  }

  .fab-position .rotate-45,
  .fab-position .rotate-0 {
    transform: none !important;
  }
}

/* FAB Position - Always visible above footer nav */
.fab-position {
  bottom: calc(5rem + env(safe-area-inset-bottom));
  pointer-events: auto;
}

@media (min-width: 768px) {
  .fab-position {
    bottom: 1.5rem;
  }
}
</style>
