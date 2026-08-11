import { TypeResponse } from "@/interfaces/football/type/TypeResponse";
import { ScoringCondition } from "@/composables/fantasy/useScoringRuleMeta";

/** Por qué el editor está en sólo lectura. Null = todavía se puede editar. */
export type ScoringLockReason = "draft_started" | "league_started";

/**
 * Estilo de puntuación listo para aplicar.
 *
 * Sólo viaja la diferencia contra el set por defecto: `overrides` indexado por
 * código de posición y `developer_name` de la estadística. Lo que no aparece se
 * resuelve con el `default_points` de cada regla.
 */
export interface ScoringPresetResponse {
    code: string;
    name: string;
    description: string;
    overrides: Record<string, Record<string, number>>;
    /** Si viene, cualquier estadística fuera de la lista queda apagada. */
    only: string[] | null;
}

export interface ScoringEditorRuleResponse {
    uuid: string;
    type: TypeResponse | null;
    points: number;
    default_points: number;
    is_enabled: boolean;
    condition: ScoringCondition;
}

export interface ScoringEditorPositionResponse {
    position: TypeResponse | null;
    rules: ScoringEditorRuleResponse[];
}

export interface ScoringEditorResponse {
    is_editable: boolean;
    /** Congelado sólo por no pagar. Motivo distinto de `is_editable`, que habla del draft. */
    requires_premium: boolean;
    locked_reason: ScoringLockReason | null;
    /** La liga ya tiene su propio set, distinto del compartido. */
    is_custom: boolean;
    /** Preset que coincide exactamente con los valores vigentes, si hay alguno. */
    active_preset: string | null;
    presets: ScoringPresetResponse[];
    positions: ScoringEditorPositionResponse[];
}
