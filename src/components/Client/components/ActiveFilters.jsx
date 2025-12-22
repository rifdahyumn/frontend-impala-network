import React from 'react';
import { Button } from "../../ui/button";
import { Briefcase } from "lucide-react";

const ActiveFilters = ({
    localFilters,
    onClearFilter,
    onClearAll,
    getBusinessTypeLabel,
    getStatusLabel
}) => {
    return (
        <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="text-sm text-gray-600">Active filters:</span>
            
            {localFilters.search && (
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-1 whitespace-nowrap">
                    <span>"{localFilters.search}"</span>
                    <button 
                        onClick={() => onClearFilter('search')}
                        className="text-blue-600 hover:text-blue-800 ml-1"
                    >
                        ×
                    </button>
                </span>
            )}
            
            {localFilters.status && (
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center gap-1 whitespace-nowrap">
                    {getStatusLabel(localFilters.status)}
                    <button 
                        onClick={() => onClearFilter('status')}
                        className="text-green-600 hover:text-green-800 ml-1"
                    >
                        ×
                    </button>
                </span>
            )}
            
            {localFilters.businessType && localFilters.businessType !== 'all' && (
                <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm flex items-center gap-1 whitespace-nowrap">
                    <Briefcase className="w-3 h-3" />
                    {getBusinessTypeLabel(localFilters.businessType)}
                    <button 
                        onClick={() => onClearFilter('businessType')}
                        className="text-purple-600 hover:text-purple-800 ml-1"
                    >
                        ×
                    </button>
                </span>
            )}
            
            {localFilters.businessType === 'all' && (
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-1 whitespace-nowrap">
                    <Briefcase className="w-3 h-3" />
                    All Business Types
                    <button 
                        onClick={() => onClearFilter('businessType')}
                        className="text-blue-600 hover:text-blue-800 ml-1"
                    >
                        ×
                    </button>
                </span>
            )}
            
            <Button 
                variant="ghost" 
                onClick={onClearAll}
                className="text-sm h-8 whitespace-nowrap"
                size="sm"
            >
                Clear All
            </Button>
        </div>
    );
};

export default ActiveFilters;