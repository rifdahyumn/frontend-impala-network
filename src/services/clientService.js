const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

class ClientService {
    constructor() {
        this.baseURL = API_BASE_URL;
    }

    async handleResponse(response) {
        if (!response.ok) {
            const error = await response.text();
            throw new Error(error || `HTTP status error ${response.status}`);
        }

        const result = await response.json();

        if (!result.success) {
            throw new Error(result.message);
        }

        return result;
    }

    async fetchClients(params = {}) {
        try {
            const {
                page = 1,
                limit = 20,
                search = '',
                status = '',
                businessType = '',
                gender = '', 
                showAllOnSearch = false
            } = params;

            const queryParams = new URLSearchParams({
                page: page.toString(),
                ...(limit > 0 && { limit: limit.toString() }),
                ...(search && { search }),
                ...(status && { status }),
                ...(businessType && { business_type: businessType }),
                ...(gender && { gender }),
                ...(showAllOnSearch && { showAllOnSearch: 'true' })
            });

            if (limit === 0) {
                queryParams.delete('limit');
            }

            const response = await fetch(`${this.baseURL}/client?${queryParams}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const result = await this.handleResponse(response);

            if (!result.metadata) {
                result.metadata = {
                    pagination: {
                        page: parseInt(page),
                        limit: limit === 0 ? result.data?.length || 0 : parseInt(limit),
                        total: result.data?.length || 0,
                        totalPages: 1,
                        isShowAllMode: showAllOnSearch || limit === 0,
                        showingAllResults: showAllOnSearch || limit === 0
                    }
                };
            }

            return result;

        } catch (error) {
            console.error('Error fetching client', error);
            throw error;
        }
    }

    async fetchAllClients(filters = {}) {
        try {
            const params = {
                ...filters,
                page: 1,
                limit: 0, 
                showAllOnSearch: true
            };

            const result = await this.fetchClients(params);

            return result;

        } catch (error) {
            console.error('Error fetching all clients', error);
            throw error;
        }
    }

    buildClientQueryUrl(params = {}) {
        const {
            page = 1,
            limit = 10,
            search = '',
            status = '',
            businessType = '',
            gender = '', 
            showAllOnSearch = false
        } = params;

        const queryParams = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
            ...(search && { search }),
            ...(status && { status }),
            ...(businessType && { business_type: businessType }),
            ...(gender && { gender }), 
            ...(showAllOnSearch && { showAllOnSearch: 'true' })
        });

        return `${this.baseURL}/client?${queryParams}`;
    }

    async addClient(clientData) {
        try {
            if (!clientData.full_name || !clientData.email) {
                throw new Error('Full name and email are required');
            }

            if (clientData.gender) {
                const genderLower = clientData.gender.toLowerCase().trim();
                if (genderLower.includes('male') || genderLower.includes('laki') || genderLower.includes('pria')) {
                    clientData.gender = 'male';
                } else if (genderLower.includes('female') || genderLower.includes('perempuan') || genderLower.includes('wanita')) {
                    clientData.gender = 'female';
                }
            }

            const response = await fetch(`${this.baseURL}/client`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(clientData)
            });

            return await this.handleResponse(response);

        } catch (error) {
            console.error('Error adding client', error);
            throw error;
        }
    }

    async updateClient(clientId, clientData) {
        try {
            if (!clientId) {
                throw new Error('Client ID is required');
            }

            if (clientData.gender) {
                const genderLower = clientData.gender.toLowerCase().trim();
                if (genderLower.includes('male') || genderLower.includes('laki') || genderLower.includes('pria')) {
                    clientData.gender = 'male';
                } else if (genderLower.includes('female') || genderLower.includes('perempuan') || genderLower.includes('wanita')) {
                    clientData.gender = 'female';
                }
            }

            const response = await fetch(`${this.baseURL}/client/${clientId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(clientData)
            });

            return await this.handleResponse(response);
        } catch (error) {
            console.error('Error updating client: ', error);
            throw error;
        }
    }

    async deleteClient(clientId) {
        try {
            if (!clientId) {
                throw new Error('Client ID is required');
            }

            const response = await fetch(`${this.baseURL}/client/${clientId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            return await this.handleResponse(response);
        } catch (error) {
            console.error('Error deleting client:', error);
            throw error;
        }
    }

    async searchClient(name, email) {
        try {
            const params = new URLSearchParams()
            if (name) params.append('name', name)
            if (email) params.append('email', email)

            const response = await fetch(`${this.baseURL}/client/search?${params.toString()}`)
            return await this.handleResponse(response) 
        } catch (error) {
            console.error('Error searching client:', error);
            throw error;
        }
    }

    async fetchClientStats() {
        try {
            const response = await fetch(`${this.baseURL}/client/stats`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            return await this.handleResponse(response);
        } catch (error) {
            console.error('Error fetching client stats:', error);
            
            return {
                success: true,
                data: {
                    title: "Total Client",
                    value: "0",
                    subtitle: "+ 0",
                    percentage: "0%",
                    trend: "up",
                    period: "Last Month",
                    icon: "Users",
                    color: "blue",
                    description: "0% Last Month"
                }
            };
        }
    }

    downloadFile(content, filename, mimeType) {
        try {
            const blob = new Blob([content], { type: mimeType });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            
            link.href = url;
            link.download = filename;
            link.style.display = 'none';
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            window.URL.revokeObjectURL(url);
            
        } catch (error) {
            console.error('Error downloading file:', error);
            throw error;
        }
    }

    isShowAllMode(paginationData) {
        return paginationData?.showingAllResults || paginationData?.isShowAllMode || false;
    }

    calculateDisplayInfo(paginationData, dataLength = 0) {
        if (!paginationData) {
            return {
                isShowAllMode: false,
                total: dataLength,
                page: 1,
                totalPages: 1
            };
        }

        const isShowAll = this.isShowAllMode(paginationData);
        const searchTerm = paginationData.searchTerm || '';
        
        if (isShowAll && searchTerm) {
            return {
                isShowAllMode: true,
                total: dataLength,
                page: 1,
                totalPages: 1
            };
        } else if (isShowAll) {
            return {
                showingText: `Showing all ${dataLength} clients`,
                isShowAllMode: true,
                total: dataLength,
                page: 1,
                totalPages: 1
            };
        } else {
            const start = ((paginationData.page - 1) * paginationData.limit) + 1;
            const end = Math.min(paginationData.page * paginationData.limit, paginationData.total);
            return {
                showingText: `Showing ${start} to ${end} of ${paginationData.total} clients`,
                isShowAllMode: false,
                total: paginationData.total,
                page: paginationData.page,
                totalPages: paginationData.totalPages
            };
        }
    }

    async getFilteredCount(filters = {}) {
        try {
            const result = await this.fetchClients({
                ...filters,
                page: 1,
                limit: 1
            });

            return result.metadata?.pagination?.total || 0;
        } catch (error) {
            console.error('Error getting filtered count:', error);
            return 0;
        }
    }

    validateFilters(filters = {}) {
        const validFilters = {};
        
        if (filters.search && typeof filters.search === 'string' && filters.search.trim()) {
            validFilters.search = filters.search.trim();
        }
        
        if (filters.status && typeof filters.status === 'string' && filters.status.trim()) {
            validFilters.status = filters.status.trim();
        }
        
        if (filters.businessType && typeof filters.businessType === 'string' && filters.businessType.trim()) {
            validFilters.businessType = filters.businessType.trim();
        }
        
        if (filters.gender && typeof filters.gender === 'string' && filters.gender.trim()) {
            validFilters.gender = filters.gender.trim();
        }
        
        return validFilters;
    }

    async batchUpdate(clientsData) {
        try {
            if (!Array.isArray(clientsData) || clientsData.length === 0) {
                throw new Error('No clients data provided');
            }

            const responses = await Promise.all(
                clientsData.map(async (client) => {
                    if (!client.id) {
                        throw new Error('Client ID is required for batch update');
                    }
                    
                    return await this.updateClient(client.id, client.data);
                })
            );

            return {
                success: true,
                message: `Updated ${responses.length} clients successfully`,
                data: responses
            };
        } catch (error) {
            console.error('Error in batch update:', error);
            throw error;
        }
    }

    async getSearchSuggestions(searchTerm, limit = 5) {
        try {
            if (!searchTerm || searchTerm.length < 2) {
                return [];
            }

            const result = await this.fetchClients({
                search: searchTerm,
                limit,
                page: 1
            });

            const suggestions = (result.data || []).map(client => ({
                id: client.id,
                name: client.full_name,
                email: client.email,
                company: client.company,
                type: 'client'
            }));

            return suggestions;
        } catch (error) {
            console.error('Error getting search suggestions:', error);
            return [];
        }
    }

    extractAvailableFilters(clients) {
        if (!clients || !Array.isArray(clients)) {
            return {
                statuses: [],
                businessTypes: [],
                genders: []
            };
        }

        const statuses = [...new Set(clients
            .map(client => client.status)
            .filter(status => status && status.trim())
        )].sort();

        const businessTypes = [...new Set(clients
            .map(client => client.business)
            .filter(business => business && business.trim())
        )].sort();

        const genders = [...new Set(clients
            .map(client => client.gender)
            .filter(gender => gender && gender.trim())
        )].sort();

        return {
            statuses: statuses.map(status => ({
                value: status.toLowerCase(),
                label: status,
                original: status
            })),
            businessTypes: businessTypes.map(business => ({
                value: business.toLowerCase(),
                label: business,
                original: business
            })),
            genders: genders.map(gender => ({
                value: gender.toLowerCase(),
                label: gender === 'male' ? 'Male' : gender === 'female' ? 'Female' : gender,
                original: gender
            }))
        };
    }

    async updateClientStatus(clientId, status) {
        try {
            if (!clientId) {
                throw new Error('Client ID is required')
            }

            const validStatus = ['Active', 'Inactive'].includes(status)
                ? status
                : status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()

            if (!['Active', 'Inactive'].includes(validStatus)) {
                throw new Error('Status must be either "Active" or "Inactive"')
            }

            const response = await fetch(`${this.baseURL}/client/${clientId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    status: validStatus
                })
            })

            return await this.handleResponse(response)
        } catch (error) {
            console.error('Error updating client status:', error)
            throw error
        }
    }

    async getGenderStatistics() {
        try {
            const response = await fetch(`${this.baseURL}/client/stats/gender`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            return await this.handleResponse(response);
        } catch (error) {
            console.error('Error fetching gender statistics:', error);
            return {
                success: true,
                data: {
                    male: 0,
                    female: 0,
                    total: 0
                }
            };
        }
    }
}

export default new ClientService();