const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

class UserService {
    constructor() {
        this.baseURL = API_BASE_URL
    }

    async handleResponse(response) {
        const result = await response.json()

        return result
    }

    async fetchUsers(params = {}) {
        try {
            const {
                page = 1,
                limit = 10,
                search = ''
            } = params

            const token = localStorage.getItem('token');
            if (!token) throw new Error('Token not found. Please log in again.');

            const queryParams = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
                ...(search && { search }),
            })

            const response = await fetch(`${this.baseURL}/user?${queryParams}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            })

            return await this.handleResponse(response)

        } catch (error) {
            console.error('Error fetching client', error)
            throw error;
        }
    }

    async addUser(formData) {
        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('Token not found. Please log in again.');

            const response = await fetch(`${this.baseURL}/user`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body:formData
            })

            return await this.handleResponse(response)
        } catch (error) {
            console.error('Error updating user: ', error)
            throw error
        }
    }

    async updateUser(userId, formData) {
        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('Token not found. Please log in again.');

            const response = await fetch(`${this.baseURL}/user/${userId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            })

            return await this.handleResponse(response)
        } catch (error) {
            console.error('Error updating user: ', error)
            throw error
        }
    }

    async deleteUser(userId) {
        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('Token not found. Please log in again.');
            
            const response = await fetch(`${this.baseURL}/user/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            return await this.handleResponse(response)
        } catch (error) {
            console.error('Error deleting user:', error)
            throw error
        }
    }

    async activateUser(userId) {
        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('Token not found. Please log in again.');

            const response = await fetch(`${this.baseURL}/user/${userId}/activate`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })

            const result = await this.handleResponse(response);
            return result;
        } catch (error) {
            console.error('Error activating user:', error);
            throw error;
        }
    }
}

export default new UserService();