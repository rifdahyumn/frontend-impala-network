import impalaService from "../services/impalaService"
import { useState, useEffect, useCallback, useRef } from "react"
import toast from "react-hot-toast"
import { debounce } from 'lodash'
import { useConfirmDialog } from "./useConfirmDialog"

export const useImpala = (initialFilters = {}) => {
    const confirmDialog = useConfirmDialog()
    const [participant, setParticipant] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
        isShowAllMode: false,
        showingAllResults: false,
        searchTerm: ''
    })

    const [impalaStats, setImpalaStats] = useState(null)
    const [statsLoadingImpala, setStatsLoadingImpala] = useState(false)
    const [showAllOnSearch, setShowAllOnSearch] = useState(false)

    const filtersRef = useRef({
        search: '',
        gender: '',
        category: '',
        ...initialFilters
    })
    
    const abortControllerRef = useRef(null)
    const lastRequestIdRef = useRef(0) 
    
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

            setParticipant(result.data || [])
            
            const paginationData = result.metadata?.metadata?.pagination || {}
            setPagination(prev => ({
                ...prev,
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
            
            console.error('Error fetching participants:', error)
            setError(error.message)
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
            ...prev,
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
        fetchImpala(newPage, filtersRef.current, showAllOnSearch)
    }, [fetchImpala, showAllOnSearch])

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

    const exportParticipants = useCallback(async (format = 'csv', exportFilters = null) => {
        try {
            setLoading(true)

            const currentFilters = exportFilters || filtersRef.current
            let dataToExport
        
            if (pagination.showingAllResults && currentFilters.search && format === 'csv') {
                dataToExport = participant
                
                const csvContent = impalaService.convertToCSV(dataToExport)
                
                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
                const url = window.URL.createObjectURL(blob)
                const link = document.createElement('a')
                link.href = url
                link.setAttribute('download', `impala_participants_${currentFilters.search || 'all'}_${new Date().toISOString().split('T')[0]}.csv`)
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
                window.URL.revokeObjectURL(url)
                
                toast.success(`Exported ${dataToExport.length} participants to CSV`)
            } else {
                const result = await impalaService.fetchAllImpala(currentFilters)
                dataToExport = result.data || []
                
                if (format === 'csv') {
                    const csvContent = impalaService.convertToCSV(dataToExport)
                    
                    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
                    const url = window.URL.createObjectURL(blob)
                    const link = document.createElement('a')
                    link.href = url
                    link.setAttribute('download', `impala_participants_${currentFilters.search || 'all'}_${new Date().toISOString().split('T')[0]}.csv`)
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

    const addParticipant = async (participantData) => {
        try {
            const result = await impalaService.createImpala(participantData)
            toast.success('Participant added successfully')
            
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

    const getDisplayText = useCallback(() => {
        if (pagination.showingAllResults && filtersRef.current.search) {
            return `Showing all ${participant.length} results for "${filtersRef.current.search}"`
        } else if (pagination.showingAllResults) {
            return `Showing all ${participant.length} participants`
        } else {
            const start = ((pagination.page - 1) * pagination.limit) + 1
            const end = Math.min(pagination.page * pagination.limit, pagination.total)
            return `Showing ${start} to ${end} of ${pagination.total} participants`
        }
    }, [pagination, participant.length])

    const refetch = useCallback(() => {
        fetchImpala(pagination.page, filtersRef.current, showAllOnSearch)
    }, [fetchImpala, pagination.page, showAllOnSearch])

    const resetToPaginationMode = useCallback(async () => {
        await fetchImpala(1, filtersRef.current, false)
    }, [fetchImpala])

    return {
        ...confirmDialog, participant, loading, error, pagination, filters, showAllOnSearch, impalaStats, 
        statsLoadingImpala, fetchImpala, updateFiltersAndFetch, clearFilters, clearSearch, searchParticipants,
        toggleShowAllOnSearch, isShowAllMode: () => pagination.showingAllResults || false, resetToPaginationMode,
        getDisplayText, refetch, handlePageChange, refreshData, addParticipant, updateParticipant, deleteParticipant,
        exportParticipants, refetchStats: fetchImpalaStats
    }
}

export default useImpala