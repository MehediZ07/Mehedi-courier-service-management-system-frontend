"use client";

import { useQuery } from "@tanstack/react-query";
import { getAnalytics, getPageStats } from "@/services/analytics.services";
import { AnalyticsStats } from "@/components/modules/Admin/AnalyticsStats";
import { VisitsDataTable } from "@/components/modules/Admin/VisitsDataTable";
import { PageViewsChart } from "@/components/modules/Admin/PageViewsChart";
import { UserRoleChart } from "@/components/modules/Admin/UserRoleChart";
import { AIInsightsCard } from "@/components/modules/Admin/AIInsightsCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function AnalyticsContent() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["analytics"],
    queryFn: getAnalytics,
    refetchInterval: 30000,
  });

  const { data: pageStats } = useQuery({
    queryKey: ["pageStats"],
    queryFn: () => getPageStats({ days: 7 }),
    refetchInterval: 60000,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500">
        Error loading analytics: {error instanceof Error ? error.message : 'Unknown error'}
      </div>
    );
  }

  if (!data) {
    return <div>No analytics data available</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Analytics Dashboard</h2>
        <p className="text-muted-foreground">Monitor visitor activity, page views, and user engagement with session-based tracking.</p>
      </div>

      <AnalyticsStats
        totalVisits={data.totalVisits}
        todayVisits={data.todayVisits}
        uniqueVisitorsToday={data.uniqueVisitorsToday}
        liveUsers={data.liveUsers}
      />

      <AIInsightsCard
        analytics={{
          totalVisits: data.totalVisits,
          todayVisits: data.todayVisits,
          uniqueVisitorsToday: data.uniqueVisitorsToday,
          liveUsers: data.liveUsers,
        }}
      />
      
      <div className="grid gap-4 grid-cols-1 md:grid-cols-6">
        <PageViewsChart pageStats={pageStats || []} />
        <UserRoleChart recentVisits={data.recentVisits} />
      </div>

      <VisitsDataTable />
    </div>
  );
}
