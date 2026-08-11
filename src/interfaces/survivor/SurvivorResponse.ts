import type { FootballLeagueSummary } from "@/interfaces/football/league/FootballLeagueSummary";
import type { SurvivorRules } from "@/interfaces/survivor/SurvivorSettingsResponse";

export interface SurvivorResponse {
  uuid: string;
  name: string;
  description: string;
  max_lives: number;
  status: string;

  /** Un survivor de la casa (uno por liga, con todos dentro) frente a uno creado por alguien. */
  is_official: boolean;
  /** Quien pregunta lo administra. Siempre false en los oficiales. */
  is_admin: boolean;

  /** Cómo le va a quien pregunta. Null si por lo que sea no tiene ficha. */
  lives_remaining: number | null;
  participant_status: string | null;

  /** Sólo llega al admin: es la llave para que otros entren. */
  access_code?: string;

  /** Null en los oficiales: no tienen cupo. */
  max_participants: number | null;
  participants_count?: number;

  league?: FootballLeagueSummary;
  rules: SurvivorRules;
}
