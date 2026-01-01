import Header from "../components/Layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Plus, Loader2, Users, RefreshCw, AlertCircle, Tag, Filter, X, CheckSquare, Download, Upload, FileText, FileSpreadsheet } from "lucide-react";
import { Button } from "../components/ui/button"
import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import SearchBar from '../components/SearchFilter/SearchBar';
import MemberTable from '../components/MemberTable/MemberTable';
import Pagination from "../components/Pagination/Pagination";
import ProgramContent from "../components/Content/ProgramClient";
import toast from "react-hot-toast";
import { usePrograms } from "../hooks/usePrograms";
import AddProgram from "../components/AddButton/AddProgram";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuGroup, 
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem
} from "../components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import * as XLSX from 'xlsx';

const Program = () => {
    const [selectedProgram, setSelectedProgram] = useState(null)
    const [isAddProgramModalOpen, setIsAddProgramModalOpen] = useState(false)
    const [editingProgram, setEditingProgram] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    
    // State untuk modal import (diperbarui)
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [importFile, setImportFile] = useState(null);
    const [isImporting, setIsImporting] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [validationErrors, setValidationErrors] = useState([]);
    const [isDragging, setIsDragging] = useState(false);
    
    // Ref untuk upload input
    const fileInputRef = useRef(null);
    const dropZoneRef = useRef(null);
    
    // State untuk visual feedback auto-scroll
    const [highlightDetail, setHighlightDetail] = useState(false);
    
    // Ref untuk auto-scroll ke detail section
    const programDetailRef = useRef(null);
    
    const {
        programs,
        loading,
        error,
        pagination,
        filters,
        showAllOnSearch,
        updateFiltersAndFetch,
        searchPrograms,
        toggleShowAllOnSearch,
        clearFilters,
        clearSearch,
        getDisplayText,
        isShowAllMode,
        resetToPaginationMode,
        fetchPrograms: hookFetchPrograms,
        addProgram,
        updateProgram,
        deleteProgram,
        refreshData
    } = usePrograms();

    // State lokal hanya untuk UI control
    const [searchTerm, setSearchTerm] = useState("");
    const [availableCategories, setAvailableCategories] = useState([]);

    // Fungsi untuk handle select program dengan auto-scroll
    const handleSelectProgram = useCallback((program) => {
        setSelectedProgram(program);
        setHighlightDetail(true);
        
        setTimeout(() => {
            if (programDetailRef.current) {
                programDetailRef.current.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'start',
                    inline: 'nearest'
                });
                
                programDetailRef.current.style.transition = 'all 0.5s ease';
                
                setTimeout(() => {
                    setHighlightDetail(false);
                }, 2000);
            }
        }, 150);
    }, []);

    // ===================== IMPORT FUNCTIONS =====================

    // Handle drag events
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
        
        if (dropZoneRef.current && 
            !dropZoneRef.current.contains(e.relatedTarget)) {
            setIsDragging(false);
        }
    }, []);

    // Handle file drop
    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        
        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            const file = files[0];
            processFile(file);
        }
    }, []);

    // Process uploaded file
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
        
        // Read and parse file untuk validasi
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const { data: parsedData, errors } = parseExcel(data);
                
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

    // Fungsi untuk handle file upload via input
    const handleFileUpload = useCallback((event) => {
        const file = event.target.files[0];
        if (!file) return;
        processFile(file);
    }, [processFile]);

    // Fungsi untuk trigger file input click
    const handleTriggerFileInput = useCallback(() => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    }, []);

    // Fungsi untuk reset file dan kembali ke state awal
    const handleRemoveFile = useCallback(() => {
        setImportFile(null);
        setValidationErrors([]);
        setIsDragging(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }, []);

    // Fungsi untuk ganti file
    const handleChangeFile = useCallback(() => {
        handleTriggerFileInput();
    }, [handleTriggerFileInput]);

    // Fungsi untuk download template Excel
    const handleDownloadTemplate = useCallback(() => {
        try {
            const templateData = [
                {
                    'program_name': 'Contoh: Program Premium',
                    'category': 'Contoh: Technology',
                    'status': 'Contoh: active',
                    'duration': 'Contoh: 30 days',
                    'price': 'Contoh: 5000000',
                    'client': 'Contoh: John Doe',
                    'start_date': 'Contoh: 2024-01-01',
                    'end_date': 'Contoh: 2024-01-30',
                    'description': 'Contoh: Program training premium untuk client'
                },
            ];
            
            const headers = Object.keys(templateData[0]);
            
            // Buat worksheet dengan data template
            const wsData = [
                headers.map(header => header.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())),
                ...templateData.map(row => 
                    headers.map(header => row[header] || '')
                )
            ];
            
            const ws = XLSX.utils.aoa_to_sheet(wsData);
            
            // Set column width
            if (!ws['!cols']) ws['!cols'] = [];
            headers.forEach((_, i) => {
                ws['!cols'][i] = { wch: 25 };
            });
            
            // Buat workbook dan download
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Template");
            
            // Generate Excel file
            XLSX.writeFile(wb, `program_import_template_${new Date().getTime()}.xlsx`);
            
            toast.success('Template Excel berhasil didownload');
        } catch (error) {
            console.error('Download template error:', error);
            toast.error('Gagal mendownload template');
        }
    }, []);

    // Validasi file Excel
    const validateExcelFile = (file) => {
        const errors = [];
        
        // Validasi ekstensi file
        const validExtensions = ['.xlsx', '.xls'];
        const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
        
        if (!validExtensions.includes(fileExtension)) {
            errors.push('File harus berformat Excel (.xlsx atau .xls)');
        }
        
        // Validasi ukuran file (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            errors.push('File terlalu besar. Maksimal 10MB');
        }
        
        // Validasi tipe MIME
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

    // Validasi row data
    const validateRowData = (row, rowIndex) => {
        const errors = [];
        
        // Validasi kolom wajib
        if (!row.program_name || row.program_name.toString().trim() === '') {
            errors.push(`Baris ${rowIndex}: Kolom "program_name" wajib diisi`);
        }
        
        if (!row.category || row.category.toString().trim() === '') {
            errors.push(`Baris ${rowIndex}: Kolom "category" wajib diisi`);
        }
        
        return errors;
    };

    // Parse Excel file
    const parseExcel = (data) => {
        try {
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            
            // Convert to JSON
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
            
            if (jsonData.length === 0) {
                throw new Error('File Excel tidak berisi data');
            }
            
            // Get headers from first row
            const headers = Object.keys(jsonData[0]).map(h => h.trim());
            
            // Parse dan validasi data
            const dataRows = [];
            const errors = [];
            
            jsonData.forEach((row, index) => {
                try {
                    // Bersihkan data
                    const cleanRow = {};
                    headers.forEach(header => {
                        const value = row[header];
                        cleanRow[header] = value !== undefined && value !== null ? 
                            (typeof value === 'string' ? value.trim() : value.toString().trim()) : '';
                    });
                    
                    // Skip contoh data dari template
                    if (Object.values(cleanRow).some(value => 
                        value.toString().includes('Contoh:') || 
                        value.toString().includes('CONTOH:') ||
                        value.toString().includes('contoh:')
                    )) {
                        return;
                    }
                    
                    // Skip baris kosong
                    if (Object.values(cleanRow).every(value => value === '')) {
                        return;
                    }
                    
                    // Validasi row data
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

    // Fungsi untuk import Excel
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
                    const { data: parsedData, errors } = parseExcel(data);
                    
                    if (parsedData.length === 0) {
                        toast.error('Tidak ada data yang bisa diimport');
                        setIsImporting(false);
                        return;
                    }
                    
                    // Simpan ke localStorage
                    const existingPrograms = JSON.parse(localStorage.getItem('programs') || '[]');
                    const newPrograms = [
                        ...existingPrograms,
                        ...parsedData.map((program, index) => ({
                            id: Date.now() + index,
                            ...program,
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString()
                        }))
                    ];
                    localStorage.setItem('programs', JSON.stringify(newPrograms));
                    
                    // Reset form
                    setImportFile(null);
                    setValidationErrors([]);
                    setIsDragging(false);
                    if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                    }
                    
                    // Close modal
                    setIsImportModalOpen(false);
                    
                    // Refresh data
                    await refreshData();
                    
                    toast.success(`Berhasil mengimport ${parsedData.length} program`);
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

    // Fungsi untuk open import modal
    const handleOpenImportModal = useCallback(() => {
        setImportFile(null);
        setValidationErrors([]);
        setIsDragging(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        setIsImportModalOpen(true);
    }, []);

    // Reset import state
    const resetImportState = useCallback(() => {
        setImportFile(null);
        setValidationErrors([]);
        setIsDragging(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }, []);

    // ===================== EXPORT FUNCTIONS =====================

    // Fungsi untuk export data ke Excel/CSV
    const handleExport = useCallback(async (format = 'excel') => {
        try {
            if (!programs || programs.length === 0) {
                toast.error('No data to export');
                return;
            }
            
            setIsExporting(true);
            
            // Format data untuk export
            const exportData = programs.map((program, index) => ({
                'No': index + 1,
                'Program Name': program.program_name || '-',
                'Category': program.category || '-',
                'Status': program.status || '-',
                'Duration': program.duration || '-',
                'Price': program.price || '-',
                'Client': program.client || '-',
                'Start Date': program.start_date || '-',
                'End Date': program.end_date || '-',
                'Description': program.description || '-',
                'Created Date': program.created_at 
                    ? new Date(program.created_at).toLocaleDateString() 
                    : '-',
                'Last Updated': program.updated_at 
                    ? new Date(program.updated_at).toLocaleDateString() 
                    : '-'
            }));

            if (format === 'excel') {
               
                const ws = XLSX.utils.json_to_sheet(exportData);
                
                
                const wscols = [
                    { wch: 5 },   
                    { wch: 25 },  
                    { wch: 20 }, 
                    { wch: 10 },  
                    { wch: 15 },  
                    { wch: 15 },  
                    { wch: 25 }, 
                    { wch: 12 },  
                    { wch: 12 }, 
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
                
                // Buat workbook
                const wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, ws, "Programs");
                
                // Generate nama file
                const dateStr = new Date().toISOString().split('T')[0];
                const fileName = `programs_export_${dateStr}.xlsx`;
                
                // Export file
                XLSX.writeFile(wb, fileName);
                
                toast.success(`Exported ${exportData.length} programs to Excel`);
            } else if (format === 'csv') {
                // Untuk format CSV
                const csvContent = [
                    Object.keys(exportData[0]).join(','),
                    ...exportData.map(row => Object.values(row).join(','))
                ].join('\n');
                
                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                const link = document.createElement("a");
                const url = URL.createObjectURL(blob);
                
                link.setAttribute("href", url);
                link.setAttribute("download", `programs_export_${new Date().getTime()}.csv`);
                link.style.visibility = 'hidden';
                
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                toast.success(`Exported ${exportData.length} programs to CSV`);
            }
        } catch (error) {
            console.error('Export failed:', error);
            toast.error(`Failed to export: ${error.message}`);
        } finally {
            setIsExporting(false);
        }
    }, [programs]);

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

    useEffect(() => {
        if (programs.length > 0) {
            const allCategories = programs
                .map(program => program.category)
                .filter(category => category && category.trim() !== "");
            
            const uniqueCategories = [...new Set(allCategories)].sort();
            
            const formattedCategories = uniqueCategories.map(category => ({
                value: category.toLowerCase(),
                label: `🏷️ ${category}`,
                original: category
            }));
            
            setAvailableCategories(formattedCategories);
        }
    }, [programs]);

    const statusOptions = [
        { value: 'Active', label: 'Active', color: 'text-green-600 bg-green-50' },
        { value: 'Inactive', label: 'Inactive', color: 'text-red-600 bg-red-50' },
    ];

    const handleSearch = useCallback((term) => {
        setSearchTerm(term);
        searchPrograms(term, showAllOnSearch);
    }, [searchPrograms, showAllOnSearch]);

    const handleStatusFilterChange = useCallback((status) => {
        const newStatus = filters.status === status ? '' : status;
        updateFiltersAndFetch({ status: newStatus });
    }, [filters.status, updateFiltersAndFetch]);

    const handleCategoryFilterChange = useCallback((category) => {
        const newCategory = filters.category === category ? '' : category;
        updateFiltersAndFetch({ category: newCategory });
    }, [filters.category, updateFiltersAndFetch]);

    const handleClearAllFilters = useCallback(() => {
        setSearchTerm("");
        clearFilters();
        setSelectedProgram(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [clearFilters]);

    const clearFilter = useCallback((filterType) => {
        if (filterType === 'search') {
            setSearchTerm("");
            clearSearch();
        } else if (filterType === 'status') {
            updateFiltersAndFetch({ status: '' });
        } else if (filterType === 'category') {
            updateFiltersAndFetch({ category: '' });
        }
    }, [clearSearch, updateFiltersAndFetch]);

    const handleToggleShowAll = useCallback((checked) => {
        toggleShowAllOnSearch(checked);
    }, [toggleShowAllOnSearch]);

    const handleResetToPagination = useCallback(() => {
        resetToPaginationMode();
    }, [resetToPaginationMode]);

    const handleAddProgram = () => {
        setIsAddProgramModalOpen(true);
    };

    const handleOpenEditModal = (program) => {
        setEditingProgram(program);
        setIsEditModalOpen(true);
    };

    const handleEditProgram = async (programId, programData) => {
        try {
            const updatedProgram = await updateProgram(programId, programData)

            if (selectedProgram && selectedProgram.id === programId) {
                setSelectedProgram(prev => ({
                    ...prev,
                    ...programData,
                    ...updatedProgram
                }))
            }

            setIsEditModalOpen(false)
            setEditingProgram(null)
            toast.success('Program Updated successfully')
        } catch (error) {
            console.error('Error updating', error)
            toast.error(error.message || 'Failed to update program')
        }
    };

    const handleAddNewProgram = async (programData) => {
        try {
            await addProgram(programData);
            setIsAddProgramModalOpen(false);
            toast.success('Program added successfully');
            
            // Scroll ke atas setelah add program
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (error) {
            console.error('Error adding program:', error);
            toast.error(error.message || 'Failed to add program');
        }
    };

    const handleDeleteProgram = async (programId) => {
        if (!selectedProgram) return;

        if (!window.confirm(`Are you sure you want to delete ${selectedProgram.program_name}? This action cannot be undone.`)) {
            return;
        }

        try {
            await deleteProgram(programId);
            setSelectedProgram(null);
            toast.success('Program deleted successfully');
            
            // Scroll ke atas setelah delete
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (error) {
            console.error('Error deleting program:', error);
            toast.error(error.message || 'Failed to delete program');
        }
    };

    useEffect(() => {
        if (selectedProgram && programs.length > 0) {
            const currentSelected = programs.find(program => program.id === selectedProgram.id)
            if (currentSelected) {
                setSelectedProgram(currentSelected)
            } else {
                setSelectedProgram(null);
            }
        }
    }, [programs, selectedProgram?.id])

    const handleRefresh = () => {
        refreshData();
        handleClearAllFilters();
    };

    const handlePageChange = (page) => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        hookFetchPrograms(page);
    };

    const getActiveFiltersCount = useMemo(() => {
        let count = 0;
        if (filters.status) count++;
        if (filters.category) count++;
        return count;
    }, [filters]);

    const getTotalActiveCriteria = useMemo(() => {
        let count = 0;
        if (filters.search) count++;
        if (filters.status) count++;
        if (filters.category) count++;
        return count;
    }, [filters]);

    const getCategoryLabel = useCallback((categoryValue) => {
        if (!categoryValue || categoryValue === "all") return "All Categories";
        const category = availableCategories.find(c => c.value === categoryValue.toLowerCase());
        return category ? category.original : categoryValue;
    }, [availableCategories]);

    const getStatusLabel = useCallback((statusValue) => {
        if (!statusValue) return "";
        if (statusValue === 'active') return 'Active';
        if (statusValue === 'inactive') return 'Inactive';
        return statusValue.charAt(0).toUpperCase() + statusValue.slice(1);
    }, []);
    
    const tableConfig = {
        headers: ['No', 'Program Name', 'Client', 'Category', 'Status', 'Duration', 'Price', 'Action'],
        title: "Program Management",
        addButton: "Add Program",
        detailTitle: "Program Details"
    };

    const formattedPrograms = useMemo(() => {
        return programs.map((program, index) => {
            const itemNumber = isShowAllMode() 
                ? index + 1
                : (pagination.page - 1) * pagination.limit + index + 1;
            
            return {
                id: program.id,
                no: itemNumber,
                program_name: program.program_name,
                category: program.category,
                status: program.status,
                duration: program.duration,
                start_date: program.start_date,
                end_date: program.end_date,
                price: program.price,
                client: program.client,
                action: 'Detail',
                ...program
            };
        });
    }, [programs, pagination.page, pagination.limit, isShowAllMode]);

    return (
        <div className='flex pt-20 min-h-screen bg-gray-100'>
            <div className='flex-1 p-6'>
                <Header />
                <Card className='mb-6'>
                    <CardHeader>
                        <CardTitle className='text-xl'>{tableConfig.title}</CardTitle>
                        {loading && (
                            <div className="flex items-center gap-2 text-blue-600">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span className="text-sm">Loading programs...</span>
                            </div>
                        )}
                    </CardHeader>
                    
                    <CardContent>
                        {error && (
                            <div className="p-4 bg-red-50 border border-red-200 rounded-xl shadow-sm mb-6">
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                                    <div className="flex-1">
                                        <h3 className="text-sm font-semibold text-red-800">Failed to load programs</h3>
                                        <p className="text-sm text-red-600 mt-1">{error}</p>
                                    </div>
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        onClick={handleRefresh}
                                        className="flex items-center gap-2 border-red-300 text-red-700 hover:bg-red-100"
                                    >
                                        <RefreshCw className="h-4 w-4" />
                                        Retry
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* SEARCH & FILTER SECTION */}
                        <div className='flex flex-wrap gap-4 mb-6 justify-between'>
                            <div className='flex gap-2 items-center flex-wrap'>
                                <SearchBar 
                                    onSearch={handleSearch}
                                    placeholder="Search programs..."
                                    value={filters.search || searchTerm}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setSearchTerm(value);
                                    }}
                                />
                                
                                {/* Toggle Show All on Search */}
                                {filters.search && filters.search.trim() !== '' && (
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
                                        
                                        {isShowAllMode() && (
                                            <button
                                                onClick={handleResetToPagination}
                                                className="text-xs text-blue-600 hover:text-blue-800 underline ml-2"
                                            >
                                                Switch to pages
                                            </button>
                                        )}
                                    </div>
                                )}
                                
                                {/* FILTER DROPDOWN DENGAN WARNA AMBER */}
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button 
                                            variant={getActiveFiltersCount > 0 ? "default" : "outline"}
                                            className={`flex items-center gap-2 transition-all duration-200 ${
                                                getActiveFiltersCount > 0 
                                                    ? "bg-amber-500 hover:bg-amber-600 text-white shadow-sm border-amber-500" 
                                                    : "text-gray-700 hover:text-amber-600 hover:border-amber-400 hover:bg-amber-50 border-gray-300"
                                            }`}
                                        >
                                            <Filter className={`h-4 w-4 ${
                                                getActiveFiltersCount > 0 ? "text-white" : "text-gray-500"
                                            }`} />
                                            Filter
                                            {getActiveFiltersCount > 0 && (
                                                <span className="ml-1 bg-white text-amber-600 text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                                                    {getActiveFiltersCount}
                                                </span>
                                            )}
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-56 shadow-lg border border-gray-200">
                                        <DropdownMenuLabel className="text-gray-700 font-semibold">Filter Options</DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        
                                        {/* STATUS FILTER */}
                                        <DropdownMenuGroup>
                                            <DropdownMenuLabel className="text-xs text-gray-500 font-medium">
                                                Status
                                            </DropdownMenuLabel>
                                            {statusOptions.map((option) => (
                                                <DropdownMenuCheckboxItem
                                                    key={option.value}
                                                    checked={filters.status === option.value}
                                                    onCheckedChange={() => handleStatusFilterChange(option.value)}
                                                    className="flex items-center gap-2 cursor-pointer hover:bg-gray-50"
                                                >
                                                    {option.label}
                                                </DropdownMenuCheckboxItem>
                                            ))}
                                        </DropdownMenuGroup>
                                        
                                        <DropdownMenuSeparator />
                                        
                                        {/* CATEGORY FILTER */}
                                        <DropdownMenuGroup>
                                            <DropdownMenuLabel className="text-xs text-gray-500 font-medium">
                                                Category
                                            </DropdownMenuLabel>
                                            <div className="max-h-48 overflow-y-auto">
                                                {/* ALL CATEGORIES OPTION */}
                                                <DropdownMenuCheckboxItem
                                                    checked={filters.category === 'all'}
                                                    onCheckedChange={() => handleCategoryFilterChange('all')}
                                                    className="cursor-pointer hover:bg-gray-50"
                                                >
                                                    📋 All Categories
                                                </DropdownMenuCheckboxItem>
                                                
                                                {availableCategories.map((category) => (
                                                    <DropdownMenuCheckboxItem
                                                        key={category.value}
                                                        checked={filters.category?.toLowerCase() === category.value.toLowerCase()}
                                                        onCheckedChange={() => handleCategoryFilterChange(category.value)}
                                                        className="cursor-pointer hover:bg-gray-50"
                                                    >
                                                        <span className="mr-2">🏷️</span>
                                                        {category.original}
                                                    </DropdownMenuCheckboxItem>
                                                ))}
                                            </div>
                                        </DropdownMenuGroup>
                                        
                                        <DropdownMenuSeparator />
                                        
                                        {/* CLEAR FILTERS */}
                                        <DropdownMenuItem 
                                            onClick={() => {
                                                updateFiltersAndFetch({ 
                                                    status: '', 
                                                    category: '' 
                                                });
                                            }}
                                            className="text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer font-medium"
                                        >
                                            <X className="h-4 w-4 mr-2" />
                                            Clear Filters
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            <div className='flex gap-2'>
                                <Button 
                                    className='flex items-center gap-2'
                                    onClick={handleAddProgram}
                                >
                                    <Plus className="h-4 w-4" />
                                    {tableConfig.addButton}
                                </Button>
                                
                                {/* Import Button dengan Dropdown (diperbarui) */}
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className="flex items-center gap-2 border-blue-500 text-blue-600 hover:bg-blue-50"
                                            disabled={loading}
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
                                
                                {/* Export Button dengan Dropdown (diperbarui) */}
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className="flex items-center gap-2 border-green-500 text-green-600 hover:bg-green-50"
                                            disabled={loading || programs.length === 0 || isExporting}
                                        >
                                            {isExporting ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Download className="h-4 w-4" />
                                            )}
                                            Export {isShowAllMode() ? 'All' : ''}
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-48">
                                        <DropdownMenuItem 
                                            onClick={() => handleExport('excel')}
                                            disabled={programs.length === 0 || isExporting}
                                            className="flex items-center gap-2 cursor-pointer"
                                        >
                                            <FileSpreadsheet className="h-4 w-4" />
                                            Export as Excel
                                        </DropdownMenuItem>
                                        <DropdownMenuItem 
                                            onClick={() => handleExport('csv')}
                                            disabled={programs.length === 0 || isExporting}
                                            className="flex items-center gap-2 cursor-pointer"
                                        >
                                            <FileText className="h-4 w-4" />
                                            Export as CSV
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                        
                        {/* Show All Mode Indicator */}
                        {isShowAllMode() && (
                            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <CheckSquare className="h-5 w-5 text-blue-600" />
                                        <p className="text-sm text-blue-700">
                                            <strong>All search results are shown in one page.</strong> 
                                            {filters.search && ` Search term: "${filters.search}"`}
                                        </p>
                                    </div>
                                    <button 
                                        onClick={handleResetToPagination}
                                        className="text-sm text-blue-600 hover:text-blue-800 underline"
                                    >
                                        Switch to paginated view
                                    </button>
                                </div>
                            </div>
                        )}
                        
                        {/* ACTIVE FILTERS BADGES */}
                        {getTotalActiveCriteria > 0 && (
                            <div className="mb-4 flex flex-wrap items-center gap-2">
                                <span className="text-sm text-gray-600">Active filters:</span>
                                
                                {/* SEARCH BADGE */}
                                {filters.search && (
                                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                                        <span>🔍 "{filters.search}"</span>
                                        <button 
                                            onClick={() => clearFilter('search')}
                                            className="text-blue-600 hover:text-blue-800 ml-1"
                                        >
                                            ×
                                        </button>
                                    </span>
                                )}
                                
                                {/* STATUS FILTER BADGE */}
                                {filters.status && (
                                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                                        {getStatusLabel(filters.status)}
                                        <button 
                                            onClick={() => clearFilter('status')}
                                            className="text-green-600 hover:text-green-800 ml-1"
                                        >
                                            ×
                                        </button>
                                    </span>
                                )}
                                
                                {/* CATEGORY FILTER BADGE */}
                                {filters.category && filters.category !== 'all' && (
                                    <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                                        <Tag className="w-3 h-3" />
                                        {getCategoryLabel(filters.category)}
                                        <button 
                                            onClick={() => clearFilter('category')}
                                            className="text-purple-600 hover:text-purple-800 ml-1"
                                        >
                                            ×
                                        </button>
                                    </span>
                                )}
                                
                                {/* ALL CATEGORIES BADGE */}
                                {filters.category === 'all' && (
                                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                                        <Tag className="w-3 h-3" />
                                        All Categories
                                        <button 
                                            onClick={() => clearFilter('category')}
                                            className="text-blue-600 hover:text-blue-800 ml-1"
                                        >
                                            ×
                                        </button>
                                    </span>
                                )}
                                
                                {/* CLEAR ALL */}
                                <Button 
                                    variant="ghost" 
                                    onClick={handleClearAllFilters}
                                    className="text-sm h-8"
                                    size="sm"
                                >
                                    Clear All
                                </Button>
                            </div>
                        )}

                        {loading && programs.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 space-y-4">
                                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                                <span className="text-gray-600">Loading programs...</span>
                                <div className="w-64 bg-gray-200 rounded-full h-2">
                                    <div className="bg-blue-600 h-2 rounded-full animate-pulse w-3/4"></div>
                                </div>
                            </div>
                        ) : programs.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 space-y-4 text-center">
                                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
                                    <Users className="w-10 h-10 text-gray-400" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-lg font-semibold text-gray-700">
                                        No programs found
                                    </h3>
                                    <p className="text-sm text-gray-500 max-w-md">
                                        {getTotalActiveCriteria > 0 
                                            ? "No programs match your current filters. Try adjusting your criteria."
                                            : "Get started by adding your first program."
                                        }
                                    </p>
                                </div>
                                {getTotalActiveCriteria > 0 ? (
                                    <Button 
                                        className="flex items-center gap-2"
                                        onClick={handleClearAllFilters}
                                        variant="outline"
                                    >
                                        <RefreshCw className="h-4 w-4" />
                                        Clear Filters
                                    </Button>
                                ) : (
                                    <Button 
                                        className="flex items-center gap-2"
                                        onClick={handleAddProgram}
                                    >
                                        <Plus className="h-4 w-4" />
                                        Add Your First Program
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
                                        members={formattedPrograms}
                                        onSelectMember={handleSelectProgram}
                                        headers={tableConfig.headers}
                                        isLoading={loading}
                                        formatFields={{
                                            price: (value) => {
                                                if (!value) return '-';
                                                if (value.includes('Rp.')) return value;
                                                
                                                const numericValue = value.toString().replace(/\D/g, '');
                                                if (numericValue === '') return '-';
                                                
                                                const numberValue = parseInt(numericValue);
                                                if (isNaN(numberValue)) return '-';
                                                
                                                const formatted = numberValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
                                                return `Rp. ${formatted}`;
                                            }
                                        }}
                                    />
                                </div>

                                <div className='mt-6 flex flex-col sm:flex-row justify-between items-center gap-4'>
                                    <div className="text-sm text-gray-600">
                                        {getDisplayText()}
                                        {getTotalActiveCriteria > 0 && !isShowAllMode() && " (filtered)"}
                                    </div>
                                    
                                    {/* Conditional rendering pagination */}
                                    {!isShowAllMode() && pagination.totalPages > 1 ? (
                                        <Pagination 
                                            currentPage={pagination.page}
                                            totalPages={pagination.totalPages}
                                            totalItems={pagination.total}
                                            itemsPerPage={pagination.limit}
                                            onPageChange={handlePageChange}
                                            disabled={loading}
                                        />
                                    ) : isShowAllMode() ? (
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

                {/* Wrap ProgramContent dengan div yang memiliki ref untuk auto-scroll */}
                <div 
                    ref={programDetailRef}
                    className={`
                        transition-all duration-500 ease-in-out
                        ${highlightDetail ? 'rounded-xl p-1 -m-1 bg-blue-50/50' : ''}
                    `}
                >
                    <ProgramContent
                        selectedProgram={selectedProgram}
                        onOpenEditModal={handleOpenEditModal}
                        onEdit={handleEditProgram}
                        onDelete={handleDeleteProgram}
                        detailTitle={tableConfig.detailTitle}
                        onClientUpdated={() => hookFetchPrograms(pagination.page)}
                        onClientDeleted={() => {
                            hookFetchPrograms(pagination.page);
                            setSelectedProgram(null);
                        }}
                    />
                </div>

                <AddProgram
                    isAddProgramModalOpen={isAddProgramModalOpen || isEditModalOpen}
                    setIsAddProgramModalOpen={(open) => {
                        if (!open) {
                            setIsAddProgramModalOpen(false)
                            setIsEditModalOpen(false)
                            setEditingProgram(null)
                        }
                    }}
                    onAddProgram={handleAddNewProgram}
                    editData={editingProgram}
                    onEditProgram={handleEditProgram}
                />

                {/* Modal Import Excel dengan Drag & Drop (diperbarui) */}
                <Dialog open={isImportModalOpen} onOpenChange={(open) => {
                    if (!open) {
                        resetImportState();
                    }
                    setIsImportModalOpen(open);
                }}>
                    <DialogContent className="sm:max-w-lg md:max-w-xl lg:max-w-2xl w-[95vw] max-w-[800px]">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-xl">
                                <FileSpreadsheet className="h-5 w-5 text-blue-600" />
                                Import Programs from Excel
                            </DialogTitle>
                            <DialogDescription className="text-base">
                                Upload an Excel file (.xlsx or .xls) to import multiple programs at once.
                            </DialogDescription>
                        </DialogHeader>
                        
                        <div className="space-y-4 py-4">
                            {/* Petunjuk */}
                            <div className="bg-blue-50 p-4 rounded-lg">
                                <h4 className="text-sm font-medium text-blue-800 mb-2">Instructions:</h4>
                                <ul className="text-sm text-blue-600 space-y-1 list-disc list-inside">
                                    <li>Download the template first for correct format</li>
                                    <li>Fill in the data according to the columns</li>
                                    <li>Maximum file size: 10MB</li>
                                    <li>Only Excel files (.xlsx, .xls) are supported</li>
                                    <li>Data must be in the first sheet</li>
                                    <li>First row must contain column headers</li>
                                </ul>
                            </div>
                            
                            {/* Upload Area dengan Drag & Drop */}
                            <div 
                                ref={dropZoneRef}
                                className={`
                                    border-2 border-dashed rounded-lg p-6 md:p-8 text-center transition-colors max-w-full overflow-hidden
                                    ${isDragging 
                                        ? 'border-blue-400 bg-blue-50' 
                                        : importFile 
                                            ? 'border-green-300 bg-green-50' 
                                            : 'border-gray-300 hover:border-blue-400'
                                    }
                                `}
                                onDragOver={handleDragOver}
                                onDragEnter={handleDragEnter}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                            >
                                {importFile ? (
                                    <div className="space-y-3">
                                        <FileText className="h-12 w-12 text-green-500 mx-auto" />
                                        <p className="font-medium text-gray-700 text-lg truncate max-w-full px-2">{importFile.name}</p>
                                        <p className="text-sm text-gray-500">
                                            {(importFile.size / 1024).toFixed(2)} KB
                                        </p>
                                        <div className="flex justify-center gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={handleRemoveFile}
                                                className="text-red-600 hover:text-red-700"
                                            >
                                                Remove File
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={handleChangeFile}
                                            >
                                                Change File
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <Upload className={`h-12 w-12 mx-auto mb-4 ${isDragging ? 'text-blue-500' : 'text-gray-400'}`} />
                                        <p className="text-base text-gray-600 mb-3 px-2">
                                            <strong>
                                                {isDragging 
                                                    ? "Drop your Excel file here" 
                                                    : "Drag & drop your Excel file here, or click to browse"
                                                }
                                            </strong>
                                        </p>
                                        {isDragging && (
                                            <div className="mb-4 p-3 bg-blue-100 rounded-lg border border-blue-300">
                                                <p className="text-sm text-blue-700 font-medium">
                                                    Release to upload file
                                                </p>
                                            </div>
                                        )}
                                        <Input
                                            ref={fileInputRef}
                                            type="file"
                                            accept=".xlsx,.xls"
                                            onChange={handleFileUpload}
                                            className="hidden"
                                            id="excel-upload"
                                        />
                                        <Button
                                            variant={isDragging ? "default" : "outline"}
                                            onClick={handleTriggerFileInput}
                                            className={`mt-2 px-6 py-2 ${isDragging ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                                        >
                                            {isDragging ? 'Or Click to Browse' : 'Select File'}
                                        </Button>
                                    </>
                                )}
                            </div>

                            {/* Error Messages */}
                            {validationErrors.length > 0 && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                    <h4 className="text-sm font-medium text-red-800 mb-2 flex items-center gap-2">
                                        <AlertCircle className="h-4 w-4" />
                                        Terdapat {validationErrors.length} error:
                                    </h4>
                                    <ul className="text-xs text-red-600 space-y-1 max-h-32 overflow-y-auto">
                                        {validationErrors.slice(0, 10).map((error, index) => (
                                            <li key={index} className="flex items-start gap-2">
                                                <span className="mt-1">•</span>
                                                <span>{error}</span>
                                            </li>
                                        ))}
                                        {validationErrors.length > 10 && (
                                            <li className="text-red-500 text-xs italic">
                                                ... dan {validationErrors.length - 10} error lainnya
                                            </li>
                                        )}
                                    </ul>
                                </div>
                            )}
                        </div>
                        
                        <DialogFooter className="flex flex-col sm:flex-row gap-3">
                            <Button
                                onClick={handleImportExcel}
                                disabled={!importFile || isImporting}
                                className="flex items-center gap-2 px-6 py-2 w-full justify-center"
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
    )
}

export default Program;