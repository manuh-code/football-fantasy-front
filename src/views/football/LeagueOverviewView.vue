<template>
  <!-- Datos de la liga seleccionada (posiciones, partidos, estadísticas…).
       Vivía en `/` hasta que la raíz pasó a ser el hub de juego; conserva las
       metaetiquetas de aquella ruta para no perder el posicionamiento de
       "posiciones y resultados en vivo". Ver el comentario de `leagueOverview`
       en src/router/index.ts. -->
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-4 md:py-8 pb-24 md:pb-8">
    <div class="container mx-auto px-4 max-w-7xl">
      <HomeComponent />
    </div>
  </div>
  <HomeMenu />
</template>

<script lang="ts" setup>
import HomeComponent from "@/components/HomeComponent.vue";
import HomeMenu from "@/components/home/HomeMenu.vue";
</script>
