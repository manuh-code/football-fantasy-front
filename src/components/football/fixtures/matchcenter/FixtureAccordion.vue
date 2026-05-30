<script setup lang="ts">
import { ref } from "vue";

interface Props {
  title: string;
  icon?: string;
  iconClass?: string;
  defaultOpen?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  defaultOpen: true,
});

const isOpen = ref(props.defaultOpen);

const toggle = () => {
  isOpen.value = !isOpen.value;
};
</script>

<template>
  <section class="border-t border-gray-100 dark:border-gray-800">
    <button
      type="button"
      @click="toggle"
      :aria-expanded="isOpen"
      class="w-full flex items-center justify-between gap-3 px-4 py-3.5 text-left transition-colors active:bg-gray-50 dark:active:bg-gray-800/40 hover:bg-gray-50/60 dark:hover:bg-gray-800/30"
    >
      <div class="flex items-center gap-2 min-w-0">
        <v-icon
          v-if="icon"
          :name="icon"
          class="w-[18px] h-[18px] shrink-0"
          :class="iconClass ?? 'text-emerald-500 dark:text-emerald-400'"
        />
        <h3 class="text-[15px] font-bold text-gray-900 dark:text-white truncate">
          {{ title }}
        </h3>
        <slot name="trailing" />
      </div>
      <v-icon
        name="hi-chevron-down"
        class="w-4 h-4 text-gray-400 dark:text-gray-500 transition-transform duration-300 shrink-0"
        :class="{ 'rotate-180': isOpen }"
      />
    </button>

    <!-- Animated body. Content stays mounted (preserves state) and is hidden via max-height + opacity. -->
    <div
      class="overflow-hidden transition-[max-height,opacity] duration-300 ease-out"
      :style="{
        maxHeight: isOpen ? '8000px' : '0px',
        opacity: isOpen ? 1 : 0,
      }"
      :aria-hidden="!isOpen"
    >
      <div :inert="!isOpen">
        <slot />
      </div>
    </div>
  </section>
</template>
