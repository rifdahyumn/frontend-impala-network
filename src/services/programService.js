import * as XLSX from 'xlsx';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

class ProgramService {
    constructor() {
        this.baseURL = API_BASE_URL
    }

    parseImportFile(file) {
        return new Promise((resolve, reject) => {
            if (!file) {
                reject(new Error('Please select a file to upload'))
                return
            }

            const reader = new FileReader();
            const fileName = file.name.toLowerCase();

            if (!fileName.endsWith('.xlsx') && !fileName.endsWith('.xls')) {
                reject(new Error('Only Excel files (.xlsx, .xls) are supported'));
                return;
            }

            reader.onload = async (event) => {
                try {
                    const data = new Uint8Array(event.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });

                    const firstSheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[firstSheetName];

                    const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
                        defval: '',
                        raw: false 
                    });

                    if (jsonData.length === 0) {
                        throw new Error('Excel file is empty or contains no data');
                    }

                    const normalizedData = jsonData.map((row) => {
                        const normalizedRow = {};

                        const columnMappings = {
                            'program_name': ['Program Name', 'program name', 'PROGRAM NAME', 'Program_Name', 'programName', 'Program'],
                            'category': ['Category', 'category', 'CATEGORY', 'Kategori'],
                            'location': ['Location', 'location', 'LOCATION', 'Lokasi'],
                            'capacity': ['Capacity', 'capacity', 'CAPACITY', 'Kapasitas'],
                            'price': ['Price', 'price', 'PRICE', 'Harga'],
                            'client': ['Client', 'client', 'CLIENT', 'Klien', 'Company'],
                            'start_date': ['Start Date', 'start date', 'START DATE', 'Start_Date', 'startDate', 'Tanggal Mulai'],
                            'end_date': ['End Date', 'end date', 'END DATE', 'End_Date', 'endDate', 'Tanggal Berakhir'],
                            'description': ['Description', 'description', 'DESCRIPTION', 'Deskripsi'],
                            'instructors': ['Instructors', 'instructors', 'INSTRUCTORS', 'Instructor', 'Instruktur'],
                            'tags': ['Tags', 'tags', 'TAGS', 'Tag', 'Kategori Tambahan'],
                            'status': ['Status', 'status', 'STATUS', 'Status Program']
                        }

                        Object.keys(columnMappings).forEach(key => {
                            const possibleHeaders = columnMappings[key];
                            let foundValue = '';

                            for (const header of possibleHeaders) {
                                if (row[header] !== undefined && row[header] !== '') {
                                    foundValue = row[header];
                                    break;
                                }
                            }

                            if (!foundValue) {
                                const lowerCaseRow = Object.keys(row).reduce((acc, k) => {
                                    acc[k.toLowerCase()] = row[k];
                                    return acc;
                                }, {});

                                const lowerCaseHeaders = possibleHeaders.map(h => h.toLowerCase());
                                for (const header of lowerCaseHeaders) {
                                    if (lowerCaseRow[header] !== undefined && lowerCaseRow[header] !== '') {
                                        foundValue = lowerCaseRow[header];
                                        break;
                                    }
                                }
                            }

                            normalizedRow[key] = foundValue ? String(foundValue).trim() : ''
                        })

                        if (normalizedRow.start_date) {
                            normalizedRow.start_date = this.normalizeDate(normalizedRow.start_date);
                        }
                        
                        if (normalizedRow.end_date) {
                            normalizedRow.end_date = this.normalizeDate(normalizedRow.end_date);
                        }
                        
                        if (normalizedRow.price) {
                            normalizedRow.price = this.normalizePrice(normalizedRow.price);
                        }
                        
                        if (normalizedRow.capacity) {
                            normalizedRow.capacity = this.normalizeCapacity(normalizedRow.capacity);
                        }
                        
                        if (!normalizedRow.status) {
                            normalizedRow.status = 'Active';
                        }

                        if (normalizedRow.instructors) {
                            normalizedRow.instructors = this.prepareInstructorsForBackend(normalizedRow.instructors)
                        } else {
                            normalizedRow.instructors = []
                        }

                        if (normalizedRow.tags) {
                            normalizedRow.tags = this.prepareTagsForBackend(normalizedRow.tags)
                        } else {
                            normalizedRow.tags = []
                        }

                        return normalizedRow
                    }).filter(row => {
                        return Object.values(row).some(value => {
                            if (Array.isArray(value)) {
                                return value.length > 0
                            }

                            return value !== '' && value !== null && value !== undefined
                        })
                    })

                    if (normalizedData.length === 0) {
                        throw new Error('No valid data found in Excel file');
                    }

                    resolve(normalizedData)
                } catch (error) {
                    reject(new Error(`Failed to parse Excel file: ${error.message}`));
                }
            }

            reader.onerror = () => {
                reject(new Error('Failed to read file'));
            }

            reader.readAsArrayBuffer(file)
        })
    }

    normalizeDate(dateString) {
        if (!dateString) return ''

        try {
            let date

            if (typeof dateString === 'number') {

                const excelEpoch = new Date(Date.UTC(1899, 11, 30));
                date = new Date(excelEpoch.getTime() + dateString * 24 * 60 * 60 * 1000);
            } else if (dateString.includes('T')) {
                date = new Date(dateString)
            } else if (dateString.includes('/')) {
                const parts = dateString.split('/')
                if (parts.length === 3) {
                    date = new Date(parts[2], parts[1] - 1, parts[0]);
                }
            } else if (dateString.includes('-')) {
                const parts = dateString.split('-');
                if (parts.length === 3) {
                    date = new Date(parts[0], parts[1] - 1, parts[2]);
                }
            }

            if (!date || isNaN(date.getTime())) {
                date = new Date(dateString);
            }

            if (!isNaN(date.getTime())) {
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;
            }

            return dateString
        } catch  {
            return dateString
        }
    }

    normalizePrice(price) {
        if (!price) return ''

        const priceStr = String(price)

        let normalized = priceStr.replace(/[^\d.,]/g, '');

        if (normalized.includes(',') && !normalized.includes('.')) {
            normalized = normalized.replace(',', '.');
        }

        const parts = normalized.split('.');
        if (parts.length > 2) {
            normalized = parts.slice(0, -1).join('') + '.' + parts[parts.length - 1];
        }
        
        return normalized;
    }

    normalizeCapacity(capacity) {
        if (!capacity) return '';
    
        const capacityStr = String(capacity);
        
        const numeric = capacityStr.replace(/\D/g, '');
        
        return numeric || '';
    }

    generateExceltemplate() {
        const templateData = [
            {
                'Program Name': 'Leadership Training 2024',
                'Category': 'Training',
                'Location': 'Jakarta Convention Center',
                'Capacity': '30',
                'Price': '5000000',
                'Client': 'PT. Example Corporation',
                'Start Date': '2024-03-01',
                'End Date': '2024-03-05',
                'Description': '5-day intensive leadership training program',
                'Instructors': 'John Doe, Jane Smith',
                'Tags': 'leadership,management,training',
                // 'Status': 'Active'
            },
            {
                'Program Name': 'Digital Marketing Workshop',
                'Category': 'Workshop',
                'Location': 'Online',
                'Capacity': '50',
                'Price': '2500000',
                'Client': 'Startup XYZ',
                'Start Date': '2024-04-15',
                'End Date': '2024-04-16',
                'Description': '2-day digital marketing workshop',
                'Instructors': 'Michael Chen',
                'Tags': 'marketing,digital,workshop',
                // 'Status': 'Active'
            },
        ]

        const worksheet = XLSX.utils.json_to_sheet(templateData);

        const columnWidths = [
            { wch: 25 },
            { wch: 20 }, 
            { wch: 20 }, 
            { wch: 10 },
            { wch: 15 }, 
            { wch: 25 }, 
            { wch: 12 }, 
            { wch: 12 }, 
            { wch: 40 }, 
            { wch: 25 }, 
            { wch: 25 }, 
            { wch: 12 }  
        ]
        worksheet['!cols'] = columnWidths;

        const range = XLSX.utils.decode_range(worksheet['!ref']);
            for (let C = range.s.c; C <= range.e.c; ++C) {
            const cellAddress = { c: C, r: 0 };
            const cellRef = XLSX.utils.encode_cell(cellAddress);
            if (!worksheet[cellRef]) continue;
            
            worksheet[cellRef].s = {
                font: { bold: true, color: { rgb: "FFFFFF" } },
                fill: { fgColor: { rgb: "4F46E5" } }, 
                alignment: { horizontal: "center", vertical: "center" }
            };
        }

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Program Template");

        const dateStr = new Date().toISOString().split('T')[0];
        XLSX.writeFile(workbook, `program_import_template_${dateStr}.xlsx`);

        return {
            success: true,
            message: 'Excel template downloaded successfully',
            filename: `program_import_template_${dateStr}.xlsx`
        };
    }

    downloadExcelTemplate() {
        try {
            return this.generateExceltemplate()
        } catch (error) {
            console.error('Error generating Excel template:', error);
            return {
                success: false,
                message: error.message || 'Failed to generate template'
            };
        }
    }

    formatInstructors(instructors) {
        if (!instructors || instructors === 'null' || instructors === 'undefined' || instructors === '') {
            return '';
        }

        if (Array.isArray(instructors)) {
            return instructors
                .filter(item => item && item.trim() && item !== 'null' && item !== 'undefined')
                .map(item => item.trim()) 
                .join(', ')
        }

        if (typeof instructors === 'string') {
            const trimmed = instructors.trim()
            if (!trimmed || trimmed === 'null' || trimmed === 'undefined') {
                return '';
            }

            if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
                try {
                    const parsed = JSON.parse(trimmed)
                    if (Array.isArray(parsed)) {
                        return parsed
                            .filter(item => item && item.trim() && item !== 'null' && item !== 'undefined' )
                            .map(item => item.trim())
                            .join(', ')
                    }
                } catch {
                    //
                }
            }

            const regex = /([A-Za-z.\s]+\([^)]+\)|[A-Za-z.\s]+)/g;
            const matches = trimmed.match(regex)
            if (matches && matches.length > 0) {
                return matches
                    .filter(item => item && item.trim())
                    .map(item => item.trim())
                    .join(', ')
            }

            if (trimmed.includes(',') || trimmed.includes(';')) {
                const separator = trimmed.includes(',') ? ',' : ';';
                return trimmed.split(separator)
                    .map(item => item.trim())
                    .filter(item => item && item !== 'null' && item !== 'undefined')
                    .join(', ');
            }

            return trimmed
        }

        return String(instructors)
    }

    formatTags(tags) {
        if (!tags || tags === 'null' || tags === 'undefined' || tags === '') {
            return '';
        }

        if (Array.isArray(tags)) {
            return tags
                .filter(item => item && item.trim() && item !== 'null' && item !== 'undefined')
                .map(item => item.trim())
                .join(', ');
        }

        if (typeof tags === 'string') {
            const trimmed = tags.trim();
            if (!trimmed || trimmed === 'null' || trimmed === 'undefined') {
                return '';
            }

            if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
                try {
                    const parsed = JSON.parse(trimmed);
                    if (Array.isArray(parsed)) {
                        return parsed
                            .filter(item => item && item.trim() && item !== 'null' && item !== 'undefined')
                            .map(item => item.trim())
                            .join(', ');
                    }
                } catch {
                    // 
                }
            }

            if (trimmed.includes(',') || trimmed.includes(';')) {
                const separator = trimmed.includes(',') ? ',' : ';';
                return trimmed.split(separator)
                    .map(item => item.trim())
                    .filter(item => item && item !== 'null' && item !== 'undefined')
                    .join(', ');
            }

            if (!trimmed.includes(' ') && /[a-z][A-Z]/.test(trimmed)) {
                // Split berdasarkan huruf kapital
                const words = trimmed.split(/(?=[A-Z])/)
                    .filter(word => word.trim() && word !== 'null' && word !== 'undefined');
                if (words.length > 1) {
                    return words.join(', ');
                }
            }
            
            return trimmed;
        }

        return String(tags)
    }

    formatProgramData(program) {
        if (!program) return null

        return {
            ...program,
            instructors: this.formatInstructors(program.instructors),
            tags: this.formatTags(program.tags),
            _raw_instructors: program.instructors,
            _raw_tags: program.tags
        }
    }

    formatProgramsData(programs) {
        if (!Array.isArray(programs)) return [];
        
        return programs.map(program => this.formatProgramData(program));
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

        if (result.data) {
            if (Array.isArray(result.data)) {
                result.data = this.formatProgramsData(result.data)
            } else {
                result.data = this.formatProgramData(result.data)
            }
        }

        return result;
    }

    async fetchPrograms(params = {}) {
        try {
            const {
                page = 1,
                limit = 20,
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

            const formattedData = {
                ...programData,
                instructors: this.prepareInstructorsForBackend(programData.instructors) || [],
                tags: this.prepareTagsForBackend(programData.tags) || []
            }

            const response = await fetch(`${this.baseURL}/program`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formattedData)
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

            const formattedData = {
                ...programData,
                instructors: programData._raw_instructors || this.prepareInstructorsForBackend(programData.instructors),
                tags: programData._raw_tags || this.prepareTagsForBackend(programData.tags)
            }

            delete formattedData._raw_instructors
            delete formattedData._raw_tags

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

    prepareInstructorsForBackend(instructors) {
        if (!instructors) return [];
        
        if (Array.isArray(instructors)) {
            return instructors.filter(item => item && item.trim());
        }
        
        if (typeof instructors === 'string') {
            const trimmed = instructors.trim()
            if (!trimmed) return []

            const instructorArray = []
            let current = ''
            let inParenthesis = 0

            for (let i = 0; i < trimmed.length; i++) {
                const char = trimmed[i]
                // const prevChar = i > 0 ? trimmed[i - 1] : '';
                // const nextChar = i < trimmed.length - 1 ? trimmed[i + 1] : ''

                if (char === '(') inParenthesis++
                if (char === ')') inParenthesis--

                if (char === ',' && inParenthesis === 0) {
                    const lookback = trimmed.substring(Math.max(0, i - 4), i)
                    const lookahead = trimmed.substring(i + 1, Math.min(trimmed.length, i + 4))

                    const isAcademicTitle = /[A-Z]\.$/.test(lookback) || /^[A-Z]\./.test(lookahead)

                    if (!isAcademicTitle) {
                        const fullInstructor  = current.trim()
                        if (fullInstructor ) {
                            instructorArray.push(fullInstructor)
                        }

                        current = ''
                        continue
                    }
                }

                current += char
            }

            if (current.trim()) {
                const fullInstructor  = current.trim()
                instructorArray.push(fullInstructor )
            }

            return instructorArray.length > 0 ? instructorArray : []
        }
        
        return [String(instructors).trim()].filter(item => item);
    }

    prepareTagsForBackend(tags) {
        if (!tags) return [];
        
        if (Array.isArray(tags)) {
            return tags.filter(item => item && item.trim());
        }
        
        if (typeof tags === 'string') {
           const trimmed = tags.trim()
           if (!trimmed) return []

           const separator = trimmed.includes(',') ? ',' : ';'
           return trimmed.split(separator)
                .map(item => item.trim())
                .filter(item => item)
        }
        
        return [String(tags).trim()].filter(item => item);
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

    async bulkImport(programsData, options = {}) {
        try {
            const {
                mode = 'create',
                overwriteExisting = false,
                chunkSize = 100,
                onProgress
            } = options;

            if (!Array.isArray(programsData) || programsData.length === 0) {
                throw new Error('Programs data is required and must be a non-empty array');
            }

            const useChunking = chunkSize > 0 && programsData.length > chunkSize;
            const totalChunks = useChunking ? Math.ceil(programsData.length / chunkSize) : 1;

            const allResults = {
                total: programsData.length,
                successful: 0,
                failed: 0,
                skipped: 0,
                details: [],
                chunks: []
            };

            if (useChunking) {

                for (let i = 0; i < programsData.length; i += chunkSize) {
                    const chunkIndex = Math.floor(i / chunkSize) + 1;
                    const chunk = programsData.slice(i, i + chunkSize);

                    if (onProgress) {
                        onProgress({
                            chunk: chunkIndex,
                            totalChunks,
                            progress: Math.round((i / programsData.length) * 100),
                            status: 'processing'
                        })
                    }

                    try {
                        const chunkResult = await this.processBulkChunk(chunk, mode, overwriteExisting);

                        const progress = Math.round(((i + chunk.length) / programsData.length) * 100)

                        if (onProgress) {
                            onProgress({
                                chunk: chunkIndex,
                                totalChunks,
                                progress,
                                status: 'completed'
                            });
                        }

                        allResults.chunks.push({
                            chunk: chunkIndex,
                            ...chunkResult
                        });

                        allResults.successful += chunkResult.successful || 0;
                        allResults.failed += chunkResult.failed || 0;
                        allResults.skipped += chunkResult.skipped || 0;
                        allResults.details.push(...(chunkResult.details || []));

                    } catch (error) {
                        console.error(`Error processing chunk ${chunkIndex}:`, error);

                        allResults.chunks.push({
                            chunk: chunkIndex,
                            error: error.message,
                            success: false
                        });

                        allResults.failed += chunk.length;

                        chunk.forEach((item, itemIndex) => {
                            allResults.details.push({
                                row: i + itemIndex + 1,
                                program_name: item.program_name || 'Unknown',
                                status: 'failed',
                                error: `Chunk processing failed: ${error.message}`
                            });
                        });
                    }
                }
            } else {
                const singleResult = await this.processBulkChunk(programsData, mode, overwriteExisting);
                allResults.chunks.push(singleResult);

                allResults.successful = singleResult.successful || 0;
                allResults.failed = singleResult.failed || 0;
                allResults.skipped = singleResult.skipped || 0;
                allResults.details = singleResult.details || [];
            }

            allResults.successRate = allResults.total > 0 
                ? Math.round((allResults.successful / allResults.total) * 100) 
                : 0;

            return {
                success: true,
                message: `Bulk import completed: ${allResults.successful} successful, ${allResults.failed} failed, ${allResults.skipped} skipped`,
                data: allResults,
                metadate: {
                    timestamp: new Date().toISOString(),
                    totalProcessed: programsData.length,
                    mode,
                    overwriteExisting,
                    useChunking,
                    chunkSize: useChunking ? chunkSize : programsData.length
                }
            }

        } catch (error) {
            console.error('Error in bulk import:', error);
            return {
                success: false,
                message: error.message || 'Bulk import failed',
                data: null,
                error: error.message
            };
        }
    }

    async processBulkChunk(programs, mode, overwriteExisting) {
        try {
            const formattedPrograms = programs.map(program => ({
                ...program,
                instructors: Array.isArray(program.instructors) ? program.instructors : [],
                tags: Array.isArray(program.tags) ? program.tags : []
            }))

            const response = await fetch(`${this.baseURL}/program/bulk-import`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    programs: formattedPrograms,
                    mode,
                    overwriteExisting
                })
            })
            
            const result = await this.handleResponse(response);

            if (result.data && result.data.details) {
                result.data.details = result.data.details.map(detail => ({
                    ...detail,
                    program_name: detail.program_name || 'Unknown'
                }));
            }

            return result.data || result;
        } catch (error) {
            console.error('Error processing bulk chunk:', error);
            throw error;
        }
    }

    async validateImportData(programsData) {
        const validationResults = {
            valid: [],
            invalid: [],
            errors: []
        };

        programsData.forEach((program, index) => {
            const errors = [];
            const rowNumber = index + 1;

            if (!program.program_name || !program.program_name.trim()) {
                errors.push('Program name is required');
            }

            if (program.start_date && program.end_date) {
                const start = new Date(program.start_date);
                const end = new Date(program.end_date);
                if (start > end) {
                    errors.push('Start date cannot be after end date');
                }
            }

            if (program.price) {
                const price = parseFloat(program.price);
                if (isNaN(price) || price < 0) {
                    errors.push('Price must be a positive number');
                }
            }

            if (program.capacity) {
                const capacity = parseInt(program.capacity);
                if (isNaN(capacity) || capacity < 1) {
                    errors.push('Capacity must be a positive integer');
                }
            }

            if (program.status && !['active', 'inactive', 'pending', 'completed'].includes(program.status.toLowerCase())) {
                errors.push('Status must be one of: Active, Inactive, Pending, Completed');
            }

            const programWithValidation = {
                ...program,
                _rowNumber: rowNumber,
                _errors: errors,
                _isValid: errors.length === 0
            };

            if (errors.length > 0) {
                validationResults.invalid.push(programWithValidation);
                validationResults.errors.push({
                    row: rowNumber,
                    program_name: program.program_name || 'Unknown',
                    errors: errors
                });
            } else {
                validationResults.valid.push(programWithValidation);
            }
        })

        return validationResults
    }

    formatProgram(program) {
        return this.formatProgramData(program)
    }

    formatPrograms(programs) {
        return this.formatProgramsData(programs)
    }

    getFormattedInstructors(instructors) {
        return this.formatInstructors(instructors);
    }

    getFormattedTags(tags) {
        return this.formatTags(tags);
    }
}

export default new ProgramService()