export type InvitableType = "fantasy_league" | "pool_group" | "survivor_pool";

export type InvitationStatus =
  | "pending"
  | "accepted"
  | "declined"
  | "cancelled"
  | "expired";

export interface InvitationInvitable {
  type: InvitableType;
  uuid: string;
  name: string;
  description: string | null;
  image: string | null;
  /** Ruta del front a la que lleva una vez dentro (p. ej. /pools/{uuid}). */
  path: string;
  is_full: boolean;
  is_open: boolean;
}

export interface Invitation {
  uuid: string;
  email: string;
  status: InvitationStatus;
  expires_at: string | null;
  responded_at: string | null;
  created_at: string;
  /** El correo invitado todavía no tiene cuenta: hay que registrarse primero. */
  requires_account: boolean;
  inviter: {
    name: string | null;
    avatar: string | null;
  };
  invitable: InvitationInvitable | null;
}

export interface InvitationCreatePayload {
  invitable_type: InvitableType;
  invitable_uuid: string;
  email: string;
}
