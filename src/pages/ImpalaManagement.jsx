import Header from "../components/Layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Plus, Loader2, Users, AlertCircle, Tag, Filter, X, RefreshCw, CheckSquare } from "lucide-react";
import { Button } from "../components/ui/button"
import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react'; // 🔴 TAMBAHKAN useRef
import SearchBar from '../components/SearchFilter/SearchBar';
// HAPUS Import ExportButton
// import ExportButton from "../components/ActionButton/ExportButton";
import MemberTable from '../components/MemberTable/MemberTable';
import Pagination from "../components/Pagination/Pagination";
import ImpalaContent from '../components/Content/ImpalaContent';
import { useImpala } from "../hooks/useImpala";
import { toast } from 'react-hot-toast';
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
    const [selectedParticipant, setSelectedParticipant] = useState(null);
    
    // 🔴 TAMBAHKAN: State untuk visual feedback auto-scroll
    const [highlightDetail, setHighlightDetail] = useState(false);
    
    // 🔴 TAMBAHKAN: Ref untuk auto-scroll ke detail section
    const participantDetailRef = useRef(null);
    
    // 🔴 DIUBAH: State filter yang disederhanakan sama seperti ProgramClient.jsx
    const [localFilters, setLocalFilters] = useState({
        search: '',
        gender: '',
        category: '',
    });
    
    const [availableCategories, setAvailableCategories] = useState([]);
    
    // 🔴 DIUBAH: Pastikan hook mengembalikan exportParticipants
    const { 
        participant, 
        loading, 
        error, 
        pagination, 
        handlePageChange,
        searchParticipants,
        toggleShowAllOnSearch,
        clearFilters: hookClearFilters,
        clearSearch: hookClearSearch,
        updateFiltersAndFetch,
        getDisplayText,
        isShowAllMode,
        resetToPaginationMode,
        refreshData,
        exportParticipants // 🔴 TAMBAHKAN: Pastikan ini ada di hook
    } = useImpala();

    // 🔴 TAMBAHKAN: Fungsi untuk handle select participant dengan auto-scroll
    const handleSelectParticipant = useCallback((participant) => {
        // Set selected participant
        setSelectedParticipant(participant);
        
        // Trigger highlight effect
        setHighlightDetail(true);
        
        // Auto-scroll ke participant detail section
        setTimeout(() => {
            if (participantDetailRef.current) {
                participantDetailRef.current.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'start',
                    inline: 'nearest'
                });
                
                // Tambahkan smooth transition effect
                participantDetailRef.current.style.transition = 'all 0.5s ease';
                
                // Remove highlight after 2 seconds
                setTimeout(() => {
                    setHighlightDetail(false);
                }, 2000);
            }
        }, 150); // Delay sedikit untuk memastikan DOM sudah update
    }, []);

    // 🔴 DIUBAH: Get state dari hook
    const { showAllOnSearch } = useImpala();
    const isInShowAllMode = isShowAllMode();

    // GENDER OPTIONS
    const genderOptions = [
        { value: 'Laki-laki', label: '👨 Laki-laki' },
        { value: 'Perempuan', label: '👩 Perempuan' },
    ];

    // 🔴 DIUBAH: Apply filters dengan state lokal
    const applyFilters = useCallback(async () => {
        await updateFiltersAndFetch(localFilters, showAllOnSearch);
    }, [localFilters, showAllOnSearch, updateFiltersAndFetch]);

    // 🔴 DIUBAH: Apply search dengan state lokal
    const applySearch = useCallback(async () => {
        await searchParticipants(localFilters.search, showAllOnSearch);
    }, [localFilters.search, showAllOnSearch, searchParticipants]);

    // 🔴 DIUBAH: Handle search dengan debounce
    const handleSearch = useCallback((term) => {
        setLocalFilters(prev => ({ ...prev, search: term }));
    }, []);

    // 🔴 DIUBAH: Apply search ketika search term berubah (dengan debounce effect)
    useEffect(() => {
        const timer = setTimeout(() => {
            if (localFilters.search !== '') {
                applySearch();
            }
        }, 500); // Debounce 500ms
        
        return () => clearTimeout(timer);
    }, [localFilters.search, applySearch]);

    // 🔴 DIUBAH: Apply filters ketika filter berubah
    useEffect(() => {
        if (localFilters.gender !== '' || localFilters.category !== '') {
            const timer = setTimeout(() => {
                applyFilters();
            }, 300);
            
            return () => clearTimeout(timer);
        }
    }, [localFilters.gender, localFilters.category, applyFilters]);

    // 🔴 DIUBAH: Handle gender filter change yang lebih sederhana
    const handleGenderFilterChange = useCallback((gender) => {
        setLocalFilters(prev => ({
            ...prev,
            gender: prev.gender === gender ? '' : gender
        }));
    }, []);

    // 🔴 DIUBAH: Handle category filter change yang lebih sederhana
    const handleCategoryFilterChange = useCallback((category) => {
        setLocalFilters(prev => ({
            ...prev,
            category: prev.category === category ? '' : category
        }));
    }, []);

    // 🔴 DIUBAH: Clear all filters yang lebih sederhana
    const clearAllFilters = useCallback(async () => {
        // Reset state lokal
        setLocalFilters({
            search: '',
            gender: '',
            category: '',
        });
        
        // Reset selected participant saat clear filter
        setSelectedParticipant(null);
        
        // Panggil hook untuk clear semua
        await hookClearFilters();
        
        // Scroll ke atas
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [hookClearFilters]);

    // 🔴 DIUBAH: Clear specific filter
    const clearFilter = useCallback((filterType) => {
        if (filterType === 'search') {
            setLocalFilters(prev => ({ ...prev, search: '' }));
            hookClearSearch();
            return;
        }
        
        setLocalFilters(prev => ({ ...prev, [filterType]: '' }));
    }, [hookClearSearch]);

    // 🔴 MODIFIKASI: Toggle show all on search
    const handleToggleShowAll = useCallback(async (checked) => {
        await toggleShowAllOnSearch(checked);
        
        // Re-apply filters dengan mode baru
        if (localFilters.search || localFilters.gender || localFilters.category) {
            await applyFilters();
        }
    }, [toggleShowAllOnSearch, localFilters, applyFilters]);

    // 🔴 MODIFIKASI: Reset to pagination mode
    const handleResetToPagination = useCallback(async () => {
        await resetToPaginationMode();
    }, [resetToPaginationMode]);

    // 🔴 TAMBAHKAN: Handle export seperti di Program.jsx
    const handleExport = useCallback(async () => {
        try {
            // Gunakan filter yang sedang aktif
            const currentFilters = {
                search: localFilters.search,
                gender: localFilters.gender,
                category: localFilters.category
            };
            
            await exportParticipants('csv', currentFilters);
        } catch (error) {
            console.error('Export failed:', error);
            toast.error('Failed to export participants');
        }
    }, [localFilters, exportParticipants]);

    // EKSTRAK SEMUA CATEGORY UNIK DARI DATA PARTICIPANT
    useEffect(() => {
        if (participant.length > 0) {
            const allCategories = participant
                .map(p => p.category)
                .filter(category => category && category.trim() !== "");
            
            const uniqueCategories = [...new Set(allCategories)].sort();
            
            const formattedCategories = uniqueCategories.map(category => {
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
            
            setAvailableCategories(formattedCategories);
        }
    }, [participant]);

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
                toast.success('Participant deleted successfully');
                
                // Scroll ke atas setelah delete
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        }
    };

    useEffect(() => {
        if (selectedParticipant && participant.length > 0) {
            const currentSelected = participant.find(p => p.id === selectedParticipant.id)
            if (currentSelected) {
                setSelectedParticipant(currentSelected)
            } else {
                // Jika participant tidak ditemukan (mungkin dihapus atau difilter)
                setSelectedParticipant(null);
            }
        }
    }, [participant, selectedParticipant?.id]);

    const handleRefresh = useCallback(() => {
        refreshData();
        clearAllFilters();
    }, [refreshData, clearAllFilters]);

    // 🔴 DIUBAH: Handle page change
    const handlePageChangeModified = useCallback((page) => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        handlePageChange(page);
    }, [handlePageChange]);

    // GET ACTIVE FILTERS COUNT
    const getActiveFiltersCount = useCallback(() => {
        let count = 0;
        if (localFilters.gender) count++;
        if (localFilters.category) count++;
        return count;
    }, [localFilters]);

    // GET TOTAL ACTIVE CRITERIA (SEARCH + FILTERS) UNTUK DISPLAY
    const getTotalActiveCriteria = useCallback(() => {
        let count = 0;
        if (localFilters.search) count++;
        if (localFilters.gender) count++;
        if (localFilters.category) count++;
        return count;
    }, [localFilters]);

    // GET CATEGORY LABEL
    const getCategoryLabel = useCallback((categoryValue) => {
        if (!categoryValue || categoryValue === "all") return "All Categories";
        const category = availableCategories.find(c => c.value === categoryValue);
        return category ? category.original : categoryValue;
    }, [availableCategories]);

    // GET GENDER LABEL
    const getGenderLabel = useCallback((genderValue) => {
        if (!genderValue) return "";
        if (genderValue.toLowerCase() === 'Laki-laki') return '👨 Laki-laki';
        if (genderValue.toLowerCase() === 'Perempuan') return '👩 Perempuan';
        return genderValue;
    }, []);

    const tableConfig = {
        headers: ['No', 'Full Name', 'Email', 'Gender', 'Program Name', 'Category', 'Entity', 'Action'],
        title: "Impala Management",
        addButton: "Add Participant",
        detailTitle: "Participant Details"
    };

    // 🔴 DIUBAH: Format participants - PERBAIKAN UTAMA: ganti `business` dengan `entity`
    const formattedParticipants = useMemo(() => {
        return participant.map((participant, index) => {
            const currentPage = pagination.page;
            const itemsPerPage = pagination.limit;
            
            const itemNumber = isInShowAllMode 
                ? index + 1
                : (currentPage - 1) * itemsPerPage + index + 1;

            return {
                id: participant.id,
                no: itemNumber,
                full_name: participant.full_name,
                email: participant.email,
                category: participant.category,
                program_name: participant.program_name,
                phone: participant.phone,
                // 🔴 PERBAIKAN: Ganti business dengan entity
                entity: participant.entity || participant.business, // Fallback ke business jika entity tidak ada
                gender: participant.gender,
                action: 'Detail',
                // 🔴 PERBAIKAN: Tambahkan properti asli untuk akses mudah
                ...participant
            };
        });
    }, [participant, pagination.page, pagination.limit, isInShowAllMode]);

    // 🔴 PERBAIKAN: Tambahkan properti business ke entity untuk kompatibilitas
    useEffect(() => {
        if (participant.length > 0 && participant.some(p => p.business && !p.entity)) {
            console.warn("Some participants have 'business' field instead of 'entity'. Consider updating your database schema.");
        }
    }, [participant]);

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
                        {/* ERROR MESSAGE */}
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
                                    placeholder="Search participants..."
                                    value={localFilters.search}
                                    onChange={(e) => setLocalFilters(prev => ({ ...prev, search: e.target.value }))}
                                />
                                
                                {/* 🔴 MODIFIKASI: Toggle Show All on Search */}
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
                                                    checked={localFilters.gender?.toLowerCase() === option.value.toLowerCase()}
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
                                                    checked={localFilters.category === 'all'}
                                                    onCheckedChange={() => handleCategoryFilterChange('all')}
                                                    className="cursor-pointer hover:bg-gray-50"
                                                >
                                                    👥 All Categories
                                                </DropdownMenuCheckboxItem>
                                                
                                                {availableCategories.map((category) => (
                                                    <DropdownMenuCheckboxItem
                                                        key={category.value}
                                                        checked={localFilters.category?.toLowerCase() === category.value.toLowerCase()}
                                                        onCheckedChange={() => handleCategoryFilterChange(category.value)}
                                                        className="cursor-pointer hover:bg-gray-50"
                                                    >
                                                        {category.label}
                                                    </DropdownMenuCheckboxItem>
                                                ))}
                                            </div>
                                        </DropdownMenuGroup>
                                        
                                        <DropdownMenuSeparator />
                                        
                                        {/* CLEAR FILTERS */}
                                        <DropdownMenuItem 
                                            onClick={() => {
                                                setLocalFilters(prev => ({
                                                    ...prev,
                                                    gender: '',
                                                    category: ''
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

                            <div className='flex gap-2'>
                                
                                {/* 🔴 MODIFIKASI: Ganti ExportButton dengan Button seperti di Program.jsx */}
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
                                            Export {isInShowAllMode ? 'All' : ''}
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                        
                        {/* 🔴 MODIFIKASI: Show All Mode Indicator */}
                        {isInShowAllMode && (
                            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <CheckSquare className="h-5 w-5 text-blue-600" />
                                        <p className="text-sm text-blue-700">
                                            <strong>All search results are shown in one page.</strong> 
                                            {localFilters.search && ` Search term: "${localFilters.search}"`}
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
                        {getTotalActiveCriteria() > 0 && (
                            <div className="mb-4 flex flex-wrap items-center gap-2">
                                <span className="text-sm text-gray-600">Active filters:</span>
                                
                                {/* SEARCH BADGE */}
                                {localFilters.search && (
                                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                                        <span>🔍 "{localFilters.search}"</span>
                                        <button 
                                            onClick={() => clearFilter('search')}
                                            className="text-blue-600 hover:text-blue-800 ml-1"
                                        >
                                            ×
                                        </button>
                                    </span>
                                )}
                                
                                {/* GENDER FILTER BADGE */}
                                {localFilters.gender && (
                                    <span className="bg-pink-100 text-pink-800 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                                        {getGenderLabel(localFilters.gender)}
                                        <button 
                                            onClick={() => clearFilter('gender')}
                                            className="text-pink-600 hover:text-pink-800 ml-1"
                                        >
                                            ×
                                        </button>
                                    </span>
                                )}
                                
                                {/* CATEGORY FILTER BADGE */}
                                {localFilters.category && localFilters.category !== 'all' && (
                                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                                        <Tag className="w-3 h-3" />
                                        {getCategoryLabel(localFilters.category)}
                                        <button 
                                            onClick={() => clearFilter('category')}
                                            className="text-green-600 hover:text-green-800 ml-1"
                                        >
                                            ×
                                        </button>
                                    </span>
                                )}
                                
                                {/* ALL CATEGORIES BADGE */}
                                {localFilters.category === 'all' && (
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
                        ) : participant.length === 0 ? (
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
                                            <RefreshCw className="h-4 w-4" />
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
                                    
                                    {/* 🔴 MODIFIKASI: Gunakan handleSelectParticipant untuk auto-scroll */}
                                    <MemberTable
                                        members={formattedParticipants}
                                        onSelectMember={handleSelectParticipant} // ← Ganti dengan fungsi baru
                                        headers={tableConfig.headers}
                                        isLoading={loading}
                                    />
                                </div>

                                <div className='mt-6 flex flex-col sm:flex-row justify-between items-center gap-4'>
                                    {/* 🔴 MODIFIKASI: Gunakan getDisplayText dari hook */}
                                    <div className="text-sm text-gray-600">
                                        {getDisplayText ? getDisplayText() : `Showing ${participant.length} of ${pagination.total} participants`}
                                        {getTotalActiveCriteria() > 0 && !isInShowAllMode && " (filtered)"}
                                    </div>
                                    
                                    {/* 🔴 MODIFIKASI: Conditional rendering pagination */}
                                    {!isInShowAllMode && pagination.totalPages > 1 ? (
                                        <Pagination 
                                            currentPage={pagination.page}
                                            totalPages={pagination.totalPages}
                                            totalItems={pagination.total}
                                            itemsPerPage={pagination.limit}
                                            onPageChange={handlePageChangeModified}
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

                {/* 🔴 MODIFIKASI: Wrap ImpalaContent dengan div yang memiliki ref untuk auto-scroll */}
                <div 
                    ref={participantDetailRef}
                    className={`
                        transition-all duration-500 ease-in-out
                        ${highlightDetail ? 'ring-2 ring-blue-500 rounded-xl p-1 -m-1 bg-blue-50/50' : ''}
                    `}
                >
                    <ImpalaContent
                        selectedMember={selectedParticipant}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        detailTitle={tableConfig.detailTitle}
                    />
                </div>
            </div>
        </div>
    )
}

export default ImpalaManagement;