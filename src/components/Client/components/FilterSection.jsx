import React from 'react';
import SearchBar from '../../SearchFilter/SearchBar';
import FilterDropdown from './FilterDropdown';

const FiltersSection = ({
    localFilters = {}, 
    onSearch,
    onStatusFilterChange,
    onBusinessTypeFilterChange,
    onGenderFilterChange, 
    onApplyFilters, 
    availableBusinessTypes,
    statusOptions,
    getActiveFiltersCount,
    getFilteredCounts
}) => {
    const searchValue = localFilters?.search || '';
    
    return (
        <div className='flex flex-col lg:flex-row gap-4 mb-6 justify-between'>
            <div className='flex flex-col sm:flex-row gap-2 items-start sm:items-center flex-wrap'>
                <div className="w-full sm:w-auto min-w-[250px]">
                    <SearchBar 
                        onSearch={onSearch}
                        placeholder="Search.."
                        value={searchValue} 
                    />
                </div>
                
                <FilterDropdown
                    localFilters={localFilters}
                    onStatusFilterChange={onStatusFilterChange}
                    onBusinessTypeFilterChange={onBusinessTypeFilterChange}
                    onGenderFilterChange={onGenderFilterChange}
                    onApplyFilters={onApplyFilters}
                    availableBusinessTypes={availableBusinessTypes}
                    statusOptions={statusOptions}
                    getActiveFiltersCount={getActiveFiltersCount}
                    getFilteredCounts={getFilteredCounts}
                />
            </div>
        </div>
    );
};

export default FiltersSection;