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

    <!-- Select Container -->
    <div class="relative" ref="containerRef">
      <!-- Trigger Button -->
      <button
        :id="id"
        type="button"
        @click.stop="toggleDropdown"
        :disabled="disabled"
        class="w-full flex flex-wrap items-center gap-1.5 px-3 py-2 rounded-lg border transition-all duration-200 text-left min-h-[42px]"
        :class="[
          isOpen
            ? `${accentBorderClass} ring-2 ${accentRingClass}`
            : error
              ? 'border-red-300 dark:border-red-600 hover:border-red-400 dark:hover:border-red-500'
              : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500',
          disabled
            ? 'opacity-50 cursor-not-allowed bg-gray-50 dark:bg-gray-800'
            : 'bg-white dark:bg-gray-700/50 cursor-pointer',
        ]"
        :aria-expanded="isOpen"
        :aria-describedby="error ? `${id}-error` : undefined"
      >
        <!-- Selected Tags -->
        <template v-if="selectedItems.length > 0">
          <span
            v-for="item in visibleTags"
            :key="String(item[valueKey])"
            class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium max-w-[150px] transition-colors duration-150"
            :class="[accentTagBgClass, accentTagTextClass]"
          >
            <img
              v-if="imageKey && item[imageKey]"
              :src="String(item[imageKey])"
              :alt="String(item[labelKey])"
              class="w-4 h-4 object-contain rounded flex-shrink-0"
            />
            <span class="truncate">{{ item[labelKey] }}</span>
            <button
              v-if="!disabled"
              type="button"
              @click.stop="removeItem(item)"
              class="flex-shrink-0 p-0.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
              :title="`Remove ${item[labelKey]}`"
            >
              <v-icon name="hi-solid-x" class="w-3 h-3" />
            </button>
          </span>
          <!-- Overflow count -->
          <span
            v-if="overflowCount > 0"
            class="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium"
            :class="[accentTagBgClass, accentTagTextClass]"
          >
            +{{ overflowCount }}
          </span>
        </template>

        <!-- Placeholder -->
        <span
          v-else
          class="text-sm text-gray-400 dark:text-gray-500 flex-1 py-0.5"
        >
          {{ placeholder }}
        </span>

        <!-- Right side: count + loading/chevron -->
        <span class="ml-auto flex items-center gap-1.5 flex-shrink-0 pl-2">
          <!-- Selection count badge -->
          <span
            v-if="selectedItems.length > 0"
            class="text-xs font-semibold px-1.5 py-0.5 rounded-full"
            :class="[accentTagBgClass, accentTagTextClass]"
          >
            {{ selectedItems.length }}
          </span>

          <!-- Clear all button -->
          <button
            v-if="selectedItems.length > 0 && clearable && !disabled"
            type="button"
            @click.stop="handleClearAll"
            class="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            title="Clear all"
          >
            <v-icon name="hi-solid-x" class="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
          </button>

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
        </span>
      </button>

      <!-- Dropdown Panel -->
      <Transition
        enter-active-class="transition ease-out duration-200"
        enter-from-class="opacity-0 translate-y-1"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition ease-in duration-150"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 translate-y-1"
      >
        <div
          v-if="isOpen"
          class="absolute z-50 mt-2 w-full bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
        >
          <!-- Search Input -->
          <div
            v-if="searchable"
            class="p-2 border-b border-gray-100 dark:border-gray-700"
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
                class="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                :class="[accentSearchRingClass, accentSearchBorderClass]"
                @click.stop
              />
            </div>
          </div>

          <!-- Select All / Deselect All -->
          <div
            v-if="filteredOptions.length > 0 && showSelectAll"
            class="flex items-center justify-between px-4 py-2 border-b border-gray-100 dark:border-gray-700"
          >
            <button
              type="button"
              @click.stop="selectAll"
              class="text-xs font-medium transition-colors hover:underline"
              :class="accentLinkClass"
            >
              Select all
            </button>
            <button
              v-if="selectedItems.length > 0"
              type="button"
              @click.stop="handleClearAll"
              class="text-xs font-medium text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:underline transition-colors"
            >
              Deselect all
            </button>
          </div>

          <!-- Options List -->
          <div class="max-h-60 overflow-y-auto overscroll-contain">
            <!-- Option Items -->
            <button
              v-for="option in filteredOptions"
              :key="String(option[valueKey])"
              type="button"
              @click.stop="toggleOption(option)"
              class="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors duration-150"
              :class="[
                isSelected(option)
                  ? `${accentBgClass} ${accentTextClass}`
                  : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300'
              ]"
            >
              <!-- Checkbox indicator -->
              <div
                class="w-[18px] h-[18px] flex-shrink-0 rounded border-2 flex items-center justify-center transition-all duration-150"
                :class="[
                  isSelected(option)
                    ? `${accentCheckboxBgClass} ${accentCheckboxBorderClass}`
                    : 'border-gray-300 dark:border-gray-500 bg-white dark:bg-gray-700'
                ]"
              >
                <v-icon
                  v-if="isSelected(option)"
                  name="hi-solid-check"
                  class="w-3 h-3 text-white"
                />
              </div>

              <!-- Image -->
              <img
                v-if="imageKey && option[imageKey]"
                :src="String(option[imageKey])"
                :alt="String(option[labelKey])"
                class="w-6 h-6 object-contain flex-shrink-0 rounded"
              />

              <!-- Label & subtitle -->
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
            </button>

            <!-- No results -->
            <div
              v-if="filteredOptions.length === 0 && searchQuery"
              class="px-4 py-6 text-center"
            >
              <v-icon
                name="hi-solid-emoji-sad"
                class="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2"
              />
              <p class="text-sm text-gray-400 dark:text-gray-500">
                {{ noResultText }} "{{ searchQuery }}"
              </p>
            </div>

            <!-- Empty options -->
            <div
              v-if="options.length === 0 && !searchQuery"
              class="px-4 py-6 text-center"
            >
              <p class="text-sm text-gray-400 dark:text-gray-500">
                {{ noOptionsText }}
              </p>
            </div>
          </div>
        </div>
      </Transition>
    </div>

    <!-- Error message -->
    <p
      v-if="error"
      :id="`${id}-error`"
      class="text-sm text-red-600 dark:text-red-400"
    >
      {{ error }}
    </p>

    <!-- Help text -->
    <p
      v-if="helpText && !error"
      class="text-sm text-gray-500 dark:text-gray-400"
    >
      {{ helpText }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from "vue";

interface Option {
  [key: string]: unknown;
}

type AccentColor = "indigo" | "emerald" | "blue" | "amber" | "rose" | "gray";
type MultiselectValue = Option | Option[] | null;

interface Props {
  modelValue: MultiselectValue;
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
  helpText?: string;
  multiple?: boolean;
  closeOnSelect?: boolean;
  searchable?: boolean;
  clearable?: boolean;
  showSelectAll?: boolean;
  maxVisibleTags?: number;
  noResultText?: string;
  noOptionsText?: string;
  accentColor?: AccentColor;
  /** @deprecated Kept for backward compatibility */
  preserveSearch?: boolean;
  /** @deprecated Kept for backward compatibility */
  internalLoading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  valueKey: "id",
  labelKey: "name",
  placeholder: "Select options",
  searchPlaceholder: "Search...",
  id: () => `multiselect-${Math.random().toString(36).substring(2, 11)}`,
  required: false,
  disabled: false,
  loading: false,
  multiple: true,
  closeOnSelect: false,
  searchable: true,
  clearable: true,
  showSelectAll: true,
  maxVisibleTags: 3,
  noResultText: "No results found.",
  noOptionsText: "No options available.",
  accentColor: "indigo",
  preserveSearch: true,
  internalLoading: false,
});

const emit = defineEmits<{
  "update:modelValue": [value: MultiselectValue];
  change: [value: MultiselectValue];
  open: [];
  close: [];
  "search-change": [query: string];
}>();

// Refs
const containerRef = ref<HTMLElement | null>(null);
const searchInputRef = ref<HTMLInputElement | null>(null);
const isOpen = ref(false);
const searchQuery = ref("");

// Accent color class maps
const accentClassMap = {
  border: {
    indigo: "border-indigo-400 dark:border-indigo-500",
    emerald: "border-emerald-400 dark:border-emerald-500",
    blue: "border-blue-400 dark:border-blue-500",
    amber: "border-amber-400 dark:border-amber-500",
    rose: "border-rose-400 dark:border-rose-500",
    gray: "border-gray-400 dark:border-gray-500",
  },
  ring: {
    indigo: "ring-indigo-100 dark:ring-indigo-900/30",
    emerald: "ring-emerald-100 dark:ring-emerald-900/30",
    blue: "ring-blue-100 dark:ring-blue-900/30",
    amber: "ring-amber-100 dark:ring-amber-900/30",
    rose: "ring-rose-100 dark:ring-rose-900/30",
    gray: "ring-gray-100 dark:ring-gray-900/30",
  },
  bg: {
    indigo: "bg-indigo-50 dark:bg-indigo-900/20",
    emerald: "bg-emerald-50 dark:bg-emerald-900/20",
    blue: "bg-blue-50 dark:bg-blue-900/20",
    amber: "bg-amber-50 dark:bg-amber-900/20",
    rose: "bg-rose-50 dark:bg-rose-900/20",
    gray: "bg-gray-50 dark:bg-gray-700/50",
  },
  text: {
    indigo: "text-indigo-700 dark:text-indigo-300",
    emerald: "text-emerald-700 dark:text-emerald-300",
    blue: "text-blue-700 dark:text-blue-300",
    amber: "text-amber-700 dark:text-amber-300",
    rose: "text-rose-700 dark:text-rose-300",
    gray: "text-gray-700 dark:text-gray-300",
  },
  tagBg: {
    indigo: "bg-indigo-100 dark:bg-indigo-900/30",
    emerald: "bg-emerald-100 dark:bg-emerald-900/30",
    blue: "bg-blue-100 dark:bg-blue-900/30",
    amber: "bg-amber-100 dark:bg-amber-900/30",
    rose: "bg-rose-100 dark:bg-rose-900/30",
    gray: "bg-gray-100 dark:bg-gray-700",
  },
  tagText: {
    indigo: "text-indigo-700 dark:text-indigo-300",
    emerald: "text-emerald-700 dark:text-emerald-300",
    blue: "text-blue-700 dark:text-blue-300",
    amber: "text-amber-700 dark:text-amber-300",
    rose: "text-rose-700 dark:text-rose-300",
    gray: "text-gray-700 dark:text-gray-300",
  },
  checkboxBg: {
    indigo: "bg-indigo-500 dark:bg-indigo-600",
    emerald: "bg-emerald-500 dark:bg-emerald-600",
    blue: "bg-blue-500 dark:bg-blue-600",
    amber: "bg-amber-500 dark:bg-amber-600",
    rose: "bg-rose-500 dark:bg-rose-600",
    gray: "bg-gray-500 dark:bg-gray-600",
  },
  checkboxBorder: {
    indigo: "border-indigo-500 dark:border-indigo-600",
    emerald: "border-emerald-500 dark:border-emerald-600",
    blue: "border-blue-500 dark:border-blue-600",
    amber: "border-amber-500 dark:border-amber-600",
    rose: "border-rose-500 dark:border-rose-600",
    gray: "border-gray-500 dark:border-gray-600",
  },
  searchRing: {
    indigo: "focus:ring-indigo-300 dark:focus:ring-indigo-700",
    emerald: "focus:ring-emerald-300 dark:focus:ring-emerald-700",
    blue: "focus:ring-blue-300 dark:focus:ring-blue-700",
    amber: "focus:ring-amber-300 dark:focus:ring-amber-700",
    rose: "focus:ring-rose-300 dark:focus:ring-rose-700",
    gray: "focus:ring-gray-300 dark:focus:ring-gray-700",
  },
  searchBorder: {
    indigo: "focus:border-indigo-400 dark:focus:border-indigo-600",
    emerald: "focus:border-emerald-400 dark:focus:border-emerald-600",
    blue: "focus:border-blue-400 dark:focus:border-blue-600",
    amber: "focus:border-amber-400 dark:focus:border-amber-600",
    rose: "focus:border-rose-400 dark:focus:border-rose-600",
    gray: "focus:border-gray-400 dark:focus:border-gray-600",
  },
  link: {
    indigo: "text-indigo-600 dark:text-indigo-400",
    emerald: "text-emerald-600 dark:text-emerald-400",
    blue: "text-blue-600 dark:text-blue-400",
    amber: "text-amber-600 dark:text-amber-400",
    rose: "text-rose-600 dark:text-rose-400",
    gray: "text-gray-600 dark:text-gray-400",
  },
};

const accentBorderClass = computed(() => accentClassMap.border[props.accentColor]);
const accentRingClass = computed(() => accentClassMap.ring[props.accentColor]);
const accentBgClass = computed(() => accentClassMap.bg[props.accentColor]);
const accentTextClass = computed(() => accentClassMap.text[props.accentColor]);
const accentTagBgClass = computed(() => accentClassMap.tagBg[props.accentColor]);
const accentTagTextClass = computed(() => accentClassMap.tagText[props.accentColor]);
const accentCheckboxBgClass = computed(() => accentClassMap.checkboxBg[props.accentColor]);
const accentCheckboxBorderClass = computed(() => accentClassMap.checkboxBorder[props.accentColor]);
const accentSearchRingClass = computed(() => accentClassMap.searchRing[props.accentColor]);
const accentSearchBorderClass = computed(() => accentClassMap.searchBorder[props.accentColor]);
const accentLinkClass = computed(() => accentClassMap.link[props.accentColor]);

// Computed: normalize modelValue to always work as array internally
const selectedItems = computed<Option[]>(() => {
  if (!props.modelValue) return [];
  if (Array.isArray(props.modelValue)) return props.modelValue;
  return [props.modelValue];
});

const visibleTags = computed(() =>
  selectedItems.value.slice(0, props.maxVisibleTags)
);

const overflowCount = computed(() =>
  Math.max(0, selectedItems.value.length - props.maxVisibleTags)
);

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

// Methods
function isSelected(option: Option): boolean {
  return selectedItems.value.some(
    (item) => String(item[props.valueKey]) === String(option[props.valueKey])
  );
}

function toggleOption(option: Option) {
  if (isSelected(option)) {
    removeItem(option);
  } else {
    addItem(option);
  }
}

function addItem(option: Option) {
  const newValue = props.multiple
    ? [...selectedItems.value, option]
    : option;
  emit("update:modelValue", newValue);
  emit("change", newValue);

  if (props.closeOnSelect) {
    isOpen.value = false;
    searchQuery.value = "";
  }
}

function removeItem(option: Option) {
  const newValue = selectedItems.value.filter(
    (item) => String(item[props.valueKey]) !== String(option[props.valueKey])
  );
  const emitValue = props.multiple ? newValue : null;
  emit("update:modelValue", emitValue);
  emit("change", emitValue);
}

function selectAll() {
  const allOptions = [...props.options];
  emit("update:modelValue", allOptions);
  emit("change", allOptions);
}

function handleClearAll() {
  const emptyValue: Option[] | null = props.multiple ? [] : null;
  emit("update:modelValue", emptyValue);
  emit("change", emptyValue);
}

function toggleDropdown() {
  if (props.disabled || props.loading) return;
  isOpen.value = !isOpen.value;

  if (isOpen.value) {
    searchQuery.value = "";
    emit("open");
    nextTick(() => {
      searchInputRef.value?.focus();
    });
  } else {
    emit("close");
  }
}

function handleClickOutside(event: MouseEvent) {
  if (
    containerRef.value &&
    !containerRef.value.contains(event.target as Node)
  ) {
    if (isOpen.value) {
      isOpen.value = false;
      searchQuery.value = "";
      emit("close");
    }
  }
}

// Watch search query for external consumers
watch(searchQuery, (val) => {
  emit("search-change", val);
});

// Auto-focus search on open
watch(isOpen, (val) => {
  if (val && props.searchable) {
    nextTick(() => {
      searchInputRef.value?.focus();
    });
  }
});

// Lifecycle
onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});
</script>
