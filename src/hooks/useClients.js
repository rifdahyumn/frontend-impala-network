import clientService from "../services/clientService"
import { useState, useEffect, useCallback, useRef } from "react"
import toast from "react-hot-toast"
import { debounce } from 'lodash'

export const useClients = (initialFilters = {}) => {
    const [members, setMembers] = useState([])
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

    const [clientStats, setClientStats] = useState(null)
    const [statsLoading, setStatsLoading] = useState(false)
    const [showAllOnSearch, setShowAllOnSearch] = useState(false)

    // 🔴 PERBAIKAN: Gunakan ref untuk semua data yang tidak perlu UI update
    const filtersRef = useRef({
        search: '',
        status: '',
        businessType: '',
        ...initialFilters
    })
    
    const abortControllerRef = useRef(null) // 🔴 Untuk cancel request
    const lastRequestIdRef = useRef(0) // 🔴 Track request terakhir
    
    // 🔴 PERBAIKAN: State filters untuk UI saja
    const [filters, setFilters] = useState({
        search: filtersRef.current.search,
        status: filtersRef.current.status,
        businessType: filtersRef.current.businessType
    })

    const fetchClients = useCallback(async (page = 1, customFilters = null, showAll = false, requestId = null) => {
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
                ...(currentFilters.businessType && { businessType: currentFilters.businessType }),
                ...(currentFilters.search && showAll && { showAllOnSearch: 'true' })
            }
            const result = await clientService.fetchClients(params)

            setMembers(result.data || [])
            
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
            
            console.error('Error fetching clients:', error)
            setError(error.message)
            toast.error('Failed to load clients')
        } finally {
            setLoading(false)
        }
    }, [pagination.limit])

    const debouncedFetchRef = useRef(
        debounce((page, customFilters, showAll) => {
            const requestId = Date.now()
            fetchClients(page, customFilters, showAll, requestId)
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
            status: updatedFilters.status,
            businessType: updatedFilters.businessType
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
            businessType: ''
        }
        
        filtersRef.current = clearedFilters
        
        setFilters(clearedFilters)
        setShowAllOnSearch(false)
        
        fetchClients(1, clearedFilters, false)
    }, [fetchClients])

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
        
        fetchClients(1, updatedFilters, false)
    }, [fetchClients])

    const searchClients = useCallback((searchTerm, showAll = false) => {
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
        fetchClients(pagination.page, filtersRef.current, showAllOnSearch)
    }, [fetchClients, pagination.page, showAllOnSearch])

    const handlePageChange = useCallback((newPage) => {
        fetchClients(newPage, filtersRef.current, showAllOnSearch)
    }, [fetchClients, showAllOnSearch])

    useEffect(() => {
        fetchClients(1, filtersRef.current, false)
    }, []) 

    const fetchClientStats = useCallback(async () => {
        try {
            setStatsLoading(true)
            const result = await clientService.fetchClientStats()
            
            if (result.success) {
                setClientStats(result.data)
            }
        } catch (error) {
            console.error('Error fetching client stats:', error)
            setClientStats({
                title: "Total Client",
                value: "0",
                subtitle: "+ 0",
                percentage: "0%",
                trend: "up",
                period: "Last Month",
                icon: "Users",
                color: "blue",
                description: "0% Last Month"
            })
        } finally {
            setStatsLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchClientStats()
    }, [fetchClientStats])

    const exportClients = useCallback(async (format = 'csv') => {
        try {
            setLoading(true)

            let dataToExport
            
            if (pagination.showingAllResults && format === 'csv') {
                dataToExport = members
                
                const csvContent = clientService.convertToCSV(dataToExport)
                
                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
                const url = window.URL.createObjectURL(blob)
                const link = document.createElement('a')
                link.href = url
                link.setAttribute('download', `clients_${filtersRef.current.search || 'all'}_${new Date().toISOString().split('T')[0]}.csv`)
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
                window.URL.revokeObjectURL(url)
                
                toast.success(`Exported ${dataToExport.length} clients to CSV`)
            } else {
                const result = await clientService.fetchAllClients(filtersRef.current)
                dataToExport = result.data || []
                
                if (format === 'csv') {
                    const csvContent = clientService.convertToCSV(dataToExport)
                    
                    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
                    const url = window.URL.createObjectURL(blob)
                    const link = document.createElement('a')
                    link.href = url
                    link.setAttribute('download', `clients_${filtersRef.current.search || 'all'}_${new Date().toISOString().split('T')[0]}.csv`)
                    document.body.appendChild(link)
                    link.click()
                    document.body.removeChild(link)
                    window.URL.revokeObjectURL(url)
                    
                    toast.success(`Exported ${dataToExport.length} clients to CSV`)
                } else {
                    toast.success(`Prepared ${dataToExport.length} clients for export`)
                    return dataToExport
                }
            }
            
            return dataToExport
        } catch (error) {
            console.error('Error exporting clients:', error)
            toast.error('Failed to export clients')
            throw error
        } finally {
            setLoading(false)
        }
    }, [members, pagination.showingAllResults, showAllOnSearch])

    // 🔴 PERBAIKAN: CRUD functions dengan optimized updates
    const addClient = async (clientData) => {
        try {
            const result = await clientService.addClient(clientData)
            toast.success('Client added successfully')
            
            // 🔴 PERBAIKAN: Refresh data tanpa loading state berlebihan
            await fetchClients(pagination.page, filtersRef.current, showAllOnSearch)
            await fetchClientStats()
            
            return result
        } catch (error) {
            toast.error('Failed to add client')
            throw error
        }
    }

    const updateClient = async (clientId, clientData) => {
        try {
            setLoading(true)
            const result = await clientService.updateClient(clientId, clientData)
            toast.success("Client updated successfully")

            // 🔴 PERBAIKAN: Optimistic update untuk mengurangi re-render
            setMembers(prevMembers => 
                prevMembers.map(member => 
                    member.id === clientId
                        ? { ...member, ...clientData, ...result.data || result }
                        : member
                )
            )

            return result.data || result
        } catch (error) {
            toast.error('Failed to update client')
            throw error
        } finally {
            setLoading(false)
        }
    }

    const deleteClient = async (clientId) => {
        try {
            setLoading(true)
            await clientService.deleteClient(clientId)

            // 🔴 PERBAIKAN: Optimistic update
            setMembers(prevMembers =>
                prevMembers.filter(members => members.id !== clientId)
            )

            setPagination(prev => ({
                ...prev,
                total: Math.max(0, prev.total - 1)
            }))

            await fetchClientStats()
        } catch (error) {
            toast.error('Failed to delete client')
            throw error
        } finally {
            setLoading(false)
        }
    }

    const getDisplayText = useCallback(() => {
        if (pagination.showingAllResults && filtersRef.current.search) {
            return `Showing all ${members.length} results for "${filtersRef.current.search}"`
        } else if (pagination.showingAllResults) {
            return `Showing all ${members.length} clients`
        } else {
            // const start = ((pagination.page - 1) * pagination.limit) + 1
            // const end = Math.min(pagination.page * pagination.limit, pagination.total)
            // return `Showing ${start} to ${end} of ${pagination.total} clients`
        }
    }, [pagination, members.length])

    const refetch = useCallback(() => {
        fetchClients(pagination.page, filtersRef.current, showAllOnSearch)
    }, [fetchClients, pagination.page, showAllOnSearch])

    return {
        members, 
        loading, 
        error, 
        pagination, 
        filters,
        showAllOnSearch,
        clientStats, 
        statsLoading,
        fetchClients,
        updateFiltersAndFetch,
        clearFilters,
        clearSearch,
        searchClients,
        toggleShowAllOnSearch,
        isShowAllMode: () => pagination.showingAllResults || false,
        getDisplayText,
        refetch, 
        handlePageChange, 
        refreshData,
        addClient, 
        updateClient, 
        deleteClient,
        exportClients,
        refetchStats: fetchClientStats
    }
}