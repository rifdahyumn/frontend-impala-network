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

    const [filters, setFilters] = useState({
        search: '',
        ...initialFilters
        // status: '',
        // industry: '',
        // company: '',
        // program_name: '',
        // sortBy: 'id',
        // sortOrder: 'desc'
    });

    const fetchClients = useCallback(async (page = 1, customFilters = null) => {
        try {
            setLoading(true)
            setError(null)

            const currentFilters = customFilters || filters;

            const result = await clientService.fetchClients({
                page,
                limit: pagination.limit,
                ...filters
            });

            setMembers(result.data || [])
            setPagination(prev => ({
                ...prev,
                page: result.meta?.pagination?.page || page,
                total: result.pagination?.total || 0,
                totalPages: result.pagination?.totalPages || 0,
            }))

        } catch (error) {
            console.error('Error fetching clients:', error)
            setError(error.messsage);
            toast.error('Failed to load client')
        } finally {
            setLoading(false)
        }
    }, [filters, pagination.limit]);

    const refetchWithFilters = useCallback((newFilters) => {
        setFilters(newFilters);
    }, []);

    const changePage = useCallback((page) => {
        fetchClients(page);
    }, [fetchClients]);

    useEffect(() => {
        fetchClients(1);
    }, [fetchClients]); 

    const addClient = async (clientData) => {
        try {
            const result = await clientService.addClient(clientData)
            toast.success('Client add successfully')
            await fetchClients(pagination.page)
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
            // toast.success('Client deteled successfully')

            setMembers(prevMembers =>
                prevMembers.filter(members => members.id !== clientId)
            )

            setPagination(prev => ({
                ...prev,
                total: prev.total - 1
            }))
        } catch (error) {
            toast.error('Failed to delete client')
            throw error;
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchClients()
    }, [fetchClients])

    return {
        members, loading, error, pagination, filters, setFilters: refetchWithFilters, fetchClients: changePage, addClient, updateClient, deleteClient, setPagination
    }
}