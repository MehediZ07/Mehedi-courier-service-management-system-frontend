import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const { totalEarnings, pendingCOD, completedLegs, availability, approvalStatus } = await req.json();
        const apiKey = process.env.OPENROUTER_API_KEY;
        if (!apiKey) return NextResponse.json({ error: "Not configured" }, { status: 500 });

        const prompt = `You are a performance coach for a courier rider using SwiftShip. Analyze their data and give exactly 4 short, actionable insights. Each on its own line as: ICON_NAME|Title|1-2 sentence insight.

Use only these icon names: TrendingUp, Wallet, Clock, PackageCheck, AlertTriangle, Target, Zap, Bike

Courier Data:
- Approval status: ${approvalStatus}
- Currently available/online: ${availability}
- Total earnings all time: ${totalEarnings} BDT
- Pending COD to hand over: ${pendingCOD} BDT
- Recent completed deliveries: ${completedLegs}

Focus on: earnings performance, COD urgency if high, availability tip, and one motivational growth insight. Be specific with numbers.`;

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
                "HTTP-Referer": "https://swiftship-frontendv1.vercel.app",
                "X-Title": "SwiftShip Courier Insights",
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
