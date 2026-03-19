import { Badge } from "@/components/ui/badge";
import { UserStatus } from "@/types/user.types";

interface IStatusBadgeCellProps {
    status: UserStatus | string;
}

const StatusBadgeCell = ({ status }: IStatusBadgeCellProps) => {
    const variant =
        status === "ACTIVE"
            ? "default"
            : status === "SUSPENDED"
            ? "destructive"
            : "secondary";

    return (
        <Badge variant={variant}>
            <span className="text-sm capitalize">{status.toLowerCase()}</span>
        </Badge>
    );
};

export default StatusBadgeCell;
