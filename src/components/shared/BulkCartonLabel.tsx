"use client";

import { ShipmentLeg } from "@/types/shipmentLeg.types";
import { Button } from "@/components/ui/button";
import { Package } from "lucide-react";

interface BulkCartonLabelProps {
    legs: ShipmentLeg[];
    originHubName: string;
    destHubName: string;
    originHubCity?: string;
    destHubCity?: string;
}

export function BulkCartonLabel({ legs, originHubName, destHubName, originHubCity, destHubCity }: BulkCartonLabelProps) {
    const handlePrint = () => {
        const printWindow = window.open("", "_blank");
        if (!printWindow) return;

        const batchId = `HT-${Date.now().toString(36).toUpperCase()}`;
        const totalWeight = legs.reduce((sum, leg) => sum + (leg.shipment?.weight || 0), 0);

        const content = `
<!DOCTYPE html>
<html>
<head>
    <title>Bulk Carton Label - ${originHubName} to ${destHubName}</title>
    <style>
        @media print {
            @page { 
                size: A4 portrait;
                margin: 0;
            }
            body { margin: 0; padding: 0; }
            .no-print { display: none; }
        }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: Arial, sans-serif; 
            padding: 20px;
            background: white;
        }
        .label-container {
            border: 4px solid #000;
            padding: 20px;
            max-width: 800px;
            margin: 0 auto;
            background: white;
        }
        .header {
            text-align: center;
            border-bottom: 3px solid #000;
            padding-bottom: 20px;
            margin-bottom: 20px;
        }
        .company-name {
            font-size: 36px;
            font-weight: bold;
            letter-spacing: 2px;
        }
        .label-type {
            font-size: 18px;
            color: #666;
            margin-top: 5px;
        }
        .batch-id {
            font-size: 28px;
            font-weight: bold;
            font-family: 'Courier New', monospace;
            letter-spacing: 3px;
            margin: 15px 0;
            padding: 10px;
            background: #f0f0f0;
            border: 2px dashed #000;
            text-align: center;
        }
        .barcode {
            font-family: 'Courier New', monospace;
            font-size: 32px;
            text-align: center;
            letter-spacing: 2px;
            margin: 15px 0;
        }
        .route-section {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin: 30px 0;
            padding: 20px;
            background: #f9f9f9;
            border: 2px solid #000;
        }
        .hub-box {
            flex: 1;
            text-align: center;
        }
        .hub-label {
            font-size: 14px;
            color: #666;
            text-transform: uppercase;
            margin-bottom: 10px;
        }
        .hub-name {
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 5px;
        }
        .hub-city {
            font-size: 18px;
            color: #333;
        }
        .arrow {
            font-size: 48px;
            font-weight: bold;
            padding: 0 30px;
            color: #000;
        }
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin: 20px 0;
        }
        .info-box {
            border: 2px solid #000;
            padding: 15px;
            background: #fff;
        }
        .info-label {
            font-size: 12px;
            color: #666;
            text-transform: uppercase;
            margin-bottom: 5px;
        }
        .info-value {
            font-size: 24px;
            font-weight: bold;
        }
        .warning-box {
            background: #fff3cd;
            border: 3px solid #ffc107;
            padding: 15px;
            margin: 20px 0;
            text-align: center;
        }
        .warning-title {
            font-size: 18px;
            font-weight: bold;
            color: #856404;
            margin-bottom: 10px;
        }
        .warning-text {
            font-size: 14px;
            color: #856404;
        }
        .shipment-list {
            margin: 20px 0;
            border: 2px solid #000;
            padding: 15px;
            max-height: 300px;
            overflow-y: auto;
        }
        .shipment-list-title {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 10px;
            text-transform: uppercase;
        }
        .shipment-item {
            padding: 8px;
            border-bottom: 1px solid #ddd;
            display: flex;
            justify-content: space-between;
            font-size: 12px;
        }
        .shipment-item:last-child {
            border-bottom: none;
        }
        .tracking {
            font-family: 'Courier New', monospace;
            font-weight: bold;
        }
        .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 3px solid #000;
        }
        .signature-section {
            display: flex;
            justify-content: space-between;
            margin-top: 40px;
        }
        .signature-box {
            width: 45%;
        }
        .signature-label {
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 5px;
        }
        .signature-line {
            border-top: 2px solid #000;
            margin-top: 60px;
            padding-top: 5px;
            font-size: 12px;
            color: #666;
        }
        .instructions {
            background: #e9ecef;
            padding: 15px;
            margin-top: 20px;
            border-left: 4px solid #000;
        }
        .instructions-title {
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        .instructions ul {
            margin-left: 20px;
            font-size: 12px;
            line-height: 1.6;
        }
        .timestamp {
            text-align: center;
            font-size: 11px;
            color: #999;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="label-container">
        <!-- Header -->
        <div class="header">
            <div class="company-name">SWIFTSHIP</div>
            <div class="label-type">Hub Transfer - Bulk Carton Label</div>
        </div>

        <!-- Batch ID -->
        <div class="batch-id">${batchId}</div>
        <div class="barcode">||||| ${batchId} |||||</div>

        <!-- Route Section -->
        <div class="route-section">
            <div class="hub-box">
                <div class="hub-label">From (Origin)</div>
                <div class="hub-name">${originHubName}</div>
                ${originHubCity ? `<div class="hub-city">${originHubCity}</div>` : ''}
            </div>
            <div class="arrow">→</div>
            <div class="hub-box">
                <div class="hub-label">To (Destination)</div>
                <div class="hub-name">${destHubName}</div>
                ${destHubCity ? `<div class="hub-city">${destHubCity}</div>` : ''}
            </div>
        </div>

        <!-- Info Grid -->
        <div class="info-grid">
            <div class="info-box">
                <div class="info-label">Total Shipments</div>
                <div class="info-value">${legs.length}</div>
            </div>
            <div class="info-box">
                <div class="info-label">Total Weight</div>
                <div class="info-value">${totalWeight.toFixed(2)} kg</div>
            </div>
            <div class="info-box">
                <div class="info-label">Transfer Date</div>
                <div class="info-value" style="font-size: 16px;">${new Date().toLocaleDateString()}</div>
            </div>
            <div class="info-box">
                <div class="info-label">Transfer Time</div>
                <div class="info-value" style="font-size: 16px;">${new Date().toLocaleTimeString()}</div>
            </div>
        </div>

        <!-- Warning Box -->
        <div class="warning-box">
            <div class="warning-title">⚠️ HANDLE WITH CARE</div>
            <div class="warning-text">This carton contains ${legs.length} shipments. Verify contents before accepting.</div>
        </div>

        <!-- Shipment List -->
        <div class="shipment-list">
            <div class="shipment-list-title">Contents - Tracking Numbers</div>
            ${legs.map((leg, index) => `
                <div class="shipment-item">
                    <span>${index + 1}. <span class="tracking">${leg.shipment?.trackingNumber || 'N/A'}</span></span>
                    <span>${leg.shipment?.weight || '—'} kg | ${leg.shipment?.priority || 'STANDARD'}</span>
                </div>
            `).join('')}
        </div>

        <!-- Instructions -->
        <div class="instructions">
            <div class="instructions-title">Transfer Instructions</div>
            <ul>
                <li>Verify carton seal is intact before accepting</li>
                <li>Count and verify all ${legs.length} shipments against manifest</li>
                <li>Check for any visible damage to packages</li>
                <li>Report any discrepancies immediately to control center</li>
                <li>Both origin and destination staff must sign below</li>
                <li>Keep this label attached to carton during entire transfer</li>
            </ul>
        </div>

        <!-- Footer with Signatures -->
        <div class="footer">
            <div class="signature-section">
                <div class="signature-box">
                    <div class="signature-label">Released By (${originHubName})</div>
                    <div class="signature-line">Signature, Name & Date</div>
                </div>
                <div class="signature-box">
                    <div class="signature-label">Received By (${destHubName})</div>
                    <div class="signature-line">Signature, Name & Date</div>
                </div>
            </div>
        </div>

        <!-- Timestamp -->
        <div class="timestamp">
            Label Generated: ${new Date().toLocaleString()} | Batch ID: ${batchId}
        </div>
    </div>

    <!-- Print Controls -->
    <div class="no-print" style="text-align: center; margin-top: 30px;">
        <button onclick="window.print()" style="padding: 12px 24px; font-size: 16px; cursor: pointer; background: #000; color: white; border: none; border-radius: 4px; margin-right: 10px;">
            Print Label
        </button>
        <button onclick="window.close()" style="padding: 12px 24px; font-size: 16px; cursor: pointer; background: #666; color: white; border: none; border-radius: 4px;">
            Close
        </button>
    </div>
</body>
</html>
        `;

        printWindow.document.write(content);
        printWindow.document.close();
    };

    return (
        <Button onClick={handlePrint} variant="default" size="sm">
            <Package className="h-4 w-4 mr-2" />
            Print Carton Label
        </Button>
    );
}
