import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { useClients } from '../../hooks/useClients';
import {
    getBusinessDisplayName,
    exportToExcel,
    validateExcelFile,
    parseExcelData,
    downloadTemplate,
    formatBusinessTypes,
    formatStatuses,
    countActiveFilters,
    formatMembersForTable
} from './programClientUtils';
import { statusOptions } from './constants/statusOptions';
import clientService from '../../services/clientService';

// Import constants untuk business types
import { BUSINESS_TYPES_FOR_FILTER } from './constants/businessTypes';

export const useProgramClient = () => {
    // ============= 1. SEMUA useState HARUS DIPANGGIL PERTAMA =============
    const [selectedMember, setSelectedMember] = useState(null);
    const [editingClient, setEditingClient] = useState(null);
    const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [importFile, setImportFile] = useState(null);
    const [isImporting, setIsImporting] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [validationErrors, setValidationErrors] = useState([]);
    const [isDragging, setIsDragging] = useState(false);
    const [highlightDetail, setHighlightDetail] = useState(false);
    const [availableBusinessTypes, setAvailableBusinessTypes] = useState([]);
    
    // PERBAIKAN: Pindahkan localFilters ke sini
    const [localFilters, setLocalFilters] = useState({
        search: '',
        status: '',
        businessType: '',
        gender: ''
    });

    // ============= 2. SEMUA useRef =============
    const fileInputRef = useRef(null);
    const dropZoneRef = useRef(null);
    const clientDetailRef = useRef(null);

    // ============= 3. CUSTOM HOOKS =============
    const {
        members,
        loading,
        error,
        pagination,
        filters,
        showAllOnSearch,
        fetchClients,
        updateFiltersAndFetch,
        clearFilters: hookClearFilters,
        clearSearch: hookClearSearch,
        searchClients,
        toggleShowAllOnSearch,
        resetToPaginationMode,
        handlePageChange: hookHandlePageChange,
        addClient,
        updateClient,
        deleteClient,
        refreshData,
        updateClientStatus: updateClientStatusFromHook
    } = useClients();

    const isInShowAllMode = false;

    // ============= 4. BARU SEKARANG useCallback =============
    // PERBAIKAN: Fungsi normalisasi gender dipindahkan ke sini
    const normalizeGenderForFilter = useCallback((gender) => {
        if (!gender || gender === '') return '';
        
        try {
            const genderString = gender.toString().toLowerCase().trim();
            
            // Standardisasi ke male/female untuk filter
            if (genderString.includes('male') || genderString.includes('laki') || genderString.includes('pria')) {
                return 'male';
            }
            
            if (genderString.includes('female') || genderString.includes('perempuan') || genderString.includes('wanita')) {
                return 'female';
            }
            
            // Jika tidak cocok dengan pattern, kembalikan original (lowercase)
            return genderString;
        } catch (error) {
            console.error('Error normalizing gender:', error, 'value:', gender);
            return '';
        }
    }, []);

    // ============= TAMBAHKAN: Fungsi getFilteredCounts =============
    const getFilteredCounts = useCallback((currentFilters = localFilters) => {
        try {
            console.log('🔢 [useProgramClient] Calculating filter counts for:', currentFilters);
            
            // Filter members berdasarkan filter yang diberikan
            let filteredMembers = [...members];
            
            // Filter by search
            if (currentFilters.search) {
                const searchLower = currentFilters.search.toLowerCase();
                filteredMembers = filteredMembers.filter(member =>
                    member.full_name?.toLowerCase().includes(searchLower) ||
                    member.email?.toLowerCase().includes(searchLower) ||
                    member.company?.toLowerCase().includes(searchLower) ||
                    member.program_name?.toLowerCase().includes(searchLower)
                );
            }
            
            // Filter by status
            if (currentFilters.status) {
                filteredMembers = filteredMembers.filter(member =>
                    member.status?.toLowerCase() === currentFilters.status.toLowerCase()
                );
            }
            
            // Filter by gender
            if (currentFilters.gender) {
                const normalizedFilterGender = normalizeGenderForFilter(currentFilters.gender);
                filteredMembers = filteredMembers.filter(member => {
                    const memberGender = normalizeGenderForFilter(member.gender);
                    return memberGender === normalizedFilterGender;
                });
            }
            
            // Filter by business type
            if (currentFilters.businessType && currentFilters.businessType !== 'all') {
                filteredMembers = filteredMembers.filter(member =>
                    member.business_type?.toLowerCase() === currentFilters.businessType.toLowerCase()
                );
            }
            
            console.log('🔢 Filtered members count:', filteredMembers.length, 'from total:', members.length);
            
            // Hitung counts berdasarkan filtered members
            const statusCounts = {};
            const genderCounts = {};
            const businessTypeCounts = {};
            
            // Status counts
            statusOptions.forEach(option => {
                if (option && option.value) {
                    const count = filteredMembers.filter(member =>
                        member.status?.toLowerCase() === option.value.toLowerCase()
                    ).length;
                    statusCounts[option.value] = count;
                }
            });
            
            // Gender counts
            const genderOptions = ['male', 'female'];
            genderOptions.forEach(gender => {
                const count = filteredMembers.filter(member => {
                    const memberGender = normalizeGenderForFilter(member.gender);
                    return memberGender === gender;
                }).length;
                genderCounts[gender] = count;
            });
            
            // All genders (total)
            genderCounts[''] = filteredMembers.length;
            
            // Business type counts
            const uniqueBusinessTypes = [...new Set([
                ...availableBusinessTypes.map(bt => bt.value).filter(Boolean),
                ...filteredMembers.map(m => m.business_type?.toLowerCase()).filter(Boolean)
            ])];
            
            uniqueBusinessTypes.forEach(type => {
                if (type) {
                    const count = filteredMembers.filter(member =>
                        member.business_type?.toLowerCase() === type.toLowerCase()
                    ).length;
                    businessTypeCounts[type] = count;
                }
            });
            
            // "All" business types
            businessTypeCounts['all'] = filteredMembers.length;
            
            // Pastikan semua business type dari availableBusinessTypes ada
            availableBusinessTypes.forEach(type => {
                if (type.value && !businessTypeCounts[type.value]) {
                    businessTypeCounts[type.value] = 0;
                }
            });
            
            const result = {
                status: statusCounts,
                gender: genderCounts,
                businessType: businessTypeCounts
            };
            
            console.log('🔢 Calculated counts:', result);
            return result;
            
        } catch (error) {
            console.error('Error calculating filter counts:', error);
            
            // Fallback to safe defaults
            return {
                status: { active: 0, inactive: 0, pending: 0 },
                gender: { male: 0, female: 0, '': 0 },
                businessType: { all: 0 }
            };
        }
    }, [members, availableBusinessTypes, normalizeGenderForFilter, localFilters, statusOptions]);

    const handleSearch = useCallback((term) => {
        searchClients(term, showAllOnSearch)
    }, [searchClients, showAllOnSearch]);

    const handleSelectMember = useCallback((member) => {
        setSelectedMember(member);
        setHighlightDetail(true);
        
        setTimeout(() => {
            if (clientDetailRef.current) {
                clientDetailRef.current.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'start',
                    inline: 'nearest'
                });
                
                setTimeout(() => {
                    setHighlightDetail(false);
                }, 2000);
            }
        }, 150);
    }, []);

    // PERBAIKAN: Handler untuk gender filter
    const handleGenderFilterChange = useCallback((gender) => {
        console.log('🎯 [useProgramClient] handleGenderFilterChange called with:', gender);
        
        const isSameGender = localFilters.gender === gender;
        const newGender = isSameGender ? '' : gender;
        
        console.log('🎯 New gender filter value:', newGender);
        
        setLocalFilters(prev => ({ 
            ...prev, 
            gender: newGender 
        }));
        
        const normalizedGender = newGender ? normalizeGenderForFilter(newGender) : '';
        
        console.log('🎯 Normalized gender for API:', normalizedGender);
        
        updateFiltersAndFetch({ 
            gender: normalizedGender 
        }, showAllOnSearch);
        
        if (newGender) {
            const displayGender = newGender === 'male' ? 'Male' : 'Female';
            toast.success(`Filtered by gender: ${displayGender}`);
        } else {
            toast.success('Gender filter cleared');
        }
    }, [localFilters.gender, updateFiltersAndFetch, showAllOnSearch, normalizeGenderForFilter]);

    const handleStatusFilterChange = useCallback((status) => {
        const newStatus = localFilters.status === status ? '' : status;
        setLocalFilters(prev => ({ ...prev, status: newStatus }));
        updateFiltersAndFetch({ status: newStatus }, showAllOnSearch);
    }, [localFilters.status, updateFiltersAndFetch, showAllOnSearch]);

    const handleBusinessTypeFilterChange = useCallback((businessType) => {
        const newBusinessType = localFilters.businessType === businessType ? '' : businessType;
        setLocalFilters(prev => ({ ...prev, businessType: newBusinessType }));
        updateFiltersAndFetch({ businessType: newBusinessType }, showAllOnSearch);
    }, [localFilters.businessType, updateFiltersAndFetch, showAllOnSearch]);

    const handleApplyFilters = useCallback((newFilters) => {
        console.log('[useProgramClient] handleApplyFilters called with:', newFilters);
        
        const normalizedFilters = { ...newFilters };
        
        if (normalizedFilters.gender) {
            normalizedFilters.gender = normalizeGenderForFilter(normalizedFilters.gender);
            console.log('🎯 Normalized gender filter:', normalizedFilters.gender);
        }
        
        setLocalFilters(newFilters);
        
        console.log('🎯 Sending to updateFiltersAndFetch:', normalizedFilters);
        updateFiltersAndFetch(normalizedFilters, showAllOnSearch);
        
    }, [updateFiltersAndFetch, showAllOnSearch, normalizeGenderForFilter]);

    const handleToggleShowAll = useCallback((checked) => {
        toggleShowAllOnSearch(checked);
    }, [toggleShowAllOnSearch]);

    const clearFilter = useCallback((filterType) => {
        console.log('🗑️ clearFilter called for:', filterType);
        
        if (filterType === 'search') {
            hookClearSearch();
            return;
        }

        if (filterType === 'status') {
            setLocalFilters(prev => ({ ...prev, status: '' }));
            updateFiltersAndFetch({ status: '' }, showAllOnSearch);
            return;
        }

        if (filterType === 'businessType') {
            setLocalFilters(prev => ({ ...prev, businessType: '' }));
            updateFiltersAndFetch({ businessType: '' }, showAllOnSearch);
            return;
        }

        if (filterType === 'gender') {
            console.log('🗑️ Clearing gender filter');
            setLocalFilters(prev => ({ ...prev, gender: '' }));
            updateFiltersAndFetch({ gender: '' }, showAllOnSearch);
            toast.success('Gender filter cleared');
            return;
        }
    }, [hookClearSearch, updateFiltersAndFetch, showAllOnSearch]);

    const clearAllFilters = useCallback(async () => {
        console.log('🗑️ Clearing all filters');
        
        setLocalFilters({
            search: '',
            status: '',
            businessType: '',
            gender: ''
        });
        
        await hookClearFilters();
        setSelectedMember(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        toast.success('All filters cleared');
    }, [hookClearFilters]);

    const handleResetToPagination = useCallback(async () => {
        await resetToPaginationMode();
    }, [resetToPaginationMode]);

    const handleAddClient = useCallback(() => {
        setIsAddClientModalOpen(true);
    }, []);

    const handleOpenEditModal = useCallback((client) => {
        setEditingClient(client);
        setIsEditModalOpen(true);
    }, []);

    const handleDeleteClient = useCallback(async (clientId) => {
        if (!selectedMember) return;

        if (!window.confirm(`Are you sure want to delete ${selectedMember.full_name}? This action cannot be undone.`)) {
            return;
        }

        try {
            await deleteClient(clientId);
            setSelectedMember(null);
            toast.success('Client deleted successfully');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (error) {
            console.error('Error deleting client', error);
            toast.error(error.message || 'Failed to delete client');
        }
    }, [selectedMember, deleteClient]);

    const updateClientStatus = useCallback(async (clientId, status) => {
        try {
            const validStatus = ['Active', 'Inactive'].includes(status) 
                ? status 
                : status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
            
            if (!['Active', 'Inactive'].includes(validStatus)) {
                throw new Error('Status must be either "Active" or "Inactive"');
            }

            let updatedClient;
            
            if (updateClientStatusFromHook) {
                updatedClient = await updateClientStatusFromHook(clientId, validStatus);
            } else {
                const result = await clientService.updateClientStatus(clientId, validStatus);
                
                if (!result.success || !result.data) {
                    throw new Error(result.message || 'Failed to update status');
                }

                updatedClient = result.data;
                
                await refreshData();
            }
            
            if (selectedMember && selectedMember.id === clientId) {
                setSelectedMember(prev => ({
                    ...prev,
                    status: validStatus
                }));
            }
            
            return updatedClient;
            
        } catch (error) {
            console.error('[useProgramClient] Error updating status:', error);
            throw error;
        }
    }, [updateClientStatusFromHook, refreshData, selectedMember]);

    const handleRefreshWithReset = useCallback(() => {
        setSelectedMember(null); 
        refreshData();
        clearAllFilters();
    }, [refreshData, clearAllFilters]);

    const handlePageChange = useCallback((page) => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        hookHandlePageChange(page);
    }, [hookHandlePageChange]);

    const handleExport = useCallback(async (format = 'excel') => {
        try {
            setIsExporting(true);
            await exportToExcel(members, format, getBusinessDisplayName);
        } catch (error) {
            console.error('Export failed:', error);
            toast.error(`Failed to export: ${error.message}`);
        } finally {
            setIsExporting(false);
        }
    }, [members, getBusinessDisplayName]);

    const handleOpenImportModal = useCallback(() => {
        setImportFile(null);
        setValidationErrors([]);
        setIsDragging(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        setIsImportModalOpen(true);
    }, []);

    const handleDownloadTemplate = useCallback(() => {
        try {
            downloadTemplate();
            toast.success('Template Excel berhasil didownload');
        } catch (error) {
            console.error('Download template error:', error);
            toast.error('Gagal mendownload template');
        }
    }, []);

    const processFile = useCallback((file) => {
        setValidationErrors([]);
        
        const errors = validateExcelFile(file);
        if (errors.length > 0) {
            setValidationErrors(errors);
            setImportFile(null);
            toast.error('File tidak valid');
            return;
        }
        
        setImportFile(file);
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const { data: parsedData, errors } = parseExcelData(data);
                
                if (errors.length > 0) {
                    setValidationErrors(errors);
                    if (parsedData.length === 0) {
                        toast.error('Tidak ada data valid yang ditemukan dalam file');
                    } else {
                        toast.error(`Terdapat ${errors.length} error dalam file`);
                    }
                }
                
                if (parsedData.length > 0) {
                    toast.success(`File berhasil diupload: ${parsedData.length} data valid ditemukan`);
                }
            } catch (error) {
                setValidationErrors([error.message]);
                toast.error('Gagal membaca file Excel');
            }
        };
        
        reader.readAsArrayBuffer(file);
    }, []);

    const handleFileUpload = useCallback((event) => {
        const file = event.target.files[0];
        if (!file) return;
        processFile(file);
    }, [processFile]);

    const handleTriggerFileInput = useCallback(() => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    }, []);

    const handleRemoveFile = useCallback(() => {
        setImportFile(null);
        setValidationErrors([]);
        setIsDragging(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }, []);

    const handleImportExcel = useCallback(async () => {
        if (!importFile) {
            toast.error('Pilih file Excel terlebih dahulu');
            return;
        }

        setIsImporting(true);
        
        try {
            const reader = new FileReader();

            reader.onload = async (e) => {
                try {
                    const data = new Uint8Array(e.target.result);
                    const { data: parsedData } = parseExcelData(data);
                    
                    if (parsedData.length === 0) {
                        toast.error('Tidak ada data yang bisa diimport');
                        setIsImporting(false);
                        return;
                    }

                    const response = await fetch('/api/client/bulk-import', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            clients: parsedData,
                            mode: 'upsert'
                        })
                    });

                    const result = await response.json();

                    if (!response.ok) {
                        throw new Error(result.message || 'Gagal mengimport clients');
                    }
                    
                    setImportFile(null);
                    setValidationErrors([]);
                    setIsDragging(false);
                    if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                    }

                    if (result.success) {
                        const { inserted = 0, updated = 0, totalProcessed = 0 } = result.data || {};

                        let message = `${result.message}`;

                        if (inserted > 0 && updated > 0) {
                            message += ` (${inserted} data baru, ${updated} data diupdate)`;
                        } else if (inserted > 0) {
                            message += ` (${inserted} data baru)`;
                        } else if (updated > 0) {
                            message += ` (${updated} data diupdate)`;
                        }

                        toast.success(message);

                        if (result.data?.errors && result.data.errors.length > 0) {
                            setValidationErrors(result.data.errors);

                            if (totalProcessed > 0) {
                                setIsImportModalOpen(false);
                                await refreshData();
                            }
                        } else {
                            setIsImportModalOpen(false);
                            await refreshData();
                        }
                    }

                } catch (parseError) {
                    console.error('Parse error:', parseError);
                    toast.error('Format file Excel tidak valid');
                } finally {
                    setIsImporting(false);
                }
            };
            
            reader.readAsArrayBuffer(importFile);
        } catch (error) {
            console.error('Import error:', error);
            toast.error('Gagal mengimport data');
            setIsImporting(false);
        }
    }, [importFile, refreshData]);

    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    }, []);

    const handleDragEnter = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (dropZoneRef.current && !dropZoneRef.current.contains(e.relatedTarget)) {
            setIsDragging(false);
        }
    }, []);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        
        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            const file = files[0];
            processFile(file);
        }
    }, [processFile]);

    // ============= 5. SEMUA useMemo =============
    const getTotalActiveCriteria = useCallback(() => {
        return countActiveFilters(localFilters);
    }, [localFilters]);

    const getActiveFiltersCount = useCallback(() => {
        let count = 0;
        if (localFilters.status) count++;
        if (localFilters.businessType && localFilters.businessType !== 'all') count++;
        if (localFilters.gender) count++;
        
        console.log('🔢 Active filters count:', { 
            count, 
            status: localFilters.status,
            businessType: localFilters.businessType,
            gender: localFilters.gender 
        });
        
        return count;
    }, [localFilters]);

    const getBusinessTypeLabel = useCallback((businessTypeValue) => {
        if (!businessTypeValue || businessTypeValue === "all") return "All Business Types";
        const businessType = availableBusinessTypes.find(b => b.value === businessTypeValue);
        return businessType ? businessType.original : businessTypeValue;
    }, [availableBusinessTypes]);

    const getStatusLabel = useCallback((statusValue) => {
        if (!statusValue) return "";
        if (statusValue === 'active') return 'Active';
        if (statusValue === 'inactive') return 'Inactive';
        return statusValue.charAt(0).toUpperCase() + statusValue.slice(1);
    }, []);

    const getGenderLabel = useCallback((genderValue) => {
        if (!genderValue) return "";
        
        const normalized = normalizeGenderForFilter(genderValue);
        if (normalized === 'male') return 'Male';
        if (normalized === 'female') return 'Female';
        
        return genderValue.charAt(0).toUpperCase() + genderValue.slice(1);
    }, [normalizeGenderForFilter]);

    const availableStatuses = useMemo(() => {
        return formatStatuses(members);
    }, [members]);

    const formattedMembers = useMemo(() => {
        return formatMembersForTable(members, pagination, isInShowAllMode, getBusinessDisplayName);
    }, [members, pagination, isInShowAllMode, getBusinessDisplayName]);

    const tableConfig = useMemo(() => ({
        headers: ['No', 'Full Name', 'Email', 'Gender', 'Company', 'Business Type', 'Program Name', 'Status', 'Action'],
        title: "Client Management",
        addButton: "Add Client",
        detailTitle: "Client Details"
    }), []);

    // ============= 6. SEMUA useEffect =============
    // PERBAIKAN: Sync filters dengan benar termasuk gender
    useEffect(() => {
        console.log('🔄 [useProgramClient] Syncing filters from hook:', {
            hookFilters: filters,
            currentLocalFilters: localFilters
        });
        
        const newLocalFilters = {
            search: filters.search || '',
            status: filters.status || '',
            businessType: filters.businessType || '',
            gender: filters.gender || ''
        };
        
        if (JSON.stringify(newLocalFilters) !== JSON.stringify(localFilters)) {
            console.log('🔄 Updating local filters:', newLocalFilters);
            setLocalFilters(newLocalFilters);
        }
    }, [filters]);

    // DEBUG: Cek data gender
    useEffect(() => {
        if (members.length > 0) {
            console.log('🔍 [useProgramClient] Data gender analysis:');
            
            const genderStats = {
                total: members.length,
                hasGenderField: 0,
                male: 0,
                female: 0,
                other: 0,
                undefined: 0,
                null: 0
            };
            
            members.forEach((client, index) => {
                const hasGenderField = 'gender' in client;
                const genderValue = client.gender;
                const genderLower = genderValue?.toLowerCase()?.trim() || '';
                
                if (hasGenderField) genderStats.hasGenderField++;
                
                if (genderValue === undefined) {
                    genderStats.undefined++;
                } else if (genderValue === null || genderValue === '') {
                    genderStats.null++;
                } else if (genderLower.includes('male') || genderLower.includes('laki') || genderLower.includes('pria')) {
                    genderStats.male++;
                } else if (genderLower.includes('female') || genderLower.includes('perempuan') || genderLower.includes('wanita')) {
                    genderStats.female++;
                } else {
                    genderStats.other++;
                }
                
                if (index < 3) {
                    console.log(`  Sample ${index + 1}: ${client.full_name} - gender: "${genderValue}" → normalized: "${normalizeGenderForFilter(genderValue)}"`);
                }
            });
            
            console.log('📊 Gender statistics:', genderStats);
            console.log('📋 All unique gender values:', [...new Set(members.map(m => m.gender).filter(g => g !== null && g !== undefined && g !== ''))]);
        }
    }, [members, normalizeGenderForFilter]);

    useEffect(() => {
        // Gunakan business types dari constants file
        setAvailableBusinessTypes(BUSINESS_TYPES_FOR_FILTER);
        
        if (members.length > 0) {
            const businessTypesFromMembers = formatBusinessTypes(members);
            
            const businessTypesMap = new Map();
            
            BUSINESS_TYPES_FOR_FILTER.forEach(type => {
                if (type.value && type.original) {
                    businessTypesMap.set(type.value, type);
                }
            });
            
            businessTypesFromMembers.forEach(type => {
                if (type.value && type.original && !businessTypesMap.has(type.value)) {
                    businessTypesMap.set(type.value, type);
                }
            });
            
            const combinedBusinessTypes = Array.from(businessTypesMap.values())
                .sort((a, b) => a.original.localeCompare(b.original));
            
            setAvailableBusinessTypes(combinedBusinessTypes);
        }
    }, [members]);

    useEffect(() => {
        if (selectedMember && members.length > 0) {
            const currentSelected = members.find(member => member.id === selectedMember.id);
            if (currentSelected) {
                setSelectedMember(currentSelected);
            } else {
                setSelectedMember(null);
            }
        }
    }, [members, selectedMember?.id]);

    useEffect(() => {
        const preventDefaults = (e) => {
            e.preventDefault();
            e.stopPropagation();
        };
        
        window.addEventListener('dragover', preventDefaults, false);
        window.addEventListener('drop', preventDefaults, false);
        
        return () => {
            window.removeEventListener('dragover', preventDefaults, false);
            window.removeEventListener('drop', preventDefaults, false);
        };
    }, []);

    // Debug untuk state changes
    useEffect(() => {
        console.log('🔍 [useProgramClient] State updated:', {
            localFilters,
            membersCount: members.length,
            filtersFromHook: filters,
            pagination: pagination.currentPage
        });
        
        if (localFilters.gender || filters.gender) {
            console.log('🎯 Gender filter analysis:', {
                localGender: localFilters.gender,
                hookGender: filters.gender,
                normalizedLocal: normalizeGenderForFilter(localFilters.gender),
                normalizedHook: normalizeGenderForFilter(filters.gender)
            });
            
            if (members.length > 0) {
                const normalizedFilter = normalizeGenderForFilter(localFilters.gender || filters.gender);
                const matchingClients = members.filter(member => {
                    const clientGender = normalizeGenderForFilter(member.gender);
                    return clientGender === normalizedFilter;
                });
                
                console.log('📊 Gender filter results:', {
                    filter: normalizedFilter,
                    totalClients: members.length,
                    matchingClients: matchingClients.length,
                    matchSample: matchingClients.slice(0, 3).map(c => ({
                        name: c.full_name,
                        originalGender: c.gender,
                        normalizedGender: normalizeGenderForFilter(c.gender)
                    }))
                });
            }
        }
    }, [localFilters, members, filters, pagination, normalizeGenderForFilter]);

    // PERBAIKAN: Debug untuk API calls dan filter matching
    useEffect(() => {
        console.log('🔄 [useProgramClient] Data and filters updated:', {
            localFilters,
            hookFilters: filters,
            membersLength: members.length,
            hasSelectedMember: !!selectedMember
        });
        
        if (filters.gender && !localFilters.gender) {
            console.log('🔄 Syncing gender from hook to local:', filters.gender);
            setLocalFilters(prev => ({ ...prev, gender: filters.gender }));
        }
        
        if (!filters.gender && localFilters.gender) {
            console.log('🔄 Clearing local gender filter because hook has none');
            setLocalFilters(prev => ({ ...prev, gender: '' }));
        }
        
    }, [localFilters, filters, members, selectedMember]);

    // ============= 7. RETURN VALUE =============
    return {
        selectedMember,
        localFilters,
        loading,
        error,
        members,
        pagination,
        showAllOnSearch,
        isInShowAllMode,
        getTotalActiveCriteria,
        getActiveFiltersCount,
        availableBusinessTypes,
        formattedMembers,
        tableConfig,
        highlightDetail,
        addClient,
        updateClient,
        deleteClient,
        fetchClients,
        refreshData,
        isAddClientModalOpen,
        setIsAddClientModalOpen,
        isEditModalOpen,
        setIsEditModalOpen,
        editingClient,
        setEditingClient,
        isImportModalOpen,
        setIsImportModalOpen,
        importFile,
        validationErrors,
        isDragging,
        isImporting,
        isExporting,
        fileInputRef,
        dropZoneRef,
        clientDetailRef,
        statusOptions,
        availableStatuses,
        // Tambahkan getFilteredCounts di sini
        getFilteredCounts,
        handleSelectMember,
        handleSearch,
        handleStatusFilterChange,
        handleGenderFilterChange,
        handleBusinessTypeFilterChange,
        handleApplyFilters,
        handleToggleShowAll,
        clearFilter,
        clearAllFilters,
        handleResetToPagination,
        handleAddClient,
        handleOpenEditModal,
        handleDeleteClient,
        handleRefreshWithReset,
        handlePageChange,
        handleExport,
        handleOpenImportModal,
        handleImportExcel,
        handleDownloadTemplate,
        handleDragOver,
        handleDragEnter,
        handleDragLeave,
        handleDrop,
        handleFileUpload,
        handleTriggerFileInput,
        handleRemoveFile,
        getBusinessTypeLabel,
        getStatusLabel,
        getGenderLabel,
        getBusinessDisplayName,
        updateClientStatus,
        normalizeGenderForFilter
    };
};

export default useProgramClient;