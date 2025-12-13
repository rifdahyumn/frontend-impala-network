// eslint-disable-next-line no-undef
const API_BASE_URL = process.env.BASE_API_URL || 'http://localhost:3000/api'

class ImpalaService {
    constructor() {
        this.baseURL = API_BASE_URL
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

    // 🔴 DIUBAH: Tambahkan parameter filter yang sama dengan clientService
    async fetchImpala(params = {}) {
        try {
            const {
                page = 1,
                limit = 10,
                search = '',
                gender = '',
                category = '',
                showAllOnSearch = false
            } = params

            const queryParams = new URLSearchParams({
                page: page.toString(),
                ...(limit > 0 && { limit: limit.toString() }),
                ...(search && { search }),
                ...(gender && { gender }),
                ...(category && { category }),
                ...(showAllOnSearch && { showAllOnSearch: 'true' })
            })

            if (limit === 0) {
                queryParams.delete('limit');
            }

            const response = await fetch(`${this.baseURL}/impala?${queryParams}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            })

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
            console.error('Error fetching impala participants', error)
            throw error;
        }
    }

    async fetchAllImpala(filters = {}) {
        try {
            const params = {
                ...filters,
                page: 1,
                limit: 0,
                showAllOnSearch: true
            };


            const result = await this.fetchImpala(params);
            return result;

        } catch (error) {
            console.error('Error fetching all impala participants', error);
            throw error;
        }
    }

    buildImpalaQueryUrl(params = {}) {
        const {
            page = 1,
            limit = 10,
            search = '',
            gender = '',
            category = '',
            showAllOnSearch = false
        } = params;

        const queryParams = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
            ...(search && { search }),
            ...(gender && { gender }),
            ...(category && { category }),
            ...(showAllOnSearch && { showAllOnSearch: 'true' })
        });

        return `${this.baseURL}/impala?${queryParams}`;
    }

    async createImpala(participantData) {
        try {
            // 🔴 DIUBAH: Tambahkan validasi
            if (!participantData.full_name || !participantData.email) {
                throw new Error('Full name and email are required');
            }

            const response = await fetch(`${this.baseURL}/impala`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(participantData),
            });

            return await this.handleResponse(response);

        } catch (error) {
            console.error('Service error:', error);
            throw error;
        }
    }

    // 🔴 FUNGSI BARU: Update participant
    async updateImpala(participantId, participantData) {
        try {
            // 🔴 VALIDASI: Pastikan participantId valid
            if (!participantId) {
                throw new Error('Participant ID is required');
            }

            const response = await fetch(`${this.baseURL}/impala/${participantId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(participantData)
            });

            return await this.handleResponse(response);
        } catch (error) {
            console.error('Error updating participant: ', error);
            throw error;
        }
    }

    async deleteImpala(participantId) {
        try {
            if (!participantId) {
                throw new Error('Participant ID is required');
            }

            const response = await fetch(`${this.baseURL}/impala/${participantId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            return await this.handleResponse(response);
        } catch (error) {
            console.error('Error deleting participant:', error);
            throw error;
        }
    }

    async exportImpala(filters = {}, format = 'csv') {
        try {
            const result = await this.fetchAllImpala(filters);
            
            if (!result.data || result.data.length === 0) {
                throw new Error('No data to export');
            }

            if (format.toLowerCase() === 'csv') {
                const csvContent = this.convertToCSV(result.data);

                this.downloadFile(csvContent, `impala_participants_export_${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');
                
                return {
                    success: true,
                    message: `Exported ${result.data.length} participants to CSV`,
                    data: result.data
                };
            } else if (format.toLowerCase() === 'json') {
                const jsonContent = JSON.stringify(result.data, null, 2);
                this.downloadFile(jsonContent, `impala_participants_export_${new Date().toISOString().split('T')[0]}.json`, 'application/json');
                
                return {
                    success: true,
                    message: `Exported ${result.data.length} participants to JSON`,
                    data: result.data
                };
            } else {
                throw new Error(`Unsupported format: ${format}. Supported formats: csv, json`);
            }

        } catch (error) {
            console.error('Error exporting participants:', error);
            throw error;
        }
    }

    // 🔴 FUNGSI BARU: Helper untuk konversi ke CSV
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
                showingText: `Showing ${dataLength} participants`,
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
                showingText: `Showing all ${dataLength} participants`,
                isShowAllMode: true,
                total: dataLength,
                page: 1,
                totalPages: 1
            };
        } else {
            const start = ((paginationData.page - 1) * paginationData.limit) + 1;
            const end = Math.min(paginationData.page * paginationData.limit, paginationData.total);
            return {
                showingText: `Showing ${start} to ${end} of ${paginationData.total} participants`,
                isShowAllMode: false,
                total: paginationData.total,
                page: paginationData.page,
                totalPages: paginationData.totalPages
            };
        }
    }

    async getFilteredCount(filters = {}) {
        try {
            const result = await this.fetchImpala({
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
        
        if (filters.gender && typeof filters.gender === 'string' && filters.gender.trim()) {
            validFilters.gender = filters.gender.trim();
        }
        
        if (filters.category && typeof filters.category === 'string' && filters.category.trim()) {
            validFilters.category = filters.category.trim();
        }
        
        return validFilters;
    }

    async fetchImpalaStats() {
        try {
            const response = await fetch(`${this.baseURL}/impala/stats`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            return await this.handleResponse(response);
        } catch (error) {
            console.error('Error fetching impala stats:', error);
            
            return {
                success: true,
                data: {
                    title: "Total Participants",
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

    async getSearchSuggestions(searchTerm, limit = 5) {
        try {
            if (!searchTerm || searchTerm.length < 2) {
                return [];
            }

            const result = await this.fetchImpala({
                search: searchTerm,
                limit,
                page: 1
            });

            const suggestions = (result.data || []).map(participant => ({
                id: participant.id,
                name: participant.full_name,
                email: participant.email,
                category: participant.category,
                type: 'participant'
            }));

            return suggestions;
        } catch (error) {
            console.error('Error getting search suggestions:', error);
            return [];
        }
    }

    extractAvailableFilters(participants) {
        if (!participants || !Array.isArray(participants)) {
            return {
                genders: [],
                categories: []
            };
        }

        const genders = [...new Set(participants
            .map(participant => participant.gender)
            .filter(gender => gender && gender.trim())
        )].sort();

        const categories = [...new Set(participants
            .map(participant => participant.category)
            .filter(category => category && category.trim())
        )].sort();

        return {
            genders: genders.map(gender => ({
                value: gender.toLowerCase(),
                label: gender,
                original: gender
            })),
            categories: categories.map(category => ({
                value: category.toLowerCase(),
                label: category,
                original: category
            }))
        };
    }

    async batchUpdate(participantsData) {
        try {
            if (!Array.isArray(participantsData) || participantsData.length === 0) {
                throw new Error('No participants data provided');
            }

            const responses = await Promise.all(
                participantsData.map(async (participant) => {
                    if (!participant.id) {
                        throw new Error('Participant ID is required for batch update');
                    }
                    
                    return await this.updateImpala(participant.id, participant.data);
                })
            );

            return {
                success: true,
                message: `Updated ${responses.length} participants successfully`,
                data: responses
            };
        } catch (error) {
            console.error('Error in batch update:', error);
            throw error;
        }
    }
}

export default new ImpalaService()