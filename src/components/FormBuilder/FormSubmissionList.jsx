import React, { useState, useEffect} from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Loader2, Users, ChevronRight, Calendar, ChevronLeft, Download, FileSpreadsheet, Search, X } from 'lucide-react';
import formTemplateService from '../../services/formTemplateService';
import formSubmissionService from '../../services/formSubmissionService';
import * as XLSX from 'xlsx';

const FormSubmissionsList = () => {
    const [templates, setTemplates] = useState([]);
    const [selectedProgram, setSelectedProgram] = useState(null);
    const [submissions, setSubmissions] = useState([]);
    const [loadingTemplates, setLoadingTemplates] = useState(true);
    const [loadingSubmissions, setLoadingSubmissions] = useState(false);
    const [programStats, setProgramStats] = useState({});
    const [exporting, setExporting] = useState(false);
    const [setFilters] = useState({
        category: '',
        gender: '',
        search: ''
    });
    const [allSubmissions, setAllSubmissions] = useState([]);
    
    const [searchProgram, setSearchProgram] = useState('');
    const [filteredTemplates, setFilteredTemplates] = useState([]);

    useEffect(() => {
        loadAllPrograms();
    }, []);

    useEffect(() => {
        if (searchProgram.trim() === '') {
            setFilteredTemplates(templates);
        } else {
            const searchTerm = searchProgram.toLowerCase();
            const filtered = templates.filter(template =>
                template.program_name.toLowerCase().includes(searchTerm) ||
                template.description?.toLowerCase().includes(searchTerm)
            );
            setFilteredTemplates(filtered);
        }
    }, [searchProgram, templates]);

    const loadAllPrograms = async () => {
        try {
            setLoadingTemplates(true);
            const response = await formTemplateService.getAllFormTemplatesForSubmission();
            const templatesData = response.data || [];

            setTemplates(templatesData);
            setFilteredTemplates(templatesData);
            
            
            const programNames = templatesData.map(t => t.program_name)
            if (programNames.length > 0) {
                const stats = await formSubmissionService.getMultipleProgramStats(programNames)
                setProgramStats(stats.data || {})
            }
        } catch (error) {
            console.error('Error loading programs:', error);
        } finally {
            setLoadingTemplates(false);
        }
    };

    const handleSelectProgram = async (programName) => {
        try {
            setSelectedProgram(programName);
            setLoadingSubmissions(true);
            setFilters({ category: '', gender: '', search: '' });

            const response = await formSubmissionService.getSubmissionByProgram(programName, {
                limit: 1000,
                showAllOnSearch: 'true'
            });
            
            if (response.success === false) {
                console.error('[Component] API error:', response.message);
                setSubmissions([]);
                setAllSubmissions([]);
            } else {
                const data = response.data || [];
                setSubmissions(data);
                setAllSubmissions(data);
            }
            
        } catch (error) {
            console.error('[Component] Error:', error);
            setSubmissions([]);
            setAllSubmissions([]);
        } finally {
            setLoadingSubmissions(false);
        }
    };

    const formatDataForExcel = (data, programName) => {
        const baseColumns = [
            { key: 'no', label: 'No', width: 5 },
            { key: 'full_name', label: 'Nama Lengkap', width: 25 },
            { key: 'email', label: 'Email', width: 30 },
            { key: 'phone', label: 'Nomor Telepon', width: 15 },
            { key: 'nik', label: 'NIK', width: 20 },
            { key: 'gender', label: 'Jenis Kelamin', width: 12 },
            { key: 'date_of_birth', label: 'Tanggal Lahir', width: 12 },
            { key: 'age', label: 'Usia', width: 6 },
            { key: 'education', label: 'Pendidikan', width: 20 },
            { key: 'disability_status', label: 'Status Disabilitas', width: 15 },
            { key: 'category', label: 'Kategori', width: 15 },
            { key: 'program', label: 'Program', width: 30 },
            { key: 'reason_join_program', label: 'Alasan Bergabung', width: 40 },
            
            { key: 'address', label: 'Alamat Lengkap', width: 40 },
            { key: 'province_name', label: 'Provinsi', width: 20 },
            { key: 'regency_name', label: 'Kota/Kabupaten', width: 20 },
            { key: 'district', label: 'Kecamatan', width: 20 },
            { key: 'village', label: 'Kelurahan/Desa', width: 20 },
            { key: 'postal_code', label: 'Kode Pos', width: 10 },
            
            { key: 'created_at', label: 'Tanggal Pendaftaran', width: 15 },
            { key: 'updated_at', label: 'Tanggal Diperbarui', width: 15 },
            { key: 'status', label: 'Status', width: 12 }
        ];
        
        const umkmColumns = [
            { key: 'business_name', label: 'Nama Usaha', width: 25 },
            { key: 'business_type', label: 'Jenis Usaha', width: 20 },
            { key: 'business_address', label: 'Alamat Usaha', width: 40 },
            { key: 'business_form', label: 'Bentuk Usaha', width: 15 },
            { key: 'established_year', label: 'Tahun Berdiri', width: 12 },
            { key: 'monthly_revenue', label: 'Pendapatan Bulanan', width: 15 },
            { key: 'employee_count', label: 'Jumlah Karyawan', width: 10 },
            { key: 'certifications', label: 'Sertifikasi', width: 30 },
            { key: 'social_media', label: 'Media Sosial', width: 40 },
            { key: 'marketplace', label: 'Marketplace', width: 40 },
            { key: 'website', label: 'Website', width: 30 }
        ];
        
        const mahasiswaColumns = [
            { key: 'institution', label: 'Institusi', width: 25 },
            { key: 'major', label: 'Jurusan', width: 25 },
            { key: 'semester', label: 'Semester', width: 8 },
            { key: 'enrollment_year', label: 'Tahun Masuk', width: 12 },
            { key: 'career_interest', label: 'Minat Karir', width: 30 },
            { key: 'core_competency', label: 'Kompetensi Inti', width: 30 }
        ];
        
        const profesionalColumns = [
            { key: 'workplace', label: 'Tempat Kerja', width: 25 },
            { key: 'position', label: 'Posisi', width: 20 },
            { key: 'work_duration', label: 'Lama Bekerja', width: 12 },
            { key: 'industry_sector', label: 'Sektor Industri', width: 20 },
            { key: 'skills', label: 'Keahlian', width: 40 }
        ];
        
        const komunitasColumns = [
            { key: 'community_name', label: 'Nama Komunitas', width: 25 },
            { key: 'focus_area', label: 'Bidang Fokus', width: 30 },
            { key: 'member_count', label: 'Jumlah Anggota', width: 10 },
            { key: 'operational_area', label: 'Area Operasional', width: 15 },
            { key: 'community_role', label: 'Peran dalam Komunitas', width: 20 }
        ];
        
        const umumColumns = [
            { key: 'areas_interest', label: 'Bidang Minat', width: 30 },
            { key: 'background', label: 'Latar Belakang', width: 40 },
            { key: 'experience_level', label: 'Tingkat Pengalaman', width: 15 }
        ];
    
        const formattedData = data.map((item, index) => {
            let age = '';
            if (item.date_of_birth) {
                try {
                    const birthDate = new Date(item.date_of_birth);
                    if (!isNaN(birthDate.getTime())) {
                        const today = new Date();
                        age = today.getFullYear() - birthDate.getFullYear();
                        
                        const monthDiff = today.getMonth() - birthDate.getMonth();
                        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                            age--;
                        }
                    }
                } catch (e) {
                    console.error('Error calculating age:', e);
                }
            }
            
            const formatDateForExcel = (dateString) => {
                if (!dateString) return '';
                try {
                    const date = new Date(dateString);
                    if (isNaN(date.getTime())) return dateString;
                    return date.toLocaleDateString('id-ID', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                    });
                } catch {
                    return dateString;
                }
            };
            
            const formatArrayField = (field) => {
                if (!field) return '';
                if (Array.isArray(field)) {
                    return field.join(', ');
                }
                if (typeof field === 'string') {
                    try {
                        const parsed = JSON.parse(field);
                        if (Array.isArray(parsed)) {
                            return parsed.join(', ');
                        }
                    } catch {
                        // 
                    }
                    return field;
                }
                return String(field);
            };
            
            const formatCurrency = (value) => {
                if (!value) return '';
                const num = Number(value);
                if (isNaN(num)) return value;
                return num.toLocaleString('id-ID');
            };
            
            const baseData = {
                no: index + 1,
                full_name: item.full_name || '',
                email: item.email || '',
                phone: item.phone || '',
                nik: item.nik || '',
                gender: item.gender || '',
                date_of_birth: formatDateForExcel(item.date_of_birth),
                age: age || '',
                education: item.education || '',
                disability_status: item.disability_status || '',
                category: item.category || '',
                program: programName,
                reason_join_program: item.reason_join_program || '',
                
                address: item.address || '',
                province_name: item.province_name || '',
                regency_name: item.regency_name || '',
                district_name: item.district_name || item.kecamatan || '',
                village_name: item.village_name || item.kelurahan || '',
                postal_code: item.postal_code || '',
                
                created_at: formatDateForExcel(item.created_at),
                updated_at: formatDateForExcel(item.updated_at),
                status: item.status || 'Aktif'
            };
            
            const category = item.category?.toLowerCase() || '';
            let categorySpecificData = {};
            
            if (category.includes('umkm')) {
                categorySpecificData = {
                    business_name: item.business_name || '',
                    business_type: item.business_type || '',
                    business_address: item.business_address || '',
                    business_form: item.business_form || '',
                    established_year: item.established_year || '',
                    monthly_revenue: formatCurrency(item.monthly_revenue),
                    employee_count: item.employee_count || '',
                    certifications: formatArrayField(item.certifications),
                    social_media: formatArrayField(item.social_media),
                    marketplace: formatArrayField(item.marketplace),
                    website: formatArrayField(item.website)
                };
            } 
            else if (category.includes('mahasiswa')) {
                categorySpecificData = {
                    institution: item.institution || '',
                    major: item.major || '',
                    semester: item.semester || '',
                    enrollment_year: item.enrollment_year || '',
                    career_interest: item.career_interest || '',
                    core_competency: item.core_competency || ''
                };
            } 
            else if (category.includes('profesional')) {
                categorySpecificData = {
                    workplace: item.workplace || '',
                    position: item.position || '',
                    work_duration: item.work_duration || '',
                    industry_sector: item.industry_sector || '',
                    skills: formatArrayField(item.skills)
                };
            } 
            else if (category.includes('komunitas')) {
                categorySpecificData = {
                    community_name: item.community_name || '',
                    focus_area: item.focus_area || '',
                    member_count: item.member_count || '',
                    operational_area: item.operational_area || '',
                    community_role: item.community_role || ''
                };
            } 
            else if (category.includes('umum')) {
                categorySpecificData = {
                    areas_interest: item.areas_interest || '',
                    background: item.background || item.backgorund || '',
                    experience_level: item.experience_level || ''
                };
            }
            
            return {
                ...baseData,
                ...categorySpecificData
            };
        });
    
        const categorizedData = {
            all: formattedData,
            umkm: formattedData.filter(item => item.category?.toLowerCase().includes('umkm')),
            mahasiswa: formattedData.filter(item => item.category?.toLowerCase().includes('mahasiswa')),
            profesional: formattedData.filter(item => item.category?.toLowerCase().includes('profesional')),
            komunitas: formattedData.filter(item => item.category?.toLowerCase().includes('komunitas')),
            umum: formattedData.filter(item => {
                const cat = item.category?.toLowerCase();
                return cat && !cat.includes('umkm') && !cat.includes('mahasiswa') && 
                       !cat.includes('profesional') && !cat.includes('komunitas');
            })
        };
        
        return {
            data: formattedData,
            columns: [...baseColumns, ...umkmColumns, ...mahasiswaColumns, ...profesionalColumns, ...komunitasColumns, ...umumColumns],
            categorizedData
        };
    };

    const applyExcelStyling = (worksheet) => {
        const range = XLSX.utils.decode_range(worksheet['!ref']);
        worksheet['!autofilter'] = { ref: XLSX.utils.encode_range(range) };
        
        for (let C = range.s.c; C <= range.e.c; ++C) {
            const address = XLSX.utils.encode_cell({ r: 0, c: C });
            if (!worksheet[address]) continue;
            
            worksheet[address].s = {
                fill: { fgColor: { rgb: "FF4F81B4" } },
                font: { color: { rgb: "FFFFFFFF" }, bold: true },
                alignment: { vertical: "center", horizontal: "center", wrapText: true },
                border: {
                    top: { style: "thin", color: { rgb: "FF000000" } },
                    bottom: { style: "thin", color: { rgb: "FF000000" } },
                    left: { style: "thin", color: { rgb: "FF000000" } },
                    right: { style: "thin", color: { rgb: "FF000000" } }
                }
            };
        }
        
        for (let R = 1; R <= range.e.r; ++R) {
            for (let C = range.s.c; C <= range.e.c; ++C) {
                const address = XLSX.utils.encode_cell({ r: R, c: C });
                if (!worksheet[address]) continue;
                
                const isEvenRow = R % 2 === 0;
                worksheet[address].s = {
                    fill: { fgColor: { rgb: isEvenRow ? "FFF0F0F0" : "FFFFFFFF" } },
                    alignment: { vertical: "center", wrapText: true },
                    border: {
                        bottom: { style: "thin", color: { rgb: "FFDDDDDD" } },
                        right: { style: "thin", color: { rgb: "FFDDDDDD" } }
                    }
                };
            }
        }
    };

    const getColumnsByCategory = (categoryKey) => {
        const baseColumns = [
            { key: 'no', label: 'No', width: 5 },
            { key: 'full_name', label: 'Nama Lengkap', width: 25 },
            { key: 'email', label: 'Email', width: 30 },
            { key: 'phone', label: 'Nomor Telepon', width: 15 },
            { key: 'nik', label: 'NIK', width: 20 },
            { key: 'gender', label: 'Jenis Kelamin', width: 12 },
            { key: 'date_of_birth', label: 'Tanggal Lahir', width: 12 },
            { key: 'age', label: 'Usia', width: 6 },
            { key: 'education', label: 'Pendidikan', width: 20 },
            { key: 'disability_status', label: 'Status Disabilitas', width: 15 },
            { key: 'category', label: 'Kategori', width: 15 },
            { key: 'program', label: 'Program', width: 30 },
            { key: 'reason_join_program', label: 'Alasan Bergabung', width: 40 },
            { key: 'address', label: 'Alamat', width: 40 },
            { key: 'province_name', label: 'Provinsi', width: 30 },
            { key: 'regency_name', label: 'Kabupaten/Kota', width: 30 },
            { key: 'district_name', label: 'Kecamatan', width: 30 },
            { key: 'village_name', label: 'Kelurahan', width: 30 },
        ];
        
        switch (categoryKey) {
            case 'umkm':
                return [
                    ...baseColumns,
                    { key: 'business_name', label: 'Nama Usaha', width: 25 },
                    { key: 'business_type', label: 'Jenis Usaha', width: 20 },
                    { key: 'business_address', label: 'Alamat Usaha', width: 40 },
                    { key: 'business_form', label: 'Bentuk Usaha', width: 15 },
                    { key: 'established_year', label: 'Tahun Berdiri', width: 12 },
                    { key: 'monthly_revenue', label: 'Pendapatan Bulanan', width: 15 },
                    { key: 'employee_count', label: 'Jumlah Karyawan', width: 10 },
                    { key: 'certifications', label: 'Sertifikasi', width: 30 },
                    { key: 'social_media', label: 'Sosial Media', width: 30 },
                    { key: 'marketplace', label: 'Marketplace', width: 30 },
                    { key: 'website', label: 'Website', width: 30 },
                ];
            case 'mahasiswa':
                return [
                    ...baseColumns,
                    { key: 'institution', label: 'Institusi', width: 25 },
                    { key: 'major', label: 'Jurusan', width: 25 },
                    { key: 'semester', label: 'Semester', width: 8 },
                    { key: 'enrollment_year', label: 'Tahun Masuk', width: 12 },
                    { key: 'career_interest', label: 'Minat Karir', width: 30 }
                ];
            case 'profesional':
                return [
                    ...baseColumns,
                    { key: 'workplace', label: 'Tempat Kerja', width: 25 },
                    { key: 'position', label: 'Posisi', width: 20 },
                    { key: 'work_duration', label: 'Lama Bekerja', width: 12 },
                    { key: 'industry_sector', label: 'Sektor Industri', width: 20 },
                    { key: 'skills', label: 'Keahlian', width: 40 }
                ];
            case 'komunitas':
                return [
                    ...baseColumns,
                    { key: 'community_name', label: 'Nama Komunitas', width: 25 },
                    { key: 'focus_area', label: 'Bidang Fokus', width: 30 },
                    { key: 'member_count', label: 'Jumlah Anggota', width: 10 },
                    { key: 'operational_area', label: 'Area Operasional', width: 15 },
                    { key: 'community_role', label: 'Peran dalam Komunitas', width: 20 }
                ];
            case 'umum':
                return [
                    ...baseColumns,
                    { key: 'areas_interest', label: 'Bidang Minat', width: 30 },
                    { key: 'background', label: 'Latar Belakang', width: 40 },
                    { key: 'experience_level', label: 'Tingkat Pengalaman', width: 15 }
                ];
            default:
                return baseColumns;
        }
    };

    const exportSingleSheet = async (data, programName) => {
        const formattedData = formatDataForExcel(data, programName);
        
        const worksheet = XLSX.utils.json_to_sheet(formattedData.data);
        
        const colWidths = formattedData.columns.map(col => ({
            wch: col.width || 15
        }));
        worksheet['!cols'] = colWidths;
        
        applyExcelStyling(worksheet);
        
        const workbook = XLSX.utils.book_new();
        const sheetName = programName.length > 31 
            ? programName.substring(0, 28) + '...' 
            : programName;
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
        
        const timestamp = new Date().toISOString().split('T')[0].replace(/-/g, '');
        const sanitizedProgramName = programName
            .replace(/[^a-z0-9]/gi, '_')
            .substring(0, 50);
        const filename = `Data_Peserta_${sanitizedProgramName}_${timestamp}.xlsx`;
        
        XLSX.writeFile(workbook, filename);
    };

    const exportMultipleSheets = async (data, programName) => {
        const formattedData = formatDataForExcel(data, programName);
        const workbook = XLSX.utils.book_new();
        
        const allWorksheet = XLSX.utils.json_to_sheet(formattedData.data);
        const colWidths = formattedData.columns.map(col => ({
            wch: col.width || 15
        }));
        allWorksheet['!cols'] = colWidths;
        applyExcelStyling(allWorksheet);
        XLSX.utils.book_append_sheet(workbook, allWorksheet, 'Semua Data');
        
        const categories = [
            { key: 'umkm', label: 'UMKM', dept: 'Sales & Marketing' },
            { key: 'mahasiswa', label: 'Mahasiswa', dept: 'University Relations' },
            { key: 'profesional', label: 'Profesional', dept: 'HR & Recruitment' },
            { key: 'komunitas', label: 'Komunitas', dept: 'CSR & Community' },
            { key: 'umum', label: 'Umum', dept: 'Public Relations' }
        ];
        
        categories.forEach(category => {
            const categoryData = formattedData.categorizedData[category.key];
            if (categoryData && categoryData.length > 0) {
                const categoryColumns = getColumnsByCategory(category.key);
                const filteredData = categoryData.map(item => {
                    const row = {};
                    categoryColumns.forEach(col => {
                        const value = item[col.key];
                        row[col.label] = value !== undefined ? value : '';
                    });
                    return row;
                });
                
                const worksheet = XLSX.utils.json_to_sheet(filteredData);
                const catColWidths = categoryColumns.map(col => ({
                    wch: col.width || 15
                }));
                worksheet['!cols'] = catColWidths;
                applyExcelStyling(worksheet);
                XLSX.utils.book_append_sheet(workbook, worksheet, category.label);
            }
        });
        
        const timestamp = new Date().toISOString().split('T')[0].replace(/-/g, '');
        const sanitizedProgramName = programName
            .replace(/[^a-z0-9]/gi, '_')
            .substring(0, 40);
        const filename = `Laporan_Peserta_${sanitizedProgramName}_${timestamp}.xlsx`;
        
        XLSX.writeFile(workbook, filename);
    };

    const handleExportProgram = async (programName, exportFromList = false, isMultipleSheets = true) => {
        try {
            setExporting(true);
            
            let dataToExport;
            
            if (exportFromList) {
                const response = await formSubmissionService.getSubmissionByProgram(programName, {
                    limit: 10000,
                    showAllOnSearch: 'true'
                });
                
                if (response.success === false) {
                    throw new Error(response.message || 'Gagal mengambil data');
                }
                
                dataToExport = response.data || [];
            } else {
                dataToExport = allSubmissions;
            }
            
            if (dataToExport.length === 0) {
                alert('Tidak ada data untuk diexport');
                return;
            }

            if (isMultipleSheets) {
                await exportMultipleSheets(dataToExport, programName);
            } else {
                await exportSingleSheet(dataToExport, programName);
            }
            
        } catch (error) {
            console.error('Error exporting to Excel:', error);
            alert(`Terjadi kesalahan: ${error.message}`);
        } finally {
            setExporting(false);
        }
    };

    const handleExportCurrentProgramMultiple = () => {
        if (!selectedProgram) return;
        handleExportProgram(selectedProgram, false, true); 
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const clearSearch = () => {
        setSearchProgram('');
    };

    if (!selectedProgram) {
        return (
            <div className="space-y-4">
                <Card>
                    <CardHeader>
                        <div className='flex justify-between'>
                            <div>
                                <CardTitle className="flex p-2 items-center gap-2">
                                    <Users className="h-5 w-5" />
                                    Daftar Program
                                </CardTitle>
                                <CardDescription>
                                    Pilih program untuk melihat data pengisian form
                                </CardDescription>
                            </div>

                            <div className='p-2'>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search Program Name..."
                                        value={searchProgram}
                                        onChange={(e) => setSearchProgram(e.target.value)}
                                        className="pl-10 pr-10 py-1 border border-gray-300 rounded-lg placeholder:text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                    {searchProgram && (
                                        <button
                                            onClick={clearSearch}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                                <div className="mt-2 text-sm text-gray-500 flex justify-between">
                                    {searchProgram && (
                                        <button
                                            onClick={clearSearch}
                                            className="text-blue-600 hover:text-blue-800 text-sm"
                                        >
                                            Clear search
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {/* Search Bar */}
                        

                        {loadingTemplates ? (
                            <div className="flex items-center justify-center h-40 text-blue-600">
                                <Loader2 className="h-8 w-8 animate-spin" />
                                <span className="ml-2">Memuat daftar program...</span>
                            </div>
                        ) : filteredTemplates.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                {searchProgram ? (
                                    <>
                                        <Search className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                                        <p>Tidak ada program yang cocok dengan "{searchProgram}"</p>
                                        <p className="text-sm mt-1">Coba dengan kata kunci lain</p>
                                        <Button 
                                            variant="outline" 
                                            className="mt-4"
                                            onClick={clearSearch}
                                        >
                                            Tampilkan Semua Program
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <Users className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                                        <p>Belum ada program yang published</p>
                                        <p className="text-sm mt-1">Publish form terlebih dahulu di tab "Form Builder"</p>
                                    </>
                                )}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {filteredTemplates.map((template) => (
                                    <Card 
                                        key={template.id}
                                        className="cursor-pointer hover:shadow-md transition-shadow hover:border-blue-300"
                                        onClick={() => handleSelectProgram(template.program_name)}
                                    >
                                        <CardContent className="pt-6">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h4 className="font-semibold text-lg text-gray-800">{template.program_name}</h4>
                                                    <p className="text-sm text-gray-500 mt-1 flex items-center">
                                                        <Calendar className="h-3 w-3 inline mr-1" />
                                                        Dibuat: {formatDate(template.created_at)}
                                                    </p>
                                                </div>
                                                <ChevronRight className="h-5 w-5 text-gray-400" />
                                            </div>
                                            
                                            <div className="mt-4 flex items-center justify-between">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <Users className="h-4 w-4 text-blue-500" />
                                                        <span className="text-sm">
                                                            Total Pendaftar: 
                                                            <span className="font-bold ml-1">
                                                                {programStats[template.program_name]?.count || 0}
                                                            </span>
                                                        </span>
                                                    </div>
                                                </div>
                                                
                                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                                    {template.is_published ? 'Published' : 'Draft'}
                                                </Badge>
                                            </div>
                                            
                                            <div className="flex gap-2 mt-4">
                                                <Button 
                                                    variant="ghost" 
                                                    size="sm" 
                                                    className="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-700"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleSelectProgram(template.program_name);
                                                    }}
                                                >
                                                    Lihat Data
                                                </Button>
                                                <Button 
                                                    variant="ghost" 
                                                    size="sm" 
                                                    className="bg-green-100 hover:bg-green-200 text-green-700"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleExportProgram(template.program_name, true, true);
                                                    }}
                                                    disabled={exporting || (programStats[template.program_name]?.count || 0) === 0}
                                                    title="Export ke Excel (Multiple Sheets)"
                                                >
                                                    {exporting ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <Download className="h-4 w-4" />
                                                    )}
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <Card>
                <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedProgram(null)}
                                className="flex items-center gap-2"
                            >
                                <ChevronLeft className='h-4 w-4' />
                                Kembali
                            </Button>
                            <div>
                                <h2 className="text-lg font-bold">{selectedProgram}</h2>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button 
                                onClick={handleExportCurrentProgramMultiple}
                                disabled={exporting || submissions.length === 0}
                                size='sm'
                                className="bg-green-600 hover:bg-green-700 flex items-center text-white"
                            >
                                {exporting ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Exporting...
                                    </>
                                ) : (
                                    <>
                                        <FileSpreadsheet className="h-4 w-4" />
                                        Export
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* Info export */}
                    {exporting && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                            <div className="flex items-center gap-3">
                                <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
                                <div>
                                    <p className="text-sm font-medium text-blue-800">Sedang memproses export...</p>
                                    <p className="text-xs text-blue-600">Silakan tunggu, file Excel akan otomatis terdownload</p>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardContent className="pt-6">
                    {loadingSubmissions ? (
                        <div className="flex items-center justify-center h-40">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                            <span className="ml-2 text-gray-600">Memuat data pendaftar...</span>
                        </div>
                    ) : submissions.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <Users className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                            <p>Belum ada data pendaftar untuk program ini</p>
                            <p className="text-sm mt-1">
                                Form: /register/{selectedProgram.toLowerCase().replace(/\s+/g, '-')}
                            </p>
                            <Button 
                                variant="outline" 
                                className="mt-4"
                                onClick={() => window.open(`/register/${selectedProgram.toLowerCase().replace(/\s+/g, '-')}`, '_blank')}
                            >
                                Buka Form Pendaftaran
                            </Button>
                        </div>
                    ) : (
                        <div className="rounded-md border overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-gray-50">
                                        <TableHead className="font-semibold">No</TableHead>
                                        <TableHead className="font-semibold">Nama Lengkap</TableHead>
                                        <TableHead className="font-semibold">Email</TableHead>
                                        <TableHead className="font-semibold">Telepon</TableHead>
                                        <TableHead className="font-semibold">Kategori</TableHead>
                                        <TableHead className="font-semibold">Tanggal Daftar</TableHead>
                                        <TableHead className="font-semibold">Kota</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {submissions.map((submission, index) => (
                                        <TableRow key={submission.id} className="hover:bg-gray-50">
                                            <TableCell className="font-medium">{index + 1}</TableCell>
                                            <TableCell className="font-medium">
                                                {submission.full_name}
                                            </TableCell>
                                            <TableCell className="text-blue-600">{submission.email}</TableCell>
                                            <TableCell>{submission.phone}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={
                                                    submission.category === 'UMKM' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                                                    submission.category === 'Mahasiswa' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                    submission.category === 'Profesional' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                                    submission.category === 'Komunitas' ? 'bg-green-50 text-green-700 border-green-200' :
                                                    'bg-gray-50 text-gray-700 border-gray-200'
                                                }>
                                                    {submission.category}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{formatDate(submission.created_at)}</TableCell>
                                            <TableCell>{submission.regency_name}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default FormSubmissionsList;