<script setup lang="ts">
import TabsMenu from "@/components/ui/TabsMenu.vue";

// Linear menu for the Match Center sections. Delegates the scrollable pill
// design + overflow hints to the shared TabsMenu component.
export type MatchTab = "info" | "comments" | "events" | "stats" | "lineups" | "head2head" | "playerstats";

const activeTab = defineModel<MatchTab>({ required: true });

const tabs: { key: MatchTab; label: string; icon: string }[] = [
  { key: "info", label: "Info", icon: "hi-solid-information-circle" },
  { key: "comments", label: "Comments", icon: "bi-chat-left-dots-fill" },
  { key: "events", label: "Events", icon: "md-sportssoccer" },
  { key: "stats", label: "Stats", icon: "hi-solid-chart-bar" },
  { key: "lineups", label: "Lineups", icon: "hi-solid-users" },
  { key: "playerstats", label: "Players", icon: "hi-solid-star" },
  { key: "head2head", label: "H2H", icon: "md-comparearrows-round" },
];
</script>

<template>
  <div class="px-4 pt-2 pb-2.5">
    <TabsMenu
      v-model="activeTab"
      :tabs="tabs"
      aria-label="Match center sections"
    />
  </div>
</template>
