<template>
  <!-- Bottom Tab Bar — iOS / Apple Sports style -->
  <nav
    aria-label="Home navigation"
    class="fixed bottom-0 left-0 right-0 z-[100] bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-t border-gray-200/60 dark:border-gray-800/60"
  >
    <div
      class="max-w-lg mx-auto flex items-center justify-around px-6"
      style="padding-bottom: max(0.5rem, env(safe-area-inset-bottom, 0.5rem))"
    >
      <!-- Home Tab -->
      <button
        @click="handleTab('home')"
        class="flex flex-col items-center justify-center gap-0.5 py-2.5 px-4 min-w-[64px] transition-colors duration-150 focus:outline-none"
        :class="[
          activeTab === 'home'
            ? 'text-blue-500 dark:text-blue-400'
            : 'text-gray-400 dark:text-gray-500 active:text-gray-600 dark:active:text-gray-300',
        ]"
        aria-label="Home"
      >
        <v-icon
          name="hi-solid-home"
          class="w-[22px] h-[22px] transition-transform duration-200"
          :class="activeTab === 'home' ? 'scale-110' : ''"
        />
        <span class="text-[10px] font-semibold leading-tight mt-0.5">Home</span>
        <!-- Active indicator dot -->
        <span
          v-if="activeTab === 'home'"
          class="w-1 h-1 rounded-full bg-blue-500 dark:bg-blue-400 mt-0.5"
        />
      </button>

      <!-- Games Tab -->
      <button
        @click="handleTab('games')"
        class="flex flex-col items-center justify-center gap-0.5 py-2.5 px-4 min-w-[64px] transition-colors duration-150 focus:outline-none"
        :class="[
          activeTab === 'games'
            ? 'text-emerald-500 dark:text-emerald-400'
            : 'text-gray-400 dark:text-gray-500 active:text-gray-600 dark:active:text-gray-300',
        ]"
        aria-label="Games"
      >
        <v-icon
          name="hi-solid-lightning-bolt"
          class="w-[22px] h-[22px] transition-transform duration-200"
          :class="activeTab === 'games' ? 'scale-110' : ''"
        />
        <span class="text-[10px] font-semibold leading-tight mt-0.5">Games</span>
        <span
          v-if="activeTab === 'games'"
          class="w-1 h-1 rounded-full bg-emerald-500 dark:bg-emerald-400 mt-0.5"
        />
      </button>

      <!-- Following Tab (Coming Soon) -->
      <button
        @click="handleTab('following')"
        class="flex flex-col items-center justify-center gap-0.5 py-2.5 px-4 min-w-[64px] transition-colors duration-150 focus:outline-none relative"
        :class="[
          activeTab === 'following'
            ? 'text-amber-500 dark:text-amber-400'
            : 'text-gray-400 dark:text-gray-500 active:text-gray-600 dark:active:text-gray-300',
        ]"
        aria-label="Following"
      >
        <div class="relative">
          <v-icon
            name="hi-solid-star"
            class="w-[22px] h-[22px] transition-transform duration-200"
            :class="activeTab === 'following' ? 'scale-110' : ''"
          />
          <!-- "Soon" mini badge -->
          <span
            class="absolute -top-1.5 -right-3 text-[7px] font-bold text-white bg-gray-400 dark:bg-gray-600 rounded-full px-1 py-px leading-none"
          >
            Soon
          </span>
        </div>
        <span class="text-[10px] font-semibold leading-tight mt-0.5">Following</span>
        <span
          v-if="activeTab === 'following'"
          class="w-1 h-1 rounded-full bg-amber-500 dark:bg-amber-400 mt-0.5"
        />
      </button>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useToast } from "@/composables/useToast";

const router = useRouter();
const toast = useToast();

const activeTab = ref<"home" | "games" | "following">("home");

function handleTab(tab: "home" | "games" | "following") {
  activeTab.value = tab;

  switch (tab) {
    case "home":
      // Already on home — no navigation needed
      break;
    case "games":
      router.push({ name: "gaming" });
      break;
    case "following":
      toast.info("Coming Soon", "Following feature will be available soon!");
      break;
  }
}
</script>

<style scoped>
/* Accessibility: Respect user's motion preferences */
@media (prefers-reduced-motion: reduce) {
  button {
    transition: none !important;
  }
  .scale-110 {
    transform: none !important;
  }
}
</style>
