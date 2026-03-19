"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4">
            <div className="bg-destructive/10 p-4 rounded-full">
                <AlertTriangle className="w-10 h-10 text-destructive" />
            </div>
            <h2 className="text-2xl font-bold">Something went wrong</h2>
            <p className="text-muted-foreground max-w-sm">
                {error.message || "An unexpected error occurred. Please try again."}
            </p>
            <Button onClick={reset}>Try Again</Button>
        </div>
    );
}
