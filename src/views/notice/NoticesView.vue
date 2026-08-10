<template>
  <div class="max-w-2xl mx-auto px-4 pt-16 sm:pt-20 pb-10">
    <header class="flex items-start justify-between gap-3 py-4">
      <div class="min-w-0">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
          {{ $t("notice.page.title") }}
        </h1>
        <p class="mt-1 text-footnote text-gray-600 dark:text-gray-400">
          {{ $t("notice.page.subtitle") }}
        </p>
      </div>

      <button
        v-if="noticeStore.hasUnread"
        type="button"
        class="flex-shrink-0 h-11 px-4 rounded-full text-footnote font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 active:scale-95 transition-transform duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50"
        @click="noticeStore.markAllAsRead()"
      >
        {{ $t("notice.panel.markAllRead") }}
      </button>
    </header>

    <div v-if="isFirstLoad" class="flex flex-col gap-1" aria-hidden="true">
      <div
        v-for="n in 6"
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

    <div v-else class="flex flex-col gap-1">
      <NoticeItem
        v-for="notice in noticeStore.notices"
        :key="notice.uuid"
        :notice="notice"
        @open="openNotice"
        @remove="noticeStore.remove($event.uuid)"
      />

      <button
        v-if="noticeStore.hasMore"
        type="button"
        class="mt-3 mx-auto h-11 px-5 rounded-full bg-gray-100 dark:bg-gray-800 text-footnote font-semibold text-gray-700 dark:text-gray-200 active:scale-95 transition-transform duration-150 disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50"
        :disabled="noticeStore.isLoading"
        @click="noticeStore.fetchNextPage()"
      >
        {{ $t("notice.page.loadMore") }}
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import NoticeItem from "@/components/notice/NoticeItem.vue";
import NoticeEmptyState from "@/components/notice/NoticeEmptyState.vue";
import { useNoticeStore } from "@/store/notice/useNoticeStore";
import { Notice } from "@/interfaces/notice/Notice";

const noticeStore = useNoticeStore();
const router = useRouter();

const isFirstLoad = computed(
  () => noticeStore.isLoading && !noticeStore.hasLoadedOnce,
);

onMounted(() => {
  noticeStore.fetch(1);
  noticeStore.fetchUnreadCount();
});

function openNotice(notice: Notice): void {
  noticeStore.markAsRead(notice.uuid);
  if (notice.action_url) router.push(notice.action_url);
}
</script>
