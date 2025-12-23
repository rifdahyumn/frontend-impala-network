import { useState, useEffect, useCallback, useMemo } from 'react';
import analyticsService from '../services/analyticsService';

const dataCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000;

export const useQuarterlyData = (selectedYear, refreshTrigger) => {
    const [state, setState] = useState({
        yearlyData: {},
        years: [],
        preCalculated: {},
        summary: {},
        loading: true,
        error: null
    });
    
    const getCacheKey = useCallback(() => {
        return `quarterly-data-${selectedYear || 'all'}-${refreshTrigger || 0}`;
    }, [selectedYear, refreshTrigger]);
    
    const getCachedData = useCallback(() => {
        const cacheKey = getCacheKey();
        const cached = dataCache.get(cacheKey);
        
        if (cached && (Date.now() - cached.timestamp < CACHE_DURATION)) {
            return cached;
        }
        
        dataCache.delete(cacheKey);
        return null;
    }, [getCacheKey]);
    
    const setCachedData = useCallback((data) => {
        const cacheKey = getCacheKey();
        dataCache.set(cacheKey, {
            ...data,
            timestamp: Date.now()
        });
    }, [getCacheKey]);
    
    const fetchData = useCallback(async () => {
        const cached = getCachedData();
        if (cached) {
            setState(prev => ({
                ...prev,
                ...cached,
                loading: false,
                error: null
            }));
            return;
        }
        
        setState(prev => ({ ...prev, loading: true, error: null }));
        
        try {
            const result = await analyticsService.fetchQuarterOptimized({
                years: selectedYear 
                    ? `${selectedYear - 2},${selectedYear - 1},${selectedYear}`
                    : undefined
            });
            
            if (result.success && result.data) {
                const apiData = result.data;
                
                const newState = {
                    yearlyData: apiData.yearlyData || {},
                    years: apiData.years || [],
                    preCalculated: apiData.preCalculated || {},
                    summary: apiData.summary || {},
                    loading: false,
                    error: null
                };
                
                setState(newState);
                
                setCachedData({
                    yearlyData: newState.yearlyData,
                    years: newState.years,
                    preCalculated: newState.preCalculated,
                    summary: newState.summary
                });
                
            } else {
                throw new Error(result.message || 'Failed to fetch data');
            }
            
        } catch (err) {
            console.error('Fetch error:', err);
            
            setState(prev => ({
                ...prev,
                loading: false,
                error: err.message,
                yearlyData: {},
                years: [],
                preCalculated: {},
                summary: {}
            }));
        }
    }, [getCachedData, setCachedData, selectedYear, refreshTrigger]);
    
    useEffect(() => {
        fetchData();
    }, [fetchData]);
    
    const preCalculatedData = useMemo(() => {
        return state.preCalculated || {};
    }, [state.preCalculated]);
    
    const hasData = useMemo(() => {
        if (state.loading) return false;
        if (state.error) return false;
        
        if (preCalculatedData && Object.keys(preCalculatedData).length > 0) {
            return true;
        }
        
        const hasYears = state.years && state.years.length > 0;
        const hasYearlyData = state.yearlyData && Object.keys(state.yearlyData).length > 0;
        
        const result = hasYears && hasYearlyData;
        
        return result;
    }, [state.loading, state.error, state.years, state.yearlyData, preCalculatedData]);
    
    return {
        yearlyData: state.yearlyData,
        years: state.years,
        loading: state.loading,
        error: state.error,
        hasData,
        preCalculatedData,
        quarterlySummary: state.summary,
        
        refreshData: useCallback(() => {
            const cacheKey = getCacheKey();
            dataCache.delete(cacheKey);
            
            if (analyticsService.clearCache) {
                analyticsService.clearCache();
            }
            
            fetchData();
        }, [getCacheKey, fetchData]),
        
        clearError: useCallback(() => {
            setState(prev => ({ ...prev, error: null }));
        }, [])
    };
};

export default useQuarterlyData;