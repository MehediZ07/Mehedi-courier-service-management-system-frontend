import { Navbar, Footer } from "@/components/modules/Home";
import { ShieldCheck, Lock, Eye, Bell, Trash2, Mail } from "lucide-react";

const sections = [
  {
    icon: Eye,
    title: "Information We Collect",
    content: "We collect information you provide when registering (name, email, phone), shipment data (pickup/delivery addresses, package details), payment information processed securely via Stripe or SSLCommerz, and profile images stored via Cloudinary.",
  },
  {
    icon: Lock,
    title: "How We Use Your Information",
    content: "Your data is used to process and track shipments, assign couriers, calculate pricing, send notifications about your deliveries, and improve platform performance. We do not sell your personal data to third parties.",
  },
  {
    icon: ShieldCheck,
    title: "Data Security",
    content: "All data is transmitted over HTTPS. Passwords are hashed using bcrypt. JWT tokens are used for authentication with short expiry windows. Profile images are stored securely on Cloudinary with access controls.",
  },
  {
    icon: Bell,
    title: "Notifications",
    content: "We send shipment status notifications relevant to your role. You can view and manage notifications from your dashboard. We do not send unsolicited marketing emails without your consent.",
  },
  {
    icon: Trash2,
    title: "Data Retention",
    content: "Shipment records are retained for operational and settlement purposes. You may request account deletion by contacting support. Deleted accounts have their personal data anonymized within 30 days.",
  },
  {
    icon: Mail,
    title: "Contact & Requests",
    content: "For any privacy-related requests including data access, correction, or deletion, contact us at support@swiftship.com. We respond to all requests within 7 business days.",
  },
];

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main className="pt-16">
        <section className="py-20 bg-gradient-to-br from-background via-secondary/30 to-background">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                <ShieldCheck className="size-7 text-primary" />
              </div>
            </div>
            <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-3">Legal</p>
            <h1 className="text-4xl font-extrabold text-foreground mb-4">Privacy Policy</h1>
            <p className="text-muted-foreground">Last updated: January 2025</p>
          </div>
        </section>

        <section className="py-16 bg-background">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-muted-foreground leading-relaxed mb-10">
              SwiftShip is committed to protecting your privacy. This policy explains what data we collect,
              how we use it, and your rights regarding your personal information.
            </p>
            <div className="flex flex-col gap-8">
              {sections.map((s) => (
                <div key={s.title} className="flex gap-4">
                  <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                    <s.icon className="size-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-foreground mb-2">{s.title}</h2>
                    <p className="text-muted-foreground leading-relaxed text-sm">{s.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
