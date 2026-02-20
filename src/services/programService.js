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
                            'client': ['Client', 'client', 'CLIENT', 'Klien', 'Company', 'Client Company'],
                            'status': ['Status', 'status', 'STATUS', 'Status Program'],
                            'description': ['Description', 'description', 'DESCRIPTION', 'Deskripsi'],
                            'start_date': ['Start Date', 'start date', 'START DATE', 'Start_Date', 'startDate', 'Tanggal Mulai'],
                            'end_date': ['End Date', 'end date', 'END DATE', 'End_Date', 'endDate', 'Tanggal Berakhir'],
                            'location': ['Location', 'location', 'LOCATION', 'Lokasi'],
                            'area': ['Area', 'area', 'AREA', 'Wilayah'],
                            'activity': ['Activity', 'activity', 'ACTIVITY', 'Aktivitas'],
                            'capacity': ['Capacity', 'capacity', 'CAPACITY', 'Kapasitas'],
                            'participant': ['Participant', 'participant', 'PARTICIPANT', 'Participants', 'Jumlah Peserta'],
                            'budget_offering': ['Budget Offering', 'budget offering', 'BUDGET OFFERING', 'Offering Budget'],
                            'budget_usage_plan': ['Budget Usage Plan', 'budget usage plan', 'BUDGET USAGE PLAN', 'Usage Plan'],
                            'budget_finance_closure': ['Budget Finance Closure', 'budget finance closure', 'BUDGET FINANCE CLOSURE', 'Finance Closure'],
                            'budget_finance_closure_realisasi_penyerapan': ['Realisasi Penyerapan', 'realisasi penyerapan', 'REALISASI PENYERAPAN', 'Penyerapan %'],
                            'margin_estimasi_margin': ['Estimasi Margin', 'estimasi margin', 'ESTIMASI MARGIN', 'Estimated Margin'],
                            'margin_real_margin': ['Real Margin', 'real margin', 'REAL MARGIN', 'Actual Margin'],
                            'termin': ['Termin', 'termin', 'TERMIN', 'Payment Terms'],
                            'link_folder_program': ['Link Folder Program', 'link folder program', 'LINK FOLDER PROGRAM', 'Program Folder'],
                            'deck_program_link': ['Deck Program Link', 'deck program link', 'DECK PROGRAM LINK', 'Deck Link'],
                            'link_budgeting_offering': ['Link Budgeting Offering', 'link budgeting offering', 'LINK BUDGETING OFFERING'],
                            'link_budgeting_usage_plan': ['Link Budgeting Usage Plan', 'link budgeting usage plan', 'LINK BUDGETING USAGE PLAN'],
                            'link_budgeting_finance_tracker': ['Link Budgeting Finance Tracker', 'link budgeting finance tracker', 'LINK BUDGETING FINANCE TRACKER'],
                            'quotation': ['Quotation', 'quotation', 'QUOTATION', 'Quote'],
                            'invoice': ['Invoice', 'invoice', 'INVOICE'],
                            'receipt': ['Receipt', 'receipt', 'RECEIPT', 'Kwitansi'],
                            'link_drive_documentation': ['Link Documentation', 'link documentation', 'LINK DOCUMENTATION', 'Documentation'],
                            'link_drive_media_release_program': ['Link Media Release', 'link media release', 'LINK MEDIA RELEASE'],
                            'link_drive_program_report': ['Link Program Report', 'link program report', 'LINK PROGRAM REPORT'],
                            'link_drive_e_catalogue_beneficiary': ['Link E-Catalogue', 'link e-catalogue', 'LINK E-CATALOGUE'],
                            'link_drive_bast': ['Link BAST', 'link bast', 'LINK BAST'],
                            'satisfaction_survey_link': ['Survey Link', 'survey link', 'SURVEY LINK', 'Satisfaction Survey'],
                            'link_kontrak_freelance': ['Link Kontrak Freelance', 'link kontrak freelance', 'LINK KONTRAK FREELANCE'],
                            'link_surat_tugas': ['Link Surat Tugas', 'link surat tugas', 'LINK SURAT TUGAS'],
                            'link_document_kontrak_partner': ['Link Kontrak Partner', 'link kontrak partner', 'LINK KONTRAK PARTNER'],
                            'instructors': ['Instructors', 'instructors', 'INSTRUCTORS', 'Instructor', 'Instruktur'],
                            'tags': ['Tags', 'tags', 'TAGS', 'Tag', 'Kategori Tambahan'],
                            'interest_of_program': ['Interest of Program', 'interest of program', 'INTEREST OF PROGRAM', 'Minat Program'],
                            'man_power_pic': ['Man Power PIC', 'man power pic', 'MAN POWER PIC', 'PIC'],
                            'kolaborator': ['Kolaborator', 'kolaborator', 'KOLABORATOR', 'Collaborators'],
                            'man_power_leads': ['Man Power Leads', 'man power leads', 'MAN POWER LEADS', 'Team Lead'],
                            'man_power_division': ['Division', 'division', 'DIVISION', 'Divisi'],
                            'jumlah_team_internal': ['Jumlah Team Internal', 'jumlah team internal', 'JUMLAH TEAM INTERNAL', 'Internal Team'],
                            'jumlah_team_eksternal': ['Jumlah Team Eksternal', 'jumlah team eksternal', 'JUMLAH TEAM EKSTERNAL', 'External Team'],
                            'stage_start_leads_realisasi': ['Start Leads %', 'start leads %', 'START LEADS'],
                            'stage_analysis_realisasi': ['Analysis %', 'analysis %', 'ANALYSIS'],
                            'stage_project_creative_development_realisasi': ['Creative Development %', 'creative development %', 'CREATIVE DEVELOPMENT'],
                            'stage_program_description_realisasi': ['Program Description %', 'program description %', 'PROGRAM DESCRIPTION'],
                            'stage_project_initial_presentation_realisasi': ['Initial Presentation %', 'initial presentation %', 'INITIAL PRESENTATION'],
                            'stage_project_organizing_development_realisasi': ['Organizing Development %', 'organizing development %', 'ORGANIZING DEVELOPMENT'],
                            'stage_project_implementation_presentation_realisasi': ['Implementation Presentation %', 'implementation presentation %', 'IMPLEMENTATION PRESENTATION'],
                            'stage_project_implementation_realisasi': ['Implementation %', 'implementation %', 'IMPLEMENTATION'],
                            'stage_project_evaluation_monitoring_realisasi': ['Evaluation & Monitoring %', 'evaluation monitoring %', 'EVALUATION'],
                            'stage_project_satisfaction_survey_realisasi': ['Satisfaction Survey %', 'satisfaction survey %', 'SATISFACTION SURVEY'],
                            'stage_project_report_realisasi': ['Report %', 'report %', 'REPORT'],
                            'stage_end_sustainability_realisasi': ['End & Sustainability %', 'end sustainability %', 'END SUSTAINABILITY']
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
                        
                         const currencyFields = [
                            'budget_offering', 'budget_usage_plan', 'budget_finance_closure',
                            'margin_estimasi_margin', 'margin_real_margin'
                        ];
                        
                        currencyFields.forEach(field => {
                            if (normalizedRow[field]) {
                                normalizedRow[field] = this.normalizePrice(normalizedRow[field]);
                            }
                        });
                        
                        if (normalizedRow.capacity) {
                            normalizedRow.capacity = this.normalizeCapacity(normalizedRow.capacity);
                        }
                        
                        if (!normalizedRow.status) {
                            normalizedRow.status = 'Active';
                        }

                        const arrayFields = [
                            'instructors', 'tags', 'interest_of_program', 
                            'man_power_pic', 'kolaborator'
                        ];
                        
                        arrayFields.forEach(field => {
                            if (normalizedRow[field]) {
                                normalizedRow[field] = this.prepareArrayForBackend(normalizedRow[field]);
                            } else {
                                normalizedRow[field] = [];
                            }
                        });

                        const numberFields = [
                            'participant', 'jumlah_team_internal', 'jumlah_team_eksternal',
                            'stage_start_leads_realisasi', 'stage_analysis_realisasi',
                            'stage_project_creative_development_realisasi', 'stage_program_description_realisasi',
                            'stage_project_initial_presentation_realisasi', 'stage_project_organizing_development_realisasi',
                            'stage_project_implementation_presentation_realisasi', 'stage_project_implementation_realisasi',
                            'stage_project_evaluation_monitoring_realisasi', 'stage_project_satisfaction_survey_realisasi',
                            'stage_project_report_realisasi', 'stage_end_sustainability_realisasi'
                        ];
                        
                        numberFields.forEach(field => {
                            if (normalizedRow[field]) {
                                const num = parseInt(normalizedRow[field].replace(/\D/g, ''));
                                normalizedRow[field] = isNaN(num) ? 0 : num;
                            } else {
                                normalizedRow[field] = 0;
                            }
                        });

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
            if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
                const [year, month, day] = dateString.split('-').map(Number)
                const date = new Date(year, month - 1, day)

                if (date.getFullYear() === year &&
                    date.getMonth() === month - 1 &&
                    date.getDate() === day) {
                        return dateString
                    }
            }

            let date

            if (typeof dateString === 'number') {
                const excelEpoch = new Date(Date.UTC(1899, 11, 30));
                date = new Date(excelEpoch.getTime() + dateString * 24 * 60 * 60 * 1000);
            } else if (dateString.includes('T')) {
                date = new Date(dateString)
            } else {
                const cleanDate = String(dateString).trim()

                const yyyyMmDdMatch = cleanDate.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/)
                if (yyyyMmDdMatch) {
                    const year = parseInt(yyyyMmDdMatch[1], 10)
                    const month = parseInt(yyyyMmDdMatch[2], 10)
                    const day = parseInt(yyyyMmDdMatch[3], 10)

                    if (year >= 1900 && year < 2100) {
                        date = new Date(year, month - 1, day)
                    }
                }

                if (!date) {
                    const dateSeparator = cleanDate.includes('/') ? '/' : '-';
                    const parts = cleanDate.split(dateSeparator)

                    if (parts.length === 3) {
                        const possibleFormats = []

                        if (parts[0].length === 4) {
                            possibleFormats.push({
                                year: parseInt(parts[0], 10),
                                month: parseInt(parts[1], 10),
                                day: parseInt(parts[2], 10)
                            })
                        }

                        if (parts[2].length === 4) {
                            possibleFormats.push({
                                year: parseInt(parts[2], 10),
                                month: parseInt(parts[1], 10),
                                day: parseInt(parts[0], 10)
                            })
                        }

                        if (parts[2].length === 4 && parseInt(parts[0], 10) <= 12) {
                            possibleFormats.push({
                                year: parseInt(parts[2], 10),
                                month: parseInt(parts[0], 10),
                                day: parseInt(parts[1], 10)
                            })
                        }

                        for (const format of possibleFormats) {
                            if (format.year >= 1900 && format.year <= 2100 &&
                                format.month >= 1 && format.month <= 12 &&
                                format.day >= 1 && format.day <= 31) {
                                    const testDate = new Date(format.year, format.month - 1, format.day)
                                    if (testDate.getFullYear() === format.year &&
                                        testDate.getMonth() === format.month - 1 &&
                                        testDate.getDate() === format.day) {
                                            date = testDate
                                            break
                                        }
                                }
                        }
                    }
                }

                if (!date) {
                    const parsed = Date.parse(cleanDate)
                    if (!isNaN(parsed)) {
                        date = new Date(parsed)
                    }
                }
            }

            if (!date || isNaN(date.getTime())) {
                console.warn(`Cannot parse data: ${dateString}`)
                return dateString
            }

            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');

            if (year < 1900 || year > 2100) {
                console.warn(`Suspicious year detected: ${year} for input: ${dateString}`)

                if (year > 100) {
                    const currentYear = new Date().getFullYear()
                    const century = Math.floor(currentYear / 100) * 100
                    const correctedYear = century + year

                    if (correctedYear >= 1900 && correctedYear <= 2100) {
                        return `${correctedYear}-${month}${day}`
                    }
                }

                return dateString
            }

            return `${year}-${month}-${day}`

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

        let normalized = capacityStr.replace(/[–—]/g, '-')

        normalized = normalized
            .replace(/participants/gi, '')
            .replace(/beneficiaries/gi, '')
            .replace(/peserta/gi, '')

        const match = normalized.match(/(\d+)\s*[-]?\s*(\d+)?/)

        if (match) {
            const start = match[1]
            const end = match[2]

            if (end) {
                return `${start}-${end}`
            } else {
                return parseInt(start, 10)
            }
        }

        const numbers = normalized.match(/\d+/g)
        if (numbers && numbers.length > 0) {
            if (numbers.length === 2) {
                return `${numbers[0]}-${numbers[1]}`
            } else {
                return parseInt(numbers[0], 10)
            }
        }

        console.warn('Could not parse capacity:', capacityStr)
        return capacity
    }

    prepareArrayForBackend(value) {
        if (!value) return [];
        
        if (Array.isArray(value)) {
            return value.filter(item => item && item.trim());
        }
        
        if (typeof value === 'string') {
            const trimmed = value.trim();
            if (!trimmed) return [];

            if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
                try {
                    const parsed = JSON.parse(trimmed);
                    if (Array.isArray(parsed)) {
                        return parsed.filter(item => item && item.trim());
                    }
                } catch {
                    // 
                }
            }

            const separator = trimmed.includes(',') ? ',' : 
                            trimmed.includes(';') ? ';' : 
                            trimmed.includes('|') ? '|' : null;
            
            if (separator) {
                return trimmed.split(separator)
                    .map(item => item.trim())
                    .filter(item => item);
            }

            return [trimmed];
        }
        
        return [String(value).trim()].filter(item => item);
    }

    generateExcelTemplate() {
        const templateData = [
            {
                'Program Name': 'Leadership Training 2024',
                'Category': 'Training',
                'Client': 'PT Example Corporation',
                'Status': 'Active',
                'Description': '5-day intensive leadership training',
                'Start Date': '2024-03-01',
                'End Date': '2024-03-05',
                'Location': 'Jakarta',
                'Area': 'Nasional',
                'Activity': 'Training',
                'Capacity': '50-100',
                'Participant': '75',
                'Budget Offering': '50000000',
                'Budget Usage Plan': '45000000',
                'Budget Finance Closure': '48500000',
                'Realisasi Penyerapan': '97%',
                'Estimasi Margin': '5000000',
                'Real Margin': '3500000',
                'Termin': 'Termin 1 (50%) - Pelunasan (50%)',
                'Link Folder Program': 'https://drive.google.com/...',
                'Deck Program Link': 'https://drive.google.com/...',
                'Link Budgeting Offering': 'https://drive.google.com/...',
                'Quotation': 'https://drive.google.com/...',
                'Invoice': 'https://drive.google.com/...',
                'Receipt': 'https://drive.google.com/...',
                'Link Documentation': 'https://drive.google.com/...',
                'Survey Link': 'https://survey.google.com/...',
                'Instructors': 'John Doe, Jane Smith',
                'Tags': 'leadership, management',
                'Interest of Program': 'Gen Z, Digital Learning',
                'Man Power PIC': 'Mike Johnson, Sarah Wilson',
                'Kolaborator': 'Universitas Indonesia, Kampus Merdeka',
                'Man Power Leads': 'Dian Purnama',
                'Division': 'Digital Learning Division',
                'Jumlah Team Internal': '5',
                'Jumlah Team Eksternal': '3',
                'Link Kontrak Freelance': 'https://drive.google.com/...',
                'Start Leads %': '100',
                'Analysis %': '100',
                'Creative Development %': '100',
                'Program Description %': '100',
                'Initial Presentation %': '100',
                'Organizing Development %': '100',
                'Implementation Presentation %': '70',
                'Implementation %': '50',
                'Evaluation & Monitoring %': '0',
                'Satisfaction Survey %': '0',
                'Report %': '0',
                'End & Sustainability %': '0'
            }
        ]

        const worksheet = XLSX.utils.json_to_sheet(templateData);

        const columnWidths = Array(Object.keys(templateData[0]).length).fill({ wch: 20 });
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
            return this.generateExcelTemplate()
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

        const formatted = {
            ...program,
            instructors: this.formatInstructors(program.instructors),
            tags: this.formatTags(program.tags),
            interest_of_program: this.formatArrayField(program.interest_of_program),
            man_power_pic: this.formatArrayField(program.man_power_pic),
            kolaborator: this.formatArrayField(program.kolaborator),
            _raw_instructors: program.instructors,
            _raw_tags: program.tags,
            _raw_interest_of_program: program.interest_of_program,
            _raw_man_power_pic: program.man_power_pic,
            _raw_kolaborator: program.kolaborator
        }

        const currencyFields = [
            'budget_offering', 'budget_usage_plan', 'budget_finance_closure',
            'margin_estimasi_margin', 'margin_real_margin'
        ];
        
        currencyFields.forEach(field => {
            if (formatted[field] && typeof formatted[field] === 'number') {
                formatted[field] = this.formatCurrency(formatted[field]);
            }
        });

        return formatted;
    }

    formatCurrency(amount) {
        if (!amount) return 'Rp. 0';
        const formatted = amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        return `Rp. ${formatted}`;
    }

    formatArrayField(field) {
        if (!field) return '';
        if (Array.isArray(field)) {
            return field.filter(item => item && item.trim()).join(', ');
        }
        return String(field);
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

            const parsedData = { ...programData };
            const currencyFields = [
                'budget_offering', 'budget_usage_plan', 'budget_finance_closure',
                'margin_estimasi_margin', 'margin_real_margin'
            ];
            
            currencyFields.forEach(field => {
                if (parsedData[field] && typeof parsedData[field] === 'string') {
                    parsedData[field] = this.parseCurrencyToNumber(parsedData[field]);
                }
            });

            const response = await fetch(`${this.baseURL}/program`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(parsedData)
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

            const parsedData = { ...programData };
            const currencyFields = [
                'budget_offering', 'budget_usage_plan', 'budget_finance_closure',
                'margin_estimasi_margin', 'margin_real_margin'
            ];
            
            currencyFields.forEach(field => {
                if (parsedData[field] && typeof parsedData[field] === 'string') {
                    parsedData[field] = this.parseCurrencyToNumber(parsedData[field]);
                }
            });

            const response = await fetch(`${this.baseURL}/program/${programId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(parsedData)
            })

            return await this.handleResponse(response)
        } catch (error) {
            console.error('Error updating program: ', error)
            throw error
        }
    }

    parseCurrencyToNumber(currencyString) {
        if (!currencyString) return null;
        
        const cleaned = currencyString
            .replace('Rp. ', '')
            .replace(/\./g, '')
            .trim();
        
        return cleaned ? parseInt(cleaned) : null;
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

            if (program.budget_offering) {
                const budget = parseFloat(program.budget_offering);
                if (isNaN(budget) || budget < 0) {
                    errors.push('Budget offering must be a positive number');
                }
            }
            
            if (program.budget_finance_closure_realisasi_penyerapan) {
                const penyerapan = program.budget_finance_closure_realisasi_penyerapan.replace('%', '');
                const num = parseFloat(penyerapan);
                if (isNaN(num) || num < 0 || num > 100) {
                    errors.push('Realisasi penyerapan must be between 0-100%');
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

    getProgramFinancialSummary(programs) {
        if (!programs || programs.length === 0) return null;
        
        return {
            total_budget_offering: programs.reduce((sum, p) => sum + (p.budget_offering || 0), 0),
            total_budget_finance_closure: programs.reduce((sum, p) => sum + (p.budget_finance_closure || 0), 0),
            total_margin_real: programs.reduce((sum, p) => sum + (p.margin_real_margin || 0), 0),
            average_participants: Math.round(programs.reduce((sum, p) => sum + (p.participant || 0), 0) / programs.length),
            programs_by_area: {
                lokal: programs.filter(p => p.area === 'Lokal').length,
                nasional: programs.filter(p => p.area === 'Nasional').length,
                internasional: programs.filter(p => p.area === 'Internasional').length
            }
        };
    }
}

export default new ProgramService()