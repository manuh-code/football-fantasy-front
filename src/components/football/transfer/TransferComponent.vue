<template>
  <div class="w-full">
    <!-- Type filter pills: skeleton while the catalog loads, hidden entirely
         if it comes back empty (or fails) — no point filtering by nothing. -->
    <div v-if="isTypesLoading" class="flex gap-2 pb-3 -mx-1 px-1">
      <div v-for="n in 4" :key="`type-sk-${n}`" class="h-7 w-16 rounded-full bg-gray-100 dark:bg-gray-800 shrink-0 animate-pulse" />
    </div>
    <div v-else-if="showFilters" class="flex gap-2 overflow-x-auto scrollbar-hide pb-3 -mx-1 px-1">
      <button
        type="button"
        @click="selectType(null)"
        class="shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors active:scale-95"
        :class="selectedTypeUuid === null
          ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/25'
          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'"
      >
        {{ $t('common.states.all') }}
      </button>
      <button
        v-for="type in transferTypes"
        :key="type.uuid"
        type="button"
        @click="selectType(type.uuid)"
        class="shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors active:scale-95"
        :class="selectedTypeUuid === type.uuid
          ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/25'
          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'"
      >
        {{ type.name }}
      </button>
    </div>

    <!-- Loading skeleton -->
    <div
      v-if="isLoading"
      class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 overflow-hidden"
    >
      <ul class="divide-y divide-gray-50 dark:divide-gray-800">
        <li v-for="n in 6" :key="`sk-${n}`" class="flex items-center gap-3 px-4 py-3 animate-pulse">
          <div class="w-11 h-11 rounded-full bg-gray-200 dark:bg-gray-700 shrink-0" />
          <div class="flex-1 space-y-2">
            <div class="h-3 w-32 rounded-full bg-gray-200 dark:bg-gray-700" />
            <div class="h-2.5 w-40 rounded-full bg-gray-200 dark:bg-gray-700" />
          </div>
          <div class="h-6 w-14 rounded-full bg-gray-200 dark:bg-gray-700 shrink-0" />
        </li>
      </ul>
    </div>

    <!-- Error -->
    <div
      v-else-if="error"
      class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 p-6 text-center"
    >
      <v-icon name="hi-solid-exclamation" class="w-8 h-8 text-red-400 mx-auto mb-3" />
      <p class="text-footnote text-red-500 dark:text-red-400 mb-4">{{ error }}</p>
      <button
        @click="load"
        class="px-4 py-1.5 bg-emerald-500 text-white rounded-full text-footnote font-medium hover:bg-emerald-600 active:bg-emerald-700 transition-colors"
      >
        {{ $t('common.actions.retry') }}
      </button>
    </div>

    <!-- Empty -->
    <div
      v-else-if="transfers.length === 0"
      class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 py-12 text-center"
    >
      <v-icon name="hi-solid-switch-horizontal" class="w-10 h-10 text-gray-200 dark:text-gray-700 mx-auto mb-3" />
      <h3 class="text-callout font-semibold text-gray-900 dark:text-white mb-1">{{ $t('football.transfers.emptyTitle') }}</h3>
      <p class="text-footnote text-gray-400 dark:text-gray-500 max-w-xs mx-auto leading-relaxed">
        {{ teamUuid ? $t('football.transfers.emptyBodyTeam') : $t('football.transfers.emptyBody') }}
      </p>
    </div>

    <!-- Transfers list: dimmed (not replaced by the skeleton) while a filter
         change is refreshing it in place, so switching pills feels like an
         update rather than the whole panel reloading. -->
    <div
      v-else
      class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 overflow-hidden transition-opacity duration-200"
      :class="isRefreshing ? 'opacity-50 pointer-events-none' : ''"
    >
      <ul class="divide-y divide-gray-50 dark:divide-gray-800">
        <li
          v-for="(tr, index) in transfers"
          :key="`${tr.player?.uuid || 'p'}-${index}`"
          class="flex items-center gap-3 px-4 py-3"
        >
          <!-- Player avatar — amber ring while the move isn't completed yet -->
          <img
            :src="tr.player?.image_path || FALLBACK"
            :alt="tr.player?.display_name || ''"
            class="w-11 h-11 rounded-full object-cover bg-gray-100 dark:bg-gray-700 shrink-0 ring-2"
            :class="tr.completed ? 'ring-transparent' : 'ring-amber-300 dark:ring-amber-500/50'"
            @error="onImgError"
          />

          <!-- Player + movement -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-1.5 min-w-0">
              <p class="text-footnote font-semibold text-gray-900 dark:text-white truncate">
                {{ tr.player?.display_name || '—' }}
              </p>
              <span
                v-if="!tr.completed"
                class="shrink-0 inline-flex items-center px-1.5 py-0.5 rounded-full text-2xs font-semibold bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"
              >
                {{ $t('football.transfers.pending') }}
              </span>
            </div>

            <!-- Movement: origin club → destination club (destination emphasized) -->
            <div class="flex items-center gap-1.5 mt-1 min-w-0">
              <img
                :src="tr.from_team?.image_path || FALLBACK"
                :alt="tr.from_team?.name || ''"
                class="w-4 h-4 object-contain shrink-0"
                @error="onImgError"
              />
              <span class="text-2xs text-gray-400 dark:text-gray-500 truncate">{{ clubLabel(tr.from_team) }}</span>
              <v-icon name="hi-solid-arrow-right" class="w-3 h-3 text-gray-300 dark:text-gray-600 shrink-0" />
              <img
                :src="tr.to_team?.image_path || FALLBACK"
                :alt="tr.to_team?.name || ''"
                class="w-4 h-4 object-contain shrink-0"
                @error="onImgError"
              />
              <span class="text-2xs font-semibold text-gray-700 dark:text-gray-200 truncate">{{ clubLabel(tr.to_team) }}</span>
            </div>
          </div>

          <!-- Fee + date -->
          <div class="flex flex-col items-end gap-1 shrink-0">
            <span
              class="inline-flex items-center h-6 px-2 rounded-full text-2xs font-bold tabular-nums"
              :class="fee(tr).isMoney
                ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'"
            >
              {{ fee(tr).label }}
            </span>
            <span class="text-2xs text-gray-400 dark:text-gray-500 tabular-nums">{{ formatDate(tr.date) }}</span>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { transferService } from "@/services/football/transfer/TransferService";
import { catalogService } from "@/services/catalog/CatalogService";
import type { TransferResponse } from "@/interfaces/football/transfer/TransferResponse";
import type { TransferSearchPayload } from "@/interfaces/football/transfer/TransferSearchPayload";
import type { TypeResponse } from "@/interfaces/football/type/TypeResponse";
import type { FootballTeamResponse } from "@/interfaces/football/team/FootballTeamResponse";

// Transfers can be scoped either to a league (Home panel) or to a single team
// (team profile). The parent supplies exactly one of the two; `teamUuid` wins
// when both are present so the same list component serves both contexts.
const props = defineProps<{ leagueUuid?: string; teamUuid?: string }>();

const { t, locale } = useI18n();

const FALLBACK = "/img/default-avatar.svg";

const transfers = ref<TransferResponse[]>([]);
const isLoading = ref(false);
const isRefreshing = ref(false);
const hasLoadedOnce = ref(false);
const error = ref("");

// --- Type filter (pills) ---
const transferTypes = ref<TypeResponse[]>([]);
const isTypesLoading = ref(false);
// null = "Todos" (no filter); otherwise the single selected type's uuid.
const selectedTypeUuid = ref<string | null>(null);
// Hide the whole filter row if the catalog has nothing to filter by (or
// failed to load) rather than show a pointless single "Todos" pill.
const showFilters = computed(() => transferTypes.value.length > 0);

// Short club label for the tight movement line: crest code first, name as fallback.
const clubLabel = (team?: FootballTeamResponse | null): string =>
  team?.short_code || team?.name || "—";

// Compact, locale-aware fee (e.g. "12,5 M €" / "€12.5M"). Sportmonks amounts are EUR.
const formatFee = (amount: number): string => {
  try {
    return new Intl.NumberFormat(locale.value === "es" ? "es-ES" : "en-US", {
      style: "currency",
      currency: "EUR",
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(amount);
  } catch {
    return `€${amount.toLocaleString()}`;
  }
};

// The right-hand chip: a real fee when there's an amount, otherwise a localized
// move type (loan / free) derived defensively from the type fields, or its name.
const fee = (tr: TransferResponse): { label: string; isMoney: boolean } => {
  if (tr.amount && tr.amount > 0) return { label: formatFee(tr.amount), isMoney: true };
  const kind = `${tr.type?.developer_name ?? ""} ${tr.type?.code ?? ""} ${tr.type?.name ?? ""}`.toLowerCase();
  if (kind.includes("loan")) return { label: t("football.transfers.fee.loan"), isMoney: false };
  if (kind.includes("free")) return { label: t("football.transfers.fee.free"), isMoney: false };
  return { label: tr.type?.name || t("football.transfers.fee.undisclosed"), isMoney: false };
};

const formatDate = (value?: string): string => {
  if (!value) return "";
  const date = new Date(value.includes("T") ? value : value.replace(" ", "T"));
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(locale.value === "es" ? "es-ES" : "en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const onImgError = (e: Event) => {
  (e.target as HTMLImageElement).src = FALLBACK;
};

// Guards against a slower, stale request (e.g. the previous filter) landing
// after a newer one and overwriting its result.
let loadToken = 0;

const load = async () => {
  if (!props.teamUuid && !props.leagueUuid) return;
  const token = ++loadToken;
  // Only the very first load blocks the view with the full skeleton; a
  // filter change just dims the existing list while it refreshes in place.
  if (!hasLoadedOnce.value) isLoading.value = true;
  isRefreshing.value = true;
  error.value = "";
  try {
    const payload: TransferSearchPayload = {
      type_uuids: selectedTypeUuid.value ? [selectedTypeUuid.value] : [],
    };
    const result = props.teamUuid
      ? await transferService.getTransfersByTeamUuid(props.teamUuid, payload)
      : await transferService.getTransfersByLeagueUuid(props.leagueUuid!, payload);
    if (token !== loadToken) return;
    transfers.value = result;
  } catch (e) {
    if (token !== loadToken) return;
    console.error("Error loading transfers:", e);
    error.value = t("football.transfers.loadError");
  } finally {
    if (token === loadToken) {
      isLoading.value = false;
      isRefreshing.value = false;
      hasLoadedOnce.value = true;
    }
  }
};

const loadTypes = async () => {
  isTypesLoading.value = true;
  try {
    transferTypes.value = await catalogService.getTypeTransfer();
  } catch (e) {
    // Non-critical: the list still works unfiltered, just skip the pills.
    console.error("Error loading transfer types:", e);
    transferTypes.value = [];
  } finally {
    isTypesLoading.value = false;
  }
};

const selectType = (uuid: string | null) => {
  if (selectedTypeUuid.value === uuid) return;
  selectedTypeUuid.value = uuid;
  load();
};

onMounted(() => {
  load();
  loadTypes();
});

// Reload if the active league/team changes while the panel stays mounted.
watch(
  () => [props.leagueUuid, props.teamUuid],
  (next, prev) => {
    if ((next[0] || next[1]) && (next[0] !== prev[0] || next[1] !== prev[1])) {
      selectedTypeUuid.value = null;
      hasLoadedOnce.value = false;
      load();
    }
  },
);
</script>

<style scoped>
.tabular-nums {
  font-variant-numeric: tabular-nums;
}

.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

@media (prefers-reduced-motion: reduce) {
  * {
    animation: none !important;
    transition: none !important;
  }
}
</style>
