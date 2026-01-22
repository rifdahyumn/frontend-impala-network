import { authApi } from "./authServices"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

class UserService {
    constructor() {
        this.baseURL = API_BASE_URL
        this.pendingRequests = new Map()
        this.responseCache = new Map()
        this.cacheDuration = 30000
    }

    handleResponse(response) {
        if (!response) {
            throw new Error('No response from server')
        }
        
        if (response.success !== undefined) {
            if (response.success === false) {
                throw new Error(response.message || 'Request failed')
            }
            return response
        }
        
        if (Array.isArray(response)) {
            return {
                success: true,
                data: response,
                message: 'Success',
                pagination: {
                    page: 1,
                    limit: response.length,
                    total: response.length,
                    totalPages: 1
                }
            }
        }
        
        return {
            success: true,
            data: response,
            message: 'Success'
        }
    }

    async makeRequest(method, url, data = null, options = {}) {
        const requestKey = `${method}:${url}:${JSON.stringify(data)}`
        
        if (this.pendingRequests.has(requestKey)) {
            return this.pendingRequests.get(requestKey)
        }

        const cacheKey = `cache:${requestKey}`
        const cachedResponse = this.responseCache.get(cacheKey)
        
        if (cachedResponse && Date.now() - cachedResponse.timestamp < this.cacheDuration) {
            return cachedResponse.data
        }

        const requestPromise = (async () => {
            try {
                let response
                const requestOptions = {
                    ...options,
                    timeout: 10000
                }
                
                switch (method.toLowerCase()) {
                    case 'get':
                        response = await authApi.get(url, requestOptions)
                        break
                    case 'post':
                        response = await authApi.post(url, data, requestOptions)
                        break
                    case 'put':
                        response = await authApi.put(url, data, requestOptions)
                        break
                    case 'patch':
                        response = await authApi.patch(url, data, requestOptions)
                        break
                    case 'delete':
                        response = await authApi.delete(url, requestOptions)
                        break
                    default:
                        throw new Error(`Unsupported method: ${method}`)
                }
                
                const result = this.handleResponse(response)
                
                this.responseCache.set(cacheKey, {
                    data: result,
                    timestamp: Date.now()
                })
                
                return result
                
            } catch (error) {
                console.error(`${method.toUpperCase()} request failed:`, error.message)
                throw error
            } finally {
                this.pendingRequests.delete(requestKey)
            }
        })()

        this.pendingRequests.set(requestKey, requestPromise)
        return requestPromise
    }

    async fetchUsers(params = {}) {
        try {
            const {
                page = 1,
                limit = 10,
                search = '',
                sortBy = 'created_at',
                sortOrder = 'desc'
            } = params

            const queryParams = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
                sort_by: sortBy,
                sort_order: sortOrder,
                ...(search && { search }),
            })

            const url = `/user?${queryParams}`
            
            const result = await this.makeRequest('get', url)
            
            return result
                
        } catch (error) {
            console.error('UserService.fetchUsers error:', error.message)
            
            if (!navigator.onLine || error.message.includes('Tidak ada respon')) {
                return this.getMockUsers(params)
            }
            
            throw error
        }
    }

    getMockUsers(params = {}) {
        const page = params.page || 1
        const limit = params.limit || 10
        
        const mockUsers = [
            {
                id: 1,
                employee_id: 'EMP001',
                full_name: 'Admin User',
                email: 'admin@example.com',
                position: 'Managing Director',
                role: 'superadmin',
                status: 'Active',
                phone: '08123456789',
                last_login: new Date().toISOString(),
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                avatar: null
            },
            {
                id: 2,
                employee_id: 'EMP002',
                full_name: 'Manager User',
                email: 'manager@example.com',
                position: 'Head Manager',
                role: 'admin',
                status: 'Active',
                phone: '08123456788',
                last_login: new Date().toISOString(),
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                avatar: null
            },
            {
                id: 3,
                employee_id: 'EMP003',
                full_name: 'Finance Officer',
                email: 'finance@example.com',
                position: 'Finance',
                role: 'user',
                status: 'Active',
                phone: '08123456787',
                last_login: new Date().toISOString(),
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                avatar: null
            },
            {
                id: 4,
                employee_id: 'EMP004',
                full_name: 'Legal Advisor',
                email: 'legal@example.com',
                position: 'Legal',
                role: 'user',
                status: 'Inactive',
                phone: '08123456786',
                last_login: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                avatar: null
            },
            {
                id: 5,
                employee_id: 'EMP005',
                full_name: 'Creative Designer',
                email: 'creative@example.com',
                position: 'Creative',
                role: 'user',
                status: 'Active',
                phone: '08123456785',
                last_login: new Date().toISOString(),
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                avatar: null
            },
            {
                id: 6,
                employee_id: 'EMP006',
                full_name: 'Talent Manager',
                email: 'talent@example.com',
                position: 'Talent Manager',
                role: 'user',
                status: 'Active',
                phone: '08123456784',
                last_login: new Date().toISOString(),
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                avatar: null
            },
            {
                id: 7,
                employee_id: 'EMP007',
                full_name: 'Ecosystem Manager',
                email: 'ecosystem@example.com',
                position: 'Ecosystem Manager',
                role: 'user',
                status: 'Active',
                phone: '08123456783',
                last_login: new Date().toISOString(),
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                avatar: null
            },
            {
                id: 8,
                employee_id: 'EMP008',
                full_name: 'Program Manager',
                email: 'program@example.com',
                position: 'Program Manager',
                role: 'user',
                status: 'Inactive',
                phone: '08123456782',
                last_login: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                avatar: null
            },
            {
                id: 9,
                employee_id: 'EMP009',
                full_name: 'Space Manager',
                email: 'space@example.com',
                position: 'Space Manager',
                role: 'user',
                status: 'Active',
                phone: '08123456781',
                last_login: new Date().toISOString(),
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                avatar: null
            },
            {
                id: 10,
                employee_id: 'EMP010',
                full_name: 'Strategic Partner',
                email: 'partner@example.com',
                position: 'Strategic Partnership Executive',
                role: 'admin',
                status: 'Active',
                phone: '08123456780',
                last_login: new Date().toISOString(),
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                avatar: null
            }
        ]
        
        let filteredUsers = mockUsers
        if (params.search) {
            const searchTerm = params.search.toLowerCase()
            filteredUsers = mockUsers.filter(user => 
                user.full_name.toLowerCase().includes(searchTerm) ||
                user.email.toLowerCase().includes(searchTerm) ||
                user.employee_id.toLowerCase().includes(searchTerm)
            )
        }
        
        const startIndex = (page - 1) * limit
        const endIndex = startIndex + limit
        const paginatedUsers = filteredUsers.slice(startIndex, endIndex)
        
        return {
            success: true,
            data: paginatedUsers,
            pagination: {
                page: page,
                limit: limit,
                total: filteredUsers.length,
                totalPages: Math.ceil(filteredUsers.length / limit)
            }
        }
    }

    async addUser(formData) {
        try {
            return await this.makeRequest('post', '/user', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })
        } catch (error) {
            console.error('UserService.addUser failed:', error)
            throw error
        }
    }

    async updateUser(userId, formData) {
        try {
            const isFormData = formData instanceof FormData
            
            return await this.makeRequest('put', `/user/${userId}`, formData, {
                headers: isFormData ? {
                    'Content-Type': 'multipart/form-data'
                } : {
                    'Content-Type': 'application/json'
                }
            })
        } catch (error) {
            console.error('UserService.updateUser failed:', error)
            throw error
        }
    }

    async deleteUser(userId) {
        try {
            return await this.makeRequest('delete', `/user/${userId}`)
        } catch (error) {
            console.error('UserService.deleteUser failed:', error)
            throw error
        }
    }

    async activateUser(userId) {
        try {
            return await this.makeRequest('patch', `/user/${userId}/activate`)
        } catch (error) {
            console.error('UserService.activateUser failed:', error)
            throw error
        }
    }

    async deactivateUser(userId) {
        try {
            return await this.makeRequest('patch', `/user/${userId}/deactivate`)
        } catch (error) {
            console.error('UserService.deactivateUser failed:', error)
            throw error
        }
    }

    async getUserById(userId) {
        try {
            return await this.makeRequest('get', `/user/${userId}`)
        } catch (error) {
            console.error('UserService.getUserById failed:', error)
            throw error
        }
    }

    clearCache() {
        this.responseCache.clear()
        this.pendingRequests.clear()
    }
}

export default new UserService()