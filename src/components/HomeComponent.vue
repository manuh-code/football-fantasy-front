<template>
  <div>
    <RoundFixtureCarousel />
    <FootballLeagueSelectionModal
      :isVisible="showLeagueModal"
      @close="showLeagueModal = false"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import RoundFixtureCarousel from "@/components/football/fixtures/RoundFixtureCarousel.vue";
import FootballLeagueSelectionModal from "@/components/football/leagues/FootballLeagueSelectionModal.vue";
import { useFootballLeagueStore } from "@/store/football/league/useFootballLeagueStore";

const store = useFootballLeagueStore();
const showLeagueModal = ref(false);

onMounted(() => {
  if (!store.existLeague()) showLeagueModal.value = true;
});

watch(
  () => store.getLeague,
  (newLeague) => {
    if (newLeague) showLeagueModal.value = false;
  }
);
</script>

<style scoped>
/* HomeComponent minimal */
</style>
