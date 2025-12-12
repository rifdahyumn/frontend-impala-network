import Header from "../components/Layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Loader2, Plus, Users, RefreshCw, Briefcase, Filter, X, AlertCircle, CheckSquare, Download, Upload, FileText, FileSpreadsheet } from "lucide-react";
import { Button } from "../components/ui/button"
import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import SearchBar from '../components/SearchFilter/SearchBar';
import MemberTable from '../components/MemberTable/MemberTable';
import Pagination from '../components/Pagination/Pagination';
import ClientContent from "../components/Content/ClientContent";
import { toast } from 'react-hot-toast';
import AddClient from "../components/AddButton/AddClient";
import { useClients } from '../hooks/useClients';
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuCheckboxItem } from "../components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Input } from "../components/ui/input";

const ProgramClient = () => {
    const [selectedMember, setSelectedMember] = useState(null);
    const [editingClient, setEditingClient] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [importFile, setImportFile] = useState(null);
    const [isImporting, setIsImporting] = useState(false);
    const fileInputRef = useRef(null);
    const [highlightDetail, setHighlightDetail] = useState(false);
    const clientDetailRef = useRef(null);
    const [localFilters, setLocalFilters] = useState({
        search: '',
        status: '',
        businessType: '',
    });
    const [availableBusinessTypes, setAvailableBusinessTypes] = useState([]);
    const {
        members,
        loading,
        error,
        pagination,
        fetchClients,
        searchClients,
        toggleShowAllOnSearch,
        clearFilters: hookClearFilters,
        clearSearch: hookClearSearch,
        updateFiltersAndFetch,
        exportClients,
        getDisplayText,
        isShowAllMode,
        resetToPaginationMode,
        handlePageChange: hookHandlePageChange,
        addClient,
        updateClient,
        deleteClient,
        refreshData
    } = useClients();

    const { showAllOnSearch } = useClients();
    const isInShowAllMode = isShowAllMode();

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
                
                clientDetailRef.current.style.transition = 'all 0.5s ease';
                
                setTimeout(() => {
                    setHighlightDetail(false);
                }, 2000);
            }
        }, 150);
    }, []);

    const applyFilters = useCallback(async () => {
        await updateFiltersAndFetch(localFilters, showAllOnSearch);
    }, [localFilters, showAllOnSearch, updateFiltersAndFetch]);

    const applySearch = useCallback(async () => {
        await searchClients(localFilters.search, showAllOnSearch);
    }, [localFilters.search, showAllOnSearch, searchClients]);

    const handleDownloadTemplate = useCallback(() => {
        try {
            const templateData = [
                {
                    'full_name': 'Contoh: John Doe',
                    'email': 'Contoh: john@example.com',
                    'phone': 'Contoh: 081234567890',
                    'company': 'Contoh: PT. Contoh Indonesia',
                    'business': 'Contoh: Technology',
                    'program_name': 'Contoh: Program Premium',
                    'status': 'Contoh: active',
                    'address': 'Contoh: Jl. Contoh No. 123',
                    'notes': 'Contoh: Catatan tambahan'
                },
            ];
            
            const headers = Object.keys(templateData[0]);
            const csvContent = [
                headers.join(','),
                ...templateData.map(row => 
                    headers.map(header => 
                        `"${row[header] || ''}"`
                    ).join(',')
                )
            ].join('\n');
            
            // Create blob and download
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `client_import_template_${new Date().getTime()}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            
            toast.success('Template CSV berhasil didownload');
        } catch (error) {
            console.error('Download template error:', error);
            toast.error('Gagal mendownload template');
        }
    }, []);

    // 🔴 TAMBAH: Fungsi untuk handle file upload
    const handleFileUpload = useCallback((event) => {
        const file = event.target.files[0];
        if (!file) return;
        
        // Validasi file type
        if (!file.name.endsWith('.csv') && file.type !== 'text/csv') {
            toast.error('Hanya file CSV yang diperbolehkan');
            return;
        }
        
        // Validasi file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('File terlalu besar. Maksimal 5MB');
            return;
        }
        
        setImportFile(file);
    }, []);

    // 🔴 TAMBAH: Fungsi untuk import CSV
    const handleImportCSV = useCallback(async () => {
        if (!importFile) {
            toast.error('Pilih file CSV terlebih dahulu');
            return;
        }
        
        setIsImporting(true);
        
        try {
            // Read CSV file
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const csvText = e.target.result;
                    const rows = csvText.split('\n');
                    const headers = rows[0].split(',').map(h => h.trim().replace(/"/g, ''));
                    
                    // Parse CSV data
                    const importedClients = [];
                    for (let i = 1; i < rows.length; i++) {
                        if (!rows[i].trim()) continue;
                        
                        const values = rows[i].split(',').map(v => v.trim().replace(/"/g, ''));
                        const client = {};
                        
                        headers.forEach((header, index) => {
                            client[header] = values[index] || '';
                        });
                        
                        // Skip contoh data
                        if (client.full_name?.includes('Contoh:')) continue;
                        if (client.email?.includes('Contoh:')) continue;
                        
                        // Validasi data minimal
                        if (client.full_name && client.email) {
                            importedClients.push(client);
                        }
                    }
                    
                    if (importedClients.length === 0) {
                        toast.error('Tidak ada data valid yang ditemukan dalam file');
                        return;
                    }
                    
                    // Simulasi import data (ganti dengan API call sebenarnya)
                    console.log('Data yang akan diimport:', importedClients);
                    
                    // Contoh: Simpan ke localStorage untuk demo
                    // Dalam implementasi real, kirim ke API
                    const existingClients = JSON.parse(localStorage.getItem('clients') || '[]');
                    const newClients = [
                        ...existingClients,
                        ...importedClients.map((client, index) => ({
                            id: Date.now() + index,
                            ...client,
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString()
                        }))
                    ];
                    localStorage.setItem('clients', JSON.stringify(newClients));
                    
                    // Reset form
                    setImportFile(null);
                    if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                    }
                    
                    // Close modal
                    setIsImportModalOpen(false);
                    
                    // Refresh data
                    await refreshData();
                    
                    toast.success(`Berhasil mengimport ${importedClients.length} client`);
                } catch (parseError) {
                    console.error('Parse error:', parseError);
                    toast.error('Format file CSV tidak valid');
                }
            };
            
            reader.readAsText(importFile);
        } catch (error) {
            console.error('Import error:', error);
            toast.error('Gagal mengimport data');
        } finally {
            setIsImporting(false);
        }
    }, [importFile, refreshData]);

    // 🔴 TAMBAH: Fungsi untuk open import modal
    const handleOpenImportModal = useCallback(() => {
        setImportFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        setIsImportModalOpen(true);
    }, []);

    // EKSTRAK SEMUA STATUS UNIK DARI DATA CLIENT
    const availableStatuses = useMemo(() => {
        if (!members.length) return [];
        
        const allStatuses = members
            .map(client => client.status)
            .filter(status => status && status.trim() !== "");
        
        const uniqueStatuses = [...new Set(allStatuses)].sort();
        
        return uniqueStatuses.map(status => ({
            value: status.toLowerCase(),
            label: status === 'active' ? 'Active' : status === 'inactive' ? 'Inactive' : `${status}`,
            original: status
        }));
    }, [members]);

    useEffect(() => {
        if (members.length > 0) {
            const allBusinessTypes = members
                .map(client => client.business)
                .filter(business => business && business.trim() !== "");
            
            const uniqueBusinessTypes = [...new Set(allBusinessTypes)].sort();
            
            const formattedTypes = uniqueBusinessTypes.map(businessType => ({
                value: businessType.toLowerCase(),
                label: `${businessType}`,
                original: businessType
            }));
            
            setAvailableBusinessTypes(formattedTypes);
        }
    }, [members]);

    const statusOptions = [
        { value: 'active', label: '🟢 Active', color: 'text-green-600 bg-green-50' },
        { value: 'inactive', label: '🔴 Inactive', color: 'text-red-600 bg-red-50' },
    ];

    const handleSearch = useCallback((term) => {
        setLocalFilters(prev => ({ ...prev, search: term }));
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (localFilters.search !== '') {
                applySearch();
            }
        }, 500);
        
        return () => clearTimeout(timer);
    }, [localFilters.search, applySearch]);

    useEffect(() => {
        if (localFilters.status !== '' || localFilters.businessType !== '') {
            const timer = setTimeout(() => {
                applyFilters();
            }, 300);
            
            return () => clearTimeout(timer);
        }
    }, [localFilters.status, localFilters.businessType, applyFilters]);

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

    const clearAllFilters = useCallback(async () => {
        // Reset state lokal
        setLocalFilters({
            search: '',
            status: '',
            businessType: '',
        });
        setSelectedMember(null);
        await hookClearFilters();
        await fetchClients(1, {}, false);
        
        // Scroll ke atas
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [hookClearFilters, fetchClients]);

    const clearFilter = useCallback((filterType) => {
        if (filterType === 'search') {
            setLocalFilters(prev => ({ ...prev, search: '' }));
            hookClearSearch();
            return;
        }
        
        setLocalFilters(prev => ({ ...prev, [filterType]: '' }));
    }, [hookClearSearch]);

    const handleToggleShowAll = useCallback(async (checked) => {
        await toggleShowAllOnSearch(checked);
        
        if (localFilters.search || localFilters.status || localFilters.businessType) {
            await applyFilters();
        }
    }, [toggleShowAllOnSearch, localFilters, applyFilters]);

    const handleResetToPagination = useCallback(async () => {
        await resetToPaginationMode();
    }, [resetToPaginationMode]);

    const handleExport = useCallback(async () => {
        try {
            await exportClients('csv');
        } catch (error) {
            console.error('Export failed:', error);
            toast.error('Failed to export clients');
        }
    }, [exportClients]);

    const handleAddClient = useCallback(() => {
        setIsAddClientModalOpen(true);
    }, []);

    const handleOpenEditModal = useCallback((client) => {
        setEditingClient(client);
        setIsEditModalOpen(true);
    }, []);

    const handleEditClient = useCallback(async (clientId, clientData) => {
        try {
            const updatedClient = await updateClient(clientId, clientData);

            if (selectedMember && selectedMember.id === clientId) {
                setSelectedMember(prev => ({
                    ...prev,
                    ...clientData,
                    ...updatedClient
                }));
            }

            setIsEditModalOpen(false);
            setEditingClient(null);
            toast.success('Client Updated successfully');
            
            // Refresh data dengan filter yang sama
            await fetchClients(pagination.page, localFilters, showAllOnSearch);
        } catch (error) {
            console.error('Error updating', error);
            toast.error(error.message || 'Failed to update client');
        }
    }, [updateClient, selectedMember, fetchClients, pagination.page, localFilters, showAllOnSearch]);

    const handleAddNewClient = useCallback(async (clientData) => {
        try {
            await addClient(clientData);
            setIsAddClientModalOpen(false);
            toast.success('Client added successfully');
            
            await fetchClients(pagination.page, localFilters, showAllOnSearch);
            
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (error) {
            console.error('Error adding client', error);
            toast.error(error.message || 'Failed to add client');
        }
    }, [addClient, fetchClients, pagination.page, localFilters, showAllOnSearch]);

    const handleDeleteClient = useCallback(async (clientId) => {
        if (!selectedMember) return;

        if (!window.confirm(`Are you sure want to delete ${selectedMember.full_name}? This action cannot be undone.`)) {
            return;
        }

        try {
            await deleteClient(clientId);
            setSelectedMember(null);
            toast.success('Client deleted successfully');
            
            // Refresh data dengan filter yang sama
            await fetchClients(pagination.page, localFilters, showAllOnSearch);
            
            // Scroll ke atas setelah delete
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (error) {
            console.error('Error deleting client', error);
            toast.error(error.message || 'Failed to delete client');
        }
    }, [selectedMember, deleteClient, fetchClients, pagination.page, localFilters, showAllOnSearch]);

    const handleRefreshWithReset = useCallback(() => {
        setSelectedMember(null); 
        refreshData();
        clearAllFilters();
    }, [refreshData, clearAllFilters]);

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

    const handlePageChange = useCallback((page) => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        hookHandlePageChange(page);
    }, [hookHandlePageChange]);

    const getActiveFiltersCount = useCallback(() => {
        let count = 0;
        if (localFilters.status) count++;
        if (localFilters.businessType) count++;
        return count;
    }, [localFilters]);

    const getTotalActiveCriteria = useCallback(() => {
        let count = 0;
        if (localFilters.search) count++;
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

    const getBusinessDisplayName = useCallback((businessValue) => {
        if (!businessValue) return '-';
        
        if (typeof businessValue === 'string') {
            return businessValue;
        }
        
        if (Array.isArray(businessValue)) {
            return businessValue.join(', ');
        }
        
        return String(businessValue);
    }, []);

    const formattedMembers = useMemo(() => {
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
    }, [members, pagination.page, pagination.limit, getBusinessDisplayName, isInShowAllMode]);

    const tableConfig = useMemo(() => ({
        headers: ['No', 'Full Name', 'Email', 'Phone', 'Company', 'Business Type', 'Program Name', 'Status', 'Action'],
        title: "Client Management",
        addButton: "Add Client",
        detailTitle: "Client Details"
    }), []);

    return (
        <div className='flex pt-20 min-h-screen bg-gray-100'>
            <div className='flex-1 p-6 max-w-screen-2xl mx-auto w-full'>
                <Header />
                <Card className='mb-6 max-w-none'>
                    <CardHeader>
                        <CardTitle className='text-xl'>{tableConfig.title}</CardTitle>

                        {loading && (
                            <div className="flex items-center gap-2 text-blue-600">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span className="text-sm">Loading clients...</span>
                            </div>
                        )}
                    </CardHeader>
                    <CardContent>
                        {error && (
                            <div className="p-4 bg-red-50 border border-red-200 rounded-xl shadow-sm mb-6">
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                                    <div className="flex-1">
                                        <h3 className="text-sm font-semibold text-red-800">Failed to load clients</h3>
                                        <p className="text-sm text-red-600 mt-1">{error}</p>
                                    </div>
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        onClick={handleRefreshWithReset}
                                        className="flex items-center gap-2 border-red-300 text-red-700 hover:bg-red-100"
                                    >
                                        <RefreshCw className="h-4 w-4" />
                                        Retry
                                    </Button>
                                </div>
                            </div>
                        )}

                        <div className='flex flex-wrap gap-4 mb-6 justify-between'>
                            <div className='flex gap-2 items-center flex-wrap'>
                                <SearchBar 
                                    onSearch={handleSearch}
                                    placeholder="Search clients..."
                                    value={localFilters.search}
                                    onChange={(e) => setLocalFilters(prev => ({ ...prev, search: e.target.value }))}
                                />
                                
                                {localFilters.search.trim() !== '' && (
                                    <div className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-lg border border-blue-200">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={showAllOnSearch}
                                                onChange={(e) => handleToggleShowAll(e.target.checked)}
                                                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                            />
                                            <span className="text-sm font-medium text-blue-700">
                                                Show all results
                                            </span>
                                        </label>
                                        
                                        {isInShowAllMode && (
                                            <button
                                                onClick={handleResetToPagination}
                                                className="text-xs text-blue-600 hover:text-blue-800 underline ml-2"
                                            >
                                                Switch to pages
                                            </button>
                                        )}
                                    </div>
                                )}
                                
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button 
                                            variant={getActiveFiltersCount() > 0 ? "default" : "outline"}
                                            className={`flex items-center gap-2 transition-all duration-200 ${
                                                getActiveFiltersCount() > 0 
                                                    ? "bg-amber-500 hover:bg-amber-600 text-white shadow-sm border-amber-500" 
                                                    : "text-gray-700 hover:text-amber-600 hover:border-amber-400 hover:bg-amber-50 border-gray-300"
                                            }`}
                                        >
                                            <Filter className={`h-4 w-4 ${
                                                getActiveFiltersCount() > 0 ? "text-white" : "text-gray-500"
                                            }`} />
                                            Filter
                                            {getActiveFiltersCount() > 0 && (
                                                <span className="ml-1 bg-white text-amber-600 text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                                                    {getActiveFiltersCount()}
                                                </span>
                                            )}
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-56 shadow-lg border border-gray-200">
                                        <DropdownMenuLabel className="text-gray-700 font-semibold">Filter Options</DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        
                                        <DropdownMenuGroup>
                                            <DropdownMenuLabel className="text-xs text-gray-500 font-medium">
                                                Status
                                            </DropdownMenuLabel>
                                            {statusOptions.map((option) => (
                                                <DropdownMenuCheckboxItem
                                                    key={option.value}
                                                    checked={localFilters.status === option.value}
                                                    onCheckedChange={() => handleStatusFilterChange(option.value)}
                                                    className="flex items-center gap-2 cursor-pointer hover:bg-gray-50"
                                                >
                                                    {option.label}
                                                </DropdownMenuCheckboxItem>
                                            ))}
                                        </DropdownMenuGroup>
                                        
                                        <DropdownMenuSeparator />
                                        
                                        <DropdownMenuGroup>
                                            <DropdownMenuLabel className="text-xs text-gray-500 font-medium">
                                                Business Type
                                            </DropdownMenuLabel>
                                            <div className="max-h-48 overflow-y-auto">
                                                <DropdownMenuCheckboxItem
                                                    checked={localFilters.businessType === 'all'}
                                                    onCheckedChange={() => handleBusinessTypeFilterChange('all')}
                                                    className="cursor-pointer hover:bg-gray-50"
                                                >
                                                    All Business Types
                                                </DropdownMenuCheckboxItem>
                                                
                                                {availableBusinessTypes.map((businessType) => (
                                                    <DropdownMenuCheckboxItem
                                                        key={businessType.value}
                                                        checked={localFilters.businessType?.toLowerCase() === businessType.value.toLowerCase()}
                                                        onCheckedChange={() => handleBusinessTypeFilterChange(businessType.value)}
                                                        className="cursor-pointer hover:bg-gray-50"
                                                    >
                                                        {businessType.original}
                                                    </DropdownMenuCheckboxItem>
                                                ))}
                                            </div>
                                        </DropdownMenuGroup>
                                        
                                        <DropdownMenuSeparator />
                                        
                                        <DropdownMenuItem 
                                            onClick={() => {
                                                setLocalFilters(prev => ({
                                                    ...prev,
                                                    status: '',
                                                    businessType: ''
                                                }));
                                            }}
                                            className="text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer font-medium"
                                        >
                                            <X className="h-4 w-4 mr-2" />
                                            Clear Filters
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            <div className='flex flex-wrap gap-2'>
                                <Button 
                                    onClick={handleAddClient} 
                                    className='flex items-center gap-2 whitespace-nowrap'
                                >
                                    <Plus className="h-4 w-4" />
                                    {tableConfig.addButton}
                                </Button>
                                
                                {/* 🔴 TAMBAH: Import Button dengan Dropdown */}
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className="flex items-center gap-2 border-blue-500 text-blue-600 hover:bg-blue-50 whitespace-nowrap"
                                        >
                                            <Upload className="h-4 w-4" />
                                            Import
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-48">
                                        <DropdownMenuItem 
                                            onClick={handleDownloadTemplate}
                                            className="flex items-center gap-2 cursor-pointer"
                                        >
                                            <Download className="h-4 w-4" />
                                            Download Template
                                        </DropdownMenuItem>
                                        <DropdownMenuItem 
                                            onClick={handleOpenImportModal}
                                            className="flex items-center gap-2 cursor-pointer"
                                        >
                                            <FileSpreadsheet className="h-4 w-4" />
                                            Upload File
                                        </DropdownMenuItem>
                                </DropdownMenuContent>
                                </DropdownMenu>
                                
                                {/* 🔴 MODIFIKASI: ExportButton */}
                                <Button 
                                    onClick={handleExport}
                                    variant="outline"
                                    className="flex items-center gap-2 border-green-500 text-green-600 hover:bg-green-50 whitespace-nowrap"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <>
                                            <Download className="h-4 w-4" />
                                            Export {isInShowAllMode ? 'All' : ''}
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                        
                        {isInShowAllMode && (
                            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                        <CheckSquare className="h-5 w-5 text-blue-600" />
                                        <p className="text-sm text-blue-700">
                                            <strong>All search results are shown in one page.</strong> 
                                            {localFilters.search && ` Search term: "${localFilters.search}"`}
                                        </p>
                                    </div>
                                    <button 
                                        onClick={handleResetToPagination}
                                        className="text-sm text-blue-600 hover:text-blue-800 underline whitespace-nowrap"
                                    >
                                        Switch to paginated view
                                    </button>
                                </div>
                            </div>
                        )}
                        
                        {getTotalActiveCriteria() > 0 && (
                            <div className="mb-4 flex flex-wrap items-center gap-2">
                                <span className="text-sm text-gray-600">Active filters:</span>
                                
                                {localFilters.search && (
                                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-1 whitespace-nowrap">
                                        <span>"{localFilters.search}"</span>
                                        <button 
                                            onClick={() => clearFilter('search')}
                                            className="text-blue-600 hover:text-blue-800 ml-1"
                                        >
                                            ×
                                        </button>
                                    </span>
                                )}
                                
                                {localFilters.status && (
                                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center gap-1 whitespace-nowrap">
                                        {getStatusLabel(localFilters.status)}
                                        <button 
                                            onClick={() => clearFilter('status')}
                                            className="text-green-600 hover:text-green-800 ml-1"
                                        >
                                            ×
                                        </button>
                                    </span>
                                )}
                                
                                {localFilters.businessType && localFilters.businessType !== 'all' && (
                                    <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm flex items-center gap-1 whitespace-nowrap">
                                        <Briefcase className="w-3 h-3" />
                                        {getBusinessTypeLabel(localFilters.businessType)}
                                        <button 
                                            onClick={() => clearFilter('businessType')}
                                            className="text-purple-600 hover:text-purple-800 ml-1"
                                        >
                                            ×
                                        </button>
                                    </span>
                                )}
                                
                                {localFilters.businessType === 'all' && (
                                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-1 whitespace-nowrap">
                                        <Briefcase className="w-3 h-3" />
                                        All Business Types
                                        <button 
                                            onClick={() => clearFilter('businessType')}
                                            className="text-blue-600 hover:text-blue-800 ml-1"
                                        >
                                            ×
                                        </button>
                                    </span>
                                )}
                                
                                <Button 
                                    variant="ghost" 
                                    onClick={clearAllFilters}
                                    className="text-sm h-8 whitespace-nowrap"
                                    size="sm"
                                >
                                    Clear All
                                </Button>
                            </div>
                        )}

                        {loading && members.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 space-y-4">
                                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                                <span className="text-gray-600">Loading clients...</span>
                                <div className="w-64 bg-gray-200 rounded-full h-2">
                                    <div className="bg-blue-600 h-2 rounded-full animate-pulse w-3/4"></div>
                                </div>
                            </div>
                        ) : members.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 space-y-4 text-center">
                                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
                                    <Users className="w-10 h-10 text-gray-400" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-lg font-semibold text-gray-700">
                                        No clients found
                                    </h3>
                                    <p className="text-sm text-gray-500 max-w-md">
                                        {getTotalActiveCriteria() > 0 
                                            ? "No clients match your current filters. Try adjusting your criteria."
                                            : "Get started by adding your first client to the system."
                                        }
                                    </p>
                                </div>
                                {getTotalActiveCriteria() > 0 ? (
                                    <Button 
                                        className="flex items-center gap-2"
                                        onClick={clearAllFilters}
                                        variant="outline"
                                    >
                                        <RefreshCw className="h-4 w-4" />
                                        Clear Filters
                                    </Button>
                                ) : (
                                    <Button 
                                        className="flex items-center gap-2"
                                        onClick={handleAddClient}
                                    >
                                        <Plus className="h-4 w-4" />
                                        Add Your First Client
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <>
                                <div className="relative">
                                    {loading && (
                                        <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center z-10 rounded-lg">
                                            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-lg border">
                                                <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                                                <span className="text-sm text-gray-600">Updating data...</span>
                                            </div>
                                        </div>
                                    )}
                                    
                                    
                                    <MemberTable
                                        members={formattedMembers}
                                        onSelectMember={handleSelectMember}
                                        headers={tableConfig.headers}
                                        isLoading={loading}
                                    />
                                </div>

                                <div className='mt-6 flex flex-col sm:flex-row justify-between items-center gap-4'>
                                    <div className="text-sm text-gray-600">
                                        {getDisplayText()}
                                        {getTotalActiveCriteria() > 0 && !isInShowAllMode && " (filtered)"}
                                    </div>
                                    
                                    {!isInShowAllMode && pagination.totalPages > 1 ? (
                                        <Pagination 
                                            currentPage={pagination.page}
                                            totalPages={pagination.totalPages}
                                            totalItems={pagination.total}
                                            itemsPerPage={pagination.limit}
                                            onPageChange={handlePageChange}
                                            disabled={loading}
                                        />
                                    ) : isInShowAllMode ? (
                                        <div className="text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full flex items-center gap-2">
                                            <CheckSquare className="h-4 w-4" />
                                            All results shown in one page
                                        </div>
                                    ) : null}
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>

            
                <div 
                    ref={clientDetailRef}
                    className={`
                        transition-all duration-500 ease-in-out
                        ${highlightDetail ? 'rounded-xl p-1 -m-1 bg-blue-50/50' : ''}
                    `}
                >
                    <ClientContent
                        selectedMember={selectedMember}
                        onOpenEditModal={handleOpenEditModal}
                        onDelete={handleDeleteClient}
                        detailTitle={tableConfig.detailTitle}
                        onClientUpdated={() => fetchClients(pagination.page, localFilters, showAllOnSearch)}
                        onClientDeleted={() => {
                            fetchClients(pagination.page, localFilters, showAllOnSearch);
                            setSelectedMember(null);
                        }}
                    />
                </div>

                <AddClient 
                    isAddUserModalOpen={isAddClientModalOpen || isEditModalOpen}
                    setIsAddUserModalOpen={(open) => {
                        if (!open) {
                            setIsAddClientModalOpen(false);
                            setIsEditModalOpen(false);
                            setEditingClient(null);
                        }
                    }}
                    onAddClient={handleAddNewClient}
                    editData={editingClient}
                    onEditClient={handleEditClient}
                />

                {/* 🔴 PERUBAHAN: Modal Import CSV dengan area upload yang tidak melampaui background */}
                <Dialog open={isImportModalOpen} onOpenChange={setIsImportModalOpen}>
                    <DialogContent className="sm:max-w-lg md:max-w-xl lg:max-w-2xl w-[95vw] max-w-[800px]">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-xl">
                                <FileSpreadsheet className="h-5 w-5 text-blue-600" />
                                Import Clients from CSV
                            </DialogTitle>
                            <DialogDescription className="text-base">
                                Upload a CSV file to import multiple clients at once.
                            </DialogDescription>
                        </DialogHeader>
                        
                        <div className="space-y-4 py-4">
                            {/* Petunjuk */}
                            <div className="bg-blue-50 p-4 rounded-lg">
                                <h4 className="text-sm font-medium text-blue-800 mb-2">Instructions:</h4>
                                <ul className="text-sm text-blue-600 space-y-1 list-disc list-inside">
                                    <li>Download the template first for correct format</li>
                                    <li>Fill in the data according to the columns</li>
                                    <li>Maximum file size: 5MB</li>
                                    <li>Only CSV files are supported</li>
                                </ul>
                            </div>
                            
                            {/* Upload Area - TAMBAH: max-w-full dan overflow-hidden */}
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 md:p-8 text-center hover:border-blue-400 transition-colors max-w-full overflow-hidden">
                                {importFile ? (
                                    <div className="space-y-3">
                                        <FileText className="h-12 w-12 text-green-500 mx-auto" />
                                        <p className="font-medium text-gray-700 text-lg truncate max-w-full px-2">{importFile.name}</p>
                                        <p className="text-sm text-gray-500">
                                            {(importFile.size / 1024).toFixed(2)} KB
                                        </p>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                setImportFile(null);
                                                if (fileInputRef.current) {
                                                    fileInputRef.current.value = '';
                                                }
                                            }}
                                            className="text-red-600 hover:text-red-700 mt-2"
                                        >
                                            Remove File
                                        </Button>
                                    </div>
                                ) : (
                                    <>
                                        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                        <p className="text-base text-gray-600 mb-3 px-2">
                                            <strong>Drag & drop your CSV file here, or click to browse</strong>
                                        </p>
                                        <Input
                                            ref={fileInputRef}
                                            type="file"
                                            accept=".csv"
                                            onChange={handleFileUpload}
                                            className="hidden"
                                            id="csv-upload"
                                        />
                                        <Button
                                            variant="outline"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="mt-2 px-6 py-2"
                                        >
                                            Select File
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                        
                        <DialogFooter className="flex flex-col sm:flex-row gap-3">
                            <Button
                                onClick={handleImportCSV}
                                disabled={!importFile || isImporting}
                                className="flex items-center gap-2 px-6 py-2 w-full sm:w-auto justify-center"
                            >
                                {isImporting ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Importing...
                                    </>
                                ) : (
                                    <>
                                        <Upload className="h-4 w-4" />
                                        Import File
                                    </>
                                )}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
};

export default ProgramClient;