import { useState, useMemo, useCallback, memo } from 'react';

const numberFormatCache = new Map();

const formatRevenue = (amount) => {
    if (!amount || amount === 0 || isNaN(amount)) return 'IDR 0';
    
    const cacheKey = `revenue_${amount}`;
    if (numberFormatCache.has(cacheKey)) {
        return numberFormatCache.get(cacheKey);
    }
    
    let result;
    if (amount >= 1000000000) {
        const billions = amount / 1000000000;
        result = `IDR ${billions % 1 === 0 ? billions.toFixed(0) : billions.toFixed(1)} B`;
    } else if (amount >= 1000000) {
        const millions = amount / 1000000;
        result = `IDR ${millions % 1 === 0 ? millions.toFixed(0) : millions.toFixed(1)} M`;
    } else if (amount >= 1000) {
        const thousands = amount / 1000;
        result = `IDR ${thousands % 1 === 0 ? thousands.toFixed(0) : thousands.toFixed(1)} K`;
    } else {
        result = `IDR ${amount.toLocaleString('id-ID')}`;
    }
    
    numberFormatCache.set(cacheKey, result);
    return result;
};

const formatCount = (count) => {
    if (!count || count === 0 || isNaN(count)) return '0';
    
    const cacheKey = `count_${count}`;
    if (numberFormatCache.has(cacheKey)) {
        return numberFormatCache.get(cacheKey);
    }
    
    let result;
    if (count >= 1000000) {
        const millions = count / 1000000;
        result = `${millions % 1 === 0 ? millions.toFixed(0) : millions.toFixed(1)} Jt`;
    } else if (count >= 1000) {
        const thousands = count / 1000;
        result = `${thousands % 1 === 0 ? thousands.toFixed(0) : thousands.toFixed(1)} Rb`;
    } else {
        result = count.toLocaleString('id-ID');
    }
    
    numberFormatCache.set(cacheKey, result);
    return result;
};

const QuarterlyComparisonCard = memo(({ metric, yearlyData, years, preCalculated }) => {
    const [selectedQuarter, setSelectedQuarter] = useState('q1');
    
    const allQuarters = ['q1', 'q2', 'q3', 'q4'];
    
    const quarterLabels = {
        q1: 'Q1 (Jan-Mar)',
        q2: 'Q2 (Apr-Jun)',
        q3: 'Q3 (Jul-Sep)',
        q4: 'Q4 (Oct-Dec)'
    };
    
    const latestYear = useMemo(() => 
        preCalculated?.latestYear || (years && years.length > 0 ? years[years.length - 1] : new Date().getFullYear()),
        [preCalculated, years]
    );
    
    const quarterlyData = useMemo(() => 
        preCalculated?.quarterlyData || yearlyData?.[latestYear]?.quarterly?.[metric.id],
        [preCalculated, yearlyData, latestYear, metric.id]
    );
    
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
    
    // Max value dari preCalculated
    const maxQuarterValue = useMemo(() => 
        preCalculated?.maxValue || Math.max(...Object.values(quarterTotals)),
        [preCalculated, quarterTotals]
    );
    
    // Selected quarter data
    const selectedQuarterData = useMemo(() => 
        quarterlyData?.[selectedQuarter],
        [quarterlyData, selectedQuarter]
    );
    
    const latestValue = useMemo(() => 
        selectedQuarterData?.total || 0,
        [selectedQuarterData]
    );
    
    // Format function dengan cache
    const formatNumber = useCallback((num) => {
        if (metric.id === 'revenue') {
            return formatRevenue(num);
        }
        return formatCount(num);
    }, [metric.id]);
    
    // Quarter buttons - sederhana tanpa object complex
    const quarterButtons = allQuarters.map(quarter => ({
        quarter,
        label: quarter.toUpperCase(),
        value: quarterTotals[quarter],
        isSelected: quarter === selectedQuarter,
    }));
    
    const handleQuarterSelect = useCallback((quarter) => {
        setSelectedQuarter(quarter);
    }, []);
    
    const hasDataInSelectedQuarter = latestValue > 0;
    
    // QoQ Growth (hitung minimal)
    const quarterOverQuarterGrowth = useMemo(() => {
        const quarterIndex = allQuarters.indexOf(selectedQuarter);
        if (quarterIndex <= 0) return { percentage: '0%', isPositive: false };
        
        const prevQuarter = allQuarters[quarterIndex - 1];
        const currentTotal = latestValue;
        const prevTotal = quarterTotals[prevQuarter] || 0;
        
        if (prevTotal === 0) {
            return currentTotal > 0 
                ? { percentage: '+100%', isPositive: true }
                : { percentage: '0%', isPositive: false };
        }
        
        const growth = ((currentTotal - prevTotal) / prevTotal) * 100;
        return {
            percentage: `${growth >= 0 ? '+' : ''}${Math.abs(growth).toFixed(1)}%`,
            isPositive: growth >= 0
        };
    }, [selectedQuarter, latestValue, quarterTotals]);
    
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
                    {quarterButtons.map(({ quarter, label, isSelected }) => (
                        <button
                            key={quarter}
                            onClick={() => handleQuarterSelect(quarter)}
                            className={`py-2 px-3 rounded text-sm font-medium transition-all ${
                                isSelected
                                    ? 'bg-blue-500 text-white shadow-sm'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            <div>{label}</div>
                        </button>
                    ))}
                </div>
            </div>
            
            {/* Selected Quarter Details */}
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
                            {hasDataInSelectedQuarter ? formatNumber(latestValue) : '0'}
                        </div>
                    </div>
                </div>
                
                {hasDataInSelectedQuarter && quarterOverQuarterGrowth.percentage !== '0%' && (
                    <div className="mt-2 pt-2 border-t border-gray-200">
                        <div className="text-xs">
                            <div className="text-gray-500">vs Previous Quarter:</div>
                            <div className={`font-medium ${
                                quarterOverQuarterGrowth.isPositive ? 'text-green-600' : 'text-red-600'
                            }`}>
                                {quarterOverQuarterGrowth.percentage}
                            </div>
                        </div>
                    </div>
                )}
            </div>
            
            {/* Quarter Breakdown - SIMPLIFIED */}
            <div>
                <div className="text-xs text-gray-500 font-medium mb-2">Quarterly Breakdown:</div>
                <div className="space-y-3">
                    {allQuarters.map(quarter => {
                        const value = quarterTotals[quarter] || 0;
                        const hasData = value > 0;
                        const isSelected = quarter === selectedQuarter;
                        const percentage = maxQuarterValue > 0 ? (value / maxQuarterValue * 100) : 0;
                        
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
                                                <div className="text-[10px] text-gray-400">0</div>
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
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
});

QuarterlyComparisonCard.displayName = 'QuarterlyComparisonCard';
export default QuarterlyComparisonCard;