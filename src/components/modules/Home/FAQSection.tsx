"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, MessageCircle, Mail, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGetMe } from "@/hooks/useAuth";
import { getDefaultDashboardRoute } from "@/lib/authUtils";

const faqs = [
  {
    category: "Pricing",
    q: "How does shipment pricing work?",
    a: "Pricing is calculated automatically based on your pickup and delivery cities (region type), package weight, and priority. No manual input needed — the price appears live as you fill in the form.",
  },
  {
    category: "Couriers",
    q: "How do I become a courier on SwiftShip?",
    a: "Register via the 'Become a Courier' page with your vehicle details and license number. An admin reviews and approves your application, usually within 24 hours. Once approved, you can go online and start accepting shipments.",
  },
  {
    category: "Payments",
    q: "What payment methods are supported?",
    a: "We support Cash on Delivery (COD), Stripe for online card payments, and SSLCommerz for local payment methods. COD is automatically marked as paid when the shipment is delivered.",
  },
  {
    category: "Tracking",
    q: "Can I track my shipment without logging in?",
    a: "Yes. Enter your tracking number on the Track page — no account required. You'll see the full status timeline, courier info, and estimated delivery.",
  },
  {
    category: "Delivery",
    q: "What is a hub-based delivery?",
    a: "For national shipments, packages travel through regional hubs. Each leg of the journey is assigned to a local courier. You can track every leg in real time.",
  },
  {
    category: "Couriers",
    q: "How does COD settlement work for couriers?",
    a: "When a courier collects cash on delivery, it's tracked as pending COD. Admins settle the amount periodically, and couriers can view their full settlement history in their dashboard.",
  },
  {
    category: "Merchants",
    q: "Can merchants manage multiple shipments?",
    a: "Yes. Merchants have a dedicated dashboard to create, track, and manage all their shipments. Bulk shipment history, filtering, and settlement tracking are all included.",
  },
  {
    category: "Platform",
    q: "Is there a mobile-friendly interface?",
    a: "Absolutely. SwiftShip is fully responsive across mobile, tablet, and desktop. Couriers can manage their deliveries from any device.",
  },
];

const categoryColors: Record<string, string> = {
  Pricing:  "bg-primary/10 text-primary border-primary/20",
  Couriers: "bg-cyan-500/10 text-cyan-700 border-cyan-500/20 dark:text-cyan-400",
  Payments: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20 dark:text-emerald-400",
  Tracking: "bg-violet-500/10 text-violet-700 border-violet-500/20 dark:text-violet-400",
  Delivery: "bg-amber-500/10 text-amber-700 border-amber-500/20 dark:text-amber-400",
  Merchants:"bg-rose-500/10 text-rose-700 border-rose-500/20 dark:text-rose-400",
  Platform: "bg-sky-500/10 text-sky-700 border-sky-500/20 dark:text-sky-400",
};

export default function FAQSection() {
  const [open, setOpen] = useState<number | null>(0);
  const router = useRouter();
  const { data: userData } = useGetMe();
  const user = userData?.data;

  const handleGetStarted = () => {
    if (user) {
      router.push(getDefaultDashboardRoute(user.role));
    } else {
      router.push("/register");
    }
  };

  const left  = faqs.filter((_, i) => i % 2 === 0);
  const right = faqs.filter((_, i) => i % 2 !== 0);

  return (
    <section id="faq" className="pb-14 pt-6 bg-secondary/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-3">FAQ</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-muted-foreground text-lg">
            Everything you need to know about SwiftShip. Can&apos;t find an answer?{" "}
            <Link href="/contact" className="text-primary font-medium hover:underline underline-offset-4">
              Contact us
            </Link>
            .
          </p>
        </div>

        {/* Two-column accordion */}
        <div className="grid lg:grid-cols-2 gap-4">
          {/* Left column */}
          <div className="flex flex-col gap-4">
            {left.map((faq) => {
              const i = faqs.indexOf(faq);
              return <FAQItem key={i} faq={faq} index={i} open={open} setOpen={setOpen} />;
            })}
          </div>
          {/* Right column */}
          <div className="flex flex-col gap-4">
            {right.map((faq) => {
              const i = faqs.indexOf(faq);
              return <FAQItem key={i} faq={faq} index={i} open={open} setOpen={setOpen} />;
            })}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-10 rounded-2xl border border-border bg-card p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
              <MessageCircle className="size-6 text-primary" />
            </div>
            <div>
              <p className="font-bold text-foreground">Still have questions?</p>
              <p className="text-sm text-muted-foreground mt-0.5">
                Our support team is available Sat–Thu, 9am–6pm.
              </p>
            </div>
          </div>
          <div className="flex gap-3 shrink-0">
            <Button variant="outline" className="gap-2" asChild>
              <a href="mailto:support@swiftship.com">
                <Mail className="size-4" />
                Email Support
              </a>
            </Button>
            <Button className="gap-2" onClick={handleGetStarted}>
              {user ? "Go to Dashboard" : "Get Started Free"}
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </div>

      </div>
    </section>
  );
}

function FAQItem({
  faq,
  index,
  open,
  setOpen,
}: {
  faq: (typeof faqs)[0];
  index: number;
  open: number | null;
  setOpen: (i: number | null) => void;
}) {
  const isOpen = open === index;
  const color = categoryColors[faq.category] ?? "bg-primary/10 text-primary border-primary/20";

  return (
    <div
      className={`rounded-2xl border bg-card overflow-hidden transition-shadow duration-200 ${
        isOpen ? "border-primary/30 shadow-md shadow-primary/5" : "border-border hover:border-border/80 hover:shadow-sm"
      }`}
    >
      <button
        onClick={() => setOpen(isOpen ? null : index)}
        className="w-full flex items-start justify-between px-5 py-4 text-left gap-4 group"
      >
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {/* Number badge */}
          <span className={`shrink-0 mt-0.5 size-6 rounded-full flex items-center justify-center text-xs font-bold border ${
            isOpen ? "bg-primary text-primary-foreground border-primary" : "bg-muted text-muted-foreground border-border"
          } transition-colors`}>
            {String(index + 1).padStart(2, "0")}
          </span>
          <div className="flex flex-col gap-1.5 min-w-0">
            {/* Category badge */}
            <span className={`self-start text-xs font-semibold px-2 py-0.5 rounded-full border ${color}`}>
              {faq.category}
            </span>
            <span className={`text-sm font-semibold leading-snug ${isOpen ? "text-primary" : "text-foreground"} transition-colors`}>
              {faq.q}
            </span>
          </div>
        </div>
        <ChevronDown
          className={`size-4 text-muted-foreground shrink-0 mt-1 transition-transform duration-300 ${isOpen ? "rotate-180 text-primary" : ""}`}
        />
      </button>

      {/* Answer — CSS max-height transition */}
      <div
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{ maxHeight: isOpen ? "200px" : "0px" }}
      >
        <div className="px-5 pb-5 pt-0">
          <div className="ml-9 pl-0.5 border-l-2 border-primary/20 pl-4">
            <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
