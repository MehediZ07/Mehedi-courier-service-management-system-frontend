import MerchantSettlementManagement from "@/components/modules/Admin/Settlement/MerchantSettlementManagement";

export default function MerchantSettlementPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Merchant Settlement</h1>
                <p className="text-muted-foreground text-sm">
                    Settle pending payments to merchants (Product Price - 1.85% commission)
                </p>
            </div>
            <MerchantSettlementManagement />
        </div>
    );
}
