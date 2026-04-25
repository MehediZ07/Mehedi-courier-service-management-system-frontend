import StatsCard from "@/components/shared/StatsCard";

interface AnalyticsStatsProps {
  totalVisits: number;
  todayVisits: number;
  uniqueVisitorsToday: number;
  liveUsers: number;
}

export function AnalyticsStats({ totalVisits, todayVisits, uniqueVisitorsToday, liveUsers }: AnalyticsStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-4">
      <StatsCard
        title="Total Page Views"
        value={totalVisits}
        iconName="Eye"
        description="All time page views"
      />
      <StatsCard
        title="Today's Page Views"
        value={todayVisits}
        iconName="TrendingUp"
        description="Page views today"
      />
      <StatsCard
        title="Unique Visitors Today"
        value={uniqueVisitorsToday}
        iconName="Users"
        description="Unique sessions today"
        className="border-purple-500/20"
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
