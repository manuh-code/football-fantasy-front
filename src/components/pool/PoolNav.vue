<!--
  Navegación de una quiniela, con el mismo reparto de niveles que la de liga
  fantasy (ver `FantasyLeagueNav`):

    ← nombre de la quiniela → salir a "Mis quinielas" (subir de nivel)
    [ tira de pestañas ]    → moverse entre paneles de la misma quiniela

  Antes "Mis quinielas" era una pestaña más de la tira: salir de la quiniela
  pesaba lo mismo que cambiar de panel, y nada indicaba que ese toque te sacaba
  de la pantalla (regla `nav-hierarchy`). Ahora es la flecha atrás.

  La tira lleva el azul de la sección —las quinielas son azules en toda la app,
  igual que fantasy es verde—; lo que se copia de fantasy es la estructura, no
  el color.
-->
<template>
  <div>
    <!-- Fila 1. No es sticky: es orientación, no acción, y fijarla robaría
         altura útil en cada scroll. -->
    <div class="flex items-center gap-1.5 mb-3">
      <button
        type="button"
        @click="goToPools"
        :aria-label="$t('pool.group.nav.back')"
        :title="$t('pool.group.nav.back')"
        class="shrink-0 grid place-items-center w-11 h-11 -ml-2 rounded-full text-gray-500 dark:text-gray-400 cursor-pointer active:bg-gray-100 dark:active:bg-gray-800 transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50"
      >
        <v-icon name="hi-solid-arrow-left" class="w-5 h-5" />
      </button>

      <h1
        v-if="poolName"
        class="min-w-0 truncate text-callout font-bold text-gray-900 dark:text-white"
      >
        {{ poolName }}
      </h1>
      <!-- Reserva el hueco del nombre mientras carga para que la tira de
           pestañas no dé un salto al llegar. -->
      <div v-else class="h-4 w-40 rounded bg-gray-200 dark:bg-gray-800 animate-pulse" />
    </div>

    <!-- `tablist`, no `navigation`: estas pestañas cambian el panel en sitio, no
         llevan a otra pantalla. La que sí navega es la flecha de arriba. -->
    <TabsBar
      :items="tabs"
      :active-key="activeKey"
      layout="stacked"
      role="tablist"
      default-accent="blue"
      :aria-label="$t('pool.group.nav.aria')"
      @select="emit('select', $event)"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import TabsBar from '@/components/ui/TabsBar.vue'
import type { NavItem } from '@/components/ui/navAccents'

defineProps<{
  /** Panel activo. Debe coincidir con la `key` de una pestaña. */
  activeKey: string
  /** Nombre de la quiniela; vacío mientras carga. */
  poolName?: string
}>()

const emit = defineEmits<{ select: [key: string] }>()

const { t } = useI18n()
const router = useRouter()

// Orden por frecuencia de uso: primero lo que se toca cada jornada (pronosticar,
// mirar cómo va la tabla), después lo que se consulta de vez en cuando. Los
// cuatro caben en la tira a 375px, así que ninguno necesita esconderse tras un
// "Más" —el acento lo pone el chip deslizante, no un color por pestaña—.
const tabs = computed<NavItem[]>(() => [
  { key: 'info', label: t('pool.group.tabs.info'), icon: 'hi-solid-information-circle' },
  { key: 'predictions', label: t('pool.group.tabs.predictions'), icon: 'hi-solid-clipboard-list' },
  { key: 'standings', label: t('pool.group.tabs.standings'), icon: 'bi-trophy-fill' },
  { key: 'rules', label: t('pool.group.tabs.rules'), icon: 'hi-solid-bookmark' },
])

const goToPools = () => {
  router.push({ name: 'pools' })
}
</script>
