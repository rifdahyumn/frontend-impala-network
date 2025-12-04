import toast from "react-hot-toast"
import programService from "../services/programService"
import { useCallback, useEffect, useState } from "react"

export const usePrograms = (initialFilters = {}) => {
    const [programs, setPrograms] = useState([])
    const [allPrograms, setAllPrograms] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
    })

    const [programStats, setProgramStats] = useState(null)
    const [priceStats, setPriceStats] = useState(null)
    const [statsLoading, setStatsLoading] = useState(false)

    const [filters, setFilters] = useState({
        search: '',
        ...initialFilters
    })

    const fetchAllPrograms = useCallback(async () => {
        try {
            const result = await programService.fetchAllProgramForAnalytics()
            
            if (result.data) {
                setAllPrograms(result.data || [])
                
            } else {
                console.error('No data in fetchAllProgramForAnalytics response')
            }
        } catch (error) {
            console.error('Error fetching all programs:', error)
            toast.error('Failed to load all programs for analytics')
        }
    }, [])

    const fetchPrograms = useCallback(async (page = 1, customFilters = null) => {
        try {
            setLoading(true)
            setError(null)

            const currentFilters = customFilters || filters

            const result = await programService.fetchPrograms({
                page,
                limit: pagination.limit,
                ...currentFilters  
            })

            setPrograms(result.data || [])
            setPagination(prev => ({
                ...prev,
                page: result.metadata?.pagination?.page || page,
                total: result.metadata?.pagination?.total || 0,
                totalPages: result.metadata?.pagination?.totalPages || 0,
            }))
        } catch (error) {
            console.error('Error fetching programs:', error)
            setError(error.message)
            toast.error('Failed to load programs')
        } finally {
            setLoading(false)
        }
    }, [filters, pagination.limit])

    const fetchProgramsStats = useCallback(async () => {
        try {
            setStatsLoading(true)
            
            const result = await programService.fetchProgramsStats()

            if (result.success) {
                setProgramStats(result.data)
            } else {
                throw new Error(result.message || 'Failed to fetch program stats')
            }
        } catch (error) {
            console.error('Error fetching program stats:', error)
            toast.error('Failed to load program stats')
        } finally {
            setStatsLoading(false)
        }
    }, [])

    const fetchPriceStats = useCallback(async () => {
        try {
            setStatsLoading(true)

            const result = await programService.fetchPriceStats()

            if (result.success) {
                setPriceStats(result.data)
            } else {
                throw new Error(result.message || 'Failed to fetch price stats')
            }
        } catch (error) {
            console.error('Error fetching price stats:', error)
            toast.error('Failed to load price statistics')
            
            setPriceStats({
                title: "Total Price",
                value: "0",
                subtitle: "from 0 programs",
                percentage: "0%",
                trend: "up",
                period: "Last Month",
                icon: "DollarSign",
                color: "purple",
                description: "0% Last Month"
            })
        } finally {
            setStatsLoading(false)
        }
    }, [])

    const fetchAllStats = useCallback(async () => {
        try {
            setStatsLoading(true)
            await Promise.all([
                fetchProgramsStats(),
                fetchPriceStats()
            ])
        } catch (error) {
            console.error('Error fetching all stats:', error)
        } finally {
            setStatsLoading(false)
        }
    }, [fetchProgramsStats, fetchPriceStats])

    useEffect(() => {
        const initializeData = async () => {
            try {
                setLoading(true)
                
                await Promise.all([
                    fetchPrograms(1),
                    fetchAllPrograms(),
                    fetchAllStats()
                ])
                
            } catch (error) {
                console.error('Error initializing program data:', error)
                toast.error('Failed to initialize program data')
            } finally {
                setLoading(false)
            }
        }
        
        initializeData()
    }, [])

    const refetchWithFilters = useCallback((newFilters) => {
        setFilters(newFilters);
        fetchPrograms(1, newFilters)
    }, [fetchPrograms]);

    const changePage = useCallback((page) => {
        fetchPrograms(page);
    }, [fetchPrograms]);

    const refreshAllData = useCallback(async () => {
        try {
            setLoading(true)
            await Promise.all([
                fetchPrograms(pagination.page),
                fetchAllPrograms(),
                fetchAllStats()
            ])
            toast.success('All program data refreshed')
        } catch (error) {
            toast.error('Failed to refresh data', error)
        } finally {
            setLoading(false)
        }
    }, [fetchPrograms, pagination.page, fetchAllPrograms, fetchAllStats])

    const addProgram = async (programData) => {
        try {
            const result = await programService.addProgram(programData)
            toast.success('Program added successfully')

            await Promise.all([
                fetchPrograms(pagination.page),
                fetchAllPrograms(),
                fetchAllStats()
            ])
            return result;
        } catch (error) {
            toast.error('Failed to add program')
            throw error;
        }
    }

    const updateProgram = async (programId, programData) => {
        try {
            setLoading(true)
            const result = await programService.updateProgram(programId, programData)
            toast.success("Program updated successfully")

            setPrograms(prevPrograms => 
                prevPrograms.map(program => 
                    program.id === programId
                        ? { ...program, ...programData, ...result.data || result }
                        : program
                )
            );

            setAllPrograms(prevAll => 
                prevAll.map(program => 
                    program.id === programId
                        ? { ...program, ...programData, ...result.data || result }
                        : program
                )
            );

            if (programData.price !== undefined) {
                await fetchPriceStats()
            }

            return result.data || result;
        } catch (error) {
            toast.error('Failed to update program')
            throw error;
        } finally {
            setLoading(false)
        }
    }

    const deleteProgram = async (programId) => {
        try {
            setLoading(true)
            await programService.deleteProgram(programId)
            toast.success('Program deleted successfully')

            setPrograms(prevPrograms =>
                prevPrograms.filter(program => program.id !== programId)
            )

            setAllPrograms(prevAll =>
                prevAll.filter(program => program.id !== programId)
            )

            setPagination(prev => ({
                ...prev,
                total: prev.total - 1
            }))

            await fetchAllStats()
        } catch (error) {
            toast.error('Failed to delete program')
            throw error;
        } finally {
            setLoading(false)
        }
    }

    return {
        programs, 
        allPrograms,   
        loading, 
        error, 
        pagination, 
        filters, 
        setFilters: refetchWithFilters, 
        fetchPrograms: changePage, 
        addProgram, 
        updateProgram, 
        deleteProgram, 
        setPagination, 
        refetch: () => fetchPrograms(pagination.page),
        refreshAllData,
        programStats, 
        priceStats,
        statsLoading,
        refetchStats: fetchAllStats,
        fetchPriceStats,
        fetchAllPrograms
    }
}