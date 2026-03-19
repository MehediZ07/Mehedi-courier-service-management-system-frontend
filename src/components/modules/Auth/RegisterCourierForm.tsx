"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { registerCourierAction } from "@/app/(commonLayout)/(authRouteGroup)/register-courier/_action";
import AppField from "@/components/shared/form/AppField";
import AppSubmitButton from "@/components/shared/form/AppSubmitButton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RegisterCourierInput, registerCourierSchema } from "@/zod/auth.validation";
import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { Eye, EyeOff, Truck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const VEHICLE_TYPES = ["BIKE", "BICYCLE", "CAR", "VAN", "TRUCK"] as const;

const RegisterCourierForm = () => {
    const [serverError, setServerError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    const { mutateAsync, isPending } = useMutation({
        mutationFn: (payload: RegisterCourierInput) => registerCourierAction(payload),
    });

    const form = useForm({
        defaultValues: {
            name: "",
            email: "",
            password: "",
            phone: "",
            vehicleType: "" as RegisterCourierInput["vehicleType"],
            licenseNumber: "",
        },
        onSubmit: async ({ value }) => {
            setServerError(null);
            try {
                const result = await mutateAsync(value) as any;
                if (result && !result.success) {
                    setServerError(result.message || "Registration failed");
                }
            } catch (error: any) {
                setServerError(`Registration failed: ${error.message}`);
            }
        },
    });

    return (
        <Card className="w-full max-w-md mx-auto shadow-md">
            <CardHeader className="text-center">
                <div className="flex justify-center mb-2">
                    <div className="bg-primary/10 p-3 rounded-full">
                        <Truck className="size-7 text-primary" />
                    </div>
                </div>
                <CardTitle className="text-2xl font-bold">Courier Registration</CardTitle>
                <CardDescription>Register your account — an admin will set up your courier profile after review</CardDescription>
            </CardHeader>

            <CardContent>
                <form
                    method="POST"
                    action="#"
                    noValidate
                    onSubmit={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        form.handleSubmit();
                    }}
                    className="space-y-4"
                >
                    <form.Field name="name" validators={{ onChange: registerCourierSchema.shape.name }}>
                        {(field) => <AppField field={field} label="Full Name" placeholder="Enter your full name" />}
                    </form.Field>

                    <form.Field name="email" validators={{ onChange: registerCourierSchema.shape.email }}>
                        {(field) => <AppField field={field} label="Email" type="email" placeholder="Enter your email" />}
                    </form.Field>

                    <form.Field name="password" validators={{ onChange: registerCourierSchema.shape.password }}>
                        {(field) => (
                            <AppField
                                field={field}
                                label="Password"
                                type={showPassword ? "text" : "password"}
                                placeholder="Minimum 6 characters"
                                append={
                                    <Button
                                        type="button"
                                        onClick={() => setShowPassword((v) => !v)}
                                        variant="ghost"
                                        size="icon"
                                    >
                                        {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                                    </Button>
                                }
                            />
                        )}
                    </form.Field>

                    <form.Field name="phone">
                        {(field) => <AppField field={field} label="Phone (optional)" placeholder="+1234567890" />}
                    </form.Field>

                    <form.Field
                        name="vehicleType"
                        validators={{ onChange: registerCourierSchema.shape.vehicleType }}
                    >
                        {(field) => (
                            <div className="space-y-1.5">
                                <Label htmlFor="vehicleType">Vehicle Type</Label>
                                <Select
                                    value={field.state.value}
                                    onValueChange={(val) =>
                                        field.handleChange(val as RegisterCourierInput["vehicleType"])
                                    }
                                >
                                    <SelectTrigger id="vehicleType">
                                        <SelectValue placeholder="Select vehicle type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {VEHICLE_TYPES.map((v) => (
                                            <SelectItem key={v} value={v}>
                                                {v.charAt(0) + v.slice(1).toLowerCase()}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {field.state.meta.isTouched && field.state.meta.errors.length > 0 && (
                                    <p className="text-sm text-destructive">
                                        {String(field.state.meta.errors[0])}
                                    </p>
                                )}
                            </div>
                        )}
                    </form.Field>

                    <form.Field
                        name="licenseNumber"
                        validators={{ onChange: registerCourierSchema.shape.licenseNumber }}
                    >
                        {(field) => (
                            <AppField field={field} label="License Number" placeholder="Enter your license number" />
                        )}
                    </form.Field>

                    {serverError && (
                        <Alert variant="destructive">
                            <AlertDescription>{serverError}</AlertDescription>
                        </Alert>
                    )}

                    <form.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting] as const}>
                        {([canSubmit, isSubmitting]) => (
                            <AppSubmitButton
                                isPending={isSubmitting || isPending}
                                pendingLabel="Registering..."
                                disabled={!canSubmit}
                            >
                                Register as Courier
                            </AppSubmitButton>
                        )}
                    </form.Subscribe>
                </form>
            </CardContent>

            <CardFooter className="flex-col gap-2 border-t pt-4">
                <p className="text-sm text-muted-foreground">
                    Already have an account?{" "}
                    <Link href="/login" className="text-primary font-medium hover:underline underline-offset-4">
                        Sign in
                    </Link>
                </p>
                <p className="text-sm text-muted-foreground">
                    Not a courier?{" "}
                    <Link href="/register" className="text-primary font-medium hover:underline underline-offset-4">
                        Regular registration
                    </Link>
                </p>
            </CardFooter>
        </Card>
    );
};

export default RegisterCourierForm;
