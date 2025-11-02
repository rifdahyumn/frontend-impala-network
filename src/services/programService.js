// eslint-disable-next-line no-undef
const API_BASE_URL = process.env.BASE_API_URL || 'http://localhost:3000/api'

class ProgramService {
    constructor() {
        this.baseURL = API_BASE_URL
    }

    async handleResponse(response) {
        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);

        if(!response.ok) {
            try {
                const errorResult = await response.text()
                console.log('Error response:', errorResult);
                throw new Error(errorResult.message || errorResult.error || `HTTP error! status: ${response.status}`);
            } catch (jsonError) {
                const errorText = await response.text();
                console.log('Error text:', errorText);
                throw new Error(errorText || `HTTP error! status: ${response.status}`);
            }
        }

        const result = await response.json()
        console.log('Success response:', result);

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
}

export default new ProgramService()