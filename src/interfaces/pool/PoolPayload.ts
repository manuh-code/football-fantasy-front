export interface PoolPayload {
  stage_uuid: string;
  name: string;
  description?: string | null;
  /** Cupo de la quiniela. Omitirlo deja el que trae el API por defecto. */
  max_participants?: number | null;
}
