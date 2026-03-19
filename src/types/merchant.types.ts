import { User } from "./user.types";

export interface Merchant {
    id: string;
    userId: string;
    companyName: string;
    address: string;
    createdAt: string;
    updatedAt: string;
    user?: User;
}

export interface CreateMerchantPayload {
    userId: string;
    companyName: string;
    address: string;
}

export interface UpdateMerchantPayload {
    companyName?: string;
    address?: string;
}
