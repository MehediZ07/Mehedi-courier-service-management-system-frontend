import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const { trackingNumber, status, pickupCity, deliveryCity, events, legs } = await req.json();

        const apiKey = process.env.OPENROUTER_API_KEY;
        if (!apiKey) return NextResponse.json({ error: "Not configured" }, { status: 500 });

        const eventList = events?.length
            ? events.map((e: { status: string; createdAt: string; note?: string }) =>
                `- ${e.status} at ${new Date(e.createdAt).toLocaleString()}${e.note ? ` (${e.note})` : ""}`
              ).join("\n")
            : "No events recorded yet.";

        const legList = legs?.length
            ? `Multi-leg journey with ${legs.length} legs.`
            : "";

        const prompt = `Summarize this shipment journey in 2-3 friendly, human sentences for the customer.

Tracking: ${trackingNumber}
Route: ${pickupCity} → ${deliveryCity}
Current status: ${status}
${legList}

Timeline:
${eventList}

Be warm and reassuring. If delivered, congratulate. If in transit, give encouragement. Do not list the events — just summarize naturally.`;

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
                "HTTP-Referer": "https://swiftship-frontendv1.vercel.app",
                "X-Title": "SwiftShip Shipment Summarizer",
            },
            body: JSON.stringify({
                model: "openai/gpt-4o-mini",
                messages: [{ role: "user", content: prompt }],
                max_tokens: 150,
                temperature: 0.7,
            }),
        });

        const data = await response.json();
        const summary = data.choices?.[0]?.message?.content ?? "Your shipment is being processed.";
        return NextResponse.json({ summary });
    } catch {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
