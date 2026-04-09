"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User } from "@/types/user.types";
import { ApiResponse } from "@/types/api.types";
import { useState, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { updateUser, uploadProfileImage } from "@/services/user.services";
import { getMyCourierProfile, updateMyCourierProfile } from "@/services/courier.services";
import { getHubCities } from "@/services/hub.services";
import { toast } from "sonner";
import { Camera, Loader2, Edit2 } from "lucide-react";
import Image from "next/image";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
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
    const [editProfile, setEditProfile] = useState(false);
    const [editName, setEditName] = useState(user.name);
    const [editPhone, setEditPhone] = useState(user.phone || "");
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

    const { mutate: updateProfile, isPending: isUpdatingProfile } = useMutation({
        mutationFn: (payload: { name: string; phone: string }) =>
            updateUser(user.id, { name: payload.name, phone: payload.phone || undefined }),
        onSuccess: () => {
            toast.success("Profile updated successfully");
            queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
            setEditProfile(false);
            router.refresh();
        },
        onError: (error: Error) => {
            toast.error(error.message || "Failed to update profile");
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

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Left column — avatar + status */}
                <div className="space-y-4">
                    <Card>
                        <CardHeader>
                            <div className="flex flex-col items-center gap-4 text-center">
                                <div className="relative">
                                    {previewUrl ? (
                                        <div className="h-24 w-24 rounded-full overflow-hidden border-2 border-primary/20">
                                            <Image
                                                src={previewUrl}
                                                alt={user.name}
                                                width={96}
                                                height={96}
                                                className="object-cover w-full h-full"
                                            />
                                        </div>
                                    ) : (
                                        <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/20">
                                            <span className="text-4xl font-bold text-primary">
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
                                    <CardTitle className="text-xl">{user.name}</CardTitle>
                                    <p className="text-sm text-muted-foreground mt-1">{user.email}</p>
                                    <button
                                        onClick={() => {
                                            setEditName(user.name);
                                            setEditPhone(user.phone || "");
                                            setEditProfile(true);
                                        }}
                                        className="mt-2 flex items-center gap-1 text-xs text-primary hover:underline mx-auto"
                                    >
                                        <Edit2 className="h-3 w-3" /> Edit Profile
                                    </button>
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
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Member since</span>
                                <span>{new Date(user.createdAt).toLocaleDateString()}</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Image Guidelines</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground space-y-1">
                            <ul className="list-disc list-inside space-y-1">
                                <li>Supported: JPG, PNG, GIF</li>
                                <li>Max size: 5MB</li>
                                <li>Recommended: 1:1 ratio</li>
                                <li>Click camera icon to upload</li>
                            </ul>
                        </CardContent>
                    </Card>
                </div>

                {/* Right column — account + courier details */}
                <div className="lg:col-span-2 space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Account Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm">
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <p className="text-muted-foreground text-xs uppercase tracking-wide">Full Name</p>
                                    <p className="font-medium">{user.name}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-muted-foreground text-xs uppercase tracking-wide">Email</p>
                                    <p className="font-medium">{user.email}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-muted-foreground text-xs uppercase tracking-wide">Phone</p>
                                    <p className="font-medium">{user.phone || "—"}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-muted-foreground text-xs uppercase tracking-wide">Member Since</p>
                                    <p className="font-medium">{new Date(user.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {user.role === "COURIER" && courier && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Courier Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 text-sm">
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <p className="text-muted-foreground text-xs uppercase tracking-wide">Vehicle Type</p>
                                        <Badge variant="outline">{courier.vehicleType}</Badge>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-muted-foreground text-xs uppercase tracking-wide">License Number</p>
                                        <p className="font-medium">{courier.licenseNumber}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-muted-foreground text-xs uppercase tracking-wide">City</p>
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium">{courier.city || "Not set"}</span>
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
                                    <div className="space-y-1">
                                        <p className="text-muted-foreground text-xs uppercase tracking-wide">Approval Status</p>
                                        <Badge variant={courier.approvalStatus === "APPROVED" ? "default" : courier.approvalStatus === "PENDING" ? "secondary" : "destructive"}>
                                            {courier.approvalStatus}
                                        </Badge>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-muted-foreground text-xs uppercase tracking-wide">Availability</p>
                                        <Badge variant={courier.availability ? "default" : "secondary"}>
                                            {courier.availability ? "Available" : "Unavailable"}
                                        </Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>

            <Dialog open={editProfile} onOpenChange={setEditProfile}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Profile</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Full Name</Label>
                            <Input
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                placeholder="Your full name"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Phone</Label>
                            <Input
                                value={editPhone}
                                onChange={(e) => setEditPhone(e.target.value)}
                                placeholder="+8801700000000"
                            />
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setEditProfile(false)}>Cancel</Button>
                            <Button
                                onClick={() => updateProfile({ name: editName, phone: editPhone })}
                                disabled={!editName || isUpdatingProfile}
                            >
                                {isUpdatingProfile && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                                Save
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

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

        </div>
    );
}
