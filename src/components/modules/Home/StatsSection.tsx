"use client";

import { useEffect, useRef, useState } from "react";
import { Package, Bike, Store, Users, TrendingUp, Clock, Zap } from "lucide-react";

const stats = [
  {
    icon: Package,
    target: 50000,
    suffix: "+",
    label: "Shipments Delivered",
    sub: "Across all regions",
    accent: "bg-primary/10 border-primary/20",
    bar: "bg-primary",
    iconColor: "text-primary",
  },
  {
    icon: Bike,
    target: 2000,
    suffix: "+",
    label: "Active Couriers",
    sub: "Bikes, cars & more",
    accent: "bg-cyan-500/10 border-cyan-500/20",
    bar: "bg-cyan-500",
    iconColor: "text-cyan-600 dark:text-cyan-400",
  },
  {
    icon: Store,
    target: 500,
    suffix: "+",
    label: "Merchant Partners",
    sub: "Businesses trust us",
    accent: "bg-violet-500/10 border-violet-500/20",
    bar: "bg-violet-500",
    iconColor: "text-violet-600 dark:text-violet-400",
  },
  {
    icon: TrendingUp,
    target: 99.2,
    suffix: "%",
    label: "On-Time Delivery",
    sub: "Industry-leading rate",
    accent: "bg-emerald-500/10 border-emerald-500/20",
    bar: "bg-emerald-500",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    decimal: true,
  },
  {
    icon: Users,
    target: 10000,
    suffix: "+",
    label: "Happy Customers",
    sub: "Across the country",
    accent: "bg-amber-500/10 border-amber-500/20",
    bar: "bg-amber-500",
    iconColor: "text-amber-600 dark:text-amber-400",
  },
  {
    icon: Clock,
    target: 24,
    suffix: "/7",
    label: "Platform Uptime",
    sub: "Always available",
    accent: "bg-rose-500/10 border-rose-500/20",
    bar: "bg-rose-500",
    iconColor: "text-rose-600 dark:text-rose-400",
  },
];

function useCountUp(target: number, duration = 1800, decimal = false, triggered = false) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!triggered) return;
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = eased * target;
      setCount(decimal ? Math.round(current * 10) / 10 : Math.floor(current));
      if (progress < 1) requestAnimationFrame(tick);
      else setCount(target);
    };

    requestAnimationFrame(tick);
  }, [triggered, target, duration, decimal]);

  return count;
}

function StatCard({ s, triggered, index }: { s: typeof stats[0]; triggered: boolean; index: number }) {
  const count = useCountUp(s.target, 1600 + index * 100, (s as { decimal?: boolean }).decimal, triggered);
  const display = (s as { decimal?: boolean }).decimal
    ? count.toFixed(1)
    : count >= 1000
    ? count.toLocaleString()
    : count.toString();

  return (
    <div
      className="group rounded-2xl border border-border bg-card p-6 flex items-start gap-4 hover:-translate-y-1 hover:shadow-lg transition-all duration-200 cursor-default"
    >
      <div className={`size-11 rounded-xl border flex items-center justify-center shrink-0 ${s.accent}`}>
        <s.icon className={`size-5 ${s.iconColor}`} />
      </div>

      <div className="flex flex-col gap-0.5 flex-1">
        <p className="text-3xl font-extrabold text-foreground leading-none tabular-nums">
          {display}{s.suffix}
        </p>
        <p className="text-sm font-semibold text-foreground mt-1">{s.label}</p>
        <p className="text-xs text-muted-foreground">{s.sub}</p>
      </div>

      <div className={`self-stretch w-1 rounded-full opacity-30 group-hover:opacity-60 transition-opacity ${s.bar}`} />
    </div>
  );
}

export default function StatsSection() {
  const [triggered, setTriggered] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setTriggered(true); observer.disconnect(); } },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className="py-14 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-4">
            <Zap className="size-3.5 text-primary" />
            <span className="text-xs font-semibold text-primary uppercase tracking-widest">
              Platform at a Glance
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground">
            Numbers That Speak for Themselves
          </h2>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
            SwiftShip powers thousands of deliveries every day — connecting merchants, couriers, and customers seamlessly.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {stats.map((s, i) => (
            <StatCard key={s.label} s={s} triggered={triggered} index={i} />
          ))}
        </div>

      </div>
    </section>
  );
}
