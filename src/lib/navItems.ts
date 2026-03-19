import { NavSection } from "@/types/dashboard.types";
import { getDefaultDashboardRoute, UserRole } from "./authUtils";

export const getCommonNavItems = (role: UserRole): NavSection[] => {
    const defaultDashboard = getDefaultDashboardRoute(role);
    return [
        {
            items: [
                { title: "Home", href: "/", icon: "Home" },
                { title: "Dashboard", href: defaultDashboard, icon: "LayoutDashboard" },
                { title: "My Profile", href: "/my-profile", icon: "User" },
            ],
        },
        {
            title: "Settings",
            items: [
                { title: "Change Password", href: "/change-password", icon: "Settings" },
            ],
        },
    ];
};

export const adminNavItems: NavSection[] = [
    {
        title: "User Management",
        items: [
            { title: "Admins", href: "/admin/dashboard/admins-management", icon: "Shield" },
            { title: "Couriers", href: "/admin/dashboard/couriers-management", icon: "Bike" },
            { title: "Merchants", href: "/admin/dashboard/merchants-management", icon: "Store" },
            { title: "Users", href: "/admin/dashboard/users-management", icon: "Users" },
        ],
    },
    {
        title: "Operations",
        items: [
            { title: "Shipments", href: "/admin/dashboard/shipments-management", icon: "Package" },
            { title: "Payments", href: "/admin/dashboard/payments-management", icon: "CreditCard" },
            { title: "Pricing", href: "/admin/dashboard/pricing-management", icon: "Tag" },
            { title: "Notifications", href: "/admin/dashboard/notifications", icon: "Bell" },
        ],
    },
];

export const courierNavItems: NavSection[] = [
    {
        title: "Deliveries",
        items: [
            { title: "Available Shipments", href: "/courier/dashboard/available-shipments", icon: "PackageSearch" },
            { title: "My Deliveries", href: "/courier/dashboard/my-deliveries", icon: "PackageCheck" },
        ],
    },
    {
        title: "Account",
        items: [
            { title: "My Earnings", href: "/courier/dashboard/earnings", icon: "Wallet" },
        ],
    },
];

export const merchantNavItems: NavSection[] = [
    {
        title: "Shipments",
        items: [
            { title: "My Shipments", href: "/merchant/dashboard/my-shipments", icon: "Package" },
            { title: "Create Shipment", href: "/merchant/dashboard/create-shipment", icon: "PackagePlus" },
        ],
    },
];

export const userNavItems: NavSection[] = [
    {
        title: "Shipments",
        items: [
            { title: "My Shipments", href: "/dashboard/my-shipments", icon: "Package" },
            { title: "Create Shipment", href: "/dashboard/create-shipment", icon: "PackagePlus" },
            { title: "Track Package", href: "/dashboard/track", icon: "MapPin" },
        ],
    },
    {
        title: "Account",
        items: [
            { title: "Notifications", href: "/dashboard/notifications", icon: "Bell" },
        ],
    },
];

export const getNavItemsByRole = (role: UserRole): NavSection[] => {
    const commonNavItems = getCommonNavItems(role);
    switch (role) {
        case "SUPER_ADMIN":
        case "ADMIN":
            return [...commonNavItems, ...adminNavItems];
        case "COURIER":
            return [...commonNavItems, ...courierNavItems];
        case "MERCHANT":
            return [...commonNavItems, ...merchantNavItems];
        case "USER":
            return [...commonNavItems, ...userNavItems];
    }
};
