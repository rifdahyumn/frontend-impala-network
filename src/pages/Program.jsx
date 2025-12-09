import Header from "../components/Layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Plus, Loader2, Users, RefreshCw, AlertCircle, Tag, Filter, X, CheckSquare } from "lucide-react";
import { Button } from "../components/ui/button"
import React, { useEffect, useState, useMemo, useCallback } from 'react';
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

const Program = () => {
    const [selectedProgram, setSelectedProgram] = useState(null)
    const [isAddProgramModalOpen, setIsAddProgramModalOpen] = useState(false)
    const [editingProgram, setEditingProgram] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    
    // 🔴 PERBAIKAN: Hapus state untuk frontend filtering dan gunakan hook sepenuhnya
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
        exportPrograms,
        getDisplayText,
        isShowAllMode,
        resetToPaginationMode,
        fetchPrograms: hookFetchPrograms,
        addProgram,
        updateProgram,
        deleteProgram,
        refreshData
    } = usePrograms();

    // 🔴 PERBAIKAN: State lokal hanya untuk UI control
    const [searchTerm, setSearchTerm] = useState("");
    const [availableCategories, setAvailableCategories] = useState([]);

    // EKSTRAK SEMUA CATEGORY UNIK DARI DATA PROGRAM
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

    // STATUS OPTIONS
    const statusOptions = [
        { value: 'active', label: '🟢 Active', color: 'text-green-600 bg-green-50' },
        { value: 'inactive', label: '🔴 Inactive', color: 'text-red-600 bg-red-50' },
    ];

    // 🔴 PERBAIKAN: Handle search dengan backend filtering
    const handleSearch = useCallback((term) => {
        setSearchTerm(term);
        searchPrograms(term, showAllOnSearch);
    }, [searchPrograms, showAllOnSearch]);

    // 🔴 PERBAIKAN: Handle status filter change dengan backend
    const handleStatusFilterChange = useCallback((status) => {
        const newStatus = filters.status === status ? '' : status;
        updateFiltersAndFetch({ status: newStatus });
    }, [filters.status, updateFiltersAndFetch]);

    // 🔴 PERBAIKAN: Handle category filter change dengan backend
    const handleCategoryFilterChange = useCallback((category) => {
        const newCategory = filters.category === category ? '' : category;
        updateFiltersAndFetch({ category: newCategory });
    }, [filters.category, updateFiltersAndFetch]);

    // 🔴 PERBAIKAN: Clear all filters menggunakan fungsi dari hook
    const handleClearAllFilters = useCallback(() => {
        setSearchTerm("");
        clearFilters();
    }, [clearFilters]);

    // 🔴 PERBAIKAN: Clear specific filter
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

    // 🔴 PERBAIKAN: Toggle show all on search
    const handleToggleShowAll = useCallback((checked) => {
        toggleShowAllOnSearch(checked);
    }, [toggleShowAllOnSearch]);

    // 🔴 PERBAIKAN: Reset to pagination mode
    const handleResetToPagination = useCallback(() => {
        resetToPaginationMode();
    }, [resetToPaginationMode]);

    // 🔴 PERBAIKAN: Handle export
    const handleExport = useCallback(async () => {
        try {
            await exportPrograms('csv');
        } catch (error) {
            console.error('Export failed:', error);
            toast.error('Failed to export programs');
        }
    }, [exportPrograms]);

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

    // 🔴 PERBAIKAN: Get active filters count sebagai value bukan function
    const getActiveFiltersCount = useMemo(() => {
        let count = 0;
        if (filters.status) count++;
        if (filters.category) count++;
        return count;
    }, [filters]);

    // 🔴 PERBAIKAN: Get total active criteria termasuk search sebagai value
    const getTotalActiveCriteria = useMemo(() => {
        let count = 0;
        if (filters.search) count++;
        if (filters.status) count++;
        if (filters.category) count++;
        return count;
    }, [filters]);

    // GET CATEGORY LABEL
    const getCategoryLabel = useCallback((categoryValue) => {
        if (!categoryValue || categoryValue === "all") return "All Categories";
        const category = availableCategories.find(c => c.value === categoryValue.toLowerCase());
        return category ? category.original : categoryValue;
    }, [availableCategories]);

    // GET STATUS LABEL
    const getStatusLabel = useCallback((statusValue) => {
        if (!statusValue) return "";
        if (statusValue === 'active') return '🟢 Active';
        if (statusValue === 'inactive') return '🔴 Inactive';
        return statusValue.charAt(0).toUpperCase() + statusValue.slice(1);
    }, []);
    
    const tableConfig = {
        headers: ['No', 'Program Name', 'Client', 'Category', 'Status', 'Duration', 'Price', 'Action'],
        title: "Program Management",
        addButton: "Add Program",
        detailTitle: "Program Details"
    };

    // 🔴 PERBAIKAN: Format program untuk table - gunakan data dari backend yang sudah difilter
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
                                        // Search akan dipanggil via debounce di hook
                                    }}
                                />
                                
                                {/* 🔴 PERBAIKAN: Toggle Show All on Search */}
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
                                <Button 
                                    onClick={handleExport}
                                    variant="outline"
                                    className="flex items-center gap-2 border-green-500 text-green-600 hover:bg-green-50"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <>
                                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            Export {isShowAllMode() ? 'All' : ''}
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                        
                        {/* 🔴 PERBAIKAN: Show All Mode Indicator */}
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
                                        onSelectMember={setSelectedProgram}
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
                                    {/* 🔴 PERBAIKAN: Gunakan getDisplayText dari hook */}
                                    <div className="text-sm text-gray-600">
                                        {getDisplayText()}
                                        {getTotalActiveCriteria > 0 && !isShowAllMode() && " (filtered)"}
                                    </div>
                                    
                                    {/* 🔴 PERBAIKAN: Conditional rendering pagination */}
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
            </div>
        </div>
    )
}

export default Program;