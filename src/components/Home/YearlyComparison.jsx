import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Package, Users, Users2, ArrowUp, Award, DollarSign, TrendingUp } from 'lucide-react';
import { METRICS_CONFIG } from "../../utils/constants";

const YearlyComparison = ({ analyticsData, selectedYear }) => {
    const comparisonData = [
        {
            id: 'clients',
            title: "Total Clients",
            value: analyticsData?.clients?.summary?.total || '0',
            change: analyticsData?.clients?.summary?.growth || '0',
            changeText: "from last month",
            icon: Users,
            color: METRICS_CONFIG.clients.color || "#3B82F6",
            details: [
                { label: 'This Year', value: analyticsData?.clients?.summary?.thisYearTotal?.toLocaleString('id-ID') || '0' },
                { label: "Cumulative", value: analyticsData?.clients?.summary?.cumulativeTotal?.toLocaleString('id-ID') || "0" },
                { label: "Monthly Avg", value: Math.round((analyticsData?.clients?.summary?.thisYearTotal || 0) / 12).toLocaleString('id-ID') || "0" },
            ]
        },
        {
            id: 'programs',
            title: "Total Programs",
            value: analyticsData?.programs?.summary?.total || "0",
            change: analyticsData?.programs?.summary?.growth || "0",
            changeText: "from last month",
            icon: Package,
            color: METRICS_CONFIG.programs.color || "#10B981",
            details: [
                { label: "This Year", value: analyticsData?.programs?.summary?.thisYearTotal?.toLocaleString('id-ID') || "0" },
                { label: "Cumulative", value: analyticsData?.programs?.summary?.cumulativeTotal?.toLocaleString('id-ID') || "0" },
                { label: "Monthly Avg", value: Math.round((analyticsData?.programs?.summary?.thisYearTotal || 0) / 12).toLocaleString('id-ID') || "0" },
            ]
        },
        {
            id: 'participants',
            title: "Total Participants",
            value: analyticsData?.participants?.summary?.total || "0",
            change: analyticsData?.participants?.summary?.growth || "0",
            changeText: "from last month",
            icon: Users2,
            color: METRICS_CONFIG.participants.color || "#8B5CF6",
            details: [
                { label: "This Year", value: analyticsData?.participants?.summary?.thisYearTotal?.toLocaleString('id-ID') || "0" },
                { label: "Cumulative", value: analyticsData?.participants?.summary?.cumulativeTotal?.toLocaleString('id-ID') || "0" },
                { label: "Monthly Avg", value: Math.round((analyticsData?.participants?.summary?.thisYearTotal || 0) / 12).toLocaleString('id-ID') || "0" },
            ]
        },
        {
            id: 'revenue',
            title: "Total Revenue",
            value: analyticsData?.revenue?.summary?.total ? `Rp ${analyticsData.revenue.summary.total.toLocaleString('id-ID')}` : "Rp 0",
            change: analyticsData?.revenue?.summary?.growth || "0",
            changeText: "from last month",
            icon: DollarSign,
            color: METRICS_CONFIG.revenue.color || "#F59E0B",
            details: [
                { label: "This Year", value: analyticsData?.revenue?.summary?.thisYearTotal ? `Rp ${analyticsData.revenue.summary.thisYearTotal.toLocaleString('id-ID')}` : "Rp 0" },
                { label: "Cumulative", value: analyticsData?.revenue?.summary?.cumulativeTotal ? `Rp ${analyticsData.revenue.summary.cumulativeTotal.toLocaleString('id-ID')}` : "Rp 0" },
                { label: "Monthly Avg", value: analyticsData?.revenue?.summary?.average ? `Rp ${Math.round(analyticsData.revenue.summary.average).toLocaleString('id-ID')}` : "Rp 0" },
            ]
        }
    ];

    const getTrendIcon = (change) => {
        const changeNum = parseFloat(change)
        if (isNaN(changeNum)) return null

        if (changeNum > 0) {
            return (
                <div className="flex items-center gap-1 text-sm font-medium text-green-600">
                    <TrendingUp className="w-3 h-3" />
                    {change}%
                </div>
            )
        } else if (changeNum < 0) {
            return (
                <div className="flex items-center gap-1 text-sm font-medium text-red-600">
                    <TrendingUp className="w-3 h-3" />
                    {Math.abs(change)}%
                </div>
            )
        }
        return <span className="text-sm text-gray-500">0%</span>
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 mb-2" >
                    <Award className="w-5 h-5 text-blue-600" />
                    Yearly Comparison - {selectedYear}
                </CardTitle>
                <div className="h-px bg-amber-400 mt-4" />
            </CardHeader>

            <CardContent>
                <div className="grid grid-cols-4 gap-6">
                    {comparisonData.map((item, index) => {
                        const Icon = item.icon;

                        return (
                            <div
                                key={index}
                                className='border-l-4 p-4 rounded-r-lg'
                                style={{
                                    borderLeftColor: item.color,
                                    backgroundColor: `${item.color}10`
                                }}
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <div 
                                            className='p-2 rounded-lg'
                                            style={{ backgroundColor: `${item.color}20` }}
                                        >
                                            <Icon 
                                                className='h-4 w-4'
                                                style={{ color: item.color }} 
                                            />
                                        </div>
                                        <h3 className="font-medium text-gray-700">{item.title}</h3>
                                    </div>
                                </div>

                                <div className="mb-2">
                                    <div className="flex items-baseline gap-2 ">
                                        <span className="text-2xl font-bold text-gray-900">{item.value}</span>
                                        {getTrendIcon(item.change)}
                                    </div>
                                    <p className="text-sm text-gray-500">{item.changeText}</p>
                                </div>

                                <div className="mt-4 space-y-2">
                                    {item.details.map((detail, idx) => (
                                        <div
                                            key={idx}
                                            className="flex justify-between items-center text-xs"
                                        >
                                            <span className="text-gray-600">{detail.label}</span>
                                            <span className="text-gray-900 font-medium">{detail.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </CardContent>
        </Card>
    )
}

export default YearlyComparison