import { useApiFantasy } from "@/composables/useApiFantasy";
import { ApiResponse } from "@/interfaces/api/ApiResponse";
import { TeamNotificationEventResponse } from "@/interfaces/user/notification/TeamNotificationEventResponse";
import { AxiosError } from "axios";

export class TeamNotificationService {
    private readonly api;

    constructor() {
        const { apiFantasyInstance } = useApiFantasy();
        this.api = apiFantasyInstance;
    }

    // List the match-event notifications configurable for one favorite team.
    async getEventByTeamUuid(teamUuid: string): Promise<TeamNotificationEventResponse[]> {
        const response = await this.api.get<ApiResponse<TeamNotificationEventResponse[]>>(
            `user/favorite/teams/${teamUuid}/notification/events`,
        );
        if (response.data.code === 200) {
            return response.data.data;
        }
        throw new AxiosError('Failed to fetch team notification events');
    }

    // Persist the full set of enabled events. The backend replaces the previous
    // selection with `enabledEvents`, so callers send the complete list of the
    // events (their `event` codes) that should stay on — not just the delta.
    async updateEventsByTeamUuid(
        teamUuid: string,
        enabledEvents: string[],
    ): Promise<TeamNotificationEventResponse[]> {
        const response = await this.api.put<ApiResponse<TeamNotificationEventResponse[]>>(
            `user/favorite/teams/${teamUuid}/notification/events`,
            { enabled_events: enabledEvents },
        );
        if (response.data.code === 200) {
            return response.data.data;
        }
        throw new AxiosError('Failed to update team notification events');
    }
}

export const teamNotificationService = new TeamNotificationService();
export default teamNotificationService;
