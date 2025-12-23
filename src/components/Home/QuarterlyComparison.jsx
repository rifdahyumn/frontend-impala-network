import { memo, Suspense, lazy } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Calendar } from 'lucide-react';
import { useQuarterlyData } from '../../hooks/useQuarterlyData';
import { quarterlyMetrics } from '../../utils/quarterlyMetrics';
import QuarterlyComparisonSkeleton from './QuarterlyComparisonSkeleton';
import QuarterlyComparisonEmpty from './QuarterlyComparisonEmpty';

const LazyQuarterlyComparisonCard = lazy(() => import('./QuarterlyComparisonCard'));

const QuarterlyComparison = memo(({ selectedYear, refreshTrigger }) => {
    const { 
        yearlyData, 
        years, 
        loading, 
        error, 
        preCalculatedData,
        hasData 
    } = useQuarterlyData(selectedYear, refreshTrigger);
    
    if (loading) {
        return <QuarterlyComparisonSkeleton />;
    }
    
    if (!hasData || error) {
        return <QuarterlyComparisonEmpty error={error} />;
    }
    
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-blue-600" />
                        <div>
                            <span>Quarterly Performance Analysis</span>
                            <div className="text-sm font-normal text-gray-500">
                                {years[years.length - 1]}
                            </div>
                        </div>
                    </div>
                </CardTitle>
            </CardHeader>
            
            <CardContent>
                <Suspense fallback={<QuarterlyCardGridSkeleton />}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {quarterlyMetrics.map(metric => (
                            <LazyQuarterlyComparisonCard
                                key={metric.id}
                                metric={metric}
                                yearlyData={yearlyData}
                                years={years}
                                preCalculated={preCalculatedData?.[metric.id]}
                            />
                        ))}
                    </div>
                </Suspense>
            </CardContent>
        </Card>
    );
});

const QuarterlyCardGridSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
            <div key={i} className="border rounded-lg p-4 animate-pulse bg-gray-50">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-gray-200"></div>
                        <div>
                            <div className="h-4 bg-gray-200 rounded w-20"></div>
                        </div>
                    </div>
                </div>
                <div className="h-32 bg-gray-200 rounded"></div>
            </div>
        ))}
    </div>
);

export default QuarterlyComparison;