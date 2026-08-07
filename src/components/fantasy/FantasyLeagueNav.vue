<!--
  Navegación de una liga fantasy, en tres niveles separados a propósito:

    ← nombre de liga   → salir de la liga (subir de nivel)
    [ tira de pestañas ] → moverse entre paneles de la misma liga
    ⋯ Más                → destinos poco frecuentes, en una hoja inferior

  Antes los tres vivían en la misma tira con el mismo peso —hasta diez opciones
  con scroll horizontal— y no había forma de saber cuál te sacaba de dónde. Ver
  `useFantasyLeagueTabs` para el reparto de destinos; el botón "Más" y su hoja
  los pone `TabsBar`, que es donde vive ese patrón para toda la app.
-->
<template>
  <div>
    <!-- Fila 1. No es sticky: es orientación, no acción, y fijarla robaría
         altura útil en cada scroll. -->
    <div class="flex items-center gap-1.5 mb-3">
      <button
        type="button"
        @click="goToLeagues"
        :aria-label="$t('fantasy.detailTabs.back')"
        :title="$t('fantasy.detailTabs.back')"
        class="shrink-0 grid place-items-center w-11 h-11 -ml-2 rounded-full text-gray-500 dark:text-gray-400 cursor-pointer active:bg-gray-100 dark:active:bg-gray-800 transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
      >
        <v-icon name="hi-solid-arrow-left" class="w-5 h-5" />
      </button>

      <h1
        v-if="leagueName"
        class="min-w-0 truncate text-callout font-bold text-gray-900 dark:text-white"
      >
        {{ leagueName }}
      </h1>
      <!-- Reserva el hueco del nombre mientras carga para que la tira de
           pestañas no dé un salto al llegar. -->
      <div v-else class="h-4 w-40 rounded bg-gray-200 dark:bg-gray-800 animate-pulse" />
    </div>

    <!-- El reparto entre tira y hoja es por significado, no por cuántas caben:
         la configuración de la liga se toca una vez y nunca debió competir por
         sitio con lo de cada jornada. -->
    <TabsBar
      :items="primaryTabs"
      :overflow="overflowItems"
      :active-key="activeKey"
      layout="stacked"
      :aria-label="$t('fantasy.detailTabs.nav')"
      :overflow-label="$t('fantasy.detailTabs.more')"
      :overflow-title="$t('fantasy.detailTabs.moreTitle')"
      @select="onTabSelect"
    />
  </div>
</template>

<script setup lang="ts">
import TabsBar from '@/components/ui/TabsBar.vue'
import { useFantasyLeagueTabs } from '@/composables/useFantasyLeagueTabs'

const props = defineProps<{
  /** Panel activo. Debe coincidir con la `key` de una pestaña o de la hoja. */
  activeKey: string
  leagueUuid: string
}>()

const { primaryTabs, overflowItems, leagueName, goToLeagues, onTabSelect } =
  useFantasyLeagueTabs(() => props.leagueUuid)
</script>
