import { onUnmounted, watch } from "vue";
import type { Types } from "ably";
import { useAblyBroadcast } from "@/composables/broadcast/useAblyBroadcast";
import { useNoticeStore } from "@/store/notice/useNoticeStore";
import { useUserStore } from "@/store";
import { NoticeCreatedEvent } from "@/interfaces/notice/Notice";

/**
 * Mantiene la campanita al día en vivo.
 *
 * Se monta una sola vez, en el header: la suscripción sigue al usuario (entra
 * al iniciar sesión, se suelta al cerrarla) en vez de al ciclo de vida de una
 * pantalla, que dejaría la campanita muda al navegar.
 */
export function useNoticeRealtime() {
  const { userNoticesChannel } = useAblyBroadcast();
  const noticeStore = useNoticeStore();
  const userStore = useUserStore();

  let channel: Types.RealtimeChannelCallbacks | null = null;

  const onNoticeCreated = (message: Types.Message) => {
    const payload = message.data as NoticeCreatedEvent | undefined;
    if (!payload?.notice) return;

    // La fecha se toma del reloj local: el aviso acaba de llegar, y el
    // `created_at` del payload viene con la zona horaria de quien lo disparó.
    noticeStore.receive(
      { ...payload.notice, created_at: new Date().toISOString() },
      payload.unread_count,
    );
  };

  const unsubscribe = () => {
    if (!channel) return;
    channel.unsubscribe("notice.created", onNoticeCreated);
    channel = null;
  };

  const subscribe = (userUuid: string) => {
    unsubscribe();
    channel = userNoticesChannel(userUuid);
    channel.subscribe("notice.created", onNoticeCreated);
  };

  watch(
    () => userStore.getUserData?.uuid,
    (userUuid) => {
      if (userUuid) {
        subscribe(userUuid);
        noticeStore.fetchUnreadCount();
      } else {
        unsubscribe();
        noticeStore.reset();
      }
    },
    { immediate: true },
  );

  onUnmounted(unsubscribe);
}
