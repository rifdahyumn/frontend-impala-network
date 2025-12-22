import React from 'react';
import { CheckSquare } from "lucide-react";

const StatusDisplay = ({ searchTerm, onResetToPagination }) => {
    return (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                    <CheckSquare className="h-5 w-5 text-blue-600" />
                    <p className="text-sm text-blue-700">
                        <strong>All search results are shown in one page.</strong> 
                        {searchTerm && ` Search term: "${searchTerm}"`}
                    </p>
                </div>
                <button 
                    onClick={onResetToPagination}
                    className="text-sm text-blue-600 hover:text-blue-800 underline whitespace-nowrap"
                >
                    Switch to paginated view
                </button>
            </div>
        </div>
    );
};

export default StatusDisplay;