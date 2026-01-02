import * as XLSX from 'xlsx';

export const getBusinessDisplayName = (businessValue) => {
    if (!businessValue) return '-';
    if (typeof businessValue === 'string') return businessValue;
    if (Array.isArray(businessValue)) return businessValue.join(', ');
    return String(businessValue);
};

export const validateExcelFile = (file) => {
    const errors = [];
    
    const validExtensions = ['.xlsx', '.xls'];
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    
    if (!validExtensions.includes(fileExtension)) {
        errors.push('File harus berformat Excel (.xlsx atau .xls)');
    }
    
    if (file.size > 10 * 1024 * 1024) {
        errors.push('File terlalu besar. Maksimal 10MB');
    }
    
    const validTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        'application/excel',
        'application/x-excel',
        'application/x-msexcel'
    ];
    
    if (!validTypes.includes(file.type) && file.type !== '') {
        errors.push('Tipe file tidak valid. Hanya file Excel yang diperbolehkan');
    }
    
    return errors;
};

export const validateRowData = (row, rowIndex) => {
    const errors = [];

    const fullNameValue = row.full_name
    const emailValue = row.email
    
    if (!fullNameValue || fullNameValue.toString().trim() === '') {
        errors.push(`Baris ${rowIndex}: Kolom "Full Name" wajib diisi`);
    }
    
    if (!emailValue || emailValue.toString().trim() === '') {
        errors.push(`Baris ${rowIndex}: Kolom "Email" wajib diisi`);
    }
    
    if (row.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(row.email.toString())) {
            errors.push(`Baris ${rowIndex}: Format email tidak valid`);
        }
    }
    
    return errors;
};

export const parseExcelData = (data) => {
    try {
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
        
        if (jsonData.length === 0) {
            throw new Error('File Excel tidak berisi data');
        }
        
        const headers = Object.keys(jsonData[0]).map(h => h.trim());

        const headerMapping = {
            'Full Name': 'full_name',
            'Email': 'email',
            'Phone': 'phone',
            'Gender': 'gender',
            'Company': 'company',
            'Position': 'position',
            'Total Employee': 'total_employee',
            'Business': 'business',
            'Program Name': 'program_name',
            'Status': 'status',
            'Address': 'address',
            'Notes': 'notes',
            'Join Date': 'join_date',

            'full_name': 'full_name',
            'email': 'email',
            'phone': 'phone',
            'gender': 'gender',
            'company': 'company',
            'position': 'position',
            'total_employee': 'total_employee',
            'business': 'business',
            'program_name': 'program_name',
            'status': 'status',
            'address': 'address',
            'notes': 'notes',
            'join_date': 'join_date'
        }
        
        const dataRows = [];
        const errors = [];
        
        jsonData.forEach((row, index) => {
            try {
                const cleanRow = {};
                headers.forEach(header => {
                    const value = row[header];
                    const cleanValue = value !== undefined && value !== null ? 
                        (typeof value === 'string' ? value.trim() : value.toString().trim()) : '';

                    const normalizedHeader = headerMapping[header] || header
                    cleanRow[normalizedHeader] = cleanValue
                });
                
                if (Object.values(cleanRow).some(value => 
                    value.toString().toLowerCase().includes('contoh')
                )) {
                    return;
                }
                
                if (Object.values(cleanRow).every(value => value === '')) {
                    return;
                }
                
                const rowErrors = validateRowData(cleanRow, index + 1);
                if (rowErrors.length > 0) {
                    errors.push(...rowErrors);
                    return;
                }
                
                dataRows.push(cleanRow);
            } catch (error) {
                errors.push(`Baris ${index + 1}: ${error.message}`);
            }
        });
        
        return { data: dataRows, errors, headers };
    } catch (error) {
        throw new Error(`Gagal membaca file Excel: ${error.message}`);
    }
};

export const exportToExcel = async (currentFilters = {}, format = 'excel', getBusinessDisplayName) => {
    try {
        const params = new URLSearchParams()

        if (currentFilters.search?.trim()) {
            params.append('search', currentFilters.search.trim())
        }

        if (currentFilters.status?.trim() && currentFilters.status !== 'all') {
            params.append('status', currentFilters.status.trim())
        }

        if (currentFilters.business?.trim() && currentFilters.business !== 'all') {
            params.append('business_type', currentFilters.business.trim())
        }

        const url = `/api/client/export?${params.toString()}`

        const response = await fetch(url)

        if (!response.ok) {
            throw new Error(`Failed to fetch data: ${response.status}`)
        }

        const result = await response.json()

        const members = result.data || []

        if (!members || members.length === 0) {
            throw new Error('No data to export')
        }

        const exportData = members.map((client, index) => ({
            'No': index + 1,
            'Full Name': client.full_name || '-',
            'Email': client.email || '-',
            'Phone': client.phone || '-',
            'Gender': client.gender || '-',
            'Company': client.company || '-',
            'Position': client.position || '-',
            'Total Employee': client.total_employee || '-',
            'Business Type': getBusinessDisplayName(client.business) || '-',
            'Program Name': client.program_name || '-',
            'Status': client.status || '-',
            'Address': client.address || '-',
            'Join Date': client.join_date || '-',
            'Notes': client.notes || '-',
            'Created Date': client.created_at 
            ? new Date(client.created_at).toLocaleDateString() 
            : '-',
            'Last Updated': client.updated_at 
            ? new Date(client.updated_at).toLocaleDateString() 
            : '-'
        }));

        if (format === 'excel') {
            const ws = XLSX.utils.json_to_sheet(exportData);
            
            const wscols = [
            { wch: 5 },
            { wch: 25 },
            { wch: 30 },
            { wch: 15 },
            { wch: 30 },
            { wch: 20 },
            { wch: 25 },
            { wch: 10 },
            { wch: 40 },
            { wch: 40 },
            { wch: 12 },
            { wch: 12 }
            ];
            ws['!cols'] = wscols;
            
            const range = XLSX.utils.decode_range(ws['!ref']);
            for (let C = range.s.c; C <= range.e.c; ++C) {
                const cell_address = { c: C, r: 0 };
                const cell_ref = XLSX.utils.encode_cell(cell_address);
                if (!ws[cell_ref]) continue;
                ws[cell_ref].s = {
                    font: { bold: true },
                    fill: { fgColor: { rgb: "E0E0E0" } }
                };
            }
            
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Clients");
            
            const dateStr = new Date().toISOString().split('T')[0];
            const fileName = `clients_export_${dateStr}.xlsx`;
            
            XLSX.writeFile(wb, fileName);
            
            return `Exported ${exportData.length} clients to Excel`;
        } else if (format === 'csv') {
            const csvContent = [
            Object.keys(exportData[0]).join(','),
            ...exportData.map(row => Object.values(row).join(','))
            ].join('\n');
            
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement("a");
            const url = URL.createObjectURL(blob);
            
            link.setAttribute("href", url);
            link.setAttribute("download", `clients_export_${new Date().getTime()}.csv`);
            link.style.visibility = 'hidden';
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            return `Exported ${exportData.length} clients to CSV`;
        }
    } catch (error) {
        console.error('Export error:', error);
        throw error;
    }
};

export const downloadTemplate = () => {
    const templateData = [
        {
            'Full Name': 'Contoh: John Doe',
            'Email': 'Contoh: john@example.com',
            'Phone': 'Contoh: 081234567890',
            'Gender': 'Contoh: Male',
            'Company': 'Contoh: PT. Contoh Indonesia',
            'Position': 'Contoh: CO-Founder',
            'Total Employee': 'Contoh: 50-100 employees',
            'Business': 'Contoh: Technology',
            'Program Name': 'Contoh: Program Premium',
            'Status': 'Contoh: Active',
            'Address': 'Contoh: Jl. Contoh No. 123',
            'Join Date': 'Contoh: 2024-01-15',
            'Notes': 'Contoh: Catatan tambahan'
        },
    ];
  
    const headers = Object.keys(templateData[0]);

    const exampleData = [
        {
            'Full Name': 'Contoh: Jonathan Ardi Wijaya',
            'Email': 'Contoh: jonathan.wijaya@auroratech.co.id',
            'Phone': 'Contoh: +62 812 3456 7890',
            'Gender': 'Contoh: Male',
            'Company': 'Contoh: Aurora Tech Solutions',
            'Position': 'Contoh: Head of Digital Transformation',
            'Total Employee': 'Contoh: 50-100 employees',
            'Business': 'Contoh: Technology',
            'Program Name': 'Contoh: Enterprise Digital Acceleration 2025',
            'Status': 'Contoh: Active',
            'Address': 'Contoh: Jl. Jenderal Sudirman No. 88, Jakarta',
            'Join Date': 'Contoh: 2025-12-30',
            'Notes': 'Contoh: Client focused on modernizing internal systems'
        }
    ]
  
    const wsData = [
        headers,
        ...exampleData.map(row => headers.map(header => row[header] || ''))
    ];
  
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    const columnWidths = [
        { wch: 25 }, 
        { wch: 30 }, 
        { wch: 20 }, 
        { wch: 10 }, 
        { wch: 25 },
        { wch: 25 }, 
        { wch: 20 },
        { wch: 20 }, 
        { wch: 35 },
        { wch: 15 }, 
        { wch: 40 }, 
        { wch: 15 }, 
        { wch: 40 } 
    ]
    ws['!cols'] = columnWidths
  
    const range = XLSX.utils.decode_range(ws['!ref'])
    for (let C = range.s.c; C <= range.e.c; ++C) {
        const cell_address = { c: C, r: 0 }
        const cell_ref = XLSX.utils.encode_cell(cell_address)
        if (ws[cell_ref]) {
            ws[cell_ref].s = {
                font: { bold: true, color: { rgb: 'FFFFFF' } },
                fill: { fgColor: { rgb: '4F46E5' } },
                alignment: { vertical: 'center', horizontal: 'center' }
            }
        }
    }

    for (let R = 1; R <= exampleData.length; R++) {
        for (let C = range.s.c; C <= range.e.c; ++C) {
            const cell_address = { c: C, r: R }
            const cell_ref = XLSX.utils.encode_cell(cell_address)
            if (ws[cell_ref]) {
                ws[cell_ref].s = {
                    fill: { fgColor: { rgb: 'F0F9FF' } },
                    font: { color: { rgb: '475569' } }
                }
            }
        }
    }
    
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    
    const fileName = `client_import_template_${new Date().toISOString().split('T')[0]}.xlsx`
    XLSX.writeFile(wb, fileName)
};

export const formatBusinessTypes = (members) => {
    if (!members || members.length === 0) return [];
    
    const allBusinessTypes = members
        .map(client => client.business)
        .filter(business => business && business.trim() !== "");
    
    const uniqueBusinessTypes = [...new Set(allBusinessTypes)].sort();
    
    return uniqueBusinessTypes.map(businessType => ({
        value: businessType.toLowerCase(),
        label: `${businessType}`,
        original: businessType
    }));
};

export const formatStatuses = (members) => {
    if (!members || members.length === 0) return [];
    
    const allStatuses = members
        .map(client => client.status)
        .filter(status => status && status.trim() !== "");
    
    const uniqueStatuses = [...new Set(allStatuses)].sort();
    
    return uniqueStatuses.map(status => ({
        value: status.toLowerCase(),
        label: status === 'active' ? 'Active' : status === 'inactive' ? 'Inactive' : `${status}`,
        original: status
    }));
};

export const countActiveFilters = (filters) => {
    let count = 0;
    if (filters.search) count++;
    if (filters.status) count++;
    if (filters.businessType) count++;
    return count;
};

export const formatMembersForTable = (members, pagination, isInShowAllMode, getBusinessDisplayName) => {
    return members.map((client, index) => {
        const currentPage = pagination.page;
        const itemsPerPage = pagination.limit;
        
        const itemNumber = isInShowAllMode 
        ? index + 1
        : (currentPage - 1) * itemsPerPage + index + 1;
        
        return {
            id: client.id,
            no: itemNumber,
            fullName: client.full_name,
            email: client.email,
            phone: client.phone,
            company: client.company,
            business: getBusinessDisplayName(client.business),
            programName: client.program_name,
            status: client.status,
            action: 'Detail',
            ...client
        };
    });
};