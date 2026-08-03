<template>
  <img
    v-if="team.image_path"
    :src="team.image_path"
    :alt="team.team_name"
    class="w-full h-full object-cover"
    @error="onImageError"
  />
  <!-- Crests come back as raw <svg> markup from the team builder -->
  <div
    v-else-if="team.svg"
    v-html="team.svg"
    class="crest-svg w-full h-full flex items-center justify-center"
  />
  <v-icon v-else name="hi-solid-user-group" class="w-3.5 h-3.5 text-gray-300 dark:text-gray-500" />
</template>

<script setup lang="ts">
import type { FantasyTeamData } from "@/interfaces/fantasy/team/FantasyUserTeamResponse";

defineProps<{ team: FantasyTeamData }>();

const onImageError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  if (!img.dataset.fallbackUsed) {
    img.dataset.fallbackUsed = "true";
    img.src = "/img/default-avatar.svg";
  }
};
</script>

<style scoped>
.crest-svg :deep(svg) {
  width: 100%;
  height: 100%;
}
</style>
