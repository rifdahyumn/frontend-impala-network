const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

class HeteroSemarangService {
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

    async fetchHeteroSemarang(params = {}) {
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

            const response = await fetch(`${this.baseURL}/hetero/semarang?${queryParams}`, {
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

    async addMemberHeteroSemarang(memberData) {
        try {
            const response = await fetch(`${this.baseURL}/hetero/semarang`, {
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

    async updateMemberHeteroSemarang(memberId, memberData) {
        try {
            const response = await fetch(`${this.baseURL}/hetero/semarang/${memberId}`, {
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

    async deleteMemberHeteroSemarang(memberId) {
        try {
            const response = await fetch(`${this.baseURL}/hetero/semarang/${memberId}`, {
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

    async fetchMemberStats() {
        try {
            const response = await fetch(`${this.baseURL}/hetero/semarang/stats`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            })

            return await this.handleResponse(response)
        } catch (error) {
            console.error('Error fetching member stats', error)

            return {
                success: false,
                data: {
                    totalMembers: 0,
                    activeMembers: 0,
                    growthPercentage: '0%',
                    activePercentage: '0%',
                    isFallback: true
                }
            }
        }
    }
}

export default new HeteroSemarangService();