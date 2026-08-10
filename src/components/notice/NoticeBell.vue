<template>
  <div>
    <button
      type="button"
      class="relative w-9 h-9 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-90 transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50"
      :aria-label="ariaLabel"
      :title="$t('notice.bell.aria')"
      aria-haspopup="dialog"
      :aria-expanded="isPanelOpen"
      @click="isPanelOpen = true"
    >
      <v-icon name="hi-solid-bell" class="w-5 h-5" />

      <!-- Globito. El punto blanco de contorno lo separa del icono en ambos
           temas sin depender del fondo del header. -->
      <span
        v-if="noticeStore.hasUnread"
        class="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 ring-2 ring-white dark:ring-gray-900 flex items-center justify-center text-[10px] font-bold leading-none text-white tabular-nums"
        aria-hidden="true"
      >
        {{ noticeStore.badgeLabel }}
      </span>
    </button>

    <NoticePanel :is-visible="isPanelOpen" @close="isPanelOpen = false" />
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import NoticePanel from "@/components/notice/NoticePanel.vue";
import { useNoticeStore } from "@/store/notice/useNoticeStore";
import { useNoticeRealtime } from "@/composables/useNoticeRealtime";

const noticeStore = useNoticeStore();
const { t } = useI18n();

const isPanelOpen = ref(false);

// La campanita es el único punto fijo de la app donde vive la suscripción: se
// monta con el header y sobrevive a la navegación.
useNoticeRealtime();

// El número también se anuncia por voz: el globito rojo por sí solo no dice
// cuántos avisos hay ni existe para un lector de pantalla.
const ariaLabel = computed(() =>
  noticeStore.hasUnread
    ? t("notice.bell.ariaUnread", { count: noticeStore.unreadCount })
    : t("notice.bell.aria"),
);
</script>
