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

            const result = await userService.fetchUsers({
                page: page,
                limit: 10,
                ...options
            })

            if (!isMounted.current) {
                return
            }

            let usersData = []
            let total = 0
            let currentPage = page

            if (result && result.success === true) {
                if (result.data) {
                    usersData = Array.isArray(result.data) ? result.data : []
                }
                
                if (result.pagination) {
                    total = result.pagination.total || 0
                    currentPage = result.pagination.page || page
                }
            }

            setUsers(usersData)
            setPagination({
                page: currentPage,
                limit: 10,
                total: total,
                totalPages: Math.ceil(total / 10) || 1
            })

        } catch (error) {
            console.error('useUsers.fetchUsers error:', error)
            
            if (!isMounted.current) return
            
            hasFetched.current = false
            
            if (error.message.includes('Tidak ada respon')) {
                console.warn('Network error, ignoring')
                return
            }

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
                console.log('Adding user with data:', userData);
                dataToSend = userData;
            } else {
                console.log('Adding user with FormData');
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
                console.log('Updating user with data:', userData);
                dataToSend = userData;
            } else {
                console.log('Updating user with FormData');
            }
            
            const result = await userService.updateUser(userId, dataToSend);
            
            toast.success(result.message || 'User updated successfully');
            
            // Update local state optimistically
            if (isMounted.current && !isFormData) {
                setUsers(prevUsers => 
                    prevUsers.map(user => 
                        user.id === userId ? { ...user, ...userData } : user
                    )
                );
            }
            
            // Refresh to get latest data
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

    /**
     * Upload avatar untuk user tertentu
     * @param {string|number} userId - ID user
     * @param {File} file - File gambar yang akan diupload
     * @returns {Promise} - Response dari server
     */
    const uploadAvatar = async (userId, file) => {
        try {
            if (!userId) {
                throw new Error('User ID is required');
            }
            
            if (!file) {
                throw new Error('File is required');
            }
            
            // Validasi tipe file
            if (!file.type.startsWith('image/')) {
                throw new Error('File must be an image');
            }
            
            // Validasi ukuran file (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                throw new Error('File size must be less than 5MB');
            }
            
            console.log('Uploading avatar for user:', userId, 'file:', file.name);
            
            // Buat FormData
            const formData = new FormData();
            formData.append('avatar', file); // Pastikan nama field 'avatar' sesuai dengan backend
            
            // Panggil service uploadAvatar
            const result = await userService.uploadAvatar(userId, formData);
            
            toast.success(result.message || 'Avatar uploaded successfully');
            
            // Refresh users to get updated avatar
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

    /**
     * Hapus avatar user
     * @param {string|number} userId - ID user
     * @returns {Promise} - Response dari server
     */
    const deleteAvatar = async (userId) => {
        try {
            if (!userId) {
                throw new Error('User ID is required');
            }
            
            console.log('Deleting avatar for user:', userId);
            
            const result = await userService.deleteAvatar(userId);
            
            toast.success(result.message || 'Avatar deleted successfully');
            
            // Refresh users to get updated avatar
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
            const result = await userService.activateUser(userId);
            toast.success(result.message || 'User activated successfully');
            
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
            console.error('Error in activateUser hook:', error);
            toast.error(error.message || 'Failed to activate user');
            throw error;
        }
    };

    const deactivateUser = async (userId) => {
        try {
            const result = await userService.deactivateUser(userId);
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
        uploadAvatar,  // Fungsi baru untuk upload avatar
        deleteAvatar   // Fungsi baru untuk delete avatar (opsional)
    }
}