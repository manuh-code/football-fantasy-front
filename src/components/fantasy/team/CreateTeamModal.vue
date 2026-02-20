<template>
  <BottomSheet
    :is-visible="isVisible"
    title="Welcome to the League!"
    subtitle="One more step to start competing"
    icon="hi-solid-sparkles"
    icon-variant="emerald"
    size="sm"
    @close="$emit('close')"
  >
    <!-- Illustration -->
    <div class="flex flex-col items-center text-center py-4">
      <!-- Trophy / Team icon -->
      <div class="relative mb-5">
        <div class="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
          <v-icon name="hi-solid-user-group" class="w-10 h-10 text-white" />
        </div>
        <!-- Floating badge -->
        <div class="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center shadow-md animate-bounce-subtle">
          <v-icon name="hi-solid-plus" class="w-4 h-4 text-white" />
        </div>
      </div>

      <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-2">
        Create Your Fantasy Team
      </h3>
      <p class="text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-xs">
        You don't have a team in this league yet. Set up your team name and start building your dream squad!
      </p>

      <!-- Feature highlights -->
      <div class="flex items-center justify-center gap-4 mt-5 mb-2">
        <div class="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
          <v-icon name="hi-solid-lightning-bolt" class="w-3.5 h-3.5 text-amber-500" />
          <span>Quick setup</span>
        </div>
        <div class="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
        <div class="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
          <v-icon name="hi-solid-clock" class="w-3.5 h-3.5 text-blue-500" />
          <span>Less than 1 min</span>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex flex-col gap-2.5">
        <!-- Primary CTA -->
        <button
          @click="$emit('create')"
          class="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] text-white text-sm font-semibold transition-all duration-200 shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
        >
          <v-icon name="hi-solid-plus-circle" class="w-5 h-5" />
          Create My Team
        </button>
        <!-- Secondary -->
        <button
          @click="$emit('close')"
          class="w-full py-3 rounded-xl text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          Maybe Later
        </button>
      </div>
    </template>
  </BottomSheet>
</template>

<script setup lang="ts">
import BottomSheet from '@/components/ui/BottomSheet.vue'

interface Props {
  isVisible: boolean
}

defineProps<Props>()

defineEmits<{
  close: []
  create: []
}>()
</script>

<style scoped>
.animate-bounce-subtle {
  animation: bounceSoft 2s ease-in-out infinite;
}

@keyframes bounceSoft {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}

@media (prefers-reduced-motion: reduce) {
  .animate-bounce-subtle {
    animation: none !important;
  }
}
</style>
