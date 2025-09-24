
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface GrowthChartProps {
    data: number[];
}

const GrowthChart: React.FC<GrowthChartProps> = ({ data }) => {
    const chartData = data.map((value, index) => ({ name: `Day ${index + 1}`, weight: value }));

    if (!data || data.length < 2) {
        return (
            <div className="flex items-center justify-center h-full text-sm text-gray-400">
                Không đủ dữ liệu
            </div>
        );
    }
    
    return (
        <ResponsiveContainer width="100%" height={150}>
            <LineChart
                data={chartData}
                margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
            >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip
                    formatter={(value: number) => [`${value}g`, "Trọng lượng"]}
                    labelStyle={{ fontSize: 12 }}
                    itemStyle={{ fontSize: 12 }}
                />
                <Line type="monotone" dataKey="weight" stroke="var(--color-primary-500)" strokeWidth={2} dot={false} />
            </LineChart>
        </ResponsiveContainer>
    );
};

export default GrowthChart;