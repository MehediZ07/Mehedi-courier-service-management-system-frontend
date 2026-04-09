import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Navbar, Footer } from "@/components/modules/Home";
import { Package, Users, Bike, ShieldCheck, Target, TrendingUp } from "lucide-react";

const values = [
  {
    icon: Package,
    title: "Reliability First",
    desc: "Every shipment is tracked end-to-end. We don't consider a delivery done until the customer confirms receipt.",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    icon: Users,
    title: "Community Driven",
    desc: "Our courier network is built on trust. Every rider is admin-verified before they can accept a single delivery.",
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    icon: Bike,
    title: "Empowering Riders",
    desc: "Couriers choose their own hours, pick their own shipments, and track their earnings in real time.",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    icon: ShieldCheck,
    title: "Merchant Success",
    desc: "We give merchants the tools to scale — bulk shipments, settlement tracking, and full delivery visibility.",
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
];

const stats = [
  { icon: Package, value: "50,000+", label: "Shipments Delivered" },
  { icon: Users, value: "500+", label: "Merchant Partners" },
  { icon: Bike, value: "2,000+", label: "Active Couriers" },
  { icon: TrendingUp, value: "99.2%", label: "On-Time Delivery" },
];

const team = [
  { name: "Rafiq Ahmed", role: "Founder & CEO", initials: "RA" },
  { name: "Nadia Islam", role: "Head of Operations", initials: "NI" },
  { name: "Tanvir Hossain", role: "Lead Engineer", initials: "TH" },
  { name: "Sumaiya Begum", role: "Courier Relations", initials: "SB" },
];

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="pt-16">
        {/* Hero */}
        <section className="py-24 bg-gradient-to-br from-background via-secondary/30 to-background">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-3">About SwiftShip</p>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-foreground mb-6">
              Connecting Merchants, Couriers & Customers
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              SwiftShip is a modern courier management platform built to make last-mile delivery
              fast, transparent, and accessible for everyone — from solo merchants to large businesses.
            </p>
          </div>
        </section>

        {/* Stats */}
        <section className="py-14 bg-primary">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
              {stats.map((s) => (
                <div key={s.label} className="flex flex-col items-center gap-2">
                  <s.icon className="size-6 text-primary-foreground/70" />
                  <p className="text-3xl font-extrabold text-white">{s.value}</p>
                  <p className="text-sm text-primary-foreground/80">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Mission */}
        <section className="py-20 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Target className="size-4 text-primary" />
                  <p className="text-sm font-semibold text-primary uppercase tracking-widest">Our Mission</p>
                </div>
                <h2 className="text-3xl font-extrabold text-foreground mb-4">
                  Making Delivery Simple for Everyone
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We started SwiftShip because we saw how fragmented the courier industry was. Merchants
                  struggled to find reliable riders. Couriers had no transparent way to track earnings.
                  Customers had no visibility into where their packages were.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  SwiftShip solves all three problems on one platform — with real-time tracking,
                  self-service courier assignment, dynamic pricing, and automated payments.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {values.map((v) => (
                  <div key={v.title} className="rounded-2xl border border-border bg-card p-5">
                    <div className={`size-10 rounded-xl ${v.bg} flex items-center justify-center mb-3`}>
                      <v.icon className={`size-5 ${v.color}`} />
                    </div>
                    <h3 className="font-semibold text-foreground mb-1 text-sm">{v.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{v.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="py-20 bg-secondary/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-3">Our Team</p>
              <h2 className="text-3xl font-extrabold text-foreground">The People Behind SwiftShip</h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {team.map((member) => (
                <div key={member.name} className="rounded-2xl border border-border bg-card p-6 text-center">
                  <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <span className="text-xl font-bold text-primary">{member.initials}</span>
                  </div>
                  <h3 className="font-semibold text-foreground">{member.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{member.role}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-background">
          <div className="max-w-2xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-extrabold text-foreground mb-4">Ready to Ship with Us?</h2>
            <p className="text-muted-foreground mb-8">Join thousands of merchants and couriers on SwiftShip.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="lg" asChild><Link href="/register">Get Started Free</Link></Button>
              <Button size="lg" variant="outline" asChild><Link href="/contact">Contact Us</Link></Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
