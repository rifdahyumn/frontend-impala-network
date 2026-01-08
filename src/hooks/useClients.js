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
        limit: 20,
        total: 0,
        totalPages: 0,
        isShowAllMode: false,
        showingAllResults: false,
        searchTerm: ''
    })

    const [clientStats, setClientStats] = useState(null)
    const [statsLoading, setStatsLoading] = useState(false)
    const [showAllOnSearch, setShowAllOnSearch] = useState(false)

    // PERBAIKAN: Tambahkan gender ke filtersRef
    const filtersRef = useRef({
        search: '',
        status: '',
        businessType: '',
        gender: '', // ← TAMBAHKAN INI
        ...initialFilters
    })
    
    const abortControllerRef = useRef(null) 
    const lastRequestIdRef = useRef(0) 
    
    // PERBAIKAN: Tambahkan gender ke state filters
    const [filters, setFilters] = useState({
        search: filtersRef.current.search,
        status: filtersRef.current.status,
        businessType: filtersRef.current.businessType,
        gender: filtersRef.current.gender // ← TAMBAHKAN INI
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

            // PERBAIKAN: Tambahkan gender ke params
            const params = {
                page,
                limit: pagination.limit,
                ...(currentFilters.search && { search: currentFilters.search }),
                ...(currentFilters.status && { status: currentFilters.status }),
                ...(currentFilters.businessType && { businessType: currentFilters.businessType }),
                ...(currentFilters.gender && { gender: currentFilters.gender }), // ← TAMBAHKAN INI
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
            if (abortControllerRef.current) {
                abortControllerRef.current.abort()
            }
            
            if (debouncedFetchRef.current) {
                debouncedFetchRef.current.cancel()
            }
        }
    }, [])

    const updateFiltersAndFetch = useCallback((newFilters, showAll = false) => {
        // PERBAIKAN: Update filtersRef dengan gender
        const updatedFilters = {
            ...filtersRef.current,
            ...newFilters
        }
        filtersRef.current = updatedFilters

        // PERBAIKAN: Update state filters dengan gender
        setFilters(prev => ({
            ...prev,
            search: updatedFilters.search,
            status: updatedFilters.status,
            businessType: updatedFilters.businessType,
            gender: updatedFilters.gender // ← TAMBAHKAN INI
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
        // PERBAIKAN: Clear gender juga
        const clearedFilters = {
            search: '',
            status: '',
            businessType: '',
            gender: '' // ← TAMBAHKAN INI
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

    // TAMBAHKAN: Fungsi untuk clear gender filter secara spesifik
    const clearGenderFilter = useCallback(() => {
        const updatedFilters = {
            ...filtersRef.current,
            gender: ''
        }
        
        filtersRef.current = updatedFilters

        setFilters(prev => ({
            ...prev,
            gender: ''
        }))
        
        fetchClients(1, updatedFilters, showAllOnSearch)
    }, [fetchClients, showAllOnSearch])

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
                // PERBAIKAN: Kirim gender filter ke fetchAllClients
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

    const addClient = async (clientData) => {
        try {
            const result = await clientService.addClient(clientData)
            toast.success('Client added successfully')
            
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

    const updateClientStatus = async (clientId, status) => {
        try {
            const validStatus = ['Active', 'Inactive'].includes(status)
                ? status
                : status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()

            if (!['Active', 'Inactive'].includes(validStatus)) {
                throw new Error('Status must be either "Active" of "Inactive"')
            }

            const result = await clientService.updateClientStatus(clientId, validStatus)

            if (result.success) {
                const updatedClient = result.data

                setMembers(prevMembers => {
                    if (!Array.isArray(prevMembers)) {
                        console.warn('[useClients] prevMembers is not an array:', prevMembers);
                        return prevMembers || [];
                    }
                    
                    const updatedMembers = prevMembers.map(member => {
                        if (member && member.id === clientId) {
                            return { ...member, status: validStatus };
                        }
                        return member;
                    });
                    
                    return updatedMembers;
                });

                toast.success(`Client status updated to ${validStatus}`)

                await fetchClientStats()

                return updatedClient
            }
        } catch (error) {
            console.error('Error updating client status:', error)
            toast.error(error.message || 'Failed to update status')

            await fetchClients(pagination.page, filtersRef.current, showAllOnSearch)
            throw error
        }
    }

    const getDisplayText = useCallback(() => {
        if (pagination.showingAllResults && filtersRef.current.search) {
            return `Showing all ${members.length} results for "${filtersRef.current.search}"`
        } else if (pagination.showingAllResults) {
            return `Showing all ${members.length} clients`
        } else {
            // Return empty string for normal pagination mode
            return '';
        }
    }, [pagination, members.length])

    const refetch = useCallback(() => {
        fetchClients(pagination.page, filtersRef.current, showAllOnSearch)
    }, [fetchClients, pagination.page, showAllOnSearch])

    // TAMBAHKAN: Fungsi untuk reset ke pagination mode
    const resetToPaginationMode = useCallback(() => {
        setShowAllOnSearch(false);
        fetchClients(1, filtersRef.current, false);
    }, [fetchClients]);

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
        clearGenderFilter, // ← TAMBAHKAN INI (opsional)
        searchClients,
        toggleShowAllOnSearch,
        resetToPaginationMode, // ← TAMBAHKAN INI
        isShowAllMode: () => pagination.showingAllResults || false,
        getDisplayText,
        refetch, 
        handlePageChange, 
        refreshData,
        addClient, 
        updateClient, 
        updateClientStatus,
        deleteClient,
        exportClients,
        refetchStats: fetchClientStats
    }
}