"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle2, Mail } from "lucide-react";

export default function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
  };

  return (
    <section className="py-12 bg-secondary/30">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">

        {/* Icon */}
        <div suppressHydrationWarning className="inline-flex items-center justify-center size-12 rounded-2xl bg-primary/10 border border-primary/20 mb-5">
          <Mail className="size-5 text-primary" />
        </div>

        <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-2">
          Stay Updated
        </p>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground mb-3">
          Get Shipping Tips & Updates
        </h2>
        <p className="text-muted-foreground mb-7 max-w-md mx-auto">
          Platform updates, new features, and courier industry insights — straight to your inbox.
        </p>

        {submitted ? (
          <div className="inline-flex items-center gap-2.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 font-semibold px-5 py-3 rounded-xl">
            <CheckCircle2 className="size-5 shrink-0" />
            You&apos;re subscribed! We&apos;ll be in touch.
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row gap-2.5 max-w-md mx-auto"
            suppressHydrationWarning
          >
            <Input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1 h-11"
            />
            <Button type="submit" className="shrink-0 h-11 px-6 font-semibold">
              Subscribe
            </Button>
          </form>
        )}

        <p className="text-xs text-muted-foreground mt-4">
          No spam. Unsubscribe anytime. &nbsp;·&nbsp; We respect your privacy.
        </p>
      </div>
    </section>
  );
}
