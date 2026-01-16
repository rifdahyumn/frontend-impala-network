import React, { useEffect, useRef, useState } from 'react';
import { Button } from "../../ui/button";
import { Filter, X, Check, User, Users, UserCheck } from "lucide-react";

const FilterDropdown = ({
    localFilters,
    onStatusFilterChange,
    onBusinessTypeFilterChange,
    availableBusinessTypes,
    statusOptions,
    getActiveFiltersCount,
    onGenderFilterChange,
    onApplyFilters
}) => {
    const filterRef = useRef(null)
    const [isOpen, setIsOpen] = useState(false);
    const [tempFilters, setTempFilters] = React.useState({ 
        status: localFilters?.status || '',
        gender: localFilters?.gender || '',
        businessType: localFilters?.businessType || 'all'
    });

    React.useEffect(() => {
        setTempFilters({ 
            status: localFilters?.status || '',
            gender: localFilters?.gender || '',
            businessType: localFilters?.businessType || 'all'
        });
    }, [localFilters]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (filterRef.current && !filterRef.current.contains(event.target)) {
                setIsOpen(false)
            }
        }

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside)
        } else {
            document.removeEventListener('mousedown', handleClickOutside)
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [isOpen])

    const filteredBusinessTypes = React.useMemo(() => {
        if (!Array.isArray(availableBusinessTypes) || availableBusinessTypes.length === 0) {
            return [];
        }

        const unwantedOptions = [
            'agribusiness',
            'central government',
            'diplomatic mission',
            'government institution',
            'higher education',
            'secondary education'
        ];

        const seen = new Set();
        const filteredTypes = [];

        const additionalOptions = [
            { 
                value: 'education', 
                original: 'Education', 
                label: 'Education'
            },
            { 
                value: 'agriculture', 
                original: 'Agriculture', 
                label: 'Agriculture'
            }
        ];

        additionalOptions.forEach(option => {
            const key = option.value?.toLowerCase?.()?.trim?.() || '';
            if (!seen.has(key)) {
                seen.add(key);
                filteredTypes.push(option);
            }
        });

        availableBusinessTypes.forEach(type => {
            if (!type || typeof type !== 'object') return;
            
            const key = type.value?.toLowerCase?.()?.trim?.() || '';
            const label = type.original?.toLowerCase?.() || type.label?.toLowerCase?.() || key;
            
            if (!key || seen.has(key)) {
                return;
            }

            const shouldSkip = unwantedOptions.some(unwanted => 
                label?.includes?.(unwanted) || 
                key?.includes?.(unwanted) ||
                unwanted?.includes?.(label) ||
                unwanted?.includes?.(key)
            );

            if (shouldSkip) {
                return;
            }

            seen.add(key);
            filteredTypes.push(type);
        });

        return filteredTypes.sort((a, b) => {
            const nameA = (a.original || a.label || a.value || '').toLowerCase();
            const nameB = (b.original || b.label || b.value || '').toLowerCase();
            return nameA.localeCompare(nameB);
        });
    }, [availableBusinessTypes]);

    const genderOptions = [
        { value: '', label: 'All Genders', icon: Users, color: 'bg-gray-500' },
        { value: 'male', label: 'Male', icon: User, color: 'bg-blue-500' },
        { value: 'female', label: 'Female', icon: UserCheck, color: 'bg-pink-500' }
    ];

    const handleTempStatusChange = (value) => {
        setTempFilters(prev => ({ ...prev, status: value }));
    };

    const handleTempGenderChange = (value) => {
        setTempFilters(prev => ({ ...prev, gender: value }));
    };

    const handleTempBusinessTypeChange = (value) => {
        setTempFilters(prev => ({ ...prev, businessType: value }));
    };

    const handleApply = () => {
        if (onApplyFilters && typeof onApplyFilters === 'function') {
            onApplyFilters(tempFilters);
        } else {
            if (tempFilters.status !== localFilters.status) {
                onStatusFilterChange && onStatusFilterChange(tempFilters.status || '');
            }
            
            if (tempFilters.gender !== localFilters.gender) {
                onGenderFilterChange && onGenderFilterChange(tempFilters.gender || '');
            }
            
            if (tempFilters.businessType !== localFilters.businessType) {
                onBusinessTypeFilterChange && onBusinessTypeFilterChange(tempFilters.businessType || 'all');
            }
        }
        
        setIsOpen(false);
    };

    const handleCancel = () => {
        setTempFilters({ 
            status: localFilters?.status || '',
            gender: localFilters?.gender || '',
            businessType: localFilters?.businessType || 'all'
        });
        setIsOpen(false);
    };

    const handleClearAll = () => {
        setTempFilters({
            status: '',
            gender: '',
            businessType: 'all'
        });
    };

    return (
        <div className="relative">
            <Button 
                variant={getActiveFiltersCount() > 0 ? "default" : "outline"}
                className={`flex items-center gap-2 transition-all duration-200 ${
                    getActiveFiltersCount() > 0 
                    ? "bg-amber-500 hover:bg-amber-600 text-white shadow-sm border-amber-500" 
                    : "text-gray-700 hover:text-amber-600 hover:border-amber-400 hover:bg-amber-50 border-gray-300"
                }`}
                onClick={() => setIsOpen(!isOpen)}
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

            {isOpen && (
                <div 
                    ref={filterRef}
                    className="absolute left-0 top-full mt-2 z-50 bg-white rounded-lg shadow-xl border border-gray-200 w-[480px]"
                >
                    <div className="p-3 border-b">
                        <div className="flex items-center justify-between">
                            <h3 className="font-bold text-gray-900 text-xs">Filter Options</h3>
                            <span className="text-xs text-gray-500">
                            </span>
                        </div>
                    </div>

                    <div className="p-3">
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
                                {Array.isArray(statusOptions) && statusOptions.map((option) => {
                                    if (!option || typeof option !== 'object') return null;
                                    const isSelected = tempFilters.status === option.value;
                                    return (
                                        <button
                                            key={option.value || Math.random()}
                                            className={`flex items-center justify-between px-2 py-1.5 rounded-md border transition-all text-xs flex-1 ${
                                                isSelected
                                                    ? 'border-amber-500 bg-amber-50 text-amber-700'
                                                    : 'border-gray-200 hover:border-amber-300 hover:bg-amber-50/30 text-gray-700'
                                            }`}
                                            onClick={() => handleTempStatusChange(option.value || '')}
                                        >
                                            <div className="flex items-center gap-1.5">
                                                <div className={`h-1.5 w-1.5 rounded-full ${
                                                    isSelected ? 'bg-amber-500' : 'bg-gray-400'
                                                }`} />
                                                <span className="text-xs">{option.label || ''}</span>
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

                        {/* Gender */}
                        <div className="mb-3">
                            <div className="flex items-center justify-between mb-1">
                                <h4 className="font-semibold text-gray-900 text-xs">GENDER</h4>
                                {tempFilters.gender && (
                                    <button 
                                        onClick={() => handleTempGenderChange('')}
                                        className="text-xs text-gray-400 hover:text-red-500"
                                    >
                                        Clear
                                    </button>
                                )}
                            </div>
                            <div className="flex gap-2">
                                {genderOptions.map((option) => {
                                    const isSelected = tempFilters.gender === option.value;
                                    const Icon = option.icon;
                                    
                                    return (
                                        <button
                                            key={option.value}
                                            className={`flex items-center justify-between px-2 py-1.5 rounded-md border transition-all text-xs flex-1 ${
                                                isSelected
                                                    ? option.value === ''
                                                        ? 'border-amber-500 bg-amber-50 text-amber-700'
                                                        : option.value === 'male'
                                                        ? 'border-blue-500 bg-blue-100 text-blue-800'
                                                        : 'border-pink-500 bg-pink-100 text-pink-800'
                                                    : option.value === ''
                                                    ? 'bg-gray-100 text-gray-700 border-gray-300 hover:opacity-90'
                                                    : option.value === 'male'
                                                    ? 'bg-blue-50 text-blue-700 border-blue-200 hover:opacity-90'
                                                    : 'bg-pink-50 text-pink-700 border-pink-200 hover:opacity-90'
                                            }`}
                                            onClick={() => handleTempGenderChange(option.value)}
                                        >
                                            <div className="flex items-center gap-1.5">
                                                <div className={`p-1 rounded ${
                                                    option.value === '' ? 'bg-gray-200' :
                                                    option.value === 'male' ? 'bg-blue-200' : 'bg-pink-200'
                                                }`}>
                                                    <Icon className={`h-3 w-3 ${
                                                        option.value === '' ? 'text-gray-600' :
                                                        option.value === 'male' ? 'text-blue-600' : 'text-pink-600'
                                                    }`} />
                                                </div>
                                                <span className="font-medium text-xs">{option.label}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                {isSelected && (
                                                    <Check className={`h-3 w-3 ${
                                                        option.value === '' ? 'text-amber-600' :
                                                        option.value === 'male' ? 'text-blue-600' : 'text-pink-600'
                                                    }`} />
                                                )}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Business Type */}
                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <h4 className="font-semibold text-gray-900 text-xs">BUSINESS TYPE</h4>
                                {tempFilters.businessType && tempFilters.businessType !== 'all' && (
                                    <button 
                                        onClick={() => handleTempBusinessTypeChange('all')}
                                        className="text-xs text-gray-400 hover:text-red-500"
                                    >
                                        Clear
                                    </button>
                                )}
                            </div>
                            
                            {/* All Types */}
                            <div className="mb-2">
                                <button
                                    className={`flex items-center justify-between px-3 py-2 rounded-lg border transition-all text-xs w-full ${
                                        !tempFilters.businessType || tempFilters.businessType === 'all'
                                            ? 'border-amber-500 bg-amber-50 text-amber-700'
                                            : 'border-gray-200 hover:border-amber-300 hover:bg-amber-50/30 text-gray-700'
                                    }`}
                                    onClick={() => handleTempBusinessTypeChange('all')}
                                >
                                    <div className="flex items-center gap-1.5">
                                        <div className={`h-2 w-2 rounded-full ${
                                            !tempFilters.businessType || tempFilters.businessType === 'all' 
                                                ? 'bg-amber-500' 
                                                : 'bg-gray-400'
                                        }`} />
                                        <span className="font-medium text-xs">All Business Types</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        {(!tempFilters.businessType || tempFilters.businessType === 'all') && (
                                            <Check className="h-3 w-3 text-amber-600" />
                                        )}
                                    </div>
                                </button>
                            </div>

                            {/* Business Types Grid */}
                            <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto p-1">
                                {filteredBusinessTypes.map((type) => {
                                    if (!type || typeof type !== 'object') return null;
                                    const isSelected = tempFilters.businessType === type.value;
                                    
                                    return (
                                        <button
                                            key={type.value || Math.random()}
                                            className={`flex items-center justify-between px-2 py-1.5 rounded-lg border transition-all text-xs ${
                                                isSelected
                                                    ? 'border-amber-500 bg-amber-50 text-amber-700'
                                                    : 'border-gray-200 hover:border-amber-300 hover:bg-amber-50/30 text-gray-700'
                                            }`}
                                            onClick={() => handleTempBusinessTypeChange(type.value)}
                                        >
                                            <div className="flex items-center gap-1.5 min-w-0 flex-1">
                                                <div className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${
                                                    isSelected ? 'bg-amber-500' : 'bg-gray-400'
                                                }`} />
                                                <span className="truncate font-medium text-xs">
                                                    {type.original || type.label || type.value || ''}
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
                                onClick={handleClearAll}
                            >
                                <X className="h-3 w-3" />
                                Clear All Filters
                            </button>
                            <div className="flex gap-1.5">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-xs h-7 px-2"
                                    onClick={handleCancel}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    className="bg-amber-500 hover:bg-amber-600 text-white text-xs h-7 px-3"
                                    onClick={handleApply}
                                >
                                    Apply
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FilterDropdown;