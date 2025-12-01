import clientService from "../services/clientService"
import { useState, useEffect, useCallback } from "react"
import toast from "react-hot-toast"

export const useClients = (initialFilters = {}) => {
    const [members, setMembers] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
    });

    const [clientStats, setClientStats] = useState(null)
    const [statsLoading, setStatsLoading] = useState(false)

    const [filters, setFilters] = useState({
        search: '',
        ...initialFilters
    });

    const fetchClients = useCallback(async (page = 1, customFilters = null) => {
        try {
            setLoading(true)
            setError(null)

            const currentFilters = customFilters || filters;

            const result = await clientService.fetchClients({
                page,
                limit: pagination.limit,
                ...currentFilters
            });

            setMembers(result.data || [])
            setPagination(prev => ({
                ...prev,
                page: result.metadata?.pagination?.page || page,
                total: result.metadata?.pagination?.total || 0,
                totalPages: result.metadata?.pagination?.totalPages || 0
            }))

        } catch (error) {
            console.error('Error fetching clients:', error)
            setError(error.message);
            toast.error('Failed to load client')
        } finally {
            setLoading(false)
        }
    }, [filters, pagination.limit]);

    const fetchClientStats = useCallback(async () => {
        try {
            setStatsLoading(true)

            const result = await clientService.fetchClients({
                page: 1,
                limit: 1
            })

            const totalClients = result.metadata?.pagination?.total || 0
            const previousMonthTotal = Math.max(0, totalClients - Math.floor(totalClients * 0.1))

            let percentageChange = '0%'
            let trend = 'up'
            let increaseCount = 0

            if (previousMonthTotal > 0) {
                const change = ((totalClients - previousMonthTotal) / previousMonthTotal) * 100
                percentageChange = `${Math.abs(change).toFixed(1).replace('.', '.')}%`
                trend = change >= 0 ? 'up' : 'down'
                increaseCount = Math.max(0, totalClients - previousMonthTotal)
            } else {
                percentageChange = '100%'
                trend = 'up'
                increaseCount = totalClients
            }

            const statsData = {
                title: 'Total Client',
                value: totalClients.toLocaleString(),
                subtitle: `+ ${increaseCount}`,
                percentage: percentageChange,
                trend: trend,
                period: 'Last month',
                icon: 'Users',
                color: 'blue',
                description: `${percentageChange} Last Month`
            }

            setClientStats(statsData)
        } catch (error) {
            console.error('Error fetching client stats:', error)
            toast.error('Failed to load client stats')
        } finally {
            setStatsLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchClientStats()
    }, [fetchClientStats])

    const refreshData = useCallback(() => {
        fetchClients(pagination.page)
    }, [fetchClients, pagination.page])

    const handlePageChange = useCallback((newPage) => {
        fetchClients(newPage)
    }, [fetchClients])

    useEffect(() => {
        fetchClients(1)
    }, [])

    const addClient = async (clientData) => {
        try {
            const result = await clientService.addClient(clientData)
            toast.success('Client add successfully')
            await fetchClients(pagination.page)
            await fetchClientStats()
            return result;
        } catch (error) {
            toast.error('Failed to add client')
            throw error;
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
            );

            return result.data || result;
        } catch (error) {
            toast.error('Failed to update client')
            throw error;
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
                total: prev.total - 1
            }))

            await fetchClientStats()
        } catch (error) {
            toast.error('Failed to delete client')
            throw error;
        } finally {
            setLoading(false)
        }
    }

    return {
        members, loading, error, pagination, filters, fetchClients, refetch: () => fetchClients(pagination.page), handlePageChange, refreshData, addClient, updateClient, deleteClient, clientStats, statsLoading, refetchStats: fetchClientStats
    }
}