<template>
  <div
    class="flex items-center gap-3 px-4 py-2.5 cursor-pointer active:bg-gray-50 dark:active:bg-gray-700/40 transition-colors"
    :class="active ? tintClass : ''"
    @click="emit('add')"
  >
    <span
      class="inline-flex items-center justify-center w-7 h-7 rounded-lg text-2xs font-bold shrink-0"
      :class="active ? badgeActiveClass : badgeIdleClass"
    >{{ code }}</span>

    <div
      class="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
      :class="active
        ? 'bg-emerald-100 dark:bg-emerald-900/30 border-2 border-emerald-400 dark:border-emerald-500'
        : 'bg-gray-100 dark:bg-gray-700 border border-dashed border-gray-300 dark:border-gray-600'"
    >
      <v-icon v-if="active" name="hi-solid-switch-horizontal" class="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
      <v-icon v-else name="hi-solid-plus" class="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
    </div>

    <p
      class="text-xs"
      :class="active ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-gray-400 dark:text-gray-500'"
    >{{ label }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import {
  SLOT_BADGE_ACTIVE,
  SLOT_BADGE_IDLE,
  SLOT_TINT,
  SLOT_CODE,
  type LineupVariant,
} from "@/components/fantasy/lineup/lineupVariants";

interface Props {
  variant: LineupVariant;
  /** This slot is the current drop target (emerald highlight). */
  active?: boolean;
  /** Localized call-to-action text ("Add goalkeeper" / "Place here"). */
  label: string;
}

const props = withDefaults(defineProps<Props>(), {
  active: false,
});

/**
 * Una sola acción: llenar el hueco. Quién lo llena —un suplente o un fichaje—
 * lo decide `StartersTable`, que es quien conoce la plantilla; aquí el botón
 * de cambio aparte solo repetía la mitad de eso en un icono que no se leía.
 */
const emit = defineEmits<{
  add: [];
}>();

const code = computed(() => SLOT_CODE[props.variant]);
const tintClass = computed(() => SLOT_TINT[props.variant]);
const badgeActiveClass = computed(() => SLOT_BADGE_ACTIVE[props.variant]);
const badgeIdleClass = computed(() => SLOT_BADGE_IDLE[props.variant]);
</script>
