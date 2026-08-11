<template>
  <div class="space-y-4">
    <!-- Crear y entrar con código viven en el botón flotante de la vista, como
         en fantasy y quinielas. -->

    <!-- Loading State -->
    <SurvivorListSkeleton v-if="isLoading" />

    <!-- Error State -->
    <div
      v-else-if="errorMessage"
      class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 p-6 text-center"
    >
      <v-icon name="hi-solid-exclamation" class="w-8 h-8 text-red-400 mx-auto mb-3" />
      <p class="text-footnote text-red-500 dark:text-red-400 mb-4">{{ errorMessage }}</p>
      <button
        class="px-4 py-1.5 bg-red-500 text-white rounded-full text-footnote font-medium active:bg-red-600 transition-colors"
        @click="loadSurvivors"
      >
        {{ $t('common.actions.retry') }}
      </button>
    </div>

    <template v-else>
      <!-- Dos grupos que no se comparan entre sí: los de la casa (todos dentro,
           reglas fijas) y los que creó o le compartieron a esta persona. -->
      <div
        role="tablist"
        :aria-label="$t('survivor.list.groupsAria')"
        class="grid grid-cols-2 gap-1 p-1 rounded-xl bg-gray-100 dark:bg-gray-800/60"
      >
        <button
          v-for="tab in tabs"
          :key="tab.key"
          type="button"
          role="tab"
          :aria-selected="activeTab === tab.key"
          class="min-h-[40px] px-3 rounded-lg text-footnote font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 flex items-center justify-center gap-1.5"
          :class="
            activeTab === tab.key
              ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-500 dark:text-gray-400 active:bg-white/60 dark:active:bg-gray-800/60'
          "
          @click="activeTab = tab.key"
        >
          {{ tab.label }}
          <span
            class="inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1 rounded-full text-2xs font-bold tabular-nums"
            :class="
              activeTab === tab.key
                ? 'bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
            "
          >
            {{ tab.count }}
          </span>
        </button>
      </div>

      <!-- Lista del grupo activo -->
      <template v-if="visibleSurvivors.length > 0">
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          <div
            v-for="survivor in visibleSurvivors"
            :key="survivor.uuid"
            class="survivor-card bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 overflow-hidden transition-all duration-200 cursor-pointer active:scale-[0.98] hover:shadow-md"
            @click="goToSurvivor(survivor.uuid)"
          >
            <div class="p-4">
              <!-- Cabecera: escudo de la liga + nombre + estado -->
              <div class="flex items-start gap-3">
                <img
                  v-if="leagueLogo(survivor)"
                  :src="leagueLogo(survivor)!"
                  :alt="survivor.league!.name"
                  loading="lazy"
                  class="w-11 h-11 object-contain shrink-0"
                  @error="onLeagueLogoError"
                />
                <div
                  v-else
                  class="w-11 h-11 bg-gradient-to-br from-rose-500 to-red-600 rounded-2xl flex items-center justify-center shrink-0"
                >
                  <v-icon name="hi-solid-shield-check" class="w-5 h-5 text-white" />
                </div>

                <div class="flex-1 min-w-0">
                  <div class="flex items-start justify-between gap-2">
                    <h3 class="text-callout font-semibold text-gray-900 dark:text-white leading-tight truncate">
                      {{ survivor.name }}
                    </h3>
                    <span
                      v-if="participantBadge(survivor)"
                      :class="[
                        'inline-flex items-center px-2 py-0.5 rounded-full text-2xs font-semibold shrink-0',
                        participantBadge(survivor)!.classes,
                      ]"
                    >
                      {{ participantBadge(survivor)!.label }}
                    </span>
                  </div>
                  <p
                    v-if="survivor.description"
                    class="text-footnote text-gray-500 dark:text-gray-400 leading-snug mt-0.5 line-clamp-2"
                  >
                    {{ survivor.description }}
                  </p>
                </div>
              </div>

              <!-- Pie: vidas, cupo y reglas que se salen de lo normal -->
              <div
                class="flex items-center flex-wrap gap-x-3 gap-y-1.5 mt-3 pt-3 border-t border-gray-50 dark:border-gray-700/40"
              >
                <div class="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500 shrink-0">
                  <v-icon name="hi-solid-heart" class="w-3.5 h-3.5 text-rose-400" />
                  <span>{{ livesLabel(survivor) }}</span>
                </div>

                <div
                  v-if="!survivor.is_official && survivor.max_participants"
                  class="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500 shrink-0"
                >
                  <v-icon name="hi-solid-users" class="w-3.5 h-3.5" />
                  <span class="tabular-nums">{{ survivor.participants_count ?? 0 }}/{{ survivor.max_participants }}</span>
                </div>

                <span
                  v-if="survivor.rules?.draw_counts_as === 'loss'"
                  class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-2xs font-semibold bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 shrink-0"
                >
                  {{ $t('survivor.list.drawIsLoss') }}
                </span>

                <!-- El código sólo lo ve el admin: es lo que reparte para que
                     entren, así que se copia de un toque sin abrir la liga. -->
                <button
                  v-if="survivor.access_code"
                  type="button"
                  class="ml-auto inline-flex items-center gap-1 h-7 px-2 rounded-lg bg-gray-50 dark:bg-gray-900/40 text-2xs font-bold tracking-wider text-gray-600 dark:text-gray-300 active:bg-gray-100 dark:active:bg-gray-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/50"
                  :aria-label="$t('survivor.list.copyCodeAria', { code: survivor.access_code })"
                  @click.stop="copyCode(survivor.access_code)"
                >
                  <v-icon
                    :name="copiedCode === survivor.access_code ? 'hi-solid-check' : 'hi-solid-duplicate'"
                    class="w-3 h-3"
                  />
                  {{ survivor.access_code }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- Vacío, distinto por pestaña: no hay nada que arreglar en "oficiales",
           pero en "mis ligas" sí hay algo que hacer. -->
      <div
        v-else
        class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 py-12 px-6 text-center"
      >
        <v-icon name="hi-solid-shield-check" class="w-10 h-10 text-gray-200 dark:text-gray-700 mx-auto mb-3" />
        <h3 class="text-callout font-semibold text-gray-900 dark:text-white mb-1">
          {{ activeTab === 'mine' ? $t('survivor.list.emptyMineTitle') : $t('survivor.emptyTitle') }}
        </h3>
        <p class="text-footnote text-gray-400 dark:text-gray-500 max-w-xs mx-auto leading-relaxed">
          {{ activeTab === 'mine' ? $t('survivor.list.emptyMineBody') : $t('survivor.emptyBody') }}
        </p>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { survivorService } from "@/services/survivor/SurvivorServive";
import { useToast } from "@/composables/useToast";
import SurvivorListSkeleton from "@/components/survivor/SurvivorListSkeleton.vue";
import type { SurvivorResponse } from "@/interfaces/survivor/SurvivorResponse";

const router = useRouter();
const { t } = useI18n();
const toast = useToast();

type SurvivorTab = "official" | "mine";

const isLoading = ref(false);
const errorMessage = ref<string>("");
const survivors = ref<SurvivorResponse[]>([]);
const activeTab = ref<SurvivorTab>("official");
const copiedCode = ref("");

const officialSurvivors = computed(() => survivors.value.filter((s) => s.is_official));
const mineSurvivors = computed(() => survivors.value.filter((s) => !s.is_official));

const visibleSurvivors = computed(() =>
  activeTab.value === "mine" ? mineSurvivors.value : officialSurvivors.value,
);

const tabs = computed(() => [
  { key: "official" as const, label: t("survivor.list.tabOfficial"), count: officialSurvivors.value.length },
  { key: "mine" as const, label: t("survivor.list.tabMine"), count: mineSurvivors.value.length },
]);

const goToSurvivor = (uuid: string) => {
  router.push({ name: "survivorDetail", params: { uuid } });
};

/**
 * Escudos que no cargaron (CDN caído, url muerta).
 *
 * Se marca la url y no se le cambia el `src` a una imagen genérica: así la
 * tarjeta vuelve a su icono de siempre en vez de enseñar un avatar de persona
 * donde debería ir un escudo.
 */
const failedLogos = ref(new Set<string>());

const onLeagueLogoError = (event: Event) => {
  const src = (event.target as HTMLImageElement).src;
  failedLogos.value = new Set(failedLogos.value).add(src);
};

const leagueLogo = (survivor: SurvivorResponse): string | null => {
  const src = survivor.league?.image_path;
  return src && !failedLogos.value.has(src) ? src : null;
};

/** Vidas que le quedan a quien mira; si no hay ficha, las que reparte el survivor. */
const livesLabel = (survivor: SurvivorResponse): string => {
  const lives = survivor.lives_remaining ?? survivor.max_lives;
  return t("survivor.list.livesCount", { count: lives }, lives);
};

const participantBadge = (survivor: SurvivorResponse): { label: string; classes: string } | null => {
  if (survivor.participant_status === "eliminated") {
    return {
      label: t("survivor.status.eliminated"),
      classes: "bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400",
    };
  }
  if (survivor.is_admin) {
    return {
      label: t("survivor.list.adminBadge"),
      classes: "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
    };
  }
  return null;
};

/**
 * `navigator.clipboard` no existe fuera de un contexto seguro (http en una IP de
 * la red local, por ejemplo), así que el fallo se avisa en vez de dejar al
 * usuario creyendo que copió algo.
 */
const copyCode = async (code: string) => {
  try {
    await navigator.clipboard.writeText(code);
    copiedCode.value = code;
    setTimeout(() => {
      if (copiedCode.value === code) copiedCode.value = "";
    }, 2000);
  } catch (e) {
    console.error("Error copying access code:", e);
    toast.error(t("survivor.list.copyErrorTitle"), t("survivor.list.copyErrorBody", { code }));
  }
};

const loadSurvivors = async () => {
  isLoading.value = true;
  errorMessage.value = "";

  try {
    survivors.value = await survivorService.getMySurvivors();
  } catch (error) {
    console.error("Error loading survivors:", error);
    errorMessage.value = t("survivor.loadError");
  } finally {
    isLoading.value = false;
  }
};

onMounted(loadSurvivors);

/**
 * Recarga la lista y deja a la vista el survivor recién creado o al que se
 * acaba de entrar.
 *
 * Sin el cambio de pestaña, crear una liga te dejaba mirando "Oficiales" y
 * parecía que no había pasado nada: lo nuevo siempre cae en "Mis ligas".
 */
const reloadShowingMine = async () => {
  activeTab.value = "mine";
  await loadSurvivors();
};

defineExpose({ reload: loadSurvivors, reloadShowingMine });
</script>

<style scoped>
/* A survivor card is a tap target (opens the survivor), not copyable text.
   Without this, long-pressing a card on iOS/Android starts a native text
   selection + callout ("Copy / Translate") over its name/description.
   user-select and -webkit-touch-callout inherit, so setting them on the card
   disables it for every text node inside. Declared as real CSS (not a Tailwind
   arbitrary class) so the vendor-prefixed properties iOS needs are guaranteed
   to ship — same approach as .pick-team-btn / .picks-board. */
.survivor-card {
  -webkit-user-select: none;
  -moz-user-select: none;
  user-select: none;
  -webkit-touch-callout: none;
}

/* Clamp survivor description to two lines (no Tailwind line-clamp plugin in this project). */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Accessibility: Respect user's motion preferences */
@media (prefers-reduced-motion: reduce) {
  * {
    transition: none !important;
    transform: none !important;
    animation: none !important;
  }
}
</style>
