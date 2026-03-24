"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, User as UserIcon } from "lucide-react";
import { useGetMe } from "@/hooks/queries";
import { getDefaultDashboardRoute } from "@/lib/authUtils";
import type { User } from "@/types/user.types";
import Image from "next/image";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
  { label: "Testimonials", href: "#testimonials" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { data: userResponse, isLoading, isError } = useGetMe();
  const user = (!isError && userResponse?.data ? userResponse.data : null) as User | null;

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary">
          <Image src="/swiftship-logo.png" alt="SwiftShip" width={172} height={44} className="h-12 w-auto" />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {l.label}
            </a>
          ))}
        </nav>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3">
          {isLoading ? (
            <div className="h-9 w-32 bg-muted animate-pulse rounded-md" />
          ) : user ? (
            <>
              <div className="flex items-center gap-2 text-sm">
                <UserIcon className="size-4" />
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
        <button
          className="md:hidden p-2 rounded-md text-muted-foreground hover:text-foreground"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-border bg-white px-4 py-4 flex flex-col gap-4">
          {navLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              {l.label}
            </a>
          ))}
          <div className="flex flex-col gap-2 pt-2 border-t border-border">
            {isLoading ? (
              <div className="h-9 bg-muted animate-pulse rounded-md" />
            ) : user ? (
              <>
                <div className="flex items-center gap-2 text-sm py-2">
                  <UserIcon className="size-4" />
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
