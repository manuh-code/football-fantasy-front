export interface ScoreResponse {
    id: number;
    fixture_id: number;
    type_id: number;
    participant_id: number;
    score: {
        goals: number;
        participant: "home" | "away";
    };
    description: string;
}