<template>
  <BottomSheet
    :is-visible="modelValue"
    size="md"
    icon="hi-solid-users"
    icon-variant="emerald"
    :title="$t('fantasy.draft.presence.title')"
    :subtitle="$t('fantasy.draft.presence.summary', { online: onlineCount, total: contenders.length })"
    role="dialog"
    autofocus
    @close="emit('update:modelValue', false)"
  >
    <ul class="divide-y divide-gray-100 dark:divide-gray-700/60">
      <li
        v-for="contender in contenders"
        :key="contender.key"
        class="flex items-center gap-3 py-2.5"
      >
        <div class="relative shrink-0">
          <img
            v-if="contender.avatar"
            :src="contender.avatar"
            :alt="''"
            class="w-9 h-9 rounded-full object-cover bg-gray-100 dark:bg-gray-700"
          >
          <div
            v-else
            class="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-2xs font-semibold text-gray-600 dark:text-gray-300"
          >
            {{ contender.initials }}
          </div>
          <!-- Mismo punto que el board, con el mismo significado: quien no está
               en la sala pierde el turno en 30 segundos. -->
          <span
            v-if="contender.isOnline"
            class="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 ring-2 ring-white dark:ring-gray-800"
          />
        </div>

        <div class="min-w-0 flex-1">
          <p class="text-footnote truncate text-gray-900 dark:text-white" :class="contender.isMe ? 'font-semibold' : ''">
            {{ contender.isMe ? `${contender.name} (${$t('fantasy.draft.presence.you')})` : contender.name }}
          </p>
          <p class="text-2xs truncate" :class="statusClass(contender)">
            {{ statusText(contender) }}
          </p>
        </div>
      </li>
    </ul>
  </BottomSheet>
</template>

<script setup lang="ts">
/**
 * Quién está en la sala ahora mismo.
 *
 * Existe porque hasta ahora la presencia solo se veía como un contador
 * (`4/10 en línea`) y un punto verde diminuto en el board: bastaba para saber
 * *cuántos*, pero no *quién* — y en un draft eso es justo lo que decide si
 * merece la pena esperar el turno de alguien o si va a resolverse por autopick.
 *
 * De solo lectura y sin acciones a propósito: aquí no hay nada que hacer, solo
 * que mirar.
 *
 * El orden es el del draft, no "conectados primero": la sala se lee junto al
 * board, y reordenar por estado obligaría a buscar a cada persona dos veces.
 */
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { BottomSheet } from '@/components/ui'
import type { DraftContender } from '@/components/fantasy/draft/shared/draftShared'

const props = defineProps<{
  modelValue: boolean
  contenders: DraftContender[]
  /** Quién tiene el turno, para marcarlo en la lista. */
  onTheClockKey: string | null
}>()

const emit = defineEmits<{ (e: 'update:modelValue', value: boolean): void }>()

const { t } = useI18n()

const onlineCount = computed(() => props.contenders.filter((c) => c.isOnline).length)

/**
 * El turno manda sobre el resto: alguien en el reloj y desconectado es justo
 * el caso interesante, y decirlo con dos etiquetas separadas lo esconde. Se
 * combinan en una sola línea.
 */
function statusText(contender: DraftContender): string {
  const onTheClock = contender.key === props.onTheClockKey
  if (onTheClock && !contender.isOnline) {
    return `${t('fantasy.draft.presence.onTheClock')} · ${t('fantasy.draft.presence.disconnected')}`
  }
  if (onTheClock) return t('fantasy.draft.presence.onTheClock')
  return contender.isOnline
    ? t('fantasy.draft.presence.connected')
    : t('fantasy.draft.presence.disconnected')
}

function statusClass(contender: DraftContender): string {
  if (!contender.isOnline) return 'text-red-500 dark:text-red-400'
  if (contender.key === props.onTheClockKey) return 'text-emerald-600 dark:text-emerald-400'
  return 'text-gray-500 dark:text-gray-400'
}
</script>
