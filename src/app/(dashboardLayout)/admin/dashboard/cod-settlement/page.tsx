import CODSettlementManagement from "@/components/modules/Admin/Settlement/CODSettlementManagement";

export default function CODSettlementPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">COD Settlement</h1>
                <p className="text-muted-foreground text-sm">Settle COD payments collected by couriers.</p>
            </div>
            <CODSettlementManagement />
        </div>
    );
}
