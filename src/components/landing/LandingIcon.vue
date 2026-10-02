<template>
  <!-- Íconos de la landing, dibujados aquí con una sola retícula (24 px, trazo 2,
       puntas redondas) en lugar de registrar más íconos globales en
       oh-vue-icons: solo esta página los usa y así no engordan el bundle
       principal. -->
  <svg class="lp-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path
      v-if="name === 'play'"
      d="M7.5 5.3v13.4c0 .8.86 1.28 1.54.86l10.6-6.7c.62-.4.62-1.32 0-1.72L9.04 4.44c-.68-.43-1.54.06-1.54.86Z"
      fill="currentColor"
    />
    <g v-else-if="name === 'pause'" fill="currentColor">
      <rect x="6.25" y="5" width="4" height="14" rx="1.2" />
      <rect x="13.75" y="5" width="4" height="14" rx="1.2" />
    </g>
    <g v-else-if="name === 'sound-on'" class="lp-icon__stroke">
      <path d="M4 9.5v5h3.4l4.6 4V5.5l-4.6 4Z" />
      <path d="M15.6 9.3a3.9 3.9 0 0 1 0 5.4" />
      <path d="M18.3 6.6a7.7 7.7 0 0 1 0 10.8" />
    </g>
    <g v-else-if="name === 'sound-off'" class="lp-icon__stroke">
      <path d="M4 9.5v5h3.4l4.6 4V5.5l-4.6 4Z" />
      <path d="m16 9.5 5 5m0-5-5 5" />
    </g>
    <path v-else-if="name === 'chevron-left'" class="lp-icon__stroke" d="m14.5 6-6 6 6 6" />
    <path v-else-if="name === 'chevron-right'" class="lp-icon__stroke" d="m9.5 6 6 6-6 6" />
    <path v-else-if="name === 'arrow-right'" class="lp-icon__stroke" d="M5 12h14m-6-6 6 6-6 6" />
    <!-- El triángulo de Google Play en un solo color: sus cuatro gajos se
         separan por opacidad, porque la insignia "próximamente" va apagada. -->
    <g v-else-if="name === 'google-play'" fill="currentColor" class="lp-icon__play">
      <path d="M4 2.6v18.8l8.2-9.4Z" />
      <path d="M4 2.6 16.4 9.4 12.2 12Z" opacity=".72" />
      <path d="m12.2 12 4.2-2.6 4.8 2.6-4.8 2.6Z" opacity=".5" />
      <path d="M4 21.4 12.2 12l4.2 2.6Z" opacity=".36" />
    </g>
  </svg>
</template>

<script setup lang="ts">
export type LandingIconName =
  | 'play'
  | 'pause'
  | 'sound-on'
  | 'sound-off'
  | 'chevron-left'
  | 'chevron-right'
  | 'arrow-right'
  | 'google-play'

defineProps<{ name: LandingIconName }>()
</script>

<style scoped>
.lp-icon {
  width: 1em;
  height: 1em;
  flex-shrink: 0;
}
.lp-icon__stroke,
.lp-icon__stroke path {
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.lp-icon__play path {
  stroke: var(--icon-gap, #0b0b0b);
  stroke-width: 0.7;
  stroke-linejoin: round;
}
</style>
