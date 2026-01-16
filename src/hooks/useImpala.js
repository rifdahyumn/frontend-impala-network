import impalaService from "../services/impalaService"
import { useState, useEffect, useCallback, useRef } from "react"
import toast from "react-hot-toast"
import { debounce } from 'lodash'
import { useConfirmDialog } from "./useConfirmDialog"
import * as XLSX from 'xlsx';

export const useImpala = (initialFilters = {}) => {
    const confirmDialog = useConfirmDialog()
    const [participant, setParticipant] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
        isShowAllMode: false,
        showingAllResults: false,
        searchTerm: ''
    })

    const [impalaStats, setImpalaStats] = useState(null)
    const [statsLoadingImpala, setStatsLoadingImpala] = useState(false)
    const [showAllOnSearch, setShowAllOnSearch] = useState(false)

    const filtersRef = useRef({
        search: '',
        gender: '',
        category: '',
        program: '',
        ...initialFilters
    })
    
    const abortControllerRef = useRef(null)
    const lastRequestIdRef = useRef(0) 
    
    const [filters, setFilters] = useState({
        search: filtersRef.current.search,
        gender: filtersRef.current.gender,
        category: filtersRef.current.category,
        program: filtersRef.current.program

    })

    const fetchImpala = useCallback(async (page = 1, customFilters = null, showAll = false, requestId = null) => {
        try {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort()
            }
            
            abortControllerRef.current = new AbortController()
            
            const currentRequestId = requestId || Date.now()
            lastRequestIdRef.current = currentRequestId
            
            setLoading(true)
            setError(null)

            const currentFilters = customFilters || filtersRef.current

            const params = {
                page,
                limit: pagination.limit,
                ...(currentFilters.search && { search: currentFilters.search }),
                ...(currentFilters.gender && { gender: currentFilters.gender }),
                ...(currentFilters.category && { category: currentFilters.category }),
                ...(currentFilters.program && currentFilters.program !== 'all' && { program: currentFilters.program }),
                ...(currentFilters.search && showAll && { showAllOnSearch: 'true' })
            }

            const result = await impalaService.fetchImpala(params)

            setParticipant(result.data || [])
            
            const paginationData = result.metadata?.metadata?.pagination || {}
            setPagination(prev => ({
                ...prev,
                page: paginationData.page || page,
                limit: paginationData.limit || pagination.limit,
                total: paginationData.total || 0,
                totalPages: paginationData.totalPages || 0,
                isShowAllMode: paginationData.isShowAllMode || false,
                showingAllResults: paginationData.showingAllResults || false,
                searchTerm: currentFilters.search || ''
            }))

            

            if (currentFilters.search && paginationData.showingAllResults) {
                setShowAllOnSearch(true)
            } else if (!currentFilters.search) {
                setShowAllOnSearch(false)
            }

        } catch (error) {
            if (error.name === 'AbortError') {
                return
            }
            
            console.error('Error fetching participants:', error)
            setError(error.message)
            toast.error('Failed to load participants')
        } finally {
            setLoading(false)
        }
    }, [pagination.limit])

    const debouncedFetchRef = useRef(
        debounce((page, customFilters, showAll) => {
            const requestId = Date.now()
            fetchImpala(page, customFilters, showAll, requestId)
        }, 500)
    )

    useEffect(() => {
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort()
            }
            
            if (debouncedFetchRef.current) {
                debouncedFetchRef.current.cancel()
            }
        }
    }, [])

    const updateFiltersAndFetch = useCallback((newFilters, showAll = false) => {
        const updatedFilters = {
            ...filtersRef.current,
            ...newFilters
        };
        
        filtersRef.current = updatedFilters;
        
        setFilters(prev => ({
            ...prev,
            search: updatedFilters.search,
            gender: updatedFilters.gender,
            category: updatedFilters.category,
            program: updatedFilters.program
        }));
        
        if (!newFilters.search && showAllOnSearch) {
            setShowAllOnSearch(false);
        }
        
        if (debouncedFetchRef.current) {
            debouncedFetchRef.current(1, updatedFilters, showAll);
        } else {
            console.error('debouncedFetchRef.current is null!');
        }
    }, [showAllOnSearch]);

    const toggleShowAllOnSearch = useCallback((value) => {
        setShowAllOnSearch(value)
        
        if (filtersRef.current.search) {
            if (debouncedFetchRef.current) {
                debouncedFetchRef.current(1, filtersRef.current, value)
            }
        }
    }, [])

    const clearFilters = useCallback(() => {
        const clearedFilters = {
            search: '',
            gender: '',
            category: '',
            program: ''
        }
        
        filtersRef.current = clearedFilters
        
        setFilters(clearedFilters)
        setShowAllOnSearch(false)
        
        fetchImpala(1, clearedFilters, false)
    }, [fetchImpala])

    const clearSearch = useCallback(() => {
        const updatedFilters = {
            ...filtersRef.current,
            search: ''
        }
        
        filtersRef.current = updatedFilters
        
        setFilters(prev => ({
            ...prev,
            search: ''
        }))
        setShowAllOnSearch(false)
        
        fetchImpala(1, updatedFilters, false)
    }, [fetchImpala])

    const searchParticipants = useCallback((searchTerm, showAll = false) => {
        const searchFilters = {
            ...filtersRef.current,
            search: searchTerm
        }
        
        filtersRef.current = searchFilters
        
        setFilters(prev => ({
            ...prev,
            search: searchTerm
        }))

        if (searchTerm) {
            setShowAllOnSearch(showAll)
        } else {
            setShowAllOnSearch(false)
        }
        
        if (debouncedFetchRef.current) {
            debouncedFetchRef.current(1, searchFilters, showAll)
        }
    }, [])

    const refreshData = useCallback(() => {
        fetchImpala(pagination.page, filtersRef.current, showAllOnSearch)
    }, [fetchImpala, pagination.page, showAllOnSearch])

    const handlePageChange = useCallback((newPage) => {
        fetchImpala(newPage, filtersRef.current, showAllOnSearch)
    }, [fetchImpala, showAllOnSearch])

    useEffect(() => {
        fetchImpala(1, filtersRef.current, false)
    }, [])

    const fetchImpalaStats = useCallback(async () => {
        try {
            setStatsLoadingImpala(true)
            const result = await impalaService.fetchImpalaStats()
            
            if (result.success) {
                setImpalaStats(result.data)
            } else {
                setImpalaStats({
                    title: 'Total Participant',
                    value: participant.length.toString() || "0",
                    subtitle: '+ 0',
                    percentage: '0%',
                    trend: 'up',
                    period: 'Last month',
                    icon: 'Users',
                    color: 'orange',
                    description: '0% Last Month'
                })
            }
        } catch (error) {
            console.error('Error fetching participant stats:', error)
            setImpalaStats({
                title: 'Total Participant',
                value: participant.length.toString() || "0",
                subtitle: '+ 0',
                percentage: '0%',
                trend: 'up',
                period: 'Last month',
                icon: 'Users',
                color: 'orange',
                description: '0% Last Month'
            })
        } finally {
            setStatsLoadingImpala(false)
        }
    }, [participant.length])

    useEffect(() => {
        fetchImpalaStats()
    }, [fetchImpalaStats])

    const exportParticipants = useCallback(async (format = 'xlsx', exportFilters = null, exportAll = false) => {
        try {
            setLoading(true);

            const currentFilters = exportFilters || filtersRef.current;
            
            const queryParams = new URLSearchParams();

            if (currentFilters.search) {
                queryParams.append('search', currentFilters.search);
            }

            if (currentFilters.gender) {
                queryParams.append('gender', currentFilters.gender);
            }

            if (currentFilters.category) {
                queryParams.append('category', currentFilters.category);
            }

            if (currentFilters.program) {
                queryParams.append('program', currentFilters.program);
            }

            queryParams.append('format', format);

            if (exportAll) {
                queryParams.append('includeAll', 'true');
            }

            let dataToExport;
            let exportFilename = '';

            if (format === 'xlsx' || format === 'excel') {
                try {
                    const response = await fetch(`/api/impala/export?${queryParams.toString()}`);

                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.message || 'Failed to export data');
                    }

                    const result = await response.json();

                    if (result.success && result.data && result.data.length > 0) {
                        dataToExport = result.data;

                        const formatArrayField = (fieldValue) => {
                            if (!fieldValue) return '';
                            if (Array.isArray(fieldValue)) {
                                return fieldValue.filter(item => item != null && item !== '').join(', ');
                            }

                            if (typeof fieldValue === 'string') {
                                try {
                                    const parsed = JSON.parse(fieldValue);
                                    if (Array.isArray(parsed)) {
                                        return parsed.filter(item => item != null && item !== '').join(', ');
                                    }
                                } catch {
                                    // 
                                }
                                return fieldValue;
                            }

                            return String(fieldValue || '');
                        };

                        const formatFieldValue = (fieldValue, fieldName) => {
                            if (fieldValue === null || fieldValue === undefined || fieldValue === '') {
                                return '';
                            }

                            if (['social_media', 'marketplace', 'website', 'skills', 'certifications'].includes(fieldName)) {
                                return formatArrayField(fieldValue);
                            }

                            if (fieldName.includes('date') || fieldName.includes('created') || fieldName.includes('updated')) {
                                try {
                                    const date = new Date(fieldValue);
                                    if (!isNaN(date.getTime())) {
                                        return date.toLocaleDateString('id-ID');
                                    }
                                } catch {
                                    // 
                                }
                                return fieldValue;
                            }

                            // eslint-disable-next-line no-control-regex
                            return String(fieldValue).replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
                        };

                        const exportData = dataToExport.map((p, index) => ({
                            'No': index + 1,
                            'Nama Lengkap': p.full_name || '',
                            'Email': p.email || '',
                            'Nomor Telepon': p.phone || '',
                            'Jenis Kelamin': p.gender || '',
                            'Kategori': p.category || '',
                            'Program': p.program_name || '',
                            'Tanggal Lahir': p.date_of_birth || '',
                            'Usia': p.age || '',
                            'Alamat': p.address || '',
                            'Kota/Kabupaten': p.regency_name || '',
                            'Provinsi': p.province_name || '',
                            'Pendidikan': p.education || '',
                            'NIK': p.nik || '',
                            'Kode Pos': p.postal_code || '',
                            'Status Disabilitas': p.disability_status || '',
                            'Alasan Bergabung': p.reason_join_program || '',
                            'Tanggal Dibuat': formatFieldValue(p.created_at, 'created_at'),
                            'Tanggal Diperbarui': formatFieldValue(p.updated_at, 'updated_at'),

                            'Nama Usaha': p.business_name || '',
                            'Jenis Usaha': p.business_type || '',
                            'Alamat Usaha': p.business_address || '',
                            'Bentuk Usaha': p.business_form || '',
                            'Tahun Berdiri': p.established_year || '',
                            'Pendapatan Bulanan': p.monthly_revenue || '',
                            'Jumlah Karyawan': p.employee_count || '',
                            'Sertifikasi': formatFieldValue(p.certifications, 'certifications'),
                            'Media Sosial': formatFieldValue(p.social_media, 'social_media'),
                            'Marketplace': formatFieldValue(p.marketplace, 'marketplace'),
                            'Website': formatFieldValue(p.website, 'website'),

                            'Institusi': p.institution || '',
                            'Jurusan': p.major || '',
                            'Semester': p.semester || '',
                            'Tahun Masuk': p.enrollment_year || '',
                            'Minat Karir': p.career_interest || '',
                            'Kompetensi Inti': p.core_competency || '',

                            'Tempat Kerja': p.workplace || '',
                            'Posisi': p.position || '',
                            'Lama Bekerja': p.work_duration || '',
                            'Sektor Industri': p.industry_sector || '',
                            'Keahlian': formatFieldValue(p.skills, 'skills'),

                            'Nama Komunitas': p.community_name || '',
                            'Bidang Fokus': p.focus_area || '',
                            'Jumlah Anggota': p.member_count || '',
                            'Area Operasional': p.operational_area || '',
                            'Peran dalam Komunitas': p.community_role || '',

                            'Bidang Minat': p.areas_interest || '',
                            'Latar Belakang': p.backgorund || '',
                            'Tingkat Pengalaman': p.experience_level || ''
                        }));

                        const safeExportData = exportData.map(row => {
                            const safeRow = {};
                            Object.keys(row).forEach(key => {
                                const value = row[key];
                                safeRow[key] = typeof value === 'string' 
                                    // eslint-disable-next-line no-control-regex
                                    ? value.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
                                    : value;
                            });
                            return safeRow;
                        });

                        const workbook = XLSX.utils.book_new();
                        const worksheet = XLSX.utils.json_to_sheet(safeExportData);

                        const wscols = [
                            { wch: 5 },    { wch: 25 },   { wch: 30 },   { wch: 15 },
                            { wch: 15 },   { wch: 20 },   { wch: 30 },   { wch: 15 },
                            { wch: 8 },    { wch: 40 },   { wch: 20 },   { wch: 20 },
                            { wch: 20 },   { wch: 20 },   { wch: 20 },   { wch: 10 },
                            { wch: 25 },   { wch: 40 },   { wch: 15 },   { wch: 15 },
                            { wch: 25 },   { wch: 20 },   { wch: 40 },   { wch: 20 },
                            { wch: 15 },   { wch: 10 },   { wch: 15 },   { wch: 25 },
                            { wch: 20 },   { wch: 15 },   { wch: 20 },   { wch: 30 },
                            { wch: 25 },   { wch: 30 },   { wch: 15 },   { wch: 20 },
                            { wch: 25 },   { wch: 20 },   { wch: 30 },   { wch: 30 },
                            { wch: 30 },   { wch: 30 },   { wch: 30 }
                        ];
                        
                        worksheet['!cols'] = wscols;

                        if (safeExportData.length > 0) {
                            const headerRow = 0; 
                            const lastDataRow = safeExportData.length;
                            const lastColIndex = Object.keys(safeExportData[0]).length - 1;
                            
                            worksheet['!autofilter'] = { 
                                ref: XLSX.utils.encode_range({
                                    s: { r: headerRow, c: 0 },
                                    e: { r: lastDataRow, c: lastColIndex } 
                                })
                            };
                        }

                        XLSX.utils.book_append_sheet(workbook, worksheet, 'Participants');

                        const timestamp = new Date().toISOString()
                            .replace(/:/g, '-')
                            .replace(/\..+/, '');
                        
                        const cleanSearchTerm = (currentFilters.search || 'all')
                            .replace(/[^a-zA-Z0-9\s_-]/g, '')
                            .replace(/\s+/g, '_')
                            .substring(0, 30);
                        
                        exportFilename = `impala_management_${cleanSearchTerm}_${timestamp}.xlsx`;

                        XLSX.writeFile(workbook, exportFilename, {
                            bookType: 'xlsx',
                            type: 'binary'
                        });

                        toast.success(`Successfully exported ${dataToExport.length} participants to Excel`);
                        
                        return { data: dataToExport, filename: exportFilename };
                    } else {
                        const message = result.message || 'No data available to export';
                        toast.warning(message);
                        return { data: [], filename: '' };
                    }

                } catch (error) {
                    console.error('Excel export error:', error);
    
                    try {
                        if (pagination.showingAllResults && currentFilters.search) {
                            dataToExport = participant;
                        } else {
                            const fallbackResult = await impalaService.fetchAllImpala(currentFilters);
                            dataToExport = fallbackResult.data || [];
                        }

                        if (dataToExport.length > 0) {
                            const formatArrayField = (fieldValue) => {
                                if (!fieldValue) return '';
                                if (Array.isArray(fieldValue)) {
                                    return fieldValue.filter(item => item != null && item !== '').join(', ');
                                }

                                if (typeof fieldValue === 'string') {
                                    try {
                                        const parsed = JSON.parse(fieldValue);
                                        if (Array.isArray(parsed)) {
                                            return parsed.filter(item => item != null && item !== '').join(', ');
                                        }
                                    } catch {
                                        // 
                                    }
                                    return fieldValue;
                                }

                                return String(fieldValue || '');
                            };

                            const formatFieldValue = (fieldValue, fieldName) => {
                                if (fieldValue === null || fieldValue === undefined || fieldValue === '') {
                                    return '';
                                }

                                if (['social_media', 'marketplace', 'website', 'skills', 'certifications'].includes(fieldName)) {
                                    return formatArrayField(fieldValue);
                                }

                                if (fieldName.includes('date') || fieldName.includes('created') || fieldName.includes('updated')) {
                                    try {
                                        const date = new Date(fieldValue);
                                        if (!isNaN(date.getTime())) {
                                            return date.toLocaleDateString('id-ID');
                                        }
                                    } catch {
                                        // Return original value if date parsing fails
                                    }
                                    return fieldValue;
                                }

                                // eslint-disable-next-line no-control-regex
                                return String(fieldValue).replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
                            };

                            const exportData = dataToExport.map((p, index) => ({
                                'No': index + 1,
                                'Nama Lengkap': p.full_name || '',
                                'Email': p.email || '',
                                'Nomor Telepon': p.phone || '',
                                'Jenis Kelamin': p.gender || '',
                                'Kategori': p.category || '',
                                'Program': p.program_name || '',
                                'Tanggal Lahir': p.date_of_birth || '',
                                'Usia': p.age || '',
                                'Alamat': p.address || '',
                                'Kota/Kabupaten': p.regency_name || '',
                                'Provinsi': p.province_name || '',
                                'Pendidikan': p.education || '',
                                'NIK': p.nik || '',
                                'Kode Pos': p.postal_code || '',
                                'Status Disabilitas': p.disability_status || '',
                                'Alasan Bergabung': p.reason_join_program || '',

                                'Nama Usaha': p.business_name || '',
                                'Jenis Usaha': p.business_type || '',
                                'Alamat Usaha': p.business_address || '',
                                'Bentuk Usaha': p.business_form || '',
                                'Tahun Berdiri': p.established_year || '',
                                'Pendapatan Bulanan': p.monthly_revenue || '',
                                'Jumlah Karyawan': p.employee_count || '',
                                'Sertifikasi': formatFieldValue(p.certifications, 'certifications'),
                                'Media Sosial': formatFieldValue(p.social_media, 'social_media'),
                                'Marketplace': formatFieldValue(p.marketplace, 'marketplace'),
                                'Website': formatFieldValue(p.website, 'website'),

                                'Institusi': p.institution || '',
                                'Jurusan': p.major || '',
                                'Semester': p.semester || '',
                                'Tahun Masuk': p.enrollment_year || '',
                                'Minat Karir': p.career_interest || '',
                                'Kompetensi Inti': p.core_competency || '',

                                'Tempat Kerja': p.workplace || '',
                                'Posisi': p.position || '',
                                'Lama Bekerja': p.work_duration || '',
                                'Sektor Industri': p.industry_sector || '',
                                'Keahlian': formatFieldValue(p.skills, 'skills'),

                                'Nama Komunitas': p.community_name || '',
                                'Bidang Fokus': p.focus_area || '',
                                'Jumlah Anggota': p.member_count || '',
                                'Area Operasional': p.operational_area || '',
                                'Peran dalam Komunitas': p.community_role || '',

                                'Bidang Minat': p.areas_interest || '',
                                'Latar Belakang': p.backgorund || '',
                                'Tingkat Pengalaman': p.experience_level || '',

                                'Tanggal Dibuat': formatFieldValue(p.created_at, 'created_at'),
                                'Tanggal Diperbarui': formatFieldValue(p.updated_at, 'updated_at'),
                            }));

                            const safeExportData = exportData.map(row => {
                                const safeRow = {};
                                Object.keys(row).forEach(key => {
                                    const value = row[key];
                                    safeRow[key] = typeof value === 'string' 
                                        // eslint-disable-next-line no-control-regex
                                        ? value.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
                                        : value;
                                });
                                return safeRow;
                            });

                            const workbook = XLSX.utils.book_new();
                            const worksheet = XLSX.utils.json_to_sheet(safeExportData);
                            
                            const wscols = [
                                { wch: 5 },    { wch: 25 },   { wch: 30 },   { wch: 15 },
                                { wch: 15 },   { wch: 20 },   { wch: 30 },   { wch: 15 },
                                { wch: 8 },    { wch: 40 },   { wch: 20 },   { wch: 20 },
                                { wch: 20 },   { wch: 20 },   { wch: 20 },   { wch: 10 },
                                { wch: 25 },   { wch: 40 },   { wch: 15 },   { wch: 15 },
                                { wch: 25 },   { wch: 20 },   { wch: 40 },   { wch: 20 },
                                { wch: 15 },   { wch: 10 },   { wch: 15 },   { wch: 25 },
                                { wch: 20 },   { wch: 15 },   { wch: 20 },   { wch: 30 },
                                { wch: 25 },   { wch: 30 },   { wch: 15 },   { wch: 20 },
                                { wch: 25 },   { wch: 20 },   { wch: 30 },   { wch: 30 },
                                { wch: 30 },   { wch: 30 },   { wch: 30 }
                            ];
                            worksheet['!cols'] = wscols;

                            XLSX.utils.book_append_sheet(workbook, worksheet, 'Participants');

                            const timestamp = new Date().toISOString()
                                .replace(/:/g, '-')
                                .replace(/\..+/, '');
                                
                            const cleanSearchTerm = (currentFilters.search || 'all')
                                .replace(/[^a-zA-Z0-9\s_-]/g, '')
                                .replace(/\s+/g, '_')
                                .substring(0, 30);
                                
                            exportFilename = `impala_management_${cleanSearchTerm}_${timestamp}.xlsx`;

                            XLSX.writeFile(workbook, exportFilename);
                            
                            toast.success(`Exported ${dataToExport.length} participants (fallback method)`);
                            
                            return { data: dataToExport, filename: exportFilename };
                        } else {
                            toast.error('No data to export');
                            return { data: [], filename: '' };
                        }
                    } catch (fallbackError) {
                        console.error('Fallback export error:', fallbackError);
                        toast.error('Export failed. Please try again.');
                        throw fallbackError;
                    }
                }
            } else {
                throw new Error(`Unsupported format: ${format}`);
            }
        } catch (error) {
            console.error('Error exporting participants:', error);
            toast.error('Failed to export participants');
            throw error;
        } finally {
            setLoading(false);
        }
    }, [participant, pagination.showingAllResults]);

    const addParticipant = async (participantData) => {
        try {
            const result = await impalaService.createImpala(participantData)
            toast.success('Participant added successfully')
            
            await fetchImpala(pagination.page, filtersRef.current, showAllOnSearch)
            await fetchImpalaStats()
            
            return result
        } catch (error) {
            toast.error('Failed to add participant')
            throw error
        }
    }

    const updateParticipant = async (participantId, participantData) => {
        try {
            setLoading(true)
            const result = await impalaService.updateImpala(participantId, participantData)
            toast.success("Participant updated successfully")

            setParticipant(prevParticipants => 
                prevParticipants.map(participant => 
                    participant.id === participantId
                        ? { ...participant, ...participantData, ...result.data || result }
                        : participant
                )
            )

            return result.data || result
        } catch (error) {
            toast.error('Failed to update participant')
            throw error
        } finally {
            setLoading(false)
        }
    }

    const deleteParticipant = async (participantId) => {
        try {
            setLoading(true)
            await impalaService.deleteImpala(participantId)

            setParticipant(prevParticipants =>
                prevParticipants.filter(participant => participant.id !== participantId)
            )

            setPagination(prev => ({
                ...prev,
                total: Math.max(0, prev.total - 1)
            }))

            await fetchImpalaStats()
        } catch (error) {
            toast.error('Failed to delete participant')
            throw error
        } finally {
            setLoading(false)
        }
    }

    const getDisplayText = useCallback(() => {
        if (pagination.showingAllResults && filtersRef.current.search) {
            return `Showing all ${participant.length} results for "${filtersRef.current.search}"`
        } else if (pagination.showingAllResults) {
            return `Showing all ${participant.length} participants`
        } else {
            const start = ((pagination.page - 1) * pagination.limit) + 1
            const end = Math.min(pagination.page * pagination.limit, pagination.total)
            return `Showing ${start} to ${end} of ${pagination.total} participants`
        }
    }, [pagination, participant.length])

    const refetch = useCallback(() => {
        fetchImpala(pagination.page, filtersRef.current, showAllOnSearch)
    }, [fetchImpala, pagination.page, showAllOnSearch])

    const resetToPaginationMode = useCallback(async () => {
        await fetchImpala(1, filtersRef.current, false)
    }, [fetchImpala])

    return {
        ...confirmDialog, participant, loading, error, pagination, filters, showAllOnSearch, impalaStats, 
        statsLoadingImpala, fetchImpala, setFilters: updateFiltersAndFetch, clearFilters, clearSearch, searchParticipants,
        toggleShowAllOnSearch, isShowAllMode: () => pagination.showingAllResults || false, resetToPaginationMode,
        getDisplayText, refetch, handlePageChange, refreshData, addParticipant, updateParticipant, deleteParticipant,
        exportParticipants, refetchStats: fetchImpalaStats
    }
}

export default useImpala