// eslint-disable-next-line no-undef
const API_BASE_URL = process.env.BASE_API_URL || 'http://localhost:3000/api'

class FormBuilderService {
    constructor() {
        this.baseURL = API_BASE_URL
    }

    async handleResponse(response) {
        const result = await response.json()
        return result
    }

    async getProgramNamesToImpala(search = '') {
        try {
            const queryParams = new URLSearchParams()
            if (search) {
                queryParams.append('search', search)
            }

            const response = await fetch(`${this.baseURL}/form-builder/program-name?${queryParams}`, {
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
}

export default new FormBuilderService()