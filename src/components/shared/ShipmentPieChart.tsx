import { PieChartData } from "@/types/dashboard.types";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";

interface ShipmentPieChartProps {
    data: PieChartData[];
    title?: string;
    description?: string;
}

const CHART_COLORS = [
    "oklch(0.52 0.26 295)",
    "oklch(0.72 0.15 195)",
    "oklch(0.65 0.2 260)",
    "oklch(0.828 0.189 84.429)",
    "oklch(0.577 0.245 27.325)",
];

const ShipmentPieChart = ({ data, title = "Shipment Status", description = "Distribution by status" }: ShipmentPieChartProps) => {
    if (!data?.length || data.every((item) => item.value === 0)) {
        return (
            <Card className="col-span-2">
                <CardHeader>
                    <CardTitle>{title}</CardTitle>
                    <CardDescription>{description}</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-center h-75">
                    <p className="text-sm text-muted-foreground">No data available.</p>
                </CardContent>
            </Card>
        );
    }

    const formattedData = data.map((item) => ({
        name: item.name.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()),
        value: Number(item.value),
    }));

    return (
        <Card className="col-span-2">
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie data={formattedData} cx="50%" cy="50%" outerRadius={80} dataKey="value">
                            {formattedData.map((_, index) => (
                                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
};

export default ShipmentPieChart;
