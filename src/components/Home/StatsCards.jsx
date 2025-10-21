import React from "react";
import { Card, CardContent } from "../ui/card";
import { TrendingUp, Users, Target, FileText, BarChart3 } from 'lucide-react';
import { cn } from '../../lib/utils';

const StatsCards = () => {
    const stats = [
        {
            title: "Total Members",
            value: "1539",
            subtitle: "& 400++",
            percentage: "78%",
            trend: "up",
            period: "Last Month",
            icon: Users,
            color: "blue",
            description: "个78% Last Month"
        },
        {
            title: "Total Members",
            value: "1539",
            subtitle: "& 400++",
            percentage: "78%",
            trend: "up",
            period: "Last Month",
            icon: Target,
            color: "green",
            description: "个78% Last Month"
        },
        {
            title: "Total Members",
            value: "1539",
            subtitle: "& 400++",
            percentage: "78%",
            trend: "up",
            period: "Last Month",
            icon: FileText,
            color: "orange",
            description: "个78% Last Month"
        },
        {
            title: "Total Members",
            value: "1539",
            subtitle: "& 400++",
            percentage: "78%",
            trend: "up",
            period: "Last Month",
            icon: BarChart3,
            color: "purple",
            description: "个78% Last Month"
        },
    ];

    const getColorClasses = (color) => {
        const colors = {
            blue: { bg: 'bg-blue-50', text: 'text-blue-600', icon: 'text-blue-600' },
            green: { bg: 'bg-green-50', text: 'text-green-600', icon: 'text-green-600' },
            orange: { bg: 'bg-orange-50', text: 'text-orange-600', icon: 'text-orange-600' },
            purple: { bg: 'bg-purple-50', text: 'text-purple-600', icon: 'text-purple-600' },
        };
        return colors[color] || colors.blue;
    }

    return (
        <div className="grid grid-cols-4 gap-6">
            {stats.map((stat, index) => {
                const Icon = stat.icon;
                const colorClasses = getColorClasses(stat.color)

                return (
                    <Card 
                        key={index}
                        className="bg-white border-gray-200 hover:shadow-md transition-shadow"
                    >
                        <CardContent className="p-6">

                            <div className="flex items-center justify-between mb-4">
                                <div className={cn("p-2 rounded-lg", colorClasses.bg)}>
                                    <Icon className={cn("h-5 w-5", colorClasses.icon)} />
                                </div>
                                <div className="text-right">
                                    <span className={cn("text-sm font-medium", colorClasses.text)}>
                                        +{stat.percentage}
                                    </span>
                                </div>
                            </div>
                            

                            <div className="mb-2">
                                <div className="flex items-baseline gap-1">
                                    <span className="text-2xl font-bold text-gray-900">
                                        {stat.value}
                                    </span>

                                    {stat.subtitle && (
                                        <span>
                                            {stat.subtitle}
                                        </span>
                                    )}
                                </div>
                                <h3 className="text-sm font-medium text-gray-600 mt-1">
                                    {stat.title}
                                </h3>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <TrendingUp className="h-4 w-4 text-green-500" />
                                    <span className="text-xs text-gray-500">
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