// eslint-disable-next-line no-undef
const API_BASE_URL = process.env.BASE_API_URL || 'http://localhost:3000/api'

class ImpalaService {
    constructor() {
        this.baseURL = API_BASE_URL
    }

    async handleResponse(response) {
        const result = await response.json()
        return result
    }

    async fetchImpala(params = {}) {
        try {
            const {
                page = 1,
                limit = 10,
                search = ''
            } = params

            const queryParams = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
                ...(search && { search })
            })

            const response = await fetch(`${this.baseURL}/impala?${queryParams}`, {
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
}

export default new ImpalaService()