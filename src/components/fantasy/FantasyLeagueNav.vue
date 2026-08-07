<!--
  Navegación de una liga fantasy, en tres niveles separados a propósito:

    ← nombre de liga   → salir de la liga (subir de nivel)
    [ tira de pestañas ] → moverse entre paneles de la misma liga
    ⋯ Más                → destinos poco frecuentes, en una hoja inferior

  Antes los tres vivían en la misma tira con el mismo peso —hasta diez opciones
  con scroll horizontal— y no había forma de saber cuál te sacaba de dónde. Ver
  `useFantasyLeagueTabs` para el reparto de destinos.
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

    <TabsBar
      :items="primaryTabs"
      :active-key="activeKey"
      layout="stacked"
      :aria-label="$t('fantasy.detailTabs.nav')"
      @select="onTabSelect"
    >
      <template v-if="overflowItems.length" #trailing>
        <!-- Mismo envoltorio que la píldora (p-1 + fondo) para que los dos
             bloques midan exactamente igual de alto. -->
        <div
          class="pointer-events-auto shrink-0 p-1 rounded-full bg-white/80 dark:bg-gray-900/70 backdrop-blur-xl border border-black/[0.04] dark:border-white/10 shadow-lg shadow-black/5 dark:shadow-black/30"
        >
          <button
            type="button"
            aria-haspopup="dialog"
            :aria-expanded="isMoreOpen"
            @click="isMoreOpen = true"
            class="flex flex-col items-center justify-center gap-0.5 px-2.5 py-1.5 min-w-[56px] rounded-full text-2xs whitespace-nowrap cursor-pointer transition-all duration-200 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40"
            :class="isMoreActive
              ? 'text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/15 ring-1 ring-inset ring-emerald-500/30 dark:bg-emerald-400/15 dark:ring-emerald-400/30'
              : 'text-gray-500 dark:text-gray-400 font-semibold'"
          >
            <v-icon :name="moreIcon" class="w-[18px] h-[18px] shrink-0" />
            <!-- Cuando el panel abierto vive en la hoja, el botón toma su
                 nombre: si no, el usuario está en "Trades" y nada en la barra
                 le dice dónde está. -->
            <span class="leading-none tracking-tight">{{ moreLabel }}</span>
          </button>
        </div>
      </template>
    </TabsBar>

    <BottomSheet
      :is-visible="isMoreOpen"
      :title="$t('fantasy.detailTabs.moreTitle')"
      size="auto"
      role="dialog"
      @close="isMoreOpen = false"
    >
      <nav
        :aria-label="$t('fantasy.detailTabs.moreTitle')"
        class="pb-2 divide-y divide-gray-100 dark:divide-gray-800"
      >
        <button
          v-for="item in overflowItems"
          :key="item.key"
          type="button"
          :aria-current="item.key === activeKey ? 'page' : undefined"
          @click="selectOverflow(item.key)"
          class="w-full flex items-center gap-3 min-h-[44px] px-1 py-3 text-left cursor-pointer active:bg-gray-50 dark:active:bg-gray-800/60 transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-500/50"
        >
          <div
            class="w-9 h-9 rounded-xl grid place-items-center shrink-0"
            :class="item.key === activeKey
              ? 'bg-emerald-50 dark:bg-emerald-900/25 text-emerald-600 dark:text-emerald-400'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'"
          >
            <v-icon :name="item.icon" class="w-[18px] h-[18px]" />
          </div>
          <span
            class="flex-1 min-w-0 truncate text-callout"
            :class="item.key === activeKey
              ? 'font-bold text-emerald-600 dark:text-emerald-400'
              : 'font-semibold text-gray-900 dark:text-white'"
          >
            {{ item.label }}
          </span>
          <v-icon
            name="hi-solid-chevron-right"
            class="w-4 h-4 text-gray-300 dark:text-gray-600 shrink-0"
          />
        </button>
      </nav>
    </BottomSheet>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import TabsBar from '@/components/ui/TabsBar.vue'
import BottomSheet from '@/components/ui/BottomSheet.vue'
import { useFantasyLeagueTabs } from '@/composables/useFantasyLeagueTabs'

const props = defineProps<{
  /** Panel activo. Debe coincidir con la `key` de una pestaña o de la hoja. */
  activeKey: string
  leagueUuid: string
}>()

const { t } = useI18n()
const { primaryTabs, overflowItems, leagueName, goToLeagues, onTabSelect } =
  useFantasyLeagueTabs(() => props.leagueUuid)

const isMoreOpen = ref(false)

const activeOverflow = computed(
  () => overflowItems.value.find((item) => item.key === props.activeKey) ?? null,
)
const isMoreActive = computed(() => activeOverflow.value !== null)
const moreLabel = computed(() => activeOverflow.value?.label ?? t('fantasy.detailTabs.more'))
const moreIcon = computed(() => activeOverflow.value?.icon ?? 'hi-solid-dots-horizontal')

const selectOverflow = (key: string) => {
  isMoreOpen.value = false
  onTabSelect(key)
}

// Un cambio de panel desde fuera (atrás del navegador, enlace compartido) debe
// cerrar la hoja: si no, se queda abierta encima del panel nuevo.
watch(() => props.activeKey, () => (isMoreOpen.value = false))
</script>
