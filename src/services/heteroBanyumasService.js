const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

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

            const response = await fetch(`${this.baseURL}/hetero/banyumas?${queryParams}`, {
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

            const response = await fetch(`${this.baseURL}/hetero/banyumas/export?${queryParams}`, {
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

    async fetchMemberStats() {
        try {
            const response = await fetch(`${this.baseURL}/hetero/banyumas/stats`, {
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
            const response = await fetch(`${this.baseURL}/hetero/banyumas/space-options`, {
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
                else if (lowerSpace.includes('rembug meeting room'));
                else if (lowerSpace.includes('rembug meeting room (weekend)'));
                else if (lowerSpace.includes('private office 1'));
                else if (lowerSpace.includes('private office 2'));
                else if (lowerSpace.includes('private office 3 & 4'));
                else if (lowerSpace.includes('private office 5'));
                else if (lowerSpace.includes('private office 6'));
                else if (lowerSpace.includes('virtual office'));
                else if (lowerSpace.includes('gatra event space'));
                else if (lowerSpace.includes('gatra wedding hall'));
                else if (lowerSpace.includes('outdoorspace'));
                else if (lowerSpace.includes('amphitheater'));
                else if (lowerSpace.includes('basketball court personal'));
                else if (lowerSpace.includes('basketball court membership'));
                else if (lowerSpace.includes('futsal court personal'));
                else if (lowerSpace.includes('futsal court membership'));
                else if (lowerSpace.includes('tennis court personal'));
                else if (lowerSpace.includes('tennis court membership'));
                else if (lowerSpace.includes('co-living room 1'));
                else if (lowerSpace.includes('co-living room 2'));
                else if (lowerSpace.includes('co-living room 3'));
                else if (lowerSpace.includes('co-living room 4'));
                else if (lowerSpace.includes('makerspace'));

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

export default new HeteroBanyumasService();