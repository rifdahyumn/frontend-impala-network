import React from "react";
import { Card, CardContent } from "../ui/card";
import { TrendingUp, Users, DollarSign, TrendingDown, Loader2, Package, Users2, FileText, Target } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useClients } from "../../hooks/useClients";
import { usePrograms } from "../../hooks/usePrograms";
import { useImpala } from "../../hooks/useImpala";

const StatsCards = ({ 
    selectedMetric,
    onMetricSelect,
    interactive = false 
}) => {
    const { clientStats, statsLoading: clientLoading } = useClients()
    const { programStats, priceStats, statsLoading: programLoading } = usePrograms()
    const { impalaStats, statsLoading: impalaLoading } = useImpala()

    const iconMap = {
        Users: Users,
        Package: Package,
        FileText: Users2,
        Target: Package,
        Users2: Users2,
        DollarSign: DollarSign,
        TrendingUp: TrendingUp,
        TrendingDown: TrendingDown
    }

    const allStats = [
        {
            key: 'clients',
            data: clientStats || {
                title: "Total Client",
                value: "0",
                subtitle: "+ 400++",
                percentage: "0%",
                trend: "up",
                period: "Last Month",
                icon: "Users",
                color: "blue",
                description: "0% Last Month"
            }
        },
        {
            key: 'programs',
            data: programStats || {
                title: "Total Program",
                value: "0",
                subtitle: "+ 400++",
                percentage: "0%",
                trend: "up",
                period: "Last Month",
                icon: "Target",
                color: "green",
                description: "0% Last Month"
            }
        },
        {
            key: 'participants',
            data: impalaStats || {
                title: "Total Beneficiaries",
                value: "0",
                subtitle: "& 400++",
                percentage: "6,3%",
                trend: "up",
                period: "Last Month",
                icon: "Users2",
                color: "orange",
                description: "6,3% Last Month"
            }
        },
        {
            key: 'revenue',
            data: priceStats || {
                title: "Total Price",
                value: "0",
                subtitle: "& 400++",
                percentage: "0%",
                trend: "up",
                period: "Last Month",
                icon: "DollarSign",
                color: "purple",
                description: "8,3% Last Month"
            }
        }
    ]

    const getColorClasses = (color) => {
        const colors = {
            blue: { 
                bg: 'bg-blue-50', 
                text: 'text-blue-600', 
                icon: 'text-blue-600',
                border: interactive ? 'border-blue-200' : 'border-gray-200'
            },
            green: { 
                bg: 'bg-green-50', 
                text: 'text-green-600', 
                icon: 'text-green-600',
                border: interactive ? 'border-green-200' : 'border-gray-200'
            },
            orange: { 
                bg: 'bg-orange-50', 
                text: 'text-orange-600', 
                icon: 'text-orange-600',
                border: interactive ? 'border-orange-200' : 'border-gray-200'
            },
            purple: { 
                bg: 'bg-purple-50', 
                text: 'text-purple-600', 
                icon: 'text-purple-600',
                border: interactive ? 'border-purple-200' : 'border-gray-200'
            },
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

    const handleCardClick = (key) => {
        if (interactive && onMetricSelect) {
            onMetricSelect(key);
        }
    }

    const isLoading = clientLoading || programLoading || impalaLoading;

    if (isLoading) {
        return (
            <div className={`grid grid-cols-4 gap-6 ${interactive ? 'mb-6' : ''}`}>
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
        <div className={`grid grid-cols-4 gap-6 ${interactive ? 'mb-6' : ''}`}>
            {allStats.map(({ key, data: stat }) => {
                console.log(`=== DEBUG CARD ${key} ===`);
    console.log('stat.icon:', stat.icon);
    console.log('iconMap keys:', Object.keys(iconMap));
    console.log('iconMap[stat.icon]:', iconMap[stat.icon]);
    console.log('stat.icon in iconMap?', stat.icon in iconMap);
                const IconComponent = iconMap[stat.icon] || Users;
                const colorClasses = getColorClasses(stat.color)
                const isSelected = interactive && selectedMetric === key

                return (
                    <Card 
                        key={key}
                        className={cn(
                            "bg-white hover:shadow-md transition-shadow",
                            colorClasses.border,
                            interactive && "cursor-pointer transition-all duration-200",
                            isSelected && "ring-2 ring-offset-2 ring-amber-400 shadow-lg border-amber-300"
                        )}
                        onClick={() => handleCardClick(key)}
                    >
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className={cn("p-2 rounded-lg", colorClasses.bg)}>
                                    <IconComponent className={cn("h-5 w-5", colorClasses.icon)} />
                                </div>
                            </div>
                            
                            <div className="mb-2">
                                <div className="flex items-baseline gap-1">
                                    <span className="text-2xl font-bold text-gray-900">
                                        {stat.value}
                                    </span>
                                </div>
                                <h3 className="text-sm font-medium text-gray-600 mt-1">
                                    {stat.title}
                                </h3>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    {getTrendIcon(stat.trend)}
                                    <span className={cn(
                                        "text-xs font-medium",
                                        getTrendColor(stat.trend)
                                    )}>
                                        {stat.description}
                                    </span>
                                </div>
                                
                                {isSelected && (
                                    <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )
            })}
        </div>
    )
}

export default StatsCards

export { StatsCards as AnalyticsStatsCards }