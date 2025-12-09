// eslint-disable-next-line no-undef
const API_BASE_URL = process.env.BASE_API_URL || 'http://localhost:3000/api'

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

    // 🔴 DIUBAH: Tambahkan parameter filter dan showAllOnSearch
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

            // 🔴 DIUBAH: Build query params seperti clientService
            const queryParams = new URLSearchParams({
                page: page.toString(),
                ...(limit > 0 && { limit: limit.toString() }),
                ...(search && { search }),
                ...(status && { status }),
                ...(category && { category }),
                ...(showAllOnSearch && { showAllOnSearch: 'true' })
            });

            // 🔴 DIUBAH: Jika limit = 0 (show all), hapus limit parameter
            if (limit === 0) {
                queryParams.delete('limit');
            }

            // 🔴 DEBUG: Log query parameters
            console.log('📡 ProgramService - Request URL:', `${this.baseURL}/program?${queryParams}`);
            console.log('📡 ProgramService - Request Params:', {
                page,
                limit,
                search,
                status,
                category,
                showAllOnSearch,
                queryString: queryParams.toString()
            });

            const response = await fetch(`${this.baseURL}/program?${queryParams}`, {
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
            console.log('📡 ProgramService - Response:', {
                dataCount: result.data?.length,
                pagination: result.metadata?.pagination,
                showingAllResults: result.metadata?.pagination?.showingAllResults
            });

            return result;

        } catch (error) {
            console.error('Error fetching programs', error)
            throw error;
        }
    }

    // 🔴 FUNGSI BARU: fetchAllPrograms untuk get all data dengan filter
    async fetchAllPrograms(filters = {}) {
        try {
            // 🔴 DIUBAH: Gunakan fetchPrograms dengan limit 0 untuk mengambil semua data
            const params = {
                ...filters,
                page: 1,
                limit: 0, // 🔴 Limit 0 = get all data
                showAllOnSearch: true
            };

            console.log('📡 ProgramService - Fetch All Programs:', { params });

            const result = await this.fetchPrograms(params);

            console.log('📡 ProgramService - All Programs Response:', {
                totalCount: result.data?.length,
                filtersApplied: filters.search || filters.status || filters.category
            });

            return result;

        } catch (error) {
            console.error('Error fetching all programs', error);
            throw error;
        }
    }

    // 🔴 FUNGSI BARU: Helper untuk build URL dengan filter
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

    // 🔴 DIUBAH: addProgram dengan error handling yang lebih baik
    async addProgram(programData) {
        try {
            // 🔴 VALIDASI: Pastikan data yang diperlukan ada
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

    // 🔴 DIUBAH: updateProgram dengan validasi
    async updateProgram(programId, programData) {
        try {
            // 🔴 VALIDASI: Pastikan programId valid
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

    // 🔴 DIUBAH: deleteProgram dengan validasi
    async deleteProgram(programId) {
        try {
            // 🔴 VALIDASI: Pastikan programId valid
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

    // 🔴 DIUBAH: getProgramNamesFromClients
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

    // 🔴 DIUBAH: fetchAllProgramForAnalytics dengan parameter filter
    async fetchAllProgramForAnalytics(params = {}) {
        try {
            const { 
                search = '', 
                status = '', 
                category = '', 
                sort = 'created_at:asc' 
            } = params;

            // 🔴 DIUBAH: Gunakan fetchAllPrograms untuk konsistensi
            const result = await this.fetchAllPrograms({
                search,
                status,
                category,
                sort
            });
            
            console.log('fetchAllProgramForAnalytics:', {
                dataCount: result.data?.length || 0,
                totalCount: result.metadata?.pagination?.total || 0,
                filters: { search, status, category }
            })
            
            return result

        } catch (error) {
            console.error('Error fetching all programs for analytics', error)
            throw error
        }
    }

    // 🔴 FUNGSI BARU: Export programs dengan format yang berbeda
    async exportPrograms(filters = {}, format = 'csv') {
        try {
            console.log('📡 ProgramService - Exporting programs:', { filters, format });

            // Gunakan fetchAllPrograms untuk mendapatkan semua data dengan filter
            const result = await this.fetchAllPrograms(filters);
            
            if (!result.data || result.data.length === 0) {
                throw new Error('No data to export');
            }

            if (format.toLowerCase() === 'csv') {
                const csvContent = this.convertToCSV(result.data);
                
                // 🔴 Helper untuk download file
                this.downloadFile(csvContent, `programs_export_${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');
                
                return {
                    success: true,
                    message: `Exported ${result.data.length} programs to CSV`,
                    data: result.data
                };
            } else if (format.toLowerCase() === 'json') {
                // 🔴 Helper untuk download JSON file
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

    // 🔴 FUNGSI BARU: Helper untuk download file
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
            
            console.log('📡 ProgramService - File downloaded:', filename);
        } catch (error) {
            console.error('Error downloading file:', error);
            throw error;
        }
    }

    // 🔴 FUNGSI BARU: Cek apakah sedang dalam mode show all
    isShowAllMode(paginationData) {
        return paginationData?.showingAllResults || paginationData?.isShowAllMode || false;
    }

    // 🔴 FUNGSI BARU: Hitung display info
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

    // 🔴 FUNGSI BARU: Get filtered programs count
    async getFilteredCount(filters = {}) {
        try {
            const result = await this.fetchPrograms({
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
        
        if (filters.category && typeof filters.category === 'string' && filters.category.trim()) {
            validFilters.category = filters.category.trim();
        }
        
        return validFilters;
    }

    // 🔴 FUNGSI BARU: Batch operations untuk programs
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

    // 🔴 FUNGSI BARU: Search suggestions untuk programs
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

            // 🔴 Extract suggestions dari hasil
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

    // 🔴 FUNGSI BARU: Get available filters from data
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

    // 🔴 FUNGSI BARU: Quick search untuk autocomplete
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

    // 🔴 FUNGSI BARU: Get programs by status
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

    // 🔴 FUNGSI BARU: Get programs by category
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

    // 🔴 FUNGSI BARU: Get distinct values untuk filter
    async getDistinctFilterValues(field) {
        try {
            // Ambil cukup data untuk mendapatkan distinct values
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