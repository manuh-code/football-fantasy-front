<template>
  <div class="space-y-2">
    <label
      v-if="label"
      :for="id"
      class="block text-sm font-medium text-gray-700 dark:text-gray-300"
    >
      {{ label }}
    </label>

    <div class="relative">
      <button
        :id="id"
        type="button"
        :disabled="disabled"
        :class="fieldClasses"
        aria-haspopup="dialog"
        :aria-expanded="showPicker"
        :aria-invalid="!!error"
        :aria-describedby="describedBy"
        @click="open"
      >
        <span
          class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
          aria-hidden="true"
        >
          <svg class="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zM4 8h12v8H4V8z" clip-rule="evenodd" />
          </svg>
        </span>
        <span :class="displayValue ? '' : 'text-gray-400 dark:text-gray-500'">
          {{ displayValue || placeholder }}
        </span>
      </button>
    </div>

    <p v-if="error" :id="`${id}-error`" class="text-sm text-red-600 dark:text-red-400">{{ error }}</p>
    <p v-else-if="helpText" :id="`${id}-help`" class="text-sm text-gray-500 dark:text-gray-400">{{ helpText }}</p>

    <!--
      El calendario va en una hoja propia, no en un popup dentro del campo.

      Antes era un `position: absolute` colgando del input, y este campo suele
      vivir dentro de otra hoja cuyo contenido es `overflow-y: auto` y cuyo
      contenedor es `overflow: hidden`. Esos dos ancestros lo recortaban: en un
      móvil el calendario medía más que la hoja, así que los selectores de hora
      y el botón de confirmar quedaban fuera de la parte visible y no había
      manera de llegar a ellos.

      Se reutiliza BottomSheet en vez de armar otro overlay porque ya resuelve
      el teletransporte al body, la transición, el bloqueo de scroll y la zona
      segura de iOS — y su prop `zIndex` existe justo para abrirse encima de
      otra hoja.
    -->
    <BottomSheet
      :is-visible="showPicker"
      size="auto"
      role="dialog"
      :aria-label="sheetTitle"
      :z-index="zIndex"
      @close="close"
    >
      <template #header>
        <div>
          <h2 class="text-base font-bold text-gray-900 dark:text-white">{{ sheetTitle }}</h2>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {{ draftPreview || t("ui.dateTimePicker.hint") }}
          </p>
        </div>
      </template>

      <VCalendar
        v-model="selectedDate"
        :min-date="minDateObj"
        :is-dark="isDarkMode"
        color="emerald"
        is-expanded
        trim-weeks
        @dayclick="handleDateSelect"
      />

      <div class="grid grid-cols-2 gap-3 mt-4">
        <label class="flex flex-col gap-1">
          <span class="text-xs font-medium text-gray-500 dark:text-gray-400">
            {{ t("ui.dateTimePicker.hour") }}
          </span>
          <select v-model="selectedHour" class="dtp-select">
            <option v-for="hour in availableHours" :key="hour" :value="hour">
              {{ String(hour).padStart(2, "0") }}:00
            </option>
          </select>
        </label>

        <label class="flex flex-col gap-1">
          <span class="text-xs font-medium text-gray-500 dark:text-gray-400">
            {{ t("ui.dateTimePicker.minute") }}
          </span>
          <select v-model="selectedMinute" class="dtp-select">
            <option v-for="minute in availableMinutes" :key="minute" :value="minute">
              :{{ String(minute).padStart(2, "0") }}
            </option>
          </select>
        </label>
      </div>

      <template #footer>
        <div class="flex gap-2">
          <button
            type="button"
            class="flex-1 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 text-callout font-semibold text-gray-700 dark:text-gray-200 active:scale-[0.98] transition-transform duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400/50"
            @click="close"
          >
            {{ t("common.actions.cancel") }}
          </button>
          <button
            type="button"
            class="flex-1 h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-callout font-semibold active:scale-[0.98] transition-all duration-150 disabled:opacity-60 disabled:active:scale-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
            :disabled="!selectedDate"
            @click="applySelection"
          >
            {{ t("common.actions.confirm") }}
          </button>
        </div>
      </template>
    </BottomSheet>
  </div>
</template>

<script setup lang="ts">
import { computed, onUnmounted, ref, useId, watch } from "vue";
import { useI18n } from "vue-i18n";
import { Calendar as VCalendar } from "v-calendar";
import "v-calendar/style.css";
import BottomSheet from "@/components/ui/BottomSheet.vue";

const props = withDefaults(
  defineProps<{
    modelValue?: string;
    label?: string;
    placeholder?: string;
    error?: string;
    helpText?: string;
    disabled?: boolean;
    /** Fecha mínima seleccionable, en ISO. */
    min?: string;
    id?: string;
    /**
     * Capa de apilado. Por encima de la hoja que suele contener el campo
     * (BottomSheet usa 120 por defecto).
     */
    zIndex?: number;
  }>(),
  {
    modelValue: "",
    placeholder: "",
    zIndex: 140,
  },
);

const emit = defineEmits<{ "update:modelValue": [value: string] }>();

const { t, locale } = useI18n();

// `useId` en vez de Math.random: estable y sin riesgo de colisión.
const generatedId = useId();
const id = computed(() => props.id || `datetime-${generatedId}`);

const MINUTE_STEPS = [0, 15, 30, 45];

const showPicker = ref(false);
const selectedDate = ref<Date | null>(null);
const selectedHour = ref(9);
const selectedMinute = ref(0);

const isDarkMode = ref(
  typeof document !== "undefined" && document.documentElement.classList.contains("dark"),
);

// El tema se sigue con un observer que sí se desconecta al desmontar: antes se
// creaba en onMounted y se quedaba vivo para siempre.
let themeObserver: MutationObserver | null = null;

if (typeof document !== "undefined") {
  themeObserver = new MutationObserver(() => {
    isDarkMode.value = document.documentElement.classList.contains("dark");
  });
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
}

const sheetTitle = computed(() => props.label || t("ui.dateTimePicker.title"));

const minDateObj = computed(() => (props.min ? new Date(props.min) : new Date()));

const isSameDay = (a: Date, b: Date): boolean =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

/**
 * En el día mínimo sólo se ofrecen las horas que todavía no pasaron.
 *
 * `min-date` sólo recorta el calendario: sin esto se podía elegir hoy a las
 * 00:00 y el backend lo rechazaba con un 422 (`draft_day` tiene que ser
 * posterior a ahora en el draft automático).
 */
const availableHours = computed(() => {
  const all = Array.from({ length: 24 }, (_, hour) => hour);
  if (!selectedDate.value || !isSameDay(selectedDate.value, minDateObj.value)) return all;

  return all.filter((hour) => hour >= minDateObj.value.getHours());
});

const availableMinutes = computed(() => {
  if (
    !selectedDate.value ||
    !isSameDay(selectedDate.value, minDateObj.value) ||
    selectedHour.value > minDateObj.value.getHours()
  ) {
    return MINUTE_STEPS;
  }

  return MINUTE_STEPS.filter((minute) => minute > minDateObj.value.getMinutes());
});

const formatDate = (date: Date): string =>
  date.toLocaleDateString(locale.value, {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

const displayValue = computed(() => {
  if (!props.modelValue) return "";

  const date = new Date(props.modelValue);
  return Number.isNaN(date.getTime()) ? props.modelValue : formatDate(date);
});

/** Lo que se va a guardar, mientras se elige. */
const draftPreview = computed(() => {
  if (!selectedDate.value) return "";

  const date = new Date(selectedDate.value);
  date.setHours(selectedHour.value, selectedMinute.value, 0, 0);
  return formatDate(date);
});

const describedBy = computed(() => {
  if (props.error) return `${id.value}-error`;
  return props.helpText ? `${id.value}-help` : undefined;
});

const fieldClasses = computed(() => [
  "relative w-full pl-10 pr-4 py-3 border rounded-xl text-left transition-all",
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:border-emerald-500",
  "dark:bg-gray-700 dark:text-white",
  props.error
    ? "border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20"
    : "border-gray-300 dark:border-gray-600 bg-white hover:border-emerald-300",
  props.disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer",
]);

const syncFromModel = (): void => {
  if (!props.modelValue) return;

  const date = new Date(props.modelValue);
  if (Number.isNaN(date.getTime())) return;

  selectedDate.value = date;
  selectedHour.value = date.getHours();
  // El minuto se ajusta al paso más cercano hacia abajo para que coincida con
  // una opción real del selector.
  selectedMinute.value =
    [...MINUTE_STEPS].reverse().find((step) => step <= date.getMinutes()) ?? 0;
};

const handleDateSelect = (day: { date: Date }): void => {
  selectedDate.value = day.date;
};

const open = (): void => {
  if (props.disabled) return;

  syncFromModel();
  showPicker.value = true;
};

const close = (): void => {
  showPicker.value = false;
};

const applySelection = (): void => {
  if (!selectedDate.value) return;

  const date = new Date(selectedDate.value);
  date.setHours(selectedHour.value, selectedMinute.value, 0, 0);

  // ISO completo, con la `Z`. Antes se recortaba a `YYYY-MM-DDTHH:mm`, y esa
  // cadena sin zona la interpreta como LOCAL quien la vuelva a leer: se elegían
  // las 17:45 y el campo se releía a sí mismo como 23:45 (UTC-6). Con el
  // instante explícito, navegador y backend entienden lo mismo.
  emit("update:modelValue", date.toISOString());
  close();
};

// Si el día elegido deja la hora fuera de rango (hoy, a una hora ya pasada), se
// empuja a la primera válida en vez de guardar algo que el backend rechazará.
watch([availableHours, availableMinutes], () => {
  if (!availableHours.value.includes(selectedHour.value)) {
    selectedHour.value = availableHours.value[0] ?? 0;
  }
  if (!availableMinutes.value.includes(selectedMinute.value)) {
    selectedMinute.value = availableMinutes.value[0] ?? 0;
  }
});

// Al cerrar, el foco vuelve al campo que abrió el selector.
watch(showPicker, (visible) => {
  if (!visible) document.getElementById(id.value)?.focus();
});

watch(() => props.modelValue, syncFromModel, { immediate: true });

onUnmounted(() => themeObserver?.disconnect());
</script>

<style>
.dtp-select {
  width: 100%;
  /* 48px de alto y 16px de texto: por debajo de eso Safari en iOS hace zoom al
     enfocar el desplegable. */
  height: 48px;
  padding: 0 0.75rem;
  font-size: 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.75rem;
  background-color: white;
  color: #374151;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.dtp-select:focus {
  outline: none;
  border-color: #10b981;
  box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
}

.dark .dtp-select {
  background-color: #374151;
  border-color: #4b5563;
  color: white;
}

/* ── v-calendar ─────────────────────────────────────────── */
.vc-container {
  border-radius: 0.75rem;
  /* El calendario ocupa el ancho de la hoja; sin esto v-calendar impone su
     ancho mínimo y en pantallas de 360px se sale. */
  width: 100%;
  border: 0;
}

.vc-day-content:hover {
  background-color: #d1fae5 !important;
  color: #047857 !important;
}

.vc-day.is-today .vc-day-content {
  background-color: #10b981 !important;
  color: white !important;
}

.vc-day.is-selected .vc-day-content {
  background-color: #10b981 !important;
  color: white !important;
}

.dark .vc-container {
  background-color: transparent;
  color: #f9fafb;
}

.dark .vc-header,
.dark .vc-title {
  color: #f9fafb !important;
}

.dark .vc-weekday {
  color: #9ca3af !important;
}

.dark .vc-day-content {
  color: #f9fafb !important;
}

.dark .vc-day-content:hover {
  background-color: #064e3b !important;
  color: #6ee7b7 !important;
}

.dark .vc-day.is-today .vc-day-content,
.dark .vc-day.is-selected .vc-day-content {
  background-color: #059669 !important;
  color: white !important;
}

.dark .vc-arrow {
  color: #9ca3af !important;
}

.dark .vc-arrow:hover {
  background-color: #374151 !important;
  color: #f9fafb !important;
}

.dark .vc-popover-content {
  background-color: #1f2937 !important;
  border-color: #374151 !important;
}
</style>
