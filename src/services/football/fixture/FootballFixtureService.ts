import { useApiFantasy } from "@/composables/useApiFantasy";
import { ApiResponse } from "@/interfaces/api/ApiResponse";
import { FootballFixtureResponse } from "@/interfaces/football/fixture/FootballFixtureResponse";
import { FootballRoundResponse } from "@/interfaces/football/round/FootballRoundResponse";
import { FootballHeadToHeadMeta } from "@/interfaces/football/fixture/FootballHeadToHeadStatsResponse";
import { AxiosError } from "axios";

export class FootballFixtureService {
    private api;

    constructor() {
        const { apiFantasyInstance } = useApiFantasy();
        this.api = apiFantasyInstance;
    }

    async getFixturesForTheWeek(): Promise<FootballFixtureResponse[]> {
        const response = await this.api.get<ApiResponse<FootballFixtureResponse[]>>("/fixtures/this-week");
        if (response.data.code === 200) {
            return response.data.data;
        }

        throw new AxiosError('Failed to fetch football fixture data');
    }

    async getRoundBySeasonFixtures(leagueUuid: string): Promise<FootballRoundResponse[]> {
        const response = await this.api.get<ApiResponse<FootballRoundResponse[]>>(`/rounds/by/season/${leagueUuid}`);
        if (response.data.code === 200) {
            return response.data.data;
        }

        throw new AxiosError('Failed to fetch football fixture data');
    }

    async getCurrentFixtures(): Promise<void> {
        await this.api.get<ApiResponse<void>>("/fixtures/current");
    }

    async getFixturesByStageAndCurrentRound(stageUuid: string): Promise<FootballFixtureResponse[]> {
        const response = await this.api.get<ApiResponse<FootballFixtureResponse[]>>(`/fixtures/stage/${stageUuid}/round/current`);
        if (response.data.code === 200) {
            return response.data.data;
        }

        throw new AxiosError('Failed to fetch football fixture data');
    }

    async getFixuresByStageAndRound(stageUuid: string, roundUuid: string): Promise<FootballFixtureResponse[]> {
        const response = await this.api.get<ApiResponse<FootballFixtureResponse[]>>(`/fixtures/stage/${stageUuid}/round/${roundUuid}`);
        if (response.data.code === 200) {
            return response.data.data;
        }

        throw new AxiosError('Failed to fetch football fixture data');
    }

    async getAllFixturesByStage(stageUuid: string): Promise<FootballFixtureResponse[]> {
        const response = await this.api.get<ApiResponse<FootballFixtureResponse[]>>(`/fixtures/stage/${stageUuid}`);
        if (response.data.code === 200) {
            return response.data.data;
        }

        throw new AxiosError('Failed to fetch football fixture data');
    }

    async getMatchCenterFixture(fixtureUuid: string): Promise<ApiResponse<FootballFixtureResponse>> {
        const response = await this.api.get<ApiResponse<FootballFixtureResponse>>(`/fixtures/match/center/${fixtureUuid}`);
        if (response.data.code === 200) {
            return response.data;
        }

        throw new AxiosError('Failed to fetch football fixture data');
    }

    async getHeadToHeadByFixture(fixtureUuid: string): Promise<ApiResponse<FootballFixtureResponse[], FootballHeadToHeadMeta>> {
        const response = await this.api.get<ApiResponse<FootballFixtureResponse[], FootballHeadToHeadMeta>>(`/fixtures/head-to-head/${fixtureUuid}`);
        if (response.data.code === 200) {
            return response.data;
        }

        throw new AxiosError('Failed to fetch football fixture data');
    }
}

export const footballFixtureService = new FootballFixtureService();
export default footballFixtureService;