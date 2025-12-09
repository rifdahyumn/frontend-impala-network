// eslint-disable-next-line no-undef
const API_BASE_URL = process.env.BASE_API_URL || 'http://localhost:3000/api';

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

    // 🔴 DIUBAH: Sederhanakan parameter dan gunakan approach yang konsisten
    async fetchClients(params = {}) {
        try {
            const {
                page = 1,
                limit = 10,
                search = '',
                status = '',
                businessType = '',
                showAllOnSearch = false
            } = params;

            // 🔴 DIUBAH: Build query params dengan approach yang lebih clean
            const queryParams = new URLSearchParams({
                page: page.toString(),
                ...(limit > 0 && { limit: limit.toString() }),
                ...(search && { search }),
                ...(status && { status }),
                ...(businessType && { business_type: businessType }),
                ...(showAllOnSearch && { showAllOnSearch: 'true' })
            });

            // 🔴 DIUBAH: Jika limit = 0 (show all), hapus limit parameter
            if (limit === 0) {
                queryParams.delete('limit');
            }

            // 🔴 DEBUG: Log query parameters
            console.log('📡 ClientService - Request URL:', `${this.baseURL}/client?${queryParams}`);
            console.log('📡 ClientService - Request Params:', {
                page,
                limit,
                search,
                status,
                businessType,
                showAllOnSearch,
                queryString: queryParams.toString()
            });

            const response = await fetch(`${this.baseURL}/client?${queryParams}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const result = await this.handleResponse(response);

            // 🔴 DIUBAH: Tambahkan metadata jika tidak ada
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

            // 🔴 DEBUG: Log response
            console.log('📡 ClientService - Response:', {
                dataCount: result.data?.length,
                pagination: result.metadata?.pagination,
                showingAllResults: result.metadata?.pagination?.showingAllResults
            });

            return result;

        } catch (error) {
            console.error('Error fetching client', error);
            throw error;
        }
    }

    // 🔴 DIUBAH: Sederhanakan fetchAllClients
    async fetchAllClients(filters = {}) {
        try {
            // 🔴 DIUBAH: Gunakan fetchClients dengan limit 0 untuk mengambil semua data
            const params = {
                ...filters,
                page: 1,
                limit: 0, // 🔴 Limit 0 = get all data
                showAllOnSearch: true
            };

            console.log('📡 ClientService - Fetch All Clients:', { params });

            const result = await this.fetchClients(params);

            console.log('📡 ClientService - All Clients Response:', {
                totalCount: result.data?.length,
                filtersApplied: filters.search || filters.status || filters.businessType
            });

            return result;

        } catch (error) {
            console.error('Error fetching all clients', error);
            throw error;
        }
    }

    // 🔴 DIUBAH: Helper untuk build URL dengan filter
    buildClientQueryUrl(params = {}) {
        const {
            page = 1,
            limit = 10,
            search = '',
            status = '',
            businessType = '',
            showAllOnSearch = false
        } = params;

        const queryParams = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
            ...(search && { search }),
            ...(status && { status }),
            ...(businessType && { business_type: businessType }),
            ...(showAllOnSearch && { showAllOnSearch: 'true' })
        });

        return `${this.baseURL}/client?${queryParams}`;
    }

    // 🔴 DIUBAH: Add client dengan error handling yang lebih baik
    async addClient(clientData) {
        try {
            // 🔴 VALIDASI: Pastikan data yang diperlukan ada
            if (!clientData.full_name || !clientData.email) {
                throw new Error('Full name and email are required');
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

    // 🔴 DIUBAH: Update client
    async updateClient(clientId, clientData) {
        try {
            // 🔴 VALIDASI: Pastikan clientId valid
            if (!clientId) {
                throw new Error('Client ID is required');
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

    // 🔴 DIUBAH: Delete client
    async deleteClient(clientId) {
        try {
            // 🔴 VALIDASI: Pastikan clientId valid
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

    // 🔴 DIUBAH: Fetch client stats
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
            
            // 🔴 FALLBACK: Return default stats jika API error
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

    // 🔴 DIUBAH: Export clients dengan format yang berbeda
    async exportClients(filters = {}, format = 'csv') {
        try {
            console.log('📡 ClientService - Exporting clients:', { filters, format });

            // Gunakan fetchAllClients untuk mendapatkan semua data dengan filter
            const result = await this.fetchAllClients(filters);
            
            if (!result.data || result.data.length === 0) {
                throw new Error('No data to export');
            }

            if (format.toLowerCase() === 'csv') {
                const csvContent = this.convertToCSV(result.data);
                
                // 🔴 Helper untuk download file
                this.downloadFile(csvContent, `clients_export_${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');
                
                return {
                    success: true,
                    message: `Exported ${result.data.length} clients to CSV`,
                    data: result.data
                };
            } else if (format.toLowerCase() === 'json') {
                // 🔴 Helper untuk download JSON file
                const jsonContent = JSON.stringify(result.data, null, 2);
                this.downloadFile(jsonContent, `clients_export_${new Date().toISOString().split('T')[0]}.json`, 'application/json');
                
                return {
                    success: true,
                    message: `Exported ${result.data.length} clients to JSON`,
                    data: result.data
                };
            } else {
                throw new Error(`Unsupported format: ${format}. Supported formats: csv, json`);
            }

        } catch (error) {
            console.error('Error exporting clients:', error);
            throw error;
        }
    }

    // 🔴 DIUBAH: Helper untuk konversi ke CSV
    convertToCSV(data) {
        if (!data || data.length === 0) return '';

        // 🔴 Tentukan headers berdasarkan data pertama
        const headers = Object.keys(data[0] || {});
        
        // 🔴 Siapkan rows
        const csvRows = [
            headers.join(','), // Header row
            ...data.map(row => 
                headers.map(header => {
                    const value = row[header];
                    
                    // 🔴 Handle berbagai tipe data
                    if (value === null || value === undefined) {
                        return '';
                    }
                    
                    // 🔴 Escape quotes dan convert ke string
                    const stringValue = String(value).replace(/"/g, '""');
                    
                    // 🔴 Wrap dalam quotes jika mengandung comma, newline, atau quotes
                    if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
                        return `"${stringValue}"`;
                    }
                    
                    return stringValue;
                }).join(',')
            )
        ];

        return csvRows.join('\n');
    }

    // 🔴 DIUBAH: Helper untuk download file
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
            
            // 🔴 Cleanup
            window.URL.revokeObjectURL(url);
            
            console.log('📡 ClientService - File downloaded:', filename);
        } catch (error) {
            console.error('Error downloading file:', error);
            throw error;
        }
    }

    // 🔴 DIUBAH: Cek apakah sedang dalam mode show all
    isShowAllMode(paginationData) {
        return paginationData?.showingAllResults || paginationData?.isShowAllMode || false;
    }

    // 🔴 DIUBAH: Hitung display info
    calculateDisplayInfo(paginationData, dataLength = 0) {
        if (!paginationData) {
            return {
                showingText: `Showing ${dataLength} clients`,
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
                showingText: `Showing all ${dataLength} results for "${searchTerm}"`,
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

    // 🔴 FUNGSI BARU: Get filtered clients count
    async getFilteredCount(filters = {}) {
        try {
            const result = await this.fetchClients({
                ...filters,
                page: 1,
                limit: 1 // Hanya perlu count, ambil 1 item saja
            });

            return result.metadata?.pagination?.total || 0;
        } catch (error) {
            console.error('Error getting filtered count:', error);
            return 0;
        }
    }

    // 🔴 FUNGSI BARU: Validate filter parameters
    validateFilters(filters = {}) {
        const validFilters = {};
        
        // 🔴 Hanya ambil filter yang valid
        if (filters.search && typeof filters.search === 'string' && filters.search.trim()) {
            validFilters.search = filters.search.trim();
        }
        
        if (filters.status && typeof filters.status === 'string' && filters.status.trim()) {
            validFilters.status = filters.status.trim();
        }
        
        if (filters.businessType && typeof filters.businessType === 'string' && filters.businessType.trim()) {
            validFilters.businessType = filters.businessType.trim();
        }
        
        return validFilters;
    }

    // 🔴 FUNGSI BARU: Batch operations
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

    // 🔴 FUNGSI BARU: Search suggestions
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

            // 🔴 Extract suggestions dari hasil
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

    // 🔴 FUNGSI BARU: Get available filters from data
    extractAvailableFilters(clients) {
        if (!clients || !Array.isArray(clients)) {
            return {
                statuses: [],
                businessTypes: []
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
            }))
        };
    }
}

export default new ClientService();