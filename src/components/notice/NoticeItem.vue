<template>
  <!-- La fila entera es el objetivo táctil (min 44px de alto): un aviso sin
       más acción que "ábrelo" no gana nada con un botón aparte dentro. -->
  <div
    class="group relative flex items-start gap-3 px-4 py-3 min-h-[44px] rounded-2xl transition-colors duration-150"
    :class="
      notice.is_read
        ? 'bg-transparent active:bg-gray-100 dark:active:bg-gray-800'
        : 'bg-blue-50/70 dark:bg-blue-500/10 active:bg-blue-100 dark:active:bg-blue-500/20'
    "
  >
    <button
      type="button"
      class="absolute inset-0 rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60"
      :aria-label="title"
      @click="emit('open', notice)"
    />

    <!-- Icono por tipo -->
    <div
      class="relative flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center"
      :class="accent.bg"
      aria-hidden="true"
    >
      <v-icon :name="accent.icon" class="w-4 h-4" :class="accent.text" />
    </div>

    <div class="relative flex-1 min-w-0 pointer-events-none">
      <div class="flex items-start gap-2">
        <p
          class="flex-1 text-footnote font-semibold leading-snug"
          :class="
            notice.is_read
              ? 'text-gray-700 dark:text-gray-300'
              : 'text-gray-900 dark:text-white'
          "
        >
          {{ title }}
        </p>

        <!-- El punto no es el único indicador: el fondo y el peso del texto
             también cambian, para no depender del color. -->
        <span
          v-if="!notice.is_read"
          class="flex-shrink-0 mt-1.5 w-2 h-2 rounded-full bg-blue-500"
          aria-hidden="true"
        />
      </div>

      <p class="mt-0.5 text-footnote leading-snug text-gray-600 dark:text-gray-400">
        {{ body }}
      </p>

      <p class="mt-1 text-2xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
        {{ relativeTime }}
      </p>
    </div>

    <!-- Borrar: visible siempre en táctil (no depende de hover) -->
    <button
      type="button"
      class="relative flex-shrink-0 w-11 h-11 -mr-2 -mt-1 rounded-full flex items-center justify-center text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 active:scale-90 transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500/50"
      :aria-label="$t('notice.actions.delete')"
      :title="$t('notice.actions.delete')"
      @click.stop="emit('remove', notice)"
    >
      <v-icon name="hi-solid-trash" class="w-4 h-4" />
    </button>
  </div>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { Notice } from "@/interfaces/notice/Notice";

const props = defineProps<{ notice: Notice }>();

const emit = defineEmits<{
  open: [notice: Notice];
  remove: [notice: Notice];
}>();

const { t, te } = useI18n();

/**
 * El texto se arma aquí, no se toma del `title`/`body` que manda la API.
 *
 * Un aviso que llega por Ably se renderizó con el idioma de quien lo disparó
 * (quien invita), no con el de quien lo recibe. Con `type` + `payload` el
 * idioma siempre es el de esta sesión. La cadena del servidor queda de reserva
 * para un tipo que este build todavía no conozca.
 */
const translate = (key: "title" | "body", fallback: string): string => {
  const path = `notice.types.${props.notice.type}.${key}`;
  return te(path) ? t(path, props.notice.payload ?? {}) : fallback;
};

const title = computed(() => translate("title", props.notice.title));
const body = computed(() => translate("body", props.notice.body));

const ACCENTS: Record<string, { icon: string; bg: string; text: string }> = {
  fantasy_league_invitation: {
    icon: "bi-trophy-fill",
    bg: "bg-emerald-100 dark:bg-emerald-500/15",
    text: "text-emerald-600 dark:text-emerald-400",
  },
  pool_invitation: {
    icon: "hi-solid-users",
    bg: "bg-blue-100 dark:bg-blue-500/15",
    text: "text-blue-600 dark:text-blue-400",
  },
};

const accent = computed(
  () =>
    ACCENTS[props.notice.type] ?? {
      icon: "hi-solid-bell",
      bg: "bg-gray-100 dark:bg-gray-800",
      text: "text-gray-600 dark:text-gray-300",
    },
);

const relativeTime = computed(() => {
  const created = new Date(props.notice.created_at.replace(" ", "T"));
  const minutes = Math.floor((Date.now() - created.getTime()) / 60000);

  if (!Number.isFinite(minutes) || minutes < 1) return t("notice.time.now");
  if (minutes < 60) return t("notice.time.minutes", { n: minutes });
  if (minutes < 60 * 24) return t("notice.time.hours", { n: Math.floor(minutes / 60) });
  return t("notice.time.days", { n: Math.floor(minutes / (60 * 24)) });
});
</script>
