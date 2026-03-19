import MyShipments from "@/components/modules/Shipment/MyShipments";
import { Suspense } from "react";

export default function MerchantMyShipmentsPage() {
    return <Suspense><MyShipments title="My Shipments" /></Suspense>;
}
