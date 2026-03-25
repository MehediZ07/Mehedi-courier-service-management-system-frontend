export type HubType = "LOCAL" | "REGIONAL" | "INTERNATIONAL";

export interface Hub {
    id: string;
    name: string;
    city: string;
    address: string;
    hubType: HubType;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateHubPayload {
    name: string;
    city: string;
    address: string;
    hubType: HubType;
}

export interface UpdateHubPayload {
    name?: string;
    city?: string;
    address?: string;
    hubType?: HubType;
    isActive?: boolean;
}
