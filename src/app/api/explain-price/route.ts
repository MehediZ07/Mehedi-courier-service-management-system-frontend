import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const { pickupCity, deliveryCity, weight, priority, quote } = await req.json();

        const apiKey = process.env.OPENROUTER_API_KEY;
        if (!apiKey) return NextResponse.json({ error: "Not configured" }, { status: 500 });

        const prompt = `A user is creating a shipment on SwiftShip courier platform with these details:
- From: ${pickupCity} → To: ${deliveryCity}
- Weight: ${weight} kg
- Priority: ${priority}
- Region type: ${quote.regionType}
- Base price: ${quote.basePrice} BDT
- Weight charge: ${quote.weightCharge} BDT
- Express surcharge: ${quote.priorityCharge} BDT
- Total: ${quote.totalPrice} BDT

Write a short, friendly 2-3 sentence explanation of why this price was calculated this way. Be conversational, mention the region type and weight. Do not use bullet points.`;

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
                "HTTP-Referer": "https://swiftship-frontendv1.vercel.app",
                "X-Title": "SwiftShip Price Explainer",
            },
            body: JSON.stringify({
                model: "openai/gpt-4o-mini",
                messages: [{ role: "user", content: prompt }],
                max_tokens: 150,
                temperature: 0.6,
            }),
        });

        const data = await response.json();
        const explanation = data.choices?.[0]?.message?.content ?? "Price calculated based on route, weight, and priority.";
        return NextResponse.json({ explanation });
    } catch {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
