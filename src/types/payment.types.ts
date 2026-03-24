import { PaymentMethod, PaymentStatus } from "./shipment.types";

export interface Payment {
    id: string;
    shipmentId: string;
    amount: number;
    method: PaymentMethod;
    status: PaymentStatus;
    transactionId?: string;
    createdAt: string;
    updatedAt: string;
    shipment?: {
        trackingNumber: string;
        status: string;
    };
}

export interface InitiateStripePayload {
    amount: number;
}

export interface ConfirmStripePayload {
    sessionId: string;
}

export interface StripeInitiateResponse {
    sessionId: string;
    url: string;
}
