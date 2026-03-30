import ShipmentPieChart from "@/components/shared/ShipmentPieChart";

interface Visit {
  userRole?: string;
}

interface UserRoleChartProps {
  recentVisits: Visit[];
}

export function UserRoleChart({ recentVisits }: UserRoleChartProps) {
  const roleCounts: Record<string, number> = {};
  
  recentVisits.forEach(visit => {
    const role = visit.userRole || 'GUEST';
    roleCounts[role] = (roleCounts[role] || 0) + 1;
  });

  const chartData = Object.entries(roleCounts).map(([name, value]) => ({
    name,
    value
  }));

  return (
    <ShipmentPieChart
      data={chartData}
      title="User Distribution"
      description="Visitors by role"
    />
  );
}
