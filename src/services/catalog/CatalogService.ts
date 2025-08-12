import { useApiFantasy } from "@/composables/useApiFantasy";
import { ApiResponse } from "@/interfaces/api/ApiResponse";
import { FantasyLeaguesResponse } from "@/interfaces/fantasy/leagues/FantasyLeaguesResponse";
import { FantasyLeagueSearchPayload } from "@/interfaces/fantasy/leagues/FantasyLeagueSearchPayload";
import { FootballTeamResponse } from "@/interfaces/football/team/FootballTeamResponse";
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

  async getFantasyLeaguesSearch(payload: FantasyLeagueSearchPayload): Promise<FantasyLeaguesResponse[]> {

    const response = await this.api.post<ApiResponse<FantasyLeaguesResponse[]>>(`/fantasy/leagues/search/${payload.search}`, payload);
    if (response.data.code === 200) {
      return response.data.data;
    }
    throw new AxiosError('Failed to search fantasy leagues');
  }
}

export const catalogService = new CatalogService();
export default catalogService;