import userService from "../services/userService"
import { useState, useEffect, useCallback, useRef } from "react"
import toast from "react-hot-toast"

export const useUsers = () => {
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 1
    })

    const [searchTerm, setSearchTerm] = useState('')
    const [filters, setFilters] = useState({
        position: '',
        role: ''
    })
    
    const [totalStats, setTotalStats] = useState({
        totalUsers: 0,
        totalActive: 0
    })
    const [statsLoading, setStatsLoading] = useState(false)

    const isMounted = useRef(true)
    const hasFetched = useRef(false)

    useEffect(() => {
        isMounted.current = true
        
        return () => {
            isMounted.current = false
        }
    }, [])

    const fetchUsers = useCallback(async (page = 1, options = {}) => {
        if (!isMounted.current) {
            return
        }

        try {
            setLoading(true)
            setError(null)
            hasFetched.current = true

            const serviceParams = {
                page: page,
                limit: 10,
                search: options.search || '',
                position: options.position || '',
                role: options.role || '',
                ...options
            }

            const result = await userService.fetchUsers(serviceParams)

            if (!isMounted.current) {
                return
            }

            let usersData = []
            let total = 0
            let currentPage = page
            let totalPages = 1

            if (result && result.success === true) {
                if (result.data) {
                    usersData = Array.isArray(result.data) ? result.data : []
                }
                
                if (result.metadata && result.metadata.pagination) {
                    total = result.metadata.pagination.total || 0
                    currentPage = result.metadata.pagination.page || page
                    totalPages = result.metadata.pagination.totalPages || Math.ceil(total / 10)
                }
                else if (result.pagination) {
                    total = result.pagination.total || 0
                    currentPage = result.pagination.page || page
                    totalPages = result.pagination.totalPages || Math.ceil(total / 10)
                }
            }

            setUsers(usersData)
            setPagination({
                page: currentPage,
                limit: 10,
                total: total,
                totalPages: totalPages
            })
            
            if (isMounted.current && total > 0) {
                setTotalStats(prev => ({
                    ...prev,
                    totalUsers: total
                }))
            }

        } catch (error) {
            console.error('useUsers.fetchUsers error:', error)
            
            if (!isMounted.current) return
            
            hasFetched.current = false
            
            setError(error.message || 'Failed to fetch users')
            setUsers([])
            setPagination({
                page: 1,
                limit: 10,
                total: 0,
                totalPages: 1
            })
        } finally {
            if (isMounted.current) {
                setLoading(false)
            }
        }
    }, [])

    const fetchTotalStats = useCallback(async () => {
        if (!isMounted.current) return
        
        if (statsLoading) return
        
        try {
            setStatsLoading(true)
            
            let totalActive = 0
            let totalUsers = pagination.total || 0

            if (userService.getTotalStats) {
                try {
                    const result = await userService.getTotalStats()
                    if (result && result.success && result.data) {
                        if (isMounted.current) {
                            setTotalStats({
                                totalUsers: result.data.totalUsers || totalUsers,
                                totalActive: result.data.totalActive || 0
                            })
                            setStatsLoading(false)
                            return
                        }
                    }
                } catch  {
                    //
                }
            }
            
            if (totalUsers > 0 && pagination.totalPages > 1) {
                try {
                    let allUsers = [...users]
                    
                    const totalPages = pagination.totalPages
                    
                    const fetchPromises = []
                    for (let page = 2; page <= totalPages; page++) {
                        fetchPromises.push(
                            userService.fetchUsers({ 
                                page: page, 
                                limit: pagination.limit || 10,
                            })
                            .then(res => {
                                if (res && res.success && res.data) {
                                    return Array.isArray(res.data) ? res.data : []
                                }
                                return []
                            })
                            .catch(err => {
                                console.error(`Error fetching page ${page}:`, err)
                                return []
                            })
                        )
                    }
                    
                    if (fetchPromises.length > 0) {
                        const results = await Promise.all(fetchPromises)
                        
                        results.forEach(pageUsers => {
                            if (pageUsers.length > 0) {
                                allUsers = [...allUsers, ...pageUsers]
                            }
                        })
                    }
                    
                    totalActive = allUsers.filter(u => 
                        u.status?.toLowerCase() === 'active' || 
                        u.status?.toLowerCase() === 'aktif'
                    ).length
                    
                } catch (error) {
                    console.error('Error fetching all pages:', error)
                    
                    totalActive = users.filter(u => 
                        u.status?.toLowerCase() === 'active' || 
                        u.status?.toLowerCase() === 'aktif'
                    ).length
                    
                    if (pagination.totalPages > 1) {
                        const avgPerPage = users.length
                        const estimatedTotal = avgPerPage * pagination.totalPages
                        const activePerPage = totalActive
                        const estimatedActive = Math.round((activePerPage / avgPerPage) * estimatedTotal)
                        
                        totalActive = Math.min(estimatedActive, totalUsers)
                    }
                }
            } else {
                totalActive = users.filter(u => 
                    u.status?.toLowerCase() === 'active' || 
                    u.status?.toLowerCase() === 'aktif'
                ).length
            }
            
            if (isMounted.current) {
                setTotalStats({
                    totalUsers: totalUsers,
                    totalActive: totalActive
                })
            }
            
        } catch (error) {
            console.error('Error fetching total stats:', error)
            
            if (isMounted.current) {
                setTotalStats({
                    totalUsers: pagination.total || 0,
                    totalActive: users.filter(u => 
                        u.status?.toLowerCase() === 'active' || 
                        u.status?.toLowerCase() === 'aktif'
                    ).length
                })
            }
        } finally {
            if (isMounted.current) {
                setStatsLoading(false)
            }
        }
    }, [users, pagination.total, pagination.totalPages, pagination.limit, statsLoading])

    useEffect(() => {
        const timer = setTimeout(() => {
            if (!loading && pagination.total > 0) {
                fetchTotalStats()
            }
        }, 500)

        return () => {
            clearTimeout(timer)
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        if (!loading && pagination.total > 0) {
            const timer = setTimeout(() => {
                fetchTotalStats()
            }, 300)
            
            return () => clearTimeout(timer)
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pagination.total, loading])

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchUsers(1)
        }, 50)

        return () => {
            clearTimeout(timer)
        }
    }, [fetchUsers])

    const refreshUsers = useCallback(async () => {
        if (!isMounted.current) return;
        
        try {
            setLoading(true);

            const result = await userService.fetchUsers({
                page: pagination.page,
                limit: pagination.limit,
                search: searchTerm,
                position: filters.position,
                role: filters.role,
                _t: Date.now() 
            });
            
            if (!isMounted.current) return;
            
            if (result && result.success === true) {
                let usersData = Array.isArray(result.data) ? result.data : [];
                let total = result.pagination?.total || 0;
                
                const activatedUser = usersData.find(u => u.id === 'e4a1237c-74f9-4936-be5d-cd6ad14df2a2');

                setUsers(usersData);
                
                setPagination(prev => ({
                    ...prev,
                    total: total,
                    totalPages: result.pagination?.totalPages || Math.ceil(total / prev.limit)
                }));
                
                const totalActive = usersData.filter(u => 
                    u.status?.toLowerCase() === 'active'
                ).length;
                
                setTotalStats({
                    totalUsers: total,
                    totalActive: totalActive
                });
            }
            
        } catch (error) {
            console.error('Refresh users failed:', error);
            setError(error.message);
        } finally {
            if (isMounted.current) {
                setLoading(false);
            }
        }
    }, [pagination.page, pagination.limit, searchTerm, filters.position, filters.role]);

    const addUser = async (userData) => {
        try {
            const isFormData = userData instanceof FormData;
            
            let dataToSend = userData;
            
            if (!isFormData) {
                dataToSend = userData;
            }
            
            const result = await userService.addUser(dataToSend);
            toast.success(result.message || 'User added successfully');
            
            setTimeout(() => {
                if (isMounted.current) {
                    refreshUsers();
                }
            }, 500);
            
            return result;
        } catch (error) {
            console.error('Error in addUser hook:', error);
            toast.error(error.message || 'Failed to add user');
            throw error;
        }
    };

    const updateUser = async (userId, userData) => {
        try {
            const isFormData = userData instanceof FormData;
            
            let dataToSend = userData;
            
            if (!isFormData) {
                dataToSend = userData;
            }
            
            const result = await userService.updateUser(userId, dataToSend);
            
            toast.success(result.message || 'User updated successfully');
            
            if (isMounted.current && !isFormData) {
                setUsers(prevUsers => 
                    prevUsers.map(user => 
                        user.id === userId ? { ...user, ...userData } : user
                    )
                );
            }
            
            setTimeout(() => {
                if (isMounted.current) {
                    refreshUsers();
                }
            }, 500);
            
            return result;
        } catch (error) {
            console.error('Error in updateUser hook:', error);
            toast.error(error.message || 'Failed to update user');
            throw error;
        }
    };

    const uploadAvatar = async (userId, file) => {
        try {
            if (!userId) {
                throw new Error('User ID is required');
            }
            
            if (!file) {
                throw new Error('File is required');
            }
            
            if (!file.type.startsWith('image/')) {
                throw new Error('File must be an image');
            }
            
            if (file.size > 5 * 1024 * 1024) {
                throw new Error('File size must be less than 5MB');
            }
            
            const formData = new FormData();
            formData.append('avatar', file); 
            
            const result = await userService.uploadAvatar(userId, formData);
            
            toast.success(result.message || 'Avatar uploaded successfully');
            
            setTimeout(() => {
                if (isMounted.current) {
                    refreshUsers();
                }
            }, 500);
            
            return result;
            
        } catch (error) {
            console.error('Error in uploadAvatar hook:', error);
            toast.error(error.message || 'Failed to upload avatar');
            throw error;
        }
    };

    const deleteAvatar = async (userId) => {
        try {
            if (!userId) {
                throw new Error('User ID is required');
            }
            
            const result = await userService.deleteAvatar(userId);
            
            toast.success(result.message || 'Avatar deleted successfully');
            
            setTimeout(() => {
                if (isMounted.current) {
                    refreshUsers();
                }
            }, 500);
            
            return result;
            
        } catch (error) {
            console.error('Error in deleteAvatar hook:', error);
            toast.error(error.message || 'Failed to delete avatar');
            throw error;
        }
    };

    const deleteUser = async (userId) => {
        try {
            await userService.deleteUser(userId);
            toast.success('User deleted successfully');
            
            if (isMounted.current) {
                setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
            }
            
            setTimeout(() => {
                if (isMounted.current) {
                    refreshUsers();
                }
            }, 500);
        } catch (error) {
            console.error('Error in deleteUser hook:', error);
            toast.error(error.message || 'Failed to delete user');
            throw error;
        }
    };

    const activateUser = async (userId) => {
        try {
            if (!userId) {
                throw new Error('User ID is required');
            }
            
            const result = await userService.activateUser(userId);
            
            
            toast.success('User activated successfully');
            
            if (isMounted.current) {
                await refreshUsers();
            }
            
            return result;
            
        } catch (error) {
            console.error('Error in activateUser hook:', error);
            
            if (error.response?.data?.code === 'ALREADY_ACTIVE') {
                toast.success('User is already active');
                
                if (isMounted.current) {
                    await refreshUsers();
                }
                
                return { success: true };
            }
            
            toast.error(error.message || 'Failed to activate user');
            throw error;
        }
    };

    const deactivateUser = async (userId) => {
        try {
            if (!userId) {
                throw new Error('User ID is required');
            }
            
            const result = await userService.deactivateUser(userId);
            
            
            toast.success('User deactivated successfully');
            
            if (isMounted.current) {
                await refreshUsers();
            }
            
            return result;
            
        } catch (error) {
            console.error('Error in deactivateUser hook:', error);
            
            if (error.response?.data?.code === 'ALREADY_INACTIVE') {
                toast.success('User is already inactive');
                
                if (isMounted.current) {
                    await refreshUsers();
                }
                
                return { success: true };
            }
            
            toast.error(error.message || 'Failed to deactivate user');
            throw error;
        }
    };

    const getUserById = useCallback((userId) => {
        return users.find(user => user.id === userId) || null;
    }, [users]);

    return {
        users, 
        loading, 
        error, 
        pagination, 
        fetchUsers,
        refreshUsers,
        addUser,
        updateUser,
        deleteUser,
        activateUser,
        deactivateUser,
        getUserById,
        uploadAvatar,  
        deleteAvatar,
        totalStats,
        statsLoading,
        fetchTotalStats,
        searchTerm,
        setSearchTerm,
        filters,
        setFilters
    }
}