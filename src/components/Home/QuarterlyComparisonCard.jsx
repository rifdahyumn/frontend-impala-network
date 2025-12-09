import { useState, useMemo, useCallback, memo } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const QuarterlyComparisonCard = memo(({ metric, yearlyData, years, preCalculated }) => {
    const [selectedQuarter, setSelectedQuarter] = useState('q1');
    
    const allQuarters = ['q1', 'q2', 'q3', 'q4'];
    const quarterLabels = useMemo(() => ({
        q1: 'Q1 (Jan-Mar)',
        q2: 'Q2 (Apr-Jun)',
        q3: 'Q3 (Jul-Sep)',
        q4: 'Q4 (Oct-Dec)'
    }), []);
    
    const latestYear = useMemo(() => 
        years && years.length > 0 ? years[years.length - 1] : new Date().getFullYear(),
        [years]
    );
    
    const quarterlyData = useMemo(() => 
        preCalculated?.quarterlyData || yearlyData?.[latestYear]?.quarterly?.[metric.id],
        [preCalculated, yearlyData, latestYear, metric.id]
    );
    
    const selectedQuarterData = useMemo(() => 
        quarterlyData?.[selectedQuarter],
        [quarterlyData, selectedQuarter]
    );
    
    // Quarter totals (optimized)
    const quarterTotals = useMemo(() => {
        if (preCalculated?.quarterTotals) {
            return preCalculated.quarterTotals;
        }
        
        const totals = {};
        allQuarters.forEach(quarter => {
            totals[quarter] = quarterlyData?.[quarter]?.total || 0;
        });
        return totals;
    }, [preCalculated, quarterlyData]);
    
    // Max quarter value (optimized)
    const maxQuarterValue = useMemo(() => 
        preCalculated?.maxValue || Math.max(...Object.values(quarterTotals)),
        [preCalculated, quarterTotals]
    );
    
    // Latest value
    const latestValue = useMemo(() => 
        selectedQuarterData?.total || 0,
        [selectedQuarterData]
    );
    
    // Format numbers (memoized)
    const formatNumber = useCallback((num) => {
        if (metric.id === 'revenue') {
            return formatRevenue(num);
        }
        return formatCount(num);
    }, [metric.id]);
    
    const formatRevenue = useCallback((amount) => {
        if (!amount || amount === 0 || isNaN(amount)) return 'Rp 0';
        
        if (amount >= 1000000000) {
            const billions = amount / 1000000000;
            return `Rp ${billions % 1 === 0 ? billions.toFixed(0) : billions.toFixed(1)} Miliar`;
        } 
        if (amount >= 1000000) {
            const millions = amount / 1000000;
            return `Rp ${millions % 1 === 0 ? millions.toFixed(0) : millions.toFixed(1)} Juta`;
        }
        if (amount >= 1000) {
            const thousands = amount / 1000;
            return `Rp ${thousands % 1 === 0 ? thousands.toFixed(0) : thousands.toFixed(1)} Ribu`;
        }
        
        return `Rp ${amount.toLocaleString('id-ID')}`;
    }, []);
    
    const formatCount = useCallback((count) => {
        if (!count || count === 0 || isNaN(count)) return '0';
        
        if (count >= 1000000) {
            const millions = count / 1000000;
            return `${millions % 1 === 0 ? millions.toFixed(0) : millions.toFixed(1)} Jt`;
        }
        if (count >= 1000) {
            const thousands = count / 1000;
            return `${thousands % 1 === 0 ? thousands.toFixed(0) : thousands.toFixed(1)} Rb`;
        }
        
        return count.toLocaleString('id-ID');
    }, []);
    
    // Growth calculations (memoized)
    const quarterOverQuarterGrowth = useMemo(() => {
        if (!quarterlyData) return { percentage: '0%', isPositive: false };
        
        const quarterIndex = allQuarters.indexOf(selectedQuarter);
        if (quarterIndex <= 0) return { percentage: '0%', isPositive: false };
        
        const prevQuarter = allQuarters[quarterIndex - 1];
        const currentTotal = latestValue;
        const prevTotal = quarterlyData?.[prevQuarter]?.total || 0;
        
        if (prevTotal === 0) {
            return currentTotal > 0 
                ? { percentage: '+100%', isPositive: true }
                : { percentage: '0%', isPositive: false };
        }
        
        const growth = ((currentTotal - prevTotal) / prevTotal) * 100;
        return {
            percentage: `${growth >= 0 ? '+' : ''}${Math.abs(growth).toFixed(1)}%`,
            isPositive: growth >= 0,
            value: growth,
            comparedTo: prevQuarter
        };
    }, [quarterlyData, selectedQuarter, latestValue]);
    
    const yearOverYearGrowth = useMemo(() => {
        if (!years || years.length < 2) return { percentage: '0%', isPositive: false };
        
        const currentIndex = years.indexOf(latestYear);
        if (currentIndex <= 0) return { percentage: '0%', isPositive: false };
        
        const prevYear = years[currentIndex - 1];
        const currentTotal = quarterlyData?.[selectedQuarter]?.total || 0;
        const prevTotal = yearlyData?.[prevYear]?.quarterly?.[metric.id]?.[selectedQuarter]?.total || 0;
        
        if (prevTotal === 0) {
            return currentTotal > 0 
                ? { percentage: '+100%', isPositive: true }
                : { percentage: '0%', isPositive: false };
        }
        
        const growth = ((currentTotal - prevTotal) / prevTotal) * 100;
        return {
            percentage: `${growth >= 0 ? '+' : ''}${Math.abs(growth).toFixed(1)}%`,
            isPositive: growth >= 0,
            value: growth,
            comparedTo: `${selectedQuarter.toUpperCase()} ${prevYear}`
        };
    }, [years, latestYear, quarterlyData, selectedQuarter, yearlyData, metric.id]);
    
    // Check if selected quarter has data
    const hasDataInSelectedQuarter = latestValue > 0;
    
    // Event handlers
    const handleQuarterSelect = useCallback((quarter) => {
        setSelectedQuarter(quarter);
    }, []);
    
    // Memoized quarter buttons
    const quarterButtons = useMemo(() => 
        allQuarters.map(quarter => ({
            quarter,
            label: quarter.toUpperCase(),
            value: quarterTotals[quarter],
            isSelected: quarter === selectedQuarter,
            onClick: () => handleQuarterSelect(quarter)
        }))
    , [allQuarters, quarterTotals, selectedQuarter, handleQuarterSelect]);
    
    return (
        <div className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-white">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg" style={{ backgroundColor: `${metric.color}20` }}>
                        <metric.icon className="h-4 w-4" style={{ color: metric.color }} />
                    </div>
                    <div>
                        <h3 className="font-medium text-sm">{metric.title}</h3>
                    </div>
                </div>
            </div>
            
            {/* Quarter Selector */}
            <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                    <div className="text-xs text-gray-500 font-medium">Select Quarter:</div>
                    <div className="text-xs text-gray-500">Year: {latestYear}</div>
                </div>
                <div className="grid grid-cols-4 gap-2">
                    {quarterButtons.map(({ quarter, label, value, isSelected, onClick }) => (
                        <button
                            key={quarter}
                            onClick={onClick}
                            className={`py-2 px-3 rounded text-sm font-medium transition-all ${
                                isSelected
                                    ? 'bg-blue-500 text-white shadow-sm'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            <div>{label}</div>
                            <div className={`text-xs ${isSelected ? 'text-blue-100' : 'text-gray-500'}`}>
                                {formatNumber(value)}
                            </div>
                        </button>
                    ))}
                </div>
            </div>
            
            {/* Selected Quarter Details */}
            <SelectedQuarterDetails 
                quarterLabels={quarterLabels}
                selectedQuarter={selectedQuarter}
                hasDataInSelectedQuarter={hasDataInSelectedQuarter}
                formatNumber={formatNumber}
                latestValue={latestValue}
                quarterOverQuarterGrowth={quarterOverQuarterGrowth}
                yearOverYearGrowth={yearOverYearGrowth}
            />
            
            {/* Quarter Breakdown */}
            <QuarterBreakdown 
                allQuarters={allQuarters}
                quarterTotals={quarterTotals}
                maxQuarterValue={maxQuarterValue}
                selectedQuarter={selectedQuarter}
                quarterlyData={quarterlyData}
                formatNumber={formatNumber}
                metric={metric}
            />
            
            {/* Year Comparison */}
            <YearComparison 
                years={years}
                yearlyData={yearlyData}
                metric={metric}
                selectedQuarter={selectedQuarter}
                latestYear={latestYear}
                formatNumber={formatNumber}
            />
        </div>
    );
});

// Sub-components
const SelectedQuarterDetails = memo(({
    quarterLabels,
    selectedQuarter,
    hasDataInSelectedQuarter,
    formatNumber,
    latestValue,
    quarterOverQuarterGrowth,
    yearOverYearGrowth
}) => (
    <div className="mb-6 p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between mb-2">
            <div>
                <div className="text-xs text-gray-500">Current Quarter</div>
                <div className="text-lg font-bold text-gray-800">
                    {quarterLabels[selectedQuarter]}
                </div>
            </div>
            <div className="text-right">
                <div className="text-xs text-gray-500">Total</div>
                <div className={`text-2xl font-bold ${hasDataInSelectedQuarter ? 'text-gray-900' : 'text-gray-400'}`}>
                    {hasDataInSelectedQuarter ? formatNumber(latestValue) : 'No Data'}
                </div>
            </div>
        </div>
        
        {hasDataInSelectedQuarter && (
            <div className="mt-2 pt-2 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-2">
                    {quarterOverQuarterGrowth.comparedTo && (
                        <div className="text-xs">
                            <div className="text-gray-500">vs QoQ:</div>
                            <div className={`font-medium ${
                                quarterOverQuarterGrowth.isPositive ? 'text-green-600' : 'text-red-600'
                            }`}>
                                {quarterOverQuarterGrowth.percentage}
                            </div>
                        </div>
                    )}
                    {yearOverYearGrowth.comparedTo && (
                        <div className="text-xs">
                            <div className="text-gray-500">vs YoY:</div>
                            <div className={`font-medium ${
                                yearOverYearGrowth.isPositive ? 'text-blue-600' : 'text-orange-600'
                            }`}>
                                {yearOverYearGrowth.percentage}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        )}
    </div>
));

const QuarterBreakdown = memo(({ 
    allQuarters,
    quarterTotals,
    maxQuarterValue,
    selectedQuarter,
    quarterlyData,
    formatNumber,
    metric
}) => (
    <div>
        <div className="text-xs text-gray-500 font-medium mb-2">Quarterly Breakdown:</div>
        <div className="space-y-3">
            {allQuarters.map(quarter => {
                const value = quarterTotals[quarter] || 0;
                const hasData = value > 0;
                const isSelected = quarter === selectedQuarter;
                const percentage = maxQuarterValue > 0 ? (value / maxQuarterValue * 100) : 0;
                const count = quarterlyData?.[quarter]?.count || 0;
                
                return (
                    <div key={quarter} className="flex items-center gap-3">
                        <div className="w-16">
                            <div className={`text-sm font-medium ${isSelected ? 'text-blue-600' : 'text-gray-700'}`}>
                                {quarter.toUpperCase()}
                            </div>
                        </div>
                        
                        <div className="flex-1">
                            <div className="relative h-6 bg-gray-100 rounded-full overflow-hidden">
                                {hasData ? (
                                    <div 
                                        className={`absolute top-0 left-0 h-full rounded-full transition-all duration-300 ${
                                            isSelected ? 'bg-blue-500' : 'bg-blue-200'
                                        }`}
                                        style={{ width: `${percentage}%` }}
                                    >
                                        <div className="absolute inset-0 flex items-center justify-end pr-2">
                                            <span className="text-[10px] font-medium text-white">
                                                {percentage.toFixed(0)}%
                                            </span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
                                        <div className="text-[10px] text-gray-400">No Data</div>
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        <div className="w-20 text-right">
                            <div className={`text-sm font-medium ${
                                hasData ? (isSelected ? 'text-blue-700' : 'text-gray-700') : 'text-gray-400'
                            }`}>
                                {formatNumber(value)}
                            </div>
                            {hasData && count > 0 && (
                                <div className="text-xs text-gray-500">
                                    {count} {metric.id === 'revenue' ? 'transaksi' : 'items'}
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    </div>
));

const YearComparison = memo(({ years, yearlyData, metric, selectedQuarter, latestYear, formatNumber }) => (
    <div className="mt-4 pt-3 border-t border-gray-200">
        <div className="text-xs text-gray-500 mb-2">Year Comparison for {selectedQuarter.toUpperCase()}:</div>
        <div className="flex items-center justify-between">
            {years?.map(year => {
                const value = yearlyData?.[year]?.quarterly?.[metric.id]?.[selectedQuarter]?.total || 0;
                const hasData = value > 0;
                const isLatestYear = year === latestYear;
                
                return (
                    <div key={year} className="text-center">
                        <div className={`text-xs font-medium ${hasData ? '' : 'text-gray-400'}`}>
                            {year}
                        </div>
                        <div className={`text-sm font-bold ${isLatestYear ? 'text-blue-600' : 'text-gray-600'}`}>
                            {hasData ? formatNumber(value) : '-'}
                        </div>
                    </div>
                );
            })}
        </div>
    </div>
));

QuarterlyComparisonCard.displayName = 'QuarterlyComparisonCard';

export default QuarterlyComparisonCard;