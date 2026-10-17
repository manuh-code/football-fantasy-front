<template>
  <Teleport to="#app">
    <!-- Floating card — mismo slot/estilo que PwaInstallBanner, pero son mutuamente
         excluyentes (ver App.vue): en móvil se invita a la app nativa en vez de
         instalar la web como PWA. -->
    <Transition name="app-download-banner">
      <div
        v-if="shouldShow"
        class="fixed inset-x-0 z-[110] px-3 pointer-events-none flex justify-center"
        :style="bannerStyle"
      >
        <div
          class="pointer-events-auto w-full max-w-md p-3 rounded-2xl bg-white/80 dark:bg-gray-900/70 backdrop-blur-xl border border-black/[0.05] dark:border-white/10 shadow-lg shadow-black/10 dark:shadow-black/40"
        >
          <div class="flex items-start gap-3">
            <img
              src="/img/icons/android-chrome-192x192.png"
              alt=""
              class="shrink-0 w-11 h-11 rounded-xl shadow-md shadow-black/10"
            />

            <div class="min-w-0 flex-1 pt-0.5">
              <p class="text-footnote font-bold text-gray-900 dark:text-white leading-tight">
                {{ $t('appDownload.banner.title') }}
              </p>
              <p class="mt-0.5 text-2xs text-gray-500 dark:text-gray-400 leading-snug">
                {{ $t('appDownload.banner.subtitle') }}
              </p>
            </div>

            <button
              type="button"
              :aria-label="$t('appDownload.banner.dismiss')"
              class="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-90 transition-all"
              @click="dismiss"
            >
              <v-icon name="hi-solid-x" class="w-4 h-4" />
            </button>
          </div>

          <a
            :href="storeUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="mt-3 flex justify-center"
            @click="dismiss"
          >
            <template v-if="platform === 'ios'">
              <img
                src="/img/stores/app-store-badge-es-mx-black.svg"
                :alt="$t('appDownload.banner.badgeAltIos')"
                class="h-10 w-auto dark:hidden"
              />
              <img
                src="/img/stores/app-store-badge-es-mx-white.svg"
                :alt="$t('appDownload.banner.badgeAltIos')"
                class="hidden h-10 w-auto dark:block"
              />
            </template>
            <img
              v-else
              src="/img/stores/google-play-badge-es-mx.png"
              :alt="$t('appDownload.banner.badgeAltAndroid')"
              class="h-10 w-auto"
            />
          </a>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { APP_STORE_URL, PLAY_STORE_URL } from '@/config/appStores'
import { useAppDownloadPrompt } from '@/composables/useAppDownloadPrompt'

const { platform, shouldShow, dismiss } = useAppDownloadPrompt()

const storeUrl = computed(() => (platform.value === 'ios' ? APP_STORE_URL : PLAY_STORE_URL))

// Mismo hueco que PwaInstallBanner: arriba de la nav inferior + safe area de iOS.
const bannerStyle = { bottom: 'calc(5rem + env(safe-area-inset-bottom, 0px))' }
</script>

<style scoped>
.app-download-banner-enter-active {
  transition: all 0.35s cubic-bezier(0.21, 1.02, 0.73, 1);
}
.app-download-banner-leave-active {
  transition: all 0.25s ease-in;
}
.app-download-banner-enter-from,
.app-download-banner-leave-to {
  opacity: 0;
  transform: translateY(16px);
}

@media (prefers-reduced-motion: reduce) {
  .app-download-banner-enter-active,
  .app-download-banner-leave-active {
    transition: none !important;
  }
}
</style>
