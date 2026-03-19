import { getUserInfo } from "@/services/auth.services";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function MyProfilePage() {
    const user = await getUserInfo();

    if (!user) {
        return <p className="text-muted-foreground">Unable to load profile.</p>;
    }

    return (
        <div className="max-w-lg space-y-6">
            <div>
                <h1 className="text-2xl font-bold">My Profile</h1>
                <p className="text-muted-foreground text-sm">Your account information.</p>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-2xl font-bold text-primary">
                                {user.name.charAt(0).toUpperCase()}
                            </span>
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
        </div>
    );
}
