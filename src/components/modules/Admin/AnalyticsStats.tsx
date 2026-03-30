import StatsCard from "@/components/shared/StatsCard";

interface AnalyticsStatsProps {
  totalVisits: number;
  todayVisits: number;
  liveUsers: number;
}

export function AnalyticsStats({ totalVisits, todayVisits, liveUsers }: AnalyticsStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <StatsCard
        title="Total Visitors"
        value={totalVisits}
        iconName="Eye"
        description="All time visitors"
      />
      <StatsCard
        title="Today's Visitors"
        value={todayVisits}
        iconName="TrendingUp"
        description="Visitors today"
      />
      <StatsCard
        title="Live Users"
        value={liveUsers}
        iconName="Activity"
        description="Last 5 minutes"
        className="border-green-500/20"
      />
    </div>
  );
}
