import impalaService from "../services/impalaService"
import toast from "react-hot-toast"
import { useCallback, useEffect, useState, useRef } from "react"

export const useImpala = (initialFilters = {}) => {
    const [participant, setParticipant] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
    })

    const [impalaStats, setImpalaStats] = useState(null)
    const [statsLoadingImpala, setStatsLoadingImpala] = useState(false)

    const [filters, setFilters] = useState({
        search: '',
        ...initialFilters
    })

    // Add ref to track if stats already fetched
    const statsFetchedRef = useRef(false)

    const fetchImpala = useCallback(async (page = 1, customFilters = null) => {
        try {
            setLoading(true)
            setError(null)

            const currentFilters = customFilters || filters

            const result = await impalaService.fetchImpala({
                page,
                limit: pagination.limit,
                ...currentFilters
            })

            setParticipant(result.data || [])
            setPagination(prev => ({
                ...prev,
                page: result.pagination?.page || page,
                total: result.pagination?.total || 0,
                totalPages: result.pagination?.totalPages || 0
            }))
        } catch (error) {
            console.error('Error fetching participant:', error)
            setError(error.message)
            // Don't show toast for 429 errors
            if (!error.message.includes('429')) {
                toast.error("Failed to load participant")
            }
        } finally {
            setLoading(false)
        }
    }, [filters, pagination.limit])

    // FIX: Add dependency array
    const fetchImpalaStats = useCallback(async () => {
        // Prevent multiple calls
        if (statsFetchedRef.current) return;
        statsFetchedRef.current = true;

        try {
            setStatsLoadingImpala(true)
                        
            const result = await impalaService.fetchImpala({
                page: 1,
                limit: 1
            })

            const totalImpala = result.pagination?.total || 0
            const previousMonthTotal = Math.max(0, totalImpala - Math.floor(totalImpala * 0.1))

            let percentageChange = '0%'
            let trend = 'up'
            let increaseCount = 0

            if (previousMonthTotal > 0) {
                const change = ((totalImpala - previousMonthTotal) / previousMonthTotal) * 100
                percentageChange = `${Math.abs(change).toFixed(1)}%`
                trend = change >= 0 ? 'up' : 'down'
                increaseCount = Math.max(0, totalImpala - previousMonthTotal)
            } else {
                percentageChange = '100%'
                trend = 'up'
                increaseCount = totalImpala
            }

            const statsData = {
                title: 'Total Participant',
                value: totalImpala.toLocaleString(),
                subtitle: `+ ${increaseCount}`,
                percentage: percentageChange,
                trend: trend,
                period: 'Last month',
                icon: 'FileText',
                color: 'orange',
                description: `${percentageChange} Last Month`
            }

            setImpalaStats(statsData)
        } catch (error) {
            console.error('Error fetching participant stats:', error)
            // Don't show toast for 429 errors
            if (!error.message.includes('429')) {
                toast.error('Failed to load participant stats')
            }
            
            // Set fallback stats
            setImpalaStats({
                title: 'Total Participant',
                value: '0',
                subtitle: '+ 0',
                percentage: '0%',
                trend: 'up',
                period: 'Last month',
                icon: 'FileText',
                color: 'orange',
                description: '0% Last Month'
            })
        } finally {
            setStatsLoadingImpala(false)
        }
    }, []) // FIX: Added empty dependency array

    // FIX: Only call once on mount
    useEffect(() => {
        fetchImpalaStats()
    }, []) // FIX: Remove fetchImpalaStats from dependencies

    const refreshData = useCallback(() => {
        fetchImpala(pagination.page)
    }, [fetchImpala, pagination.page])

    const handlePageChange = useCallback((newPage) => {
        fetchImpala(newPage)
    }, [fetchImpala])

    // FIX: Only call once on mount
    useEffect(() => {
        fetchImpala(1)
    }, []) // FIX: Empty dependency array

    return {
        participant, 
        loading, 
        error, 
        pagination, 
        filters, 
        fetchImpala, 
        refetch: () => fetchImpala(pagination.page), 
        handlePageChange, 
        refreshData, 
        impalaStats, 
        statsLoadingImpala, 
        refetchStats: fetchImpalaStats
    }
}