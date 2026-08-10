/**
 * Un aviso de la campanita.
 *
 * `title` / `body` vienen ya traducidos por la API, pero el front prefiere
 * renderizarlos él mismo a partir de `type` + `payload` (ver useNoticeText): un
 * aviso que llega por Ably se generó con el idioma de quien lo disparó, no con
 * el de quien lo recibe.
 */
export type NoticeType = "fantasy_league_invitation" | "pool_invitation";

export interface NoticePayload {
  /** Nombre de la liga o quiniela. */
  name?: string;
  /** Nombre de quien invita. */
  inviter?: string;
  invitation_uuid?: string;
  invitable_type?: string;
  invitable_uuid?: string;
  [key: string]: string | undefined;
}

export interface Notice {
  uuid: string;
  type: NoticeType;
  title: string;
  body: string;
  action_label: string;
  action_url: string | null;
  payload: NoticePayload;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}

export interface NoticeUnreadCount {
  unread_count: number;
}

/** Payload del evento `notice.created` en el canal personal de Ably. */
export interface NoticeCreatedEvent {
  notice: Notice;
  unread_count: number;
}
