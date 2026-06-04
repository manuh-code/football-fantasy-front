import { useApiFantasy } from "@/composables/useApiFantasy";
import { ApiResponse } from "@/interfaces/api/ApiResponse";
import { FootballRoundResponse } from "@/interfaces/football/round/FootballRoundResponse";

export class FootballTeamService {
    private api;
    
    constructor() {
        const { apiFantasyInstance } = useApiFantasy();
        this.api = apiFantasyInstance;
    }

    async getScheduleByTeamAndStage(teamUuid: string, stageUuid: string): Promise<FootballRoundResponse[]> {
        const response = await this.api.get<ApiResponse<FootballRoundResponse[]>>(`/football/teams/${teamUuid}/stage/${stageUuid}/schedule`);
        if (response.data.code === 200) {
            return response.data.data;
        }
        throw new Error('Failed to fetch schedule by team and stage');
    }

}

export const footballTeamService = new FootballTeamService();
export default footballTeamService;