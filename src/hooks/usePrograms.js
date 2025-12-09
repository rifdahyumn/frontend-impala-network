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

    // 🔴 PERBAIKAN: Gunakan ref untuk semua data yang tidak perlu UI update
    const filtersRef = useRef({
        search: '',
        status: '',
        category: '',
        client: '',
        ...initialFilters
    })
    
    const abortControllerRef = useRef(null) // 🔴 Untuk cancel request
    const lastRequestIdRef = useRef(0) // 🔴 Track request terakhir
    
    // 🔴 PERBAIKAN: State filters untuk UI saja
    const [filters, setFilters] = useState({
        search: filtersRef.current.search,
        status: filtersRef.current.status,
        category: filtersRef.current.category,
        client: filtersRef.current.client
    })

    // 🔴 PERBAIKAN: fetchPrograms dengan request cancellation
    const fetchPrograms = useCallback(async (page = 1, customFilters = null, showAll = false, requestId = null) => {
        try {
            // 🔴 Cancel request sebelumnya jika ada
            if (abortControllerRef.current) {
                abortControllerRef.current.abort()
            }
            
            // Buat AbortController baru
            abortControllerRef.current = new AbortController()
            
            // 🔴 Generate request ID
            const currentRequestId = requestId || Date.now()
            lastRequestIdRef.current = currentRequestId
            
            setLoading(true)
            setError(null)

            // Gunakan customFilters jika ada, jika tidak gunakan ref
            const currentFilters = customFilters || filtersRef.current

            console.log('📤 usePrograms - Fetching with filters:', {
                page,
                filters: currentFilters,
                showAll,
                requestId: currentRequestId
            })

            // Siapkan parameter untuk API
            const params = {
                page,
                limit: pagination.limit,
                ...(currentFilters.search && { search: currentFilters.search }),
                ...(currentFilters.status && { status: currentFilters.status }),
                ...(currentFilters.category && { category: currentFilters.category }),
                ...(currentFilters.client && { client: currentFilters.client }),
                ...(currentFilters.search && showAll && { showAllOnSearch: 'true' })
            }

            console.log('📤 usePrograms - API params:', params)

            // 🔴 PERBAIKAN: Gunakan AbortController
            const result = await programService.fetchPrograms(params)

            // 🔴 CEK: Jika ini bukan request terbaru, ignore
            if (currentRequestId !== lastRequestIdRef.current) {
                console.log('🔄 Ignoring stale request:', currentRequestId)
                return
            }

            console.log('📥 usePrograms - API response:', {
                dataCount: result.data?.length,
                pagination: result.metadata?.pagination
            })

            // 🔴 PERBAIKAN: Update semua state dalam satu batch
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

            // Update showAllOnSearch state
            if (currentFilters.search && paginationData.showingAllResults) {
                setShowAllOnSearch(true)
            } else if (!currentFilters.search) {
                setShowAllOnSearch(false)
            }

        } catch (error) {
            // 🔴 PERBAIKAN: AbortError adalah expected, jangan tampilkan error
            if (error.name === 'AbortError') {
                console.log('🔄 Request cancelled')
                return
            }
            
            console.error('❌ Error fetching programs:', error)
            setError(error.message)
            toast.error('Failed to load programs')
        } finally {
            setLoading(false)
        }
    }, [pagination.limit])

    // 🔴 PERBAIKAN: Debounce dengan waktu yang lebih optimal
    const debouncedFetchRef = useRef(
        debounce((page, customFilters, showAll) => {
            const requestId = Date.now()
            fetchPrograms(page, customFilters, showAll, requestId)
        }, 500) // 🔴 PERBAIKAN: 500ms untuk filter changes
    )

    // 🔴 PERBAIKAN: Cleanup saat unmount
    useEffect(() => {
        return () => {
            // Cancel semua pending requests
            if (abortControllerRef.current) {
                abortControllerRef.current.abort()
            }
            
            // Cancel debounced calls
            if (debouncedFetchRef.current) {
                debouncedFetchRef.current.cancel()
            }
        }
    }, [])

    // 🔴 PERBAIKAN: updateFiltersAndFetch dengan optimized updates
    const updateFiltersAndFetch = useCallback((newFilters, showAll = false) => {
        console.log('🔄 updateFiltersAndFetch called with:', { newFilters, showAll })
        
        // 🔴 PERBAIKAN: Update ref dulu
        const updatedFilters = {
            ...filtersRef.current,
            ...newFilters
        }
        filtersRef.current = updatedFilters
        
        // 🔴 PERBAIKAN: Batch UI updates
        setFilters(prev => ({
            search: updatedFilters.search,
            status: updatedFilters.status,
            category: updatedFilters.category,
            client: updatedFilters.client
        }))
        
        // Handle showAllOnSearch reset jika search dihapus
        if (!newFilters.search && showAllOnSearch) {
            setShowAllOnSearch(false)
        }
        
        // Gunakan debounced fetch
        if (debouncedFetchRef.current) {
            debouncedFetchRef.current(1, updatedFilters, showAll)
        }
    }, [showAllOnSearch])

    // 🔴 PERBAIKAN: Toggle show all on search
    const toggleShowAllOnSearch = useCallback((value) => {
        console.log('🔄 toggleShowAllOnSearch:', value)
        setShowAllOnSearch(value)
        
        // Jika ada search term, refresh dengan setting baru
        if (filtersRef.current.search) {
            if (debouncedFetchRef.current) {
                debouncedFetchRef.current(1, filtersRef.current, value)
            }
        }
    }, [])

    // 🔴 PERBAIKAN: Clear filter
    const clearFilters = useCallback(() => {
        console.log('🔄 clearFilters')
        
        const clearedFilters = {
            search: '',
            status: '',
            category: '',
            client: ''
        }
        
        filtersRef.current = clearedFilters
        
        // 🔴 PERBAIKAN: Batch updates
        setFilters(clearedFilters)
        setShowAllOnSearch(false)
        
        // Gunakan fetch langsung tanpa debounce untuk clear
        fetchPrograms(1, clearedFilters, false)
    }, [fetchPrograms])

    // 🔴 PERBAIKAN: Clear search only
    const clearSearch = useCallback(() => {
        console.log('🔄 clearSearch')
        
        const updatedFilters = {
            ...filtersRef.current,
            search: ''
        }
        
        filtersRef.current = updatedFilters
        
        // 🔴 PERBAIKAN: Batch updates
        setFilters(prev => ({
            ...prev,
            search: ''
        }))
        setShowAllOnSearch(false)
        
        fetchPrograms(1, updatedFilters, false)
    }, [fetchPrograms])

    // 🔴 PERBAIKAN: Search dengan mode show all
    const searchPrograms = useCallback((searchTerm, showAll = false) => {
        console.log('🔍 searchPrograms:', { searchTerm, showAll })
        
        const searchFilters = {
            ...filtersRef.current,
            search: searchTerm
        }
        
        filtersRef.current = searchFilters
        
        // 🔴 PERBAIKAN: Update UI state
        setFilters(prev => ({
            ...prev,
            search: searchTerm
        }))
        
        // Set showAllOnSearch state
        if (searchTerm) {
            setShowAllOnSearch(showAll)
        } else {
            setShowAllOnSearch(false)
        }
        
        // Gunakan debounced fetch untuk search
        if (debouncedFetchRef.current) {
            debouncedFetchRef.current(1, searchFilters, showAll)
        }
    }, [])

    // 🔴 PERBAIKAN: Fungsi refresh data
    const refreshData = useCallback(() => {
        console.log('🔄 refreshData')
        fetchPrograms(pagination.page, filtersRef.current, showAllOnSearch)
    }, [fetchPrograms, pagination.page, showAllOnSearch])

    // 🔴 PERBAIKAN: Fungsi handle page change
    const handlePageChange = useCallback((newPage) => {
        console.log('📄 handlePageChange:', newPage)
        fetchPrograms(newPage, filtersRef.current, showAllOnSearch)
    }, [fetchPrograms, showAllOnSearch])

    // 🔴 PERBAIKAN: Reset to pagination mode
    const resetToPaginationMode = useCallback(() => {
        console.log('🔄 resetToPaginationMode')
        setShowAllOnSearch(false)
        
        // Refresh data dengan mode pagination
        if (filtersRef.current.search) {
            if (debouncedFetchRef.current) {
                debouncedFetchRef.current(1, filtersRef.current, false)
            }
        }
    }, [])

    // 🔴 PERBAIKAN: Effect untuk fetch data awal - HANYA SEKALI
    useEffect(() => {
        console.log('🚀 Initial mount - fetching programs')
        fetchPrograms(1, filtersRef.current, false)
    }, []) // 🔴 HANYA SEKALI

    // 🔴 PERBAIKAN: Stats functions
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
        console.log('📊 Initial mount - fetching program stats')
        fetchAllStats()
    }, [fetchAllStats])

    // 🔴 PERBAIKAN: Export data
    const exportPrograms = useCallback(async (format = 'csv') => {
        try {
            setLoading(true)
            
            console.log('📤 Exporting programs with filters:', {
                filters: filtersRef.current,
                showAllOnSearch,
                format
            })

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

    // 🔴 PERBAIKAN: CRUD functions dengan optimized updates
    const addProgram = async (programData) => {
        try {
            const result = await programService.addProgram(programData)
            toast.success('Program added successfully')

            // 🔴 PERBAIKAN: Refresh data tanpa loading state berlebihan
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

            // 🔴 PERBAIKAN: Optimistic update untuk mengurangi re-render
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
            toast.success('Program deleted successfully')

            // 🔴 PERBAIKAN: Optimistic update
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

    // 🔴 PERBAIKAN: Helper functions
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
        console.log('🔄 Refetching current data')
        fetchPrograms(pagination.page, filtersRef.current, showAllOnSearch)
    }, [fetchPrograms, pagination.page, showAllOnSearch])

    const isShowAllMode = useCallback(() => {
        return pagination.showingAllResults || false
    }, [pagination.showingAllResults])

    // 🔴 FUNGSI BARU: Get available filters
    const getAvailableFilters = useCallback(() => {
        return programService.extractAvailableFilters(programs)
    }, [programs])

    // 🔴 FUNGSI BARU: Get suggestions
    const getSearchSuggestions = useCallback(async (searchTerm, limit = 5) => {
        return await programService.getSearchSuggestions(searchTerm, limit)
    }, [])

    // 🔴 FUNGSI BARU: Get distinct values for filter
    const getDistinctFilterValues = useCallback(async (field) => {
        return await programService.getDistinctFilterValues(field)
    }, [])

    return {
        // State
        programs, 
        loading, 
        error, 
        pagination, 
        filters,
        showAllOnSearch,
        programStats, 
        priceStats,
        statsLoading,
        
        // Fetch Functions
        fetchPrograms: handlePageChange,
        updateFiltersAndFetch,
        clearFilters,
        clearSearch,
        searchPrograms,
        
        // Show All Mode Functions
        toggleShowAllOnSearch,
        isShowAllMode,
        resetToPaginationMode,
        
        // Display Functions
        getDisplayText,
        
        // Pagination Functions
        refetch, 
        handlePageChange, 
        refreshData,
        
        // CRUD Functions
        addProgram, 
        updateProgram, 
        deleteProgram,
        
        // Export Functions
        exportPrograms,
        
        // Stats Functions
        refetchStats: fetchAllStats,
        fetchProgramsStats,
        fetchPriceStats,
        fetchAllStats,
        
        // 🔴 NEW: Filter utility functions
        getAvailableFilters,
        getSearchSuggestions,
        getDistinctFilterValues
    }
}