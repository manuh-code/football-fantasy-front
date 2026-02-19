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
  private lastValidatedToken: string | null = null;
  private lastValidationResult = false;
  private lastValidationTime = 0;
  private static readonly VALIDATION_CACHE_MS = 5 * 60 * 1000; // 5 minutes

  constructor() {
    // Lazy initialization to ensure import.meta.env is available
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

  async fetchGoogleLoginUrl(): Promise<string> {
    const response = await this.api.get<ApiResponse<{ url: string }>>('auth/google');
    if (response.data.code === 200) {
      return response.data.data.url;
    }
    throw new AxiosError('Failed to get Google auth URL');
  }

  async loginWithGoogle(queryParams: string): Promise<LoginResponse> {
    const response = await this.api.get<ApiResponse<LoginResponse>>('auth/google/callback' + queryParams);
    if (response.data.code === 200) {
      return response.data.data;
    }
    throw new AxiosError('Google login failed');
  }

  async logout(): Promise<ApiResponse<null>> {
    const response = await this.api.post<ApiResponse<null>>('auth/logout');
    return response.data;
  }

  async isAuthenticated(token: string | null): Promise<boolean> {
    if (!token) {
      this.lastValidatedToken = null;
      this.lastValidationResult = false;
      return false;
    }

    // Return cached result if same token and within cache window
    const now = Date.now();
    if (
      token === this.lastValidatedToken &&
      this.lastValidationResult &&
      now - this.lastValidationTime < LoginService.VALIDATION_CACHE_MS
    ) {
      return true;
    }

    try {
      const response = await this.api.get<ApiResponse<null>>('auth/validate', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const isValid = response.data.code === 200;
      this.lastValidatedToken = token;
      this.lastValidationResult = isValid;
      this.lastValidationTime = now;
      return isValid;
    } catch {
      // If token exists but API call fails (network error, timeout),
      // assume authenticated to avoid blocking navigation.
      // Actual API calls will handle 401 if token is truly expired.
      if (this.lastValidatedToken === token && this.lastValidationResult) {
        return true;
      }
      return !!token;
    }
  }
}

// Export factory function instead of singleton to avoid early initialization
let loginServiceInstance: LoginService | null = null;

export const getLoginService = (): LoginService => {
  if (!loginServiceInstance) {
    loginServiceInstance = new LoginService();
  }
  return loginServiceInstance;
}

// Export default using factory
export default getLoginService()
