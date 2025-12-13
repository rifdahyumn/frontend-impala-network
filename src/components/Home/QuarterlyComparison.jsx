import { memo, Suspense, lazy } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Calendar, TrendingUp, TrendingDown } from 'lucide-react';
import { useQuarterlyData } from '../../hooks/useQuarterlyData';
import { quarterlyMetrics } from '../../utils/quarterlyMetrics';
import QuarterlyComparisonSkeleton from './QuarterlyComparisonSkeleton';
import QuarterlyComparisonEmpty from './QuarterlyComparisonEmpty';

const LazyQuarterlyComparisonCard = lazy(() => import('./QuarterlyComparisonCard'));
// const LazyQuarterSummaryCard = lazy(() => import('./QuarterSummaryCard'));

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
        <Card className="animate-fadeIn">
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-blue-600" />
                        <div>
                            <span>Quarterly Performance Analysis</span>
                            <div className="text-sm font-normal text-gray-500">
                                {years[0]} - {years[years.length - 1]}
                            </div>
                        </div>
                    </div>
                </CardTitle>
            </CardHeader>
            
            <CardContent>
                <div className="grid grid-cols-4 gap-4">
                    {quarterlyMetrics.map(metric => (
                        <Suspense 
                            key={metric.id} 
                            fallback={<QuarterlyCardSkeleton />}
                        >
                            <LazyQuarterlyComparisonCard
                                metric={metric}
                                yearlyData={yearlyData}
                                years={years}
                                preCalculated={preCalculatedData?.[metric.id]}
                            />
                        </Suspense>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
});

const QuarterlyCardSkeleton = () => (
    <div className="border rounded-lg p-4 animate-pulse bg-gray-50">
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
);

const SummaryCardSkeleton = () => (
    <div className="border rounded-lg p-4 animate-pulse bg-gray-50">
        <div className="flex items-center justify-between mb-4">
            <div className="h-6 bg-gray-200 rounded w-16"></div>
            <div className="h-8 bg-gray-200 rounded w-12"></div>
        </div>
        <div className="space-y-3">
            {[1, 2, 3].map(i => (
                <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
        </div>
    </div>
);

const styles = `
@keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}
.animate-fadeIn {
    animation: fadeIn 0.3s ease-out;
}
`;

if (typeof document !== 'undefined') {
    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
}

export default QuarterlyComparison;