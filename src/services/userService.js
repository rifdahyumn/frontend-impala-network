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
                
                if (method.toLowerCase() !== 'get') {
                    this.clearListCache()
                }
                
                this.responseCache.set(cacheKey, {
                    data: result,
                    timestamp: Date.now()
                })
                
                return result
                
            } catch (error) {
                console.error(`${method.toUpperCase()} request failed:`, error.message)
                
                if (error.response) {
                    const status = error.response.status
                    if (status === 400) {
                        error.message = error.response.data?.message || 'Bad request: Invalid data sent'
                    } else if (status === 404) {
                        error.message = 'Resource not found'
                    } else if (status === 500) {
                        error.message = 'Server error, please try again later'
                    }
                }
                
                throw error
            } finally {
                this.pendingRequests.delete(requestKey)
            }
        })()

        this.pendingRequests.set(requestKey, requestPromise)
        return requestPromise
    }

    clearListCache() {
        for (const key of this.responseCache.keys()) {
            if (key.includes('/user?') || key.includes('/user/')) {
                this.responseCache.delete(key)
            }
        }
    }

    validateUserData(userData, isUpdate = false) {
        const errors = [];
        
        if (userData instanceof FormData) {
            return errors; 
        }
        
        if (!isUpdate) {
            const requiredFields = ['employee_id', 'email', 'full_name', 'role', 'phone'];
            for (const field of requiredFields) {
                if (!userData[field] || (typeof userData[field] === 'string' && userData[field].trim() === '')) {
                    errors.push(`${field} is required`);
                }
            }
        }
        
        if (userData.email && !/\S+@\S+\.\S+/.test(userData.email)) {
            errors.push('Invalid email format');
        }
        
        if (userData.phone) {
            const digitsOnly = String(userData.phone).replace(/\D/g, '');
            if (digitsOnly.length < 10 || digitsOnly.length > 15) {
                errors.push('Phone number must be between 10-15 digits');
            }
        }
        
        return errors;
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
            
            if (!navigator.onLine || error.message.includes('No response')) {
                console.warn('Using mock data due to network error')
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

    async addUser(userData) {
        try {
            const isFormData = userData instanceof FormData;
            
            if (isFormData) {   
                const result = await this.makeRequest('post', '/user', userData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
                
                return result;
            }
            
            if (typeof userData === 'object' && userData !== null) {
                const errors = this.validateUserData(userData, false);
                if (errors.length > 0) {
                    throw new Error(`Validation failed: ${errors.join(', ')}`);
                }

                const dataToSend = Object.fromEntries(
                    Object.entries(userData).filter(([value]) => 
                        value !== null && value !== undefined && value !== ''
                    )
                );
                
                const result = await this.makeRequest('post', '/user', dataToSend, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                
                return result;
            }
            
            throw new Error('Invalid data format');
            
        } catch (error) {
            console.error('UserService.addUser failed:', error);
            throw error;
        }
    }

    async updateUser(userId, userData) {
        try {
            if (!userId) {
                throw new Error('User ID is required')
            }

            const isFormData = userData instanceof FormData
            
            let dataToSend = userData
            if (!isFormData && typeof userData === 'object') {
                dataToSend = Object.fromEntries(
                    Object.entries(userData).filter(([value]) => 
                        value !== null && value !== undefined && value !== ''
                    )
                )
                
                if (Object.keys(dataToSend).length === 0) {
                    throw new Error('No fields to update')
                }
            }
            
            if (isFormData) {
                let hasEntries = false
                // eslint-disable-next-line no-empty-pattern
                for (let {} of userData.entries()) {
                    hasEntries = true
                    break
                }
                if (!hasEntries) {
                    throw new Error('No fields to update')
                }
            }

            const result = await this.makeRequest('put', `/user/${userId}`, dataToSend, {
                headers: isFormData ? {
                    'Content-Type': 'multipart/form-data'
                } : {
                    'Content-Type': 'application/json'
                }
            })
            
            return result
        } catch (error) {
            console.error('UserService.updateUser failed:', error)
            throw error
        }
    }

    async uploadAvatar(userId, formData) {
        try {
            if (!userId) {
                throw new Error('User ID is required');
            }
            
            if (!(formData instanceof FormData)) {
                throw new Error('Avatar must be sent as FormData');
            }
            
            let hasFile = false;
            for (let pair of formData.entries()) {
                if (pair[1] instanceof File) {
                    hasFile = true;
                    break;
                }
            }
            
            if (!hasFile) {
                throw new Error('No file found in FormData');
            }
            
            const result = await this.makeRequest('post', `/user/${userId}/avatar`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                timeout: 30000
            });
            
            return result;
            
        } catch (error) {
            console.error('UserService.uploadAvatar failed:', error);
            
            if (error.message.includes('Network')) {
                throw new Error('Network error while uploading avatar. Please check your connection.');
            } else if (error.message.includes('timeout')) {
                throw new Error('Upload timeout. File may be too large.');
            } else if (error.response?.status === 413) {
                throw new Error('File too large. Maximum size is 5MB.');
            } else if (error.response?.status === 415) {
                throw new Error('Unsupported file type. Please upload an image.');
            }
            
            throw error;
        }
    }

    async deleteAvatar(userId) {
        try {
            if (!userId) {
                throw new Error('User ID is required');
            }
            
            
            const result = await this.makeRequest('delete', `/user/${userId}/avatar`);
            
            return result;
            
        } catch (error) {
            console.error('UserService.deleteAvatar failed:', error);
            throw error;
        }
    }

    async deleteUser(userId) {
        try {
            if (!userId) {
                throw new Error('User ID is required')
            }

            return await this.makeRequest('delete', `/user/${userId}`)
        } catch (error) {
             console.error('15. Error di UserService.deleteUser:', error)
            throw error
        }
    }

async activateUser(userId) {   
    try {
        if (!userId) {
            throw new Error('User ID is required');
        }

        const result = await this.makeRequest('post', `/user/${userId}/activate`);
        
        return result;
        
    } catch (error) {
        console.error(' UserService.activateUser failed:', error);
        throw error;
    }
}

async deactivateUser(userId) {  
    try {
        if (!userId) {
            throw new Error('User ID is required');
        }
        
        const result = await this.makeRequest('put', `/user/${userId}/deactivate`);
        
        return result;
        
    } catch (error) {
        console.error('❌ UserService.deactivateUser failed:', error);
        throw error;
    }
}

    async getUserById(userId) {
        try {
            if (!userId) {
                throw new Error('User ID is required')
            }
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