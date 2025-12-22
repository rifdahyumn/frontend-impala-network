import React from 'react';
import { Loader2 } from "lucide-react";

const LoadingState = () => {
    return (
        <div className="flex flex-col items-center justify-center py-16 space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="text-gray-600">Loading clients...</span>
            <div className="w-64 bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full animate-pulse w-3/4"></div>
            </div>
        </div>
    );
};

export default LoadingState;