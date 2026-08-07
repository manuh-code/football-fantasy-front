import type { AxiosRequestConfig } from "axios";
import { useApiFantasy } from "@/composables/useApiFantasy";
import { ApiResponse } from "@/interfaces/api/ApiResponse";
import { FootballFixtureResponse } from "@/interfaces/football/fixture/FootballFixtureResponse";
import { FootballStageResponse } from "@/interfaces/football/stage/FootballStageResponse";
import { PoolJoinPayload } from "@/interfaces/pool/PoolJoinPayload";
import { PoolPayload } from "@/interfaces/pool/PoolPayload";
import { PoolPredictionResponse } from "@/interfaces/pool/PoolPredictionResponse";
import { PoolResponse } from "@/interfaces/pool/PoolResponse";
import { PoolSavePredictionPayload } from "@/interfaces/pool/PoolSavePredictionPayload";
import { PoolSettingsPayload } from "@/interfaces/pool/PoolSettingsPayload";
import { PoolSettingsResponse } from "@/interfaces/pool/PoolSettingsResponse";
import { PoolStandingResponse } from "@/interfaces/pool/PoolStandingResponse";

export class PoolService {
    private api;

    constructor() {
        const { apiFantasyInstance } = useApiFantasy();
        this.api = apiFantasyInstance;
    }

    async getMyPools(silent = false): Promise<PoolResponse[]> {
        // Ver la nota de `silent` en SurvivorService.getMySurvivors: el hub de
        // inicio necesita que un fallo aquí no dispare un toast global.
        const config = silent
            ? ({ _silent: true } as AxiosRequestConfig & { _silent?: boolean })
            : undefined;
        const response = await this.api.get<ApiResponse<PoolResponse[]>>("/pool/show-my-pools", config);
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

    /**
     * Cupo y puntos por acierto de la quiniela. Lo consume la pestaña de reglas
     * para todos los participantes; `is_editable` en la respuesta dice si quien
     * pregunta puede además cambiarlos.
     */
    async getPoolSettings(poolGroupUuid: string): Promise<PoolSettingsResponse> {
        const response = await this.api.get<ApiResponse<PoolSettingsResponse>>(`/pool/settings/${poolGroupUuid}`);
        if (response.data.code === 200) {
            return response.data.data;
        }

        throw new Error('Failed to fetch pool settings');
    }

    async updatePoolSettings(poolGroupUuid: string, payload: PoolSettingsPayload): Promise<PoolSettingsResponse> {
        const response = await this.api.put<ApiResponse<PoolSettingsResponse>>(`/pool/settings/${poolGroupUuid}`, payload);
        if (response.data.code === 200) {
            return response.data.data;
        }

        throw new Error('Failed to update pool settings');
    }

    /** Devuelve la puntuación al set compartido. El cupo no se toca. */
    async resetPoolSettings(poolGroupUuid: string): Promise<PoolSettingsResponse> {
        const response = await this.api.delete<ApiResponse<PoolSettingsResponse>>(`/pool/settings/${poolGroupUuid}`);
        if (response.data.code === 200) {
            return response.data.data;
        }

        throw new Error('Failed to reset pool settings');
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

    async savePoolPrediction(payload: PoolSavePredictionPayload): Promise<PoolPredictionResponse> {

        const response = await this.api.post<ApiResponse<PoolPredictionResponse>>("/pool/prediction", payload);
        if (response.data.code === 200) {
            return response.data.data;
        }

        throw new Error('Failed to save pool prediction');
    }

    async getPoolFixtures(poolGroupUuid: string, roundUuid: string): Promise<FootballFixtureResponse[]> {
        const response = await this.api.get<ApiResponse<FootballFixtureResponse[]>>(`/pool/fixtures/prediction/${poolGroupUuid}/round/${roundUuid}`);
        if (response.data.code === 200) {
            return response.data.data;
        }

        throw new Error('Failed to fetch pool fixtures');
    }

    async getPoolFixturePredictionByUser(poolGroupUuid: string, roundUuid: string, userUuid: string): Promise<FootballFixtureResponse[]> {
        const response = await this.api.get<ApiResponse<FootballFixtureResponse[]>>(`/pool/fixtures/prediction/${poolGroupUuid}/round/${roundUuid}/user/${userUuid}`);
        if (response.data.code === 200) {
            return response.data.data;
        }

        throw new Error('Failed to fetch pool fixture predictions by user');
    }

    async getPoolStandingsByRound(poolGroupUuid: string, roundUuid: string): Promise<PoolStandingResponse[]> {
        const response = await this.api.get<ApiResponse<PoolStandingResponse[]>>(`/pool/standings/${poolGroupUuid}/round/${roundUuid}`);
        if (response.data.code === 200) {
            return response.data.data;
        }

        throw new Error('Failed to fetch pool standings');
    }

    async getPoolStandingOverall(poolGroupUuid: string): Promise<PoolStandingResponse[]> {
        const response = await this.api.get<ApiResponse<PoolStandingResponse[]>>(`/pool/standings/${poolGroupUuid}`);
        if (response.data.code === 200) {
            return response.data.data;
        }

        throw new Error('Failed to fetch pool overall standings');
    }
}

export const poolService = new PoolService();
export default poolService;