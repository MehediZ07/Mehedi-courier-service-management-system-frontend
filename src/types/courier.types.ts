import { User } from "./user.types";

export type VehicleType = "BIKE" | "BICYCLE" | "CAR" | "VAN" | "TRUCK";
export type ApprovalStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface Courier {
    id: string;
    userId: string;
    vehicleType: VehicleType;
    licenseNumber: string;
    city?: string;
    availability: boolean;
    approvalStatus: ApprovalStatus;
    totalEarnings: number;
    pendingCOD: number;
    createdAt: string;
    updatedAt: string;
    user: User;
}

export interface UpdateCourierPayload {
    vehicleType?: VehicleType;
    licenseNumber?: string;
    city?: string;
    availability?: boolean;
}

export interface ApproveCourierPayload {
    approvalStatus: "APPROVED" | "REJECTED";
}
