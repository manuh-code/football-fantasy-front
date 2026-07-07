import { useApiFantasy } from "@/composables/useApiFantasy";
import { ApiResponse } from "@/interfaces/api/ApiResponse";
import { FootballFixtureResponse } from "@/interfaces/football/fixture/FootballFixtureResponse";
import { SurvivorPayload } from "@/interfaces/survivor/SurvivorPayload";
import { SurvivorResponse } from "@/interfaces/survivor/SurvivorResponse";
import { SurvivorUserPickResponse } from "@/interfaces/survivor/SurvivorUserPickResponse";

export class SurvivorService {
    private api;

    constructor() {
        const { apiFantasyInstance } = useApiFantasy();
        this.api = apiFantasyInstance;
    }

    async getMySurvivors(): Promise<SurvivorResponse[]> {
        const response = await this.api.get<ApiResponse<SurvivorResponse[]>>("survivor/my/survivors");
        if (response.data.code === 200) {
            return response.data.data;
        }

        throw new Error('Failed to fetch my survivors');

    }

    async getFixturesBySurvivorUuidAndRoundUuid(survivorUuid: string, roundUuid: string): Promise<FootballFixtureResponse[]> {
        const response = await this.api.get<ApiResponse<FootballFixtureResponse[]>>(`survivor/${survivorUuid}/fixtures/round/${roundUuid}`);
        if (response.data.code === 200) {
            return response.data.data;
        }
        throw new Error('Failed to fetch fixtures by survivor UUID and round UUID');
    }

    async picksBySurvivor(payload: SurvivorPayload): Promise<FootballFixtureResponse[]> {
        const response = await this.api.post<ApiResponse<FootballFixtureResponse[]>>(`/survivor/pick`, payload);
        if (response.data.code === 200) {
            return response.data.data;
        }
        throw new Error('Failed to fetch picks by survivor UUID');
    }

    async getMyPicksBySurvivorUuid(survivorUuid: string): Promise<SurvivorUserPickResponse[]> {
        const response = await this.api.get<ApiResponse<SurvivorUserPickResponse[]>>(`survivor/${survivorUuid}/my/picks`);
        if (response.data.code === 200) {
            return response.data.data;
        }
        throw new Error('Failed to fetch my picks by survivor UUID');
    }
}

export const survivorService = new SurvivorService();
export default survivorService;