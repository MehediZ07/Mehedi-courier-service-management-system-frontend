"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, Menu, Moon, Sun, X } from "lucide-react";
import { useGetMe } from "@/hooks/queries";
import { getDefaultDashboardRoute } from "@/lib/authUtils";
import type { User } from "@/types/user.types";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";

const navLinks = [
  { label: "Features", href: "/#features" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Services", href: "/services" },
  { label: "Pricing", href: "/#pricing" },
  { label: "Testimonials", href: "/#testimonials" },
  { label: "Become a Courier", href: "/register-courier" },
];

const solutionsMenu = [
  { label: "For Merchants", desc: "Create & manage shipments", href: "/register" },
  { label: "For Couriers", desc: "Earn by delivering packages", href: "/register-courier" },
  { label: "For Businesses", desc: "Bulk shipping & settlements", href: "/register" },
  { label: "Our Services", desc: "View all delivery plans & pricing", href: "/services" },
  { label: "Track a Package", desc: "Real-time shipment tracking", href: "/login" },
];

function SolutionsDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        Solutions <ChevronDown className={`size-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-2 w-64 rounded-xl border border-border bg-popover shadow-xl p-2 z-50">
          {solutionsMenu.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => setOpen(false)}
              className="flex flex-col gap-0.5 rounded-lg px-3 py-2.5 hover:bg-secondary transition-colors"
            >
              <span className="text-sm font-medium text-foreground">{item.label}</span>
              <span className="text-xs text-muted-foreground">{item.desc}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { data: userResponse, isLoading, isError } = useGetMe();
  const user = (!isError && userResponse?.data ? userResponse.data : null) as User | null;
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const trackVisit = async () => {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/analytics/track-guest`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ page: pathname || "/" }),
          credentials: "include",
        });
      } catch {
        // silently ignore
      }
    };
    trackVisit();
  }, [pathname]);

  return (
    <header className={`fixed top-0 inset-x-0 z-50 transition-[border-color,box-shadow,backdrop-filter] duration-300 ${
        scrolled
          ? "bg-background/60 backdrop-blur-md border-b border-border shadow-sm"
          : "bg-transparent backdrop-blur-sm border-b border-transparent"
      }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary">
          <Image src="/swiftship-logo.png" alt="SwiftShip" width={172} height={44} className="h-12 w-auto" />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          <SolutionsDropdown />
          {navLinks.map((l) => (
            l.href.startsWith("/") ? (
              <Link
                key={l.href}
                href={l.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {l.label}
              </Link>
            ) : (
              <a
                key={l.href}
                href={l.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {l.label}
              </a>
            )
          ))}
        </nav>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            className="p-2 rounded-md text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Toggle theme"
          >
            {resolvedTheme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </button>
          {isLoading ? (
            <div className="h-9 w-32 bg-muted animate-pulse rounded-md" />
          ) : user ? (
            <>
              <div className="flex items-center gap-2 text-sm">
                {user.profileImage ? (
                  <div className="h-8 w-8 rounded-full overflow-hidden border border-primary/20">
                    <Image src={user.profileImage} alt={user.name} width={32} height={32} className="object-cover w-full h-full" />
                  </div>
                ) : (
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                    <span className="text-xs font-semibold text-primary">{user.name.charAt(0).toUpperCase()}</span>
                  </div>
                )}
                <span className="font-medium">{user.name}</span>
              </div>
              <Button size="sm" asChild>
                <Link href={getDefaultDashboardRoute(user.role)}>Dashboard</Link>
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">Sign In</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/register">Get Started</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <div className="md:hidden flex items-center gap-1">
          <button
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            className="p-2 rounded-md text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Toggle theme"
          >
            {resolvedTheme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </button>
          <button
            className="p-2 rounded-md text-muted-foreground hover:text-foreground"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-border bg-background px-4 py-4 flex flex-col gap-4">
          {solutionsMenu.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              onClick={() => setOpen(false)}
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              {l.label}
            </Link>
          ))}
          <div className="border-t border-border" />
          {navLinks.map((l) => (
            l.href.startsWith("/") ? (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                {l.label}
              </Link>
            ) : (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                {l.label}
              </a>
            )
          ))}
          <div className="flex flex-col gap-2 pt-2 border-t border-border">
            {isLoading ? (
              <div className="h-9 bg-muted animate-pulse rounded-md" />
            ) : user ? (
              <>
                <div className="flex items-center gap-2 text-sm py-2">
                  {user.profileImage ? (
                    <div className="h-8 w-8 rounded-full overflow-hidden border border-primary/20">
                      <Image src={user.profileImage} alt={user.name} width={32} height={32} className="object-cover w-full h-full" />
                    </div>
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                      <span className="text-xs font-semibold text-primary">{user.name.charAt(0).toUpperCase()}</span>
                    </div>
                  )}
                  <span className="font-medium">{user.name}</span>
                </div>
                <Button size="sm" asChild>
                  <Link href={getDefaultDashboardRoute(user.role)}>Dashboard</Link>
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/register">Get Started</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
