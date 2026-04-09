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
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import Image from "next/image";



interface LoginFormProps {
    redirectPath?: string;
}

const LoginForm = ({ redirectPath }: LoginFormProps) => {
    const [serverError, setServerError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    const demoCredentials = [
        { label: "Super Admin", email: "superadmin@courier.com", password: "Password@123" },
        { label: "Admin", email: "admin@courier.com", password: "Password@123" },
        { label: "Courier", email: "rahim.courier@example.com", password: "Password@123" },
        { label: "Merchant", email: "fatima@shopbd.com", password: "Password@123" },
        { label: "User", email: "ayesha@example.com", password: "Password@123" },
    ];

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
                {/* Demo credentials */}
			  {/* Google Button */}
              <button
                type="button"
                className="w-full flex items-center justify-center gap-3 border border-gray-200 dark:border-slate-600 rounded-xl py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors mb-5"
              >
                <svg width="20" height="20" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59a14.5 14.5 0 0 1 0-9.18l-7.98-6.19a24.01 24.01 0 0 0 0 21.56l7.98-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
                Continue with Google
              </button>
                <div className="mb-4">
                    <p className="text-xs text-muted-foreground mb-2 font-medium">Quick fill demo credentials:</p>
                    <div className="flex flex-wrap gap-1.5">
                        {demoCredentials.map((cred) => (
                            <Button
                                key={cred.label}
                                type="button"
                                variant="outline"
                                size="sm"
                                className="text-xs h-7 px-2"
                                onClick={() => {
                                    form.setFieldValue("email", cred.email);
                                    form.setFieldValue("password", cred.password);
                                }}
                            >
                                {cred.label}
                            </Button>
                        ))}
                    </div>
                </div>
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
