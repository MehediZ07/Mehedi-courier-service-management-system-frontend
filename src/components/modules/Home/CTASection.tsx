import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Bike, Store } from "lucide-react";

export default function CTASection() {
  return (
    <section className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className="relative rounded-3xl overflow-hidden p-10 sm:p-16 text-center"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.22 0.08 295) 0%, oklch(0.35 0.18 295) 50%, oklch(0.28 0.12 260) 100%)",
          }}
        >
          {/* Background glow */}
          <div
            aria-hidden
            className="absolute top-0 right-0 size-80 rounded-full opacity-20 blur-3xl"
            style={{ background: "oklch(0.72 0.15 195)" }}
          />
          <div
            aria-hidden
            className="absolute bottom-0 left-0 size-64 rounded-full opacity-15 blur-3xl"
            style={{ background: "oklch(0.52 0.26 295)" }}
          />

          <div className="relative flex flex-col items-center gap-6 max-w-3xl mx-auto">
            <p className="text-sm font-semibold uppercase tracking-widest text-white/60">
              Join SwiftShip Today
            </p>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white leading-tight">
              Ready to Ship Smarter?
            </h2>
            <p className="text-lg text-white/70 max-w-xl leading-relaxed">
              Whether you&apos;re a merchant looking to scale deliveries or a rider ready to earn —
              SwiftShip has a place for you.
            </p>

            {/* Dual CTA */}
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Button
                size="lg"
                className="gap-2 bg-white text-primary hover:bg-white/90 font-semibold"
                asChild
              >
                <Link href="/register">
                  <Store className="size-4" />
                  Start as Merchant
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="gap-2 border-white/30 hover:text-white hover:bg-white/10 font-semibold"
                asChild
              >
                <Link href="/register">
                  <Bike className="size-4" />
                  Become a Courier
                </Link>
              </Button>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap justify-center gap-6 pt-4 text-white/50 text-sm">
              <span>✓ Free to start</span>
              <span>✓ No credit card required</span>
              <span>✓ Cancel anytime</span>
              <span>✓ Setup in 5 minutes</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
