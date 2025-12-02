// src/components/Analytics/MetricCards.jsx
import { Card, CardContent } from "../ui/card";
import { TrendingUp, Users, Target, DollarSign, FileText } from "lucide-react";
import { METRICS_CONFIG } from "../../utils/constants";

// Icon mapping
const ICON_MAP = {
    Users: Users,
    Target: Target,
    DollarSign: DollarSign,
    FileText: FileText
};

export const MetricCards = ({ selectedMetric, onMetricSelect, analyticsData }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {Object.entries(METRICS_CONFIG).map(([key, config]) => {
                const IconComponent = ICON_MAP[config.icon];
                const isActive = selectedMetric === key;
                
                return (
                    <Card 
                        key={key}
                        className={`cursor-pointer transition-all hover:shadow-lg ${isActive ? 'ring-2 ring-amber-500' : ''}`}
                        onClick={() => onMetricSelect(key)}
                    >
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">{config.label}</p>
                                    <h3 className="text-2xl font-bold mt-1">
                                        {analyticsData?.summary?.total?.toLocaleString('id-ID') || '0'}
                                    </h3>
                                    {analyticsData?.summary?.growth && (
                                        <div className="flex items-center gap-1 mt-1">
                                            <TrendingUp className="w-4 h-4 text-green-500" />
                                            <span className="text-sm text-green-600">
                                                {analyticsData.summary.growth}%
                                            </span>
                                            <span className="text-xs text-gray-500 ml-1">growth</span>
                                        </div>
                                    )}
                                </div>
                                <div 
                                    className="w-12 h-12 rounded-full flex items-center justify-center"
                                    style={{ backgroundColor: `${config.color}20` }}
                                >
                                    <IconComponent className="w-6 h-6" style={{ color: config.color }} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
};