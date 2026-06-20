<template>
  <div class="space-y-2">
    <!-- Label -->
    <label
      v-if="label"
      :for="id"
      class="block text-sm font-medium text-gray-700 dark:text-gray-300"
    >
      {{ label }}
      <span v-if="required" class="text-red-500 ml-1">*</span>
    </label>

    <!-- Trigger Button -->
    <button
      :id="id"
      type="button"
      @click.stop="toggleDropdown"
      :disabled="disabled"
      :class="triggerClasses"
      :aria-expanded="isOpen"
      aria-haspopup="dialog"
      :aria-describedby="error ? `${id}-error` : undefined"
    >
      <!-- Selected value display -->
      <template v-if="selectedOption">
        <img
          v-if="imageKey && selectedOption[imageKey]"
          :src="String(selectedOption[imageKey]) || defaultImage"
          :alt="String(selectedOption[labelKey])"
          class="w-6 h-6 object-contain flex-shrink-0 rounded"
        />
        <slot name="selected" :option="selectedOption">
          <span class="text-sm font-medium text-gray-900 dark:text-white truncate flex-1">
            {{ selectedOption[labelKey] }}
          </span>
        </slot>
        <button
          v-if="clearable && !disabled"
          @click.stop="handleClear"
          class="flex-shrink-0 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          title="Clear selection"
        >
          <v-icon name="hi-solid-x" class="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
        </button>
      </template>

      <!-- Placeholder -->
      <template v-else>
        <v-icon
          v-if="searchable"
          name="hi-solid-search"
          class="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0"
        />
        <span class="text-sm text-gray-400 dark:text-gray-500 flex-1">
          {{ placeholder }}
        </span>
      </template>

      <!-- Loading indicator -->
      <v-icon
        v-if="loading"
        name="pr-spinner"
        class="w-4 h-4 text-gray-400 flex-shrink-0"
        animation="spin"
      />

      <!-- Chevron -->
      <v-icon
        v-if="!loading"
        name="hi-solid-chevron-down"
        class="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0 transition-transform duration-200"
        :class="{ 'rotate-180': isOpen }"
      />
    </button>

    <!-- Error message -->
    <p
      v-if="error"
      :id="`${id}-error`"
      class="text-sm text-red-600 dark:text-red-400"
    >
      {{ error }}
    </p>
  </div>

  <!-- Options drawer (bottom-sheet, consistent with the rest of the app) -->
  <Teleport to="body">
    <!-- Backdrop -->
    <Transition name="ss-fade">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-[130] bg-black/60 backdrop-blur-sm"
        @click="closeDropdown"
      />
    </Transition>

    <!-- Sheet -->
    <Transition name="ss-slide">
      <div
        v-if="isOpen"
        class="fixed bottom-0 left-0 right-0 z-[140] md:left-4 md:right-4 md:bottom-4 md:max-w-md md:mx-auto pointer-events-none"
      >
        <div
          :style="{
            transform: `translateY(${dragOffsetY}px)`,
            transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)',
          }"
          class="flex flex-col bg-white dark:bg-gray-900 shadow-2xl rounded-t-3xl md:rounded-3xl max-h-[80dvh] overflow-hidden pointer-events-auto"
          role="dialog"
          aria-modal="true"
          :aria-label="label || placeholder"
        >
          <!-- Draggable header -->
          <div
            @pointerdown="onDragStart"
            @pointermove="onDragMove"
            @pointerup="onDragEnd"
            @pointercancel="onDragEnd"
            class="relative shrink-0 cursor-grab active:cursor-grabbing touch-none select-none"
          >
            <div class="flex justify-center pt-2.5 pb-1.5">
              <div class="w-10 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600" />
            </div>
            <div class="flex items-center justify-between px-4 pb-2.5 pt-1">
              <h3 class="text-callout font-bold text-gray-900 dark:text-white truncate">
                {{ label || placeholder }}
              </h3>
              <button
                @click.stop="closeDropdown"
                @pointerdown.stop
                class="w-8 h-8 -mr-1 flex items-center justify-center rounded-full text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Close"
              >
                <v-icon name="hi-x" class="w-4 h-4" />
              </button>
            </div>
          </div>

          <!-- Search Input -->
          <div
            v-if="searchable"
            class="shrink-0 px-4 pb-3 pt-1 border-b border-gray-100 dark:border-gray-800"
          >
            <div class="relative">
              <v-icon
                name="hi-solid-search"
                class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
              />
              <input
                ref="searchInputRef"
                v-model="searchQuery"
                type="text"
                :placeholder="searchPlaceholder"
                class="w-full h-10 pl-9 pr-3 text-sm bg-gray-100 dark:bg-gray-800 border border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:focus:ring-indigo-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                @click.stop
              />
            </div>
          </div>

          <!-- Options List -->
          <div
            class="flex-1 overflow-y-auto overscroll-contain px-2 py-1.5"
            style="padding-bottom: calc(1rem + env(safe-area-inset-bottom))"
          >
            <!-- "All" / Default option -->
            <button
              v-if="allOption"
              @click.stop="handleSelect(allOptionValue)"
              class="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-colors duration-150"
              :class="[
                modelValue === allOptionValue || modelValue === null || modelValue === ''
                  ? `${accentBgClass} ${accentTextClass}`
                  : 'hover:bg-gray-50 dark:hover:bg-gray-800/50 active:bg-gray-100 dark:active:bg-gray-800 text-gray-700 dark:text-gray-300'
              ]"
            >
              <div class="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center flex-shrink-0">
                <v-icon name="hi-solid-view-grid" class="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
              </div>
              <span class="text-sm font-medium">{{ allOptionLabel }}</span>
              <v-icon
                v-if="modelValue === allOptionValue || modelValue === null || modelValue === ''"
                name="hi-solid-check"
                :class="['w-4 h-4 ml-auto', accentCheckClass]"
              />
            </button>

            <!-- Option Items -->
            <button
              v-for="option in filteredOptions"
              :key="String(option[valueKey])"
              @click.stop="handleSelect(option[valueKey])"
              class="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-colors duration-150"
              :class="[
                String(modelValue) === String(option[valueKey])
                  ? `${accentBgClass} ${accentTextClass}`
                  : 'hover:bg-gray-50 dark:hover:bg-gray-800/50 active:bg-gray-100 dark:active:bg-gray-800 text-gray-700 dark:text-gray-300'
              ]"
            >
              <img
                v-if="imageKey && option[imageKey]"
                :src="String(option[imageKey]) || defaultImage"
                :alt="String(option[labelKey])"
                class="w-6 h-6 object-contain flex-shrink-0 rounded"
              />
              <slot name="option" :option="option">
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium truncate">{{ option[labelKey] }}</p>
                  <p
                    v-if="subtitleKey && option[subtitleKey]"
                    class="text-xs text-gray-400 dark:text-gray-500"
                  >
                    {{ option[subtitleKey] }}
                  </p>
                </div>
              </slot>
              <v-icon
                v-if="String(modelValue) === String(option[valueKey])"
                name="hi-solid-check"
                :class="['w-4 h-4 ml-auto flex-shrink-0', accentCheckClass]"
              />
            </button>

            <!-- No results -->
            <div
              v-if="filteredOptions.length === 0 && searchQuery"
              class="px-4 py-8 text-center"
            >
              <v-icon
                name="hi-solid-emoji-sad"
                class="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2"
              />
              <p class="text-sm text-gray-400 dark:text-gray-500">
                {{ noResultsText }} "{{ searchQuery }}"
              </p>
            </div>

            <!-- Empty options -->
            <div
              v-if="options.length === 0 && !searchQuery"
              class="px-4 py-8 text-center"
            >
              <p class="text-sm text-gray-400 dark:text-gray-500">
                {{ noOptionsText }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from "vue";

interface Option {
  [key: string]: unknown;
}

type SelectValue = string | number | null;
type AccentColor = "indigo" | "emerald" | "blue" | "amber" | "rose" | "gray";

interface Props {
  modelValue: SelectValue;
  options: Option[];
  valueKey?: string;
  labelKey?: string;
  imageKey?: string;
  subtitleKey?: string;
  placeholder?: string;
  searchPlaceholder?: string;
  label?: string;
  id?: string;
  required?: boolean;
  disabled?: boolean;
  loading?: boolean;
  error?: string;
  searchable?: boolean;
  clearable?: boolean;
  defaultImage?: string;
  noResultsText?: string;
  noOptionsText?: string;
  allOption?: boolean;
  allOptionLabel?: string;
  allOptionValue?: SelectValue;
  accentColor?: AccentColor;
  /** "default" = bordered input · "minimal" = borderless subtle chip (FotMob style) */
  variant?: "default" | "minimal";
}

const props = withDefaults(defineProps<Props>(), {
  valueKey: "id",
  labelKey: "name",
  placeholder: "Select an option",
  searchPlaceholder: "Search...",
  id: () => `searchable-select-${Math.random().toString(36).substr(2, 9)}`,
  required: false,
  disabled: false,
  loading: false,
  searchable: true,
  clearable: true,
  noResultsText: "No results for",
  noOptionsText: "No options available",
  allOption: false,
  allOptionLabel: "All",
  allOptionValue: "",
  accentColor: "indigo",
  variant: "default",
});

const emit = defineEmits<{
  "update:modelValue": [value: SelectValue];
  change: [value: SelectValue];
}>();

// Refs
const searchInputRef = ref<HTMLInputElement | null>(null);
const isOpen = ref(false);
const searchQuery = ref("");

// Accent color classes
const accentBorderClass = computed(() => {
  const map: Record<string, string> = {
    indigo: "border-indigo-400 dark:border-indigo-500",
    emerald: "border-emerald-400 dark:border-emerald-500",
    blue: "border-blue-400 dark:border-blue-500",
    amber: "border-amber-400 dark:border-amber-500",
    rose: "border-rose-400 dark:border-rose-500",
    gray: "border-gray-400 dark:border-gray-500",
  };
  return map[props.accentColor] || map.indigo;
});

const accentRingClass = computed(() => {
  const map: Record<string, string> = {
    indigo: "ring-indigo-100 dark:ring-indigo-900/30",
    emerald: "ring-emerald-100 dark:ring-emerald-900/30",
    blue: "ring-blue-100 dark:ring-blue-900/30",
    amber: "ring-amber-100 dark:ring-amber-900/30",
    rose: "ring-rose-100 dark:ring-rose-900/30",
    gray: "ring-gray-100 dark:ring-gray-900/30",
  };
  return map[props.accentColor] || map.indigo;
});

const accentBgClass = computed(() => {
  const map: Record<string, string> = {
    indigo: "bg-indigo-50 dark:bg-indigo-900/20",
    emerald: "bg-emerald-50 dark:bg-emerald-900/20",
    blue: "bg-blue-50 dark:bg-blue-900/20",
    amber: "bg-amber-50 dark:bg-amber-900/20",
    rose: "bg-rose-50 dark:bg-rose-900/20",
    gray: "bg-gray-50 dark:bg-gray-700/50",
  };
  return map[props.accentColor] || map.indigo;
});

const accentTextClass = computed(() => {
  const map: Record<string, string> = {
    indigo: "text-indigo-700 dark:text-indigo-300",
    emerald: "text-emerald-700 dark:text-emerald-300",
    blue: "text-blue-700 dark:text-blue-300",
    amber: "text-amber-700 dark:text-amber-300",
    rose: "text-rose-700 dark:text-rose-300",
    gray: "text-gray-700 dark:text-gray-300",
  };
  return map[props.accentColor] || map.indigo;
});

const accentCheckClass = computed(() => {
  const map: Record<string, string> = {
    indigo: "text-indigo-600 dark:text-indigo-400",
    emerald: "text-emerald-600 dark:text-emerald-400",
    blue: "text-blue-600 dark:text-blue-400",
    amber: "text-amber-600 dark:text-amber-400",
    rose: "text-rose-600 dark:text-rose-400",
    gray: "text-gray-600 dark:text-gray-400",
  };
  return map[props.accentColor] || map.indigo;
});

// Trigger button styling — borderless subtle chip for "minimal", bordered input otherwise.
const triggerClasses = computed(() => {
  const base = "w-full flex items-center text-left transition-all duration-200";
  if (props.variant === "minimal") {
    return [
      base,
      "gap-2.5 px-3 py-2 rounded-xl",
      isOpen.value
        ? "bg-gray-100 dark:bg-gray-800"
        : props.error
          ? "bg-red-50 dark:bg-red-900/20"
          : "bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700/50",
      props.disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
    ];
  }
  return [
    base,
    "gap-3 px-3 py-2.5 rounded-lg border",
    isOpen.value
      ? `${accentBorderClass.value} ring-2 ${accentRingClass.value}`
      : props.error
        ? "border-red-300 dark:border-red-600 hover:border-red-400 dark:hover:border-red-500"
        : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500",
    props.disabled
      ? "opacity-50 cursor-not-allowed bg-gray-50 dark:bg-gray-800"
      : "bg-white dark:bg-gray-700/50 cursor-pointer",
  ];
});

// Computed
const selectedOption = computed(() => {
  if (
    props.modelValue === null ||
    props.modelValue === "" ||
    props.modelValue === props.allOptionValue
  ) {
    return null;
  }
  return (
    props.options.find(
      (o) => String(o[props.valueKey]) === String(props.modelValue)
    ) || null
  );
});

const filteredOptions = computed(() => {
  if (!searchQuery.value) return props.options;
  const query = searchQuery.value.toLowerCase();
  return props.options.filter((o) => {
    const label = String(o[props.labelKey] || "").toLowerCase();
    const subtitle = props.subtitleKey
      ? String(o[props.subtitleKey] || "").toLowerCase()
      : "";
    return label.includes(query) || subtitle.includes(query);
  });
});

// Detect non-touch device for auto-focus behavior
const isDesktop = globalThis.window !== undefined && globalThis.window.matchMedia('(hover: hover) and (pointer: fine)').matches;

// Methods
function toggleDropdown() {
  if (props.disabled || props.loading) return;
  isOpen.value ? closeDropdown() : openDropdown();
}

function openDropdown() {
  if (props.disabled || props.loading) return;
  isOpen.value = true;
  searchQuery.value = "";
}

function closeDropdown() {
  isOpen.value = false;
  searchQuery.value = "";
}

function handleSelect(value: unknown) {
  const emitValue: SelectValue =
    value === null || value === undefined ? null : (value as string | number);
  emit("update:modelValue", emitValue);
  emit("change", emitValue);
  closeDropdown();
}

function handleClear() {
  const clearValue = props.allOption ? props.allOptionValue : null;
  emit("update:modelValue", clearValue ?? null);
  emit("change", clearValue ?? null);
}

// ── Drag-to-dismiss (consistent with the app's other bottom-sheets) ──
const dragOffsetY = ref(0);
const isDragging = ref(false);
const dragStartY = ref(0);
const dragStartTime = ref(0);

const onDragStart = (e: PointerEvent) => {
  if (e.pointerType === "mouse" && e.button !== 0) return;
  isDragging.value = true;
  dragStartY.value = e.clientY;
  dragStartTime.value = Date.now();
  dragOffsetY.value = 0;
  (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
};

const onDragMove = (e: PointerEvent) => {
  if (!isDragging.value) return;
  const delta = e.clientY - dragStartY.value;
  dragOffsetY.value = delta > 0 ? delta : delta * 0.15;
};

const onDragEnd = (e: PointerEvent) => {
  if (!isDragging.value) return;
  isDragging.value = false;
  try {
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
  } catch {
    // ignore
  }
  const elapsed = Date.now() - dragStartTime.value;
  const velocity = elapsed > 0 ? dragOffsetY.value / elapsed : 0;
  const shouldClose = dragOffsetY.value > 100 || velocity > 0.6;
  dragOffsetY.value = 0;
  if (shouldClose) closeDropdown();
};

// Body scroll lock + focus management while open
watch(isOpen, (open) => {
  if (typeof document !== "undefined") {
    document.body.style.overflow = open ? "hidden" : "";
  }
  if (open) {
    if (props.searchable && isDesktop) {
      nextTick(() => searchInputRef.value?.focus());
    }
  } else {
    dragOffsetY.value = 0;
    isDragging.value = false;
  }
});

// Esc to close
function onKeydown(e: KeyboardEvent) {
  if (e.key === "Escape" && isOpen.value) closeDropdown();
}

onMounted(() => {
  window.addEventListener("keydown", onKeydown);
});

onUnmounted(() => {
  window.removeEventListener("keydown", onKeydown);
  if (typeof document !== "undefined") document.body.style.overflow = "";
});
</script>

<style scoped>
.ss-fade-enter-active,
.ss-fade-leave-active {
  transition: opacity 0.2s ease;
}
.ss-fade-enter-from,
.ss-fade-leave-to {
  opacity: 0;
}

.ss-slide-enter-active,
.ss-slide-leave-active {
  transition: transform 0.35s cubic-bezier(0.32, 0.72, 0, 1);
}
.ss-slide-enter-from,
.ss-slide-leave-to {
  transform: translateY(100%);
}
</style>
