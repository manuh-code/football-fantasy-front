<template>
  <!-- Fantasy league bottom navigation — shared floating pill design. -->
  <BottomNavBar
    :visible="shouldShowMenu"
    :items="items"
    :active-key="activeTab"
    fill
    aria-label="Main navigation"
    @select="onSelect"
  />
</template>

<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { useAuthStore } from "@/store/auth/useAuthStore";
import { useFantasyLeagueDetailStore } from "@/store/fantasy/useFantasyLeagueDetailStore";
import { useRoute, useRouter } from "vue-router";
import BottomNavBar, { type BottomNavItem } from "@/components/ui/BottomNavBar.vue";

const authStore = useAuthStore();
const leagueDetailStore = useFantasyLeagueDetailStore();
const route = useRoute();
const router = useRouter();
const isAuthenticatedRef = ref(false);

// Get active tab from route query or default based on route
const activeTab = computed(() => {
  if (route.name === "playersToDraft") {
    return "myteam";
  }
  if (route.name === "searchPlayerFantasy") {
    return "players";
  }
  return (route.query.tab as string) || "overview";
});

// Get the league UUID from route params
const leagueUuid = computed(() => route.params.uuid as string);

// Only show member-only tabs when user is a member or admin of the league
const canAccessMemberTabs = computed(
  () => leagueDetailStore.isMember || leagueDetailStore.isAdmin,
);

// Tabs shown in the bar. "leagues" is a neutral shortcut (no accent → never
// highlighted); member-only tabs are appended when allowed.
const items = computed<BottomNavItem[]>(() => {
  const list: BottomNavItem[] = [
    { key: "leagues", label: "Leagues", icon: "bi-trophy-fill" },
    { key: "overview", label: "Overview", icon: "hi-solid-information-circle", accent: "blue" },
  ];

  if (canAccessMemberTabs.value) {
    list.push(
      {
        key: "myteam",
        label: "Team",
        icon: "hi-solid-user-group",
        accent: "emerald",
        disabled: leagueDetailStore.isDraftNotStarted,
      },
      { key: "players", label: "Players", icon: "hi-solid-user-add", accent: "orange" },
      { key: "matches", label: "Matches", icon: "gi-crossed-swords", accent: "red" },
    );
  }

  return list;
});

// Only show footer menu in fantasy league related routes when authenticated
const shouldShowMenu = computed(() => {
  if (!isAuthenticatedRef.value) return false;
  const fantasyRoutes = ["fantasyLeagueDetail", "searchPlayerFantasy"];
  return fantasyRoutes.includes(route.name as string);
});

// Watch for token changes to update authentication status (immediate covers mount)
watch(
  () => authStore.token,
  async (newToken) => {
    if (newToken) {
      isAuthenticatedRef.value = await authStore.isAuthenticated();
    } else {
      isAuthenticatedRef.value = false;
    }
  },
  { immediate: true },
);

// Route a tab selection to its action.
function onSelect(key: string) {
  if (key === "leagues") {
    goToMyLeagues();
  } else if (key === "players") {
    goToSearchPlayers();
  } else {
    handleTabChange(key);
  }
}

// Handle tab change
function handleTabChange(tab: string) {
  if (route.name === "fantasyLeagueDetail") {
    router.replace({
      query: { ...route.query, tab },
    });
  } else {
    router.push({
      name: "fantasyLeagueDetail",
      params: { uuid: leagueUuid.value },
      query: { tab },
    });
  }
}

function goToSearchPlayers() {
  if (!leagueUuid.value) return;
  router.push({
    name: "searchPlayerFantasy",
    params: { uuid: leagueUuid.value },
  });
}

function goToMyLeagues() {
  router.push({ name: "userFantasyLeague" });
}
</script>
