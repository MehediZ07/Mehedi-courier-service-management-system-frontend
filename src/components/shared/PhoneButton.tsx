"use client";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Phone, Copy, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface PhoneButtonProps {
    phone: string;
    label?: string;
    size?: "sm" | "default" | "lg";
}

export function PhoneButton({ phone, label, size = "sm" }: PhoneButtonProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(phone);
        setCopied(true);
        toast.success("Phone number copied");
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button size={size} variant="outline">
                    <Phone className="h-4 w-4" />
                    {label && <span className="ml-1">{label}</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-3">
                <div className="space-y-3">
                    <div>
                        <p className="text-xs text-muted-foreground mb-1">Phone Number</p>
                        <p className="font-mono font-semibold">{phone}</p>
                    </div>
                    <div className="flex gap-2">
                        <Button size="sm" variant="default" className="flex-1" asChild>
                            <a href={`tel:${phone}`}>
                                <Phone className="h-3 w-3 mr-1" />
                                Call Now
                            </a>
                        </Button>
                        <Button size="sm" variant="outline" onClick={handleCopy}>
                            {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                        </Button>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}
