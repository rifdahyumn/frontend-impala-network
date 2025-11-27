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

    async createImpala(participantData) {
        try {
            console.log('🚀 Sending to:', `${this.baseURL}/impala`);
            console.log('📦 Data:', participantData);
            
            const response = await fetch(`${this.baseURL}/impala`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(participantData),
            });

            // Get the error response body
            const errorText = await response.text();
            console.log('❌ Error response:', errorText);

            if (!response.ok) {
                let errorMessage = `HTTP ${response.status}: `;
                try {
                    const errorData = JSON.parse(errorText);
                    errorMessage += errorData.message || errorData.error || errorText;
                } catch {
                    errorMessage += errorText;
                }
                throw new Error(errorMessage);
            }

            const result = JSON.parse(errorText); // Parse successful response
            console.log('✅ Success:', result);
            return result;

        } catch (error) {
            console.error('❌ Service error:', error);
            throw error;
        }
    }
}

export default new ImpalaService()