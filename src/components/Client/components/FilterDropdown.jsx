import React from 'react';
import { Button } from "../../ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuCheckboxItem } from "../../ui/dropdown-menu";
import { Filter, X } from "lucide-react";

const FilterDropdown = ({
    localFilters,
    onStatusFilterChange,
    onBusinessTypeFilterChange,
    availableBusinessTypes,
    statusOptions,
    getActiveFiltersCount
}) => {
    return (
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
                            checked={localFilters.status === option.value}
                            onCheckedChange={() => onStatusFilterChange(option.value)}
                            className="flex items-center gap-2 cursor-pointer hover:bg-gray-50"
                        >
                            {option.label}
                        </DropdownMenuCheckboxItem>
                    ))}
                </DropdownMenuGroup>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuGroup>
                    <DropdownMenuLabel className="text-xs text-gray-500 font-medium">
                        Business Type
                    </DropdownMenuLabel>
                    <div className="max-h-48 overflow-y-auto">
                        <DropdownMenuCheckboxItem
                            checked={localFilters.businessType === 'all'}
                            onCheckedChange={() => onBusinessTypeFilterChange('all')}
                            className="cursor-pointer hover:bg-gray-50"
                        >
                            All Business Types
                        </DropdownMenuCheckboxItem>
                        
                        {availableBusinessTypes.map((businessType) => (
                            <DropdownMenuCheckboxItem
                                key={businessType.value}
                                checked={localFilters.businessType?.toLowerCase() === businessType.value.toLowerCase()}
                                onCheckedChange={() => onBusinessTypeFilterChange(businessType.value)}
                                className="cursor-pointer hover:bg-gray-50"
                            >
                                {businessType.original}
                            </DropdownMenuCheckboxItem>
                        ))}
                    </div>
                </DropdownMenuGroup>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem 
                    onClick={() => {
                        onStatusFilterChange('');
                        onBusinessTypeFilterChange('');
                    }}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer font-medium"
                >
                    <X className="h-4 w-4 mr-2" />
                    Clear Filters
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default FilterDropdown;