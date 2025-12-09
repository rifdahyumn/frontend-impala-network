import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { BarChart3 } from 'lucide-react';

const QuarterlyComparisonSkeleton = () => (
    <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600 animate-pulse" />
                <div className="h-6 bg-gray-200 rounded w-48 animate-pulse"></div>
            </CardTitle>
        </CardHeader>
        <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="border rounded-lg p-4 animate-pulse">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <div className="p-2 rounded-lg bg-gray-200"></div>
                                <div>
                                    <div className="h-4 bg-gray-200 rounded w-20 mb-1"></div>
                                    <div className="h-3 bg-gray-200 rounded w-24"></div>
                                </div>
                            </div>
                            <div className="flex flex-col gap-1">
                                <div className="h-5 bg-gray-200 rounded w-16"></div>
                                <div className="h-5 bg-gray-200 rounded w-16"></div>
                            </div>
                        </div>
                        <div className="mb-4">
                            <div className="grid grid-cols-4 gap-2 mb-2">
                                {[1, 2, 3, 4].map(j => (
                                    <div key={j} className="h-10 bg-gray-200 rounded"></div>
                                ))}
                            </div>
                            <div className="h-8 bg-gray-200 rounded w-40 mb-1"></div>
                            <div className="h-6 bg-gray-200 rounded w-32"></div>
                        </div>
                        <div className="space-y-3">
                            {[1, 2, 3, 4].map(j => (
                                <div key={j} className="flex items-center gap-3">
                                    <div className="w-16 h-4 bg-gray-200 rounded"></div>
                                    <div className="flex-1 h-4 bg-gray-200 rounded"></div>
                                    <div className="w-20 h-4 bg-gray-200 rounded"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </CardContent>
    </Card>
);

export default QuarterlyComparisonSkeleton;