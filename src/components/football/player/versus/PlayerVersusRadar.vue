<script setup lang="ts">
import { computed, ref, onMounted, onBeforeUnmount } from "vue";
import { Radar } from "vue-chartjs";
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

interface DatasetInput {
  name: string;
  values: number[];
  /** Hex color, e.g. "#10b981". */
  color: string;
}

const props = defineProps<{
  labels: string[];
  datasetA: DatasetInput;
  datasetB: DatasetInput;
}>();

// Track dark mode so axis/labels stay legible on both themes.
const isDark = ref(false);
let observer: MutationObserver | null = null;
const readDark = () => {
  isDark.value =
    typeof document !== "undefined" &&
    document.documentElement.classList.contains("dark");
};
onMounted(() => {
  readDark();
  observer = new MutationObserver(readDark);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
});
onBeforeUnmount(() => observer?.disconnect());

const hexToRgba = (hex: string, alpha: number): string => {
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const chartData = computed(() => ({
  labels: props.labels,
  datasets: [
    {
      label: props.datasetA.name,
      data: props.datasetA.values,
      borderColor: props.datasetA.color,
      backgroundColor: hexToRgba(props.datasetA.color, 0.15),
      pointBackgroundColor: props.datasetA.color,
      borderWidth: 2,
      pointRadius: 2,
    },
    {
      label: props.datasetB.name,
      data: props.datasetB.values,
      borderColor: props.datasetB.color,
      backgroundColor: hexToRgba(props.datasetB.color, 0.15),
      pointBackgroundColor: props.datasetB.color,
      borderWidth: 2,
      pointRadius: 2,
    },
  ],
}));

const gridColor = "rgba(148, 163, 184, 0.25)";

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    r: {
      min: 0,
      max: 100,
      ticks: { display: false, stepSize: 25 },
      grid: { color: gridColor },
      angleLines: { color: gridColor },
      pointLabels: {
        color: isDark.value ? "#cbd5e1" : "#475569",
        font: { size: 10 },
      },
    },
  },
  plugins: {
    legend: { display: false },
    tooltip: { enabled: true },
  },
}));
</script>

<template>
  <div class="h-[280px] w-full">
    <Radar :data="chartData" :options="chartOptions" />
  </div>
</template>
