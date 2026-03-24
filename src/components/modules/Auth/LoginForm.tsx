"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { loginAction } from "@/app/(commonLayout)/(authRouteGroup)/login/_action";
import AppField from "@/components/shared/form/AppField";
import AppSubmitButton from "@/components/shared/form/AppSubmitButton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginInput, loginSchema } from "@/zod/auth.validation";
import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { Eye, EyeOff, Package } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import Image from "next/image";

interface LoginFormProps {
    redirectPath?: string;
}

const LoginForm = ({ redirectPath }: LoginFormProps) => {
    const [serverError, setServerError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    const { mutateAsync, isPending } = useMutation({
        mutationFn: (payload: LoginInput) => loginAction(payload, redirectPath),
    });

    const form = useForm({
        defaultValues: { email: "", password: "" },
        onSubmit: async ({ value }) => {
            setServerError(null);
            try {
                const result = await mutateAsync(value) as any;
                if (result?.success && result?.redirectTo) {
                    // Small delay to ensure cookies are set before redirect
                    await new Promise(resolve => setTimeout(resolve, 100));
                    // Use window.location for hard navigation to ensure cookies are sent
                    window.location.href = result.redirectTo;
                } else if (!result?.success) {
                    setServerError(result?.message || "Login failed");
                }
            } catch (error: any) {
                setServerError(`Login failed: ${error.message}`);
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
                <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
                <CardDescription>Sign in to your SwiftShip account</CardDescription>
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
                    <form.Field name="email" validators={{ onChange: loginSchema.shape.email }}>
                        {(field) => (
                            <AppField field={field} label="Email" type="email" placeholder="Enter your email" />
                        )}
                    </form.Field>

                    <form.Field name="password" validators={{ onChange: loginSchema.shape.password }}>
                        {(field) => (
                            <AppField
                                field={field}
                                label="Password"
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter your password"
                                append={
                                    <Button
                                        type="button"
                                        onClick={() => setShowPassword((v) => !v)}
                                        variant="ghost"
                                        size="icon"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="size-4" />
                                        ) : (
                                            <Eye className="size-4" />
                                        )}
                                    </Button>
                                }
                            />
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
                                pendingLabel="Signing in..."
                                disabled={!canSubmit}
                            >
                                Sign In
                            </AppSubmitButton>
                        )}
                    </form.Subscribe>
                </form>
            </CardContent>

            <CardFooter className="flex-col gap-2 border-t pt-4">
                <p className="text-sm text-muted-foreground">
                    Don&apos;t have an account?{" "}
                    <Link href="/register" className="text-primary font-medium hover:underline underline-offset-4">
                        Create account
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

export default LoginForm;
