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
    const [localFilters, setLocalFilters] = useState({
        search: '',
        status: '',
        businessType: '',
    });
     const [availableBusinessTypes, setAvailableBusinessTypes] = useState([]);
  
    const fileInputRef = useRef(null);
    const dropZoneRef = useRef(null);
    const clientDetailRef = useRef(null);

    const {
        members,
        loading,
        error,
        pagination,
        fetchClients,
        clearFilters: hookClearFilters,
        clearSearch: hookClearSearch,
        resetToPaginationMode,
        handlePageChange: hookHandlePageChange,
        addClient,
        updateClient,
        deleteClient,
        refreshData,
    } = useClients();

    const isInShowAllMode = false;

    const handleSearch = useCallback((term) => {
        setLocalFilters(prev => ({ ...prev, search: term }));
    }, []);

    const handleStatusFilterChange = useCallback((status) => {
        setLocalFilters(prev => ({
            ...prev,
            status: prev.status === status ? '' : status
        }));
    }, []);

    const handleBusinessTypeFilterChange = useCallback((businessType) => {
        setLocalFilters(prev => ({
            ...prev,
            businessType: prev.businessType === businessType ? '' : businessType
        }));
    }, []);

    const clearFilter = useCallback((filterType) => {
        if (filterType === 'search') {
            setLocalFilters(prev => ({ ...prev, search: '' }));
            hookClearSearch();
            return;
        }
        
        setLocalFilters(prev => ({ ...prev, [filterType]: '' }));
    }, [hookClearSearch]);

    const clearAllFilters = useCallback(async () => {
        setLocalFilters({
            search: '',
            status: '',
            businessType: '',
        });
        setSelectedMember(null);
        await hookClearFilters();
        await fetchClients(1, {}, false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [hookClearFilters, fetchClients]);

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
        getBusinessDisplayName
    };
};

export default useProgramClient;