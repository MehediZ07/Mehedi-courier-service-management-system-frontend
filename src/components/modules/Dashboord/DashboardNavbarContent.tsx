"use client";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { NavSection } from "@/types/dashboard.types";
import { UserInfo } from "@/types/user.types";
import { Menu } from "lucide-react";
import { useEffect, useState } from "react";
import DashboardMobileSidebar from "./DashboardMobileSidebar";
import NotificationDropdown from "./NotificationDropdown";
import UserDropdown from "./UserDropdown";
import { usePathname } from "next/navigation";

interface DashboardNavbarProps {
  userInfo: UserInfo;
  navItems: NavSection[];
  dashboardHome: string;
}

const DashboardNavbarContent = ({ dashboardHome, navItems, userInfo }: DashboardNavbarProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();

  // Detect mobile screen
  useEffect(() => {
    const checkSmallerScreen = () => setIsMobile(window.innerWidth < 768);
    checkSmallerScreen();
    window.addEventListener("resize", checkSmallerScreen);
    return () => window.removeEventListener("resize", checkSmallerScreen);
  }, []);

  // Track visits
  useEffect(() => {
    const trackVisit = async () => {
      try {
        const token = document.cookie
          .split('; ')
          .find(row => row.startsWith('accessToken='))
          ?.split('=')[1];

        await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/analytics/track`, {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            ...(token && { "Authorization": `Bearer ${token}` })
          },
          body: JSON.stringify({ page: pathname }),
          credentials: "include",
        });
      } catch (error) {
        console.error("Failed to track visit:", error);
      }
    };

    trackVisit();
  }, [pathname]);

  return (
    <div className="flex items-center gap-4 w-full px-4 py-3 border-b bg-background">
      {/* Mobile Menu */}
      <Sheet open={isOpen && isMobile} onOpenChange={setIsOpen}>
        <SheetTrigger asChild className="md:hidden">
          <Button variant="outline" size="icon">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>

        <SheetContent side="left" className="w-64 p-0">
          <DashboardMobileSidebar
            userInfo={userInfo}
            dashboardHome={dashboardHome}
            navItems={navItems}
          />
        </SheetContent>
      </Sheet>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right Actions */}
      <div className="flex items-center gap-2">
        <NotificationDropdown />
        <UserDropdown userInfo={userInfo} />
      </div>
    </div>
  );
};

export default DashboardNavbarContent;