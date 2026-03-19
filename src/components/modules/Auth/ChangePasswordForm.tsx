"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import AppField from "@/components/shared/form/AppField";
import AppSubmitButton from "@/components/shared/form/AppSubmitButton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { changePasswordService } from "@/services/auth.services";
import { ChangePasswordInput, changePasswordSchema } from "@/zod/auth.validation";
import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { KeyRound } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function ChangePasswordForm() {
    const [serverError, setServerError] = useState<string | null>(null);

    const { mutateAsync, isPending } = useMutation({
        mutationFn: (payload: { oldPassword: string; newPassword: string }) =>
            changePasswordService(payload),
        onSuccess: () => {
            toast.success("Password changed successfully!");
            form.reset();
        },
        onError: (e: Error) => setServerError(e.message),
    });

    const form = useForm({
        defaultValues: { oldPassword: "", newPassword: "", confirmPassword: "" },
        onSubmit: async ({ value }: { value: ChangePasswordInput }) => {
            setServerError(null);
            const parsed = changePasswordSchema.safeParse(value);
            if (!parsed.success) {
                setServerError(parsed.error.issues[0].message);
                return;
            }
            try {
                await mutateAsync({ oldPassword: value.oldPassword, newPassword: value.newPassword });
            } catch (e: any) {
                setServerError(e.message);
            }
        },
    });

    return (
        <div className="max-w-md space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Change Password</h1>
                <p className="text-muted-foreground text-sm">Update your account password.</p>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <KeyRound className="w-5 h-5 text-primary" />
                        <CardTitle className="text-base">New Password</CardTitle>
                    </div>
                    <CardDescription>Enter your current password and choose a new one.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form
                        onSubmit={(e) => { e.preventDefault(); form.handleSubmit(); }}
                        className="space-y-4"
                    >
                        <form.Field name="oldPassword" validators={{ onChange: changePasswordSchema.shape.oldPassword }}>
                            {(field) => <AppField field={field} label="Current Password" type="password" placeholder="Enter current password" />}
                        </form.Field>

                        <form.Field name="newPassword" validators={{ onChange: changePasswordSchema.shape.newPassword }}>
                            {(field) => <AppField field={field} label="New Password" type="password" placeholder="Minimum 6 characters" />}
                        </form.Field>

                        <form.Field name="confirmPassword" validators={{ onChange: changePasswordSchema.shape.confirmPassword }}>
                            {(field) => <AppField field={field} label="Confirm New Password" type="password" placeholder="Repeat new password" />}
                        </form.Field>

                        {serverError && (
                            <Alert variant="destructive">
                                <AlertDescription>{serverError}</AlertDescription>
                            </Alert>
                        )}

                        <form.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting] as const}>
                            {([canSubmit, isSubmitting]) => (
                                <AppSubmitButton isPending={isSubmitting || isPending} pendingLabel="Changing..." disabled={!canSubmit}>
                                    Change Password
                                </AppSubmitButton>
                            )}
                        </form.Subscribe>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
