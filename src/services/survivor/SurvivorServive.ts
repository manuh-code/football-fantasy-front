import type { AxiosRequestConfig } from "axios";
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

    async getMyPicksBySurvivorUuid(survivorUuid: string, silent = false): Promise<SurvivorUserPickResponse[]> {
        // `silent` suppresses the global error toast so a not-found/stale
        // survivor uuid is handled by the component's own error+retry UI
        // instead of a confusing "resource not found" toast.
        const config = silent
            ? ({ _silent: true } as AxiosRequestConfig & { _silent?: boolean })
            : undefined;
        const response = await this.api.get<ApiResponse<SurvivorUserPickResponse[]>>(`survivor/${survivorUuid}/my/picks`, config);
        if (response.data.code === 200) {
            return response.data.data;
        }
        throw new Error('Failed to fetch my picks by survivor UUID');
    }

    async deletePickById(pickId: bigint): Promise<void> {
        const response = await this.api.delete<ApiResponse<void>>(`survivor/pick/${pickId}`);
        if (response.data.code === 200) {
            return;
        }
        throw new Error('Failed to delete pick by ID');
    }

    async deleteAllPickById(pickIds: bigint[]): Promise<void> {
        const response = await this.api.post<ApiResponse<void>>(`survivor/delete/all/picks`, { pick_ids: pickIds });
        if (response.data.code === 200) {
            return;
        }
        throw new Error('Failed to delete picks by IDs');
    }
}

export const survivorService = new SurvivorService();
export default survivorService;