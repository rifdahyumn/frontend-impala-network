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

    const fetchImpala = useCallback(async (page = 1, customFilters = null, showAll = false, requestId = null) => {
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
                ...(currentFilters.gender && { gender: currentFilters.gender }),
                ...(currentFilters.category && { category: currentFilters.category }),
                ...(currentFilters.search && showAll && { showAllOnSearch: 'true' })
            }

            const result = await impalaService.fetchImpala(params)

            if (currentRequestId !== lastRequestIdRef.current) {
                return
            }

<<<<<<< HEAD
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
=======
            setParticipant(result.data || [])
>>>>>>> ac48c155c7b3994cbe7cadf0f0017f41bb579e48
            
            setPagination(prev => ({
                page: validPage,
                limit: limit,
                total: totalItems,
                totalPages: calculatedTotalPages,
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
            
<<<<<<< HEAD
            console.error('❌ Error fetching participants:', error)
            setError(error.message || 'Failed to load participants')
=======
            console.error('Error fetching participants:', error)
            setError(error.message)
>>>>>>> ac48c155c7b3994cbe7cadf0f0017f41bb579e48
            toast.error('Failed to load participants')
        } finally {
            setLoading(false)
        }
    }, [pagination.limit])

    const debouncedFetchRef = useRef(
        debounce((page, customFilters, showAll) => {
            const requestId = Date.now()
            fetchImpala(page, customFilters, showAll, requestId)
        }, 500)
    )

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

    const updateFiltersAndFetch = useCallback((newFilters, showAll = false) => {
        const updatedFilters = {
            ...filtersRef.current,
            ...newFilters
        }
        filtersRef.current = updatedFilters

        setFilters(prev => ({
            search: updatedFilters.search,
            gender: updatedFilters.gender,
            category: updatedFilters.category
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
            gender: '',
            category: ''
        }
        
        filtersRef.current = clearedFilters
        
        setFilters(clearedFilters)
        setShowAllOnSearch(false)
        
        fetchImpala(1, clearedFilters, false)
    }, [fetchImpala])

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
        
        fetchImpala(1, updatedFilters, false)
    }, [fetchImpala])

    const searchParticipants = useCallback((searchTerm, showAll = false) => {
        
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
        fetchImpala(pagination.page, filtersRef.current, showAllOnSearch)
    }, [fetchImpala, pagination.page, showAllOnSearch])

    const handlePageChange = useCallback((newPage) => {
<<<<<<< HEAD
        console.log('📄 handlePageChange:', newPage)
        // 🔴 FIX: Pastikan page dalam range yang valid
        const validPage = Math.max(1, Math.min(newPage, pagination.totalPages))
        fetchImpala(validPage, filtersRef.current, showAllOnSearch)
    }, [fetchImpala, showAllOnSearch, pagination.totalPages])
=======
        fetchImpala(newPage, filtersRef.current, showAllOnSearch)
    }, [fetchImpala, showAllOnSearch])
>>>>>>> ac48c155c7b3994cbe7cadf0f0017f41bb579e48

    useEffect(() => {
        fetchImpala(1, filtersRef.current, false)
    }, []) 

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
        fetchImpalaStats()
    }, [fetchImpalaStats])

    const exportParticipants = useCallback(async (format = 'csv') => {
        try {
            setLoading(true)

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

<<<<<<< HEAD
    // 🔴 PERBAIKAN: Helper functions untuk display text yang benar
=======
>>>>>>> ac48c155c7b3994cbe7cadf0f0017f41bb579e48
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
        fetchImpala(pagination.page, filtersRef.current, showAllOnSearch)
    }, [fetchImpala, pagination.page, showAllOnSearch])

    const resetToPaginationMode = useCallback(async () => {
        await fetchImpala(1, filtersRef.current, false)
    }, [fetchImpala])

    return {
        participant, 
        loading, 
        error, 
        pagination, 
        filters,
        showAllOnSearch,
        impalaStats, 
        statsLoadingImpala,
        fetchImpala,
        updateFiltersAndFetch,
        clearFilters,
        clearSearch,
        searchParticipants,
        toggleShowAllOnSearch,
        isShowAllMode,
        resetToPaginationMode,
        getDisplayText,
        refetch, 
        handlePageChange, 
        refreshData,
        addParticipant, 
        updateParticipant, 
        deleteParticipant,
        exportParticipants,
        refetchStats: fetchImpalaStats
    }
}