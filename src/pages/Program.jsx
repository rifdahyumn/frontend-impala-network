import Header from "../components/Layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Plus, Loader2, Users, RefreshCw, AlertCircle, Tag, Filter, X, CheckSquare, Download, Upload, FileText, FileSpreadsheet, CheckCircle } from "lucide-react";
import { Button } from "../components/ui/button"
import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import SearchBar from '../components/SearchFilter/SearchBar';
import MemberTable from '../components/MemberTable/MemberTable';
import Pagination from "../components/Pagination/Pagination";
import ProgramContent from "../components/Content/ProgramClient";
import toast from "react-hot-toast";
import { usePrograms } from "../hooks/usePrograms";
import AddProgram from "../components/AddButton/AddProgram";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuCheckboxItem } from "../components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import * as XLSX from 'xlsx';
import { Progress } from "../components/ui/progress"; // Jika punya component Progress

const Program = () => {
    const [selectedProgram, setSelectedProgram] = useState(null)
    const [isAddProgramModalOpen, setIsAddProgramModalOpen] = useState(false)
    const [editingProgram, setEditingProgram] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [importFile, setImportFile] = useState(null);
    const [isExporting, setIsExporting] = useState(false);
    const [validationErrors, setValidationErrors] = useState([]);
    const [isDragging, setIsDragging] = useState(false);
    
    const fileInputRef = useRef(null);
    const dropZoneRef = useRef(null);
    
    const [highlightDetail, setHighlightDetail] = useState(false);
    
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
        refreshData,
        refreshAllData,
        exportPrograms: hookExportPrograms,
        
        // IMPORT FUNCTIONS FROM HOOK
        isImporting,
        importProgress,
        importResult,
        importError,
        importFromFile,
        downloadImportTemplate,
        parseExcelFile,
        validateImportData,
        resetImport
    } = usePrograms();

    const [searchTerm, setSearchTerm] = useState("");
    const [availableCategories, setAvailableCategories] = useState([]);

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

    // ========== IMPORT FUNCTIONS ==========
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
            handleFileUpload({ target: { files: [file] } });
        }
    }, []);

    const handleFileUpload = useCallback(async (event) => {
        const file = event.target.files[0];
        if (!file) return;
        
        setValidationErrors([]);
        
        // Validasi file
        const errors = validateExcelFile(file);
        if (errors.length > 0) {
            setValidationErrors(errors);
            toast.error('File tidak valid');
            return;
        }
        
        setImportFile(file);
        
        try {
            // Coba parse file untuk preview
            const parsedData = await parseExcelFile(file);
            
            if (parsedData && parsedData.length > 0) {
                toast.success(`File berhasil diupload: ${parsedData.length} data ditemukan`);
            }
        } catch (error) {
            console.error('Parse file error:', error);
            setValidationErrors([error.message]);
            toast.error('Gagal membaca file Excel');
        }
    }, [parseExcelFile]);

    const validateExcelFile = (file) => {
        const errors = [];
        
        const validExtensions = ['.xlsx', '.xls'];
        const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
        
        if (!validExtensions.includes(fileExtension)) {
            errors.push('File harus berformat Excel (.xlsx atau .xls)');
        }
        
        if (file.size > 10 * 1024 * 1024) {
            errors.push('File terlalu besar. Maksimal 10MB');
        }
        
        return errors;
    };

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

    const handleChangeFile = useCallback(() => {
        handleTriggerFileInput();
    }, [handleTriggerFileInput]);

    const handleDownloadTemplate = useCallback(() => {
        downloadImportTemplate();
    }, [downloadImportTemplate]);

    const handleImportExcel = useCallback(async () => {
        if (!importFile) {
            toast.error('Pilih file Excel terlebih dahulu');
            return;
        }
        
        try {            
            setImportFile(null);
            setValidationErrors([]);
            setIsDragging(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
            
            setIsImportModalOpen(false);
            
        } catch (error) {
            console.error('Import failed:', error);

            if (error.message.includes('Validation failed')) {
                const errorLines = error.message.split('\n');
                setValidationErrors(errorLines.slice(1));
            } else {
                setValidationErrors([error.message]);
            }

        }
    }, [importFile, importFromFile]);

    const handleOpenImportModal = useCallback(() => {
        setImportFile(null);
        setValidationErrors([]);
        setIsDragging(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        setIsImportModalOpen(true);
    }, []);

    const resetImportState = useCallback(() => {
        setImportFile(null);
        setValidationErrors([]);
        setIsDragging(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        resetImport();
    }, [resetImport]);

    // ========== EXPORT FUNCTIONS ==========
    const handleExport = useCallback(async (format = 'excel') => {
        try {
            if (!programs || programs.length === 0) {
                toast.error('No data to export');
                return;
            }
            
            setIsExporting(true);

            // Jika ingin menggunakan hook export (yang sudah ada di usePrograms)
            // await hookExportPrograms(format);
            
            // Atau gunakan implementasi langsung seperti sebelumnya
            const exportData = programs.map((program, index) => ({
                'No': index + 1,
                'Program Name': program.program_name || '-',
                'Category': program.category || '-',
                'Status': program.status || '-',
                'Duration': program.duration || '-',
                'Location': program.location || '-',
                'capacity': program.capacity || '-',
                'Price': program.price || '-',
                'Client': program.client || '-',
                'Start Date': program.start_date || '-',
                'End Date': program.end_date || '-',
                'Description': program.description || '-',
                'Instructur': program.instructors || '-',
                'Tags': program.tags || '-',
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
                    { wch: 5 }, { wch: 25 }, { wch: 20 }, 
                    { wch: 10 }, { wch: 15 }, { wch: 15 }, 
                    { wch: 25 }, { wch: 12 }, { wch: 12 }, 
                    { wch: 40 }, { wch: 12 }, { wch: 12 }
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
                XLSX.utils.book_append_sheet(wb, ws, "Programs");
                
                const dateStr = new Date().toISOString().split('T')[0];
                const fileName = `programs_export_${dateStr}.xlsx`;
                
                XLSX.writeFile(wb, fileName);
                
                toast.success(`Exported ${exportData.length} programs to Excel`);
            } else if (format === 'csv') {
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

    // ========== OTHER EFFECTS ==========
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
                label: `${category}`,
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
                
                {/* Progress Bar untuk Import */}
                {isImporting && (
                    <div className="mb-6 bg-white rounded-lg shadow-md border border-blue-200 p-4">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                                <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                                <span className="font-medium text-blue-700">Importing Programs...</span>
                            </div>
                            <span className="text-sm font-medium text-blue-600">{importProgress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div 
                                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                                style={{ width: `${importProgress}%` }}
                            />
                        </div>
                        {importResult && importResult.successful > 0 && (
                            <div className="mt-2 text-sm text-green-600 flex items-center gap-2">
                                <CheckCircle className="h-4 w-4" />
                                {importResult.successful} programs imported successfully
                            </div>
                        )}
                    </div>
                )}

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
                                        
                                        <DropdownMenuGroup>
                                            <DropdownMenuLabel className="text-xs text-gray-500 font-medium">
                                                Category
                                            </DropdownMenuLabel>
                                            <div className="max-h-48 overflow-y-auto">
                                                <DropdownMenuCheckboxItem
                                                    checked={filters.category === 'all'}
                                                    onCheckedChange={() => handleCategoryFilterChange('all')}
                                                    className="cursor-pointer hover:bg-gray-50"
                                                >
                                                    All Categories
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
                                
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className="flex items-center gap-2 border-blue-500 text-blue-600 hover:bg-blue-50"
                                            disabled={loading || isImporting}
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
                                
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className="flex items-center gap-2 border-green-500 text-green-600 hover:bg-green-50"
                                            disabled={loading || programs.length === 0 || isExporting || isImporting}
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
                                            disabled={programs.length === 0 || isExporting || isImporting}
                                            className="flex items-center gap-2 cursor-pointer"
                                        >
                                            <FileSpreadsheet className="h-4 w-4" />
                                            Export as Excel
                                        </DropdownMenuItem>
                                        <DropdownMenuItem 
                                            onClick={() => handleExport('csv')}
                                            disabled={programs.length === 0 || isExporting || isImporting}
                                            className="flex items-center gap-2 cursor-pointer"
                                        >
                                            <FileText className="h-4 w-4" />
                                            Export as CSV
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                        
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
                        
                        {getTotalActiveCriteria > 0 && (
                            <div className="mb-4 flex flex-wrap items-center gap-2">
                                <span className="text-sm text-gray-600">Active filters:</span>
                                
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
                                        isLoading={loading || isImporting}
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
                                    {!isShowAllMode() && pagination.totalPages > 1 ? (
                                        <Pagination 
                                            currentPage={pagination.page}
                                            totalPages={pagination.totalPages}
                                            totalItems={pagination.total}
                                            itemsPerPage={pagination.limit}
                                            onPageChange={handlePageChange}
                                            disabled={loading || isImporting}
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

                            {/* Import Progress di dalam modal */}
                            {isImporting && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                                            <span className="text-sm font-medium text-blue-700">Importing...</span>
                                        </div>
                                        <span className="text-sm font-medium text-blue-600">{importProgress}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div 
                                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                            style={{ width: `${importProgress}%` }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        <DialogFooter className="flex flex-col sm:flex-row gap-3">
                            <Button
                                variant="outline"
                                onClick={() => setIsImportModalOpen(false)}
                                disabled={isImporting}
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleImportExcel}
                                disabled={!importFile || isImporting}
                                className="flex items-center gap-2 px-6 py-2 flex-1"
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