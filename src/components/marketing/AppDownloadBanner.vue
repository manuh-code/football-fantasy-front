<template>
  <Teleport to="#app">
    <!-- Franja fija, siempre presente: sin botón de cerrar y sin descarte en
         localStorage (decisión de producto — no es un aviso que se quita solo).
         Reemplaza a PwaInstallBanner (ver App.vue): se invita a la app nativa
         en vez de instalar la web como PWA. En escritorio se mandan las dos
         fichas de tienda; en el teléfono, la suya. -->
    <Transition appear name="app-download-banner">
      <div
        class="fixed inset-x-0 z-[110] px-3 pointer-events-none flex justify-center"
        :style="bannerStyle"
      >
        <div
          class="app-download-glow pointer-events-auto w-full max-w-md p-3.5 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-xl shadow-emerald-900/30 ring-1 ring-white/15"
        >
          <div class="flex items-center gap-3">
            <img
              src="/img/icons/android-chrome-192x192.png"
              alt=""
              class="shrink-0 w-12 h-12 rounded-xl ring-2 ring-white/50 shadow-md shadow-black/20"
            />

            <div class="min-w-0 flex-1">
              <p class="text-footnote font-extrabold text-white leading-tight">
                {{ $t('appDownload.banner.title') }}
              </p>
              <p class="mt-0.5 text-2xs text-emerald-50/90 leading-snug">
                {{ $t('appDownload.banner.subtitle') }}
              </p>
            </div>
          </div>

          <div class="mt-3 flex items-center justify-center gap-3 flex-wrap">
            <a
              v-if="platform !== 'android'"
              :href="APP_STORE_URL"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src="/img/stores/app-store-badge-es-mx-white.svg"
                :alt="$t('appDownload.banner.badgeAltIos')"
                class="h-10 w-auto"
              />
            </a>
            <a
              v-if="platform !== 'ios'"
              :href="PLAY_STORE_URL"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src="/img/stores/google-play-badge-es-mx.png"
                :alt="$t('appDownload.banner.badgeAltAndroid')"
                class="h-10 w-auto"
              />
            </a>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { APP_STORE_URL, PLAY_STORE_URL } from '@/config/appStores'
import { useAppDownloadPrompt } from '@/composables/useAppDownloadPrompt'

const { platform } = useAppDownloadPrompt()

// Mismo hueco que PwaInstallBanner: arriba de la nav inferior + safe area de iOS.
const bannerStyle = { bottom: 'calc(5rem + env(safe-area-inset-bottom, 0px))' }
</script>

<style scoped>
.app-download-banner-enter-active {
  transition: all 0.35s cubic-bezier(0.21, 1.02, 0.73, 1);
}
.app-download-banner-enter-from {
  opacity: 0;
  transform: translateY(16px);
}

/* Resplandor sutil y continuo para que la franja fija siga llamando la
   atención sin moverse ni molestar. */
.app-download-glow {
  animation: app-download-glow 2.6s ease-in-out infinite;
}

@keyframes app-download-glow {
  0%,
  100% {
    box-shadow: 0 10px 30px -5px rgba(6, 95, 70, 0.4);
  }
  50% {
    box-shadow:
      0 10px 30px -5px rgba(6, 95, 70, 0.4),
      0 0 0 6px rgba(16, 185, 129, 0.15);
  }
}

@media (prefers-reduced-motion: reduce) {
  .app-download-banner-enter-active {
    transition: none !important;
  }
  .app-download-glow {
    animation: none !important;
  }
}
</style>
