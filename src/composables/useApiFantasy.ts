import axios, { AxiosInstance } from 'axios'
import { useToast } from '@/composables/useToast'
import { useAuthStore } from '@/store/auth/useAuthStore'
import { useValidationStore } from '@/store/validation/useValidationStore'
import { useLocaleStore } from '@/store/locale'
import { t } from '@/i18n'
import router from '@/router'


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
    // IMPORTANT: Do NOT use optional chaining (import.meta?.env?) — it breaks Vite's
    // static replacement of env variables during production builds.
    const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8084/api/'

    // Get current timezone dynamically
    const getTimezone = (): string => {
        try {
            return Intl.DateTimeFormat().resolvedOptions().timeZone
        } catch {
            return 'UTC'
        }
    }

    // Create axios instance
    const apiFantasyInstance: AxiosInstance = axios.create({

        baseURL: baseURL,
        timeout: 30000, // 30 seconds timeout
        withCredentials: true, // Enable cookies for cross-origin requests

        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'TimeZone': getTimezone(),
        }
    });


    // Add a request interceptor to include the token and current locale in the headers
    apiFantasyInstance.interceptors.request.use((config) => {
        try {
            const authStore = useAuthStore();
            const token = authStore.getToken();
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            } else {
                delete config.headers.Authorization;
            }
        } catch {
            // If there's an error parsing the auth data, just continue without token
            delete config.headers.Authorization;
        }

        // Send the user's selected language so the API can return localized messages
        try {
            const localeStore = useLocaleStore();
            config.headers['Accept-Language'] = localeStore.locale;
        } catch {
            config.headers['Accept-Language'] = 'es';
        }
        return config;
    });

    // Response interceptor for error handling
    apiFantasyInstance.interceptors.response.use(
        (response) => {
            return response;
        },
        (error) => {
            const authStore = useAuthStore();

            // Check if this request was marked as silent (skip toast)
            const isSilent = error.config?._silent === true
            
            const apiError: ApiError = {
                message: error.message || 'An error occurred',
                status: error.response?.status,
                statusText: error.response?.statusText,
                response: error.response?.data,
            }

            // Handle common HTTP errors and show toasts
            if (error.response) {
                apiError.response = error.response.data

                let errorTitle = t('errors.generic.title')
                let errorMessage = t('errors.generic.message')

                switch (error.response.status) {
                    case 401: {
                        errorTitle = t('errors.401.title')
                        errorMessage = error.response.data?.message || t('errors.401.message')
                        authStore.clearAuth();
                        // Requests can opt out of the global login redirect (e.g. the
                        // token-validation call in the router guard, which decides
                        // routing itself so public pages aren't yanked to login).
                        if (error.config?._skipAuthRedirect !== true) {
                            router.push({ name: 'login' });
                        }
                        break
                    }
                    case 422: {
                        // Handle validation errors - store them in validation store
                        const validationStore = useValidationStore();
                        if (error.response.data?.errors) {
                            validationStore.setValidatorError(error.response.data.errors);
                        }
                        errorTitle = t('errors.422.title')
                        errorMessage = error.response.data?.message || t('errors.422.message')
                        break
                    }
                    case 400:
                        errorTitle = t('errors.400.title')
                        errorMessage = error.response.data?.message || t('errors.400.message')
                        break
                    case 403:
                        errorTitle = t('errors.403.title')
                        errorMessage = error.response.data?.message || t('errors.403.message')
                        break
                    case 404:
                        errorTitle = t('errors.404.title')
                        errorMessage = error.response.data?.message || t('errors.404.message')
                        break
                    case 500:
                        errorTitle = t('errors.500.title')
                        errorMessage = error.response.data?.message || t('errors.500.message')
                        break
                    default:
                        errorMessage = error.response.data?.message || error.message || t('errors.generic.message')
                }
                if (!isSilent) {
                    toast.error(errorTitle, errorMessage)
                }
            } else if (error.request && !isSilent) {
                toast.error(t('errors.connection.title'), t('errors.connection.message'))
            }
            return Promise.reject(apiError)
        }
    );


    return { apiFantasyInstance }
}