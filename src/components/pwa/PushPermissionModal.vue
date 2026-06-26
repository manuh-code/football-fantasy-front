<template>
  <BottomSheet
    :is-visible="visible"
    :title="$t('pwa.push.title')"
    :subtitle="$t('pwa.push.subtitle')"
    icon="hi-solid-bell"
    icon-variant="emerald"
    size="auto"
    :dismissible="!isEnabling"
    @close="onLater"
  >
    <div class="flex flex-col items-center text-center gap-3 py-2">
      <div
        class="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/25"
      >
        <v-icon name="hi-solid-bell" class="w-8 h-8 text-white" />
      </div>
      <p class="text-footnote text-gray-600 dark:text-gray-400 leading-relaxed max-w-xs">
        {{ $t('pwa.push.body') }}
      </p>
    </div>

    <template #footer>
      <div class="flex items-center gap-2">
        <ButtonComponent
          variant="outline"
          size="sm"
          :text="$t('pwa.push.later')"
          always-full-width
          :disabled="isEnabling"
          @click="onLater"
        />
        <ButtonComponent
          variant="primary"
          size="sm"
          :text="isEnabling ? $t('pwa.push.enabling') : $t('pwa.push.enable')"
          always-full-width
          :loading="isEnabling"
          @click="onEnable"
        />
      </div>
    </template>
  </BottomSheet>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import BottomSheet from '@/components/ui/BottomSheet.vue'
import { ButtonComponent } from '@/components/ui'
import { usePushNotifications } from '@/composables/usePushNotifications'
import { useNotificationsStore } from '@/store/notifications'

// Si el usuario pospone, no volvemos a insistir por este periodo (mismo patrón
// que el banner de instalación de la PWA).
const SNOOZE_KEY = 'push-prompt-snoozed-until'
const SNOOZE_DAYS = 7
// Pequeño retraso para no aparecer en el primer frame del arranque ni chocar
// con el modal de actualización de la PWA.
const SHOW_DELAY_MS = 2500

const { requestPermissionAndRegister } = usePushNotifications()
const notificationsStore = useNotificationsStore()
const { fcmToken, isTokenRegistered } = storeToRefs(notificationsStore)

const visible = ref(false)
const isEnabling = ref(false)

const isSupported = 'Notification' in window

function detectStandalone(): boolean {
  if (typeof window === 'undefined') return false
  return (
    window.matchMedia?.('(display-mode: standalone)').matches ||
    // Flag heredado de iOS Safari
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  )
}

function isSnoozed(): boolean {
  try {
    const until = localStorage.getItem(SNOOZE_KEY)
    return !!until && Date.now() < Number(until)
  } catch {
    return false
  }
}

function snooze(): void {
  try {
    localStorage.setItem(SNOOZE_KEY, String(Date.now() + SNOOZE_DAYS * 86_400_000))
  } catch {
    /* ignora errores de storage (modo privado, etc.) */
  }
}

const isSubscribed = computed(
  () =>
    isSupported &&
    Notification.permission === 'granted' &&
    !!fcmToken.value &&
    isTokenRegistered.value,
)

// Solo invitamos a activar dentro de la PWA instalada, si el navegador soporta
// push, no está bloqueado, aún no estamos suscritos y no fue pospuesto.
function shouldPrompt(): boolean {
  return (
    isSupported &&
    detectStandalone() &&
    Notification.permission !== 'denied' &&
    !isSubscribed.value &&
    !isSnoozed()
  )
}

onMounted(() => {
  window.setTimeout(() => {
    if (shouldPrompt()) visible.value = true
  }, SHOW_DELAY_MS)
})

async function onEnable() {
  if (isEnabling.value) return
  isEnabling.value = true
  try {
    await requestPermissionAndRegister()
  } finally {
    isEnabling.value = false
    // Cerramos siempre: si concedió, queda suscrito; si no, lo posponemos para
    // no volver a insistir en breve.
    snooze()
    visible.value = false
  }
}

function onLater() {
  if (isEnabling.value) return
  snooze()
  visible.value = false
}
</script>
