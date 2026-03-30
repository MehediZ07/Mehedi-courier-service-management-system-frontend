import ShipmentBarChart from "@/components/shared/ShipmentBarChart";

interface Visit {
  createdAt: string;
}

interface VisitorTrendsChartProps {
  recentVisits: Visit[];
}

export function VisitorTrendsChart({ recentVisits }: VisitorTrendsChartProps) {
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date.toISOString().split('T')[0];
  });

  const visitsByDay = last7Days.map(day => {
    const count = recentVisits.filter(v => v.createdAt.startsWith(day)).length;
    const dayName = new Date(day).toLocaleDateString('en-US', { weekday: 'short' });
    return { name: dayName, value: count };
  });

  return (
    <ShipmentBarChart
      data={visitsByDay}
      title="Visitor Trends"
      description="Last 7 days visitor activity"
    />
  );
}
