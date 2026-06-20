<template>
  <Teleport to="#app">
    <!-- Floating install banner — glass pill, sits above the footer nav (z-100). -->
    <Transition name="install-banner">
      <div
        v-if="shouldShowBanner"
        class="fixed inset-x-0 z-[110] px-3 pointer-events-none flex justify-center"
        :style="bannerStyle"
      >
        <div
          class="pointer-events-auto w-full max-w-md flex items-center gap-3 p-2.5 pl-3 rounded-2xl bg-white/80 dark:bg-gray-900/70 backdrop-blur-xl border border-black/[0.05] dark:border-white/10 shadow-lg shadow-black/10 dark:shadow-black/40"
        >
          <!-- Icon -->
          <div
            class="shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-md shadow-emerald-500/25"
          >
            <v-icon name="hi-solid-download" class="w-5 h-5 text-white" />
          </div>

          <!-- Copy -->
          <div class="min-w-0 flex-1">
            <p class="text-footnote font-bold text-gray-900 dark:text-white leading-tight">
              Install Football Fantasy
            </p>
            <p class="text-2xs text-gray-500 dark:text-gray-400 leading-tight truncate">
              {{ isIOSSafari ? 'Add it to your home screen' : 'Quick access, just like a native app' }}
            </p>
          </div>

          <!-- CTA -->
          <button
            type="button"
            class="shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold text-white bg-emerald-600 active:scale-95 transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40"
            @click="onCta"
          >
            {{ isIOSSafari ? 'How' : 'Install' }}
          </button>

          <!-- Dismiss -->
          <button
            type="button"
            aria-label="Dismiss"
            class="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-90 transition-all"
            @click="snooze"
          >
            <v-icon name="hi-solid-x" class="w-4 h-4" />
          </button>
        </div>
      </div>
    </Transition>

    <!-- iOS manual instructions -->
    <BottomSheet
      :is-visible="showIosHelp"
      title="Install on iPhone / iPad"
      subtitle="It only takes a few seconds"
      icon="hi-solid-share"
      icon-variant="emerald"
      size="auto"
      @close="showIosHelp = false"
    >
      <ol class="space-y-3 py-1">
        <li class="flex items-start gap-3">
          <span class="shrink-0 w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center justify-center">1</span>
          <p class="text-footnote text-gray-700 dark:text-gray-300 leading-relaxed">
            Tap the <strong>Share</strong> button
            <v-icon name="hi-solid-share" class="inline w-4 h-4 mx-0.5 -mt-0.5 text-emerald-600 dark:text-emerald-400" />
            in the Safari bar.
          </p>
        </li>
        <li class="flex items-start gap-3">
          <span class="shrink-0 w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center justify-center">2</span>
          <p class="text-footnote text-gray-700 dark:text-gray-300 leading-relaxed">
            Scroll down and select
            <strong>Add to Home Screen</strong>
            <v-icon name="hi-solid-plus-circle" class="inline w-4 h-4 mx-0.5 -mt-0.5 text-emerald-600 dark:text-emerald-400" />.
          </p>
        </li>
        <li class="flex items-start gap-3">
          <span class="shrink-0 w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center justify-center">3</span>
          <p class="text-footnote text-gray-700 dark:text-gray-300 leading-relaxed">
            Confirm by tapping <strong>Add</strong>. You're all set!
          </p>
        </li>
      </ol>

      <template #footer>
        <ButtonComponent
          variant="primary"
          size="sm"
          text="Got it"
          always-full-width
          @click="showIosHelp = false"
        />
      </template>
    </BottomSheet>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import BottomSheet from '@/components/ui/BottomSheet.vue'
import { ButtonComponent } from '@/components/ui'
import { usePwaInstall } from '@/composables/usePwaInstall'

const { shouldShowBanner, isIOSSafari, promptInstall, snooze } = usePwaInstall()

const showIosHelp = ref(false)

// Lift the banner above the footer nav + iOS safe area.
const bannerStyle = computed(() => ({
  bottom: 'calc(5rem + env(safe-area-inset-bottom, 0px))',
}))

async function onCta() {
  if (isIOSSafari) {
    showIosHelp.value = true
    return
  }
  await promptInstall()
}
</script>

<style scoped>
.install-banner-enter-active {
  transition: all 0.35s cubic-bezier(0.21, 1.02, 0.73, 1);
}
.install-banner-leave-active {
  transition: all 0.25s ease-in;
}
.install-banner-enter-from,
.install-banner-leave-to {
  opacity: 0;
  transform: translateY(16px);
}

@media (prefers-reduced-motion: reduce) {
  .install-banner-enter-active,
  .install-banner-leave-active {
    transition: none !important;
  }
}
</style>
