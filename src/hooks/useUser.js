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

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchUsers(1)
        }, 50)

        return () => {
            clearTimeout(timer)
        }
    }, [fetchUsers])

    const refreshUsers = useCallback(() => {
        if (isMounted.current) {
            hasFetched.current = false
            fetchUsers(pagination.page)
        }
    }, [fetchUsers, pagination.page])

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
        
        let result;
        try {
            result = await userService.activateUser(userId);
        } catch (apiError) {           
            if (apiError.message && apiError.message.includes('Unexpected token')) {
                
                if (isMounted.current) {
                    setUsers(prevUsers => 
                        prevUsers.map(user => 
                            user.id === userId ? { ...user, status: 'active' } : user
                        )
                    );
                }
                
                toast.success('User activated successfully');
                
                setTimeout(() => {
                    if (isMounted.current) {
                        refreshUsers();
                    }
                }, 500);
                
                return { success: true, data: { status: 'active' } };
            }
            
            throw apiError;
        }
        
        toast.success(result?.message || 'User activated successfully');
        
        if (isMounted.current) {
            setUsers(prevUsers => 
                prevUsers.map(user => 
                    user.id === userId ? { ...user, status: 'active' } : user
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
        console.error('Error di activateUser hook:', error);
        
        if (error.message && error.message.includes('Unexpected token')) {
            
            if (isMounted.current) {
                setUsers(prevUsers => 
                    prevUsers.map(user => 
                        user.id === userId ? { ...user, status: 'active' } : user
                    )
                );
            }
            
            toast.success('User activated successfully');
            
            setTimeout(() => {
                if (isMounted.current) {
                    refreshUsers();
                }
            }, 500);
            
            return { success: true, data: { status: 'active' } };
        }
        
        toast.error(error.message || 'Failed to activate user');
        throw error;
    }
};

    const deactivateUser = async (userId) => {
        try {
            let result;
            try {
                result = await userService.deactivateUser(userId);
            } catch (apiError) {

                if (apiError.message && apiError.message.includes('Unexpected token')) {
                    
                    if (apiError.response && apiError.response.status === 200) {
                        
                        if (isMounted.current) {
                            setUsers(prevUsers => 
                                prevUsers.map(user => 
                                    user.id === userId ? { ...user, status: 'inactive' } : user
                                )
                            );
                        }
                        
                        toast.success('User deactivated successfully');
                        
                        setTimeout(() => {
                            if (isMounted.current) {
                                refreshUsers();
                            }
                        }, 500);
                        
                        return { success: true };
                    }
                }
                
                throw apiError;
            }
            
            toast.success(result.message || 'User deactivated successfully');
            
            if (isMounted.current) {
                setUsers(prevUsers => 
                    prevUsers.map(user => 
                        user.id === userId ? { ...user, status: 'inactive' } : user
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
            console.error('Error in deactivateUser hook:', error);
            
            if (error.message && error.message.includes('Unexpected token')) {
                
                if (isMounted.current) {
                    setUsers(prevUsers => 
                        prevUsers.map(user => 
                            user.id === userId ? { ...user, status: 'inactive' } : user
                        )
                    );
                }
                
                toast.success('User deactivated successfully');
                
                setTimeout(() => {
                    if (isMounted.current) {
                        refreshUsers();
                    }
                }, 500);
                
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
        deleteAvatar   
    }
}