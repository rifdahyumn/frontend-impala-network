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

    // 🔴 PERBAIKAN: fetchClients dengan request cancellation
    const fetchClients = useCallback(async (page = 1, customFilters = null, showAll = false, requestId = null) => {
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

            console.log('📤 useClients - Fetching with filters:', {
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
                ...(currentFilters.businessType && { businessType: currentFilters.businessType }),
                ...(currentFilters.search && showAll && { showAllOnSearch: 'true' })
            }

            console.log('📤 useClients - API params:', params)

            // 🔴 PERBAIKAN: Gunakan AbortController
            const result = await clientService.fetchClients(params)

            // 🔴 CEK: Jika ini bukan request terbaru, ignore
            if (currentRequestId !== lastRequestIdRef.current) {
                console.log('🔄 Ignoring stale request:', currentRequestId)
                return
            }

            console.log('📥 useClients - API response:', {
                dataCount: result.data?.length,
                pagination: result.metadata?.pagination
            })

            // 🔴 PERBAIKAN: Update semua state dalam satu batch
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
            
            console.error('❌ Error fetching clients:', error)
            setError(error.message)
            toast.error('Failed to load clients')
        } finally {
            setLoading(false)
        }
    }, [pagination.limit])

    // 🔴 PERBAIKAN: Debounce dengan waktu yang lebih optimal
    const debouncedFetchRef = useRef(
        debounce((page, customFilters, showAll) => {
            const requestId = Date.now()
            fetchClients(page, customFilters, showAll, requestId)
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
            businessType: updatedFilters.businessType
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
            businessType: ''
        }
        
        filtersRef.current = clearedFilters
        
        // 🔴 PERBAIKAN: Batch updates
        setFilters(clearedFilters)
        setShowAllOnSearch(false)
        
        // Gunakan fetch langsung tanpa debounce untuk clear
        fetchClients(1, clearedFilters, false)
    }, [fetchClients])

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
        
        fetchClients(1, updatedFilters, false)
    }, [fetchClients])

    // 🔴 PERBAIKAN: Search dengan mode show all
    const searchClients = useCallback((searchTerm, showAll = false) => {
        console.log('🔍 searchClients:', { searchTerm, showAll })
        
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
        fetchClients(pagination.page, filtersRef.current, showAllOnSearch)
    }, [fetchClients, pagination.page, showAllOnSearch])

    // 🔴 PERBAIKAN: Fungsi handle page change
    const handlePageChange = useCallback((newPage) => {
        console.log('📄 handlePageChange:', newPage)
        fetchClients(newPage, filtersRef.current, showAllOnSearch)
    }, [fetchClients, showAllOnSearch])

    // 🔴 PERBAIKAN: Effect untuk fetch data awal - HANYA SEKALI
    useEffect(() => {
        console.log('🚀 Initial mount - fetching clients')
        fetchClients(1, filtersRef.current, false)
    }, []) // 🔴 HANYA SEKALI

    // 🔴 PERBAIKAN: Effect untuk fetch stats - HANYA SEKALI
    const fetchClientStats = useCallback(async () => {
        try {
            setStatsLoading(true)
            const result = await clientService.fetchClientStats()
            
            if (result.success) {
                setClientStats(result.data)
            }
        } catch (error) {
            console.error('Error fetching client stats:', error)
            // 🔴 PERBAIKAN: Tidak perlu toast untuk stats, cukup set default
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
        console.log('📊 Initial mount - fetching client stats')
        fetchClientStats()
    }, [fetchClientStats])

    // 🔴 PERBAIKAN: Export data
    const exportClients = useCallback(async (format = 'csv') => {
        try {
            setLoading(true)
            
            console.log('📤 Exporting clients with filters:', {
                filters: filtersRef.current,
                showAllOnSearch,
                format
            })

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

    // 🔴 PERBAIKAN: Helper functions
    const getDisplayText = useCallback(() => {
        if (pagination.showingAllResults && filtersRef.current.search) {
            return `Showing all ${members.length} results for "${filtersRef.current.search}"`
        } else if (pagination.showingAllResults) {
            return `Showing all ${members.length} clients`
        } else {
            const start = ((pagination.page - 1) * pagination.limit) + 1
            const end = Math.min(pagination.page * pagination.limit, pagination.total)
            return `Showing ${start} to ${end} of ${pagination.total} clients`
        }
    }, [pagination, members.length])

    const refetch = useCallback(() => {
        console.log('🔄 Refetching current data')
        fetchClients(pagination.page, filtersRef.current, showAllOnSearch)
    }, [fetchClients, pagination.page, showAllOnSearch])

    return {
        // State
        members, 
        loading, 
        error, 
        pagination, 
        filters,
        showAllOnSearch,
        clientStats, 
        statsLoading,
        
        // Fetch Functions
        fetchClients,
        updateFiltersAndFetch,
        clearFilters,
        clearSearch,
        searchClients,
        
        // Show All Mode Functions
        toggleShowAllOnSearch,
        isShowAllMode: () => pagination.showingAllResults || false,
        
        // Display Functions
        getDisplayText,
        
        // Pagination Functions
        refetch, 
        handlePageChange, 
        refreshData,
        
        // CRUD Functions
        addClient, 
        updateClient, 
        deleteClient,
        
        // Export Functions
        exportClients,
        
        // Stats Functions
        refetchStats: fetchClientStats
    }
}