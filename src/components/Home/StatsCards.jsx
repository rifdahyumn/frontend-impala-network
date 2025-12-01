import React from "react";
import { Card, CardContent } from "../ui/card";
import { TrendingUp, Users, Target, FileText, DollarSign, TrendingDown, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useClients } from "../../hooks/useClients";
import { usePrograms } from "../../hooks/usePrograms";
import { useImpala } from "../../hooks/useImpala";

const StatsCards = () => {
    const { clientStats, statsLoading: clientLoading } = useClients()
    const { programStats, priceStats, statsLoading: programLoading } = usePrograms()
    const { impalaStats, statsLoading: impalaLoading } = useImpala()

    console.log('priceStats:', priceStats)
    console.log('programStats:', programStats)
    console.log('clientStats:', clientStats)
    console.log('impalaStats:', impalaStats)

    const iconMap = {
        Users: Users,
        Target: Target,
        FileText: FileText,
        DollarSign: DollarSign,
        TrendingUp: TrendingUp,
        TrendingDown: TrendingDown
    }

    const allStats = [
        clientStats || {
            title: "Total Client",
            value: "0",
            subtitle: "+ 400++",
            percentage: "0%",
            trend: "up",
            period: "Last Month",
            icon: "Users",
            color: "blue",
            description: "0% Last Month"
        },

        programStats || {
            title: "Total Program",
            value: "0",
            subtitle: "+ 400++",
            percentage: "0%",
            trend: "up",
            period: "Last Month",
            icon: "Target",
            color: "green",
            description: "0% Last Month"
        },

        impalaStats || {
            title: "Total Participant",
            value: "0",
            subtitle: "& 400++",
            percentage: "6,3%",
            trend: "up",
            period: "Last Month",
            icon: 'FileText',
            color: "orange",
            description: "6,3% Last Month"
        },
        priceStats || {
            title: "Total Price",
            value: "0",
            subtitle: "& 400++",
            percentage: "0%",
            trend: "up",
            period: "Last Month",
            icon: 'DollarSign',
            color: "purple",
            description: "8,3% Last Month"
        },
        // ...staticStats
    ]

    const getColorClasses = (color) => {
        const colors = {
            blue: { bg: 'bg-blue-50', text: 'text-blue-600', icon: 'text-blue-600' },
            green: { bg: 'bg-green-50', text: 'text-green-600', icon: 'text-green-600' },
            orange: { bg: 'bg-orange-50', text: 'text-orange-600', icon: 'text-orange-600' },
            purple: { bg: 'bg-purple-50', text: 'text-purple-600', icon: 'text-purple-600' },
        };
        return colors[color] || colors.blue;
    }

    const getTrendIcon = (trend) => {
        if (trend === "up") {
            return <TrendingUp className="h-4 w-4 text-green-500" />
        } else if (trend === "down") {
            return <TrendingDown className="h-4 w-4 text-red-500" />
        }
        return null
    }

    const getTrendColor = (trend) => {
        if (trend === "up") {
            return "text-green-500"
        } else if (trend === "down") {
            return "text-red-500"
        }
        return "text-gray-500"
    }

    const isLoading = clientLoading || programLoading || impalaLoading;

    if (isLoading) {
        return (
            <div className="grid grid-cols-4 gap-6">
                {[1, 2, 3, 4].map(i => (
                    <Card key={i} className='bg-white border-gray-200'>
                        <CardContent className='p-6'>
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="w-6 h-6 animate-spin text-amber-600" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        )
    }

    return (
        <div className="grid grid-cols-4 gap-6">
            {allStats.map((stat, index) => {
                const IconComponent = iconMap[stat.icon]
                const colorClasses = getColorClasses(stat.color)

                return (
                    <Card 
                        key={index}
                        className="bg-white border-gray-200 hover:shadow-md transition-shadow"
                    >
                        <CardContent className="p-6">

                            <div className="flex items-center justify-between mb-4">
                                <div className={cn("p-2 rounded-lg", colorClasses.bg)}>
                                    <IconComponent className={cn("h-5 w-5", colorClasses.icon)} />
                                </div>
                                {/* <div className="text-right">
                                    <span className={cn("text-sm font-medium", colorClasses.text)}>
                                        +{stat.percentage}
                                    </span>
                                </div> */}
                            </div>
                            

                            <div className="mb-2">
                                <div className="flex items-baseline gap-1">
                                    <span className="text-2xl font-bold text-gray-900">
                                        {stat.value}
                                    </span>
                                    {/* {stat.subtitle && (
                                        <span className="text-sm text-gray-500">
                                            {stat.subtitle}
                                        </span>
                                    )} */}
                                </div>
                                <h3 className="text-sm font-medium text-gray-600 mt-1">
                                    {stat.title}
                                </h3>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    {getTrendIcon(stat.trend, stat.percentage)}
                                    <span className={cn(
                                        "text-xs font-medium",
                                        getTrendColor(stat.trend)
                                    )}>
                                        {stat.description}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )
            })}
        </div>
    )
}

export default StatsCards