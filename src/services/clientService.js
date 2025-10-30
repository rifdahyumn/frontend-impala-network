// eslint-disable-next-line no-undef
const API_BASE_URL = process.env.BASE_API_URL || 'http://localhost:3000/api';

class ClientService {
    constructor() {
        this.baseURL = API_BASE_URL
    }

    async handleResponse(response) {
        if(!response.ok) {
            const error = await response.text()
            throw new Error (error || `HTTP status error ${response.status}`)
        }

        const result = await response.json()

        if (!result.success) {
            throw new Error(result.message)
        }

        return result
    }

    async fetchClients(params = {}) {
        try {
            const {
                page = 1,
                limit = 10,
                search = ''
            } = params

            const queryParams = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
                ...(search && { search }),
            })

            const response = await fetch(`${this.baseURL}/client?${queryParams}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            })

            return await this.handleResponse(response)

        } catch (error) {
            console.error('Error fetching client', error)
            throw error;
        }
    }

    async addClient(clientData) {
        try {
            const response = await fetch(`${this.baseURL}/client`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(clientData)
            })

            return await this.handleResponse(response)

        } catch (error) {
            console.error('Error adding client', error)
            throw Error;
        }
    }

    async updateClient(clientId, clientData) {
        try {
            const response = await fetch(`${this.baseURL}/client/${clientId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',

                },
                body: JSON.stringify(clientData)
            })

            return await this.handleResponse(response)
        } catch (error) {
            console.error('Error updating client: ', error)
            throw error
        }
    }

    async deleteClient(clientId) {
        try {
            const response = await fetch(`${this.baseURL}/client/${clientId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            })

            return await this.handleResponse(response)
        } catch (error) {
            console.error('Error deleting client:', error)
            throw error
        }
    }
}

export default new ClientService();