import Header from "../components/Layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Plus, Loader2, Users, AlertCircle, Tag, Filter, X } from "lucide-react";
import { Button } from "../components/ui/button"
import React, { useEffect, useState, useMemo } from 'react';
import SearchBar from '../components/SearchFilter/SearchBar';
import ExportButton from "../components/ActionButton/ExportButton";
import MemberTable from '../components/MemberTable/MemberTable';
import Pagination from "../components/Pagination/Pagination";
import ImpalaContent from '../components/Content/ImpalaContent';
import { useImpala } from "../hooks/useImpala";
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

const ImpalaManagement = () => {
    const [selectedParticipant, setSelectedParticipant] = useState(null)
    
    // STATE UNTUK FRONTEND FILTERING
    const [searchTerm, setSearchTerm] = useState("");
    const [activeFilters, setActiveFilters] = useState({
        gender: null, // 'male', 'female', atau null
        category: null, // category atau null
    });
    const [filteredParticipants, setFilteredParticipants] = useState([]);
    const [availableCategories, setAvailableCategories] = useState([]);

    const { participant, loading, error, pagination, handlePageChange } = useImpala();

    // GENDER OPTIONS
    const genderOptions = [
        { value: 'laki-laki', label: '👨 Laki-laki' },
        { value: 'Perempuan', label: '👩 Perempuan' },
    ];

    // EKSTRAK SEMUA CATEGORY UNIK DARI DATA PARTICIPANT
    const extractCategories = useMemo(() => {
        return (participants) => {
            if (!participants.length) return [];
            
            // Ambil semua category dari data participant
            const allCategories = participants
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
        };
    }, []);

    // FUNGSI UNTUK APPLY SEARCH & FILTER
    const applyAllFilters = () => {
        let result = [...participant];
        
        // 1. Apply Search
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
        
        // 2. Apply Gender Filter
        if (activeFilters.gender) {
            result = result.filter(participant => {
                const participantGender = participant.gender?.toLowerCase();
                return activeFilters.gender === 'all' || participantGender === activeFilters.gender;
            });
        }
        
        // 3. Apply Category Filter
        if (activeFilters.category && activeFilters.category !== 'all') {
            result = result.filter(participant => {
                const participantCategory = participant.category;
                if (!participantCategory) return false;
                
                return participantCategory.toLowerCase() === activeFilters.category.toLowerCase();
            });
        }
        
        setFilteredParticipants(result);
    };

    // HANDLE SEARCH
    const handleSearch = (term) => {
        setSearchTerm(term);
    };

    // HANDLE GENDER FILTER CHANGE
    const handleGenderFilterChange = (gender) => {
        setActiveFilters(prev => ({
            ...prev,
            gender: prev.gender === gender ? null : gender
        }));
    };

    // HANDLE CATEGORY FILTER CHANGE
    const handleCategoryFilterChange = (category) => {
        setActiveFilters(prev => ({
            ...prev,
            category: prev.category === category ? null : category
        }));
    };

    // CLEAR ALL FILTERS
    const clearAllFilters = () => {
        setSearchTerm("");
        setActiveFilters({
            gender: null,
            category: null,
        });
    };

    // CLEAR SPECIFIC FILTER
    const clearFilter = (filterType) => {
        if (filterType === 'gender') {
            setActiveFilters(prev => ({ ...prev, gender: null }));
        } else if (filterType === 'category') {
            setActiveFilters(prev => ({ ...prev, category: null }));
        } else if (filterType === 'search') {
            setSearchTerm("");
        }
    };

    // INITIALIZE CATEGORIES
    useEffect(() => {
        if (participant.length > 0) {
            const extractedCategories = extractCategories(participant);
            setAvailableCategories(extractedCategories);
        }
    }, [participant, extractCategories]);

    // APPLY FILTERS SETIAP PARTICIPANT BERUBAH
    useEffect(() => {
        if (participant.length > 0) {
            setFilteredParticipants(participant);
            applyAllFilters();
        }
    }, [participant]);

    // APPLY FILTERS SETIAP SEARCH ATAU FILTER BERUBAH
    useEffect(() => {
        applyAllFilters();
    }, [searchTerm, activeFilters]);

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

    // GET ACTIVE FILTERS COUNT - HANYA GENDER DAN CATEGORY
    const getActiveFiltersCount = () => {
        let count = 0;
        // TIDAK MENGHITUNG SEARCH TERM
        if (activeFilters.gender) count++;
        if (activeFilters.category) count++;
        return count;
    };

    // GET TOTAL ACTIVE CRITERIA (SEARCH + FILTERS) UNTUK DISPLAY
    const getTotalActiveCriteria = () => {
        let count = 0;
        if (searchTerm) count++;
        if (activeFilters.gender) count++;
        if (activeFilters.category) count++;
        return count;
    };

    // GET CATEGORY LABEL
    const getCategoryLabel = (categoryValue) => {
        if (!categoryValue || categoryValue === "all") return "All Categories";
        const category = availableCategories.find(c => c.value === categoryValue);
        return category ? category.original : categoryValue;
    };

    // GET GENDER LABEL
    const getGenderLabel = (genderValue) => {
        if (!genderValue) return "";
        if (genderValue === 'laki-laki') return '👨 Laki-laki';
        if (genderValue === 'perempuan') return '👩 Perempuan';
        return genderValue;
    };

    const tableConfig = {
        headers: ['No', 'Full Name', 'Email', 'Gender', 'Program Name', 'Category', 'Entity', 'Action'],
        title: "Impala Management",
        addButton: "Add Participant",
        detailTitle: "Participant Details"
    };

    // FORMAT PARTICIPANT DARI filteredParticipants
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
                                        
                                        {/* GENDER FILTER */}
                                        <DropdownMenuGroup>
                                            <DropdownMenuLabel className="text-xs text-gray-500 font-medium">
                                                Gender
                                            </DropdownMenuLabel>
                                            {genderOptions.map((option) => (
                                                <DropdownMenuCheckboxItem
                                                    key={option.value}
                                                    checked={activeFilters.gender === option.value}
                                                    onCheckedChange={() => handleGenderFilterChange(option.value)}
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
                                                    👥 All Categories
                                                </DropdownMenuCheckboxItem>
                                                
                                                {availableCategories.map((category) => (
                                                    <DropdownMenuCheckboxItem
                                                        key={category.value}
                                                        checked={activeFilters.category?.toLowerCase() === category.value.toLowerCase()}
                                                        onCheckedChange={() => handleCategoryFilterChange(category.value)}
                                                        className="cursor-pointer hover:bg-gray-50"
                                                    >
                                                        {category.label}
                                                    </DropdownMenuCheckboxItem>
                                                ))}
                                            </div>
                                        </DropdownMenuGroup>
                                        
                                        <DropdownMenuSeparator />
                                        
                                        {/* CLEAR FILTERS - HANYA CLEAR GENDER & CATEGORY */}
                                        <DropdownMenuItem 
                                            onClick={() => {
                                                setActiveFilters({
                                                    gender: null,
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
                                <Button className='flex items-center gap-2'>
                                    <Plus className="h-4 w-4" />
                                    {tableConfig.addButton}
                                </Button>
                                <ExportButton data={formattedParticipants} />
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
                                
                                {/* GENDER FILTER BADGE */}
                                {activeFilters.gender && (
                                    <span className="bg-pink-100 text-pink-800 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                                        {getGenderLabel(activeFilters.gender)}
                                        <button 
                                            onClick={() => clearFilter('gender')}
                                            className="text-pink-600 hover:text-pink-800 ml-1"
                                        >
                                            ×
                                        </button>
                                    </span>
                                )}
                                
                                {/* CATEGORY FILTER BADGE */}
                                {activeFilters.category && activeFilters.category !== 'all' && (
                                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                                        <Tag className="w-3 h-3" />
                                        {getCategoryLabel(activeFilters.category)}
                                        <button 
                                            onClick={() => clearFilter('category')}
                                            className="text-green-600 hover:text-green-800 ml-1"
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
                                        {getTotalActiveCriteria() > 0 
                                            ? "No participants match your current filters. Try adjusting your criteria."
                                            : "Get started by adding your first participant."
                                        }
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    {getTotalActiveCriteria() > 0 && (
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
                                        Showing {filteredParticipants.length} of {participant.length} participants
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