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

        if (hasFetched.current) {
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
            const formData = new FormData()
            Object.keys(userData).forEach(key => {
                if (userData[key] !== null && userData[key] !== undefined) {
                    formData.append(key, userData[key])
                }
            })
            
            const result = await userService.addUser(formData)
            toast.success(result.message || 'User added successfully')
            
            setTimeout(() => {
                if (isMounted.current) {
                    refreshUsers()
                }
            }, 500)
            return result
        } catch (error) {
            toast.error(error.message || 'Failed to add user')
            throw error
        }
    }

    const updateUser = async (userId, userData) => {
        try {
            const formData = new FormData()
            Object.keys(userData).forEach(key => {
                if (userData[key] !== null && userData[key] !== undefined) {
                    formData.append(key, userData[key])
                }
            })
            
            const result = await userService.updateUser(userId, formData)
            toast.success(result.message || 'User updated successfully')
            
            if (isMounted.current) {
                setUsers(prevUsers => 
                    prevUsers.map(user => 
                        user.id === userId ? { ...user, ...userData } : user
                    )
                )
            }
            
            return result
        } catch (error) {
            toast.error(error.message || 'Failed to update user')
            throw error
        }
    }

    const deleteUser = async (userId) => {
        try {
            await userService.deleteUser(userId)
            toast.success('User deleted successfully')
            
            if (isMounted.current) {
                setUsers(prevUsers => prevUsers.filter(user => user.id !== userId))
            }
        } catch (error) {
            toast.error(error.message || 'Failed to delete user')
            throw error
        }
    }

    const activateUser = async (userId) => {
        try {
            await userService.activateUser(userId)
            toast.success('User activated successfully')
            
            if (isMounted.current) {
                setUsers(prevUsers => 
                    prevUsers.map(user => 
                        user.id === userId ? { ...user, status: 'active' } : user
                    )
                )
            }
        } catch (error) {
            toast.error(error.message || 'Failed to activate user')
            throw error
        }
    }

    const deactivateUser = async (userId) => {
        try {
            await userService.deactivateUser(userId)
            toast.success('User deactivated successfully')
            
            if (isMounted.current) {
                setUsers(prevUsers => 
                    prevUsers.map(user => 
                        user.id === userId ? { ...user, status: 'inactive' } : user
                    )
                )
            }
        } catch (error) {
            toast.error(error.message || 'Failed to deactivate user')
            throw error
        }
    }

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
        deactivateUser
    }
}