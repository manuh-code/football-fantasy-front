import axios, { AxiosInstance } from 'axios'
import { computed } from 'vue'
import { useToast } from '@/composables/useToast'
import { useAuthStore } from '@/store/auth/useAuthStore'
import { useValidationStore } from '@/store/validation/useValidationStore'


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


export function useApiFantasy() {
    const toast = useToast();

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
    const apiFantasyInstance: AxiosInstance = axios.create({

        baseURL: baseURL.value,
        timeout: 30000, // 30 seconds timeout
        withCredentials: true, // Enable cookies for cross-origin requests

        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'TimeZone': getTimezone(),
        }
    });


    // Add a request interceptor to include the token in the headers
    apiFantasyInstance.interceptors.request.use((config) => {
        try {   
            const authStore = useAuthStore();
            const token = authStore.getToken();
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            } else {
                delete config.headers.Authorization;
            }
        } catch (error) {
            // If there's an error parsing the auth data, just continue without token
            delete config.headers.Authorization;
        }
        return config;
    });

    // Response interceptor for error handling
    apiFantasyInstance.interceptors.response.use(
        (response) => {
            return response;
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
                        // Handle validation errors - store them in validation store
                        const validationStore = useValidationStore();
                        if (error.response.data?.errors) {
                            validationStore.setValidatorError(error.response.data.errors);
                        }
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
                toast.error(errorTitle, errorMessage)
            } else if (error.request) {
                toast.error('Connection Error', 'Please check your internet connection and try again.')
            }
            return Promise.reject(apiError)
        }
    );


    return { apiFantasyInstance }
}