
import React, { useMemo } from 'react';
import { Cage, HarvestedCage } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import KPICard from './ui/KPICard';

interface FinancialDashboardProps {
    cages: Cage[];
    harvestedCages: HarvestedCage[];
}

const COLORS = ['#0ea5e9', '#f97316', '#ef4444']; // sky, orange, red

const FinancialDashboard: React.FC<FinancialDashboardProps> = ({ cages, harvestedCages }) => {

    const financialSummary = useMemo(() => {
        const totalProfit = harvestedCages.reduce((sum, cage) => sum + cage.profit, 0);
        const totalRevenue = harvestedCages.reduce((sum, cage) => sum + cage.revenue, 0);
        const totalHarvestedCost = harvestedCages.reduce((sum, cage) => sum + cage.totalCost, 0);
        
        const currentInvestment = cages.reduce((sum, cage) => sum + cage.costs.seed + cage.costs.feed + cage.costs.medicine, 0);

        const costBreakdown = harvestedCages.reduce((acc, cage) => {
            acc.seed += cage.costs.seed;
            acc.feed += cage.costs.feed;
            acc.medicine += cage.costs.medicine;
            return acc;
        }, { seed: 0, feed: 0, medicine: 0 });

        const costBreakdownData = [
            { name: 'Giống', value: costBreakdown.seed },
            { name: 'Thức ăn', value: costBreakdown.feed },
            { name: 'Thuốc', value: costBreakdown.medicine },
        ].filter(item => item.value > 0);

        const monthlyProfit = harvestedCages.reduce((acc, cage) => {
            const month = new Date(cage.harvestDate).toLocaleString('vi-VN', { month: '2-digit', year: 'numeric' });
            if (!acc[month]) {
                acc[month] = 0;
            }
            acc[month] += cage.profit;
            return acc;
        }, {} as Record<string, number>);

        const monthlyProfitData = Object.entries(monthlyProfit)
            .map(([name, profit]) => ({ name, 'Lợi nhuận': profit }))
            .sort((a, b) => { // Sort by month
                const [monthA, yearA] = a.name.split('/');
                const [monthB, yearB] = b.name.split('/');
                return new Date(+yearA, +monthA - 1).getTime() - new Date(+yearB, +monthB - 1).getTime();
            });

        const topProfitCages = [...harvestedCages].sort((a, b) => b.profit - a.profit).slice(0, 5);
        const topCostCages = [...harvestedCages].sort((a, b) => b.totalCost - a.totalCost).slice(0, 5);

        return {
            totalProfit,
            totalRevenue,
            totalHarvestedCost,
            currentInvestment,
            costBreakdownData,
            monthlyProfitData,
            topProfitCages,
            topCostCages,
        };
    }, [cages, harvestedCages]);

    const formatCurrency = (value: number) => `${value.toLocaleString('vi-VN')} VND`;

    if (harvestedCages.length === 0) {
        return (
            <div className="text-center py-16 bg-white rounded-lg shadow-md">
                <h2 className="text-xl font-semibold text-gray-700">Chưa có dữ liệu thu hoạch</h2>
                <p className="text-gray-500 mt-2">Bảng điều khiển tài chính sẽ được kích hoạt khi bạn có lồng đầu tiên được thu hoạch.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPICard title="Tổng Lợi nhuận" value={formatCurrency(financialSummary.totalProfit)} description="Từ các lồng đã thu hoạch" />
                <KPICard title="Tổng Doanh thu" value={formatCurrency(financialSummary.totalRevenue)} description="Tổng tiền bán được" />
                <KPICard title="Tổng Chi phí" value={formatCurrency(financialSummary.totalHarvestedCost)} description="Của lồng đã thu hoạch" />
                <KPICard title="Vốn Đầu tư Hiện tại" value={formatCurrency(financialSummary.currentInvestment)} description="Chi phí cho lồng đang nuôi" />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 bg-white p-4 rounded-lg shadow-sm">
                    <h3 className="font-semibold text-gray-700 mb-2">Phân bổ Chi phí (Đã thu hoạch)</h3>
                     <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie data={financialSummary.costBreakdownData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                                {financialSummary.costBreakdownData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value: number) => formatCurrency(value)} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="lg:col-span-2 bg-white p-4 rounded-lg shadow-sm">
                    <h3 className="font-semibold text-gray-700 mb-2">Lợi nhuận theo Tháng</h3>
                     <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={financialSummary.monthlyProfitData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis tickFormatter={(value) => `${(value as number / 1000000).toFixed(1)}Tr`} />
                            <Tooltip formatter={(value: number) => formatCurrency(value)} />
                            <Legend />
                            <Bar dataKey="Lợi nhuận" fill="var(--color-primary-500)" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
            
             {/* Top Lists */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-4 rounded-lg shadow-sm">
                    <h3 className="font-semibold text-gray-700 mb-2">Top 5 Lồng Lợi nhuận Cao nhất</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-gray-500">
                                    <th className="py-2 px-1">ID</th><th className="py-2 px-1">Doanh thu</th><th className="py-2 px-1">Chi phí</th><th className="py-2 px-1 text-green-600">Lợi nhuận</th>
                                </tr>
                            </thead>
                            <tbody>
                                {financialSummary.topProfitCages.map(cage => (
                                    <tr key={cage.id} className="border-t">
                                        <td className="py-2 px-1 font-medium">{cage.id}</td>
                                        <td className="py-2 px-1">{formatCurrency(cage.revenue)}</td>
                                        <td className="py-2 px-1">{formatCurrency(cage.totalCost)}</td>
                                        <td className="py-2 px-1 font-semibold text-green-600">{formatCurrency(cage.profit)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                 <div className="bg-white p-4 rounded-lg shadow-sm">
                    <h3 className="font-semibold text-gray-700 mb-2">Top 5 Lồng Chi phí Cao nhất</h3>
                    <div className="overflow-x-auto">
                         <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-gray-500">
                                    <th className="py-2 px-1">ID</th><th className="py-2 px-1">Giống</th><th className="py-2 px-1">Thức ăn</th><th className="py-2 px-1 text-red-600">Tổng Chi phí</th>
                                </tr>
                            </thead>
                            <tbody>
                                {financialSummary.topCostCages.map(cage => (
                                    <tr key={cage.id} className="border-t">
                                        <td className="py-2 px-1 font-medium">{cage.id}</td>
                                        <td className="py-2 px-1">{formatCurrency(cage.costs.seed)}</td>
                                        <td className="py-2 px-1">{formatCurrency(cage.costs.feed)}</td>
                                        <td className="py-2 px-1 font-semibold text-red-600">{formatCurrency(cage.totalCost)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FinancialDashboard;
