import { Button } from "@/components/ui/button";
import { Package } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4">
            <div className="bg-primary/10 p-4 rounded-full">
                <Package className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-6xl font-bold text-primary">404</h1>
            <h2 className="text-2xl font-semibold">Page Not Found</h2>
            <p className="text-muted-foreground max-w-sm">
                The page you&apos;re looking for doesn&apos;t exist or has been moved.
            </p>
            <Button asChild>
                <Link href="/">Return Home</Link>
            </Button>
        </div>
    );
}
