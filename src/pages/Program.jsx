import Header from "../components/Layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Plus, Loader2, Users, RefreshCw, AlertCircle, Tag } from "lucide-react";
import { Button } from "../components/ui/button"
import React, { useEffect, useState, useMemo } from 'react';
import SearchBar from '../components/SearchFilter/SearchBar';
import ExportButton from "../components/ActionButton/ExportButton";
import MemberTable from '../components/MemberTable/MemberTable';
import Pagination from "../components/Pagination/Pagination";
import FilterButton from '../components/SearchFilter/Filter';
import ProgramContent from "../components/Content/ProgramClient";
import toast from "react-hot-toast";
import { usePrograms } from "../hooks/usePrograms";
import AddProgram from "../components/AddButton/AddProgram";

const Program = () => {
    const [selectedProgram, setSelectedProgram] = useState(null)
    const [isAddProgramModalOpen, setIsAddProgramModalOpen] = useState(false)
    const [editingProgram, setEditingProgram] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    
    // STATE UNTUK FRONTEND FILTERING
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [filteredPrograms, setFilteredPrograms] = useState([]);

    const { programs, loading, error, pagination, filters, setFilters, fetchProgram, addProgram, updateProgram, deleteProgram } = usePrograms();

    // EKSTRAK SEMUA CATEGORY UNIK DARI DATA PROGRAM
    const availableCategories = useMemo(() => {
        if (!programs.length) return [];
        
        const allCategories = programs
            .map(program => program.category)
            .filter(category => category && category.trim() !== "");
        
        const uniqueCategories = [...new Set(allCategories)].sort();
        
        return uniqueCategories.map(category => ({
            value: category.toLowerCase(),
            label: `🏷️ ${category}`,
            original: category
        }));
    }, [programs]);

    // FILTER OPTIONS HANYA BERDASARKAN CATEGORY
    const categoryFilterOptions = [
        { value: "all", label: "📋 All Categories" },
        ...availableCategories
    ];

    // FUNGSI UNTUK APPLY SEARCH & FILTER
    const applyAllFilters = () => {
        let result = [...programs];
        
        // 1. Apply Category Filter
        if (selectedCategory && selectedCategory !== "all") {
            result = result.filter(program => {
                const programCategory = program.category?.toLowerCase();
                return programCategory === selectedCategory;
            });
        }
        
        // 2. Apply Search
        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase();
            result = result.filter(program =>
                program.program_name?.toLowerCase().includes(term) ||
                program.category?.toLowerCase().includes(term) ||
                program.status?.toLowerCase().includes(term) ||
                (program.client && program.client.toLowerCase().includes(term))
            );
        }
        
        setFilteredPrograms(result);
    };

    // HANDLE SEARCH
    const handleSearch = (term) => {
        setSearchTerm(term);
        setFilters({ ...filters, search: term });
        applyAllFilters();
    };

    // HANDLE CATEGORY FILTER CHANGE
    const handleCategoryFilterChange = (categoryValue) => {
        setSelectedCategory(categoryValue);
        setFilters({ ...filters, category: categoryValue });
        applyAllFilters();
    };

    // CLEAR ALL FILTERS
    const clearAllFilters = () => {
        setSearchTerm("");
        setSelectedCategory(null);
        setFilteredPrograms(programs);
        setFilters({ search: "", category: "" });
    };

    // APPLY FILTERS SETIAP PROGRAMS BERUBAH
    useEffect(() => {
        if (programs.length > 0) {
            setFilteredPrograms(programs);
            applyAllFilters();
        }
    }, [programs]);

    // APPLY FILTERS SETIAP SEARCH ATAU CATEGORY BERUBAH
    useEffect(() => {
        applyAllFilters();
    }, [searchTerm, selectedCategory]);

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

    // FUNGSI UNTUK GET CATEGORY LABEL
    const getCategoryLabel = (categoryValue) => {
        if (!categoryValue || categoryValue === "all") return "All Categories";
        const category = availableCategories.find(c => c.value === categoryValue);
        return category ? category.original : categoryValue;
    };

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
                                
                                {/* FILTER BY CATEGORY */}
                                {availableCategories.length > 0 && (
                                    <FilterButton 
                                        onFilterChange={handleCategoryFilterChange}
                                        filterOptions={categoryFilterOptions}
                                        activeFilter={selectedCategory}
                                        buttonText={
                                            selectedCategory && selectedCategory !== "all" 
                                                ? `Category: ${getCategoryLabel(selectedCategory)}`
                                                : "Filter by Category"
                                        }
                                        color="purple"
                                    />
                                )}
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
                        
                        {/* ACTIVE FILTERS BADGES */}
                        {(searchTerm || selectedCategory) && (
                            <div className="mb-4 flex flex-wrap items-center gap-2">
                                <span className="text-sm font-medium text-gray-700">Active filters:</span>
                                {searchTerm && (
                                    <div className="bg-blue-50 border border-blue-200 text-blue-700 px-3 py-1.5 rounded-lg text-sm flex items-center gap-2">
                                        <Tag className="h-3 w-3" />
                                        <span>Search: "{searchTerm}"</span>
                                        <button 
                                            onClick={() => setSearchTerm("")}
                                            className="text-blue-600 hover:text-blue-800 ml-1"
                                            title="Remove search"
                                        >
                                            ×
                                        </button>
                                    </div>
                                )}
                                {selectedCategory && selectedCategory !== "all" && (
                                    <div className="bg-purple-50 border border-purple-200 text-purple-700 px-3 py-1.5 rounded-lg text-sm flex items-center gap-2">
                                        <Tag className="h-3 w-3" />
                                        <span>Category: {getCategoryLabel(selectedCategory)}</span>
                                        <button 
                                            onClick={() => setSelectedCategory(null)}
                                            className="text-purple-600 hover:text-purple-800 ml-1"
                                            title="Remove category filter"
                                        >
                                            ×
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* FILTER STATUS INFO */}
                        {selectedCategory && selectedCategory !== "all" && (
                            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center justify-between">
                                    <div className="text-sm text-gray-600">
                                        <span>
                                            Showing <span className="font-semibold">{filteredPrograms.length}</span> programs
                                        </span>
                                    </div>
                                    <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                                        {getCategoryLabel(selectedCategory)}
                                    </span>
                                </div>
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
                                        {searchTerm || selectedCategory 
                                            ? "No programs match your current filters."
                                            : "Get started by adding your first program."
                                        }
                                    </p>
                                </div>
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
                                        Showing {filteredPrograms.length} programs
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