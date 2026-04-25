"use client";

import { useMemo } from "react";
import { useGetAllShipments, useGetAllCouriers, useGetAllMerchants } from "@/hooks/queries";
import { AIInsightsWidget } from "@/components/shared/AIInsightsWidget";

export function AIInsightsCard({ analytics }: {
    analytics: { totalVisits: number; todayVisits: number; uniqueVisitorsToday: number; liveUsers: number }
}) {
    const { data: shipmentsRes } = useGetAllShipments({ limit: 1000 });
    const { data: couriersRes } = useGetAllCouriers({ limit: 1000 });
    const { data: merchantsRes } = useGetAllMerchants({ limit: 1000 });

    const payload = useMemo(() => {
        const shipments = shipmentsRes?.data ?? [];
        const couriers = couriersRes?.data ?? [];
        const merchants = merchantsRes?.data ?? [];

        return {
            analytics,
            shipments: {
                total: shipments.length,
                delivered: shipments.filter(s => s.status === "DELIVERED").length,
                pending: shipments.filter(s => s.status === "PENDING").length,
                inTransit: shipments.filter(s => s.status === "IN_TRANSIT" || s.status === "OUT_FOR_DELIVERY").length,
                cancelled: shipments.filter(s => s.status === "CANCELLED").length,
            },
            couriers: {
                total: couriers.length,
                active: couriers.filter(c => c.availability && c.approvalStatus === "APPROVED").length,
                pending: couriers.filter(c => c.approvalStatus === "PENDING").length,
                pendingCOD: couriers.reduce((sum, c) => sum + (c.pendingCOD || 0), 0).toFixed(0),
            },
            merchants: {
                total: merchants.length,
                pendingSettlement: merchants.reduce((sum, m) => sum + (m.pendingSettlement || 0), 0).toFixed(0),
            },
        };
    }, [shipmentsRes, couriersRes, merchantsRes, analytics]);

    return (
        <AIInsightsWidget
            title="AI Business Insights"
            description="AI-powered analysis of platform data — shipments, couriers, merchants & traffic."
            apiEndpoint="/api/ai-insights"
            payload={payload}
            emptyText="Generate AI-powered insights about your platform performance, courier network, and revenue health."
        />
    );
}
