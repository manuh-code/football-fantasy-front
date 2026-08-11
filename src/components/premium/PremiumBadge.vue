<template>
  <span
    class="inline-flex items-center gap-1 rounded-full font-bold uppercase tracking-wide bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 shadow-sm"
    :class="sizeClasses"
  >
    <v-icon v-if="showIcon" name="hi-solid-sparkles" :class="iconClasses" />
    {{ $t('premium.badge') }}
  </span>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

/**
 * Insignia PRO para marcar lo que sólo abre la suscripción.
 *
 * Dorada y no del verde de la app a propósito: es la única cosa de la interfaz
 * que significa "esto se paga", y confundirla con un estado normal le quita
 * justo el poder que tiene que tener.
 */
interface Props {
  size?: 'xs' | 'sm'
  showIcon?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 'xs',
  showIcon: true,
})

const sizeClasses = computed(() =>
  props.size === 'sm' ? 'text-[11px] px-2 py-0.5' : 'text-[10px] px-1.5 py-px'
)

const iconClasses = computed(() =>
  props.size === 'sm' ? 'w-3 h-3' : 'w-2.5 h-2.5'
)
</script>
