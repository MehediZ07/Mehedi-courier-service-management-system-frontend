import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const { analytics, shipments, couriers, merchants } = await req.json();

        const apiKey = process.env.OPENROUTER_API_KEY;
        if (!apiKey) return NextResponse.json({ error: "Not configured" }, { status: 500 });

        const prompt = `You are a business analyst for SwiftShip, a courier management platform. Analyze the following platform data and provide exactly 4 short, actionable business insights. Each on its own line as: ICON_NAME|Title|1-2 sentence insight.

Use only these icon names: TrendingUp, TrendingDown, PackageCheck, Clock, DollarSign, AlertTriangle, Target, Zap, Wallet, Truck

Platform Data:
- Total visits: ${analytics.totalVisits}, Today: ${analytics.todayVisits}, Live now: ${analytics.liveUsers}
- Total shipments: ${shipments.total}, Delivered: ${shipments.delivered}, Pending: ${shipments.pending}, In Transit: ${shipments.inTransit}, Cancelled: ${shipments.cancelled}
- Delivery success rate: ${shipments.total > 0 ? ((shipments.delivered / shipments.total) * 100).toFixed(1) : 0}%
- Total couriers: ${couriers.total}, Active/online: ${couriers.active}, Pending approval: ${couriers.pending}
- Total merchants: ${merchants.total}
- Pending COD to settle: ${couriers.pendingCOD} BDT
- Pending merchant settlement: ${merchants.pendingSettlement} BDT

Focus on: delivery performance, courier network health, revenue/settlement urgency, and growth opportunities. Be specific with the numbers. Keep each insight under 2 sentences.`;

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
                "HTTP-Referer": "https://swiftship-frontendv1.vercel.app",
                "X-Title": "SwiftShip AI Insights",
            },
            body: JSON.stringify({
                model: "openai/gpt-4o-mini",
                messages: [{ role: "user", content: prompt }],
                max_tokens: 400,
                temperature: 0.5,
            }),
        });

        const data = await response.json();
        const raw: string = data.choices?.[0]?.message?.content ?? "";
        const insights = raw.split("\n")
            .filter((l: string) => l.includes("|"))
            .slice(0, 4)
            .map((line: string) => {
                const [icon, title, body] = line.split("|").map((s: string) => s.trim());
                return { icon: icon || "TrendingUp", title: title || "Insight", body: body || "" };
            });

        return NextResponse.json({ insights });
    } catch {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
