import Header from "../components/Layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Plus, Loader2, Users, AlertCircle, Tag, X } from "lucide-react";
import { Button } from "../components/ui/button"
import React, { useEffect, useState, useMemo } from 'react';
import SearchBar from '../components/SearchFilter/SearchBar';
import ExportButton from "../components/ActionButton/ExportButton";
import MemberTable from '../components/MemberTable/MemberTable';
import Pagination from "../components/Pagination/Pagination";
import FilterButton from '../components/SearchFilter/Filter'; // ✅ DIPERBAIKI
import ImpalaContent from '../components/Content/ImpalaContent';
import { useImpala } from "../hooks/useImpala";

const ImpalaManagement = () => {
    const [selectedParticipant, setSelectedParticipant] = useState(null)
    
    // ⭐⭐ STATE UNTUK FRONTEND FILTERING
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [filteredParticipants, setFilteredParticipants] = useState([]);

    const { participant, loading, error, pagination, handlePageChange } = useImpala();

    // ⭐⭐ EKSTRAK SEMUA CATEGORY UNIK DARI DATA PARTICIPANT
    const availableCategories = useMemo(() => {
        if (!participant.length) return [];
        
        // Ambil semua category dari data participant
        const allCategories = participant
            .map(p => p.category)
            .filter(category => category && category.trim() !== "");
        
        // Hilangkan duplikat dan urutkan
        const uniqueCategories = [...new Set(allCategories)].sort();
        
        // Format untuk filter options dengan emoji yang sesuai
        return uniqueCategories.map(category => {
            let emoji = "👤";
            const lowerCategory = category.toLowerCase();
            
            if (lowerCategory.includes("mahasiswa")) emoji = "🎓";
            else if (lowerCategory.includes("umkm")) emoji = "🏪";
            else if (lowerCategory.includes("startup")) emoji = "🚀";
            else if (lowerCategory.includes("corporate")) emoji = "🏢";
            else if (lowerCategory.includes("student")) emoji = "📚";
            else if (lowerCategory.includes("professional")) emoji = "💼";
            
            return {
                value: category.toLowerCase(),
                label: `${emoji} ${category}`,
                original: category
            };
        });
    }, [participant]);

    // ⭐⭐ FILTER OPTIONS BERDASARKAN CATEGORY
    const categoryFilterOptions = [
        { value: "all", label: "👥 All Categories" },
        ...availableCategories
    ];

    // ⭐⭐ FUNGSI UNTUK APPLY SEARCH & FILTER
    const applyAllFilters = () => {
        let result = [...participant];
        
        // 1. Apply Category Filter
        if (selectedCategory && selectedCategory !== "all") {
            result = result.filter(participant => {
                const participantCategory = participant.category?.toLowerCase();
                return participantCategory === selectedCategory;
            });
        }
        
        // 2. Apply Search
        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase();
            result = result.filter(participant =>
                participant.full_name?.toLowerCase().includes(term) ||
                participant.email?.toLowerCase().includes(term) ||
                participant.category?.toLowerCase().includes(term) ||
                participant.program_name?.toLowerCase().includes(term) ||
                participant.business?.toLowerCase().includes(term)
            );
        }
        
        setFilteredParticipants(result);
    };

    // ⭐⭐ HANDLE SEARCH
    const handleSearch = (term) => {
        setSearchTerm(term);
        applyAllFilters();
    };

    // ⭐⭐ HANDLE CATEGORY FILTER CHANGE
    const handleCategoryFilterChange = (categoryValue) => {
        setSelectedCategory(categoryValue);
        applyAllFilters();
    };

    // ⭐⭐ CLEAR ALL FILTERS
    const clearAllFilters = () => {
        setSearchTerm("");
        setSelectedCategory(null);
        setFilteredParticipants(participant);
    };

    // ⭐⭐ APPLY FILTERS SETIAP PARTICIPANT BERUBAH
    useEffect(() => {
        if (participant.length > 0) {
            setFilteredParticipants(participant);
            applyAllFilters();
        }
    }, [participant]);

    // ⭐⭐ APPLY FILTERS SETIAP SEARCH ATAU CATEGORY BERUBAH
    useEffect(() => {
        applyAllFilters();
    }, [searchTerm, selectedCategory]);

    const handleEdit = () => {
        if (selectedParticipant) {
            alert(`Edit participant: ${selectedParticipant.full_name}`);
        }
    };

    const handleDelete = () => {
        if (selectedParticipant) {
            if (window.confirm(`Are you sure you want to delete ${selectedParticipant.full_name}?`)) {
                console.log('Delete participant:', selectedParticipant);
                setSelectedParticipant(null); 
            }
        }
    };

    useEffect(() => {
        if (selectedParticipant && participant.length > 0) {
            const currentSelected = participant.find(p => p.id === selectedParticipant.id)
            if (currentSelected) {
                setSelectedParticipant(currentSelected)
            }
        }
    }, [participant, selectedParticipant?.id])

    // ⭐⭐ FUNGSI UNTUK GET CATEGORY LABEL
    const getCategoryLabel = (categoryValue) => {
        if (!categoryValue || categoryValue === "all") return "All Categories";
        const category = availableCategories.find(c => c.value === categoryValue);
        return category ? category.original : categoryValue;
    };

    const tableConfig = {
        headers: ['No', 'Full Name', 'Email', 'Phone', 'Program Name', 'Category', 'Entity', 'Action'],
        title: "Impala Management",
        addButton: "Add Participant",
        detailTitle: "Participant Details"
    };

    // ⭐⭐ FORMAT PARTICIPANT DARI filteredParticipants
    const formattedParticipants = filteredParticipants.map((participant, index) => {
        const currentPage = pagination.page;
        const itemsPerPage = pagination.limit;
        const itemNumber = (currentPage - 1) * itemsPerPage + index + 1;

        return {
            id: participant.id,
            no: itemNumber,
            full_name: participant.full_name,
            email: participant.email,
            category: participant.category,
            program_name: participant.program_name,
            phone: participant.phone,
            business: participant.business,
            gender: participant.gender,
            action: 'Detail',
            ...participant
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
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span className="text-sm">Loading Participant...</span>
                            </div>
                        )}
                    </CardHeader>
                    <CardContent>
                        {/*ERROR MESSAGE */}
                        {error && (
                            <div className="p-4 bg-red-50 border border-red-200 rounded-xl shadow-sm mb-6">
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                                    <div className="flex-1">
                                        <h3 className="text-sm font-semibold text-red-800">Failed to load participants</h3>
                                        <p className="text-sm text-red-600 mt-1">{error}</p>
                                    </div>
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        onClick={() => window.location.reload()}
                                        className="flex items-center gap-2 border-red-300 text-red-700 hover:bg-red-100"
                                    >
                                        Reload Page
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
                                        color="green"
                                    />
                                )}
                                
                                {/* CLEAR FILTERS BUTTON */}
                                {(searchTerm || selectedCategory) && (
                                    <Button 
                                        variant="ghost" 
                                        onClick={clearAllFilters}
                                        className="text-sm h-10 flex items-center gap-2"
                                        size="sm"
                                    >
                                        <X className="h-3 w-3" />
                                        Clear Filters
                                    </Button>
                                )}
                            </div>

                            <div className='flex gap-2'>
                                <Button className='flex items-center gap-2'>
                                    <Plus className="h-4 w-4" />
                                    {tableConfig.addButton}
                                </Button>
                                <ExportButton data={formattedParticipants} />
                            </div>
                        </div>
                        
                        {/* ⭐⭐ ACTIVE FILTERS BADGES */}
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
                                            <X className="h-3 w-3" />
                                        </button>
                                    </div>
                                )}
                                {selectedCategory && selectedCategory !== "all" && (
                                    <div className="bg-green-50 border border-green-200 text-green-700 px-3 py-1.5 rounded-lg text-sm flex items-center gap-2">
                                        <Tag className="h-3 w-3" />
                                        <span>Category: {getCategoryLabel(selectedCategory)}</span>
                                        <button 
                                            onClick={() => setSelectedCategory(null)}
                                            className="text-green-600 hover:text-green-800 ml-1"
                                            title="Remove category filter"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ⭐⭐ FILTER STATUS INFO - DIHAPUS BAGIAN "SHOWING ALL" */}
                        {selectedCategory && selectedCategory !== "all" && (
                            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center justify-between">
                                    <div className="text-sm text-gray-600">
                                        <span>
                                            Showing <span className="font-semibold">{filteredParticipants.length}</span> participants
                                        </span>
                                    </div>
                                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                                        {getCategoryLabel(selectedCategory)}
                                    </span>
                                </div>
                            </div>
                        )}

                        {loading && participant.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 space-y-4">
                                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                                <span className="text-gray-600">Loading participants...</span>
                                <div className="w-64 bg-gray-200 rounded-full h-2">
                                    <div className="bg-blue-600 h-2 rounded-full animate-pulse w-3/4"></div>
                                </div>
                            </div>
                        ) : filteredParticipants.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 space-y-4 text-center">
                                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
                                    <Users className="w-10 h-10 text-gray-400" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-lg font-semibold text-gray-700">
                                        No participants found
                                    </h3>
                                    <p className="text-sm text-gray-500 max-w-md">
                                        {searchTerm || selectedCategory 
                                            ? "No participants match your current filters."
                                            : "Get started by adding your first participant."
                                        }
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    {(searchTerm || selectedCategory) && (
                                        <Button 
                                            className="flex items-center gap-2"
                                            onClick={clearAllFilters}
                                            variant="outline"
                                        >
                                            Clear Filters
                                        </Button>
                                    )}
                                    <Button 
                                        className="flex items-center gap-2"
                                    >
                                        <Plus className="h-4 w-4" />
                                        Add New Participant
                                    </Button>
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
                                        members={formattedParticipants}
                                        onSelectMember={setSelectedParticipant}
                                        headers={tableConfig.headers}
                                        isLoading={loading}
                                    />
                                </div>

                                <div className='mt-6 flex flex-col sm:flex-row justify-between items-center gap-4'>
                                    <div className="text-sm text-gray-600">
                                        Showing {filteredParticipants.length} participants
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

                <ImpalaContent
                    selectedMember={selectedParticipant}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    detailTitle={tableConfig.detailTitle}
                />
            </div>
        </div>
    )
}

export default ImpalaManagement;