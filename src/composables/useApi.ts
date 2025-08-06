import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { ref, computed } from 'vue'
import { useToast } from '@/composables/useToast'

// Types for better TypeScript support
export interface ApiOptions {
  authorization?: string
  additionalHeaders?: Record<string, string>
  showSuccessToast?: boolean
  showErrorToast?: boolean
  successMessage?: string
  successTitle?: string
}

export interface ApiResponse<T = unknown> {
  data: T
  status: number
  statusText: string
  headers: Record<string, unknown>
}

export interface ApiError {
  message: string
  status?: number
  statusText?: string
  response?: {
    message?: string
    errors?: Record<string, string[]>
    [key: string]: unknown
  }
}


export const useApi = () => {
  // Reactive state
  const loading = ref(false)
  const error = ref<ApiError | null>(null)
  
  // Toast composable
  const toast = useToast()

  // Get API base URL from environment variables
  const baseURL = computed(() => {
    const url = import.meta.env.VITE_API_URL
    if (!url) {
      console.warn('VITE_API_URL not found in environment variables')
      return 'https://api.fantasymx.test/api/'
    }
    return url
  })

  // Get current timezone dynamically
  const getTimezone = (): string => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone
    } catch (err) {
      console.warn('Could not get timezone, using UTC as fallback')
      return 'UTC'
    }
  }

  // Create axios instance
  const createAxiosInstance = (options: ApiOptions = {}): AxiosInstance => {
    const instance = axios.create({
      baseURL: baseURL.value,
      timeout: 30000, // 30 seconds timeout
    })

    // Request interceptor to add headers
    instance.interceptors.request.use(
      (config) => {
        // Set default headers
        config.headers = config.headers || {}
        config.headers['Accept'] = 'application/json'
        config.headers['TimeZone'] = getTimezone()

        // Add authorization header if provided
        if (options.authorization) {
          config.headers['Authorization'] = options.authorization
        }

        // Add any additional headers
        if (options.additionalHeaders) {
          Object.assign(config.headers, options.additionalHeaders)
        }

        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // Response interceptor for error handling
    instance.interceptors.response.use(
      (response) => {
        return response
      },
      (error) => {
        const apiError: ApiError = {
          message: error.message || 'An error occurred',
          status: error.response?.status,
          statusText: error.response?.statusText,
          response: error.response?.data,
        }

        // Handle common HTTP errors and show toasts
        if (error.response) {
          apiError.response = error.response.data
          console.log('API Error Response:', error.response.status)
          
          let errorTitle = 'Error'
          let errorMessage = 'An unexpected error occurred'
          
          switch (error.response.status) {
            case 401: {
              errorTitle = 'Authentication Failed'
              errorMessage = error.response.data?.message || 'Authentication error. Please verify your credentials.'
              break
            }
            case 422: {
              errorTitle = 'Validation Error'
              errorMessage = error.response.data?.message || 'Validation error. Please check your data.'
              break
            }
            case 400:
              errorTitle = 'Bad Request'
              errorMessage = error.response.data?.message || 'Bad Request - Invalid data sent'
              break
            case 403:
              errorTitle = 'Forbidden'
              errorMessage = error.response.data?.message || 'Forbidden - Access denied'
              break
            case 404:
              errorTitle = 'Not Found'
              errorMessage = error.response.data?.message || 'Not Found - Resource not found'
              break
            case 500:
              errorTitle = 'Server Error'
              errorMessage = error.response.data?.message || 'Server Error - Please try again later'
              break
            default:
              errorMessage = error.response.data?.message || error.message || 'An unexpected error occurred'
          }
          
          apiError.message = errorMessage
          
          // Show error toast if not disabled
          if (options.showErrorToast !== false) {
            console.log('useApi: Calling toast.error with:', { title: errorTitle, message: errorMessage })
            toast.error(errorTitle, errorMessage)
          }
          
        } else if (error.request) {
          apiError.message = 'Network Error - Please check your connection'
          
          // Show network error toast if not disabled
          if (options.showErrorToast !== false) {
            console.log('useApi: Calling toast.error for network error')
            toast.error('Connection Error', 'Please check your internet connection and try again.')
          }
        }

        return Promise.reject(apiError)
      }
    )

    return instance
  }

  // Generic request function
  const request = async <T = unknown>(
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    endpoint: string,
    data?: Record<string, unknown> | unknown[],
    options: ApiOptions = {},
    config: AxiosRequestConfig = {}
  ): Promise<ApiResponse<T>> => {
    try {
      loading.value = true
      error.value = null

      const axiosInstance = createAxiosInstance(options)
      
      const requestConfig: AxiosRequestConfig = {
        method,
        url: endpoint,
        ...config,
      }

      // Add data based on method
      if (['POST', 'PUT', 'PATCH'].includes(method) && data) {
        requestConfig.data = data
      } else if (method === 'GET' && data) {
        requestConfig.params = data
      }

      const response: AxiosResponse<T> = await axiosInstance.request(requestConfig)

      // Show success toast if enabled
      if (options.showSuccessToast) {
        const successTitle = options.successTitle || 'Success'
        const successMessage = options.successMessage || 'Operation completed successfully'
        console.log('useApi: Calling toast.success with:', { title: successTitle, message: successMessage })
        toast.success(successTitle, successMessage)
      }

      return {
        data: response.data,
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
      }
    } catch (err) {
      const apiError = err as ApiError
      error.value = apiError
      throw apiError
    } finally {
      loading.value = false
    }
  }

  // HTTP method shortcuts
  const get = <T = unknown>(
    endpoint: string,
    params?: Record<string, unknown>,
    options: ApiOptions = {},
    config: AxiosRequestConfig = {}
  ) => {
    return request<T>('GET', endpoint, params, options, config)
  }

  const post = <T = unknown>(
    endpoint: string,
    data?: Record<string, unknown> | unknown[],
    options: ApiOptions = {},
    config: AxiosRequestConfig = {}
  ) => {
    return request<T>('POST', endpoint, data, options, config)
  }

  const put = <T = unknown>(
    endpoint: string,
    data?: Record<string, unknown> | unknown[],
    options: ApiOptions = {},
    config: AxiosRequestConfig = {}
  ) => {
    return request<T>('PUT', endpoint, data, options, config)
  }

  const patch = <T = unknown>(
    endpoint: string,
    data?: Record<string, unknown> | unknown[],
    options: ApiOptions = {},
    config: AxiosRequestConfig = {}
  ) => {
    return request<T>('PATCH', endpoint, data, options, config)
  }

  const del = <T = unknown>(
    endpoint: string,
    params?: Record<string, unknown>,
    options: ApiOptions = {},
    config: AxiosRequestConfig = {}
  ) => {
    return request<T>('DELETE', endpoint, params, options, config)
  }

  // Utility functions
  const setAuthToken = (token: string): string => {
    return `Bearer ${token}`
  }

  const clearError = () => {
    error.value = null
  }

  return {
    // State
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    
    // Methods
    request,
    get,
    post,
    put,
    patch,
    delete: del,
    
    // Utilities
    setAuthToken,
    clearError,
    getTimezone,
  }
}

export default useApi
