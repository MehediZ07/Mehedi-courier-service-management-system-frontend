import { Navbar, Footer } from "@/components/modules/Home";
import { FileText, UserCheck, Package, CreditCard, AlertTriangle, Scale } from "lucide-react";

const sections = [
  {
    icon: UserCheck,
    title: "Account Responsibilities",
    content: "You are responsible for maintaining the confidentiality of your account credentials. You must provide accurate information during registration. Accounts found to be fraudulent or in violation of these terms may be suspended or permanently banned.",
  },
  {
    icon: Package,
    title: "Shipment Rules",
    content: "Users and merchants may not ship prohibited items including illegal goods, hazardous materials, or counterfeit products. SwiftShip reserves the right to refuse or cancel any shipment that violates these rules. Accurate package weight and dimensions must be provided.",
  },
  {
    icon: CreditCard,
    title: "Payments & Settlements",
    content: "All payments are processed securely via Stripe or SSLCommerz. COD amounts collected by couriers are held pending admin settlement. Merchants receive settlements after delivery confirmation minus applicable service fees.",
  },
  {
    icon: UserCheck,
    title: "Courier Obligations",
    content: "Couriers must maintain accurate availability status. Accepting a shipment leg creates an obligation to complete it. Repeated cancellations or failed deliveries without valid reason may result in account suspension.",
  },
  {
    icon: AlertTriangle,
    title: "Limitation of Liability",
    content: "SwiftShip is not liable for delays caused by force majeure, incorrect addresses provided by users, or third-party payment failures. Our liability for any shipment is limited to the declared shipment value up to a maximum of 5,000 BDT.",
  },
  {
    icon: Scale,
    title: "Governing Law",
    content: "These terms are governed by the laws of Bangladesh. Any disputes arising from the use of SwiftShip shall be resolved through binding arbitration in Dhaka, Bangladesh, unless otherwise required by applicable law.",
  },
];

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main className="pt-16">
        <section className="py-20 bg-gradient-to-br from-background via-secondary/30 to-background">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                <FileText className="size-7 text-primary" />
              </div>
            </div>
            <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-3">Legal</p>
            <h1 className="text-4xl font-extrabold text-foreground mb-4">Terms of Service</h1>
            <p className="text-muted-foreground">Last updated: January 2025</p>
          </div>
        </section>

        <section className="py-16 bg-background">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-muted-foreground leading-relaxed mb-10">
              By using SwiftShip, you agree to these Terms of Service. Please read them carefully.
              These terms apply to all users including merchants, couriers, and customers.
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
