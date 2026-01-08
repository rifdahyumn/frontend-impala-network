import React from 'react';
import SearchBar from '../../SearchFilter/SearchBar';
import FilterDropdown from './FilterDropdown';

const FiltersSection = ({
    localFilters = {}, // ← BERIKAN DEFAULT VALUE
    showAllOnSearch,
    isInShowAllMode,
    onSearch,
    onToggleShowAll,
    onResetToPagination,
    onStatusFilterChange,
    onBusinessTypeFilterChange,
    onGenderFilterChange, // ← TAMBAHKAN INI
    onApplyFilters, // ← TAMBAHKAN INI (opsional, tapi recommended)
    availableBusinessTypes,
    statusOptions,
    getActiveFiltersCount,
    // TAMBAHKAN PROP BARU INI
    getFilteredCounts
}) => {
    console.log('🔍 [FiltersSection] Props received:', {
        hasOnGenderFilterChange: !!onGenderFilterChange,
        hasOnApplyFilters: !!onApplyFilters,
        typeOnGenderFilterChange: typeof onGenderFilterChange,
        hasGetFilteredCounts: !!getFilteredCounts // ← TAMBAHKAN DEBUG UNTUK getFilteredCounts
    });
    
    // AMBIL SEARCH VALUE DENGAN SAFE ACCESS
    const searchValue = localFilters?.search || '';
    
    return (
        <div className='flex flex-col lg:flex-row gap-4 mb-6 justify-between'>
            <div className='flex flex-col sm:flex-row gap-2 items-start sm:items-center flex-wrap'>
                <div className="w-full sm:w-auto min-w-[250px]">
                    <SearchBar 
                        onSearch={onSearch}
                        placeholder="Search.."
                        value={searchValue} // ← GUNAKAN VALUE YANG AMAN
                    />
                </div>
                
                {searchValue.trim() !== '' && ( // ← SEKARANG AMAN KARENA searchValue SELALU STRING
                    <div className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-lg border border-blue-200">
                        <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={showAllOnSearch}
                            onChange={(e) => onToggleShowAll(e.target.checked)}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium text-blue-700">
                            Show all results
                        </span>
                        </label>
                        
                        {isInShowAllMode && (
                            <button
                                onClick={onResetToPagination}
                                className="text-xs text-blue-600 hover:text-blue-800 underline ml-2"
                            >
                                Switch to pages
                            </button>
                        )}
                    </div>
                )}
                
                <FilterDropdown
                    localFilters={localFilters}
                    onStatusFilterChange={onStatusFilterChange}
                    onBusinessTypeFilterChange={onBusinessTypeFilterChange}
                    onGenderFilterChange={onGenderFilterChange} // ← KIRIM PROP INI
                    onApplyFilters={onApplyFilters} // ← KIRIM PROP INI
                    availableBusinessTypes={availableBusinessTypes}
                    statusOptions={statusOptions}
                    getActiveFiltersCount={getActiveFiltersCount}
                    // TAMBAHKAN PROP BARU INI
                    getFilteredCounts={getFilteredCounts}
                />
            </div>
        </div>
    );
};

export default FiltersSection;