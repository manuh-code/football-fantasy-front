<template>
  <!-- Floating glassmorphism pill nav — Instagram / iOS inspired.
       The <nav> spans the row but is click-through; only the capsule is interactive. -->
  <nav
    :aria-label="$t('home.nav.ariaLabel')"
    class="fixed inset-x-0 bottom-0 z-[100] pointer-events-none"
    style="padding-bottom: max(0.75rem, env(safe-area-inset-bottom, 0.75rem))"
  >
    <div
      class="pointer-events-auto mx-auto w-[70%] min-w-[260px] max-w-md flex items-center gap-1 p-1.5 rounded-full bg-white/60 dark:bg-gray-900/55 backdrop-blur-2xl border border-white/50 dark:border-white/10 ring-1 ring-black/5 dark:ring-white/5 shadow-[0_8px_30px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.5)]"
    >
      <button
        v-for="tab in tabs"
        :key="tab.key"
        @click="handleTab(tab.key)"
        type="button"
        :aria-label="tab.label"
        :aria-current="activeTab === tab.key ? 'page' : undefined"
        class="relative flex-1 flex flex-col items-center justify-center gap-0.5 py-2 rounded-full transition-all duration-200 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-current/40"
        :class="
          activeTab === tab.key
            ? [tab.activeBg, tab.activeText]
            : 'text-gray-400 dark:text-gray-500 active:text-gray-600 dark:active:text-gray-300'
        "
      >
        <div class="relative">
          <v-icon
            :name="tab.icon"
            class="w-[22px] h-[22px] transition-transform duration-200"
            :class="activeTab === tab.key ? 'scale-110' : ''"
          />
          <!-- "Soon" mini badge -->
          <span
            v-if="tab.badge"
            class="absolute -top-1.5 -right-3 text-2xs font-bold text-white bg-gray-400 dark:bg-gray-600 rounded-full px-1 py-px leading-none"
          >
            {{ tab.badge }}
          </span>
        </div>
        <span class="text-2xs font-semibold leading-tight">{{ tab.label }}</span>
      </button>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useToast } from "@/composables/useToast";

const router = useRouter();
const { t } = useI18n();
const toast = useToast();

type TabKey = "home" | "games" | "following";

interface TabItem {
  key: TabKey;
  label: string;
  icon: string;
  /** Text color when the tab is active. */
  activeText: string;
  /** Soft accent pill behind the active tab. */
  activeBg: string;
  badge?: string;
}

const tabs = computed<TabItem[]>(() => [
  {
    key: "home",
    label: t("home.nav.home"),
    icon: "hi-solid-home",
    activeText: "text-emerald-600 dark:text-emerald-400",
    activeBg: "bg-emerald-500/15 dark:bg-emerald-400/15",
  },
  {
    key: "games",
    label: t("home.nav.games"),
    icon: "hi-solid-lightning-bolt",
    activeText: "text-emerald-600 dark:text-emerald-400",
    activeBg: "bg-emerald-500/15 dark:bg-emerald-400/15",
  },
  {
    key: "following",
    label: t("home.nav.following"),
    icon: "hi-solid-star",
    activeText: "text-amber-600 dark:text-amber-400",
    activeBg: "bg-amber-500/15 dark:bg-amber-400/15",
    badge: t("home.nav.soon"),
  },
]);

const activeTab = ref<TabKey>("home");

function handleTab(tab: TabKey) {
  activeTab.value = tab;

  switch (tab) {
    case "home":
      // Already on home — no navigation needed
      break;
    case "games":
      router.push({ name: "gaming" });
      break;
    case "following":
      toast.info(t("home.following.soonTitle"), t("home.following.soonMessage"));
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
