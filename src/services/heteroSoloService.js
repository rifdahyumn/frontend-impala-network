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
                gender = '',
                space = '',
                status = '',
            } = params

            const queryParams = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
            })

            if (search) queryParams.append('search', search)
            if (gender) queryParams.append('gender', gender)
            if (space && space !== 'all') queryParams.append('space', space)
            if (status) queryParams.append('status', status)

            const response = await fetch(`${this.baseURL}/hetero/solo?${queryParams}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            })

            const result = await this.handleResponse(response)

            return result
        } catch (error) {
            console.error('Error fetching member', error)
        }
    }

    async fetchAllMembers(params = {}) {
        try {
            const {
                search = '',
                gender = '',
                space = '',
                status = '',
            } = params

            const queryParams = new URLSearchParams({
                export: 'true'
            });

            if (search) queryParams.append('search', search);
            if (gender) queryParams.append('gender', gender);
            if (space && space !== 'all') queryParams.append('space', space);
            if (status) queryParams.append('status', status);

            const response = await fetch(`${this.baseURL}/hetero/solo/export?${queryParams}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            return await this.handleResponse(response);

        } catch (error) {
            console.error('Service - Error fetching all members:', error);
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

    async fetchSpaceOptions() {
        try {
            const response = await fetch(`${this.baseURL}/hetero/solo/space-options`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            })

            const result = await this.handleResponse(response)

            const formattedSpaces = result.data.map(space => {
                const lowerSpace = space.toLowerCase()

                if (lowerSpace.includes('maneka personal'));
                else if (lowerSpace.includes('maneka group'));
                else if (lowerSpace.includes('rembug 1'));
                else if (lowerSpace.includes('rembug 2'));
                else if (lowerSpace.includes('rembug 3'));
                else if (lowerSpace.includes('private office 1'));
                else if (lowerSpace.includes('private office 2-6'));
                else if (lowerSpace.includes('private office 7'));
                else if (lowerSpace.includes('space gatra'));
                else if (lowerSpace.includes('space gayeng'));
                else if (lowerSpace.includes('makerspace'));
                else if (lowerSpace.includes('foodlab'));
                else if (lowerSpace.includes('abipraya membership'));
                else if (lowerSpace.includes('abipraya event'));
                else if (lowerSpace.includes('virtual office'));
                else if (lowerSpace.includes('outdoorspace'));

                return {
                    value: lowerSpace,
                    label: `${space}`,
                    original: space
                }
            })

            return {
                ...result,
                data: formattedSpaces
            }
        } catch (error) {
            console.error('Error fetching space options', error)
        }
    }
}

export default new HeteroSoloService();