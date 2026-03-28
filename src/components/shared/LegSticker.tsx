"use client";

import { ShipmentLeg } from "@/types/shipmentLeg.types";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

interface LegStickerProps {
    leg: ShipmentLeg;
}

export function LegSticker({ leg }: LegStickerProps) {
    const handlePrint = () => {
        const printWindow = window.open("", "_blank");
        if (!printWindow) return;

        const content = `
<!DOCTYPE html>
<html>
<head>
    <title>Leg Sticker - ${leg.shipment?.trackingNumber}</title>
    <style>
        @media print {
            @page { margin: 0; size: 4in 6in; }
            body { margin: 0.5in; }
        }
        body {
            font-family: Arial, sans-serif;
            padding: 20px;
            max-width: 4in;
        }
        .sticker {
            border: 2px solid #000;
            padding: 15px;
        }
        .header {
            text-align: center;
            border-bottom: 2px solid #000;
            padding-bottom: 10px;
            margin-bottom: 15px;
        }
        .tracking {
            font-size: 18px;
            font-weight: bold;
            margin: 5px 0;
        }
        .leg-info {
            font-size: 14px;
            margin: 5px 0;
        }
        .section {
            margin: 15px 0;
            padding: 10px;
            background: #f5f5f5;
        }
        .section-title {
            font-weight: bold;
            font-size: 12px;
            text-transform: uppercase;
            margin-bottom: 5px;
        }
        .address {
            font-size: 13px;
            line-height: 1.4;
        }
        .barcode {
            text-align: center;
            font-family: 'Courier New', monospace;
            font-size: 24px;
            letter-spacing: 2px;
            margin: 10px 0;
        }
        .footer {
            margin-top: 15px;
            padding-top: 10px;
            border-top: 1px solid #000;
            font-size: 11px;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="sticker">
        <div class="header">
            <div style="font-size: 20px; font-weight: bold;">SwiftShip</div>
            <div class="tracking">${leg.shipment?.trackingNumber || "N/A"}</div>
            <div class="leg-info">Leg ${leg.legNumber} - ${leg.legType}</div>
        </div>

        <div class="barcode">||||| ${leg.shipment?.trackingNumber?.slice(-8) || ""} |||||</div>

        <div class="section">
            <div class="section-title">From</div>
            <div class="address">
                ${leg.originType === "HUB" 
                    ? `<strong>${leg.originHub?.name || "Hub"}</strong><br>${leg.originHub?.address || ""}<br>${leg.originHub?.city || ""}`
                    : `${leg.originAddress || "N/A"}`
                }
            </div>
        </div>

        <div class="section">
            <div class="section-title">To</div>
            <div class="address">
                ${leg.destType === "HUB" 
                    ? `<strong>${leg.destHub?.name || "Hub"}</strong><br>${leg.destHub?.address || ""}<br>${leg.destHub?.city || ""}`
                    : `${leg.destAddress || "N/A"}`
                }
            </div>
        </div>

        ${leg.shipment ? `
        <div style="margin: 10px 0;">
            <div style="display: flex; justify-content: space-between; font-size: 12px;">
                <div><strong>Package:</strong> ${leg.shipment.packageType}</div>
                <div><strong>Weight:</strong> ${leg.shipment.weight} kg</div>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 12px; margin-top: 5px;">
                <div><strong>Priority:</strong> ${leg.shipment.priority}</div>
                <div><strong>Amount:</strong> ${leg.shipment.pricing?.totalPrice || 0} BDT</div>
            </div>
        </div>
        ` : ""}

        ${leg.courier ? `
        <div style="margin: 10px 0; font-size: 12px;">
            <strong>Courier:</strong> ${leg.courier.user?.name || "N/A"}<br>
            <strong>Phone:</strong> ${leg.courier.user?.phone || "N/A"}
        </div>
        ` : ""}

        <div class="footer">
            Handle with care • Scan on pickup & delivery
        </div>
    </div>
</body>
</html>
        `;

        printWindow.document.write(content);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 250);
    };

    return (
        <Button onClick={handlePrint} variant="outline" size="sm">
            <Printer className="h-4 w-4 mr-2" />
            Print Sticker
        </Button>
    );
}
