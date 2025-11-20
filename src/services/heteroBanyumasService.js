// eslint-disable-next-line no-undef
const API_BASE_URL = process.env.BASE_API_URL || 'http://localhost:3000/api';

class HeteroBanyumasService {
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

    async fetchHeteroBanyumas(params = {}) {
        try {
            const {
                page = 1,
                limit = 10,
                search = '',
            } = params

            const queryParams = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
                ...(search && { search })
            })

            const response = await fetch(`${this.baseURL}/hetero/banyumas?${queryParams}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            })

            return await this.handleResponse(response)
        } catch (error) {
            console.error('Error fetching member', error)
        }
    }

    async addMemberHeteroBanyumas(memberData) {
        try {
            const response = await fetch(`${this.baseURL}/hetero/banyumas`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(memberData)
            })

            return await this.handleResponse(response)
        } catch (error) {
            console.error('Error adding member', error)
            throw error
        }
    }

    async updateMemberHeteroBayumas(memberId, memberData) {
        try {
            const response = await fetch(`${this.baseURL}/hetero/banyumas/${memberId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(memberData)
            })

            return await this.handleResponse(response)
        } catch (error) {
            console.error('Error updating member: ', error)
            throw error
        }
    }

    async deleteMemberHeteroBanyumas(memberId) {
        try {
            const response = await fetch(`${this.baseURL}/hetero/banyumas/${memberId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            })

            return await this.handleResponse(response)
        } catch (error) {
            console.error('Error deleting member:', error)
            throw error
        }
    }
}

export default new HeteroBanyumasService();