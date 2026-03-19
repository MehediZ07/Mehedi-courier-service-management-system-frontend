import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Check, Calculator, MapPin, Globe } from "lucide-react";

const tiers = [
    {
        region: "LOCAL",
        label: "Local Delivery",
        icon: MapPin,
        description: "Same-city deliveries. Fast, affordable, and reliable.",
        highlight: false,
        basePrice: 50,
        perKgPrice: 20,
        expressMult: 1.2,
        example: { weight: 2, priority: "STANDARD", total: 90 },
        features: [
            "Same city delivery",
            "Standard & Express priority",
            "Real-time tracking",
            "Cash on delivery (COD)",
            "Online payment support",
            "Proof of delivery",
            "Shipment event log",
            "Customer support",
        ],
    },
    {
        region: "NATIONAL",
        label: "National Delivery",
        icon: MapPin,
        description: "Inter-city shipping across the country.",
        highlight: true,
        badge: "Most Popular",
        basePrice: 100,
        perKgPrice: 30,
        expressMult: 1.25,
        example: { weight: 5, priority: "EXPRESS", total: 312.5 },
        features: [
            "Different city delivery",
            "Standard & Express priority",
            "Real-time tracking",
            "Cash on delivery (COD)",
            "Stripe & SSLCommerz payments",
            "Proof of delivery",
            "Courier self-assignment",
            "Automatic notifications",
        ],
    },
    {
        region: "INTERNATIONAL",
        label: "International Delivery",
        icon: Globe,
        description: "Cross-border shipping with full tracking support.",
        highlight: false,
        basePrice: 500,
        perKgPrice: 150,
        expressMult: 1.5,
        example: { weight: 3, priority: "STANDARD", total: 950 },
        features: [
            "Cross-border delivery",
            "Standard & Express priority",
            "Real-time tracking",
            "All payment methods",
            "Proof of delivery",
            "Customs handling support",
            "Shipment insurance option",
            "Dedicated customer support",
        ],
    },
];

function formatBDT(amount: number) {
    return `${amount % 1 === 0 ? amount : amount.toFixed(2)} BDT`;
}

export default function PricingSection() {
    return (
        <section id="pricing" className="py-24 bg-secondary/20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center max-w-2xl mx-auto mb-6">
                    <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-3">
                        Transparent Shipping Rates
                    </p>
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground mb-4">
                        Simple, Weight-Based Pricing
                    </h2>
                    <p className="text-muted-foreground text-lg">
                        No hidden fees. Price is calculated automatically from your route, weight, and priority.
                    </p>
                </div>

                {/* Formula pill */}
                <div className="flex justify-center mb-14">
                    <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-5 py-2 text-sm text-primary font-medium">
                        <Calculator className="w-4 h-4" />
                        Base Price + (Weight × Per Kg) + Express Surcharge
                    </div>
                </div>

                {/* Cards */}
                <div className="grid md:grid-cols-3 gap-8 items-start">
                    {tiers.map((tier) => (
                        <div
                            key={tier.region}
                            className={`relative rounded-2xl border p-8 flex flex-col gap-6 transition-all duration-200 ${
                                tier.highlight
                                    ? "border-primary bg-primary text-primary-foreground shadow-2xl scale-105"
                                    : "border-border bg-card hover:shadow-lg"
                            }`}
                        >
                            {/* Badge */}
                            {tier.badge && (
                                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground text-xs font-bold px-4 py-1 rounded-full shadow">
                                    {tier.badge}
                                </span>
                            )}

                            {/* Region label & rates */}
                            <div>
                                <p
                                    className={`text-xs font-bold uppercase tracking-widest mb-2 ${
                                        tier.highlight ? "text-primary-foreground/60" : "text-primary"
                                    }`}
                                >
                                    {tier.region}
                                </p>
                                <p className="text-xl font-extrabold mb-1">{tier.label}</p>
                                <p
                                    className={`text-sm leading-relaxed ${
                                        tier.highlight ? "text-primary-foreground/75" : "text-muted-foreground"
                                    }`}
                                >
                                    {tier.description}
                                </p>
                            </div>

                            {/* Rate breakdown */}
                            <div
                                className={`rounded-xl p-4 space-y-1.5 text-sm ${
                                    tier.highlight
                                        ? "bg-primary-foreground/10"
                                        : "bg-secondary/60"
                                }`}
                            >
                                <div className="flex justify-between">
                                    <span className={tier.highlight ? "text-primary-foreground/70" : "text-muted-foreground"}>
                                        Base price
                                    </span>
                                    <span className="font-semibold">{formatBDT(tier.basePrice)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className={tier.highlight ? "text-primary-foreground/70" : "text-muted-foreground"}>
                                        Per kg charge
                                    </span>
                                    <span className="font-semibold">{formatBDT(tier.perKgPrice)} / kg</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className={tier.highlight ? "text-primary-foreground/70" : "text-muted-foreground"}>
                                        Express surcharge
                                    </span>
                                    <span className="font-semibold">+{Math.round((tier.expressMult - 1) * 100)}%</span>
                                </div>
                            </div>

                            {/* Example */}
                            <div
                                className={`rounded-xl px-4 py-3 text-xs ${
                                    tier.highlight
                                        ? "bg-primary-foreground/10 text-primary-foreground/80"
                                        : "bg-primary/5 text-muted-foreground"
                                }`}
                            >
                                <span className="font-semibold">Example: </span>
                                {tier.example.weight} kg · {tier.example.priority} →{" "}
                                <span className={`font-bold ${tier.highlight ? "text-primary-foreground" : "text-primary"}`}>
                                    {formatBDT(tier.example.total)}
                                </span>
                            </div>

                            {/* CTA */}
                            <Button
                                asChild
                                variant={tier.highlight ? "secondary" : "default"}
                                className="w-full font-semibold"
                            >
                                <Link href="/register">Get Started</Link>
                            </Button>

                            {/* Features */}
                            <ul className="flex flex-col gap-3">
                                {tier.features.map((f) => (
                                    <li key={f} className="flex items-start gap-2.5 text-sm">
                                        <Check
                                            className={`size-4 flex-shrink-0 mt-0.5 ${
                                                tier.highlight ? "text-primary-foreground" : "text-primary"
                                            }`}
                                        />
                                        <span className={tier.highlight ? "text-primary-foreground/90" : "text-foreground"}>
                                            {f}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Bottom note */}
                <p className="text-center text-sm text-muted-foreground mt-12">
                    Want to check the exact cost before shipping?{" "}
                    <Link href="/register" className="text-primary font-medium hover:underline">
                        Get a free price quote →
                    </Link>
                </p>
            </div>
        </section>
    );
}
