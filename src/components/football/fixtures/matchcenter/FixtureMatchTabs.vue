<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import TabsMenu from "@/components/ui/TabsMenu.vue";

// Linear menu for the Match Center sections. Delegates the scrollable pill
// design + overflow hints to the shared TabsMenu component.
export type MatchTab = "info" | "comments" | "events" | "stats" | "lineups" | "head2head" | "playerstats";

const activeTab = defineModel<MatchTab>({ required: true });

const { t } = useI18n();

const tabs = computed<{ key: MatchTab; label: string; icon: string }[]>(() => [
  { key: "info", label: t("football.matchCenter.tabs.info"), icon: "hi-solid-information-circle" },
  { key: "comments", label: t("football.matchCenter.tabs.comments"), icon: "bi-chat-left-dots-fill" },
  { key: "events", label: t("football.matchCenter.tabs.events"), icon: "md-sportssoccer" },
  { key: "stats", label: t("football.matchCenter.tabs.stats"), icon: "hi-solid-chart-bar" },
  { key: "lineups", label: t("football.matchCenter.tabs.lineups"), icon: "hi-solid-users" },
  { key: "playerstats", label: t("football.matchCenter.tabs.players"), icon: "hi-solid-star" },
  { key: "head2head", label: t("football.matchCenter.tabs.head2head"), icon: "md-comparearrows-round" },
]);
</script>

<template>
  <div class="px-4 pt-2 pb-2.5">
    <TabsMenu
      v-model="activeTab"
      :tabs="tabs"
      :aria-label="$t('football.matchCenter.sections')"
    />
  </div>
</template>
