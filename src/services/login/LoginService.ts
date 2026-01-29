import { useApiFantasy } from '@/composables/useApiFantasy'
import { ApiResponse } from '@/interfaces/api/ApiResponse'
import { LoginPayload } from '@/interfaces/login/LoginPayload'
import { LoginResponse } from '@/interfaces/login/LoginResponse'
import { AxiosError } from 'axios'

export interface LoginResult {
  success: boolean
  message: string
  title?: string
  token?: string
}

export class LoginService {

  private api;

  constructor() {
    const { apiFantasyInstance } = useApiFantasy();
    this.api = apiFantasyInstance;
  }

  /**
   * Main login method that handles authentication
   * @param payload - Login credentials and options
   * @returns LoginResult with success status and messages
   */
  async login(payload: LoginPayload): Promise<LoginResponse> {

    const response = await this.api.post<ApiResponse<LoginResponse>>('auth', payload);
    // Process successful response
    if (response.data.code === 200) {
      return response.data.data;
    }

    throw new AxiosError('Login failed: Invalid response format');
  }

  async logout(): Promise<ApiResponse<null>> {
    const response = await this.api.post<ApiResponse<null>>('auth/logout');
    return response.data;
  }

  async isAuthenticated(token: string | null): Promise<boolean> {
    if (!token) {
      return false;
    }
    const response = await this.api.get<ApiResponse<null>>('auth/validate', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data.code === 200;
  }
}

// Export singleton instance
export const loginService = new LoginService()

// Export default
export default loginService
