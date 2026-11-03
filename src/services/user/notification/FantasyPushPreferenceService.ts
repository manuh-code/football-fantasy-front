import { useApiFantasy } from "@/composables/useApiFantasy";
import { ApiResponse } from "@/interfaces/api/ApiResponse";
import { FantasyPushPreferenceResponse } from "@/interfaces/user/notification/FantasyPushPreferenceResponse";
import { AxiosError } from "axios";

export class FantasyPushPreferenceService {
    private readonly api;

    constructor() {
        const { apiFantasyInstance } = useApiFantasy();
        this.api = apiFantasyInstance;
    }

    // List the fantasy push notifications the user can turn on or off.
    async getPreferences(): Promise<FantasyPushPreferenceResponse[]> {
        const response = await this.api.get<ApiResponse<FantasyPushPreferenceResponse[]>>(
            "user/notification/fantasy",
        );
        if (response.data.code === 200) {
            return response.data.data;
        }
        throw new AxiosError("Failed to fetch fantasy push preferences");
    }

    // Change one notification. Unlike the per-team events endpoint, this PUT is
    // PARTIAL: the backend only touches the types present in the body, so sending
    // `{ sidelined: false }` leaves the other two exactly as they were.
    async setPreference(type: string, enabled: boolean): Promise<FantasyPushPreferenceResponse[]> {
        const response = await this.api.put<ApiResponse<FantasyPushPreferenceResponse[]>>(
            "user/notification/fantasy",
            { [type]: enabled },
        );
        if (response.data.code === 200) {
            return response.data.data;
        }
        throw new AxiosError("Failed to update fantasy push preferences");
    }
}

export const fantasyPushPreferenceService = new FantasyPushPreferenceService();
export default fantasyPushPreferenceService;
