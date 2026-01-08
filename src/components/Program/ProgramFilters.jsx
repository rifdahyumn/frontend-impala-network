import React from 'react';
import { Plus, Upload, Filter, Tag, X, CheckSquare } from "lucide-react";
import { Button } from "../ui/button";
import SearchBar from "../SearchFilter/SearchBar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuCheckboxItem } from "../ui/dropdown-menu";

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

    const getActiveFiltersCount = () => {
        let count = 0;
        if (filters.status) count++;
        if (filters.category) count++;
        return count;
    };

    const getCategoryLabel = (categoryValue) => {
        if (!categoryValue || categoryValue === "all") return "All Categories";
        const category = availableCategories.find(c => c.value === categoryValue.toLowerCase());
        return category ? category.original : categoryValue;
    };

    const handleStatusFilterChange = (status) => {
        const newStatus = filters.status === status ? '' : status;
        updateFiltersAndFetch({ status: newStatus });
    };

    const handleCategoryFilterChange = (category) => {
        const newCategory = filters.category === category ? '' : category;
        updateFiltersAndFetch({ category: newCategory });
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

    const getTotalActiveCriteria = () => {
        let count = 0;
        if (filters.search) count++;
        if (filters.status) count++;
        if (filters.category) count++;
        return count;
    };

    const getStatusLabel = (statusValue) => {
        if (!statusValue) return "";
        if (statusValue === 'active') return 'Active';
        if (statusValue === 'inactive') return 'Inactive';
        return statusValue.charAt(0).toUpperCase() + statusValue.slice(1);
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