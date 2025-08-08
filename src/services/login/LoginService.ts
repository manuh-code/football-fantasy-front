import { useApiFantasy } from '@/composables/useApiFantasy'
import { ApiResponse } from '@/interfaces/api/ApiResponse'
import { LoginPayload } from '@/interfaces/login/LoginPayload'
import { LoginResponse } from '@/interfaces/login/LoginResponse'
import { useUserStore } from '@/store/user'
import { AxiosError } from 'axios'

export interface LoginResult {
  success: boolean
  message: string
  title?: string
  token?: string
}

export class LoginService {

  private api;
  private userStore = useUserStore();

  constructor() {
    const { apiFantasyInstance } = useApiFantasy();
    this.api = apiFantasyInstance;
  }

  /**
   * Main login method that handles authentication
   * @param payload - Login credentials and options
   * @returns LoginResult with success status and messages
   */
  async login(payload: LoginPayload): Promise<ApiResponse<LoginResponse>> {

    // Call the auth endpoint with success toast enabled
    const response = await this.api.post<ApiResponse<LoginResponse>>('auth', payload);

    // Process successful response
    if (response.data && response.data.data && response.data.data.token) {
      // Save token to store
      this.userStore.setToken(response.data.data.token)

      return response.data;
    }

    throw new AxiosError('Login failed: Invalid response format');
  }
}

// Export singleton instance
export const loginService = new LoginService()

// Export default
export default loginService
