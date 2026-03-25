import { Badge } from "@/components/ui/badge";
import { UserStatus } from "@/types/user.types";
import { ShipmentStatus } from "@/types/shipment.types";
import { LegStatus } from "@/types/shipmentLeg.types";

interface IStatusBadgeCellProps {
    status: UserStatus | ShipmentStatus | LegStatus | string;
}

const StatusBadgeCell = ({ status }: IStatusBadgeCellProps) => {
    // User status variants
    if (status === "ACTIVE") return <Badge variant="default"><span className="text-sm capitalize">{status.toLowerCase()}</span></Badge>;
    if (status === "SUSPENDED") return <Badge variant="destructive"><span className="text-sm capitalize">{status.toLowerCase()}</span></Badge>;
    if (status === "INACTIVE") return <Badge variant="secondary"><span className="text-sm capitalize">{status.toLowerCase()}</span></Badge>;
    
    // Shipment status variants
    if (status === "PENDING") return <Badge variant="secondary">{status}</Badge>;
    if (status === "ASSIGNED") return <Badge variant="default">{status}</Badge>;
    if (status === "PICKED_UP") return <Badge variant="default">{status}</Badge>;
    if (status === "IN_TRANSIT") return <Badge variant="default">{status}</Badge>;
    if (status === "OUT_FOR_DELIVERY") return <Badge variant="default">{status}</Badge>;
    if (status === "DELIVERED") return <Badge className="bg-green-600 hover:bg-green-700">{status}</Badge>;
    if (status === "FAILED") return <Badge variant="destructive">{status}</Badge>;
    if (status === "RETURNED") return <Badge variant="destructive">{status}</Badge>;
    
    // Leg status variants
    if (status === "IN_PROGRESS") return <Badge variant="default">{status}</Badge>;
    if (status === "COMPLETED") return <Badge className="bg-green-600 hover:bg-green-700">{status}</Badge>;

    // Default
    return <Badge variant="secondary"><span className="text-sm capitalize">{status.toLowerCase()}</span></Badge>;
};

export default StatusBadgeCell;
