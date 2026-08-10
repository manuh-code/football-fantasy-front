import { defineStore } from "pinia";
import { computed, ref } from "vue";
import type { Notice } from "@/interfaces/notice/Notice";

/**
 * El servicio se carga bajo demanda, NO con un import estático.
 *
 * Este store cuelga de la campanita, que vive en el header y por tanto en
 * App.vue: un import estático haría que `useApiFantasy` (y con él el router)
 * se evaluara antes que `router/index.ts`, entrando en el ciclo
 * router → LoginService → useApiFantasy con `import.meta.env` todavía sin
 * asignar. Es el mismo motivo por el que el guard del router importa
 * CatalogService dinámicamente (ver src/router/index.ts).
 */
const noticeService = async () =>
  (await import("@/services/notice/NoticeService")).default;

/**
 * Bandeja de avisos (la campanita).
 *
 * No persiste: el contador y la lista se piden al arrancar y se mantienen al
 * día por Ably. Guardarlos en localStorage sólo serviría para enseñar un número
 * viejo durante el primer segundo.
 */
export const useNoticeStore = defineStore("notice", () => {
  const notices = ref<Notice[]>([]);
  const unreadCount = ref(0);
  const isLoading = ref(false);
  const hasLoadedOnce = ref(false);
  const currentPage = ref(1);
  const lastPage = ref(1);

  const hasUnread = computed(() => unreadCount.value > 0);
  const hasMore = computed(() => currentPage.value < lastPage.value);

  /** Tope del globito: a partir de aquí se muestra "9+". */
  const badgeLabel = computed(() =>
    unreadCount.value > 9 ? "9+" : String(unreadCount.value),
  );

  async function fetchUnreadCount(): Promise<void> {
    try {
      unreadCount.value = await (await noticeService()).unreadCount();
    } catch {
      // Silencioso a propósito: el contador no vale una interrupción.
    }
  }

  async function fetch(page = 1): Promise<void> {
    isLoading.value = true;
    try {
      const { items, pagination } = await (await noticeService()).list(page);

      notices.value = page === 1 ? items : [...notices.value, ...items];
      currentPage.value = pagination?.current_page ?? page;
      lastPage.value = pagination?.last_page ?? page;
      hasLoadedOnce.value = true;
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchNextPage(): Promise<void> {
    if (!hasMore.value || isLoading.value) return;
    await fetch(currentPage.value + 1);
  }

  async function markAsRead(uuid: string): Promise<void> {
    const notice = notices.value.find((item) => item.uuid === uuid);
    if (!notice || notice.is_read) return;

    // Optimista: la campanita responde al instante y se corrige sola en el
    // siguiente fetch si el servidor rechaza.
    notice.is_read = true;
    unreadCount.value = Math.max(0, unreadCount.value - 1);

    try {
      await (await noticeService()).markAsRead(uuid);
    } catch {
      notice.is_read = false;
      unreadCount.value += 1;
    }
  }

  async function markAllAsRead(): Promise<void> {
    const previous = notices.value.map((item) => item.is_read);
    const previousCount = unreadCount.value;

    notices.value.forEach((item) => (item.is_read = true));
    unreadCount.value = 0;

    try {
      await (await noticeService()).markAllAsRead();
    } catch {
      notices.value.forEach((item, index) => (item.is_read = previous[index]));
      unreadCount.value = previousCount;
    }
  }

  async function remove(uuid: string): Promise<void> {
    const index = notices.value.findIndex((item) => item.uuid === uuid);
    if (index === -1) return;

    const [removed] = notices.value.splice(index, 1);
    if (!removed.is_read) unreadCount.value = Math.max(0, unreadCount.value - 1);

    try {
      await (await noticeService()).remove(uuid);
    } catch {
      notices.value.splice(index, 0, removed);
      if (!removed.is_read) unreadCount.value += 1;
    }
  }

  /**
   * Aviso llegado por Ably. Se antepone a la lista sólo si ya se cargó alguna
   * vez; si no, el primer `fetch` lo traerá igual y evitamos una lista de un
   * solo elemento que parece incompleta.
   */
  function receive(notice: Notice, serverUnreadCount?: number): void {
    if (hasLoadedOnce.value && !notices.value.some((n) => n.uuid === notice.uuid)) {
      notices.value = [notice, ...notices.value];
    }

    unreadCount.value =
      typeof serverUnreadCount === "number"
        ? serverUnreadCount
        : unreadCount.value + 1;
  }

  function reset(): void {
    notices.value = [];
    unreadCount.value = 0;
    currentPage.value = 1;
    lastPage.value = 1;
    hasLoadedOnce.value = false;
  }

  return {
    notices,
    unreadCount,
    isLoading,
    hasLoadedOnce,
    hasUnread,
    hasMore,
    badgeLabel,
    fetch,
    fetchNextPage,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    remove,
    receive,
    reset,
  };
});
