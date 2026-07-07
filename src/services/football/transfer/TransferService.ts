import { useApiFantasy } from "@/composables/useApiFantasy";
import { ApiResponse } from "@/interfaces/api/ApiResponse";
import { TransferResponse } from "@/interfaces/football/transfer/TransferResponse";


export class TransferService {
    private api;

    constructor() {
        const { apiFantasyInstance } = useApiFantasy();
        this.api = apiFantasyInstance;
    }


    async getTransfersByLeagueUuid(leagueUuid: string): Promise<TransferResponse[]> {
        const response = await this.api.get<ApiResponse<TransferResponse[]>>(`/football/transfers/by/league/${leagueUuid}`);
        if (response.data.code === 200) {
            return response.data.data;
        }
        throw new Error('Failed to fetch transfers by league');
    }

    async getTransfersByTeamUuid(teamUuid: string): Promise<TransferResponse[]> {
        const response = await this.api.get<ApiResponse<TransferResponse[]>>(`/football/transfers/by/team/${teamUuid}`);
        if (response.data.code === 200) {
            return response.data.data;
        }
        throw new Error('Failed to fetch transfers by team');
    }
}

export const transferService = new TransferService();
export default transferService;