import { useApiFantasy } from "@/composables/useApiFantasy";
import { ApiResponse } from "@/interfaces/api/ApiResponse";
import { FantasyLeaguesResponse } from "@/interfaces/fantasy/leagues/FantasyLeaguesResponse";
import { FantasyLeagueSearchPayload } from "@/interfaces/fantasy/leagues/FantasyLeagueSearchPayload";
import { FootballTeamResponse } from "@/interfaces/football/team/FootballTeamResponse";
import { AxiosError } from "axios";
import { FootballLeagueResponse } from "@/interfaces/football/league/FootballLeagueResponse";
import { FootballSeasonResponse } from "@/interfaces/football/season/FootballSeasonResponse";
import { TypeResponse } from "@/interfaces/football/type/TypeResponse";

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

  async getFootballLeagues(): Promise<FootballLeagueResponse[]> {
    const response = await this.api.get<ApiResponse<FootballLeagueResponse[]>>('catalog/leagues');

    if (response.data.code === 200) {
      return response.data.data;
    }

    throw new AxiosError('Failed to fetch football leagues');
  }

  async getFantasyLeaguesAll(payload: FantasyLeagueSearchPayload): Promise<FantasyLeaguesResponse[]> {
    const response = await this.api.post<ApiResponse<FantasyLeaguesResponse[]>>('/fantasy/leagues/all', payload);
    if (response.data.code === 200) {
      return response.data.data;
    }
    throw new AxiosError('Failed to search fantasy leagues');
  }

  async getSeasonByFantasyLeagueUuid(fantasyLeagueUuid: string): Promise<FootballSeasonResponse[]> {
    const response = await this.api.get<ApiResponse<FootballSeasonResponse[]>>(`catalog/season/by/fantasyLeague/${fantasyLeagueUuid}`);

    if (response.data.code === 200) {
      return response.data.data;
    }

    throw new AxiosError('Failed to fetch football seasons');
  }

  async getTeamsBySeasonUuid(footballSeasonUuid: string): Promise<FootballTeamResponse[]> {
    const response = await this.api.get<ApiResponse<FootballTeamResponse[]>>(`catalog/teams/by/season/${footballSeasonUuid}`);
    if (response.data.code === 200) {
      return response.data.data;
    }

    throw new AxiosError('Failed to fetch football teams');
  }

  async getTypeStatistic(): Promise<TypeResponse[]> {
    const response = await this.api.get<ApiResponse<TypeResponse[]>>('catalog/types/statistics');
    if (response.data.code === 200) {
      return response.data.data;
    }

    throw new AxiosError('Failed to fetch type statistics');
  }

  async getTypeTopScore(): Promise<TypeResponse[]> {  
    const response = await this.api.get<ApiResponse<TypeResponse[]>>('catalog/types/topScore');
    if (response.data.code === 200) {
      return response.data.data;
    }

    throw new AxiosError('Failed to fetch type top scores');
  }
}

export const catalogService = new CatalogService();
export default catalogService;