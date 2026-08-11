import type { AxiosRequestConfig } from "axios";
import { useApiFantasy } from "@/composables/useApiFantasy";
import { ApiResponse } from "@/interfaces/api/ApiResponse";
import { FootballFixtureResponse } from "@/interfaces/football/fixture/FootballFixtureResponse";
import { FootballStageResponse } from "@/interfaces/football/stage/FootballStageResponse";
import { SurvivorPayload } from "@/interfaces/survivor/SurvivorPayload";
import { SurvivorResponse } from "@/interfaces/survivor/SurvivorResponse";
import {
    SurvivorCreatePayload,
    SurvivorSettingsPayload,
    SurvivorSettingsResponse,
} from "@/interfaces/survivor/SurvivorSettingsResponse";
import { SurvivorUserPickResponse } from "@/interfaces/survivor/SurvivorUserPickResponse";

export class SurvivorService {
    private api;

    constructor() {
        const { apiFantasyInstance } = useApiFantasy();
        this.api = apiFantasyInstance;
    }

    async getMySurvivors(silent = false): Promise<SurvivorResponse[]> {
        // `silent` lo usa el hub de inicio: ahí esta llamada es una de tres que
        // se lanzan en paralelo para pintar "continuar jugando", y un fallo debe
        // degradar la sección en silencio, no lanzarle un toast de error a
        // alguien que solo abrió la app.
        const config = silent
            ? ({ _silent: true } as AxiosRequestConfig & { _silent?: boolean })
            : undefined;
        const response = await this.api.get<ApiResponse<SurvivorResponse[]>>("survivor/my/survivors", config);
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

    // ── Survivors creados por usuarios ──────────────────────────────────────

    /** La temporada en curso de una liga: sobre ella se jugará el survivor. */
    async getStageByLeagueUuid(leagueUuid: string): Promise<FootballStageResponse> {
        const response = await this.api.get<ApiResponse<FootballStageResponse>>(`survivor/league/${leagueUuid}/stage`);
        if (response.data.code === 200) {
            return response.data.data;
        }
        throw new Error('Failed to fetch the survivor stage for this league');
    }

    async createSurvivor(payload: SurvivorCreatePayload): Promise<SurvivorResponse> {
        const response = await this.api.post<ApiResponse<SurvivorResponse>>('survivor/store', payload);
        if (response.data.code === 200) {
            return response.data.data;
        }
        throw new Error('Failed to create survivor');
    }

    async joinByAccessCode(accessCode: string): Promise<SurvivorResponse> {
        const response = await this.api.post<ApiResponse<SurvivorResponse>>('survivor/join', { access_code: accessCode });
        if (response.data.code === 200) {
            return response.data.data;
        }
        throw new Error('Failed to join survivor');
    }

    async leaveSurvivor(survivorUuid: string): Promise<void> {
        const response = await this.api.delete<ApiResponse<void>>(`survivor/leave/${survivorUuid}`);
        if (response.data.code === 200) {
            return;
        }
        throw new Error('Failed to leave survivor');
    }

    async deleteSurvivor(survivorUuid: string): Promise<void> {
        const response = await this.api.delete<ApiResponse<void>>(`survivor/destroy/${survivorUuid}`);
        if (response.data.code === 200) {
            return;
        }
        throw new Error('Failed to delete survivor');
    }

    // ── Reglas ──────────────────────────────────────────────────────────────

    async getSettings(survivorUuid: string): Promise<SurvivorSettingsResponse> {
        const response = await this.api.get<ApiResponse<SurvivorSettingsResponse>>(`survivor/settings/${survivorUuid}`);
        if (response.data.code === 200) {
            return response.data.data;
        }
        throw new Error('Failed to fetch survivor settings');
    }

    async updateSettings(survivorUuid: string, payload: SurvivorSettingsPayload): Promise<SurvivorSettingsResponse> {
        const response = await this.api.put<ApiResponse<SurvivorSettingsResponse>>(`survivor/settings/${survivorUuid}`, payload);
        if (response.data.code === 200) {
            return response.data.data;
        }
        throw new Error('Failed to update survivor settings');
    }

    async resetSettings(survivorUuid: string): Promise<SurvivorSettingsResponse> {
        const response = await this.api.delete<ApiResponse<SurvivorSettingsResponse>>(`survivor/settings/${survivorUuid}`);
        if (response.data.code === 200) {
            return response.data.data;
        }
        throw new Error('Failed to reset survivor settings');
    }
}

export const survivorService = new SurvivorService();
export default survivorService;