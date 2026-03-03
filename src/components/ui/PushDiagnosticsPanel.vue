<script setup lang="ts">
import { onMounted } from 'vue'
import { usePushDiagnostics } from '@/composables/usePushDiagnostics'
import { usePushNotifications } from '@/composables/usePushNotifications'
import type { CheckStatus } from '@/composables/usePushDiagnostics'

const { checks, isRunning, runDiagnostics, canReceiveNotifications } = usePushDiagnostics()
const { requestPermissionAndRegister } = usePushNotifications()

onMounted(() => runDiagnostics())

async function handleRequestPermission() {
  await requestPermissionAndRegister()
  await runDiagnostics()
}

const statusConfig: Record<CheckStatus, { icon: string; classes: string }> = {
  ok:      { icon: '✓', classes: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  warning: { icon: '⚠', classes: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
  error:   { icon: '✕', classes: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  pending: { icon: '…', classes: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400' },
}
</script>

<template>
  <div class="max-w-lg mx-auto p-4 space-y-4">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
        Diagnóstico de Notificaciones Push
      </h2>
      <button
        :disabled="isRunning"
        class="text-sm px-3 py-1.5 rounded-lg bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white transition"
        @click="runDiagnostics"
      >
        {{ isRunning ? 'Verificando…' : 'Repetir' }}
      </button>
    </div>

    <!-- Checks list -->
    <div class="space-y-2">
      <div
        v-for="check in checks"
        :key="check.id"
        class="flex items-start gap-3 p-3 rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800"
      >
        <!-- Status badge -->
        <span
          :class="statusConfig[check.status].classes"
          class="mt-0.5 flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
        >
          {{ statusConfig[check.status].icon }}
        </span>

        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-gray-800 dark:text-gray-100">{{ check.label }}</p>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5 break-words">{{ check.detail }}</p>
        </div>
      </div>
    </div>

    <!-- Resumen final -->
    <div
      v-if="checks.length > 0"
      :class="canReceiveNotifications()
        ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
        : 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'"
      class="p-4 rounded-xl border text-sm font-medium"
    >
      <span v-if="canReceiveNotifications()" class="text-green-700 dark:text-green-400">
        ✓ Tu PWA está lista para recibir notificaciones push.
      </span>
      <span v-else class="text-red-700 dark:text-red-400">
        ✕ Tu PWA no puede recibir notificaciones. Revisa los checks en rojo.
      </span>
    </div>

    <!-- Acción: pedir permiso si no está concedido -->
    <button
      v-if="checks.find(c => c.id === 'notification_permission')?.status !== 'ok'"
      class="w-full py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium transition"
      @click="handleRequestPermission"
    >
      Solicitar permiso de notificaciones
    </button>
  </div>
</template>
