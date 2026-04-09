"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Sparkles, RefreshCw, TrendingUp, TrendingDown,
    PackageCheck, Clock, DollarSign, AlertTriangle,
    Target, Zap, Bike, Truck, MapPin, Wallet,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface AIInsight {
    icon: string;
    title: string;
    body: string;
}

const iconMap: Record<string, LucideIcon> = {
    TrendingUp, TrendingDown, PackageCheck, Clock,
    DollarSign, AlertTriangle, Target, Zap,
    Bike, Truck, MapPin, Wallet,
};

const borderColors = [
    "border-l-primary",
    "border-l-emerald-500",
    "border-l-amber-500",
    "border-l-violet-500",
];

const bgColors = [
    "bg-primary/5",
    "bg-emerald-500/5",
    "bg-amber-500/5",
    "bg-violet-500/5",
];

const iconColors = [
    "text-primary",
    "text-emerald-600 dark:text-emerald-400",
    "text-amber-600 dark:text-amber-400",
    "text-violet-600 dark:text-violet-400",
];

interface AIInsightsWidgetProps {
    title?: string;
    description?: string;
    apiEndpoint: string;
    payload: Record<string, unknown>;
    emptyText?: string;
}

export function AIInsightsWidget({
    title = "AI Insights",
    description = "AI-powered analysis based on your live data.",
    apiEndpoint,
    payload,
    emptyText = "Click \"Generate\" to get AI-powered insights about your performance.",
}: AIInsightsWidgetProps) {
    const [insights, setInsights] = useState<AIInsight[]>([]);
    const [loading, setLoading] = useState(false);
    const [generated, setGenerated] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const generate = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(apiEndpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            setInsights(data.insights ?? []);
            setGenerated(true);
        } catch {
            setError("Failed to generate insights. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="border-primary/20">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-base">
                        <div className="size-7 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Sparkles className="size-4 text-primary" />
                        </div>
                        {title}
                    </CardTitle>
                    <Button
                        size="sm"
                        variant={generated ? "outline" : "default"}
                        onClick={generate}
                        disabled={loading}
                        className="gap-1.5 h-8 text-xs"
                    >
                        {loading ? (
                            <RefreshCw className="size-3.5 animate-spin" />
                        ) : generated ? (
                            <RefreshCw className="size-3.5" />
                        ) : (
                            <Sparkles className="size-3.5" />
                        )}
                        {loading ? "Analyzing..." : generated ? "Regenerate" : "Generate"}
                    </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{description}</p>
            </CardHeader>

            <CardContent>
                {/* Empty state */}
                {!generated && !loading && (
                    <div className="flex flex-col items-center justify-center py-8 gap-3 text-center">
                        <div className="size-11 rounded-2xl bg-primary/10 flex items-center justify-center">
                            <TrendingUp className="size-5 text-primary" />
                        </div>
                        <p className="text-xs text-muted-foreground max-w-xs">{emptyText}</p>
                    </div>
                )}

                {/* Skeletons */}
                {loading && (
                    <div className="grid sm:grid-cols-2 gap-3">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="rounded-xl border-l-4 border-l-muted p-4 space-y-2 bg-muted/20">
                                <div className="flex items-center gap-2">
                                    <Skeleton className="size-4 rounded" />
                                    <Skeleton className="h-3.5 w-24" />
                                </div>
                                <Skeleton className="h-3 w-full" />
                                <Skeleton className="h-3 w-4/5" />
                            </div>
                        ))}
                    </div>
                )}

                {/* Error */}
                {error && (
                    <p className="text-sm text-destructive text-center py-4">{error}</p>
                )}

                {/* Insights */}
                {!loading && insights.length > 0 && (
                    <div className="grid sm:grid-cols-2 gap-3">
                        {insights.map((insight, i) => {
                            const Icon = iconMap[insight.icon] ?? TrendingUp;
                            return (
                                <div
                                    key={i}
                                    className={`rounded-xl border-l-4 p-4 ${borderColors[i % borderColors.length]} ${bgColors[i % bgColors.length]}`}
                                >
                                    <div className="flex items-center gap-2 mb-1.5">
                                        <Icon className={`size-4 shrink-0 ${iconColors[i % iconColors.length]}`} />
                                        <p className="text-sm font-semibold text-foreground">{insight.title}</p>
                                    </div>
                                    <p className="text-xs text-muted-foreground leading-relaxed">{insight.body}</p>
                                </div>
                            );
                        })}
                    </div>
                )}

                {generated && !loading && (
                    <p className="text-xs text-muted-foreground text-center mt-4 flex items-center justify-center gap-1">
                        <Sparkles className="size-3" />
                        Generated by AI · Based on your live data
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
