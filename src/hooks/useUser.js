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
                page: currentPage,
                limit: pagination.limit,
                ...currentFilters
            });

            setUsers(result.data || [])
            setPagination(prev => ({
                ...prev,
                page: result.metadata?.pagination?.page || currentPage,
                total: result.metadata?.pagination?.total || result.total || 0,
                totalPages: result.metadata?.pagination?.totalPages || Math.ceil((result.pagination?.total || result.total || 0) / pagination.limit),
            }))
        } catch (error) {
            console.error('Error fetching users:', error)
            setError(error.message || 'Failed to fetch users');
            toast.error('Failed to load users')
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

    const refreshUsers = useCallback(async () => {
        await fetchUsers(pagination.page);
    }, [fetchUsers, pagination.page]);

    const autoRefresh = useCallback(async () => {
        const remainingUsers = users.length - 1;
        if (remainingUsers === 0 && pagination.page > 1) {
            await fetchUsers(pagination.page - 1);
        } else {
            await fetchUsers(pagination.page);
        }
    }, [fetchUsers, pagination.page, users.length]);

    useEffect(() => {
        fetchUsers(1);
    }, [filters, fetchUsers]);

    const addUser = async (userData) => {
        try {
            const result = await userService.addUser(userData)
            toast.success('User added successfully')
            await autoRefresh();
            return result
        } catch (error) {
            console.error('Error adding user:', error)
            toast.error(error.message || 'Failed to add user')
            throw error
        }
    }

    const updateUser = async (userId, userData) => {
        try {
            const result = await userService.updateUser(userId, userData)
            toast.success('User updated successfully')

            setUsers(prevUsers => 
                prevUsers.map(user =>
                    user.id === userId
                        ? { ...user, ...userData, ...result.data || result }
                        : user
                )
            )

            setTimeout(() => {
                autoRefresh();
            }, 500);

            return result.data || result
        } catch (error) {
            console.error(' Error updating user:', error)
            toast.error(error.message || 'Failed to update user')
            throw error
        }
    }

    const deleteUser = async (userId) => {
        try {
            await userService.deleteUser(userId);
            toast.success('User deactivated successfully');
            await autoRefresh();
        } catch (error) {
            console.error('Error deleting user:', error);
            toast.error(error.message || 'Failed to delete user');
            throw error;
        }
    }

    const activateUser = async (userId) => {
        try {
            await userService.activateUser(userId)
            toast.success('User activated successfully')

            await autoRefresh()
        } catch (error) {
            console.error('❌ Error activating user:', error);
            toast.error(error.message || 'Failed to activate user');
            throw error;
        }
    }

    return {
        users, 
        loading, 
        error, 
        pagination, 
        filters,
        setFilters: refetchWithFilters, 
        fetchUsers: changePage, 
        refreshUsers,
        autoRefresh,
        addUser,
        updateUser,
        deleteUser,
        activateUser
    }
}