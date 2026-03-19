export interface NavItem {
    title: string;
    href: string;
    icon: string;
}

export interface NavSection {
    title?: string;
    items: NavItem[];
}

export interface DashboardStats {
    totalShipments: number;
    pendingShipments: number;
    deliveredShipments: number;
    totalCouriers: number;
    activeCouriers: number;
    totalRevenue: number;
}

// Legacy aliases for existing components
export type IAdminDashboardData = DashboardStats;

export interface BarChartData {
    name: string;
    value: number;
}

export interface PieChartData {
    name: string;
    value: number;
}
