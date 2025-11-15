import userService from "../services/userService";
import { useState, useEffect, useCallback } from "react"
import toast from "react-hot-toast"

export const useUsers = (initialFilters = {}) => {
    const [users, setUsers] = useState([])
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
        status: '',
        role: '',
        ...initialFilters
    });

    const fetchUsers = useCallback(async (page = 1, customFilters = null) => {
        try {
            setLoading(true)
            setError(null)

            const currentFilters = customFilters || filters;
            const currentPage = page || pagination.page;

            const result = await userService.fetchUsers({
                page,
                limit: pagination.limit,
                ...currentFilters
            });

            setUsers(result.data || [])

            setPagination(prev => ({
                ...prev,
                page: result.meta?.pagination?.page || page,
                total: result.pagination?.total || 0,
                totalPages: result.pagination?.totalPages || Math.ceil((result.pagination?.total || result.total || 0) / pagination.limit),
            }))
        } catch (error) {
            console.error('Error fetching users:', error)
            setError(error.messsage);
            toast.error('Failed to load user')
        } finally {
            setLoading(false)
        }
    }, [filters, pagination.limit, pagination.page])

    const refetchWithFilters = useCallback((newFilters) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
    }, []);

    const changePage = useCallback((page) => {
        fetchUsers(page);
    }, [fetchUsers]);

    const refreshUsers = useCallback(() => {
        fetchUsers(pagination.page);
    }, [fetchUsers, pagination.page]);

    useEffect(() => {
        fetchUsers(1);
    }, [fetchUsers]); 

    const addUser = async (userData) => {
        try {
            const result = await userService.addUser(userData)
            toast.success('User add successfully')
            
            await refreshUsers();
            return result
        } catch (error) {
            toast.error('Failed to add user')
            throw error
        }
    }

    return {
        users, loading, error, pagination, filters, setFilters: refetchWithFilters, fetchUsers: changePage, addUser
    }
}