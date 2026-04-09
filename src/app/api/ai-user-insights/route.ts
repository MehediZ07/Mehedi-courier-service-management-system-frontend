import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const { total, delivered, pending, inTransit, cancelled } = await req.json();
        const apiKey = process.env.OPENROUTER_API_KEY;
        if (!apiKey) return NextResponse.json({ error: "Not configured" }, { status: 500 });

        const successRate = total > 0 ? ((delivered / total) * 100).toFixed(1) : 0;

        const prompt = `You are a helpful assistant for a customer using SwiftShip courier service. Analyze their shipment history and give exactly 3 short, friendly insights. Each on its own line as: ICON_NAME|Title|1-2 sentence insight.

Use only these icon names: PackageCheck, Clock, Truck, TrendingUp, AlertTriangle, MapPin

Customer Data:
- Total shipments sent: ${total}
- Successfully delivered: ${delivered} (${successRate}% success rate)
- Pending/awaiting pickup: ${pending}
- Currently in transit: ${inTransit}
- Cancelled: ${cancelled}

Focus on: delivery success, any active shipments to watch, and one helpful tip. Be friendly and encouraging.`;

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
                "HTTP-Referer": "https://swiftship-frontendv1.vercel.app",
                "X-Title": "SwiftShip User Insights",
            },
            body: JSON.stringify({
                model: "openai/gpt-4o-mini",
                messages: [{ role: "user", content: prompt }],
                max_tokens: 250,
                temperature: 0.6,
            }),
        });

        const data = await response.json();
        const raw: string = data.choices?.[0]?.message?.content ?? "";
        const insights = raw.split("\n")
            .filter((l: string) => l.includes("|"))
            .slice(0, 3)
            .map((line: string) => {
                const [icon, title, body] = line.split("|").map((s: string) => s.trim());
                return { icon: icon || "PackageCheck", title: title || "Insight", body: body || "" };
            });

        return NextResponse.json({ insights });
    } catch {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
