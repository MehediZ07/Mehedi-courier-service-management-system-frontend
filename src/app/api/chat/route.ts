import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are SwiftShip Assistant, a helpful support chatbot for SwiftShip — a courier and delivery management platform.

You help users with:
- Shipment tracking and status updates
- Creating and managing shipments
- Pricing information (LOCAL: 50 BDT base + 20 BDT/kg, NATIONAL: 100 BDT base + 30 BDT/kg, INTERNATIONAL: 500 BDT base + 150 BDT/kg)
- Express surcharges (LOCAL +20%, NATIONAL +25%, INTERNATIONAL +50%)
- Payment methods: Cash on Delivery (COD), Stripe, SSLCommerz
- Courier registration and approval process
- Merchant account and settlement queries
- Platform features and how-to guides

Keep responses concise, friendly, and helpful. If asked about something unrelated to SwiftShip or courier services, politely redirect to relevant topics.`;

export async function POST(req: NextRequest) {
    try {
        const { messages } = await req.json();

        const apiKey = process.env.OPENROUTER_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: "API key not configured" }, { status: 500 });
        }

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
                "HTTP-Referer": "https://swiftship-frontendv1.vercel.app",
                "X-Title": "SwiftShip Assistant",
            },
            body: JSON.stringify({
                model: "openai/gpt-4o-mini",
                messages: [
                    { role: "system", content: SYSTEM_PROMPT },
                    ...messages,
                ],
                max_tokens: 500,
                temperature: 0.7,
            }),
        });

        if (!response.ok) {
            const err = await response.text();
            return NextResponse.json({ error: err }, { status: response.status });
        }

        const data = await response.json();
        const reply = data.choices?.[0]?.message?.content ?? "Sorry, I couldn't generate a response.";

        return NextResponse.json({ reply });
    } catch {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
