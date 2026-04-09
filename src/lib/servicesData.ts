import { MapPin, Truck, Globe, Zap, ShieldCheck, Bell, CreditCard, PackageCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface ServiceTier {
    region: "LOCAL" | "NATIONAL" | "INTERNATIONAL";
    slug: string;
    label: string;
    icon: LucideIcon;
    tagline: string;
    description: string;
    highlight: boolean;
    badge?: string;
    basePrice: number;
    perKgPrice: number;
    expressMult: number;
    deliveryTime: string;
    coverage: string;
    example: { weight: number; priority: string; total: number };
    features: string[];
    specs: { label: string; value: string }[];
    useCases: string[];
}

export const serviceTiers: ServiceTier[] = [
    {
        region: "LOCAL",
        slug: "local",
        label: "Local Delivery",
        icon: MapPin,
        tagline: "Same-city, same-day speed.",
        description:
            "Perfect for businesses and individuals shipping within the same city. Fast turnaround, affordable rates, and real-time tracking from pickup to doorstep.",
        highlight: false,
        basePrice: 50,
        perKgPrice: 20,
        expressMult: 1.2,
        deliveryTime: "Same day – 24 hrs",
        coverage: "Within same city",
        example: { weight: 2, priority: "STANDARD", total: 90 },
        features: [
            "Same city delivery",
            "Standard & Express priority",
            "Real-time tracking",
            "Cash on delivery (COD)",
            "Online payment support",
            "Proof of delivery",
            "Shipment event log",
            "Customer support",
        ],
        specs: [
            { label: "Base Price", value: "50 BDT" },
            { label: "Per Kg Charge", value: "20 BDT / kg" },
            { label: "Express Surcharge", value: "+20%" },
            { label: "Coverage", value: "Same city" },
            { label: "Delivery Time", value: "Same day – 24 hrs" },
            { label: "Max Weight", value: "Up to 50 kg" },
            { label: "Payment Methods", value: "COD, Stripe, SSLCommerz" },
            { label: "Tracking", value: "Real-time" },
        ],
        useCases: [
            "E-commerce same-city orders",
            "Restaurant & food delivery",
            "Document courier",
            "Retail store deliveries",
        ],
    },
    {
        region: "NATIONAL",
        slug: "national",
        label: "National Delivery",
        icon: Truck,
        tagline: "Reach every city across the country.",
        description:
            "Ship packages between any two cities nationwide. Our hub-based multi-leg delivery network ensures your package travels safely and efficiently across the country.",
        highlight: true,
        badge: "Most Popular",
        basePrice: 100,
        perKgPrice: 30,
        expressMult: 1.25,
        deliveryTime: "1 – 3 business days",
        coverage: "All cities nationwide",
        example: { weight: 5, priority: "EXPRESS", total: 312.5 },
        features: [
            "Different city delivery",
            "Standard & Express priority",
            "Real-time tracking",
            "Cash on delivery (COD)",
            "Stripe & SSLCommerz payments",
            "Proof of delivery",
            "Courier self-assignment",
            "Automatic notifications",
        ],
        specs: [
            { label: "Base Price", value: "100 BDT" },
            { label: "Per Kg Charge", value: "30 BDT / kg" },
            { label: "Express Surcharge", value: "+25%" },
            { label: "Coverage", value: "All cities nationwide" },
            { label: "Delivery Time", value: "1 – 3 business days" },
            { label: "Max Weight", value: "Up to 100 kg" },
            { label: "Payment Methods", value: "COD, Stripe, SSLCommerz" },
            { label: "Tracking", value: "Multi-leg real-time" },
        ],
        useCases: [
            "Inter-city e-commerce orders",
            "Bulk merchant shipments",
            "B2B product distribution",
            "National retail chains",
        ],
    },
    {
        region: "INTERNATIONAL",
        slug: "international",
        label: "International Delivery",
        icon: Globe,
        tagline: "Cross-border shipping made simple.",
        description:
            "Send packages across borders with full tracking, customs handling support, and multiple payment options. Ideal for businesses expanding beyond national borders.",
        highlight: false,
        basePrice: 500,
        perKgPrice: 150,
        expressMult: 1.5,
        deliveryTime: "5 – 14 business days",
        coverage: "Cross-border",
        example: { weight: 3, priority: "STANDARD", total: 950 },
        features: [
            "Cross-border delivery",
            "Standard & Express priority",
            "Real-time tracking",
            "All payment methods",
            "Proof of delivery",
            "Customs handling support",
            "Shipment insurance option",
            "Dedicated customer support",
        ],
        specs: [
            { label: "Base Price", value: "500 BDT" },
            { label: "Per Kg Charge", value: "150 BDT / kg" },
            { label: "Express Surcharge", value: "+50%" },
            { label: "Coverage", value: "Cross-border" },
            { label: "Delivery Time", value: "5 – 14 business days" },
            { label: "Max Weight", value: "Up to 200 kg" },
            { label: "Payment Methods", value: "All methods" },
            { label: "Tracking", value: "Full international tracking" },
        ],
        useCases: [
            "Export businesses",
            "Cross-border e-commerce",
            "International B2B trade",
            "Overseas personal shipments",
        ],
    },
];

export const serviceHighlights = [
    { icon: ShieldCheck, title: "Admin-Verified Couriers", desc: "Every courier is approved before they can accept a single delivery." },
    { icon: Bell, title: "Automatic Notifications", desc: "Customers get real-time alerts at every shipment status change." },
    { icon: CreditCard, title: "Flexible Payments", desc: "COD, Stripe, and SSLCommerz — pay the way that works for you." },
    { icon: PackageCheck, title: "Proof of Delivery", desc: "Photo proof captured at delivery for every shipment." },
    { icon: Zap, title: "Express Priority", desc: "Need it faster? Add express priority for guaranteed speed." },
    { icon: Truck, title: "Multi-Leg Routing", desc: "Hub-based routing ensures national packages reach any city." },
];

export function formatBDT(amount: number) {
    return `${amount % 1 === 0 ? amount : amount.toFixed(2)} BDT`;
}
