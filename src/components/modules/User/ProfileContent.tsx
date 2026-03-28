"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User } from "@/types/user.types";
import { ApiResponse } from "@/types/api.types";
import { useState, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { uploadProfileImage } from "@/services/user.services";
import { getMyCourierProfile, updateMyCourierProfile } from "@/services/courier.services";
import { getHubCities } from "@/services/hub.services";
import { toast } from "sonner";
import { Camera, Loader2, Edit2 } from "lucide-react";
import Image from "next/image";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface ProfileContentProps {
    user: User;
}

export default function ProfileContent({ user }: ProfileContentProps) {
    const [previewUrl, setPreviewUrl] = useState<string | null>(user.profileImage || null);
    const [editCity, setEditCity] = useState(false);
    const [selectedCity, setSelectedCity] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);
    const queryClient = useQueryClient();
    const router = useRouter();

    const { data: courierData } = useQuery({
        queryKey: ["courier-profile", user.id],
        queryFn: () => getMyCourierProfile(),
        enabled: user.role === "COURIER",
    });

    const { data: citiesData } = useQuery({
        queryKey: ["hub-cities"],
        queryFn: () => getHubCities(),
        enabled: user.role === "COURIER",
    });

    const cities = citiesData?.data ?? [];
    const courier = courierData?.data;

    const { mutate: uploadImage, isPending } = useMutation<ApiResponse<User>, Error, File>({
        mutationFn: (file: File) => uploadProfileImage(user.id, file),
        onSuccess: (response) => {
            toast.success("Profile image updated successfully");
            setPreviewUrl(response.data.profileImage || null);
            queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
            router.refresh(); // Refresh server component data
        },
        onError: (error: Error) => {
            toast.error(error.message || "Failed to upload image");
        },
    });

    const { mutate: updateCity, isPending: isUpdatingCity } = useMutation({
        mutationFn: (city: string) => updateMyCourierProfile({ city }),
        onSuccess: () => {
            toast.success("City updated successfully");
            queryClient.invalidateQueries({ queryKey: ["courier-profile"] });
            setEditCity(false);
        },
        onError: (error: Error) => {
            toast.error(error.message || "Failed to update city");
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

                    {user.role === "COURIER" && courier && (
                        <>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Vehicle Type</span>
                                <Badge variant="outline">{courier.vehicleType}</Badge>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">License Number</span>
                                <span>{courier.licenseNumber}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">City</span>
                                <div className="flex items-center gap-2">
                                    <span>{courier.city || "Not set"}</span>
                                    <button
                                        onClick={() => {
                                            setSelectedCity(courier.city || "");
                                            setEditCity(true);
                                        }}
                                        className="h-6 w-6 rounded-full hover:bg-accent flex items-center justify-center"
                                        title="Edit city"
                                    >
                                        <Edit2 className="h-3 w-3" />
                                    </button>
                                </div>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Approval Status</span>
                                <Badge variant={courier.approvalStatus === "APPROVED" ? "default" : courier.approvalStatus === "PENDING" ? "secondary" : "destructive"}>
                                    {courier.approvalStatus}
                                </Badge>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Availability</span>
                                <Badge variant={courier.availability ? "default" : "secondary"}>
                                    {courier.availability ? "Available" : "Unavailable"}
                                </Badge>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            <Dialog open={editCity} onOpenChange={setEditCity}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Update City</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>City</Label>
                            <Select value={selectedCity} onValueChange={setSelectedCity}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select your city" />
                                </SelectTrigger>
                                <SelectContent>
                                    {cities.map((city) => (
                                        <SelectItem key={city} value={city}>
                                            {city}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setEditCity(false)}>
                                Cancel
                            </Button>
                            <Button
                                onClick={() => updateCity(selectedCity)}
                                disabled={!selectedCity || isUpdatingCity}
                            >
                                {isUpdatingCity && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                                Save
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

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
