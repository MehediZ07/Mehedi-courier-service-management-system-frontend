import ShipmentBarChart from "@/components/shared/ShipmentBarChart";

interface PageViewStat {
  page: string;
  date: string;
  hour: number;
  userRole: string;
  viewCount: number;
}

interface PageViewsChartProps {
  pageStats: PageViewStat[];
}

export function PageViewsChart({ pageStats }: PageViewsChartProps) {
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date.toISOString().split('T')[0];
  });

  const viewsByDay = last7Days.map(day => {
    const count = pageStats
      .filter(stat => stat.date.startsWith(day))
      .reduce((sum, stat) => sum + stat.viewCount, 0);
    const dayName = new Date(day).toLocaleDateString('en-US', { weekday: 'short' });
    return { name: dayName, value: count };
  });

  return (
    <ShipmentBarChart
      data={viewsByDay}
      title="Page Views Trend"
      description="Last 7 days aggregated page views"
    />
  );
}
