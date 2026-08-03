<template>
  <!-- Primary actions (Gaming + Leagues) in the shared floating pill nav. -->
  <BottomNavBar
    :visible="isVisible"
    :items="items"
    :active-key="activeKey"
    :aria-label="$t('home.nav.ariaLabel')"
    @select="onSelect"
  />
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useFootballLeagueStore } from "@/store/football/league/useFootballLeagueStore";
import BottomNavBar, {
  type BottomNavItem,
} from "@/components/ui/BottomNavBar.vue";

const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const footballLeagueStore = useFootballLeagueStore();

// El hub (`/`) está exento de la selección de liga, así que ahí la nav se
// muestra siempre; en el resto sigue esperando a que haya una liga elegida.
const isVisible = computed(
  () => route.name === "home" || footballLeagueStore.existLeague(),
);

// "Jugar" ocupa la primera posición a propósito: es la acción principal del
// producto. Los datos de liga ("Resultados") quedan después porque son el
// soporte, no el producto.
const items = computed<BottomNavItem[]>(() => [
  { key: "gaming", label: t("home.nav.gaming"), icon: "bi-trophy-fill", accent: "emerald" },
  {
    key: "results",
    label: t("home.nav.results"),
    icon: "hi-solid-chart-bar",
    accent: "emerald",
  },
  {
    key: "leagues",
    label: t("home.nav.leagues"),
    icon: "hi-solid-collection",
    accent: "emerald",
  },
  { key: "following", label: t("home.nav.following"), icon: "hi-solid-star", accent: "emerald" },
]);

// Pool, Survivor and Fantasy-leagues screens are children of the "Play"
// (gaming) section: the fixed nav keeps Play highlighted on them, and pressing
// Play jumps straight back to the hub at `/`.
const GAMING_SECTION_ROUTES = new Set([
  "pools",
  "poolGroup",
  "survivor",
  "survivorDetail",
  "userFantasyLeague",
  "fantasyLeagueDetail",
  "searchPlayerFantasy",
]);
const isGamingSection = computed(() =>
  GAMING_SECTION_ROUTES.has(route.name as string),
);

const activeKey = computed(() => {
  if (route.name === "home" || isGamingSection.value) return "gaming";
  if (route.name === "leagueOverview") return "results";
  if (route.name === "footballLeagues") return "leagues";
  if (route.name === "favorite-football-team") return "following";
  return "";
});

function onSelect(key: string) {
  if (key === "gaming") {
    router.push({ name: "home" });
  } else if (key === "results") {
    router.push({ name: "leagueOverview" });
  } else if (key === "leagues") {
    router.push({ name: "footballLeagues" });
  } else if (key === "following") {
    router.push({ name: "favorite-football-team" });
  }
}
</script>
