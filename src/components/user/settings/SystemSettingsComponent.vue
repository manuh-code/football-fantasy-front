<template>
  <div class="space-y-6">
    <!-- Theme Setting -->
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div class="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
        <h3 class="text-base font-semibold text-gray-900 dark:text-white">{{ $t('user.settings.appearance.title') }}</h3>
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{{ $t('user.settings.appearance.subtitle') }}</p>
      </div>

      <div class="p-5">
        <!-- Theme Toggle -->
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg flex items-center justify-center" :class="themeStore.currentTheme === 'dark' ? 'bg-indigo-900/30' : 'bg-amber-50'">
              <v-icon
                :name="themeStore.currentTheme === 'dark' ? 'hi-solid-moon' : 'hi-solid-sun'"
                class="w-5 h-5"
                :class="themeStore.currentTheme === 'dark' ? 'text-indigo-400' : 'text-amber-500'"
              />
            </div>
            <div>
              <p class="text-sm font-medium text-gray-900 dark:text-white">{{ $t('user.settings.appearance.darkMode') }}</p>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                {{ themeStore.currentTheme === 'dark' ? $t('user.settings.appearance.darkActive') : $t('user.settings.appearance.lightActive') }}
              </p>
            </div>
          </div>

          <button
            @click="themeStore.toggleTheme()"
            :class="[
              'relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800',
              themeStore.currentTheme === 'dark' ? 'bg-blue-600' : 'bg-gray-300'
            ]"
            :aria-label="themeStore.currentTheme === 'dark' ? $t('user.settings.appearance.switchToLight') : $t('user.settings.appearance.switchToDark')"
          >
            <span
              :class="[
                'inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200',
                themeStore.currentTheme === 'dark' ? 'translate-x-6' : 'translate-x-1'
              ]"
            />
          </button>
        </div>
      </div>
    </div>

    <!-- Language Setting -->
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div class="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
        <h3 class="text-base font-semibold text-gray-900 dark:text-white">{{ $t('user.settings.language.title') }}</h3>
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{{ $t('user.settings.language.subtitle') }}</p>
      </div>

      <div class="p-5">
        <div class="flex items-center justify-between gap-4">
          <div class="flex items-center gap-3 min-w-0">
            <div class="w-10 h-10 rounded-lg flex items-center justify-center bg-blue-50 dark:bg-blue-900/30">
              <v-icon name="hi-solid-globe-alt" class="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div class="min-w-0">
              <p class="text-sm font-medium text-gray-900 dark:text-white">{{ $t('user.settings.language.label') }}</p>
              <p class="text-xs text-gray-500 dark:text-gray-400 truncate">
                {{ localeStore.locale === 'es' ? $t('user.settings.language.es') : $t('user.settings.language.en') }}
              </p>
            </div>
          </div>

          <!-- Segmented language toggle -->
          <div class="inline-flex rounded-lg bg-gray-100 dark:bg-gray-700 p-1 flex-shrink-0">
            <button
              v-for="lang in (['es', 'en'] as const)"
              :key="lang"
              @click="localeStore.setLocale(lang)"
              :class="[
                'px-3 py-1.5 text-sm font-medium rounded-md transition-colors duration-150',
                localeStore.locale === lang
                  ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              ]"
              :aria-pressed="localeStore.locale === lang"
            >
              {{ lang.toUpperCase() }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Notifications Setting -->
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div class="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
        <h3 class="text-base font-semibold text-gray-900 dark:text-white">{{ $t('user.settings.notifications.title') }}</h3>
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{{ $t('user.settings.notifications.subtitle') }}</p>
      </div>

      <div class="p-5 space-y-4">
        <div class="flex items-center justify-between gap-4">
          <div class="flex items-center gap-3 min-w-0">
            <div
              class="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
              :class="permission === 'granted' ? 'bg-emerald-50 dark:bg-emerald-900/30' : 'bg-gray-100 dark:bg-gray-700'"
            >
              <v-icon
                name="hi-solid-bell"
                class="w-5 h-5"
                :class="permission === 'granted' ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400 dark:text-gray-500'"
              />
            </div>
            <div class="min-w-0">
              <p class="text-sm font-medium text-gray-900 dark:text-white">{{ $t('user.settings.notifications.label') }}</p>
              <p class="text-xs text-gray-500 dark:text-gray-400">{{ statusText }}</p>
            </div>
          </div>

          <!-- Enable button: el permiso SOLO se pide desde este gesto (requisito iOS) -->
          <button
            v-if="canEnable"
            @click="handleEnable"
            :disabled="isEnabling"
            class="flex-shrink-0 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
          >
            {{ isEnabling ? $t('user.settings.notifications.enabling') : $t('user.settings.notifications.enable') }}
          </button>

          <!-- Granted badge -->
          <span
            v-else-if="permission === 'granted'"
            class="flex-shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/30"
          >
            <v-icon name="hi-solid-check" class="w-4 h-4" />
            {{ $t('user.settings.notifications.enabled') }}
          </span>
        </div>

        <!-- Contextual hints -->
        <p
          v-if="permission === 'denied'"
          class="text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3"
        >
          {{ $t('user.settings.notifications.deniedHint') }}
        </p>
        <p
          v-else-if="isIos && permission !== 'granted'"
          class="text-xs text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3"
        >
          {{ $t('user.settings.notifications.iosHint') }}
        </p>

        <!-- Diagnostics (self-service troubleshooting on the actual device) -->
        <div class="pt-1">
          <button
            @click="showDiagnostics = !showDiagnostics"
            class="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
          >
            {{ showDiagnostics ? $t('user.settings.notifications.hideDiagnostics') : $t('user.settings.notifications.showDiagnostics') }}
          </button>
          <div v-if="showDiagnostics" class="mt-3 rounded-xl bg-gray-50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-700">
            <PushDiagnosticsPanel />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useThemeStore } from '@/store/theme'
import { useLocaleStore } from '@/store/locale'
import { usePushNotifications } from '@/composables/usePushNotifications'
import { useToast } from '@/composables'
import PushDiagnosticsPanel from '@/components/ui/PushDiagnosticsPanel.vue'

const themeStore = useThemeStore()
const localeStore = useLocaleStore()
const { t } = useI18n()
const toast = useToast()
const { requestPermissionAndRegister } = usePushNotifications()

const isSupported = 'Notification' in window
// Notification.permission no es reactivo: lo guardamos y lo refrescamos a mano.
const permission = ref<NotificationPermission | 'unsupported'>(
  isSupported ? Notification.permission : 'unsupported',
)
const isEnabling = ref(false)
const showDiagnostics = ref(false)

// iOS necesita la PWA instalada en pantalla de inicio para poder activar push.
const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent)

// Solo se puede "activar" cuando el navegador soporta y el permiso aún no se
// concedió ni se bloqueó (estado 'default').
const canEnable = computed(() => isSupported && permission.value === 'default')

const statusText = computed(() => {
  switch (permission.value) {
    case 'granted':
      return t('user.settings.notifications.statusGranted')
    case 'denied':
      return t('user.settings.notifications.statusDenied')
    case 'unsupported':
      return t('user.settings.notifications.statusUnsupported')
    default:
      return t('user.settings.notifications.statusDefault')
  }
})

async function handleEnable() {
  if (isEnabling.value) return
  isEnabling.value = true
  try {
    const token = await requestPermissionAndRegister()
    permission.value = isSupported ? Notification.permission : 'unsupported'
    if (token) {
      toast.success(
        t('user.settings.notifications.successTitle'),
        t('user.settings.notifications.successBody'),
      )
    } else {
      toast.error(
        t('user.settings.notifications.errorTitle'),
        t('user.settings.notifications.errorBody'),
      )
    }
  } finally {
    isEnabling.value = false
  }
}
</script>
