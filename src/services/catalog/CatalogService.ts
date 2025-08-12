import { useApiFantasy } from "@/composables/useApiFantasy";
import { ApiResponse } from "@/interfaces/api/ApiResponse";
import { FootballTeamResponse } from "@/interfaces/Football/team/FootballTeamResponse";
import { AxiosError } from "axios";

export class CatalogService {
  private api;

  constructor() {
    const { apiFantasyInstance } = useApiFantasy();
    this.api = apiFantasyInstance;
  }

  async getFootballTeams(): Promise<FootballTeamResponse[]> {
    const response = await this.api.get<ApiResponse<FootballTeamResponse[]>>('catalog/teams');

    if (response.data.code === 200) {
      return response.data.data;
    }
    
    throw new AxiosError('Failed to update avatar');
  }
}


export const catalogService = new CatalogService();
export default catalogService;