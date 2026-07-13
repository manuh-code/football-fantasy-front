<template>
  <div
    id="app"
    class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200"
  >
    <!-- Swipe Navigation Indicator -->
    <transition name="swipe-indicator">
      <div
        v-if="swipeNav.isActive.value"
        class="swipe-indicator"
        :style="{
          opacity: swipeNav.getOpacity(),
        }"
      >
        <div class="swipe-icon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </div>
      </div>
    </transition>

    <!-- Header Menu - Fixed at top, outside transform context.
         Hidden on Home (renders its own HomeHeaderMenu) and on the landing page
         (a standalone marketing page with its own header). -->
    <HeaderMenu v-if="!isHomeRoute && !isLandingRoute" />

    <!-- Main Content with Swipe Transform -->
    <div
      class="app-content"
      :style="{
        transform: swipeNav.isActive.value
          ? `translateX(${swipeNav.getTransform()}px)`
          : 'translateX(0)',
        transition: swipeNav.isActive.value
          ? 'none'
          : 'transform 0.3s ease-out',
      }"
    >
      <!-- The landing page is full-bleed: drop the bottom padding and the
           header-reserved top padding so its hero sits flush at the top. -->
      <main class="flex-1" :class="isLandingRoute ? '' : 'pb-24 main-content-safe'">
        <router-view />
      </main>

      <!-- Toast Container -->
      <ToastContainer />
    </div>

    <!-- PWA: update prompt + install banner + push opt-in (global, Teleported) -->
    <PwaUpdateModal />
    <PwaInstallBanner />
    <PushPermissionModal />
  </div>
</template>

<script lang="ts" setup>
import { computed, onBeforeUnmount, onMounted } from "vue";
import { useRouter } from "vue-router";

import HeaderMenu from "@/components/HeaderMenu.vue";
import { ToastContainer } from "@/components/ui";
import { useThemeStore } from "./store/theme";
import { useSwipeNavigation, useToast } from "@/composables";
import FootballFixtureService from "@/services/football/fixture/FootballFixtureService";
import { useDevResetStores } from "@/composables/useDevResetStores";
import { usePushNotifications } from "./composables/usePushNotifications";
import PwaUpdateModal from "@/components/pwa/PwaUpdateModal.vue";
import PwaInstallBanner from "@/components/pwa/PwaInstallBanner.vue";
import PushPermissionModal from "@/components/pwa/PushPermissionModal.vue";

const themeStore = useThemeStore();
const router = useRouter();

// Home renders its own header (HomeHeaderMenu); hide the global one there.
const isHomeRoute = computed(() => router.currentRoute.value.name === "home");
// Landing is a standalone marketing page with its own header + footer.
const isLandingRoute = computed(() => router.currentRoute.value.name === "landingpage");
const { requestPermissionAndRegister, onForegroundMessage } =
  usePushNotifications();
const toast = useToast();

// Initialize swipe navigation
const swipeNav = useSwipeNavigation();

// Dev tools: Ctrl+Shift+K to reset all stores (dev mode only)
let cleanupDevShortcut: (() => void) | undefined;
if (import.meta.env.DEV) {
  const { registerDevShortcut } = useDevResetStores();
  cleanupDevShortcut = registerDevShortcut();
}
onBeforeUnmount(() => cleanupDevShortcut?.());

onMounted(async () => {
  FootballFixtureService.getCurrentFixtures(); // Fetch current fixtures on app mount
  // Initialize theme on app mount
  themeStore.initTheme();

  // Push: en el arranque SOLO revalidamos el token si el usuario ya concedió
  // el permiso antes. Pedir el permiso (Notification.requestPermission) debe
  // dispararse desde un gesto del usuario — es OBLIGATORIO en iOS PWA y además
  // es mejor UX en Android. Ese gesto vive en Ajustes → Notificaciones.
  if ("Notification" in window && Notification.permission === "granted") {
    await requestPermissionAndRegister();
  }

  // Escuchar mensajes en foreground
  onForegroundMessage((payload) => {
    const { title, body } = payload.notification || {};
    const data = payload.data || {};

    console.log("Push received in foreground:", payload);

    // Mostrar toast en la app
    toast.info(title || "¡Notificación!", body || "");

    // Si es una activación de draft, podrías forzar refresh del componente
    if (data.type === "draft_activated") {
      // Opcional: navegar directamente
      // router.push(`/fantasy/league/${data.league_uuid}/draft`)
    }
  });
  navigator.serviceWorker?.addEventListener("message", (event) => {
    if (event.data?.type === "NOTIFICATION_CLICK") {
      const { url } = event.data;
      if (url) {
        router.push(url);
      }
    }
  });
});
</script>

<style lang="scss">
#app {
  // Fuente nativa del sistema: SF Pro en iOS, Roboto en Android, Segoe UI en Windows.
  font-family:
    -apple-system,
    BlinkMacSystemFont,
    system-ui,
    "Segoe UI",
    Roboto,
    "Helvetica Neue",
    Arial,
    "Noto Sans",
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  font-feature-settings:
    "rlig" 1,
    "calt" 1;
  position: relative;
  overflow-x: clip;
}

// Ensure the app takes full height (min-height so scroll stays on window)
html,
body {
  min-height: 100%;
  margin: 0;
}
#app {
  min-height: 100vh;
  min-height: 100dvh;
}

// App content wrapper
.app-content {
  min-height: 100vh;
  min-height: 100dvh; // Dynamic viewport height for mobile browsers
  will-change: transform;
}

// Safe area utilities for iOS notch/Dynamic Island
.safe-area-top {
  padding-top: env(safe-area-inset-top, 0px);
}

.safe-area-bottom {
  padding-bottom: env(safe-area-inset-bottom, 0px);
}

// Main content padding that accounts for header + safe area
.main-content-safe {
  padding-top: calc(
    3.5rem + env(safe-area-inset-top, 0px)
  ); // 56px (h-14) + safe area

  @media (min-width: 640px) {
    padding-top: calc(
      4rem + env(safe-area-inset-top, 0px)
    ); // 64px (h-16) + safe area
  }
}

// Swipe navigation indicator
.swipe-indicator {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  z-index: 9999;
  background: linear-gradient(to right, rgba(59, 130, 246, 0.1), transparent);

  .swipe-icon {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(59, 130, 246, 0.9);
    border-radius: 50%;
    color: white;
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);

    svg {
      width: 24px;
      height: 24px;
    }
  }
}

// Swipe indicator transitions
.swipe-indicator-enter-active,
.swipe-indicator-leave-active {
  transition: opacity 0.2s ease;
}

.swipe-indicator-enter-from,
.swipe-indicator-leave-to {
  opacity: 0;
}

// Custom scrollbar for webkit browsers
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: var(--color-bg-secondary);
}

::-webkit-scrollbar-thumb {
  background: var(--color-border-hover);
  border-radius: 4px;

  &:hover {
    background: var(--color-text-muted);
  }
}
</style>
