import { TrendingUp, TrendingDown } from 'lucide-react';

const YearlyComparisonCard = ({ metric, yearlyData, years }) => {
    const Icon = metric.icon;
    
    const latestYear = years && years.length > 0 ? years[years.length - 1] : new Date().getFullYear();
    const latestYearData = yearlyData?.[latestYear]?.[metric.id];
    const latestValue = latestYearData?.total || 0;
    
    const calculateYearOverYearGrowth = () => {
        if (!years || years.length < 2) return { percentage: '0%', isPositive: false };
        
        const currentIndex = years.indexOf(latestYear);
        if (currentIndex <= 0) return { percentage: '0%', isPositive: false };
        
        const prevYear = years[currentIndex - 1];
        const currentTotal = latestValue;
        const prevTotal = yearlyData?.[prevYear]?.[metric.id]?.total || 0;
        
        if (prevTotal === 0) {
            return currentTotal > 0 
                ? { percentage: '+100%', isPositive: true }
                : { percentage: '0%', isPositive: false };
        }
        
        const growth = ((currentTotal - prevTotal) / prevTotal) * 100;
        const isPositive = growth >= 0;
        const percentage = `${growth >= 0 ? '+' : ''}${Math.abs(growth).toFixed(1)}%`;
        
        return { percentage, isPositive, value: growth };
    };
    
    const yearOverYearGrowth = calculateYearOverYearGrowth();
    
    const hasAnyData = years.some(year => {
        const yearData = yearlyData?.[year]?.[metric.id];
        return yearData?.total > 0;
    });
    
    const calculateMaxValue = () => {
        let max = 0;
        years?.forEach(year => {
            const yearData = yearlyData?.[year]?.[metric.id];
            const value = yearData?.total || 0;
            if (value > max) max = value;
        });
        return max;
    };
    
    const maxValue = calculateMaxValue();
    
    const calculateGrowthForYear = (currentYear) => {
        const currentIndex = years.indexOf(currentYear);
        if (currentIndex <= 0) return { percentage: '0%', isPositive: false };
        
        const prevYear = years[currentIndex - 1];
        const currentTotal = yearlyData?.[currentYear]?.[metric.id]?.total || 0;
        const prevTotal = yearlyData?.[prevYear]?.[metric.id]?.total || 0;
        
        if (prevTotal === 0) {
            return currentTotal > 0 
                ? { percentage: '+100%', isPositive: true }
                : { percentage: '0%', isPositive: false };
        }
        
        const growth = ((currentTotal - prevTotal) / prevTotal) * 100;
        const isPositive = growth >= 0;
        const percentage = `${growth >= 0 ? '+' : ''}${Math.abs(growth).toFixed(1)}%`;
        
        return { percentage, isPositive };
    };
    
    return (
        <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
            
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg" style={{ backgroundColor: `${metric.color}20` }}>
                        <Icon className="h-4 w-4" style={{ color: metric.color }} />
                    </div>
                    <div>
                        <h3 className="font-medium text-sm">{metric.title}</h3>
                        <p className="text-xs text-gray-500">{metric.description}</p>
                    </div>
                </div>
                
                
                {hasAnyData && yearOverYearGrowth && (
                    <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${
                        yearOverYearGrowth.isPositive 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                    }`}>
                        {yearOverYearGrowth.isPositive ? (
                            <TrendingUp className="h-3 w-3" />
                        ) : (
                            <TrendingDown className="h-3 w-3" />
                        )}
                        <span>{yearOverYearGrowth.percentage}</span>
                    </div>
                )}
            </div>
            
            
            <div className="mb-4">
                <div className="text-2xl font-bold">
                    {metric.format(latestValue)}
                </div>
                <div className="text-sm text-gray-500">
                    In Year {latestYear}
                    {!hasAnyData && (
                        <span className="ml-2 text-amber-600">(Belum ada data)</span>
                    )}
                </div>
            </div>
            
            
            <div className="space-y-2">
                <div className="text-xs text-gray-500 mb-1">Year-to-date comparison:</div>
                {years?.map(year => {
                    const yearData = yearlyData?.[year]?.[metric.id];
                    const value = yearData?.total || 0;
                    const isLatestYear = year === latestYear;
                    const hasDataForThisYear = value > 0;
                    const percentage = maxValue > 0 ? (value / maxValue * 100) : 0;
                    const yearGrowth = calculateGrowthForYear(year);
                    
                    return (
                        <div key={year} className="flex items-center gap-2">
                            <div className="w-10">
                                <div className="text-xs text-gray-600">{year}</div>
                                {!hasDataForThisYear && (
                                    <div className="text-[10px] text-gray-400">-</div>
                                )}
                            </div>
                            <div className="flex-1">
                                <div className="relative h-4 bg-gray-100 rounded overflow-hidden">
                                    {hasDataForThisYear ? (
                                        <div 
                                            className={`absolute top-0 left-0 h-full rounded ${
                                                isLatestYear 
                                                    ? 'bg-blue-500' 
                                                    : year === latestYear - 1
                                                        ? 'bg-blue-400'
                                                        : 'bg-blue-300'
                                            }`}
                                            style={{ width: `${percentage}%` }}
                                        />
                                    ) : (
                                        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
                                            <div className="text-[10px] text-gray-400">Tidak ada data</div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="w-16 text-right">
                                <div className={`text-xs font-medium ${
                                    hasDataForThisYear ? '' : 'text-gray-400'
                                }`}>
                                    {metric.format(value)}
                                </div>
                                {hasDataForThisYear && yearGrowth && (
                                    <div className={`text-[10px] ${
                                        yearGrowth.isPositive ? 'text-green-600' : 'text-red-600'
                                    }`}>
                                        {yearGrowth.isPositive ? '↑' : '↓'} {yearGrowth.percentage}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
            
        </div>
    );
};

export default YearlyComparisonCard;