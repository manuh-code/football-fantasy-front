<template>
  <BottomSheet
    :is-visible="isVisible"
    :title="$t('notice.panel.title')"
    :subtitle="subtitle"
    icon="hi-solid-bell"
    icon-variant="blue"
    size="lg"
    role="dialog"
    @close="emit('close')"
  >
    <template #header>
      <div class="flex items-center justify-between gap-3">
        <div class="flex items-center gap-3 min-w-0">
          <div class="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-500/15 flex items-center justify-center flex-shrink-0">
            <v-icon name="hi-solid-bell" class="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div class="min-w-0">
            <h2 class="text-base font-bold text-gray-900 dark:text-white truncate">
              {{ $t("notice.panel.title") }}
            </h2>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
              {{ subtitle }}
            </p>
          </div>
        </div>

        <div class="flex items-center gap-1 flex-shrink-0">
          <button
            v-if="noticeStore.hasUnread"
            type="button"
            class="h-9 px-3 rounded-full text-2xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 active:scale-95 transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50"
            @click="noticeStore.markAllAsRead()"
          >
            {{ $t("notice.panel.markAllRead") }}
          </button>
          <button
            type="button"
            class="w-9 h-9 rounded-full flex items-center justify-center text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-90 transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400/50"
            :aria-label="$t('common.actions.close')"
            @click="emit('close')"
          >
            <v-icon name="hi-solid-x" class="w-4 h-4" />
          </button>
        </div>
      </div>
    </template>

    <!-- Cargando: esqueletos con la misma altura que las filas reales, para
         que la lista no dé un salto al llegar los datos. -->
    <div v-if="isFirstLoad" class="flex flex-col gap-1 py-1" aria-hidden="true">
      <div
        v-for="n in 4"
        :key="n"
        class="flex items-start gap-3 px-4 py-3 rounded-2xl animate-pulse"
      >
        <div class="w-9 h-9 rounded-xl bg-gray-200 dark:bg-gray-800 flex-shrink-0" />
        <div class="flex-1 space-y-2 pt-1">
          <div class="h-3 w-1/2 rounded bg-gray-200 dark:bg-gray-800" />
          <div class="h-3 w-4/5 rounded bg-gray-200 dark:bg-gray-800" />
        </div>
      </div>
    </div>

    <NoticeEmptyState v-else-if="!noticeStore.notices.length" />

    <div v-else class="flex flex-col gap-1 py-1">
      <NoticeItem
        v-for="notice in noticeStore.notices"
        :key="notice.uuid"
        :notice="notice"
        @open="openNotice"
        @remove="noticeStore.remove($event.uuid)"
      />
    </div>

    <template #footer>
      <button
        type="button"
        class="w-full h-11 rounded-xl bg-gray-100 dark:bg-gray-800 text-footnote font-semibold text-gray-700 dark:text-gray-200 active:scale-[0.98] transition-transform duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50"
        @click="goToAll"
      >
        {{ $t("notice.panel.viewAll") }}
      </button>
    </template>
  </BottomSheet>
</template>

<script lang="ts" setup>
import { computed, watch } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import BottomSheet from "@/components/ui/BottomSheet.vue";
import NoticeItem from "@/components/notice/NoticeItem.vue";
import NoticeEmptyState from "@/components/notice/NoticeEmptyState.vue";
import { useNoticeStore } from "@/store/notice/useNoticeStore";
import { Notice } from "@/interfaces/notice/Notice";

const props = defineProps<{ isVisible: boolean }>();
const emit = defineEmits<{ close: [] }>();

const noticeStore = useNoticeStore();
const router = useRouter();
const { t } = useI18n();

const isFirstLoad = computed(
  () => noticeStore.isLoading && !noticeStore.hasLoadedOnce,
);

const subtitle = computed(() =>
  noticeStore.hasUnread
    ? t(
        "notice.panel.subtitleUnread",
        { count: noticeStore.unreadCount },
        noticeStore.unreadCount,
      )
    : t("notice.panel.subtitleEmpty"),
);

// La lista se pide al abrir, no al montar: la campanita vive en el header de
// toda la app y no vale una petición por cada carga de página.
watch(
  () => props.isVisible,
  (visible) => {
    if (visible) noticeStore.fetch(1);
  },
);

function openNotice(notice: Notice): void {
  noticeStore.markAsRead(notice.uuid);
  emit("close");

  if (notice.action_url) {
    router.push(notice.action_url);
  }
}

function goToAll(): void {
  emit("close");
  router.push({ name: "notices" });
}
</script>
