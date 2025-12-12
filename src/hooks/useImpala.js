import impalaService from "../services/impalaService"
import { useState, useEffect, useCallback, useRef } from "react"
import toast from "react-hot-toast"
import { debounce } from 'lodash'

export const useImpala = (initialFilters = {}) => {
    const [participant, setParticipant] = useState([])
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

    const [impalaStats, setImpalaStats] = useState(null)
    const [statsLoadingImpala, setStatsLoadingImpala] = useState(false)
    const [showAllOnSearch, setShowAllOnSearch] = useState(false)

    // 🔴 PERBAIKAN: Gunakan ref untuk semua data yang tidak perlu UI update
    const filtersRef = useRef({
        search: '',
        gender: '',
        category: '',
        ...initialFilters
    })
    
    const abortControllerRef = useRef(null) // 🔴 Untuk cancel request
    const lastRequestIdRef = useRef(0) // 🔴 Track request terakhir
    
    // 🔴 PERBAIKAN: State filters untuk UI saja
    const [filters, setFilters] = useState({
        search: filtersRef.current.search,
        gender: filtersRef.current.gender,
        category: filtersRef.current.category
    })

    // 🔴 PERBAIKAN: fetchImpala dengan request cancellation
    const fetchImpala = useCallback(async (page = 1, customFilters = null, showAll = false, requestId = null) => {
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

            console.log('📤 useImpala - Fetching with filters:', {
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
                ...(currentFilters.gender && { gender: currentFilters.gender }),
                ...(currentFilters.category && { category: currentFilters.category }),
                ...(currentFilters.search && showAll && { showAllOnSearch: 'true' })
            }

            console.log('📤 useImpala - API params:', params)

            // 🔴 PERBAIKAN: Gunakan AbortController
            const result = await impalaService.fetchImpala(params)

            // 🔴 CEK: Jika ini bukan request terbaru, ignore
            if (currentRequestId !== lastRequestIdRef.current) {
                console.log('🔄 Ignoring stale request:', currentRequestId)
                return
            }

            console.log('📥 useImpala - API response:', {
                dataCount: result.data?.length || 0,
                pagination: result.metadata?.pagination || {},
                metadata: result.metadata
            })

            // 🔴 PERBAIKAN: Pastikan data tidak undefined
            const participantsData = result.data || []
            const paginationData = result.metadata?.pagination || {}
            
            // 🔴 FIX: Hitung totalPages dengan benar
            const totalItems = paginationData.total || participantsData.length
            const limit = paginationData.limit || pagination.limit
            const calculatedTotalPages = Math.max(1, Math.ceil(totalItems / limit))
            
            // 🔴 FIX: Perbaiki perhitungan halaman
            const currentPage = paginationData.page || page
            const validPage = Math.max(1, Math.min(currentPage, calculatedTotalPages))

            console.log('📊 useImpala - Calculated pagination:', {
                totalItems,
                limit,
                calculatedTotalPages,
                currentPage,
                validPage
            })

            // 🔴 PERBAIKAN: Update semua state dalam satu batch
            setParticipant(participantsData)
            
            setPagination(prev => ({
                page: validPage,
                limit: limit,
                total: totalItems,
                totalPages: calculatedTotalPages,
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
            
            console.error('❌ Error fetching participants:', error)
            setError(error.message || 'Failed to load participants')
            toast.error('Failed to load participants')
        } finally {
            setLoading(false)
        }
    }, [pagination.limit])

    // 🔴 PERBAIKAN: Debounce dengan waktu yang lebih optimal
    const debouncedFetchRef = useRef(
        debounce((page, customFilters, showAll) => {
            const requestId = Date.now()
            fetchImpala(page, customFilters, showAll, requestId)
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
            gender: updatedFilters.gender,
            category: updatedFilters.category
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
            gender: '',
            category: ''
        }
        
        filtersRef.current = clearedFilters
        
        // 🔴 PERBAIKAN: Batch updates
        setFilters(clearedFilters)
        setShowAllOnSearch(false)
        
        // Gunakan fetch langsung tanpa debounce untuk clear
        fetchImpala(1, clearedFilters, false)
    }, [fetchImpala])

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
        
        fetchImpala(1, updatedFilters, false)
    }, [fetchImpala])

    // 🔴 PERBAIKAN: Search dengan mode show all
    const searchParticipants = useCallback((searchTerm, showAll = false) => {
        console.log('🔍 searchParticipants:', { searchTerm, showAll })
        
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
        fetchImpala(pagination.page, filtersRef.current, showAllOnSearch)
    }, [fetchImpala, pagination.page, showAllOnSearch])

    // 🔴 PERBAIKAN: Fungsi handle page change
    const handlePageChange = useCallback((newPage) => {
        console.log('📄 handlePageChange:', newPage)
        // 🔴 FIX: Pastikan page dalam range yang valid
        const validPage = Math.max(1, Math.min(newPage, pagination.totalPages))
        fetchImpala(validPage, filtersRef.current, showAllOnSearch)
    }, [fetchImpala, showAllOnSearch, pagination.totalPages])

    // 🔴 PERBAIKAN: Effect untuk fetch data awal - HANYA SEKALI
    useEffect(() => {
        console.log('🚀 Initial mount - fetching participants')
        fetchImpala(1, filtersRef.current, false)
    }, []) // 🔴 HANYA SEKALI

    // 🔴 PERBAIKAN: Effect untuk fetch stats
    const fetchImpalaStats = useCallback(async () => {
        try {
            setStatsLoadingImpala(true)
            const result = await impalaService.fetchImpalaStats()
            
            if (result.success) {
                setImpalaStats(result.data)
            } else {
                // 🔴 PERBAIKAN: Fallback stats jika API error
                setImpalaStats({
                    title: 'Total Participant',
                    value: participant.length.toString() || "0",
                    subtitle: '+ 0',
                    percentage: '0%',
                    trend: 'up',
                    period: 'Last month',
                    icon: 'Users',
                    color: 'orange',
                    description: '0% Last Month'
                })
            }
        } catch (error) {
            console.error('Error fetching participant stats:', error)
            // 🔴 PERBAIKAN: Tidak perlu toast untuk stats, cukup set default
            setImpalaStats({
                title: 'Total Participant',
                value: participant.length.toString() || "0",
                subtitle: '+ 0',
                percentage: '0%',
                trend: 'up',
                period: 'Last month',
                icon: 'Users',
                color: 'orange',
                description: '0% Last Month'
            })
        } finally {
            setStatsLoadingImpala(false)
        }
    }, [participant.length])

    useEffect(() => {
        console.log('📊 Initial mount - fetching participant stats')
        fetchImpalaStats()
    }, [fetchImpalaStats])

    // 🔴 PERBAIKAN: Export data
    const exportParticipants = useCallback(async (format = 'csv') => {
        try {
            setLoading(true)
            
            console.log('📤 Exporting participants with filters:', {
                filters: filtersRef.current,
                showAllOnSearch,
                format
            })

            let dataToExport
            
            if (pagination.showingAllResults && format === 'csv') {
                dataToExport = participant
                
                const csvContent = impalaService.convertToCSV(dataToExport)
                
                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
                const url = window.URL.createObjectURL(blob)
                const link = document.createElement('a')
                link.href = url
                link.setAttribute('download', `participants_${filtersRef.current.search || 'all'}_${new Date().toISOString().split('T')[0]}.csv`)
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
                window.URL.revokeObjectURL(url)
                
                toast.success(`Exported ${dataToExport.length} participants to CSV`)
            } else {
                const result = await impalaService.fetchAllImpala(filtersRef.current)
                dataToExport = result.data || []
                
                if (format === 'csv') {
                    const csvContent = impalaService.convertToCSV(dataToExport)
                    
                    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
                    const url = window.URL.createObjectURL(blob)
                    const link = document.createElement('a')
                    link.href = url
                    link.setAttribute('download', `participants_${filtersRef.current.search || 'all'}_${new Date().toISOString().split('T')[0]}.csv`)
                    document.body.appendChild(link)
                    link.click()
                    document.body.removeChild(link)
                    window.URL.revokeObjectURL(url)
                    
                    toast.success(`Exported ${dataToExport.length} participants to CSV`)
                } else {
                    toast.success(`Prepared ${dataToExport.length} participants for export`)
                    return dataToExport
                }
            }
            
            return dataToExport
        } catch (error) {
            console.error('Error exporting participants:', error)
            toast.error('Failed to export participants')
            throw error
        } finally {
            setLoading(false)
        }
    }, [participant, pagination.showingAllResults, showAllOnSearch])

    // 🔴 PERBAIKAN: CRUD functions dengan optimized updates
    const addParticipant = async (participantData) => {
        try {
            const result = await impalaService.createImpala(participantData)
            toast.success('Participant added successfully')
            
            // 🔴 PERBAIKAN: Refresh data tanpa loading state berlebihan
            await fetchImpala(pagination.page, filtersRef.current, showAllOnSearch)
            await fetchImpalaStats()
            
            return result
        } catch (error) {
            toast.error('Failed to add participant')
            throw error
        }
    }

    const updateParticipant = async (participantId, participantData) => {
        try {
            setLoading(true)
            const result = await impalaService.updateImpala(participantId, participantData)
            toast.success("Participant updated successfully")

            // 🔴 PERBAIKAN: Optimistic update untuk mengurangi re-render
            setParticipant(prevParticipants => 
                prevParticipants.map(participant => 
                    participant.id === participantId
                        ? { ...participant, ...participantData, ...result.data || result }
                        : participant
                )
            )

            return result.data || result
        } catch (error) {
            toast.error('Failed to update participant')
            throw error
        } finally {
            setLoading(false)
        }
    }

    const deleteParticipant = async (participantId) => {
        try {
            setLoading(true)
            await impalaService.deleteImpala(participantId)

            // 🔴 PERBAIKAN: Optimistic update
            setParticipant(prevParticipants =>
                prevParticipants.filter(participant => participant.id !== participantId)
            )

            setPagination(prev => ({
                ...prev,
                total: Math.max(0, prev.total - 1)
            }))

            await fetchImpalaStats()
        } catch (error) {
            toast.error('Failed to delete participant')
            throw error
        } finally {
            setLoading(false)
        }
    }

    // 🔴 PERBAIKAN: Helper functions untuk display text yang benar
    const getDisplayText = useCallback(() => {
        // Jika tidak ada data sama sekali
        if (participant.length === 0 && pagination.total === 0) {
            return "No participants found";
        }
        
        // Jika dalam show all mode
        if (pagination.showingAllResults && filtersRef.current.search) {
            return `Showing all ${participant.length} results for "${filtersRef.current.search}"`;
        } else if (pagination.showingAllResults) {
            return `Showing all ${participant.length} participants`;
        }
        
        // Hitung start dan end dengan benar
        const start = Math.max(1, ((pagination.page - 1) * pagination.limit) + 1);
        const end = Math.min(pagination.page * pagination.limit, pagination.total);
        
        // Jika total 0 tapi ada data di participant (inconsistency)
        if (pagination.total === 0 && participant.length > 0) {
            return `Showing ${participant.length} participants`;
        }
        
        // Jika start > end (data tidak konsisten)
        if (start > end) {
            return `Showing ${participant.length} participants`;
        }
        
        // Normal case
        return `Showing ${start} to ${end} of ${pagination.total} participants`;
    }, [participant.length, pagination, filtersRef.current.search])

    // 🔴 PERBAIKAN: isShowAllMode function
    const isShowAllMode = useCallback(() => {
        return pagination.showingAllResults || false;
    }, [pagination.showingAllResults])

    const refetch = useCallback(() => {
        console.log('🔄 Refetching current data')
        fetchImpala(pagination.page, filtersRef.current, showAllOnSearch)
    }, [fetchImpala, pagination.page, showAllOnSearch])

    const resetToPaginationMode = useCallback(async () => {
        console.log('🔄 Resetting to pagination mode')
        await fetchImpala(1, filtersRef.current, false)
    }, [fetchImpala])

    return {
        // State
        participant, 
        loading, 
        error, 
        pagination, 
        filters,
        showAllOnSearch,
        impalaStats, 
        statsLoadingImpala,
        
        // Fetch Functions
        fetchImpala,
        updateFiltersAndFetch,
        clearFilters,
        clearSearch,
        searchParticipants,
        
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
        addParticipant, 
        updateParticipant, 
        deleteParticipant,
        
        // Export Functions
        exportParticipants,
        
        // Stats Functions
        refetchStats: fetchImpalaStats
    }
}