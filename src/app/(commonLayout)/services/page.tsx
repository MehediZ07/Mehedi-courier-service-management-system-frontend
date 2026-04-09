"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Navbar, Footer } from "@/components/modules/Home";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { serviceTiers, serviceHighlights, formatBDT } from "@/lib/servicesData";
import { Search, Check, Calculator, SlidersHorizontal, ArrowUpDown } from "lucide-react";
import { useEffect } from "react";

const REGION_FILTERS = ["ALL", "LOCAL", "NATIONAL", "INTERNATIONAL"] as const;
const SORT_OPTIONS = [
    { label: "Default", value: "default" },
    { label: "Price: Low to High", value: "price_asc" },
    { label: "Price: High to Low", value: "price_desc" },
] as const;

type RegionFilter = (typeof REGION_FILTERS)[number];
type SortOption = (typeof SORT_OPTIONS)[number]["value"];

export default function ServicesPage() {
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [regionFilter, setRegionFilter] = useState<RegionFilter>("ALL");
    const [sort, setSort] = useState<SortOption>("default");
    const [sortOpen, setSortOpen] = useState(false);

    // Simulate brief load for skeleton demo
    useEffect(() => {
        const t = setTimeout(() => setLoading(false), 800);
        return () => clearTimeout(t);
    }, []);

    const filtered = useMemo(() => {
        let result = [...serviceTiers];

        if (regionFilter !== "ALL") {
            result = result.filter((t) => t.region === regionFilter);
        }

        if (search.trim()) {
            const q = search.toLowerCase();
            result = result.filter(
                (t) =>
                    t.label.toLowerCase().includes(q) ||
                    t.description.toLowerCase().includes(q) ||
                    t.region.toLowerCase().includes(q) ||
                    t.coverage.toLowerCase().includes(q)
            );
        }

        if (sort === "price_asc") result.sort((a, b) => a.basePrice - b.basePrice);
        if (sort === "price_desc") result.sort((a, b) => b.basePrice - a.basePrice);

        return result;
    }, [search, regionFilter, sort]);

    const currentSortLabel = SORT_OPTIONS.find((o) => o.value === sort)?.label ?? "Sort";

    return (
        <>
            <Navbar />
            <main className="pt-16">
                {/* Hero */}
                <section className="py-20 bg-gradient-to-br from-background via-secondary/30 to-background">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-3">
                            Delivery Services
                        </p>
                        <h1 className="text-4xl sm:text-5xl font-extrabold text-foreground mb-4">
                            Choose Your Shipping Plan
                        </h1>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                            From same-city express to cross-border shipping — SwiftShip has a plan for every
                            delivery need. Transparent pricing, real-time tracking, no hidden fees.
                        </p>
                        <div className="flex justify-center mt-6">
                            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-5 py-2 text-sm text-primary font-medium">
                                <Calculator className="w-4 h-4" />
                                Base Price + (Weight × Per Kg) + Express Surcharge
                            </div>
                        </div>
                    </div>
                </section>

                {/* Search + Filter + Sort toolbar */}
                <section className="py-8 bg-background border-b border-border sticky top-16 z-40">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                            {/* Search */}
                            <div className="relative flex-1 max-w-sm">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search services..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-9"
                                />
                            </div>

                            {/* Region filters */}
                            <div className="flex items-center gap-1.5 flex-wrap">
                                <SlidersHorizontal className="size-4 text-muted-foreground shrink-0" />
                                {REGION_FILTERS.map((r) => (
                                    <button
                                        key={r}
                                        onClick={() => setRegionFilter(r)}
                                        className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                                            regionFilter === r
                                                ? "bg-primary text-primary-foreground border-primary"
                                                : "border-border text-muted-foreground hover:border-primary hover:text-primary"
                                        }`}
                                    >
                                        {r === "ALL" ? "All Types" : r.charAt(0) + r.slice(1).toLowerCase()}
                                    </button>
                                ))}
                            </div>

                            {/* Sort dropdown */}
                            <div className="relative ml-auto">
                                <button
                                    onClick={() => setSortOpen((v) => !v)}
                                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                                >
                                    <ArrowUpDown className="size-3.5" />
                                    {currentSortLabel}
                                </button>
                                {sortOpen && (
                                    <div className="absolute right-0 top-full mt-1 w-48 rounded-xl border border-border bg-popover shadow-xl p-1 z-50">
                                        {SORT_OPTIONS.map((o) => (
                                            <button
                                                key={o.value}
                                                onClick={() => { setSort(o.value); setSortOpen(false); }}
                                                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between ${
                                                    sort === o.value
                                                        ? "bg-primary/10 text-primary font-medium"
                                                        : "hover:bg-secondary text-foreground"
                                                }`}
                                            >
                                                {o.label}
                                                {sort === o.value && <Check className="size-3.5" />}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Result count */}
                        <p className="text-xs text-muted-foreground mt-3">
                            {loading ? "Loading services..." : `${filtered.length} service${filtered.length !== 1 ? "s" : ""} found`}
                        </p>
                    </div>
                </section>

                {/* Cards grid */}
                <section className="py-16 bg-background">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        {loading ? (
                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="rounded-2xl border border-border p-8 flex flex-col gap-4">
                                        <Skeleton className="h-10 w-10 rounded-xl" />
                                        <Skeleton className="h-4 w-20" />
                                        <Skeleton className="h-6 w-40" />
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-4 w-3/4" />
                                        <div className="space-y-2 mt-2">
                                            <Skeleton className="h-16 w-full rounded-xl" />
                                            <Skeleton className="h-10 w-full rounded-xl" />
                                        </div>
                                        <div className="space-y-2 mt-2">
                                            {[1, 2, 3, 4].map((j) => (
                                                <Skeleton key={j} className="h-4 w-full" />
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : filtered.length === 0 ? (
                            <div className="text-center py-24">
                                <p className="text-muted-foreground text-lg">No services match your search.</p>
                                <Button variant="outline" className="mt-4" onClick={() => { setSearch(""); setRegionFilter("ALL"); }}>
                                    Clear Filters
                                </Button>
                            </div>
                        ) : (
                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
                                {filtered.map((tier) => (
                                    <div
                                        key={tier.region}
                                        className={`relative rounded-2xl border flex flex-col transition-all duration-200 ${
                                            tier.highlight
                                                ? "border-primary bg-primary text-primary-foreground shadow-2xl"
                                                : "border-border bg-card hover:shadow-lg"
                                        }`}
                                    >
                                        {tier.badge && (
                                            <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground text-xs font-bold px-4 py-1 rounded-full shadow whitespace-nowrap">
                                                {tier.badge}
                                            </span>
                                        )}

                                        <div className="p-8 flex flex-col gap-5 flex-1">
                                            {/* Icon + region */}
                                            <div className="flex items-center gap-3">
                                                <div className={`size-11 rounded-xl flex items-center justify-center ${tier.highlight ? "bg-primary-foreground/15" : "bg-primary/10"}`}>
                                                    <tier.icon className={`size-5 ${tier.highlight ? "text-primary-foreground" : "text-primary"}`} />
                                                </div>
                                                <Badge
                                                    variant="outline"
                                                    className={`text-xs font-bold ${tier.highlight ? "border-primary-foreground/30 text-primary-foreground" : "border-primary/30 text-primary"}`}
                                                >
                                                    {tier.region}
                                                </Badge>
                                            </div>

                                            {/* Title + description */}
                                            <div>
                                                <h3 className="text-xl font-extrabold mb-1">{tier.label}</h3>
                                                <p className={`text-sm leading-relaxed ${tier.highlight ? "text-primary-foreground/75" : "text-muted-foreground"}`}>
                                                    {tier.description}
                                                </p>
                                            </div>

                                            {/* Meta info */}
                                            <div className={`rounded-xl p-4 space-y-1.5 text-sm ${tier.highlight ? "bg-primary-foreground/10" : "bg-secondary/60"}`}>
                                                <div className="flex justify-between">
                                                    <span className={tier.highlight ? "text-primary-foreground/70" : "text-muted-foreground"}>Starting from</span>
                                                    <span className="font-bold text-base">{formatBDT(tier.basePrice)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className={tier.highlight ? "text-primary-foreground/70" : "text-muted-foreground"}>Per kg</span>
                                                    <span className="font-semibold">{formatBDT(tier.perKgPrice)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className={tier.highlight ? "text-primary-foreground/70" : "text-muted-foreground"}>Delivery time</span>
                                                    <span className="font-semibold">{tier.deliveryTime}</span>
                                                </div>
                                            </div>

                                            {/* Example */}
                                            <div className={`rounded-xl px-4 py-3 text-xs ${tier.highlight ? "bg-primary-foreground/10 text-primary-foreground/80" : "bg-primary/5 text-muted-foreground"}`}>
                                                <span className="font-semibold">Example: </span>
                                                {tier.example.weight} kg · {tier.example.priority} →{" "}
                                                <span className={`font-bold ${tier.highlight ? "text-primary-foreground" : "text-primary"}`}>
                                                    {formatBDT(tier.example.total)}
                                                </span>
                                            </div>

                                            {/* Features */}
                                            <ul className="flex flex-col gap-2 flex-1">
                                                {tier.features.slice(0, 5).map((f) => (
                                                    <li key={f} className="flex items-start gap-2.5 text-sm">
                                                        <Check className={`size-4 flex-shrink-0 mt-0.5 ${tier.highlight ? "text-primary-foreground" : "text-primary"}`} />
                                                        <span className={tier.highlight ? "text-primary-foreground/90" : "text-foreground"}>{f}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        {/* Action buttons — always at bottom */}
                                        <div className="px-8 pb-8 flex flex-col gap-2">
                                            <Button asChild variant={tier.highlight ? "secondary" : "default"} className="w-full font-semibold">
                                                <Link href={`/services/${tier.slug}`}>View Details</Link>
                                            </Button>
                                            <Button asChild variant="ghost" className={`w-full text-sm ${tier.highlight ? "text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10" : ""}`}>
                                                <Link href="/register">Get Started Free</Link>
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>

                {/* Why SwiftShip highlights */}
                <section className="py-20 bg-secondary/20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-12">
                            <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-3">Why SwiftShip</p>
                            <h2 className="text-3xl font-extrabold text-foreground">Every Plan Includes</h2>
                        </div>
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

                {/* CTA */}
                <section className="py-20 bg-background">
                    <div className="max-w-2xl mx-auto px-4 text-center">
                        <h2 className="text-3xl font-extrabold text-foreground mb-4">Not Sure Which Plan?</h2>
                        <p className="text-muted-foreground mb-8">
                            Use our free price calculator to get an instant quote before you commit.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Button size="lg" asChild><Link href="/register">Start Shipping Free</Link></Button>
                            <Button size="lg" variant="outline" asChild><Link href="/contact">Talk to Us</Link></Button>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}
