import Link from "next/link";
import { Twitter, Github, Linkedin, Mail } from "lucide-react";
import Image from "next/image";

const footerLinks = {
  Product: [
    { label: "Features", href: "/#features" },
    { label: "How It Works", href: "/#how-it-works" },
    { label: "Services", href: "/services" },
    { label: "Pricing", href: "/#pricing" },
    { label: "Track a Package", href: "/login" },
  ],
  Company: [
    { label: "About Us", href: "/about" },
    { label: "Contact Us", href: "/contact" },
    { label: "Register as Courier", href: "/register-courier" },
    { label: "Sign Up", href: "/register" },
  ],
  Support: [
    { label: "Login", href: "/login" },
    { label: "Register", href: "/register" },
    { label: "Become a Courier", href: "/register-courier" },
    { label: "Forgot Password", href: "/forgot-password" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "About Us", href: "/about" },
    { label: "Contact", href: "/contact" },
  ],
};

const socials = [
  { icon: Twitter, href: "https://twitter.com", label: "Twitter" },
  { icon: Github, href: "https://github.com", label: "GitHub" },
  { icon: Linkedin, href: "https://linkedin.com", label: "LinkedIn" },
  { icon: Mail, href: "mailto:support@swiftship.com", label: "Email" },
];

export default function Footer() {
  return (
    <footer className="bg-neutral-950 text-neutral-100 dark:bg-neutral-950 dark:text-neutral-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top */}
        <div className="py-14 grid grid-cols-2 md:grid-cols-6 gap-10">
          {/* Brand */}
          <div className="col-span-2 flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary">
              <Image src="/swiftship-logo.png" alt="SwiftShip" width={172} height={44} className="h-12 w-auto" />
            </Link>
            <p className="text-sm text-white/50 leading-relaxed max-w-xs">
              The modern courier management platform connecting merchants, riders, and customers
              seamlessly.
            </p>
            {/* Socials */}
            <div className="flex gap-3 mt-2">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="size-9 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                >
                  <s.icon className="size-4 text-white/70" />
                </a>
              ))}
            </div>
            {/* Contact */}
            <div className="flex flex-col gap-1 mt-2 text-sm text-white/50">
              <a href="mailto:support@swiftship.com" className="hover:text-white transition-colors">support@swiftship.com</a>
              <a href="tel:+8801700000000" className="hover:text-white transition-colors">+880 1700-000000</a>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([group, links]) => (
            <div key={group} className="flex flex-col gap-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-white/40">
                {group}
              </p>
              <ul className="flex flex-col gap-2">
                {links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-sm text-white/60 hover:text-white transition-colors"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-white/40">
          <p>© {new Date().getFullYear()} SwiftShip. All rights reserved.</p>
          <p>
            Built with love for the courier industry · Powered by{" "}
            <span className="text-white/60">Next.js & Prisma</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
