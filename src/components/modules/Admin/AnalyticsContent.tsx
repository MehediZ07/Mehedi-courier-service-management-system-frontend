"use client";

import { useQuery } from "@tanstack/react-query";
import { getAnalytics } from "@/services/analytics.services";
import { AnalyticsStats } from "@/components/modules/Admin/AnalyticsStats";
import { VisitsDataTable } from "@/components/modules/Admin/VisitsDataTable";
import { VisitorTrendsChart } from "@/components/modules/Admin/VisitorTrendsChart";
import { UserRoleChart } from "@/components/modules/Admin/UserRoleChart";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function AnalyticsContent() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["analytics"],
    queryFn: getAnalytics,
    refetchInterval: 30000,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
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
        <h2 className="text-2xl font-bold tracking-tight">Analytics</h2>
        <p className="text-muted-foreground">Monitor visitor activity and user engagement.</p>
      </div>

      <AnalyticsStats
        totalVisits={data.totalVisits}
        todayVisits={data.todayVisits}
        liveUsers={data.liveUsers}
      />
      
      <div className="grid gap-4 grid-cols-1 md:grid-cols-6">
        <VisitorTrendsChart recentVisits={data.recentVisits} />
        <UserRoleChart recentVisits={data.recentVisits} />
      </div>

      <VisitsDataTable />
    </div>
  );
}
