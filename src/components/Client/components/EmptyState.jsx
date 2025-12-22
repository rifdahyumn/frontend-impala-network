import React from 'react';
import { Button } from "../../ui/button";
import { Users, Plus, RefreshCw } from "lucide-react";

const EmptyState = ({ hasFilters, onClearFilters, onAddClient }) => {
    return (
        <div className="flex flex-col items-center justify-center py-16 space-y-4 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
                <Users className="w-10 h-10 text-gray-400" />
            </div>
            <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-700">
                    No clients found
                </h3>
                <p className="text-sm text-gray-500 max-w-md">
                    {hasFilters 
                        ? "No clients match your current filters. Try adjusting your criteria."
                        : "Get started by adding your first client to the system."
                    }
                </p>
            </div>
            {hasFilters ? (
                <Button 
                    className="flex items-center gap-2"
                    onClick={onClearFilters}
                    variant="outline"
                >
                <RefreshCw className="h-4 w-4" />
                    Clear Filters
                </Button>
            ) : (
                <Button 
                    className="flex items-center gap-2"
                    onClick={onAddClient}
                >
                    <Plus className="h-4 w-4" />
                    Add Your First Client
                </Button>
            )}
        </div>
    );
};

export default EmptyState;