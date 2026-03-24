export interface Notification {
    id: string;
    userId: string;
    shipmentId: string;
    message: string;
    readStatus: boolean;
    createdAt: string;
    shipment?: {
        trackingNumber: string;
        status: string;
    };
    user?: {
        name: string;
        email: string;
    };
}
