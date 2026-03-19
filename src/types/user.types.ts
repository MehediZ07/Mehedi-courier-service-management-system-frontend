export type UserRole = "SUPER_ADMIN" | "ADMIN" | "COURIER" | "MERCHANT" | "USER";
export type UserStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED";

export interface User {
    id: string;
    name: string;
    email: string;
    phone?: string;
    profileImage?: string;
    role: UserRole;
    status: UserStatus;
    createdAt: string;
    updatedAt: string;
}

// Legacy alias used by existing dashboard components
export type UserInfo = User;

export interface UpdateUserPayload {
    name?: string;
    phone?: string;
    profileImage?: string;
}

export interface UpdateUserStatusPayload {
    status: UserStatus;
}

export interface UpdateUserRolePayload {
    role: UserRole;
}
