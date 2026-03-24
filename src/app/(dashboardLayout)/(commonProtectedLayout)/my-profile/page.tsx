import { getUserInfo } from "@/services/auth.services";
import ProfileContent from "@/components/modules/User/ProfileContent";

export default async function MyProfilePage() {
    const user = await getUserInfo();

    if (!user) {
        return <p className="text-muted-foreground">Unable to load profile.</p>;
    }

    return <ProfileContent user={user} />;
}
