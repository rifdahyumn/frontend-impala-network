import { useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'
import AnalyticsService from '../services/analyticsService'

export const useMonthlyGrowth = (initialMetric = 'clients', initialYear = null) => {
    const [selectedMetric, setSelectedMetric] = useState(initialMetric)
    const [selectedYear, setSelectedYear] = useState(initialYear || new Date().getFullYear())
    const [availableYears, setAvailableYears] = useState([])
    const [loading, setLoading] = useState(false)
    const [growthData, setGrowthData] = useState([])
    const [error, setError] = useState(null)
    const [metadata, setMetadata] = useState({})

    useEffect(() => {
        const years = AnalyticsService.getAvailableYears()
        setAvailableYears(years)
        
        if (!initialYear) {
            setSelectedYear(new Date().getFullYear())
        }
    }, [initialYear])

    const fetchData = useCallback(async () => {
        setLoading(true)
        setError(null)
        
        try {
            const result = await AnalyticsService.fetchMonthlyGrowthData(selectedMetric, selectedYear)
            
            const formatted = AnalyticsService.formatMonthlyGrowthForFrontend(result.data, selectedMetric)
            
            setGrowthData(formatted)
            setMetadata(result.metadata || {})
            
            if (result.success) {
                if (!result.metadata?.isFallback) {
                    toast.success(`Loaded ${selectedMetric} data for ${selectedYear}`)
                } else {
                    toast.error(`Using fallback data for ${selectedMetric}`)
                }
            } else {
                setError(result.error)
                toast.error(`Failed to load data: ${result.error}`)
            }
        } catch (err) {
            console.error('Error in fetchData:', err)
            setError(err.message)
            toast.error(`Failed to load data: ${err.message}`)
        } finally {
            setLoading(false)
        }
    }, [selectedMetric, selectedYear])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    const handleYearChange = useCallback((change) => {
        setSelectedYear(prev => {
            const newYear = prev + change
            const currentYear = new Date().getFullYear()
            
            return Math.max(
                availableYears[0] || currentYear - 4,
                Math.min(newYear, currentYear)
            )
        })
    }, [availableYears])

    const handleSetYear = useCallback((year) => {
        const currentYear = new Date().getFullYear()
        const minYear = availableYears[0] || currentYear - 4
        
        if (year >= minYear && year <= currentYear) {
            setSelectedYear(year)
        }
    }, [availableYears])

    const refreshData = useCallback(() => {
        fetchData()
    }, [fetchData])

    const formatNumber = useCallback((number) => {
        return AnalyticsService.formatNumber(number, selectedMetric)
    }, [selectedMetric])

    return {
        selectedMetric,
        selectedYear,
        availableYears,
        growthData,
        loading,
        error,
        metadata,
        setSelectedMetric,
        setSelectedYear: handleSetYear,
        handleYearChange,
        refreshData,
        formatNumber,
        dataCount: growthData.length,
        hasData: growthData.length > 0,
        isFallback: metadata?.isFallback || false
    }
}