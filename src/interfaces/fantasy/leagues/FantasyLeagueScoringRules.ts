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
}

export interface FantasyRuleCondition {
    multiplier?: boolean;
    every?: number;
    min_rating?: number;
    min_minutes?: number;
}