import {
  Zap,
  MapPin,
  ShieldCheck,
  CreditCard,
  Bell,
  BarChart3,
  Bike,
  Package,
} from "lucide-react";

const features = [
  {
    icon: MapPin,
    title: "Real-Time Tracking",
    description:
      "Track every shipment live on the map. Customers get instant updates at every stage of delivery.",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    icon: Zap,
    title: "Instant Assignment",
    description:
      "Couriers self-assign available shipments — no dispatcher needed. Faster pickups, happier customers.",
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
  {
    icon: ShieldCheck,
    title: "Secure & Verified",
    description:
      "Every courier is admin-approved. JWT auth, role-based access, and encrypted data keep your business safe.",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    icon: CreditCard,
    title: "Flexible Payments",
    description:
      "Accept COD, Stripe, or SSLCommerz. Automatic payment status updates tied to delivery confirmation.",
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    icon: Bell,
    title: "Smart Notifications",
    description:
      "Automated alerts for every shipment event. Customers always know where their package is.",
    color: "text-purple-600",
    bg: "bg-purple-50",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description:
      "Admins get full visibility — shipment volumes, courier performance, revenue, and more.",
    color: "text-rose-600",
    bg: "bg-rose-50",
  },
  {
    icon: Bike,
    title: "Multi-Vehicle Support",
    description:
      "Bike, bicycle, car, van, or truck — couriers register with their vehicle type for smart matching.",
    color: "text-cyan-600",
    bg: "bg-cyan-50",
  },
  {
    icon: Package,
    title: "Bulk Shipments",
    description:
      "Merchants can create and manage bulk shipments with full history, filtering, and export.",
    color: "text-indigo-600",
    bg: "bg-indigo-50",
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="py-14 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-3">
            Everything You Need
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground mb-4">
            Built for the Modern Courier Business
          </h2>
          <p className="text-muted-foreground text-lg">
            From registration to delivery, SwiftShip handles every step with
            precision and speed.
          </p>
        </div>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className="group rounded-2xl border border-border bg-card p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
            >
              <div className={`size-11 rounded-xl ${f.bg} flex items-center justify-center mb-4`}>
                <f.icon className={`size-5 ${f.color}`} />
              </div>
              <h3 className="font-semibold text-foreground mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
