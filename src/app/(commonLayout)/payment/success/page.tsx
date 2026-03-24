"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { confirmStripePayment } from "@/services/payment.services";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2 } from "lucide-react";

export default function PaymentSuccessPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

    useEffect(() => {
        const sessionId = searchParams.get("session_id");
        if (!sessionId) {
            setTimeout(() => setStatus("error"), 0);
            return;
        }

        confirmStripePayment({ sessionId })
            .then(() => setStatus("success"))
            .catch(() => setStatus("error"));
    }, [searchParams]);

    return (
        <div className="container max-w-md mx-auto py-20">
            <Card>
                <CardHeader>
                    <CardTitle className="text-center">
                        {status === "loading" && "Processing Payment..."}
                        {status === "success" && "Payment Successful!"}
                        {status === "error" && "Payment Failed"}
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                    {status === "loading" && <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />}
                    {status === "success" && (
                        <>
                            <CheckCircle className="w-16 h-16 mx-auto text-green-500" />
                            <p className="text-muted-foreground">Your payment has been confirmed. Your shipment is being processed.</p>
                            <Button onClick={() => router.push("/dashboard")}>Go to Dashboard</Button>
                        </>
                    )}
                    {status === "error" && (
                        <>
                            <p className="text-destructive">Failed to confirm payment. Please contact support.</p>
                            <Button onClick={() => router.push("/dashboard")}>Go to Dashboard</Button>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
