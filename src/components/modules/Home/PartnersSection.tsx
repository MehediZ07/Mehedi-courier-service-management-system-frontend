import { MapPin, Truck, Globe, Zap, CreditCard, Cloud, Database, Code2, Server } from "lucide-react";

const integrations = [
  { name: "Stripe", category: "Payments", icon: CreditCard },
  { name: "Cloudinary", category: "Media", icon: Cloud },
  { name: "PostgreSQL", category: "Database", icon: Database },
  { name: "Next.js", category: "Frontend", icon: Code2 },
  { name: "Prisma", category: "ORM", icon: Server },
];

const deliveryTypes = [
  { label: "Same-Day Local", icon: MapPin, desc: "Within the same city", color: "text-primary", bg: "bg-primary/10" },
  { label: "National Shipping", icon: Truck, desc: "Across the country", color: "text-blue-600", bg: "bg-blue-50" },
  { label: "International", icon: Globe, desc: "Cross-border delivery", color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "Express Priority", icon: Zap, desc: "Fastest available option", color: "text-amber-600", bg: "bg-amber-50" },
];

export default function PartnersSection() {
  return (
    <section className="py-14 bg-secondary/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-3">
            Integrations & Services
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground mb-4">
            Powered by Best-in-Class Tools
          </h2>
          <p className="text-muted-foreground text-lg">
            SwiftShip integrates with leading payment gateways, cloud services, and delivery networks.
          </p>
        </div>

        {/* Integration badges */}
        <div className="flex flex-wrap justify-center gap-4 mb-10">
          {integrations.map((i) => (
            <div
              key={i.name}
              className="flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 shadow-sm"
            >
              <i.icon className="size-4 text-muted-foreground" />
              <span className="text-sm font-semibold text-foreground">{i.name}</span>
              <span className="text-xs text-muted-foreground bg-secondary rounded-full px-2 py-0.5">{i.category}</span>
            </div>
          ))}
        </div>

        {/* Delivery types */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {deliveryTypes.map((d) => (
            <div
              key={d.label}
              className="rounded-2xl border border-border bg-card p-6 text-center hover:shadow-md transition-shadow"
            >
              <div className={`size-12 rounded-xl ${d.bg} flex items-center justify-center mx-auto mb-4`}>
                <d.icon className={`size-6 ${d.color}`} />
              </div>
              <h3 className="font-semibold text-foreground mb-1">{d.label}</h3>
              <p className="text-sm text-muted-foreground">{d.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
