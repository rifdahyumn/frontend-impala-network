import React from "react";
import { Card, CardContent } from "../ui/card";
import { Users, Target } from 'lucide-react';
import { cn } from '../../lib/utils';

const UserCards = () => {
   const stats = [
        {
            title: "Total Users",
            value: "5",
            icon: Users,
            color: "blue",
        },
        {
            title: "Total Active",
            value: "4",
            icon: Target,
            color: "green",
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
                        </CardContent>
                    </Card>
                )
            })}
        </div>
    )
}

export default UserCards;