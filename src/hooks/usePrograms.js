import toast from "react-hot-toast"
import programService from "../services/programService"
import { useState, useEffect, useCallback, useRef } from "react"
import { debounce } from 'lodash'

export const usePrograms = (initialFilters = {}) => {
    const [programs, setPrograms] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
        isShowAllMode: false,
        showingAllResults: false,
        searchTerm: ''
    })

    const [programStats, setProgramStats] = useState(null)
    const [priceStats, setPriceStats] = useState(null)
    const [statsLoading, setStatsLoading] = useState(false)
    const [showAllOnSearch, setShowAllOnSearch] = useState(false)
    const [allPrograms, setAllPrograms] = useState([])
    const [allProgramsLoading, setAllProgramsLoading] = useState(false)

    const filtersRef = useRef({
        search: '',
        status: '',
        category: '',
        client: '',
        ...initialFilters
    })
    
    const abortControllerRef = useRef(null)
    const lastRequestIdRef = useRef(0)
    
    const [filters, setFilters] = useState({
        search: filtersRef.current.search,
        status: filtersRef.current.status,
        category: filtersRef.current.category,
        client: filtersRef.current.client
    })

    const fetchAllPrograms = useCallback(async () => {
        try {
            setAllProgramsLoading(true)
            
            const result = await programService.fetchAllPrograms()
            
            setAllPrograms(result.data || [])
            return result.data || []
            
        } catch (error) {
            console.error('Error fetching all programs:', error)
            setAllPrograms([])
            return []
        } finally {
            setAllProgramsLoading(false)
        }
    }, [])

    const fetchPrograms = useCallback(async (page = 1, customFilters = null, showAll = false, requestId = null) => {
        try {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort()
            }
            
            abortControllerRef.current = new AbortController()
            
            const currentRequestId = requestId || Date.now()
            lastRequestIdRef.current = currentRequestId
            
            setLoading(true)
            setError(null)

            const currentFilters = customFilters || filtersRef.current

            const params = {
                page,
                limit: pagination.limit,
                ...(currentFilters.search && { search: currentFilters.search }),
                ...(currentFilters.status && { status: currentFilters.status }),
                ...(currentFilters.category && { category: currentFilters.category }),
                ...(currentFilters.client && { client: currentFilters.client }),
                ...(currentFilters.search && showAll && { showAllOnSearch: 'true' })
            }

            const result = await programService.fetchPrograms(params)

            if (currentRequestId !== lastRequestIdRef.current) {
                return
            }

            setPrograms(result.data || [])
            
            const paginationData = result.metadata?.pagination || {}
            setPagination(prev => ({
                page: paginationData.page || page,
                limit: paginationData.limit || pagination.limit,
                total: paginationData.total || 0,
                totalPages: paginationData.totalPages || 0,
                isShowAllMode: paginationData.isShowAllMode || false,
                showingAllResults: paginationData.showingAllResults || false,
                searchTerm: currentFilters.search || ''
            }))

            if (currentFilters.search && paginationData.showingAllResults) {
                setShowAllOnSearch(true)
            } else if (!currentFilters.search) {
                setShowAllOnSearch(false)
            }

        } catch (error) {
            if (error.name === 'AbortError') {
                return
            }
            
            console.error(' Error fetching programs:', error)
            setError(error.message)
            toast.error('Failed to load programs')
        } finally {
            setLoading(false)
        }
    }, [pagination.limit])

    const debouncedFetchRef = useRef(
        debounce((page, customFilters, showAll) => {
            const requestId = Date.now()
            fetchPrograms(page, customFilters, showAll, requestId)
        }, 500)
    )

    useEffect(() => {
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort()
            }
            
            if (debouncedFetchRef.current) {
                debouncedFetchRef.current.cancel()
            }
        }
    }, [])

    const updateFiltersAndFetch = useCallback((newFilters, showAll = false) => {
        const updatedFilters = {
            ...filtersRef.current,
            ...newFilters
        }
        filtersRef.current = updatedFilters
        
        setFilters(prev => ({
            search: updatedFilters.search,
            status: updatedFilters.status,
            category: updatedFilters.category,
            client: updatedFilters.client
        }))
        
        if (!newFilters.search && showAllOnSearch) {
            setShowAllOnSearch(false)
        }
        
        if (debouncedFetchRef.current) {
            debouncedFetchRef.current(1, updatedFilters, showAll)
        }
    }, [showAllOnSearch])

    const toggleShowAllOnSearch = useCallback((value) => {
        setShowAllOnSearch(value)
        
        if (filtersRef.current.search) {
            if (debouncedFetchRef.current) {
                debouncedFetchRef.current(1, filtersRef.current, value)
            }
        }
    }, [])

    const clearFilters = useCallback(() => {
        
        const clearedFilters = {
            search: '',
            status: '',
            category: '',
            client: ''
        }
        
        filtersRef.current = clearedFilters
        
        setFilters(clearedFilters)
        setShowAllOnSearch(false)
        
        fetchPrograms(1, clearedFilters, false)
    }, [fetchPrograms])

    const clearSearch = useCallback(() => {
        
        const updatedFilters = {
            ...filtersRef.current,
            search: ''
        }
        
        filtersRef.current = updatedFilters
        
        setFilters(prev => ({
            ...prev,
            search: ''
        }))
        setShowAllOnSearch(false)
        
        fetchPrograms(1, updatedFilters, false)
    }, [fetchPrograms])

    const searchPrograms = useCallback((searchTerm, showAll = false) => {
        
        const searchFilters = {
            ...filtersRef.current,
            search: searchTerm
        }
        
        filtersRef.current = searchFilters
        
        setFilters(prev => ({
            ...prev,
            search: searchTerm
        }))
        
        if (searchTerm) {
            setShowAllOnSearch(showAll)
        } else {
            setShowAllOnSearch(false)
        }
        
        if (debouncedFetchRef.current) {
            debouncedFetchRef.current(1, searchFilters, showAll)
        }
    }, [])

    const refreshData = useCallback(() => {
        fetchPrograms(pagination.page, filtersRef.current, showAllOnSearch)
    }, [fetchPrograms, pagination.page, showAllOnSearch])

    const refreshAllData = useCallback(async () => {
        try {
            await fetchPrograms(pagination.page, filtersRef.current, showAllOnSearch);
            await fetchAllPrograms();
            // await fetchAllStats();

            return true;
        } catch (error) {
            console.error('Error refreshing all data:', error);
            toast.error('Failed to refresh data');
            throw error;
        }
    }, [fetchPrograms, pagination.page, filtersRef, showAllOnSearch, fetchAllPrograms])

    const handlePageChange = useCallback((newPage) => {
        fetchPrograms(newPage, filtersRef.current, showAllOnSearch)
    }, [fetchPrograms, showAllOnSearch])

    const resetToPaginationMode = useCallback(() => {
        setShowAllOnSearch(false)

        if (filtersRef.current.search) {
            if (debouncedFetchRef.current) {
                debouncedFetchRef.current(1, filtersRef.current, false)
            }
        }
    }, [])

    useEffect(() => {
        fetchPrograms(1, filtersRef.current, false)
        fetchAllPrograms()
    }, [])

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

    const exportPrograms = useCallback(async (format = 'csv') => {
        try {
            setLoading(true)

            let dataToExport
            
            if (pagination.showingAllResults && format === 'csv') {
                dataToExport = programs
                
                const csvContent = programService.convertToCSV(dataToExport)
                
                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
                const url = window.URL.createObjectURL(blob)
                const link = document.createElement('a')
                link.href = url
                link.setAttribute('download', `programs_${filtersRef.current.search || 'all'}_${new Date().toISOString().split('T')[0]}.csv`)
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
                window.URL.revokeObjectURL(url)
                
                toast.success(`Exported ${dataToExport.length} programs to CSV`)
            } else {
                const result = await programService.fetchAllPrograms(filtersRef.current)
                dataToExport = result.data || []
                
                if (format === 'csv') {
                    const csvContent = programService.convertToCSV(dataToExport)
                    
                    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
                    const url = window.URL.createObjectURL(blob)
                    const link = document.createElement('a')
                    link.href = url
                    link.setAttribute('download', `programs_${filtersRef.current.search || 'all'}_${new Date().toISOString().split('T')[0]}.csv`)
                    document.body.appendChild(link)
                    link.click()
                    document.body.removeChild(link)
                    window.URL.revokeObjectURL(url)
                    
                    toast.success(`Exported ${dataToExport.length} programs to CSV`)
                } else {
                    toast.success(`Prepared ${dataToExport.length} programs for export`)
                    return dataToExport
                }
            }
            
            return dataToExport
        } catch (error) {
            console.error('Error exporting programs:', error)
            toast.error('Failed to export programs')
            throw error
        } finally {
            setLoading(false)
        }
    }, [programs, pagination.showingAllResults, showAllOnSearch])

    const addProgram = async (programData) => {
        try {
            const result = await programService.addProgram(programData)
            toast.success('Program added successfully')

            await fetchPrograms(pagination.page, filtersRef.current, showAllOnSearch)
            await fetchAllStats()
            
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

            setPagination(prev => ({
                ...prev,
                total: Math.max(0, prev.total - 1)
            }))

            await fetchAllStats()
        } catch (error) {
            toast.error('Failed to delete program')
            throw error;
        } finally {
            setLoading(false)
        }
    }

    const getDisplayText = useCallback(() => {
        if (pagination.showingAllResults && filtersRef.current.search) {
            return `Showing all ${programs.length} results for "${filtersRef.current.search}"`
        } else if (pagination.showingAllResults) {
            return `Showing all ${programs.length} programs`
        } else {
            const start = ((pagination.page - 1) * pagination.limit) + 1
            const end = Math.min(pagination.page * pagination.limit, pagination.total)
            return `Showing ${start} to ${end} of ${pagination.total} programs`
        }
    }, [pagination, programs.length])

    const refetch = useCallback(() => {
        fetchPrograms(pagination.page, filtersRef.current, showAllOnSearch)
    }, [fetchPrograms, pagination.page, showAllOnSearch])

    const isShowAllMode = useCallback(() => {
        return pagination.showingAllResults || false
    }, [pagination.showingAllResults])

    const getAvailableFilters = useCallback(() => {
        return programService.extractAvailableFilters(programs)
    }, [programs])

    const getSearchSuggestions = useCallback(async (searchTerm, limit = 5) => {
        return await programService.getSearchSuggestions(searchTerm, limit)
    }, [])

    const getDistinctFilterValues = useCallback(async (field) => {
        return await programService.getDistinctFilterValues(field)
    }, [])

    return {
        programs, 
        loading, 
        error, 
        pagination, 
        filters,
        showAllOnSearch,
        programStats, 
        priceStats,
        statsLoading,
        fetchPrograms: handlePageChange,
        updateFiltersAndFetch,
        clearFilters,
        clearSearch,
        searchPrograms,
        toggleShowAllOnSearch,
        isShowAllMode,
        resetToPaginationMode,
        getDisplayText,
        refetch, 
        handlePageChange, 
        refreshData,
        addProgram, 
        updateProgram, 
        deleteProgram,
        exportPrograms,
        refetchStats: fetchAllStats,
        fetchProgramsStats,
        fetchPriceStats,
        fetchAllStats,
        getAvailableFilters,
        getSearchSuggestions,
        getDistinctFilterValues,
        allPrograms,
        allProgramsLoading,
        fetchAllPrograms,
        refreshAllData
    }
}