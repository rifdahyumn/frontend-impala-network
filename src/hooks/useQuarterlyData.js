// src/hooks/useQuarterlyData.js (optimized)
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import analyticsService from '../services/analyticsService';

// Cache untuk menyimpan data yang sudah difetch
const dataCache = new Map();

export const useQuarterlyData = (selectedYear, refreshTrigger) => {
    const [yearlyData, setYearlyData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [years, setYears] = useState([]);
    const [error, setError] = useState(null);
    const fetchRef = useRef(null);
    
    // Fungsi untuk mendapatkan cache key
    const getCacheKey = useCallback(() => {
        return `quarterly-data-${selectedYear || 'all'}`;
    }, [selectedYear]);
    
    // Check cache terlebih dahulu
    const getCachedData = useCallback(() => {
        const cacheKey = getCacheKey();
        return dataCache.get(cacheKey);
    }, [getCacheKey]);
    
    // Simpan ke cache
    const setCachedData = useCallback((data) => {
        const cacheKey = getCacheKey();
        dataCache.set(cacheKey, {
            data,
            timestamp: Date.now()
        });
    }, [getCacheKey]);
    
    // Fetch data function dengan optimasi
    const fetchYearlyData = useCallback(async () => {
        // Cancel previous request jika masih berjalan
        if (fetchRef.current) {
            clearTimeout(fetchRef.current);
        }
        
        // Check cache terlebih dahulu
        const cached = getCachedData();
        if (cached && (Date.now() - cached.timestamp < 5 * 60 * 1000)) { // 5 menit cache
            setYearlyData(cached.data.data);
            setYears(cached.data.years);
            setLoading(false);
            return;
        }
        
        setLoading(true);
        setError(null);
        
        try {
            // Debounce request
            fetchRef.current = setTimeout(async () => {
                try {
                    const data = await analyticsService.fetchYearlyComparison({ 
                        years: 'auto',
                        includeQuarterly: true,
                        cache: true
                    });
                    
                    const dataYears = Object.keys(data)
                        .map(y => parseInt(y))
                        .filter(y => !isNaN(y))
                        .sort((a, b) => a - b);
                    
                    setYearlyData(data);
                    setYears(dataYears);
                    
                    setCachedData({
                        data,
                        years: dataYears
                    });
                    
                } catch (err) {
                    console.error('Error fetching quarterly data:', err);
                    setError(err.message || 'Failed to fetch data');
                    
                    if (!getCachedData()) {
                        const currentYear = new Date().getFullYear();
                        const yearList = [currentYear - 2, currentYear - 1, currentYear];
                        const mockData = analyticsService.getMockData();
                        
                        setYearlyData(mockData);
                        setYears(yearList);
                        
                        setCachedData({
                            data: mockData,
                            years: yearList
                        });
                    }
                } finally {
                    setLoading(false);
                    fetchRef.current = null;
                }
            }, 300);
        } catch (err) {
            setLoading(false);
            setError(err.message);
        }
    }, [getCachedData, setCachedData]);
    

    useEffect(() => {
        fetchYearlyData();
    }, [fetchYearlyData]);
    
    const preCalculatedData = useMemo(() => {
        if (!yearlyData || !years.length) return null;
        
        const latestYear = years[years.length - 1];
        const metrics = ['clients', 'programs', 'participants', 'revenue'];
        const result = {};
        
        // Loop yang lebih efisien
        for (const metricId of metrics) {
            const yearlyDataForLatestYear = yearlyData[latestYear];
            if (!yearlyDataForLatestYear?.quarterly?.[metricId]) continue;
            
            const quarterlyData = yearlyDataForLatestYear.quarterly[metricId];
            const quarterTotals = {};
            let maxValue = 0;
            
            // Optimasi loop quarter
            const quarters = ['q1', 'q2', 'q3', 'q4'];
            for (const quarter of quarters) {
                const total = quarterlyData[quarter]?.total || 0;
                quarterTotals[quarter] = total;
                if (total > maxValue) maxValue = total;
            }
            
            result[metricId] = {
                quarterTotals,
                maxValue,
                quarterlyData,
                latestYear
            };
        }
        
        return result;
    }, [yearlyData, years]);
    
    // Calculate quarterly summary dengan optimasi
    const quarterlySummary = useMemo(() => {
        if (!yearlyData || !years.length) return null;
        
        const latestYear = years[years.length - 1];
        const latestYearData = yearlyData[latestYear];
        
        if (!latestYearData?.quarterly) return null;
        
        const summary = {};
        const quarters = ['q1', 'q2', 'q3', 'q4'];
        const metrics = ['clients', 'programs', 'participants', 'revenue'];
        
        for (const quarter of quarters) {
            const quarterData = {
                totalClients: 0,
                totalPrograms: 0,
                totalParticipants: 0,
                totalRevenue: 0,
                hasData: false
            };
            
            let hasData = false;
            
            for (const metric of metrics) {
                const value = latestYearData.quarterly?.[metric]?.[quarter]?.total || 0;
                quarterData[`total${metric.charAt(0).toUpperCase() + metric.slice(1)}`] = value;
                
                if (value > 0) hasData = true;
            }
            
            quarterData.hasData = hasData;
            
            // Tambah trend dan performance calculation
            if (hasData) {
                const prevYear = latestYear - 1;
                const prevYearData = yearlyData[prevYear];
                
                if (prevYearData?.quarterly) {
                    // Calculate trends
                    for (const metric of metrics) {
                        const currentValue = quarterData[`total${metric.charAt(0).toUpperCase() + metric.slice(1)}`];
                        const prevValue = prevYearData.quarterly?.[metric]?.[quarter]?.total || 0;
                        
                        if (prevValue > 0) {
                            const trend = ((currentValue - prevValue) / prevValue) * 100;
                            quarterData[`${metric}Trend`] = trend;
                        }
                    }
                }
                
                // Determine performance
                const revenueTrend = quarterData.revenueTrend || 0;
                const clientsTrend = quarterData.clientsTrend || 0;
                
                if (revenueTrend > 20 && clientsTrend > 10) {
                    quarterData.performance = 'excellent';
                } else if (revenueTrend > 10 || clientsTrend > 5) {
                    quarterData.performance = 'good';
                } else if (revenueTrend > 0 || clientsTrend > 0) {
                    quarterData.performance = 'fair';
                } else {
                    quarterData.performance = 'needs-improvement';
                }
            }
            
            summary[quarter.toUpperCase()] = quarterData;
        }
        
        return summary;
    }, [yearlyData, years]);
    
    // Clear timeout on unmount
    useEffect(() => {
        return () => {
            if (fetchRef.current) {
                clearTimeout(fetchRef.current);
            }
        };
    }, []);
    
    return {
        // State
        yearlyData,
        years,
        loading,
        error,
        quarterlySummary,
        
        // Pre-calculated data untuk optimasi
        preCalculatedData,
        
        // Actions
        refreshData: fetchYearlyData,
        
        // Status
        hasData: !loading && yearlyData && years.length > 0 && Object.keys(yearlyData).length > 0
    };
};