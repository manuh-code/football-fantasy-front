export interface ScoreRulePayload {
    score_rules: ScoreRuleItem[]
}

export interface ScoreRuleItem {
    type_uuid: string
    position_uuid: string
    points: number
    condition: string
}