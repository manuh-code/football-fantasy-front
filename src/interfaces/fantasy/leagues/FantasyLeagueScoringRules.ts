import { TypeResponse } from "@/interfaces/football/type/TypeResponse";

export interface FantasyLeagueScoringRules {
    position: TypeResponse | null;
    rules: FantasyRule[];
}

export interface FantasyRule {
    uuid: string;
    type: TypeResponse | null;
    position: TypeResponse | null;
    points: number;
    condition: FantasyRuleCondition | null;
    hasCondition?: boolean; // Indica si esta regla permite tener condiciones
}

export type FantasyRuleCondition =
    | string
    | number
    | boolean
    | null
    | Record<string, unknown>
    | unknown[];