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

export const useProgramClient = () => {
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
  
    const fileInputRef = useRef(null);
    const dropZoneRef = useRef(null);
    const clientDetailRef = useRef(null);

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

    const handleSearch = useCallback((term) => {
        console.log('Search triggered:', term)

        searchClients(term, showAllOnSearch)
    }, [searchClients, showAllOnSearch]);

    const [localFilters, setLocalFilters] = useState({
        search: '',
        status: '',
        businessType: ''
    })

    useEffect(() => {
        setLocalFilters(filters)
    }, [filters])

    const handleStatusFilterChange = useCallback((status) => {
        console.log('Status filter changed:', status)
        
        const newStatus = localFilters.status === status ? '' : status
        setLocalFilters(prev => ({ ...prev, status: newStatus }))
        updateFiltersAndFetch({ status: newStatus }, showAllOnSearch)
    }, [localFilters.status, updateFiltersAndFetch, showAllOnSearch]);

    const handleBusinessTypeFilterChange = useCallback((businessType) => {
        console.log('Business type filter changed:', businessType)

        const newBusinessType = localFilters.businessType === businessType ? '' : businessType
        setLocalFilters(prev => ({ ...prev, businessType: newBusinessType }))
        updateFiltersAndFetch({ businessType: newBusinessType }, showAllOnSearch)
    }, [localFilters.businessType, updateFiltersAndFetch, showAllOnSearch]);

    const handleToggleShowAll = useCallback((checked) => {
        console.log('Toggle show all:', checked)
        toggleShowAllOnSearch(checked)
    }, [toggleShowAllOnSearch])

    const clearFilter = useCallback((filterType) => {
        console.log('Clearing filter:', filterType)

        if (filterType === 'search') {
            hookClearSearch()
            return
        }

        if (filterType === 'status') {
            updateFiltersAndFetch({ status: '' }, showAllOnSearch)
        }

        if (filterType === 'businessType') {
            updateFiltersAndFetch({ businessType: '' }, showAllOnSearch)
        }
    }, [hookClearSearch, updateFiltersAndFetch, showAllOnSearch]);

    const clearAllFilters = useCallback(async () => {
        console.log('Clearing all filters')

        await hookClearFilters()
        setSelectedMember(null)
        window.scrollTo({ top: 0, behavior: 'smooth' })
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
                    
                    const existingClients = JSON.parse(localStorage.getItem('clients') || '[]');
                    const newClients = [
                        ...existingClients,
                        ...parsedData.map((client, index) => ({
                            id: Date.now() + index,
                            ...client,
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString()
                        }))
                    ];
                    localStorage.setItem('clients', JSON.stringify(newClients));
                    
                    setImportFile(null);
                    setValidationErrors([]);
                    setIsDragging(false);
                    if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                    }
                    
                    setIsImportModalOpen(false);
                    await refreshData();
                    toast.success(`Berhasil mengimport ${parsedData.length} client`);
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

    const getTotalActiveCriteria = useCallback(() => {
        return countActiveFilters(localFilters);
    }, [localFilters]);

    const getActiveFiltersCount = useCallback(() => {
        let count = 0;
        if (localFilters.status) count++;
        if (localFilters.businessType) count++;
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

    const availableStatuses = useMemo(() => {
        return formatStatuses(members);
    }, [members]);

    const formattedMembers = useMemo(() => {
        return formatMembersForTable(members, pagination, isInShowAllMode, getBusinessDisplayName);
    }, [members, pagination, isInShowAllMode, getBusinessDisplayName]);

    const tableConfig = useMemo(() => ({
        headers: ['No', 'Full Name', 'Email', 'Phone', 'Company', 'Business Type', 'Program Name', 'Status', 'Action'],
        title: "Client Management",
        addButton: "Add Client",
        detailTitle: "Client Details"
    }), []);

    useEffect(() => {
        if (members.length > 0) {
            setAvailableBusinessTypes(formatBusinessTypes(members));
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
        handleSelectMember,
        handleSearch,
        handleStatusFilterChange,
        handleBusinessTypeFilterChange,
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
        getBusinessDisplayName,
        updateClientStatus
    };
};

export default useProgramClient;