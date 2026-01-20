import { authApi } from "./authServices"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

class UserService {
    constructor() {
        this.baseURL = API_BASE_URL
    }

    async handleResponse(response) {
        if (!response.success) {
            throw new Error(response.message || 'Request failed');
        }
        return response;
    }

    async makeRequest(method, url, data = null, options = {}) {
        try {
            let response;
            
            switch (method.toLowerCase()) {
                case 'get':
                    response = await authApi.get(url, options);
                    break;
                case 'post':
                    response = await authApi.post(url, data, options);
                    break;
                case 'put':
                    response = await authApi.put(url, data, options);
                    break;
                case 'patch':
                    response = await authApi.patch(url, data, options);
                    break;
                case 'delete':
                    response = await authApi.delete(url, options);
                    break;
                default:
                    throw new Error(`Unsupported method: ${method}`);
            }
            
            return this.handleResponse(response);
            
        } catch (error) {
            console.error(`${method.toUpperCase()} ${url} failed:`, error);
        }
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

            return await this.makeRequest(
                'get',
                `/user?${queryParams}`
            );

        } catch (error) {
            console.error('Error fetching client', error)
            throw error;
        }
    }

    async addUser(formData) {
        try {
            const response = await authApi.post('/user', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            
            return this.handleResponse(response);
        } catch (error) {
            console.error('Error updating user: ', error)
            throw error
        }
    }

    async updateUser(userId, formData) {
        try {
            const isFormData = formData instanceof FormData;
            
            const response = await authApi.put(`/user/${userId}`, formData, {
                headers: isFormData ? {
                    'Content-Type': 'multipart/form-data'
                } : {
                    'Content-Type': 'application/json'
                }
            });
            
            return this.handleResponse(response);
        } catch (error) {
            console.error('Error updating user: ', error)
            throw error
        }
    }

    async deleteUser(userId) {
        try {
            return await this.makeRequest('delete', `/user/${userId}`);
        } catch (error) {
            console.error('Error deleting user:', error)
            throw error
        }
    }

    async activateUser(userId) {
        try {
            return await this.makeRequest('patch', `/user/${userId}/activate`);
        } catch (error) {
            console.error('Error activating user:', error);
            throw error;
        }
    }

    async deactivateUser(userId) {
        try {
            return await this.makeRequest('patch', `/user/${userId}/deactivate`);
        } catch (error) {
            console.error('Error deactivating user:', error);
            throw error;
        }
    }

    async getUserById(userId) {
        try {
            return await this.makeRequest('get', `/user/${userId}`);
        } catch (error) {
            console.error('Error fetching user:', error);
            throw error;
        }
    }
}

export default new UserService();