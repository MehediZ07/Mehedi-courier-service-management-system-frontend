import { Courier } from "./courier.types";
import { Hub } from "./hub.types";
import { Shipment } from "./shipment.types";

export type LegType = "DIRECT" | "PICKUP" | "HUB_TRANSFER" | "DELIVERY";
export type LegStatus = "PENDING" | "ASSIGNED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
export type LocationType = "ADDRESS" | "HUB";
export type DeliveryType = "LEGACY_DIRECT" | "DIRECT" | "HUB_BASED";

export interface ShipmentLeg {
    id: string;
    shipmentId: string;
    legNumber: number;
    legType: LegType;
    
    // Origin
    originType: LocationType;
    originAddress?: string;
    originHubId?: string;
    
    // Destination
    destType: LocationType;
    destAddress?: string;
    destHubId?: string;
    
    // Courier assignment
    courierId?: string;
    status: LegStatus;
    
    // Timestamps
    assignedAt?: string;
    pickedUpAt?: string;
    deliveredAt?: string;
    estimatedAt?: string;
    note?: string;
    
    // Earnings and COD
    courierEarning?: number;
    codCollected?: boolean;
    codAmount?: number;
    
    createdAt: string;
    updatedAt: string;
    
    // Relations
    shipment?: Shipment;
    courier?: Courier;
    originHub?: Hub;
    destHub?: Hub;
}

export interface UpdateLegStatusPayload {
    note?: string;
    proofOfDelivery?: string;
}
