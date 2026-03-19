import { UserPlus, PackagePlus, Bike, CheckCircle2 } from "lucide-react";

const merchantSteps = [
  {
    icon: UserPlus,
    step: "01",
    title: "Create Account",
    description: "Register as a merchant and set up your business profile in minutes.",
  },
  {
    icon: PackagePlus,
    step: "02",
    title: "Create Shipment",
    description: "Enter pickup & delivery details, package info, and choose your payment method.",
  },
  {
    icon: Bike,
    step: "03",
    title: "Courier Assigned",
    description: "An approved courier self-assigns your shipment and heads to pickup.",
  },
  {
    icon: CheckCircle2,
    step: "04",
    title: "Delivered & Paid",
    description: "Customer receives the package. Payment is confirmed automatically.",
  },
];

const courierSteps = [
  {
    step: "01",
    title: "Apply Online",
    description: "Register as a courier with your vehicle details and license number.",
  },
  {
    step: "02",
    title: "Get Approved",
    description: "Admin reviews and approves your application — usually within 24 hours.",
  },
  {
    step: "03",
    title: "Go Online",
    description: "Toggle your availability and browse open shipments near you.",
  },
  {
    step: "04",
    title: "Earn Money",
    description: "Accept shipments, deliver, and track your earnings in real time.",
  },
];

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-24 bg-secondary/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-3">
            Simple Process
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground mb-4">
            How SwiftShip Works
          </h2>
          <p className="text-muted-foreground text-lg">
            Whether you&apos;re a merchant shipping goods or a courier earning income — it&apos;s
            straightforward.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Merchant flow */}
          <div>
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-sm font-semibold px-4 py-1.5 rounded-full mb-8">
              For Merchants & Customers
            </div>
            <div className="flex flex-col gap-6">
              {merchantSteps.map((s, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="size-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm flex-shrink-0">
                      {s.step}
                    </div>
                    {i < merchantSteps.length - 1 && (
                      <div className="w-px flex-1 bg-border mt-2" />
                    )}
                  </div>
                  <div className="pb-6">
                    <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                      <s.icon className="size-4 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-1">{s.title}</h3>
                    <p className="text-sm text-muted-foreground">{s.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Courier flow */}
          <div>
            <div className="inline-flex items-center gap-2 bg-accent/20 text-accent-foreground text-sm font-semibold px-4 py-1.5 rounded-full mb-8">
              For Couriers / Riders
            </div>
            <div className="flex flex-col gap-6">
              {courierSteps.map((s, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className="size-10 rounded-full text-accent-foreground flex items-center justify-center font-bold text-sm flex-shrink-0"
                      style={{ background: "oklch(0.72 0.15 195)" }}
                    >
                      {s.step}
                    </div>
                    {i < courierSteps.length - 1 && (
                      <div className="w-px flex-1 bg-border mt-2" />
                    )}
                  </div>
                  <div className="pb-6">
                    <h3 className="font-semibold text-foreground mb-1">{s.title}</h3>
                    <p className="text-sm text-muted-foreground">{s.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
