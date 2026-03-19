import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Arif Hossain",
    role: "Merchant — Electronics Store",
    avatar: "AH",
    rating: 5,
    quote:
      "SwiftShip cut our delivery time by 40%. The real-time tracking means our customers never call asking 'where is my order?' anymore. Absolutely game-changing.",
  },
  {
    name: "Nadia Rahman",
    role: "Courier Rider",
    avatar: "NR",
    rating: 5,
    quote:
      "I love that I can choose my own shipments. The app is simple, earnings are transparent, and I get paid on time. Best gig platform I've used.",
  },
  {
    name: "Tanvir Ahmed",
    role: "Operations Manager — Fashion Brand",
    avatar: "TA",
    rating: 5,
    quote:
      "Managing 200+ daily shipments used to be a nightmare. SwiftShip's dashboard gives us full visibility and the bulk shipment feature saves us hours every day.",
  },
  {
    name: "Sumaiya Islam",
    role: "Customer",
    avatar: "SI",
    rating: 5,
    quote:
      "I tracked my package step by step without even logging in. Got a notification when the rider was 10 minutes away. That's the experience I expect.",
  },
  {
    name: "Karim Uddin",
    role: "Courier Rider",
    avatar: "KU",
    rating: 5,
    quote:
      "The approval process was quick and the admin team is responsive. I went from applying to my first delivery in under 2 days.",
  },
  {
    name: "Priya Sharma",
    role: "Merchant — Bakery",
    avatar: "PS",
    rating: 5,
    quote:
      "COD payments are handled automatically when delivery is confirmed. No more chasing payments or manual reconciliation. SwiftShip just works.",
  },
];

function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} className="size-4 fill-amber-400 text-amber-400" />
      ))}
    </div>
  );
}

export default function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-3">
            Loved by Users
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground mb-4">
            What Our Community Says
          </h2>
          <p className="text-muted-foreground text-lg">
            Merchants, couriers, and customers all agree — SwiftShip delivers.
          </p>
        </div>

        {/* Masonry-style grid */}
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="break-inside-avoid rounded-2xl border border-border bg-card p-6 flex flex-col gap-4 hover:shadow-md transition-shadow"
            >
              <Stars count={t.rating} />
              <p className="text-sm text-foreground leading-relaxed">&ldquo;{t.quote}&rdquo;</p>
              <div className="flex items-center gap-3 pt-2 border-t border-border">
                <div className="size-9 rounded-full bg-primary/10 text-primary font-bold text-sm flex items-center justify-center flex-shrink-0">
                  {t.avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
