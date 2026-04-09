import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
    Sparkles,
    MessageCircle,
    BarChart3,
    Route,
    ArrowRight,
    Bot,
    Zap,
} from "lucide-react";

const aiFeatures = [
    {
        icon: MessageCircle,
        badge: "AI #1",
        title: "24/7 Support Chatbot",
        description:
            "Our AI assistant answers questions about pricing, tracking, courier registration, and payments instantly — no waiting, no tickets.",
        highlights: ["Instant answers", "Pricing calculator help", "Shipment guidance"],
        color: "text-primary",
        bg: "bg-primary/10",
        border: "border-primary/20",
        badgeColor: "bg-primary/10 text-primary border-primary/20",
        available: "Available on every page",
    },
    {
        icon: BarChart3,
        badge: "AI #2",
        title: "Smart Business Insights",
        description:
            "AI analyzes your live platform data — shipments, couriers, revenue, settlements — and generates actionable insights tailored to your role.",
        highlights: ["Admin platform overview", "Merchant revenue tips", "Courier performance coaching"],
        color: "text-violet-600 dark:text-violet-400",
        bg: "bg-violet-500/10",
        border: "border-violet-500/20",
        badgeColor: "bg-violet-500/10 text-violet-700 border-violet-500/20 dark:text-violet-400",
        available: "In every dashboard",
    },
    {
        icon: Route,
        badge: "AI #3",
        title: "Shipment Journey Summarizer",
        description:
            "AI reads your shipment's full event timeline and generates a warm, human-friendly summary of exactly where your package is and what's happening.",
        highlights: ["Plain-English status", "Multi-leg journey explained", "Reassuring delivery updates"],
        color: "text-emerald-600 dark:text-emerald-400",
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/20",
        badgeColor: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20 dark:text-emerald-400",
        available: "On all track pages",
    },
];

export default function AISection() {
    return (
        <section className="py-14 bg-secondary/30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="text-center max-w-2xl mx-auto mb-10">
                    <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-4">
                        <Sparkles className="size-3.5 text-primary" />
                        <span className="text-xs font-semibold text-primary uppercase tracking-widest">
                            AI-Powered Platform
                        </span>
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground mb-4">
                        Intelligence Built Into Every Step
                    </h2>
                    <p className="text-muted-foreground text-lg">
                        SwiftShip uses AI to help merchants ship smarter, couriers earn more, and customers always know where their package is.
                    </p>
                </div>

                {/* 3 AI feature cards */}
                <div className="grid md:grid-cols-3 gap-6 mb-10">
                    {aiFeatures.map((f) => (
                        <div
                            key={f.badge}
                            className={`rounded-2xl border ${f.border} bg-card p-6 flex flex-col gap-4 hover:shadow-lg hover:-translate-y-1 transition-all duration-200`}
                        >
                            {/* Icon + badge */}
                            <div className="flex items-center justify-between">
                                <div className={`size-11 rounded-xl ${f.bg} flex items-center justify-center`}>
                                    <f.icon className={`size-5 ${f.color}`} />
                                </div>
                                <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${f.badgeColor}`}>
                                    {f.badge}
                                </span>
                            </div>

                            {/* Title + description */}
                            <div>
                                <h3 className="font-bold text-foreground text-base mb-1.5">{f.title}</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
                            </div>

                            {/* Highlights */}
                            <ul className="flex flex-col gap-1.5 flex-1">
                                {f.highlights.map((h) => (
                                    <li key={h} className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <Zap className={`size-3 shrink-0 ${f.color}`} />
                                        {h}
                                    </li>
                                ))}
                            </ul>

                            {/* Available label */}
                            <div className={`rounded-lg px-3 py-2 text-xs font-medium ${f.bg} ${f.color} flex items-center gap-1.5`}>
                                <Bot className="size-3.5 shrink-0" />
                                {f.available}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Bottom banner */}
                <div
                    className="rounded-2xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6"
                    style={{ background: "linear-gradient(135deg, oklch(0.22 0.08 295) 0%, oklch(0.32 0.15 295) 100%)" }}
                >
                    <div className="flex items-center gap-4">
                        <div className="size-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                            <Sparkles className="size-6 text-white" />
                        </div>
                        <div>
                            <p className="font-bold text-white">Powered by OpenAI via OpenRouter</p>
                            <p className="text-sm text-white/60 mt-0.5">
                                GPT-4o-mini · Real-time analysis · Role-specific insights
                            </p>
                        </div>
                    </div>
                    <Button
                        size="lg"
                        className="bg-white text-primary hover:bg-white/90 font-semibold gap-2 shrink-0"
                        asChild
                    >
                        <Link href="/register">
                            Try It Free <ArrowRight className="size-4" />
                        </Link>
                    </Button>
                </div>

            </div>
        </section>
    );
}
