/**
 * Códigos de lo que desbloquea Premium. Son los `value` del enum PremiumFeature
 * del API: si aquí falta uno, el candado sigue existiendo en el servidor, sólo
 * que el front no sabría pintarlo.
 */
export const PREMIUM_FEATURES = {
  fantasyPremiumLeagues: "fantasy.premium_leagues",
  fantasyMockDraft: "fantasy.mock_draft",
  fantasyScoringRules: "fantasy.scoring_rules",
  fantasyRosterGrade: "fantasy.roster_grade",
  poolPremiumLeagues: "pool.premium_leagues",
  poolMaxParticipants: "pool.max_participants",
  poolScoringRules: "pool.scoring_rules",
  survivorCustomPools: "survivor.custom_pools",
  survivorPremiumLeagues: "survivor.premium_leagues",
} as const;

export type PremiumFeature =
  (typeof PREMIUM_FEATURES)[keyof typeof PREMIUM_FEATURES];

/**
 * GET /user/entitlements — qué tiene desbloqueado el usuario.
 *
 * Aparte de la suscripción a propósito: aquello describe la relación con Stripe
 * (precio, próximo cobro), esto describe qué puede hacer dentro de la app, y
 * será igual cuando la compra venga de Google Play o de la App Store.
 */
export interface EntitlementsResponse {
  is_premium: boolean;
  /** Quién concede el derecho: `stripe`, y más adelante las tiendas móviles. */
  source: string | null;
  /** Sólo tiene fecha cuando ya se canceló; null mientras se renueve. */
  expires_at: string | null;
  /** Cancelado, pero dentro del periodo ya pagado: Premium sigue vivo. */
  on_grace_period: boolean;
  /** Un booleano por código de PREMIUM_FEATURES. */
  features: Record<string, boolean>;
  /**
   * Topes numéricos que dependen del plan (p. ej. el cupo máximo de una
   * quiniela). Van aparte de `features` porque no son un sí/no: el formulario
   * los necesita para acotar el control antes de que el usuario escriba.
   */
  limits: Record<string, number>;
}

/** Cuerpo del 402 que devuelve el API al chocar con un candado. */
export interface PremiumRequiredPayload {
  reason: "premium_required";
  feature: PremiumFeature;
}
