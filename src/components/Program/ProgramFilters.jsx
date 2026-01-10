import React, { useState, useEffect } from 'react';
import { Plus, Upload, Filter, Tag, X, Check, CheckSquare } from "lucide-react";
import { Button } from "../ui/button";
import SearchBar from "../SearchFilter/SearchBar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";

const ProgramFilters = ({
    filters,
    searchTerm,
    setSearchTerm,
    showAllOnSearch,
    isShowAllMode,
    availableCategories,
    handleSearch,
    handleToggleShowAll,
    handleResetToPagination,
    updateFiltersAndFetch,
    clearFilters,
    clearSearch,
    handleAddProgram,
    handleOpenImportModal,
    handleDownloadTemplate,
    loading,
    isImporting,
    exportComponent
}) => {
    const statusOptions = [
        { value: 'Active', label: 'Active', color: 'text-green-600 bg-green-50' },
        { value: 'Inactive', label: 'Inactive', color: 'text-red-600 bg-red-50' },
    ];

    // State untuk filter dropdown
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [tempFilters, setTempFilters] = useState({
        status: filters.status || '',
        category: filters.category || 'all'
    });

    // Update tempFilters ketika filters berubah
    useEffect(() => {
        setTempFilters({
            status: filters.status || '',
            category: filters.category || 'all'
        });
    }, [filters]);

    // 4 kategori yang diizinkan
    const allowedCategories = [
        { 
            value: 'seminar/webinar', 
            label: 'Seminar / Webinar', 
            original: 'Seminar / Webinar',
            mappingValues: ['seminar', 'webinar', 'seminar/webinar', 'seminar / webinar', 'seminar-webinar']
        },
        { 
            value: 'workshop', 
            label: 'Workshop', 
            original: 'Workshop',
            mappingValues: ['workshop', 'training', 'workshop training', 'workshop/training', 'workshop-training']
        },
        { 
            value: 'community service', 
            label: 'Community Service', 
            original: 'Community Service',
            mappingValues: ['community service', 'volunteer', 'volunteer/community', 'volunteer / community service', 'community']
        },
        { 
            value: 'expo', 
            label: 'Expo', 
            original: 'Expo',
            mappingValues: ['expo', 'exhibition', 'exhibition/expo', 'exhibition / expo', 'exhibition-expo']
        }
    ];

    // Fungsi untuk memetakan kategori dari database ke 4 kategori yang diizinkan
    const mapToAllowedCategory = (categoryValue) => {
        if (!categoryValue) return 'all';
        
        const normalizedValue = categoryValue.toLowerCase().trim();
        
        // Cari kategori yang sesuai
        for (const category of allowedCategories) {
            if (category.mappingValues.includes(normalizedValue)) {
                return category.value;
            }
        }
        
        // Jika tidak ditemukan, return value asli
        return categoryValue;
    };

    // Fungsi untuk mendapatkan label kategori yang ditampilkan
    const getCategoryLabel = (categoryValue) => {
        if (!categoryValue || categoryValue === "all") return "All Categories";
        
        // Cari di allowedCategories
        const category = allowedCategories.find(c => 
            c.value.toLowerCase() === categoryValue.toLowerCase() ||
            c.mappingValues.includes(categoryValue.toLowerCase())
        );
        
        if (category) return category.original;
        
        // Fallback ke value asli
        return categoryValue;
    };

    const getActiveFiltersCount = () => {
        let count = 0;
        if (filters.status) count++;
        if (filters.category && filters.category !== 'all') count++;
        return count;
    };

    const getTotalActiveCriteria = () => {
        let count = 0;
        if (filters.search) count++;
        if (filters.status) count++;
        if (filters.category && filters.category !== 'all') count++;
        return count;
    };

    const getStatusLabel = (statusValue) => {
        if (!statusValue) return "";
        if (statusValue === 'active') return 'Active';
        if (statusValue === 'inactive') return 'Inactive';
        return statusValue.charAt(0).toUpperCase() + statusValue.slice(1);
    };

    // Handler untuk filter sementara
    const handleTempStatusChange = (status) => {
        setTempFilters(prev => ({ ...prev, status }));
    };

    const handleTempCategoryChange = (category) => {
        setTempFilters(prev => ({ ...prev, category }));
    };

    // Handler untuk apply filter
    const handleApplyFilters = () => {
        // Map kategori yang dipilih ke format yang sesuai untuk API
        let categoryToSend = '';
        if (tempFilters.category !== 'all') {
            categoryToSend = mapToAllowedCategory(tempFilters.category);
        }
        
        updateFiltersAndFetch({
            status: tempFilters.status,
            category: categoryToSend
        });
        setIsFilterOpen(false);
    };

    // Handler untuk cancel filter
    const handleCancelFilters = () => {
        setTempFilters({
            status: filters.status || '',
            category: filters.category || 'all'
        });
        setIsFilterOpen(false);
    };

    // Handler untuk clear semua filter
    const handleClearAllFilters = () => {
        setTempFilters({
            status: '',
            category: 'all'
        });
    };

    // Handler untuk menghitung filter sementara yang aktif
    const getTempActiveFiltersCount = () => {
        let count = 0;
        if (tempFilters.status) count++;
        if (tempFilters.category && tempFilters.category !== 'all') count++;
        return count;
    };

    const clearFilter = (filterType) => {
        if (filterType === 'search') {
            setSearchTerm("");
            clearSearch();
        } else if (filterType === 'status') {
            updateFiltersAndFetch({ status: '' });
        } else if (filterType === 'category') {
            updateFiltersAndFetch({ category: '' });
        }
    };

    return (
        <>
            <div className='flex flex-wrap gap-4 mb-6 justify-between'>
                <div className='flex gap-2 items-center flex-wrap'>
                    <SearchBar 
                        onSearch={handleSearch}
                        placeholder="Search programs..."
                        value={filters.search || searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
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
                    
                    {/* Custom Filter Dropdown */}
                    <div className="relative">
                        <Button 
                            variant={getActiveFiltersCount() > 0 ? "default" : "outline"}
                            className={`flex items-center gap-2 transition-all duration-200 ${
                                getActiveFiltersCount() > 0 
                                    ? "bg-amber-500 hover:bg-amber-600 text-white shadow-sm border-amber-500" 
                                    : "text-gray-700 hover:text-amber-600 hover:border-amber-400 hover:bg-amber-50 border-gray-300"
                            }`}
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
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

                        {isFilterOpen && (
                            <div className="absolute left-0 top-full mt-2 z-50 bg-white rounded-lg shadow-xl border border-gray-200 w-[450px]">
                                <div className="p-3 border-b">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-bold text-gray-900 text-xs">Filter Options</h3>
                                        <span className="text-xs text-gray-500">
                                            {getTempActiveFiltersCount()} filter{getTempActiveFiltersCount() !== 1 ? 's' : ''} selected
                                        </span>
                                    </div>
                                </div>

                                <div className="p-3">
                                    {/* Status */}
                                    <div className="mb-3">
                                        <div className="flex items-center justify-between mb-1">
                                            <h4 className="font-semibold text-gray-900 text-xs">STATUS</h4>
                                            {tempFilters.status && (
                                                <button 
                                                    onClick={() => handleTempStatusChange('')}
                                                    className="text-xs text-gray-400 hover:text-red-500"
                                                >
                                                    Clear
                                                </button>
                                            )}
                                        </div>
                                        <div className="flex gap-2">
                                            {statusOptions.map((option) => {
                                                const isSelected = tempFilters.status === option.value;
                                                return (
                                                    <button
                                                        key={option.value}
                                                        className={`flex items-center justify-between px-2 py-1.5 rounded-md border transition-all text-xs flex-1 ${
                                                            isSelected
                                                                ? 'border-amber-500 bg-amber-50 text-amber-700'
                                                                : 'border-gray-200 hover:border-amber-300 hover:bg-amber-50/30 text-gray-700'
                                                        }`}
                                                        onClick={() => handleTempStatusChange(isSelected ? '' : option.value)}
                                                    >
                                                        <div className="flex items-center gap-1.5">
                                                            <div className={`h-1.5 w-1.5 rounded-full ${
                                                                isSelected ? 'bg-amber-500' : 'bg-gray-400'
                                                            }`} />
                                                            <span className="text-xs">{option.label}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            {isSelected && (
                                                                <Check className="h-3 w-3 text-amber-600" />
                                                            )}
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Category */}
                                    <div>
                                        <div className="flex items-center justify-between mb-1">
                                            <h4 className="font-semibold text-gray-900 text-xs">CATEGORY</h4>
                                            {tempFilters.category && tempFilters.category !== 'all' && (
                                                <button 
                                                    onClick={() => handleTempCategoryChange('all')}
                                                    className="text-xs text-gray-400 hover:text-red-500"
                                                >
                                                    Clear
                                                </button>
                                            )}
                                        </div>
                                        
                                        {/* All Categories */}
                                        <div className="mb-2">
                                            <button
                                                className={`flex items-center justify-between px-3 py-2 rounded-lg border transition-all text-xs w-full ${
                                                    !tempFilters.category || tempFilters.category === 'all'
                                                        ? 'border-amber-500 bg-amber-50 text-amber-700'
                                                        : 'border-gray-200 hover:border-amber-300 hover:bg-amber-50/30 text-gray-700'
                                                }`}
                                                onClick={() => handleTempCategoryChange('all')}
                                            >
                                                <div className="flex items-center gap-1.5">
                                                    <div className={`h-2 w-2 rounded-full ${
                                                        !tempFilters.category || tempFilters.category === 'all' 
                                                            ? 'bg-amber-500' 
                                                            : 'bg-gray-400'
                                                    }`} />
                                                    <span className="font-medium text-xs">All Categories</span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    {(!tempFilters.category || tempFilters.category === 'all') && (
                                                        <Check className="h-3 w-3 text-amber-600" />
                                                    )}
                                                </div>
                                            </button>
                                        </div>

                                        {/* Categories Grid - Hanya 4 opsi */}
                                        <div className="grid grid-cols-2 gap-2">
                                            {allowedCategories.map((category) => {
                                                const isSelected = tempFilters.category === category.value;
                                                
                                                return (
                                                    <button
                                                        key={category.value}
                                                        className={`flex items-center justify-between px-2 py-1.5 rounded-lg border transition-all text-xs ${
                                                            isSelected
                                                                ? 'border-amber-500 bg-amber-50 text-amber-700'
                                                                : 'border-gray-200 hover:border-amber-300 hover:bg-amber-50/30 text-gray-700'
                                                        }`}
                                                        onClick={() => handleTempCategoryChange(category.value)}
                                                    >
                                                        <div className="flex items-center gap-1.5 min-w-0 flex-1">
                                                            <div className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${
                                                                isSelected ? 'bg-amber-500' : 'bg-gray-400'
                                                            }`} />
                                                            <span className="truncate font-medium text-xs">
                                                                {category.original}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-1 flex-shrink-0 ml-1">
                                                            {isSelected && (
                                                                <Check className="h-2.5 w-2.5 text-amber-600 flex-shrink-0" />
                                                            )}
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t p-2">
                                    <div className="flex justify-between items-center">
                                        <button
                                            className="text-xs text-gray-600 hover:text-red-600 flex items-center gap-1.5"
                                            onClick={handleClearAllFilters}
                                        >
                                            <X className="h-3 w-3" />
                                            Clear All Filters
                                        </button>
                                        <div className="flex gap-1.5">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="text-xs h-7 px-2"
                                                onClick={handleCancelFilters}
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                className="bg-amber-500 hover:bg-amber-600 text-white text-xs h-7 px-3"
                                                onClick={handleApplyFilters}
                                            >
                                                Apply
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className='flex gap-2'>
                    <Button 
                        className='flex items-center gap-2'
                        onClick={handleAddProgram}
                    >
                        <Plus className="h-4 w-4" />
                        Add Program
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
                                <Upload className="h-4 w-4" />
                                Download Template
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                                onClick={handleOpenImportModal}
                                className="flex items-center gap-2 cursor-pointer"
                            >
                                <Upload className="h-4 w-4" />
                                Upload File
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    
                    {exportComponent}
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
            
            {getTotalActiveCriteria() > 0 && (
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
                        onClick={() => {
                            setSearchTerm("");
                            clearFilters();
                        }}
                        className="text-sm h-8"
                        size="sm"
                    >
                        Clear All
                    </Button>
                </div>
            )}
        </>
    );
};

export default ProgramFilters;