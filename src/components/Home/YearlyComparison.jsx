import { Arrow, Item } from "@radix-ui/react-select";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { TrendingUp, Users, Target, ArrowUp, Award } from 'lucide-react';

const YearlyComparison = () => {
    const comparisonData = [
        {
            title: "Total Members (2024)",
            value: "1.593",
            change: "+155",
            changeText: "from 2023",
            icon: Users,
            color: "blue",
            trend: "up",
            details: [
                { year: "2025", value: "1,593", growth: "+12.8%" },
                { year: "2024", value: "1,593", growth: "+12.8%" },
                { year: "2023", value: "1,593", growth: "+12.8%" },
            ]
        },
        {
            title: "Average Growth Rate",
            value: "12.8%",
            change: "Highest",
            changeText: "in 5 years",
            icon: TrendingUp,
            color: "green",
            trend: "up",
            details: [
                { year: "2025", rate: "12.8%", status: "Highest" },
                { year: "2024", rate: "12.8%", status: "Good" },
                { year: "2023", rate: "12.8%", status: "Average" },
            ]
        },
        {
            title: "Year-End Projection",
            value: "1,792",
            change: "256",
            changeText: "Based on current trend",
            icon: Target,
            color: "purple",
            trend: "up",
            details: [
                { metrics: "Projected Growth", value: "+256 members" },
                { metrics: "Monthly Average", value: "+256 members" },
                { metrics: "Confidence Level", value: "High" },
            ]
        }
    ];

    const getColorClasses = (color) => {
        const colors = {
            blue: { bg: 'bg-blue-50', text: "text-blue-600", border: "border-blue-200", light: "bg-blue-500/10" },
            green: { bg: 'bg-green-50', text: "text-green-600", border: "border-green-200", light: "bg-green-500/10" },
            purple: { bg: 'bg-purple-50', text: "text-purple-600", border: "border-purple-200", light: "bg-purple-500/10" }
        };
        return colors[color] || colors.blue
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 mb-2" >
                    <Award className="w-5 h-5 text-blue-600" />
                    Yearly Comparison
                </CardTitle>
                <div className="h-px bg-amber-400 mt-4" />
            </CardHeader>

            <CardContent>
                <div className="grid grid-cols-3 gap-6">
                    {comparisonData.map((item, index) => {
                        const Icon = item.icon;
                        const colorClasses = getColorClasses(item.color)

                        return (
                            <div
                                key={index}
                                className={`border-l-4 ${colorClasses.border} p-4 rounded-r-lg ${colorClasses.light}`}
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <div className={`p-2 rounded-lg ${colorClasses.bg}`}>
                                            <Icon className={`h-4 w-4 ${colorClasses.text}`} />
                                        </div>
                                        <h3>{item.title}</h3>
                                    </div>
                                </div>

                                <div className="mb-2">
                                    <div className="flex items-baseline gap-2 ">
                                        <span className="text-2xl font-bold text-gray-900">{item.value}</span>
                                        <div className="flex items-center gap-1 text-sm font-medium text-green-600">
                                            <ArrowUp className="w-3 h-3" />
                                            {item.change}
                                        </div>
                                    </div>
                                    <p>{item.changeText}</p>
                                </div>

                                <div className="mt-4 space-y-2">
                                    {item.title.includes('Total Members') && (
                                        <>
                                            {item.details.map((detail, idx) => (
                                                <div
                                                    key={idx}
                                                    className="flex justify-between items-center text-xs"
                                                >
                                                    <span className="text-gray-600">{detail.year}</span>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium">{detail.value}</span>
                                                        <span className={`px-1 rounded ${
                                                            detail.growth?.includes('+')
                                                                ? 'bg-green-100 text-green-700'
                                                                : 'bg-green-100 text-gray-700'
                                                        }`}>
                                                            {detail.growth}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </>
                                    )}

                                    {item.title.includes("Growth Rate") && (
                                        <>
                                            {item.details.map((detail, idx) => (
                                                <div
                                                    key={idx}
                                                    className="flex justify-between items-center text-xs"
                                                >
                                                    <span className="text-gray-600">{detail.year}</span>
                                                    <div className="flex items-center gap-2">
                                                        <span className={`font-medium ${
                                                            detail.status === 'Highest' ? 'text-green-600' : 'text-gray-700'
                                                        }`}>
                                                            {detail.rate}
                                                        </span>
                                                        {detail.status === 'Highest' && (
                                                            <span className=" bg-green-100 text-green-700 px-1 rounded text-xs">Best</span>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </>
                                    )}

                                    {item.title.includes('Year-End Projection') && (
                                        <>
                                            {item.details.map((detail, idx) => (
                                                <div
                                                    key={idx}
                                                    className="flex justify-between items-center text-xs"
                                                >
                                                    <span className="text-gray-600">{detail.metrics}</span>
                                                    <span className={`font-medium ${
                                                        detail.value.includes('+')
                                                            ? 'text-green-600'
                                                            : detail.value === 'High'
                                                                ?'text-blue-600'
                                                                : 'text-gray-700'
                                                    }`}>
                                                        {detail.value}
                                                    </span>
                                                </div>
                                            ))}
                                        </>
                                    )}
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