"use client";

import { ShipmentLeg } from "@/types/shipmentLeg.types";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

interface HubTransferPrintProps {
    legs: ShipmentLeg[];
    originHubName: string;
    destHubName: string;
}

export function HubTransferPrint({ legs, originHubName, destHubName }: HubTransferPrintProps) {
    const handlePrint = () => {
        const printWindow = window.open("", "_blank");
        if (!printWindow) return;

        const content = `
<!DOCTYPE html>
<html>
<head>
    <title>Hub Transfer Manifest</title>
    <style>
        @media print {
            @page { margin: 0.5in; }
            body { margin: 0; }
        }
        body {
            font-family: Arial, sans-serif;
            padding: 20px;
        }
        .header {
            text-align: center;
            border-bottom: 3px solid #000;
            padding-bottom: 15px;
            margin-bottom: 20px;
        }
        .title {
            font-size: 24px;
            font-weight: bold;
        }
        .route {
            font-size: 18px;
            margin: 10px 0;
        }
        .info-box {
            background: #f5f5f5;
            padding: 15px;
            margin: 15px 0;
            border: 1px solid #ddd;
        }
        .info-row {
            display: flex;
            justify-content: space-between;
            margin: 5px 0;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 10px;
            text-align: left;
        }
        th {
            background: #333;
            color: white;
            font-weight: bold;
        }
        tr:nth-child(even) {
            background: #f9f9f9;
        }
        .footer {
            margin-top: 30px;
            padding-top: 15px;
            border-top: 2px solid #000;
        }
        .signature-box {
            display: inline-block;
            width: 45%;
            margin-top: 40px;
        }
        .signature-line {
            border-top: 1px solid #000;
            margin-top: 50px;
            padding-top: 5px;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="title">SwiftShip Hub Transfer Manifest</div>
        <div class="route">${originHubName} → ${destHubName}</div>
        <div style="font-size: 14px; color: #666;">Date: ${new Date().toLocaleString()}</div>
    </div>

    <div class="info-box">
        <div class="info-row">
            <strong>Total Shipments:</strong>
            <span>${legs.length}</span>
        </div>
        <div class="info-row">
            <strong>Origin Hub:</strong>
            <span>${originHubName}</span>
        </div>
        <div class="info-row">
            <strong>Destination Hub:</strong>
            <span>${destHubName}</span>
        </div>
    </div>

    <table>
        <thead>
            <tr>
                <th>#</th>
                <th>Tracking Number</th>
                <th>Leg Type</th>
                <th>Package Type</th>
                <th>Weight (kg)</th>
                <th>Priority</th>
                <th>Verified</th>
            </tr>
        </thead>
        <tbody>
            ${legs.map((leg, index) => `
                <tr>
                    <td>${index + 1}</td>
                    <td style="font-family: monospace; font-weight: bold;">${leg.shipment?.trackingNumber || "N/A"}</td>
                    <td>${leg.legType}</td>
                    <td>${leg.shipment?.packageType || "—"}</td>
                    <td>${leg.shipment?.weight || "—"}</td>
                    <td>${leg.shipment?.priority || "—"}</td>
                    <td style="text-align: center;">☐</td>
                </tr>
            `).join("")}
        </tbody>
    </table>

    <div class="footer">
        <div style="display: flex; justify-content: space-between;">
            <div class="signature-box">
                <div><strong>Released By:</strong></div>
                <div class="signature-line">Signature & Date</div>
            </div>
            <div class="signature-box">
                <div><strong>Received By:</strong></div>
                <div class="signature-line">Signature & Date</div>
            </div>
        </div>
        
        <div style="margin-top: 30px; font-size: 12px; color: #666;">
            <p><strong>Instructions:</strong></p>
            <ul>
                <li>Verify each package against this manifest</li>
                <li>Check for any visible damage</li>
                <li>Report discrepancies immediately</li>
                <li>Both parties must sign upon transfer</li>
            </ul>
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
            Print Manifest
        </Button>
    );
}
