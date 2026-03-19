export interface LoginPayload {
    email: string;
    password: string;
}

export interface RegisterPayload {
    name: string;
    email: string;
    password: string;
    phone?: string;
    role?: "USER" | "MERCHANT";
}

export interface RegisterCourierPayload {
    name: string;
    email: string;
    password: string;
    phone?: string;
    vehicleType: "BIKE" | "BICYCLE" | "CAR" | "VAN" | "TRUCK";
    licenseNumber: string;
}

export interface ChangePasswordPayload {
    oldPassword: string;
    newPassword: string;
}

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}

export interface LoginResponse {
    accessToken: string;
    refreshToken: string;
    user: {
        id: string;
        name: string;
        email: string;
        role: string;
        status: string;
    };
}
