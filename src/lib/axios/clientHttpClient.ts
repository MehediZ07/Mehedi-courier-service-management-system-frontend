import { ApiResponse } from '@/types/api.types';
import axios, { AxiosInstance } from 'axios';

const getApiBaseUrl = () => {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!API_BASE_URL) {
        throw new Error('NEXT_PUBLIC_API_BASE_URL is not defined in environment variables');
    }
    return API_BASE_URL;
};

// Create axios instance for client-side requests
const createClientInstance = (): AxiosInstance => {
    const instance = axios.create({
        baseURL: getApiBaseUrl(),
        timeout: 30000,
        headers: {
            'Content-Type': 'application/json',
        },
    });

    // Request interceptor to add Authorization header from cookies
    instance.interceptors.request.use(
        (config) => {
            // Get token from cookie
            const cookies = document.cookie.split('; ');
            const accessTokenCookie = cookies.find(row => row.startsWith('accessToken='));
            const accessToken = accessTokenCookie?.split('=')[1];
            
            if (accessToken) {
                config.headers.Authorization = `Bearer ${accessToken}`;
            }
            
            return config;
        },
        (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    instance.interceptors.response.use(
        (response) => response,
        (error) => {
            if (error.response?.status === 401) {
                const url = error.config?.url ?? '';
                // Don't redirect for silent auth checks (e.g. Navbar)
                if (typeof window !== 'undefined' && !url.includes('/auth/me')) {
                    window.location.href = '/login';
                }
            }
            return Promise.reject(error);
        }
    );

    return instance;
};

const clientInstance = createClientInstance();

export interface ApiRequestOptions {
    params?: Record<string, unknown>;
    headers?: Record<string, string>;
}

const httpGet = async <TData>(endpoint: string, options?: ApiRequestOptions): Promise<TData> => {
    try {
        const response = await clientInstance.get(endpoint, {
            params: options?.params,
            headers: options?.headers,
        });
        return response.data;
    } catch (error: unknown) {
        const isAuthMeError = error && typeof error === 'object' && 'response' in error && 
            (error as { response?: { status?: number } }).response?.status === 401 && 
            endpoint.includes('/auth/me');
        
        if (!isAuthMeError) {
            console.error(`GET request to ${endpoint} failed:`, error);
        }
        throw error;
    }
};

const httpPost = async <TData>(endpoint: string, data: unknown, options?: ApiRequestOptions): Promise<ApiResponse<TData>> => {
    try {
        const response = await clientInstance.post<ApiResponse<TData>>(endpoint, data, {
            params: options?.params,
            headers: options?.headers,
        });
        return response.data;
    } catch (error) {
        console.error(`POST request to ${endpoint} failed:`, error);
        throw error;
    }
};

const httpPut = async <TData>(endpoint: string, data: unknown, options?: ApiRequestOptions): Promise<ApiResponse<TData>> => {
    try {
        const response = await clientInstance.put<ApiResponse<TData>>(endpoint, data, {
            params: options?.params,
            headers: options?.headers,
        });
        return response.data;
    } catch (error) {
        console.error(`PUT request to ${endpoint} failed:`, error);
        throw error;
    }
};

const httpPatch = async <TData>(endpoint: string, data: unknown, options?: ApiRequestOptions): Promise<ApiResponse<TData>> => {
    try {
        const response = await clientInstance.patch<ApiResponse<TData>>(endpoint, data, {
            params: options?.params,
            headers: options?.headers,
        });
        return response.data;
    } catch (error) {
        console.error(`PATCH request to ${endpoint} failed:`, error);
        throw error;
    }
};

const httpDelete = async <TData>(endpoint: string, options?: ApiRequestOptions): Promise<ApiResponse<TData>> => {
    try {
        const response = await clientInstance.delete<ApiResponse<TData>>(endpoint, {
            params: options?.params,
            headers: options?.headers,
        });
        return response.data;
    } catch (error) {
        console.error(`DELETE request to ${endpoint} failed:`, error);
        throw error;
    }
};

export const clientHttpClient = {
    get: httpGet,
    post: httpPost,
    put: httpPut,
    patch: httpPatch,
    delete: httpDelete,
};
