export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface PaginatedResponse<T> {
    data: T[];
    meta: PaginationMeta;
}

// For paginated API responses where data and meta are at root level
export interface PaginatedApiResponse<T> {
    success: boolean;
    message: string;
    data: T[];
    meta: PaginationMeta;
}

export interface ApiError {
    success: false;
    message: string;
    errorSources?: { path: string; message: string }[];
}

// Legacy alias kept for compatibility
export type ApiErrorResponse = ApiError;
