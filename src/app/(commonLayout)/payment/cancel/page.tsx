"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";

export default function PaymentCancelPage() {
    const router = useRouter();

    return (
        <div className="container max-w-md mx-auto py-20">
            <Card>
                <CardHeader>
                    <CardTitle className="text-center">Payment Cancelled</CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                    <XCircle className="w-16 h-16 mx-auto text-orange-500" />
                    <p className="text-muted-foreground">
                        You cancelled the payment. Your shipment was not created.
                    </p>
                    <div className="flex gap-2 justify-center">
                        <Button variant="outline" onClick={() => router.push("/dashboard")}>
                            Go to Dashboard
                        </Button>
                        <Button onClick={() => router.push("/dashboard/create-shipment")}>
                            Try Again
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
