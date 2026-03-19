import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Package, Truck, MapPin } from "lucide-react";

const stats = [
  { value: "50K+", label: "Shipments Delivered" },
  { value: "2K+", label: "Active Couriers" },
  { value: "500+", label: "Merchant Partners" },
  { value: "99.2%", label: "On-Time Delivery" },
];

export default function HeroSection() {
  return (
    <section className="relative pt-24 pb-20 overflow-hidden bg-gradient-to-br from-background via-secondary/30 to-background">
      {/* Background blobs */}
      <div
        aria-hidden
        className="absolute -top-32 -right-32 size-[600px] rounded-full opacity-20 blur-3xl"
        style={{ background: "oklch(0.52 0.26 295)" }}
      />
      <div
        aria-hidden
        className="absolute -bottom-32 -left-32 size-[500px] rounded-full opacity-15 blur-3xl"
        style={{ background: "oklch(0.72 0.15 195)" }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left — copy */}
          <div className="flex flex-col gap-6">
            <Badge
              variant="secondary"
              className="w-fit gap-1.5 text-primary border border-primary/20 bg-primary/10"
            >
              <Package className="size-3.5" />
              Trusted by 500+ Merchants
            </Badge>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight text-foreground">
              Deliver Faster.{" "}
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage:
                    "linear-gradient(135deg, oklch(0.52 0.26 295), oklch(0.72 0.15 195))",
                }}
              >
                Track Smarter.
              </span>
            </h1>

            <p className="text-lg text-muted-foreground max-w-lg leading-relaxed">
              SwiftShip connects merchants, couriers, and customers on one
              powerful platform. Real-time tracking, instant assignments, and
              seamless payments — all in one place.
            </p>

            <div className="flex flex-wrap gap-3">
              <Button size="lg" className="gap-2" asChild>
                <Link href="/register">
                  Start Shipping Free <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/login">Track a Package</Link>
              </Button>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-border">
              {stats.map((s) => (
                <div key={s.label}>
                  <p className="text-2xl font-bold text-primary">{s.value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right — visual card */}
          <div className="relative flex justify-center lg:justify-end">
            <div className="relative w-full max-w-md">
              {/* Main card */}
              <div className="rounded-2xl border border-border bg-card shadow-2xl p-6 flex flex-col gap-5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-foreground">Live Tracking</span>
                  <span className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                    <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                    In Transit
                  </span>
                </div>

                {/* Tracking progress */}
                <div className="flex flex-col gap-3">
                  {[
                    { label: "Order Placed", done: true },
                    { label: "Picked Up", done: true },
                    { label: "In Transit", done: true, active: true },
                    { label: "Out for Delivery", done: false },
                    { label: "Delivered", done: false },
                  ].map((step, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div
                        className={`size-3 rounded-full flex-shrink-0 ${
                          step.active
                            ? "bg-primary ring-4 ring-primary/20"
                            : step.done
                            ? "bg-primary"
                            : "bg-border"
                        }`}
                      />
                      <span
                        className={`text-sm ${
                          step.active
                            ? "font-semibold text-primary"
                            : step.done
                            ? "text-foreground"
                            : "text-muted-foreground"
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="rounded-xl bg-secondary/50 p-3 flex items-center gap-3">
                  <MapPin className="size-4 text-primary flex-shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Estimated Arrival</p>
                    <p className="text-sm font-semibold text-foreground">Today, 3:00 – 5:00 PM</p>
                  </div>
                </div>
              </div>

              {/* Floating badge */}
              <div className="absolute -top-4 -left-4 bg-primary text-primary-foreground rounded-xl px-3 py-2 shadow-lg flex items-center gap-2 text-sm font-semibold">
                <Truck className="size-4" />
                Express Delivery
              </div>

              {/* Floating courier card */}
              <div className="absolute -bottom-4 -right-4 bg-card border border-border rounded-xl px-3 py-2 shadow-lg flex items-center gap-2">
                <div className="size-8 rounded-full bg-accent/20 flex items-center justify-center text-accent-foreground font-bold text-sm">
                  R
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground">Rider: Rafiq</p>
                  <p className="text-xs text-muted-foreground">⭐ 4.9 · 1.2 km away</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
