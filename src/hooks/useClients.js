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

    // Tambahkan state untuk filter
    const [filters, setFilters] = useState({
        search: '',
        status: '',
        businessType: '',
        ...initialFilters
    });

    // 🔴 MODIFIKASI: Fungsi fetch dengan filter yang dikirim ke server
    const fetchClients = useCallback(async (page = 1, customFilters = null) => {
        try {
            setLoading(true)
            setError(null)

            // Gunakan customFilters jika ada, jika tidak gunakan filters state
            const currentFilters = customFilters || filters;

            // Siapkan parameter untuk API
            const params = {
                page,
                limit: pagination.limit,
                search: currentFilters.search || undefined,
                status: currentFilters.status || undefined,
                businessType: currentFilters.businessType || undefined
            };

            // 🔴 DEBUG: Log parameter yang dikirim
        console.log('📤 Sending filters to server:', {
            page,
            limit: pagination.limit,
            filters: currentFilters,
            params
        });

            // Hapus parameter yang undefined
            Object.keys(params).forEach(key => {
                if (params[key] === undefined || params[key] === '') {
                    delete params[key];
                }
            });

            console.log('📤 Cleaned params:', params);

            // Kirim request ke server dengan filter
            const result = await clientService.fetchClients(params);

            console.log('📥 Received from server:', {
            dataCount: result.data?.length,
            pagination: result.metadata?.pagination
        });


            setMembers(result.data || [])
            setPagination({
                page: result.metadata?.pagination?.page || page,
                limit: pagination.limit,
                total: result.metadata?.pagination?.total || 0,
                totalPages: result.metadata?.pagination?.totalPages || 0
            })

        } catch (error) {
            console.error('Error fetching clients:', error)
            setError(error.message);
            toast.error('Failed to load clients')
        } finally {
            setLoading(false)
        }
    }, [filters, pagination.limit]);

    // 🔴 MODIFIKASI: Fungsi khusus untuk update filter dan fetch
    const updateFiltersAndFetch = useCallback(async (newFilters) => {
        // Update state filters
        setFilters(prev => ({
            ...prev,
            ...newFilters
        }));
        
        // Fetch data dengan filter baru, reset ke halaman 1
        await fetchClients(1, { ...filters, ...newFilters });
    }, [filters, fetchClients]);

    // 🔴 MODIFIKASI: Fungsi clear filter
    const clearFilters = useCallback(async () => {
        const clearedFilters = {
            search: '',
            status: '',
            businessType: ''
        };
        
        setFilters(clearedFilters);
        await fetchClients(1, clearedFilters);
    }, [fetchClients]);

    const fetchClientStats = useCallback(async () => {
        try {
            setStatsLoading(true)
            const result = await clientService.fetchClientStats()
            
            if (result.success) {
                setClientStats(result.data)
            } else {
                throw new Error(result.message || 'Failed to fetch client stats')
            }
        } catch (error) {
            console.error('Error fetching client stats:', error)
            toast.error('Failed to load client stats')
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
            toast.success('Client added successfully')
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
        members, 
        loading, 
        error, 
        pagination, 
        filters, // 🔴 EKSPOS filters state
        fetchClients,
        updateFiltersAndFetch, // 🔴 FUNGSI BARU
        clearFilters, // 🔴 FUNGSI BARU
        refetch: () => fetchClients(pagination.page), 
        handlePageChange, 
        refreshData, 
        addClient, 
        updateClient, 
        deleteClient, 
        clientStats, 
        statsLoading, 
        refetchStats: fetchClientStats
    }
}