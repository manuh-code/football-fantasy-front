import { useApiFantasy } from "@/composables/useApiFantasy";
import { ApiResponse } from "@/interfaces/api/ApiResponse";
import { FootballPlayerFantasyPointsPayload } from "@/interfaces/football/player/FootballPlayerFantasyPointsPayload";
import { FootballPlayerFantasyPointsResponse } from "@/interfaces/football/player/FootballPlayerFantasyPointsResponse";
import { FootballPlayerStatisticByStageResponse } from "@/interfaces/football/player/FootballPlayerStatisticByStageResponse";
import { FootballPlayerStatisticPayload } from "@/interfaces/football/player/FootballPlayerStatisticPayload";
import { FootballPlayerStatisticResponse } from "@/interfaces/football/player/FootballPlayerStatisticResponse";
import { FootballPlayerTopScorePayload } from "@/interfaces/football/player/FootballPlayerTopScorePayload";
import { FootballPlayerTopScoreResponse } from "@/interfaces/football/player/FootballPlayerTopScoreResponse";
import { FootballPlayerVersusResponse } from "@/interfaces/football/player/FootballPlayerVersusResponse";
import { TeamOfTheWeekByRoundResponse } from "@/interfaces/football/teamOfTheWeek/TeamOfTheWeekByRoundResponse";
import { AxiosError } from "axios";

export class FootballPlayerService {
    private api;

    constructor() {
        const { apiFantasyInstance } = useApiFantasy();
        this.api = apiFantasyInstance;
    }

    async getFootballPlayerStatistics(payload: FootballPlayerStatisticPayload, footballSeasonUuid: string): Promise<ApiResponse<FootballPlayerStatisticResponse[]>> {
        const response = await this.api.post<ApiResponse<FootballPlayerStatisticResponse[]>>(`/football/players/statistics/season/${footballSeasonUuid}`, payload);
        if (response.data.code === 200) {
            return response.data;
        }

        throw new AxiosError('Failed to fetch football player statistics');
    }

    async getFootballPlayerTopScore(payload: FootballPlayerTopScorePayload, footballSeasonUuid: string): Promise<ApiResponse<FootballPlayerTopScoreResponse[]>> {
        const response = await this.api.post<ApiResponse<FootballPlayerTopScoreResponse[]>>(`football/players/statistics/topScore/season/${footballSeasonUuid}`, payload);
        if (response.data.code === 200) {
            return response.data;
        }

        throw new AxiosError('Failed to fetch football player top scores');
    }

    async getPlayerFantasyScore(payload: FootballPlayerFantasyPointsPayload, fantasyLeagueUuid: string): Promise<ApiResponse<FootballPlayerFantasyPointsResponse[]>> {
        const response = await this.api.post<ApiResponse<FootballPlayerFantasyPointsResponse[]>>(`/football/players/fantasy/score/${fantasyLeagueUuid}`, payload);
        if (response.data.code === 200) {
            return response.data;
        }

        throw new AxiosError('Failed to fetch football player fantasy score');
    }

    async getPlayerVersus(player1Uuid: string, player2Uuid: string, seasonUuid: string): Promise<ApiResponse<FootballPlayerVersusResponse>> {
        const response = await this.api.get<ApiResponse<FootballPlayerVersusResponse>>(`/football/players/versus/${player1Uuid}/vs/${player2Uuid}/season/${seasonUuid}`);
        if (response.data.code === 200) {
            return response.data;
        }

        throw new AxiosError('Failed to fetch football player versus data');
    }

    async getPlayerStatisticByStage(stageUuid: string, select: string = 'GOALS,ASSISTS,RATING,ACCURATE_PASSES,PENALTIES_SCORED,YELLOWCARDS,SAVES,INTERCEPTIONS,TACKLES_WON'): Promise<ApiResponse<FootballPlayerStatisticByStageResponse[]>> {
        const response = await this.api.get<ApiResponse<FootballPlayerStatisticByStageResponse[]>>(`/football/players/statistics/stage/${stageUuid}?select=${select}`);
        if (response.data.code === 200) {
            return response.data;
        }

        throw new AxiosError('Failed to fetch football player statistics by stage');
    }

    async getTeamOfTheWeekByRound(roundUuid: string): Promise<ApiResponse<TeamOfTheWeekByRoundResponse[]>> {
        const response = await this.api.get<ApiResponse<TeamOfTheWeekByRoundResponse[]>>(`/rounds/${roundUuid}/team-of-the-week`);
        if (response.data.code === 200) {
            return response.data;
        }

        throw new AxiosError('Failed to fetch team of the week by round');
    }
}

export const footballPlayerService = new FootballPlayerService();
export default footballPlayerService;