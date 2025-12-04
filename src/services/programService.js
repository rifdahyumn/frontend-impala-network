// eslint-disable-next-line no-undef
const API_BASE_URL = process.env.BASE_API_URL || 'http://localhost:3000/api'

class ProgramService {
    constructor() {
        this.baseURL = API_BASE_URL
    }

    async handleResponse(response) {

        const result = await response.json()

        return result
    }

    async fetchPrograms(params = {}) {
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

            const response = await fetch(`${this.baseURL}/program?${queryParams}`, {
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

    async addProgram(programData) {
        try {
            const response = await fetch(`${this.baseURL}/program`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(programData)
            })

            return await this.handleResponse(response)

        } catch (error) {
            console.error('Error adding program', error)
            throw error;
        }
    }

    async updateProgram(programId, programData) {
        try {
            const response = await fetch(`${this.baseURL}/program/${programId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',

                },
                body: JSON.stringify(programData)
            })

            return await this.handleResponse(response)
        } catch (error) {
            console.error('Error updating client: ', error)
            throw error
        }
    }

    async deleteProgram(programId) {
        try {
            const response = await fetch(`${this.baseURL}/program/${programId}`, {
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

    async getProgramNamesFromClients(search = '') {
        try {
            const queryParams = new URLSearchParams()
            if(search) {
                queryParams.append('search', search)
            }

            const response = await fetch(`${this.baseURL}/program/program-names?${queryParams}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            })

            return await this.handleResponse(response)

        } catch (error) {
            console.error('Error fetching program names:', error)
            throw error
        }
    }

    async fetchProgramsStats() {
       try {
            const response = await fetch(`${this.baseURL}/program/stats`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            })

            return await this.handleResponse(response)
       } catch (error) {
            console.error('Error fetching program stats:', error)
                throw error
       }
    }

    async fetchPriceStats() {
        try {
            const response = await fetch(`${this.baseURL}/program/price-stats`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            })

            return await this.handleResponse(response)

        } catch (error) {
            console.error('Error fetching price stats:', error)
            throw error
        }
    }

    async fetchAllProgramForAnalytics(params = {}) {
        try {
            const { search = '', sort = 'created_at:asc' } = params

            const queryParams = new URLSearchParams({
                page: '1',
                limit: '5000', // ✅ Increase to 5000
                sort,
                ...(search && { search })
            })

            const response = await fetch(`${this.baseURL}/program?${queryParams}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            })

            const result = await this.handleResponse(response)
            
            console.log('fetchAllProgramForAnalytics:', {
                dataCount: result.data?.length || 0,
                totalCount: result.metadata?.pagination?.total || 0
            })
            
            return result

        } catch (error) {
            console.error('Error fetching all programs for analytics', error)
            throw error
        }
    }
}

export default new ProgramService()