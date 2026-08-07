import { PoolScoringCode } from "./PoolSettingsResponse";

export interface PoolSettingsPayload {
    max_participants: number;
    /** El set completo: el API valida que vengan todos los aciertos. */
    scoring: Record<PoolScoringCode, number>;
}
