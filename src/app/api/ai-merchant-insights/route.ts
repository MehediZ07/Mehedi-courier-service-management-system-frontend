import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const { total, delivered, pending, inTransit, cancelled, totalRevenue, pendingSettlement } = await req.json();
        const apiKey = process.env.OPENROUTER_API_KEY;
        if (!apiKey) return NextResponse.json({ error: "Not configured" }, { status: 500 });

        const successRate = total > 0 ? ((delivered / total) * 100).toFixed(1) : 0;

        const prompt = `You are a business advisor for a merchant using SwiftShip courier platform. Analyze their shipment data and give exactly 4 short, actionable insights. Each on its own line as: ICON_NAME|Title|1-2 sentence insight.

Use only these icon names: TrendingUp, TrendingDown, PackageCheck, Clock, DollarSign, AlertTriangle, Target, Zap

Merchant Data:
- Total shipments: ${total}
- Delivered: ${delivered} (${successRate}% success rate)
- Pending pickup: ${pending}
- In transit: ${inTransit}
- Cancelled: ${cancelled}
- Total revenue from delivered: ${totalRevenue} BDT
- Pending settlement from admin: ${pendingSettlement} BDT

Focus on: delivery success, pending actions, revenue health, and one growth tip. Be specific with numbers.`;

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
                "HTTP-Referer": "https://swiftship-frontendv1.vercel.app",
                "X-Title": "SwiftShip Merchant Insights",
            },
            body: JSON.stringify({
                model: "openai/gpt-4o-mini",
                messages: [{ role: "user", content: prompt }],
                max_tokens: 300,
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
