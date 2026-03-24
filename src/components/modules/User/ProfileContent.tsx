"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User } from "@/types/user.types";
import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { uploadProfileImage } from "@/services/user.services";
import { toast } from "sonner";
import { Camera, Loader2 } from "lucide-react";
import Image from "next/image";

interface ProfileContentProps {
    user: User;
}

export default function ProfileContent({ user }: ProfileContentProps) {
    const [previewUrl, setPreviewUrl] = useState<string | null>(user.profileImage || null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const queryClient = useQueryClient();

    const { mutate: uploadImage, isPending } = useMutation({
        mutationFn: (file: File) => uploadProfileImage(user.id, file),
        onSuccess: (data) => {
            toast.success("Profile image updated successfully");
            setPreviewUrl(data.data.profileImage);
            queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
        },
        onError: (error: Error) => {
            toast.error(error.message || "Failed to upload image");
        },
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith("image/")) {
            toast.error("Please select an image file");
            return;
        }

        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error("Image size should be less than 5MB");
            return;
        }

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviewUrl(reader.result as string);
        };
        reader.readAsDataURL(file);

        // Upload image
        uploadImage(file);
    };

    const handleButtonClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">My Profile</h1>
                <p className="text-muted-foreground text-sm">Your account information.</p>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            {previewUrl ? (
                                <div className="h-20 w-20 rounded-full overflow-hidden border-2 border-primary/20">
                                    <Image
                                        src={previewUrl}
                                        alt={user.name}
                                        width={80}
                                        height={80}
                                        className="object-cover w-full h-full"
                                    />
                                </div>
                            ) : (
                                <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/20">
                                    <span className="text-3xl font-bold text-primary">
                                        {user.name.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                            )}
                            <button
                                onClick={handleButtonClick}
                                disabled={isPending}
                                className="absolute bottom-0 right-0 h-7 w-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:opacity-80 transition-opacity disabled:opacity-50"
                                title="Upload profile image"
                            >
                                {isPending ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Camera className="h-4 w-4" />
                                )}
                            </button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                        </div>
                        <div>
                            <CardTitle>{user.name}</CardTitle>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Role</span>
                        <Badge variant="outline" className="capitalize">
                            {user.role.toLowerCase().replace("_", " ")}
                        </Badge>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Status</span>
                        <Badge variant={user.status === "ACTIVE" ? "default" : "secondary"}>
                            {user.status}
                        </Badge>
                    </div>
                    {user.phone && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Phone</span>
                            <span>{user.phone}</span>
                        </div>
                    )}
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Member since</span>
                        <span>{new Date(user.createdAt).toLocaleDateString()}</span>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Profile Image Guidelines</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-2">
                    <ul className="list-disc list-inside space-y-1">
                        <li>Supported formats: JPG, PNG, GIF</li>
                        <li>Maximum file size: 5MB</li>
                        <li>Recommended: Square image (1:1 ratio)</li>
                        <li>Click the camera icon to upload</li>
                    </ul>
                </CardContent>
            </Card>
        </div>
    );
}
