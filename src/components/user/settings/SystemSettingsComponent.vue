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
              :class="isSubscribed ? 'bg-emerald-50 dark:bg-emerald-900/30' : 'bg-gray-100 dark:bg-gray-700'"
            >
              <v-icon
                name="hi-solid-bell"
                class="w-5 h-5"
                :class="isSubscribed ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400 dark:text-gray-500'"
              />
            </div>
            <div class="min-w-0">
              <p class="text-sm font-medium text-gray-900 dark:text-white">{{ $t('user.settings.notifications.label') }}</p>
              <p class="text-xs text-gray-500 dark:text-gray-400">{{ statusText }}</p>
            </div>
          </div>

          <!-- Toggle: activar registra el token; desactivar lo borra del backend.
               El permiso del navegador no se puede revocar por JS, así que
               "desactivar" = dejar de recibir push eliminando el token. -->
          <button
            @click="toggleNotifications"
            :disabled="isToggleDisabled"
            :class="[
              'relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 flex-shrink-0',
              isSubscribed ? 'bg-emerald-600' : 'bg-gray-300 dark:bg-gray-600',
              isToggleDisabled ? 'opacity-50 cursor-not-allowed' : ''
            ]"
            :aria-label="$t('user.settings.notifications.switchAria')"
            :aria-pressed="isSubscribed"
          >
            <span
              :class="[
                'inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200',
                isSubscribed ? 'translate-x-6' : 'translate-x-1'
              ]"
            />
          </button>
        </div>

        <!-- Contextual hints -->
        <p
          v-if="permission === 'denied'"
          class="text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3"
        >
          {{ $t('user.settings.notifications.deniedHint') }}
        </p>
        <p
          v-else-if="showIosHint"
          class="text-xs text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3"
        >
          {{ $t('user.settings.notifications.iosHint') }}
        </p>
      </div>
    </div>

    <!-- Tutorial / Guided tour -->
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div class="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
        <h3 class="text-base font-semibold text-gray-900 dark:text-white">{{ $t('onboarding.replay.title') }}</h3>
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{{ $t('onboarding.replay.subtitle') }}</p>
      </div>

      <div class="p-5">
        <div class="flex items-center justify-between gap-4">
          <div class="flex items-center gap-3 min-w-0">
            <div class="w-10 h-10 rounded-lg flex items-center justify-center bg-emerald-50 dark:bg-emerald-900/30 flex-shrink-0">
              <v-icon name="hi-solid-academic-cap" class="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div class="min-w-0">
              <p class="text-sm font-medium text-gray-900 dark:text-white">{{ $t('onboarding.replay.label') }}</p>
              <p class="text-xs text-gray-500 dark:text-gray-400 truncate">{{ $t('onboarding.replay.description') }}</p>
            </div>
          </div>

          <button
            @click="replayTutorial"
            class="flex-shrink-0 px-4 py-2 rounded-lg text-sm font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 active:scale-95 transition-all"
          >
            {{ $t('onboarding.replay.button') }}
          </button>
        </div>
      </div>
    </div>

    <!-- App version -->
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div class="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
        <h3 class="text-base font-semibold text-gray-900 dark:text-white">{{ $t('user.settings.version.title') }}</h3>
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{{ $t('user.settings.version.subtitle') }}</p>
      </div>

      <div class="p-5">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg flex items-center justify-center bg-gray-100 dark:bg-gray-700/60">
            <v-icon name="hi-solid-information-circle" class="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </div>
          <div>
            <p class="text-sm font-medium text-gray-900 dark:text-white">
              {{ $t('user.settings.version.label') }} {{ appVersion.version }}
            </p>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              {{ $t('user.settings.version.releaseDate', { date: formattedReleaseDate }) }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useThemeStore } from '@/store/theme'
import { useLocaleStore } from '@/store/locale'
import { usePushNotifications } from '@/composables/usePushNotifications'
import { useNotificationsStore } from '@/store/notifications'
import { useOnboardingStore } from '@/store/onboarding'
import { useToast } from '@/composables'
import appVersion from '@/version.json'

const themeStore = useThemeStore()
const localeStore = useLocaleStore()
const router = useRouter()
const onboardingStore = useOnboardingStore()
const { t, locale } = useI18n()
const toast = useToast()

const formattedReleaseDate = computed(() =>
  new Intl.DateTimeFormat(locale.value, { dateStyle: 'medium' }).format(
    new Date(`${appVersion.releaseDate}T00:00:00`),
  ),
)

// Reinicia las guías y vuelve al Home, donde la visita guiada se mostrará de nuevo.
async function replayTutorial() {
  onboardingStore.replay()
  toast.info(t('onboarding.replay.title'), t('onboarding.replay.toast'))
  await router.push({ name: 'home' })
}
const { requestPermissionAndRegister, unregisterToken } = usePushNotifications()
const notificationsStore = useNotificationsStore()
const { fcmToken, isTokenRegistered } = storeToRefs(notificationsStore)

const isSupported = 'Notification' in window
// Notification.permission no es reactivo: lo guardamos y lo refrescamos a mano.
const permission = ref<NotificationPermission | 'unsupported'>(
  isSupported ? Notification.permission : 'unsupported',
)
const isBusy = ref(false)

// iOS necesita la PWA instalada en pantalla de inicio para poder activar push.
const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent)

// "Suscrito" = permiso concedido Y token registrado en el backend. Ese es el
// estado real de "recibo notificaciones en este dispositivo".
const isSubscribed = computed(
  () => permission.value === 'granted' && !!fcmToken.value && isTokenRegistered.value,
)

// El toggle no puede hacer nada útil si el navegador no soporta push o si el
// permiso fue bloqueado (no se puede volver a pedir por JS).
const isToggleDisabled = computed(
  () => permission.value === 'unsupported' || permission.value === 'denied' || isBusy.value,
)

// Pista de iOS solo cuando aún no se puede activar (no instalada / sin pedir),
// no cuando ya está concedido pero apagado.
const showIosHint = computed(
  () => isIos && (permission.value === 'unsupported' || permission.value === 'default'),
)

const statusText = computed(() => {
  if (permission.value === 'unsupported') return t('user.settings.notifications.statusUnsupported')
  if (permission.value === 'denied') return t('user.settings.notifications.statusDenied')
  if (isSubscribed.value) return t('user.settings.notifications.statusGranted')
  return t('user.settings.notifications.statusOff')
})

async function toggleNotifications() {
  if (isToggleDisabled.value) return
  isBusy.value = true
  try {
    if (isSubscribed.value) {
      // Desactivar: borra el token del backend (el permiso del navegador queda).
      await unregisterToken()
      toast.info(
        t('user.settings.notifications.disabledTitle'),
        t('user.settings.notifications.disabledBody'),
      )
    } else {
      // Activar: pide permiso (si hace falta) y registra el token. Es el gesto
      // del usuario obligatorio en iOS.
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
    }
  } finally {
    isBusy.value = false
  }
}
</script>
