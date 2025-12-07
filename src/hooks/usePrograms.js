import toast from "react-hot-toast"
import programService from "../services/programService"
import { useCallback, useEffect, useState } from "react"

export const usePrograms = (initialFilters = {}) => {
    const [programs, setPrograms] = useState([])
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
    const [statsLoading, setStatsLoading] = useState(false) // Renamed for consistency

    const [filters, setFilters] = useState({
        search: '',
        ...initialFilters
    })

    // const statsFetchedRef = useRef(false)

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
            setError(error.message); // FIX: typo messsage -> message
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
        fetchAllStats()
    }, [fetchAllStats])

    const refetchWithFilters = useCallback((newFilters) => {
        setFilters(newFilters);
        fetchPrograms(1, newFilters)
    }, [fetchPrograms]);

    const changePage = useCallback((page) => {
        fetchPrograms(page);
    }, [fetchPrograms]);

    useEffect(() => {
        fetchPrograms(1);
    }, [fetchPrograms]); 

    const addProgram = async (programData) => {
        try {
            const result = await programService.addProgram(programData)
            toast.success('Program added successfully') // FIX: typo

            // Refetch both programs and stats
            await Promise.all([
                fetchPrograms(pagination.page),
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
            toast.success("Program updated successfully") // FIX: typo

            setPrograms(prevPrograms => 
                prevPrograms.map(program => 
                    program.id === programId
                        ? { ...program, ...programData, ...result.data || result }
                        : program
                )
            );

            // Refetch price stats if price changed
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
            toast.success('Program deleted successfully') // FIX: typo

            setPrograms(prevPrograms =>
                prevPrograms.filter(program => program.id !== programId)
            )

            setPagination(prev => ({
                ...prev,
                total: prev.total - 1
            }))

            // Refetch stats after deletion
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
        programStats, 
        priceStats, // Make sure this is exported
        statsLoading, // Use consistent name
        refetchStats: fetchAllStats,
        fetchPriceStats // Export individual function if needed
    }
}