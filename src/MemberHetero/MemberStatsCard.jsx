import React from "react";
import { Card, CardContent } from "../components/ui/card";
import { TrendingUp, Users, UserCheck, TrendingDown } from 'lucide-react';
import { cn } from '../lib/utils';

const MemberStatsCards = ({ statsData }) => {
    const stats = statsData;

    const getColorClasses = (color) => {
        const colors = {
            blue: { bg: 'bg-blue-50', text: 'text-blue-600', icon: 'text-blue-600' },
            green: { bg: 'bg-green-50', text: 'text-green-600', icon: 'text-green-600' },
        };
        return colors[color] || colors.blue;
    }

    const getTrendIcon = (trend) => {
        if (trend === "up") {
            return <TrendingUp className="h-4 w-4 text-green-500" />
        } else {
            return <TrendingDown className="h-4 w-4 text-red-500" />
        }
    }

    const getTrendColor = (trend) => {
        return trend === "up" ? "text-green-500" : "text-red-500";
    }

    return (
        <div className="grid grid-cols-2 gap-6 mb-6">
            {stats.map((stat, index) => {
                const Icon = stat.icon;
                const colorClasses = getColorClasses(stat.color);

                return (
                    <Card 
                        key={index}
                        className="bg-white border-gray-200 hover:shadow-md transition-shadow"
                    >
                        <CardContent className="p-6">
                            {/* Hanya icon, tanpa persentase badge */}
                            <div className="flex items-center mb-4">
                                <div className={cn("p-2 rounded-lg", colorClasses.bg)}>
                                    <Icon className={cn("h-5 w-5", colorClasses.icon)} />
                                </div>
                            </div>
                            
                            <div className="mb-2">
                                <div className="text-2xl font-bold text-gray-900">
                                    {stat.value}
                                </div>
                                <h3 className="text-sm font-medium text-gray-600 mt-1">
                                    {stat.title}
                                </h3>
                            </div>

                            <div className="flex items-center gap-2">
                                {getTrendIcon(stat.trend)}
                                <span className={cn("text-xs font-medium", getTrendColor(stat.trend))}>
                                    {stat.description}  {/* Sudah mengandung persentase yang benar */}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                )
            })}
        </div>
    )
}

export default MemberStatsCards;