"use client";

import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { Shipment } from "@/types/shipment.types";
import { ShipmentLeg } from "@/types/shipmentLeg.types";

interface PrintLabelProps {
    shipment?: Shipment;
    leg?: ShipmentLeg;
    size?: "sm" | "default" | "lg";
    variant?: "default" | "outline" | "ghost";
}

export function PrintLabel({ shipment, leg, size = "sm", variant = "outline" }: PrintLabelProps) {
    const handlePrint = () => {
        const data = shipment || leg?.shipment;
        if (!data) return;

        const printWindow = window.open("", "_blank");
        if (!printWindow) return;

        const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Shipment Label - ${data.trackingNumber}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; padding: 20px; }
        .label { border: 2px solid #000; padding: 20px; max-width: 600px; margin: 0 auto; }
        .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 15px; margin-bottom: 15px; }
        .tracking { font-size: 32px; font-weight: bold; letter-spacing: 2px; margin: 10px 0; }
        .barcode { font-family: 'Courier New', monospace; font-size: 24px; text-align: center; margin: 15px 0; }
        .section { margin: 15px 0; padding: 10px; border: 1px solid #ccc; }
        .section-title { font-weight: bold; font-size: 14px; margin-bottom: 8px; text-transform: uppercase; }
        .info { display: flex; justify-content: space-between; margin: 5px 0; }
        .label-text { font-size: 12px; }
        .value { font-weight: bold; }
        .priority { display: inline-block; padding: 5px 10px; background: ${data.priority === "EXPRESS" ? "#ef4444" : "#6b7280"}; color: white; font-weight: bold; margin-top: 10px; }
        @media print {
            body { padding: 0; }
            .no-print { display: none; }
        }
    </style>
</head>
<body>
    <div class="label">
        <div class="header">
            <h1>SwiftShip Courier</h1>
            <div class="tracking">${data.trackingNumber}</div>
            <div class="barcode">||||| ${data.trackingNumber} |||||</div>
            <span class="priority">${data.priority}</span>
        </div>

        <div class="section">
            <div class="section-title">From (Pickup)</div>
            <div class="info"><span class="label-text">Address:</span> <span class="value">${data.pickupAddress}</span></div>
            <div class="info"><span class="label-text">City:</span> <span class="value">${data.pickupCity}</span></div>
            <div class="info"><span class="label-text">Phone:</span> <span class="value">${data.pickupPhone}</span></div>
        </div>

        <div class="section">
            <div class="section-title">To (Delivery)</div>
            <div class="info"><span class="label-text">Address:</span> <span class="value">${data.deliveryAddress}</span></div>
            <div class="info"><span class="label-text">City:</span> <span class="value">${data.deliveryCity}</span></div>
            <div class="info"><span class="label-text">Phone:</span> <span class="value">${data.deliveryPhone}</span></div>
        </div>

        <div class="section">
            <div class="section-title">Package Details</div>
            <div class="info"><span class="label-text">Type:</span> <span class="value">${data.packageType}</span></div>
            <div class="info"><span class="label-text">Weight:</span> <span class="value">${data.weight} kg</span></div>
            ${data.payment ? `<div class="info"><span class="label-text">Payment:</span> <span class="value">${data.payment.method} - ${data.payment.status}</span></div>` : ""}
            ${data.pricing ? `<div class="info"><span class="label-text">Amount:</span> <span class="value">${data.pricing.totalPrice} BDT</span></div>` : ""}
            ${data.productPrice ? `<div class="info"><span class="label-text">Product Price:</span> <span class="value">${data.productPrice} BDT (COD)</span></div>` : ""}
        </div>

        ${data.note ? `
        <div class="section">
            <div class="section-title">Special Instructions</div>
            <p class="label-text">${data.note}</p>
        </div>
        ` : ""}

        ${leg ? `
        <div class="section">
            <div class="section-title">Leg Information</div>
            <div class="info"><span class="label-text">Type:</span> <span class="value">${leg.legType}</span></div>
            <div class="info"><span class="label-text">From:</span> <span class="value">${leg.originType === "HUB" ? leg.originHub?.name : leg.originAddress}</span></div>
            <div class="info"><span class="label-text">To:</span> <span class="value">${leg.destType === "HUB" ? leg.destHub?.name : leg.destAddress}</span></div>
        </div>
        ` : ""}

        <div style="margin-top: 20px; text-align: center; font-size: 10px; color: #666;">
            Generated: ${new Date().toLocaleString()}
        </div>
    </div>

    <div class="no-print" style="text-align: center; margin-top: 20px;">
        <button onclick="window.print()" style="padding: 10px 20px; font-size: 16px; cursor: pointer;">Print Label</button>
        <button onclick="window.close()" style="padding: 10px 20px; font-size: 16px; cursor: pointer; margin-left: 10px;">Close</button>
    </div>
</body>
</html>
        `;

        printWindow.document.write(html);
        printWindow.document.close();
    };

    return (
        <Button size={size} variant={variant} onClick={handlePrint}>
            <Printer className="h-4 w-4" />
            <span className="ml-1">Print Label</span>
        </Button>
    );
}
