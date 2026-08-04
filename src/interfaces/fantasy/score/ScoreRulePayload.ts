export interface ScoreRulePayload {
    score_rules: ScoreRuleItem[]
}

export interface ScoreRuleItem {
    type_uuid: string
    position_uuid: string
    points: number
    /** Apagada, la estadística deja de sumar en esta liga sin perder su valor. */
    is_enabled: boolean
}
