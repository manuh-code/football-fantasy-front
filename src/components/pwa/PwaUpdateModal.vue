<template>
  <BottomSheet
    :is-visible="needRefresh"
    title="Nueva versión disponible"
    subtitle="Hay una actualización lista para instalar"
    icon="hi-solid-refresh"
    icon-variant="emerald"
    size="auto"
    :dismissible="!isUpdating"
    @close="dismiss"
  >
    <div class="flex flex-col items-center text-center gap-3 py-2">
      <div
        class="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/25"
      >
        <v-icon name="hi-solid-refresh" class="w-8 h-8 text-white" />
      </div>
      <p class="text-[13px] text-gray-600 dark:text-gray-400 leading-relaxed max-w-xs">
        Mejoramos la app con nuevas funciones y correcciones. Actualiza para obtener
        la última versión.
      </p>
    </div>

    <template #footer>
      <div class="flex items-center gap-2">
        <ButtonComponent
          variant="outline"
          size="sm"
          text="Después"
          always-full-width
          :disabled="isUpdating"
          @click="dismiss"
        />
        <ButtonComponent
          variant="primary"
          size="sm"
          text="Actualizar"
          always-full-width
          :loading="isUpdating"
          @click="onApply"
        />
      </div>
    </template>
  </BottomSheet>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import BottomSheet from '@/components/ui/BottomSheet.vue'
import { ButtonComponent } from '@/components/ui'
import { usePwaUpdate } from '@/composables/usePwaUpdate'
import { useToast } from '@/composables/useToast'

const { needRefresh, offlineReady, applyUpdate, dismiss, clearOfflineReady } =
  usePwaUpdate()
const toast = useToast()

const isUpdating = ref(false)

async function onApply() {
  if (isUpdating.value) return
  isUpdating.value = true
  // applyUpdate triggers skipWaiting + full page reload; the spinner stays until
  // the reload happens.
  await applyUpdate()
}

// Show a one-time toast when the app is first cached for offline use.
watch(offlineReady, (ready) => {
  if (ready) {
    toast.success('Listo para usar offline', 'La app ahora funciona sin conexión.')
    clearOfflineReady()
  }
})
</script>
