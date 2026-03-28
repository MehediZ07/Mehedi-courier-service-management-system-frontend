import { Courier } from "./courier.types";
import { User } from "./user.types";
import { DeliveryType, ShipmentLeg } from "./shipmentLeg.types";

export type RegionType = "LOCAL" | "NATIONAL" | "INTERNATIONAL";
export type ShipmentStatus =
    | "PENDING"
    | "ASSIGNED"
    | "PICKED_UP"
    | "IN_TRANSIT"
    | "OUT_FOR_DELIVERY"
    | "DELIVERED"
    | "CANCELLED"
    | "FAILED"
    | "RETURNED";

export type Priority = "STANDARD" | "EXPRESS";
export type PaymentMethod = "COD" | "STRIPE";
export type PaymentStatus = "PENDING" | "PAID" | "COD" | "FAILED";

export interface Pricing {
    id: string;
    regionType: RegionType;
    basePrice: number;
    perKgPrice: number;
    expressMult: number;
}

export interface ShipmentPricing {
    id: string;
    shipmentId: string;
    regionType: RegionType;
    basePrice: number;
    weightCharge: number;
    priorityCharge: number;
    totalPrice: number;
}

export interface PriceQuote {
    regionType: RegionType;
    basePrice: number;
    weightCharge: number;
    priorityCharge: number;
    totalPrice: number;
}

export interface ShipmentEvent {
    id: string;
    shipmentId: string;
    status: ShipmentStatus;
    note?: string;
    createdAt: string;
}

export interface ShipmentPayment {
    id: string;
    shipmentId: string;
    method: PaymentMethod;
    status: PaymentStatus;
    amount: number;
    transactionId?: string;
    createdAt: string;
    updatedAt: string;
}

export interface Shipment {
    id: string;
    trackingNumber: string;
    senderId: string;
    merchantId?: string;
    courierId?: string;
    pickupAddress: string;
    pickupCity: string;
    pickupPhone: string;
    deliveryAddress: string;
    deliveryCity: string;
    deliveryPhone: string;
    packageType: string;
    weight: number;
    productPrice: number;
    priority: Priority;
    status: ShipmentStatus;
    paymentStatus: PaymentStatus;
    proofOfDelivery?: string;
    note?: string;
    
    // Hub-based delivery fields
    deliveryType?: DeliveryType;
    currentLegId?: string;
    
    createdAt: string;
    updatedAt: string;
    sender?: User;
    courier?: Courier;
    pricing?: ShipmentPricing;
    payment?: ShipmentPayment;
    events?: ShipmentEvent[];
    legs?: ShipmentLeg[];
}

export interface CreateShipmentPayload {
    pickupAddress: string;
    pickupCity: string;
    pickupPhone: string;
    deliveryAddress: string;
    deliveryCity: string;
    deliveryPhone: string;
    packageType: string;
    weight: number;
    productPrice?: number;
    priority?: Priority;
    paymentMethod: PaymentMethod;
    note?: string;
}

export interface UpdateShipmentStatusPayload {
    status: ShipmentStatus;
    note?: string;
    proofOfDelivery?: string;
}

export interface AssignCourierPayload {
    courierId: string;
}

export interface CalculatePricePayload {
    pickupCity: string;
    deliveryCity: string;
    weight: number;
    priority?: Priority;
}

export interface UpsertPricingPayload {
    regionType: RegionType;
    basePrice: number;
    perKgPrice: number;
    expressMult?: number;
}
