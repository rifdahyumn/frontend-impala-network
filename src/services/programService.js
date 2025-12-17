const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

class ProgramService {
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

    async fetchPrograms(params = {}) {
        try {
            const {
                page = 1,
                limit = 10,
                search = '',
                status = '',
                category = '',
                showAllOnSearch = false
            } = params;

            const queryParams = new URLSearchParams({
                page: page.toString(),
                ...(limit > 0 && { limit: limit.toString() }),
                ...(search && { search }),
                ...(status && { status }),
                ...(category && { category }),
                ...(showAllOnSearch && { showAllOnSearch: 'true' })
            });

            if (limit === 0) {
                queryParams.delete('limit');
            }

            const response = await fetch(`${this.baseURL}/program?${queryParams}`, {
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
            console.error('Error fetching programs', error)
            throw error;
        }
    }

    async fetchAllPrograms(filters = {}) {
        try {
            const params = {
                ...filters,
                page: 1,
                limit: 0, 
                showAllOnSearch: true
            };


            const result = await this.fetchPrograms(params);

            return result;

        } catch (error) {
            console.error('Error fetching all programs', error);
            throw error;
        }
    }

    buildProgramQueryUrl(params = {}) {
        const {
            page = 1,
            limit = 10,
            search = '',
            status = '',
            category = '',
            showAllOnSearch = false
        } = params;

        const queryParams = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
            ...(search && { search }),
            ...(status && { status }),
            ...(category && { category }),
            ...(showAllOnSearch && { showAllOnSearch: 'true' })
        });

        return `${this.baseURL}/program?${queryParams}`;
    }

    async addProgram(programData) {
        try {
            if (!programData.program_name) {
                throw new Error('Program name is required');
            }

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
            if (!programId) {
                throw new Error('Program ID is required');
            }

            const response = await fetch(`${this.baseURL}/program/${programId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',

                },
                body: JSON.stringify(programData)
            })

            return await this.handleResponse(response)
        } catch (error) {
            console.error('Error updating program: ', error)
            throw error
        }
    }

    async deleteProgram(programId) {
        try {
            if (!programId) {
                throw new Error('Program ID is required');
            }

            const response = await fetch(`${this.baseURL}/program/${programId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            })

            return await this.handleResponse(response)
        } catch (error) {
            console.error('Error deleting program:', error)
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
            const { 
                search = '', 
                status = '', 
                category = '', 
                sort = 'created_at:asc' 
            } = params;

            const result = await this.fetchAllPrograms({
                search,
                status,
                category,
                sort
            });
            
            return result

        } catch (error) {
            console.error('Error fetching all programs for analytics', error)
            throw error
        }
    }

    async exportPrograms(filters = {}, format = 'csv') {
        try {
            const result = await this.fetchAllPrograms(filters);
            
            if (!result.data || result.data.length === 0) {
                throw new Error('No data to export');
            }

            if (format.toLowerCase() === 'csv') {
                const csvContent = this.convertToCSV(result.data);
                
                this.downloadFile(csvContent, `programs_export_${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');
                
                return {
                    success: true,
                    message: `Exported ${result.data.length} programs to CSV`,
                    data: result.data
                };
            } else if (format.toLowerCase() === 'json') {
                const jsonContent = JSON.stringify(result.data, null, 2);
                this.downloadFile(jsonContent, `programs_export_${new Date().toISOString().split('T')[0]}.json`, 'application/json');
                
                return {
                    success: true,
                    message: `Exported ${result.data.length} programs to JSON`,
                    data: result.data
                };
            } else {
                throw new Error(`Unsupported format: ${format}. Supported formats: csv, json`);
            }

        } catch (error) {
            console.error('Error exporting programs:', error);
            throw error;
        }
    }
    convertToCSV(data) {
        if (!data || data.length === 0) return '';

        const headers = Object.keys(data[0] || {});
        
        const csvRows = [
            headers.join(','),
            ...data.map(row => 
                headers.map(header => {
                    const value = row[header];
                    
                    if (value === null || value === undefined) {
                        return '';
                    }
                    
                    const stringValue = String(value).replace(/"/g, '""');
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
                showingText: `Showing ${dataLength} programs`,
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
                showingText: `Showing all ${dataLength} programs`,
                isShowAllMode: true,
                total: dataLength,
                page: 1,
                totalPages: 1
            };
        } else {
            const start = ((paginationData.page - 1) * paginationData.limit) + 1;
            const end = Math.min(paginationData.page * paginationData.limit, paginationData.total);
            return {
                showingText: `Showing ${start} to ${end} of ${paginationData.total} programs`,
                isShowAllMode: false,
                total: paginationData.total,
                page: paginationData.page,
                totalPages: paginationData.totalPages
            };
        }
    }

    async getFilteredCount(filters = {}) {
        try {
            const result = await this.fetchPrograms({
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
        
        if (filters.category && typeof filters.category === 'string' && filters.category.trim()) {
            validFilters.category = filters.category.trim();
        }
        
        return validFilters;
    }

    async batchUpdate(programsData) {
        try {
            if (!Array.isArray(programsData) || programsData.length === 0) {
                throw new Error('No programs data provided');
            }

            const responses = await Promise.all(
                programsData.map(async (program) => {
                    if (!program.id) {
                        throw new Error('Program ID is required for batch update');
                    }
                    
                    return await this.updateProgram(program.id, program.data);
                })
            );

            return {
                success: true,
                message: `Updated ${responses.length} programs successfully`,
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

            const result = await this.fetchPrograms({
                search: searchTerm,
                limit,
                page: 1
            });

            const suggestions = (result.data || []).map(program => ({
                id: program.id,
                name: program.program_name,
                category: program.category,
                status: program.status,
                type: 'program'
            }));

            return suggestions;
        } catch (error) {
            console.error('Error getting search suggestions:', error);
            return [];
        }
    }

    extractAvailableFilters(programs) {
        if (!programs || !Array.isArray(programs)) {
            return {
                statuses: [],
                categories: []
            };
        }

        const statuses = [...new Set(programs
            .map(program => program.status)
            .filter(status => status && status.trim())
        )].sort();

        const categories = [...new Set(programs
            .map(program => program.category)
            .filter(category => category && category.trim())
        )].sort();

        return {
            statuses: statuses.map(status => ({
                value: status.toLowerCase(),
                label: status,
                original: status
            })),
            categories: categories.map(category => ({
                value: category.toLowerCase(),
                label: category,
                original: category
            }))
        };
    }

    async quickSearch(query, field = 'program_name') {
        try {
            if (!query || query.length < 2) {
                return [];
            }

            const result = await this.fetchPrograms({
                search: query,
                limit: 10,
                page: 1
            });

            return (result.data || []).map(program => ({
                id: program.id,
                value: program[field] || program.program_name,
                label: `${program.program_name} (${program.category}) - ${program.status}`,
                program: program
            }));
        } catch (error) {
            console.error('Error in quick search:', error);
            return [];
        }
    }

    async getProgramsByStatus(status, limit = 50) {
        try {
            const result = await this.fetchPrograms({
                status: status,
                limit: limit,
                page: 1
            });

            return result.data || [];
        } catch (error) {
            console.error(`Error getting programs by status ${status}:`, error);
            return [];
        }
    }

    async getProgramsByCategory(category, limit = 50) {
        try {
            const result = await this.fetchPrograms({
                category: category,
                limit: limit,
                page: 1
            });

            return result.data || [];
        } catch (error) {
            console.error(`Error getting programs by category ${category}:`, error);
            return [];
        }
    }

    async getDistinctFilterValues(field) {
        try {
            const result = await this.fetchAllPrograms({});
            
            if (!result.data || result.data.length === 0) {
                return [];
            }

            const values = [...new Set(
                result.data
                    .map(item => item[field])
                    .filter(value => value && value.trim())
            )].sort();

            return values.map(value => ({
                value: value.toLowerCase(),
                label: value,
                count: result.data.filter(item => item[field] === value).length
            }));
        } catch (error) {
            console.error(`Error getting distinct values for ${field}:`, error);
            return [];
        }
    }
}

export default new ProgramService()