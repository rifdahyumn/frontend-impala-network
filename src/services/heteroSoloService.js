const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

class HeteroSoloService {
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

    async fetchHeteroSolo(params = {}) {
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

            const response = await fetch(`${this.baseURL}/hetero/solo?${queryParams}`, {
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

    async addMemberHeteroSolo(memberData) {
        try {
            const response = await fetch(`${this.baseURL}/hetero/solo`, {
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

    async updateMemberHeteroSolo(memberId, memberData) {
        try {
            const response = await fetch(`${this.baseURL}/hetero/solo/${memberId}`, {
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

    async deleteMemberHeteroSolo(memberId) {
        try {
            const response = await fetch(`${this.baseURL}/hetero/solo/${memberId}`, {
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
            const response = await fetch(`${this.baseURL}/hetero/solo/stats`, {
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

export default new HeteroSoloService();