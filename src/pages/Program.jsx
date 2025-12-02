import Header from "../components/Layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Plus, Loader2, Users, RefreshCw, AlertCircle, Tag, Filter, X } from "lucide-react";
import { Button } from "../components/ui/button"
import React, { useEffect, useState, useMemo } from 'react';
import SearchBar from '../components/SearchFilter/SearchBar';
import ExportButton from "../components/ActionButton/ExportButton";
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
    
    // STATE UNTUK FRONTEND FILTERING
    const [searchTerm, setSearchTerm] = useState("");
    const [activeFilters, setActiveFilters] = useState({
        status: null, // 'active', 'inactive', atau null
        category: null, // category atau null
    });
    const [filteredPrograms, setFilteredPrograms] = useState([]);
    const [availableCategories, setAvailableCategories] = useState([]);

    const { programs, loading, error, pagination, filters, setFilters, fetchProgram, addProgram, updateProgram, deleteProgram } = usePrograms();

    // EKSTRAK SEMUA STATUS UNIK DARI DATA PROGRAM
    const availableStatuses = useMemo(() => {
        if (!programs.length) return [];
        
        const allStatuses = programs
            .map(program => program.status)
            .filter(status => status && status.trim() !== "");
        
        const uniqueStatuses = [...new Set(allStatuses)].sort();
        
        return uniqueStatuses.map(status => ({
            value: status.toLowerCase(),
            label: status === 'active' ? '🟢 Active' : status === 'inactive' ? '🔴 Inactive' : `📌 ${status}`,
            original: status
        }));
    }, [programs]);

    // EKSTRAK SEMUA CATEGORY UNIK DARI DATA PROGRAM
    const extractCategories = useMemo(() => {
        return (programsList) => {
            if (!programsList.length) return [];
            
            const allCategories = programsList
                .map(program => program.category)
                .filter(category => category && category.trim() !== "");
            
            const uniqueCategories = [...new Set(allCategories)].sort();
            
            return uniqueCategories.map(category => ({
                value: category.toLowerCase(),
                label: `🏷️ ${category}`,
                original: category
            }));
        };
    }, []);

    // STATUS OPTIONS
    const statusOptions = [
        { value: 'active', label: '🟢 Active', color: 'text-green-600 bg-green-50' },
        { value: 'inactive', label: '🔴 Inactive', color: 'text-red-600 bg-red-50' },
    ];

    // FUNGSI UNTUK APPLY SEMUA FILTER
    const applyAllFilters = () => {
        let result = [...programs];
        
        // 1. Apply Search
        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase();
            result = result.filter(program =>
                program.program_name?.toLowerCase().includes(term) ||
                program.category?.toLowerCase().includes(term) ||
                program.status?.toLowerCase().includes(term) ||
                (program.client && program.client.toLowerCase().includes(term))
            );
        }
        
        // 2. Apply Status Filter
        if (activeFilters.status) {
            result = result.filter(program => {
                const programStatus = program.status?.toLowerCase();
                return activeFilters.status === 'all' || programStatus === activeFilters.status;
            });
        }
        
        // 3. Apply Category Filter
        if (activeFilters.category && activeFilters.category !== 'all') {
            result = result.filter(program => {
                const programCategory = program.category;
                if (!programCategory) return false;
                
                return programCategory.toLowerCase() === activeFilters.category.toLowerCase();
            });
        }
        
        setFilteredPrograms(result);
    };

    // HANDLE SEARCH
    const handleSearch = (term) => {
        setSearchTerm(term);
        setFilters({ ...filters, search: term });
    };

    // HANDLE STATUS FILTER CHANGE
    const handleStatusFilterChange = (status) => {
        setActiveFilters(prev => ({
            ...prev,
            status: prev.status === status ? null : status
        }));
        setFilters({ ...filters, status: status || '' });
    };

    // HANDLE CATEGORY FILTER CHANGE
    const handleCategoryFilterChange = (category) => {
        setActiveFilters(prev => ({
            ...prev,
            category: prev.category === category ? null : category
        }));
        setFilters({ ...filters, category: category || '' });
    };

    // CLEAR ALL FILTERS
    const clearAllFilters = () => {
        setSearchTerm("");
        setActiveFilters({
            status: null,
            category: null,
        });
        setFilteredPrograms(programs);
        setFilters({ search: "", status: "", category: "" });
    };

    // CLEAR SPECIFIC FILTER
    const clearFilter = (filterType) => {
        if (filterType === 'status') {
            setActiveFilters(prev => ({ ...prev, status: null }));
            setFilters({ ...filters, status: '' });
        } else if (filterType === 'category') {
            setActiveFilters(prev => ({ ...prev, category: null }));
            setFilters({ ...filters, category: '' });
        } else if (filterType === 'search') {
            setSearchTerm("");
            setFilters({ ...filters, search: '' });
        }
    };

    // INITIALIZE CATEGORIES
    useEffect(() => {
        if (programs.length > 0) {
            const extractedCategories = extractCategories(programs);
            setAvailableCategories(extractedCategories);
        }
    }, [programs, extractCategories]);

    // APPLY FILTERS SETIAP PROGRAMS BERUBAH
    useEffect(() => {
        if (programs.length > 0) {
            setFilteredPrograms(programs);
            applyAllFilters();
        }
    }, [programs]);

    // APPLY FILTERS SETIAP SEARCH ATAU FILTER BERUBAH
    useEffect(() => {
        applyAllFilters();
    }, [searchTerm, activeFilters]);

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
            fetchProgram(pagination.page);
        } catch {
            console.error('Error updating', error)
            toast.error(error.message || 'Failed to update program' )
        }
    };

    const handleAddNewProgram = async (programData) => {
        try {
            await addProgram(programData);
            setIsAddProgramModalOpen(false);
            toast.success('Program added successfully');
            fetchProgram(pagination.page);
        } catch {
            // 
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
            fetchProgram(pagination.page);
        } catch {
            // 
        }
    };

    useEffect(() => {
        if (selectedProgram && programs.length > 0) {
            const currentSelected = programs.find(member => member.id === selectedProgram.id)
            if (currentSelected) {
                setSelectedProgram(currentSelected)
            }
        }
    }, [programs, selectedProgram?.id])

    const handleRefresh = () => {
        fetchProgram(pagination.page);
        clearAllFilters();
    };

    const handlePageChange = (page) => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        fetchProgram(page);
    };

    // GET ACTIVE FILTERS COUNT - HANYA STATUS DAN CATEGORY
    const getActiveFiltersCount = () => {
        let count = 0;
        // TIDAK MENGHITUNG SEARCH TERM
        if (activeFilters.status) count++;
        if (activeFilters.category) count++;
        return count;
    };

    // GET TOTAL ACTIVE CRITERIA (SEARCH + FILTERS) UNTUK DISPLAY
    const getTotalActiveCriteria = () => {
        let count = 0;
        if (searchTerm) count++;
        if (activeFilters.status) count++;
        if (activeFilters.category) count++;
        return count;
    };

    // GET CATEGORY LABEL
    const getCategoryLabel = (categoryValue) => {
        if (!categoryValue || categoryValue === "all") return "All Categories";
        const category = availableCategories.find(c => c.value === categoryValue);
        return category ? category.original : categoryValue;
    };

    // GET STATUS LABEL
    const getStatusLabel = (statusValue) => {
        if (!statusValue) return "";
        if (statusValue === 'active') return '🟢 Active';
        if (statusValue === 'inactive') return '🔴 Inactive';
        return statusValue;
    };
    
    const tableConfig = {
        headers: ['No', 'Program Name', 'Client', 'Category', 'Status', 'Duration', 'Price', 'Action'],
        title: "Program Management",
        addButton: "Add Program",
        detailTitle: "Program Details"
    };

    // FORMAT PROGRAM DARI filteredPrograms
    const formattedPrograms = filteredPrograms.map((program, index) => {
        const currentPage = pagination.page;
        const itemsPerPage = pagination.limit;
        const itemNumber = (currentPage - 1) * itemsPerPage + index + 1;
        
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
            action: 'Detail',
            ...program
        };
    });

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
                            <div className='flex gap-2 items-center'>
                                <SearchBar 
                                    onSearch={handleSearch}
                                    placeholder="Search..."
                                />
                                
                                {/* FILTER DROPDOWN DENGAN WARNA AMBER */}
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
                                        
                                        {/* STATUS FILTER */}
                                        <DropdownMenuGroup>
                                            <DropdownMenuLabel className="text-xs text-gray-500 font-medium">
                                                Status
                                            </DropdownMenuLabel>
                                            {statusOptions.map((option) => (
                                                <DropdownMenuCheckboxItem
                                                    key={option.value}
                                                    checked={activeFilters.status === option.value}
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
                                                    checked={activeFilters.category === 'all'}
                                                    onCheckedChange={() => handleCategoryFilterChange('all')}
                                                    className="cursor-pointer hover:bg-gray-50"
                                                >
                                                    📋 All Categories
                                                </DropdownMenuCheckboxItem>
                                                
                                                {availableCategories.map((category) => (
                                                    <DropdownMenuCheckboxItem
                                                        key={category.value}
                                                        checked={activeFilters.category?.toLowerCase() === category.value.toLowerCase()}
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
                                        
                                        {/* CLEAR FILTERS - HANYA CLEAR STATUS & CATEGORY */}
                                        <DropdownMenuItem 
                                            onClick={() => {
                                                setActiveFilters({
                                                    status: null,
                                                    category: null,
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
                                <ExportButton data={formattedPrograms} />
                            </div>
                        </div>
                        
                        {/* ACTIVE FILTERS BADGES - TAMPILKAN JIKA ADA SEARCH ATAU FILTER */}
                        {getTotalActiveCriteria() > 0 && (
                            <div className="mb-4 flex flex-wrap items-center gap-2">
                                <span className="text-sm text-gray-600">Active filters:</span>
                                
                                {/* SEARCH BADGE */}
                                {searchTerm && (
                                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                                        <span>🔍 "{searchTerm}"</span>
                                        <button 
                                            onClick={() => clearFilter('search')}
                                            className="text-blue-600 hover:text-blue-800 ml-1"
                                        >
                                            ×
                                        </button>
                                    </span>
                                )}
                                
                                {/* STATUS FILTER BADGE */}
                                {activeFilters.status && (
                                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                                        {getStatusLabel(activeFilters.status)}
                                        <button 
                                            onClick={() => clearFilter('status')}
                                            className="text-green-600 hover:text-green-800 ml-1"
                                        >
                                            ×
                                        </button>
                                    </span>
                                )}
                                
                                {/* CATEGORY FILTER BADGE */}
                                {activeFilters.category && activeFilters.category !== 'all' && (
                                    <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                                        <Tag className="w-3 h-3" />
                                        {getCategoryLabel(activeFilters.category)}
                                        <button 
                                            onClick={() => clearFilter('category')}
                                            className="text-purple-600 hover:text-purple-800 ml-1"
                                        >
                                            ×
                                        </button>
                                    </span>
                                )}
                                
                                {/* ALL CATEGORIES BADGE */}
                                {activeFilters.category === 'all' && (
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
                                
                                {/* CLEAR ALL - CLEARS BOTH SEARCH AND FILTERS */}
                                <Button 
                                    variant="ghost" 
                                    onClick={clearAllFilters}
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
                        ) : filteredPrograms.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 space-y-4 text-center">
                                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
                                    <Users className="w-10 h-10 text-gray-400" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-lg font-semibold text-gray-700">
                                        No programs found
                                    </h3>
                                    <p className="text-sm text-gray-500 max-w-md">
                                        {getTotalActiveCriteria() > 0 
                                            ? "No programs match your current filters. Try adjusting your criteria."
                                            : "Get started by adding your first program."
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
                                    <div className="text-sm text-gray-600">
                                        Showing {filteredPrograms.length} of {programs.length} programs
                                        {getTotalActiveCriteria() > 0 && " (filtered)"}
                                    </div>
                                    
                                    <Pagination 
                                        currentPage={pagination.page}
                                        totalPages={pagination.totalPages}
                                        totalItems={pagination.total}
                                        itemsPerPage={pagination.limit}
                                        onPageChange={handlePageChange}
                                        disabled={loading}
                                    />
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
                    onClientUpdated={() => fetchProgram(pagination.page)}
                    onClientDeleted={() => {
                        fetchProgram(pagination.page);
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