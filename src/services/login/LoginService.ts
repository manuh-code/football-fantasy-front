import { useApi } from '@/composables/useApi'
import { useUserStore } from '@/store/user'

// Types for login service
export interface LoginPayload {
  email: string
  password: string
  device_name?: string
  remember?: boolean
}

export interface LoginResponse {
  timestamp: string
  code: number
  message: string
  data: {
    token: string
  }
}

export interface LoginResult {
  success: boolean
  message: string
  title?: string
  token?: string
}

export class LoginService {
  private api = useApi()
  private userStore = useUserStore()

  /**
   * Main login method that handles authentication
   * @param payload - Login credentials and options
   * @returns LoginResult with success status and messages
   */
  async login(payload: LoginPayload): Promise<LoginResult> {
    try {
      // Prepare the payload with defaults
      const loginPayload = {
        email: payload.email,
        password: payload.password,
        device_name: payload.device_name || 'web',
        remember: payload.remember || false
      }

      // Call the auth endpoint with success toast enabled
      const response = await this.api.post<LoginResponse>('auth', loginPayload, {
        showSuccessToast: true,
        successTitle: 'Welcome back!',
        successMessage: 'You have been successfully logged in.'
      })

      // Process successful response
      if (response.data && response.data.data && response.data.data.token) {
        // Save token to store
        this.userStore.setToken(response.data.data.token)
        
        console.log('LoginService: Login successful, token saved')

        return {
          success: true,
          title: 'Welcome back!',
          message: 'You have been successfully logged in.',
          token: response.data.data.token
        }
      } else {
        console.error('LoginService: Invalid response structure:', response)
        return {
          success: false,
          title: 'Login Error',
          message: 'Invalid response from server'
        }
      }

    } catch (error: unknown) {
      console.error('LoginService: Login error caught:', error)
      // useApi already handled the error toast, just return basic error info
      return {
        success: false,
        title: 'Login Failed',
        message: 'Please try again'
      }
    }
  }

  /**
   * Logout method to clear user session
   */
  logout(): void {
    this.userStore.clearAuth()
    console.log('LoginService: User logged out successfully')
  }

  /**
   * Check if user is currently authenticated
   */
  isAuthenticated(): boolean {
    return this.userStore.isAuthenticated
  }

  /**
   * Get current auth token
   */
  getToken(): string | null {
    return this.userStore.token
  }

  /**
   * Load token from storage (useful for app initialization)
   */
  loadStoredToken(): void {
    this.userStore.loadTokenFromStorage()
  }
}

// Export singleton instance
export const loginService = new LoginService()

// Export default
export default loginService
