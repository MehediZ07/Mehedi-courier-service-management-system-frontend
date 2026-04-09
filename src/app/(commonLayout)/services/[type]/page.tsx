import { notFound } from "next/navigation";
import Link from "next/link";
import { Navbar, Footer } from "@/components/modules/Home";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { serviceTiers, serviceHighlights, formatBDT } from "@/lib/servicesData";
import { Check, ArrowRight, Calculator, ArrowLeft } from "lucide-react";

interface Props {
    params: Promise<{ type: string }>;
}

export function generateStaticParams() {
    return serviceTiers.map((t) => ({ type: t.slug }));
}

export default async function ServiceDetailPage({ params }: Props) {
    const { type } = await params;
    const tier = serviceTiers.find((t) => t.slug === type);
    if (!tier) notFound();

    const related = serviceTiers.filter((t) => t.slug !== type);

    return (
        <>
            <Navbar />
            <main className="pt-16">
                {/* Breadcrumb */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
                    <Link href="/services" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors">
                        <ArrowLeft className="size-3.5" />
                        All Services
                    </Link>
                </div>

                {/* Hero */}
                <section className="py-16 bg-gradient-to-br from-background via-secondary/30 to-background">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid lg:grid-cols-2 gap-12 items-center">
                            {/* Left */}
                            <div className="flex flex-col gap-5">
                                <div className="flex items-center gap-3">
                                    <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                                        <tier.icon className="size-7 text-primary" />
                                    </div>
                                    <Badge variant="outline" className="text-xs font-bold border-primary/30 text-primary">
                                        {tier.region}
                                    </Badge>
                                    {tier.badge && (
                                        <Badge className="bg-accent text-accent-foreground text-xs font-bold">
                                            {tier.badge}
                                        </Badge>
                                    )}
                                </div>

                                <div>
                                    <h1 className="text-4xl sm:text-5xl font-extrabold text-foreground mb-3">
                                        {tier.label}
                                    </h1>
                                    <p className="text-xl text-primary font-medium mb-4">{tier.tagline}</p>
                                    <p className="text-lg text-muted-foreground leading-relaxed">{tier.description}</p>
                                </div>

                                <div className="flex flex-wrap gap-3 pt-2">
                                    <Button size="lg" className="gap-2" asChild>
                                        <Link href="/register">
                                            Get Started Free <ArrowRight className="size-4" />
                                        </Link>
                                    </Button>
                                    <Button size="lg" variant="outline" asChild>
                                        <Link href="/contact">Talk to Sales</Link>
                                    </Button>
                                </div>
                            </div>

                            {/* Right — price card */}
                            <div className={`rounded-2xl border p-8 flex flex-col gap-5 ${tier.highlight ? "border-primary bg-primary text-primary-foreground shadow-2xl" : "border-border bg-card shadow-lg"}`}>
                                <p className={`text-xs font-bold uppercase tracking-widest ${tier.highlight ? "text-primary-foreground/60" : "text-primary"}`}>
                                    Pricing Overview
                                </p>

                                <div className="space-y-3 text-sm">
                                    {[
                                        { label: "Base Price", value: formatBDT(tier.basePrice) },
                                        { label: "Per Kg Charge", value: `${formatBDT(tier.perKgPrice)} / kg` },
                                        { label: "Express Surcharge", value: `+${Math.round((tier.expressMult - 1) * 100)}%` },
                                        { label: "Delivery Time", value: tier.deliveryTime },
                                        { label: "Coverage", value: tier.coverage },
                                    ].map((row) => (
                                        <div key={row.label} className="flex justify-between items-center py-2 border-b border-border/30 last:border-0">
                                            <span className={tier.highlight ? "text-primary-foreground/70" : "text-muted-foreground"}>{row.label}</span>
                                            <span className="font-semibold">{row.value}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className={`rounded-xl px-4 py-3 text-sm ${tier.highlight ? "bg-primary-foreground/10" : "bg-primary/5"}`}>
                                    <div className="flex items-center gap-2 mb-1">
                                        <Calculator className="size-4 text-primary" />
                                        <span className="font-semibold text-foreground">Example Calculation</span>
                                    </div>
                                    <p className={tier.highlight ? "text-primary-foreground/80" : "text-muted-foreground"}>
                                        {tier.example.weight} kg · {tier.example.priority} →{" "}
                                        <span className={`font-bold text-base ${tier.highlight ? "text-primary-foreground" : "text-primary"}`}>
                                            {formatBDT(tier.example.total)}
                                        </span>
                                    </p>
                                </div>

                                <Button asChild variant={tier.highlight ? "secondary" : "default"} className="w-full font-semibold">
                                    <Link href="/register">Start Shipping Now</Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Overview / Description */}
                <section className="py-16 bg-background">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid lg:grid-cols-2 gap-12">
                            {/* Features */}
                            <div>
                                <h2 className="text-2xl font-extrabold text-foreground mb-6">What&apos;s Included</h2>
                                <ul className="space-y-3">
                                    {tier.features.map((f) => (
                                        <li key={f} className="flex items-start gap-3">
                                            <div className="size-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                                                <Check className="size-3 text-primary" />
                                            </div>
                                            <span className="text-foreground">{f}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Use cases */}
                            <div>
                                <h2 className="text-2xl font-extrabold text-foreground mb-6">Best For</h2>
                                <div className="grid sm:grid-cols-2 gap-4">
                                    {tier.useCases.map((uc, i) => (
                                        <div key={i} className="rounded-xl border border-border bg-card p-4 flex items-start gap-3">
                                            <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                                <span className="text-xs font-bold text-primary">{String(i + 1).padStart(2, "0")}</span>
                                            </div>
                                            <p className="text-sm font-medium text-foreground">{uc}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Key Specs */}
                <section className="py-16 bg-secondary/20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h2 className="text-2xl font-extrabold text-foreground mb-8">Key Specifications</h2>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {tier.specs.map((spec) => (
                                <div key={spec.label} className="rounded-xl border border-border bg-card p-5">
                                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">{spec.label}</p>
                                    <p className="text-lg font-bold text-foreground">{spec.value}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Platform highlights */}
                <section className="py-16 bg-background">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h2 className="text-2xl font-extrabold text-foreground mb-8">Platform Features</h2>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {serviceHighlights.map((h) => (
                                <div key={h.title} className="rounded-2xl border border-border bg-card p-6 flex gap-4">
                                    <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                        <h.icon className="size-5 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-foreground mb-1">{h.title}</h3>
                                        <p className="text-sm text-muted-foreground">{h.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Related services */}
                <section className="py-16 bg-secondary/20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-extrabold text-foreground">Other Services</h2>
                            <Link href="/services" className="text-sm text-primary font-medium hover:underline flex items-center gap-1">
                                View all <ArrowRight className="size-3.5" />
                            </Link>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-6">
                            {related.map((r) => (
                                <div key={r.region} className="rounded-2xl border border-border bg-card p-6 flex gap-5 items-start hover:shadow-md transition-shadow">
                                    <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                        <r.icon className="size-6 text-primary" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-bold text-foreground">{r.label}</h3>
                                            <Badge variant="outline" className="text-xs border-primary/30 text-primary">{r.region}</Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground mb-3">{r.description}</p>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-semibold text-foreground">From {formatBDT(r.basePrice)}</span>
                                            <Button size="sm" variant="outline" asChild>
                                                <Link href={`/services/${r.slug}`}>
                                                    View Details <ArrowRight className="size-3.5 ml-1" />
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section className="py-20 bg-background">
                    <div
                        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 rounded-3xl overflow-hidden p-10 sm:p-16 text-center"
                        style={{ background: "linear-gradient(135deg, oklch(0.22 0.08 295) 0%, oklch(0.35 0.18 295) 50%, oklch(0.28 0.12 260) 100%)" }}
                    >
                        <p className="text-sm font-semibold uppercase tracking-widest text-white/60 mb-3">Ready to Ship?</p>
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
                            Start with {tier.label} Today
                        </h2>
                        <p className="text-lg text-white/70 max-w-xl mx-auto mb-8">
                            Create your free account and ship your first package in minutes. No credit card required.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button size="lg" className="bg-white text-primary hover:bg-white/90 font-semibold gap-2" asChild>
                                <Link href="/register">
                                    Get Started Free <ArrowRight className="size-4" />
                                </Link>
                            </Button>
                            <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 font-semibold" asChild>
                                <Link href="/services">Compare All Plans</Link>
                            </Button>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}
