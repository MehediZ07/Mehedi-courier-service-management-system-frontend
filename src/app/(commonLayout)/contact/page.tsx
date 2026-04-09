"use client";

import { useState } from "react";
import { Navbar, Footer } from "@/components/modules/Home";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, Phone, MapPin, Clock, CheckCircle2 } from "lucide-react";

const contactInfo = [
  {
    icon: Mail,
    label: "Email",
    value: "support@swiftship.com",
    href: "mailto:support@swiftship.com",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    icon: Phone,
    label: "Phone",
    value: "+880 1700-000000",
    href: "tel:+8801700000000",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    icon: MapPin,
    label: "Address",
    value: "Dhaka, Bangladesh",
    href: "#",
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    icon: Clock,
    label: "Support Hours",
    value: "Sat–Thu, 9am–6pm",
    href: "#",
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
];

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setSubmitted(true);
  };

  return (
    <>
      <Navbar />
      <main className="pt-16">
        {/* Hero */}
        <section className="py-20 bg-gradient-to-br from-background via-secondary/30 to-background">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-3">Contact Us</p>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-foreground mb-4">
              We&apos;re Here to Help
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Have a question about shipping, courier registration, or your account? Reach out and we&apos;ll get back to you quickly.
            </p>
          </div>
        </section>

        {/* Content */}
        <section className="py-20 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12">
              {/* Contact info */}
              <div className="flex flex-col gap-6">
                <div>
                  <h2 className="text-2xl font-extrabold text-foreground mb-2">Get in Touch</h2>
                  <p className="text-muted-foreground">
                    Whether you&apos;re a merchant, courier, or customer — our team is ready to assist.
                  </p>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  {contactInfo.map((c) => (
                    <Card key={c.label}>
                      <CardContent className="pt-5 flex items-start gap-3">
                        <div className={`size-10 rounded-xl ${c.bg} flex items-center justify-center shrink-0`}>
                          <c.icon className={`size-5 ${c.color}`} />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{c.label}</p>
                          <a href={c.href} className="text-sm font-semibold text-foreground hover:text-primary transition-colors">
                            {c.value}
                          </a>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Form */}
              <div className="rounded-2xl border border-border bg-card p-8">
                {submitted ? (
                  <div className="flex flex-col items-center justify-center h-full gap-4 py-12 text-center">
                    <CheckCircle2 className="size-12 text-emerald-500" />
                    <h3 className="text-xl font-bold text-foreground">Message Sent!</h3>
                    <p className="text-muted-foreground">We&apos;ll get back to you within 24 hours.</p>
                    <Button variant="outline" onClick={() => { setSubmitted(false); setForm({ name: "", email: "", subject: "", message: "" }); }}>
                      Send Another
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <h2 className="text-xl font-bold text-foreground mb-2">Send a Message</h2>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="name">Full Name</Label>
                        <Input id="name" placeholder="Your name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" placeholder="your@email.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="subject">Subject</Label>
                      <Input id="subject" placeholder="How can we help?" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="message">Message</Label>
                      <Textarea id="message" placeholder="Describe your issue or question..." rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required />
                    </div>
                    <Button type="submit" className="w-full">Send Message</Button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
