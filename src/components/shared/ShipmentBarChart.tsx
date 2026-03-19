import { BarChartData } from "@/types/dashboard.types";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";

interface ShipmentBarChartProps {
    data: BarChartData[];
    title?: string;
    description?: string;
}

const ShipmentBarChart = ({ data, title = "Shipment Trends", description = "Monthly Shipment Statistics" }: ShipmentBarChartProps) => {
    if (!data?.length || data.every((item) => item.value === 0)) {
        return (
            <Card className="col-span-4">
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

    return (
        <Card className="col-span-4">
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis tickLine={false} axisLine={false} dataKey="name" />
                        <YAxis tickLine={false} axisLine={false} allowDecimals={false} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="value" fill="oklch(0.52 0.26 295)" radius={[4, 4, 0, 0]} maxBarSize={60} />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
};

export default ShipmentBarChart;
