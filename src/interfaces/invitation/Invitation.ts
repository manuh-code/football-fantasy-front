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
  /**
   * Se juega sobre una liga de pago. Para quien acepta sin suscripción es la
   * parte importante del mensaje: entra a algo que normalmente se cobra porque
   * quien le invitó sí paga.
   */
  requires_premium: boolean;
}

/**
 * El reparto de plazas para gente sin Premium de una liga fantasy de pago.
 *
 * Null en todo lo demás: en una liga gratuita no hay nada que repartir, y en
 * quinielas y survivor el invitado no le quita el sitio a nadie que pague.
 */
export interface InvitationGuestSeats {
  /** Cuántos invitados admite la liga: la mitad de sus lugares. */
  limit: number;
  /** Ocupados, contando invitaciones mandadas y todavía sin responder. */
  taken: number;
  available: number;
}

/** Lo que devuelve el listado del admin: las pendientes y el reparto. */
export interface PendingInvitations {
  invitations: Invitation[];
  guestSeats: InvitationGuestSeats | null;
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
