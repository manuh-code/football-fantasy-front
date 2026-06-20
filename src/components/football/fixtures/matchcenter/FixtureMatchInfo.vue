<script setup lang="ts">
import type { FootballVenueResponse } from "@/interfaces/football/venue/FootballVenueResponse";
import type { FootballWeatherReportResponse } from "@/interfaces/football/fixture/FootballWeatherReportResponse";

interface Props {
  venue: FootballVenueResponse | null;
  weather: FootballWeatherReportResponse | null;
}

defineProps<Props>();
</script>

<template>
  <div class="px-4 pt-2 pb-5">
    <div class="rounded-2xl bg-gray-50 dark:bg-gray-800/50 p-3 space-y-2">
      <div
        v-if="venue?.name"
        class="flex items-start gap-2 text-xs text-gray-700 dark:text-gray-300"
      >
        <v-icon
          name="hi-solid-location-marker"
          class="w-3.5 h-3.5 mt-0.5 text-gray-400 shrink-0"
        />
        <div class="min-w-0">
          <p class="font-medium truncate">{{ venue.name }}</p>
          <p
            v-if="venue.city_name || venue.capacity"
            class="text-2xs text-gray-500 dark:text-gray-400"
          >
            <span v-if="venue.city_name">{{ venue.city_name }}</span>
            <span v-if="venue.city_name && venue.capacity"> • </span>
            <span v-if="venue.capacity">{{ venue.capacity.toLocaleString() }} capacity</span>
          </p>
        </div>
      </div>

      <div
        v-if="weather"
        class="flex items-start gap-2 text-xs text-gray-700 dark:text-gray-300"
      >
        <img
          v-if="weather.icon"
          :src="weather.icon"
          :alt="weather.description"
          class="w-4 h-4 mt-0.5 shrink-0"
        />
        <div class="min-w-0">
          <p class="font-medium capitalize truncate">{{ weather.description }}</p>
          <p class="text-2xs text-gray-500 dark:text-gray-400 tabular-nums">
            {{ Math.round(weather.current?.temp ?? weather.temperature?.day ?? 0) }}°C
            • {{ weather.humidity }} humidity
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
