import { useApiFantasy } from "@/composables/useApiFantasy";
import { ApiResponse } from "@/interfaces/api/ApiResponse";
import { FootballStageResponse } from "@/interfaces/football/stage/FootballStageResponse";
import { PoolJoinPayload } from "@/interfaces/pool/PoolJoinPayload";
import { PoolPayload } from "@/interfaces/pool/PoolPayload";
import { PoolResponse } from "@/interfaces/pool/PoolResponse";

export class PoolService {
    private api;

    constructor() {
        const { apiFantasyInstance } = useApiFantasy();
        this.api = apiFantasyInstance;
    }

    async getMyPools(): Promise<PoolResponse[]> {
        const response = await this.api.get<ApiResponse<PoolResponse[]>>("/pool/show-my-pools");
        if (response.data.code === 200) {
            return response.data.data;
        }

        throw new Error('Failed to fetch my pools');
    }

    async getPoolByUuid(poolUuid: string): Promise<PoolResponse> {
        const response = await this.api.get<ApiResponse<PoolResponse>>(`/pool/show/${poolUuid}`);
        if (response.data.code === 200) {
            return response.data.data;
        }

        throw new Error('Failed to fetch pool by UUID');
    }

    async createPool(payload: PoolPayload): Promise<PoolResponse> {
        const response = await this.api.post<ApiResponse<PoolResponse>>("/pool/store", payload);
        if (response.data.code === 200) {
            return response.data.data;
        }

        throw new Error('Failed to create pool');
    }

    async joinPool(payload: PoolJoinPayload): Promise<PoolResponse> {
        const response = await this.api.post<ApiResponse<PoolResponse>>("/pool/join", payload);
        if (response.data.code === 200) {
            return response.data.data;
        }

        throw new Error('Failed to join pool');
    }

    async getStagePoolByLeagueUuid(leagueUuid: string): Promise<FootballStageResponse> {
        const response = await this.api.get<ApiResponse<FootballStageResponse>>(`/pool/league/${leagueUuid}/stage`);

        if (response.data.code === 200) {
            return response.data.data;
        }

        throw new Error('Failed to fetch stage pools by league UUID');
    }
}

export const poolService = new PoolService();
export default poolService;