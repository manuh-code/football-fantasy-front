<template>
  <!-- Primary actions (Gaming + Leagues) in the shared floating pill nav. -->
  <BottomNavBar
    :visible="isVisible"
    :items="items"
    :active-key="activeKey"
    aria-label="Home navigation"
    @select="onSelect"
  />
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useFootballLeagueStore } from "@/store/football/league/useFootballLeagueStore";
import BottomNavBar, {
  type BottomNavItem,
} from "@/components/ui/BottomNavBar.vue";

const route = useRoute();
const router = useRouter();
const footballLeagueStore = useFootballLeagueStore();

const isVisible = computed(() => footballLeagueStore.existLeague());

const items: BottomNavItem[] = [
  {
    key: "home",
    label: "Home",
    icon: "hi-solid-home",
    accent: "blue",
  },
  {
    key: "leagues",
    label: "Leagues",
    icon: "hi-solid-collection",
    accent: "emerald",
  },
  { key: "gaming", label: "Gaming", icon: "bi-trophy-fill", accent: "blue" },
];

const activeKey = computed(() => {
  if (route.name === "gaming") return "gaming";
  if (route.name === "footballLeagues") return "leagues";
  if (route.name === "home") return "home";
  return "";
});

function onSelect(key: string) {
  if (key === "gaming") {
    router.push({ name: "gaming" });
  } else if (key === "leagues") {
    router.push({ name: "footballLeagues" });
  } else if (key === "home") {
    router.push({ name: "home" });
  }
}
</script>
