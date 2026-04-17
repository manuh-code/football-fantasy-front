interface FootballFixtureScoreResponse {
    team_uuid: string;
    score: {
        goals: number;
        participant: "home" | "away";
    };
}

export default FootballFixtureScoreResponse;