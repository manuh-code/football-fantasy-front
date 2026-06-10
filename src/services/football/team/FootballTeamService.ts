import { useApiFantasy } from "@/composables/useApiFantasy";
import { ApiResponse } from "@/interfaces/api/ApiResponse";
import { FootballRoundResponse } from "@/interfaces/football/round/FootballRoundResponse";
import { FootballTeamProfileResponse } from "@/interfaces/football/team/FootballTeamProfileResponse";
import { FootballTeamTopStatisticResponse } from "@/interfaces/football/team/FootballTeamTopStatisticResponse";

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

    async getTopStatisticTeamsBySeason(seasonUuid: string): Promise<FootballTeamTopStatisticResponse[]> {
        const response = await this.api.get<ApiResponse<FootballTeamTopStatisticResponse[]>>(`/football/teams/season/${seasonUuid}/statistics`);
        if (response.data.code === 200) {
            return response.data.data;
        }
        throw new Error('Failed to fetch top statistic teams by season');
    }

    async getTeamProfileByStage(teamUuid: string, stageUuid: string): Promise<FootballTeamProfileResponse> {
        const response = await this.api.get<ApiResponse<FootballTeamProfileResponse>>(`/football/teams/${teamUuid}/stage/${stageUuid}/profile`);
        if (response.data.code === 200) {
            return response.data.data;
        }
        throw new Error('Failed to fetch team profile by stage');
    }
}

export const footballTeamService = new FootballTeamService();
export default footballTeamService;