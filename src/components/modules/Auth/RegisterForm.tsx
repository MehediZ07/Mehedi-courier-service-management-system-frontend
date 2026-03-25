"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { registerAction } from "@/app/(commonLayout)/(authRouteGroup)/register/_action";
import AppField from "@/components/shared/form/AppField";
import AppSubmitButton from "@/components/shared/form/AppSubmitButton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RegisterInput, registerSchema } from "@/zod/auth.validation";
import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import Image from "next/image";

const RegisterForm = () => {
    const [serverError, setServerError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    const { mutateAsync, isPending } = useMutation({
        mutationFn: (payload: RegisterInput) => registerAction(payload),
    });

    const form = useForm({
        defaultValues: { name: "", email: "", password: "", phone: "", role: "USER" as "USER" | "MERCHANT" },
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
                    <div className="m-3 rounded-full">
                     <Image src="/swiftship-logo.png" alt="SwiftShip" width={172} height={44} className="h-12 w-auto" />
                    </div>
                </div>
                <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
                <CardDescription>Join SwiftShip to send and track packages</CardDescription>
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
                    <form.Field name="name" validators={{ onChange: registerSchema.shape.name }}>
                        {(field) => (
                            <AppField field={field} label="Full Name" placeholder="Enter your full name" />
                        )}
                    </form.Field>

                    <form.Field name="email" validators={{ onChange: registerSchema.shape.email }}>
                        {(field) => (
                            <AppField field={field} label="Email" type="email" placeholder="Enter your email" />
                        )}
                    </form.Field>

                    <form.Field name="password" validators={{ onChange: registerSchema.shape.password }}>
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
                        {(field) => (
                            <AppField field={field} label="Phone (optional)" placeholder="+1234567890" />
                        )}
                    </form.Field>

                    <form.Field name="role">
                        {(field) => (
                            <div className="space-y-1.5">
                                <Label htmlFor="role">Account Type</Label>
                                <Select
                                    value={field.state.value}
                                    onValueChange={(val) => field.handleChange(val as "USER" | "MERCHANT")}
                                >
                                    <SelectTrigger id="role">
                                        <SelectValue placeholder="Select account type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="USER">User — Send packages</SelectItem>
                                        <SelectItem value="MERCHANT">Merchant — Business account</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
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
                                pendingLabel="Creating account..."
                                disabled={!canSubmit}
                            >
                                Create Account
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
                    Want to deliver?{" "}
                    <Link href="/register-courier" className="text-primary font-medium hover:underline underline-offset-4">
                        Register as Courier
                    </Link>
                </p>
            </CardFooter>
        </Card>
    );
};

export default RegisterForm;
